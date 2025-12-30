import {getVendorVerificationSummary} from '../controllers/vendorVerificationController.js';
import { searchVendors } from '../controllers/vendorVerificationController.js';
import {searchLimiter} from '../Middleware/rateLimit.js'

import {Router} from 'express'

const router = Router();
router.get('/search',searchLimiter, searchVendors);

router.get('/summary/:vendorId', getVendorVerificationSummary);


export default router
