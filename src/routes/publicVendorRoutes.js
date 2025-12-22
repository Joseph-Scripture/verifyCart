import {getVendorVerificationSummary} from '../controllers/vendorVerificationController.js';
import { searchVendors } from '../controllers/vendorVerificationController.js';


import {Router} from 'express'

const router = Router();

router.get('/:vendorId/summary', getVendorVerificationSummary);
router.get('/search', searchVendors);

export default router
