import { Router } from "express";
import { updateVendorProfile } from "../controllers/vendorProfileController.js";
import protect from "../Middleware/protect.js";

const router = Router();
router.patch('/profile', protect, updateVendorProfile);

export default router