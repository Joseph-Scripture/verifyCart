import express from 'express';
import protect from '../Middleware/protect.js';

import { upload } from '../Middleware/upload.js';
import { submitVerificationItem } from '../controllers/vendorVerificationController.js';

const router = express.Router();

router.post(
  '/verification/:type',
  protect,
  upload.single('document'),
  submitVerificationItem
);

export default router;
