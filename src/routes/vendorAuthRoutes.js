import {Router} from 'express';

import {
    vendorLogin,
    vendorSignup,
    vendorLogout
} from '../controllers/vendorAuthController.js';



const router = Router()

router.post('/vendor/register', vendorSignup)
router.post('/vendor/login', vendorLogin);
router.post('/vendor/logout', vendorLogout);


export default router