import express from 'express';
import {
  getAttendance,
  markAttendance,
  bulkMarkAttendance,
  getAttendanceSummary,
  getCoveredHours,
  updateRequiredHours
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
router.get('/covered-hours', getCoveredHours);
router.put('/required-hours', updateRequiredHours);

export default router;
