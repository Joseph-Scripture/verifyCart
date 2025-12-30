import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import {swaggerSpec} from './src/docs/swagger.js'
// Load environment variables
dotenv.config();

// Importing Routes
import vendorAuthRoutes from './src/routes/vendorAuthRoutes.js';
import vendorVerificationRoutes from './src/routes/vendorVerificationRoutes.js';
import adminVerificationRoutes from './src/routes/adminVerificationRoutes.js';
import vendorVerificationSummary from './src/routes/publicVendorRoutes.js'

import reviewRoutes from './src/routes/reviewRoutes.js'





const app = express();

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', vendorAuthRoutes);
app.use('/api/vendor', vendorVerificationRoutes);
app.use('/api/admin', adminVerificationRoutes);
app.use('/api/vendor', vendorVerificationSummary);
app.use('/api/review', reviewRoutes)



const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
