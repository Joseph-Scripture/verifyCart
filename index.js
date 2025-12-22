import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import {rateLimit} from 'express-rate-limit'

// Load environment variables
dotenv.config();

// Importing Routes
import vendorAuthRoutes from './src/routes/vendorAuthRoutes.js';
import vendorVerificationRoutes from './src/routes/vendorVerificationRoutes.js';
import adminVerificationRoutes from './src/routes/adminVerificationRoutes.js';
import vendorVerificationSummary from './src/routes/publicVendorRoutes.js'



// rate limiting configuration

const limiter = rateLimit({
    windowMs:60 * 60 * 1000,
    limit:100,

})



const app = express();
app.use('/api', limiter)

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', vendorAuthRoutes);
app.use('/api/vendor', vendorVerificationRoutes);
app.use('/api/admin', adminVerificationRoutes);
app.use('/api/vendors', vendorVerificationSummary);



const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
