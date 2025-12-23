import {getVendorVerificationSummary} from '../controllers/vendorVerificationController.js';
import { searchVendors } from '../controllers/vendorVerificationController.js';
import {searchLimiter} from '../Middleware/rateLimit.js'

import {Router} from 'express'

const router = Router();

router.get('/:vendorId/summary', getVendorVerificationSummary);
router.get('/search',searchLimiter, searchVendors);

export default router
