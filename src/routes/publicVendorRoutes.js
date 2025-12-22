import {getVendorVerificationSummary} from '../controllers/vendorVerificationController.js'

import {Router} from 'express'

const router = Router();

router.get('/vendors:vendorId/summary', getVendorVerificationSummary);

export default router
