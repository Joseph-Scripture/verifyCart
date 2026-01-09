import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './src/docs/swagger.js'
// Load environment variables
dotenv.config();

// Importing Routes
import vendorAuthRoutes from './src/routes/vendorAuthRoutes.js';
import vendorVerificationRoutes from './src/routes/vendorVerificationRoutes.js';
import adminVerificationRoutes from './src/routes/adminVerificationRoutes.js';
import vendorVerificationSummary from './src/routes/publicVendorRoutes.js'
import publicAnalyticsRoutes from './src/routes/publicAnalyticsRoutes.js'
import vendorAnalyticsRoutes from './src/routes/vendorAnalytics.js'
import reviewRoutes from './src/routes/reviewRoutes.js'
import vendorProfileRoutes from './src/routes/vendorProfileRoutes.js'
import passwordResetRoutes from './src/routes/passwordResetRoutes.js'





const app = express();

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



const allowedOrigins = [
    'https://verifycart.vercel.app',
    'http://localhost:5173',
    'https://verify-chart-k8gq.vercel.app'
];

app.set('trust proxy', 1); // Trust first proxy (required for Render/Heroku)

const corsOptions = {
    origin: (origin, callback) => {
        // Log the origin for debugging on Render
        console.log('Incoming Request Origin:', origin);

        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log(`Blocked Origin: ${origin}`);
            // Don't throw error, just don't return CORS headers
            // This prevents 500 HTML errors
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// Handle CORS preflight (OPTIONS) requests before authentication middleware
// Using middleware instead of routes to avoid Express 5.x path-to-regexp issues
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return cors(corsOptions)(req, res, next);
    }
    next();
});

// Routes
app.use('/api/auth', vendorAuthRoutes);
app.use('/api/vendor', vendorVerificationRoutes);
app.use('/api/admin', adminVerificationRoutes);
app.use('/api/vendor', vendorVerificationSummary);
app.use('/api/review', reviewRoutes)
app.use('/api/', publicAnalyticsRoutes)
app.use('/api/vendor', vendorAnalyticsRoutes)
app.use('/api/vendor', vendorProfileRoutes)
app.use('/api/auth', passwordResetRoutes)



const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
