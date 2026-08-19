import express from 'express';
import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  updateStoryStatus,
  deleteStory,
  uploadAttachments,
  getAttachmentFile,
  downloadAttachment,
  deleteAttachment
} from '../controllers/storyController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { handleUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, getStories);
router.get('/:id', protect, getStoryById);
router.post('/', protect, requireAdmin, createStory);
router.put('/:id', protect, updateStory);
router.put('/:id/status', protect, updateStoryStatus);
router.delete('/:id', protect, requireAdmin, deleteStory);

router.post('/:id/attachments', protect, handleUpload, uploadAttachments);
router.get('/:id/attachments/:attachId/file', protect, getAttachmentFile);
router.get('/:id/attachments/:attachId/download', protect, downloadAttachment);
router.delete('/:id/attachments/:attachId', protect, deleteAttachment);

export default router;
