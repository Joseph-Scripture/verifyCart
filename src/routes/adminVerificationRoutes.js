import { Router } from 'express';
import { getPendingVerificationItems, reviewVerificationItem, moderateReview, revokeVendor, getAllVerificationItems, getApprovedVendors, getRejectedVendors } from '../controllers/adminVerificationController.js';
import protect from '../Middleware/protect.js';
import adminOnly from '../Middleware/adminOnly.js';



const router = Router();
router.get('/verification',
    protect,
    adminOnly,
    getAllVerificationItems
);

router.get('/verification/pending',
    protect,
    adminOnly,
    getPendingVerificationItems
);

router.get('/vendors/approved',
    protect,
    adminOnly,
    getApprovedVendors
);

router.get('/vendors/rejected',
    protect,
    adminOnly,
    getRejectedVendors
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
router.patch(
    '/vendor/:vendorId/revoke',
    protect,
    adminOnly,
    revokeVendor
)


export default router;
