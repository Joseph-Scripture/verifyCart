import {Router} from 'express';
import { getPendingVerificationItems, reviewVerificationItem, moderateReview } from '../controllers/adminVerificationController.js';
import protect from '../Middleware/protect.js';
import adminOnly from '../Middleware/adminOnly.js';



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
router.patch(
    '/review/:reviewId',
    protect,
    adminOnly,
    moderateReview
)


export default router;
