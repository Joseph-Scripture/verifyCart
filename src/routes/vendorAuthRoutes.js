import {Router} from 'express';

import {
    vendorLogin,
    vendorSignup,
    vendorLogout,
    adminLogin,
} from '../controllers/vendorAuthController.js';

import {authLimiter, adminLimiter} from '../Middleware/rateLimit.js'
import {validateRequest} from '../Middleware/validateRequest.js';
import {vendorSignupValidator} from '../validators/vendorValidators.js'


const router = Router()

router.post('/vendor/register',authLimiter,vendorSignupValidator,validateRequest, vendorSignup)
router.post('/vendor/login',authLimiter, vendorLogin);
router.post('/vendor/logout', vendorLogout);
router.post('/admin/login',adminLimiter, adminLogin);


export default router