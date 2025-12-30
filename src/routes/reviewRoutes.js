import { Router } from 'express';
import { submitReview, getVendorReviews } from '../controllers/reviewController.js';
import {reviewRateLimit} from '../Middleware/rateLimit.js'

const router = Router();

router.post('/:vendorId',reviewRateLimit, submitReview);
router.get('/:vendorId', getVendorReviews);

export default router;
