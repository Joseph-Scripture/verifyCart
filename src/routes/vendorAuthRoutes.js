import {Router} from 'express';

import {
    vendorLogin,
    vendorSignup,
    vendorLogout,
    adminLogin,
} from '../controllers/vendorAuthController.js';



const router = Router()

router.post('/vendor/register', vendorSignup)
router.post('/vendor/login', vendorLogin);
router.post('/vendor/logout', vendorLogout);
router.post('/admin/login', adminLogin);


export default router