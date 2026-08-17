import express from 'express';
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  updateStoryStatus,
  deleteStory
} from '../controllers/storyController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getStories);
router.get('/:id', protect, getStoryById);
router.post('/', protect, requireAdmin, createStory);
router.put('/:id', protect, updateStory);
router.put('/:id/status', protect, updateStoryStatus);
router.delete('/:id', protect, requireAdmin, deleteStory);

export default router;
