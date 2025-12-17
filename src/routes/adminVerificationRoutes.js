import {Router} from 'express';
import { getPendingVerificationItems } from '../controllers/adminVerificationController.js';
import {protect, adminOnly} from '../Middleware/authMiddleware.js';
import { reviewVerificationItem } from '../controllers/adminVerificationController.js'



const router = Router();
router.get('/verification/pending', 
    protect,
    adminOnly,
    getPendingVerificationItems
);
router.patch(
    '/verification/:id',
    protect,
    adminOnly,
    reviewVerificationItem
)


export default router;
