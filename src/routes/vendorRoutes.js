const express = require('express');
const router = express.Router();
const vendorController = require('../controllers/vendorController');
const { verifyToken } = require('../Middleware/authMiddleware');

router.post('/submit', verifyToken, vendorController.submitProfile);
router.get('/status', verifyToken, vendorController.getVendorStatus);

module.exports = router;
