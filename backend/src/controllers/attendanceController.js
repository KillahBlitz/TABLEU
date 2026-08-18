import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
};

export const getAttendance = async (req, res) => {
  try {
    const { date, startDate, endDate } = req.query;
    const users = await User.find().select('-password').sort({ name: 1 });

    let filter = {};

    if (date) {
      const normalized = normalizeDate(date);
      filter.date = normalized;
    } else if (startDate && endDate) {
      filter.date = {
        $gte: normalizeDate(startDate),
        $lte: normalizeDate(endDate)
      };
    } else {
      filter.date = normalizeDate(new Date());
    }

    const records = await Attendance.find(filter)
      .populate('userId', 'name email role avatarColor')
      .populate('markedBy', 'name')
      .sort({ date: 1 });

    const targetDate = date ? normalizeDate(date) : normalizeDate(new Date());

    const attendanceMap = {};
    records.forEach((r) => {
      const key = `${r.userId?._id?.toString()}_${r.date.toISOString().split('T')[0]}`;
      attendanceMap[key] = r;
    });

    const result = users.map((user) => {
      const dateKey = `${user._id.toString()}_${targetDate.toISOString().split('T')[0]}`;
      const record = attendanceMap[dateKey];

      return {
        userId: user._id,
        userName: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        date: targetDate,
        status: record ? record.status : 'unregistered',
        note: record ? record.note : '',
        recordId: record ? record._id : null,
        markedBy: record?.markedBy?.name || null
      };
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAttendance = async (req, res) => {
  try {
    const { userId, date, status, note } = req.body;

    if (!userId || !date || !status) {
      return res.status(400).json({ message: 'userId, date and status are required' });
    }

    const normalized = normalizeDate(date);

    const record = await Attendance.findOneAndUpdate(
      { userId, date: normalized },
      {
        userId,
        date: normalized,
        status,
        note: note || '',
        markedBy: req.user._id
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json(record);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const bulkMarkAttendance = async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'records array is required' });
    }

    const operations = records.map((r) => ({
      updateOne: {
        filter: { userId: r.userId, date: normalizeDate(r.date) },
        update: {
          $set: {
            status: r.status,
            note: r.note || '',
            markedBy: req.user._id
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(operations);

    return res.json({
      message: 'Attendance records saved successfully',
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);

    const users = await User.find().select('-password').sort({ name: 1 });
    const records = await Attendance.find({
      date: { $gte: start, $lte: end }
    });

    const totalDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const summary = users.map((user) => {
      const userRecords = records.filter(
        (r) => r.userId.toString() === user._id.toString()
      );

      const presentCount = userRecords.filter((r) => r.status === 'present').length;
      const absentCount = userRecords.filter((r) => r.status === 'absent').length;
      const unregisteredCount = totalDays - presentCount - absentCount;

      return {
        userId: user._id,
        userName: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        totalDays,
        presentCount,
        absentCount,
        unregisteredCount,
        attendanceRate: totalDays > 0
          ? Number(((presentCount / totalDays) * 100).toFixed(1))
          : 0
      };
    });

    return res.json(summary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
