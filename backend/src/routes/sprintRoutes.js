import express from 'express';
import {
  getSprints,
  createSprint,
  updateSprint,
  startSprint,
  finishSprint,
  deleteSprint
} from '../controllers/sprintController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getSprints);
router.post('/', protect, requireAdmin, createSprint);
router.put('/:id', protect, requireAdmin, updateSprint);
router.put('/:id/start', protect, requireAdmin, startSprint);
router.put('/:id/finish', protect, requireAdmin, finishSprint);
router.delete('/:id', protect, requireAdmin, deleteSprint);

export default router;
