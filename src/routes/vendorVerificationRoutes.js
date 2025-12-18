import express from 'express';
import { protect, vendorOnly } from '../Middleware/vendorAuthMiddleware.js';
import { upload } from '../Middleware/upload.js';
import { submitVerificationItem } from '../controllers/vendorVerificationController.js';

const router = express.Router();

router.post(
  '/verification/:type',
  protect,
  vendorOnly,
  upload.single('document'),
  submitVerificationItem
);

export default router;
