import express from 'express';
import {
  getKpiSummary,
  getKpisByUser,
  getKpisByEpic,
  getKpiBySprint
} from '../controllers/kpiController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/summary', getKpiSummary);
router.get('/by-user', getKpisByUser);
router.get('/by-epic', getKpisByEpic);
router.get('/sprint/:id', getKpiBySprint);

export default router;
