import express from 'express';
import {
  getRoles,
  createRole,
  updateRole
} from '../controllers/roleController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getRoles);
router.post('/', requireAdmin, createRole);
router.put('/:id', requireAdmin, updateRole);

export default router;
