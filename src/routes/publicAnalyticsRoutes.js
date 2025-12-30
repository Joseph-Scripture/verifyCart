import { Router } from "express";
import { trackBadgeClick } from "../controllers/analyticsController.js";

const router = Router();

router.get('/badge/:vendorId', trackBadgeClick);

export default router;