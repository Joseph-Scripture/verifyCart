import { Router } from "express";
import { updateVendorProfile } from "../controllers/vendorProfileController.js";
import protect from "../Middleware/protect.js";
import { updateProfileImages } from "../controllers/vendorProfileController.js";
import { upload } from "../Middleware/profileUpload.js";
import {profileUploadLimiter} from "../Middleware/rateLimit.js";
const router = Router();

const uploadImages = (req, res, next) => {
    upload.fields([{ name: 'profileImage', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }])(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading files'
            });
        }
        next();
    });
};

router.patch('/profile', protect, updateVendorProfile);
router.patch('/profile/images', profileUploadLimiter, protect, uploadImages, updateProfileImages);


export default router   