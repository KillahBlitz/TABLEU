import express from 'express';
import {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getAttendanceSummary
} from '../controllers/attendanceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/', getAttendance);
router.post('/', markAttendance);
router.post('/bulk', bulkMarkAttendance);
router.get('/summary', getAttendanceSummary);

export default router;
