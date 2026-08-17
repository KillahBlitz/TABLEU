import Story from '../models/Story.js';

export const getStories = async (req, res) => {
  try {
    const { sprintId, epicId, status, assignedTo, backlog } = req.query;
    const filter = {};

    if (backlog === 'true') {
      filter.$or = [{ sprintId: null }, { status: 'backlog' }];
    } else {
      if (sprintId) filter.sprintId = sprintId;
      if (epicId) filter.epicId = epicId;
      if (status) filter.status = status;
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    const stories = await Story.find(filter)
      .populate('epicId', 'title color')
      .populate('sprintId', 'name status startDate endDate')
      .populate('assignedTo', 'name email avatarColor role')
      .populate('createdBy', 'name email')
      .sort({ order: 1, createdAt: 1 });

    return res.json(stories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getStoryById = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id)
      .populate('epicId', 'title color')
      .populate('sprintId', 'name status')
      .populate('assignedTo', 'name email avatarColor role')
      .populate('createdBy', 'name email');

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    return res.json(story);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createStory = async (req, res) => {
  try {
    const {
      title,
      description,
      epicId,
      sprintId,
      assignedTo,
      status,
      estimatedHours,
      loggedHours,
      difficulty,
      priority,
      isBlocked,
      blockedReason,
      order
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const resolvedEpicId = (epicId && typeof epicId === 'object') ? epicId._id : (epicId || null);
    const resolvedSprintId = (sprintId && typeof sprintId === 'object') ? sprintId._id : (sprintId || null);
    const resolvedAssignedTo = (assignedTo && typeof assignedTo === 'object') ? assignedTo._id : (assignedTo || null);

    const defaultStatus = resolvedSprintId ? (status || 'todo') : (status || 'backlog');

    const story = await Story.create({
      title,
      description: description || '',
      epicId: resolvedEpicId,
      sprintId: resolvedSprintId,
      assignedTo: resolvedAssignedTo,
      status: defaultStatus,
      estimatedHours: estimatedHours || 0,
      loggedHours: loggedHours || 0,
      difficulty: difficulty || 1,
      priority: priority || 'medium',
      isBlocked: isBlocked || false,
      blockedReason: blockedReason || '',
      order: order || 0,
      createdBy: req.user._id
    });

    const populatedStory = await Story.findById(story._id)
      .populate('epicId', 'title color')
      .populate('sprintId', 'name status')
      .populate('assignedTo', 'name email avatarColor');

    return res.status(201).json(populatedStory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const allowedFields = [
      'title',
      'description',
      'status',
      'estimatedHours',
      'loggedHours',
      'difficulty',
      'priority',
      'isBlocked',
      'blockedReason',
      'order'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        story[field] = req.body[field];
      }
    });

    if (req.body.assignedTo !== undefined) {
      story.assignedTo = (req.body.assignedTo && typeof req.body.assignedTo === 'object')
        ? req.body.assignedTo._id
        : (req.body.assignedTo || null);
    }

    if (req.body.epicId !== undefined) {
      story.epicId = (req.body.epicId && typeof req.body.epicId === 'object')
        ? req.body.epicId._id
        : (req.body.epicId || null);
    }

    if (req.body.sprintId !== undefined) {
      story.sprintId = (req.body.sprintId && typeof req.body.sprintId === 'object')
        ? req.body.sprintId._id
        : (req.body.sprintId || null);
    }

    await story.save();

    const updatedStory = await Story.findById(story._id)
      .populate('epicId', 'title color')
      .populate('sprintId', 'name status')
      .populate('assignedTo', 'name email avatarColor');

    return res.json(updatedStory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateStoryStatus = async (req, res) => {
  try {
    const { status, order, sprintId } = req.body;
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (status !== undefined) {
      story.status = status;
    }
    if (order !== undefined) {
      story.order = order;
    }
    if (sprintId !== undefined) {
      story.sprintId = (sprintId && typeof sprintId === 'object')
        ? sprintId._id
        : (sprintId || null);
    }

    await story.save();

    const updatedStory = await Story.findById(story._id)
      .populate('epicId', 'title color')
      .populate('sprintId', 'name status')
      .populate('assignedTo', 'name email avatarColor');

    return res.json(updatedStory);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    await Story.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
