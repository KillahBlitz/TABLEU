import Sprint from '../models/Sprint.js';
import Story from '../models/Story.js';

export const getSprints = async (req, res) => {
  try {
    const sprints = await Sprint.find().sort({ createdAt: -1 }).populate('createdBy', 'name email avatarColor');

    const sprintsWithCounts = await Promise.all(
      sprints.map(async (sprint) => {
        const totalStories = await Story.countDocuments({ sprintId: sprint._id });
        const completedStories = await Story.countDocuments({ sprintId: sprint._id, status: 'ready_qa' });
        return {
          ...sprint.toObject(),
          totalStories,
          completedStories
        };
      })
    );

    return res.json(sprintsWithCounts);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createSprint = async (req, res) => {
  try {
    const { name, goal, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ message: 'Name, startDate, and endDate are required' });
    }

    const sprint = await Sprint.create({
      name,
      goal: goal || '',
      startDate,
      endDate,
      status: 'planned',
      createdBy: req.user._id
    });

    return res.status(201).json(sprint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    const { name, goal, startDate, endDate, status } = req.body;

    if (name !== undefined) sprint.name = name;
    if (goal !== undefined) sprint.goal = goal;
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;
    if (status !== undefined) sprint.status = status;

    const updatedSprint = await sprint.save();
    return res.json(updatedSprint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const startSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    sprint.status = 'active';
    sprint.startedAt = new Date();
    await sprint.save();

    await Story.updateMany(
      { sprintId: sprint._id, status: 'backlog' },
      { status: 'todo' }
    );

    return res.json(sprint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const finishSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    sprint.status = 'completed';
    sprint.completedAt = new Date();
    await sprint.save();

    await Story.updateMany(
      { sprintId: sprint._id, status: { $ne: 'ready_qa' } },
      { sprintId: null }
    );

    return res.json(sprint);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint not found' });
    }

    await Story.updateMany({ sprintId: sprint._id }, { sprintId: null });
    await Sprint.findByIdAndDelete(req.params.id);

    return res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
