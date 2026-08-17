import express from 'express';
import { getUsers, deleteUser } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', protect, getUsers);
router.delete('/:id', protect, requireAdmin, deleteUser);

export default router;
