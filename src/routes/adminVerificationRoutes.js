import {Router} from 'express';
import { getPendingVerificationItems } from '../controllers/adminVerificationController.js';
import protect from '../Middleware/protect.js';
import adminOnly from '../Middleware/adminOnly.js';

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
