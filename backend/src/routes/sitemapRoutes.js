import express from 'express';
import {
  getSitemap,
  updateSitemap,
  uploadSitemapImage,
  clearSitemap
} from '../controllers/sitemapController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/roleMiddleware.js';
import { handleUpload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.get('/', protect, getSitemap);
router.put('/', protect, requireAdmin, updateSitemap);
router.post('/upload', protect, requireAdmin, handleUpload, uploadSitemapImage);
router.delete('/clear', protect, requireAdmin, clearSitemap);

export default router;
