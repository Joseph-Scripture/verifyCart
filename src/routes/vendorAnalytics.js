import {Router} from 'express';

import {getVendorAnalytics} from '../controllers/vendorAnalyticsController.js';
import protect from '../Middleware/protect.js';

const router = Router();

router.get('/analytics', protect, getVendorAnalytics);

export default router;