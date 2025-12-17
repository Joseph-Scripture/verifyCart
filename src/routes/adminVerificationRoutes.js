import {Router} from 'express';
import { getPendingVerificationItems } from '../controllers/adminVerificationController.js';
import {protect, adminOnly} from '../Middleware/authMiddleware.js';




const router = Router();
router.get('/verification/pending', 
    protect,
    adminOnly,
    getPendingVerificationItems
);



export default router;
