import express from 'express';
import {
  getEpics,
  createEpic,
  updateEpic,
  deleteEpic
} from '../controllers/epicController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getEpics);
router.post('/', protect, requireAdmin, createEpic);
router.put('/:id', protect, requireAdmin, updateEpic);
router.delete('/:id', protect, requireAdmin, deleteEpic);

export default router;
