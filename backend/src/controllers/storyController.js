import Story from '../models/Story.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getStories = async (req, res) => {
  try {
    const { sprintId, epicId, status, assignedTo, backlog, category } = req.query;
    const filter = {};

    if (backlog === 'true') {
      filter.$or = [{ sprintId: null }, { status: 'backlog' }];
    } else {
      if (sprintId) filter.sprintId = sprintId;
      if (epicId) filter.epicId = epicId;
      if (status) filter.status = status;
      if (assignedTo) filter.assignedTo = assignedTo;
    }

    if (category) filter.category = category;

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
      category,
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
      category: category || 'tarea',
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

    const isAdmin = req.user && req.user.role === 'admin';

    if (isAdmin) {
      const adminFields = [
        'title',
        'description',
        'category',
        'status',
        'estimatedHours',
        'loggedHours',
        'difficulty',
        'priority',
        'isBlocked',
        'blockedReason',
        'order'
      ];

      adminFields.forEach((field) => {
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
    } else {
      const devFields = [
        'description',
        'status',
        'loggedHours',
        'isBlocked',
        'blockedReason'
      ];

      devFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          story[field] = req.body[field];
        }
      });
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

    const uploadDir = path.resolve(__dirname, '../../uploads');
    if (story.attachments && story.attachments.length > 0) {
      story.attachments.forEach((att) => {
        const filePath = path.join(uploadDir, att.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Story.findByIdAndDelete(req.params.id);
    return res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const uploadAttachments = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|tiff|avif|heic)$/i;

    const newAttachments = req.files.map((file) => {
      const isMimeImage = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
      const isExtImage = imageExtensions.test(file.originalname);
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: `/api/uploads/${file.filename}`,
        isImage: isMimeImage || isExtImage
      };
    });

    story.attachments.push(...newAttachments);
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

export const getAttachmentFile = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const attachment = story.attachments.id(req.params.attachId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const uploadDir = path.resolve(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, attachment.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.setHeader('Content-Type', attachment.mimetype || 'application/octet-stream');
    return res.sendFile(filePath);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const downloadAttachment = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const attachment = story.attachments.id(req.params.attachId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const uploadDir = path.resolve(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, attachment.filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    return res.download(filePath, attachment.originalName);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    const attachment = story.attachments.id(req.params.attachId);
    if (!attachment) {
      return res.status(404).json({ message: 'Attachment not found' });
    }

    const uploadDir = path.resolve(__dirname, '../../uploads');
    const filePath = path.join(uploadDir, attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    story.attachments.pull(req.params.attachId);
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
