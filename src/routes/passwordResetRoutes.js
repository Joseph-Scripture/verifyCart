import {Router} from  'express';
import {forgotPassword, verifyResetCode, resetPassword} from '../controllers/passwordResetController.js';
import { resetRateLimit } from '../Middleware/rateLimit.js';
import {validateRequest} from '../Middleware/validateRequest.js';

const router = Router();

router.post('/forgot-password', resetRateLimit, validateRequest, forgotPassword);
router.post('/verify-reset-code', resetRateLimit, validateRequest, verifyResetCode);
router.post('/reset-password', resetRateLimit, validateRequest, resetPassword);

export default router;

