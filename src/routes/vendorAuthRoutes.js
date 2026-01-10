import { Router } from 'express';

import {
    vendorLogin,
    vendorSignup,
    vendorLogout,
    adminLogin,
    getMe,
} from '../controllers/vendorAuthController.js';

import { authLimiter, adminLimiter } from '../Middleware/rateLimit.js'
import { validateRequest } from '../Middleware/validateRequest.js';
import { vendorSignupValidator } from '../validators/vendorValidators.js'
import protect from '../Middleware/protect.js';


const router = Router()

router.post('/vendor/register', authLimiter, vendorSignupValidator, validateRequest, vendorSignup)
router.post('/vendor/login', authLimiter, vendorLogin);
router.post('/vendor/logout', vendorLogout);
router.post('/admin/login', adminLimiter, adminLogin);
router.get('/me', protect, getMe);


export default router