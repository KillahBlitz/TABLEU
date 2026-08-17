import Epic from '../models/Epic.js';
import Story from '../models/Story.js';

export const getEpics = async (req, res) => {
  try {
    const epics = await Epic.find().sort({ createdAt: -1 }).populate('createdBy', 'name email avatarColor');
    
    const epicsWithSummary = await Promise.all(
      epics.map(async (epic) => {
        const totalStories = await Story.countDocuments({ epicId: epic._id });
        const completedStories = await Story.countDocuments({ epicId: epic._id, status: 'ready_qa' });
        return {
          ...epic.toObject(),
          totalStories,
          completedStories
        };
      })
    );

    return res.json(epicsWithSummary);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createEpic = async (req, res) => {
  try {
    const { title, description, color, startDate, targetDate, status } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const epic = await Epic.create({
      title,
      description,
      color: color || '#00E5FF',
      startDate,
      targetDate,
      status: status || 'planning',
      createdBy: req.user._id
    });

    return res.status(201).json(epic);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateEpic = async (req, res) => {
  try {
    const epic = await Epic.findById(req.params.id);
    if (!epic) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    const { title, description, color, status, startDate, targetDate } = req.body;

    if (title !== undefined) epic.title = title;
    if (description !== undefined) epic.description = description;
    if (color !== undefined) epic.color = color;
    if (status !== undefined) epic.status = status;
    if (startDate !== undefined) epic.startDate = startDate;
    if (targetDate !== undefined) epic.targetDate = targetDate;

    const updatedEpic = await epic.save();
    return res.json(updatedEpic);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteEpic = async (req, res) => {
  try {
    const epic = await Epic.findById(req.params.id);
    if (!epic) {
      return res.status(404).json({ message: 'Epic not found' });
    }

    await Story.updateMany({ epicId: epic._id }, { epicId: null });
    await Epic.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Epic deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
