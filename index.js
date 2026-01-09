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

// Diagnostic: List all registered routes helper
function listRoutes(stack, prefix = '') {
    const routes = [];
    if (!stack || !Array.isArray(stack)) return routes;

    stack.forEach(layer => {
        if (layer.route && layer.route.path) {
            const methods = layer.route.methods ? Object.keys(layer.route.methods).join(',').toUpperCase() : 'UNKNOWN';
            routes.push(`${methods} ${prefix}${layer.route.path}`);
        } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
            let nextPrefix = prefix;
            if (layer.regexp && layer.regexp.source) {
                const routePath = layer.regexp.source
                    .replace('^\\', '')
                    .replace('\\/?(?=\\/|$)', '')
                    .replace(/\\\//g, '/');
                nextPrefix += routePath;
            }
            routes.push(...listRoutes(layer.handle.stack, nextPrefix));
        }
    });
    return routes;
}

app.set('trust proxy', true); // Trust all proxies on Render

// 1. Diagnostic Logging Middleware (MUST BE TOP)
app.use((req, res, next) => {
    console.log(`[Diagnostic] ${req.method} ${req.url}`);
    console.log(`[Headers] Origin: ${req.headers.origin || 'undefined'} | Referer: ${req.headers.referer || 'undefined'}`);
    next();
});

const allowedOrigins = [
    'https://verifycart.vercel.app',
    'http://localhost:5173',
    'https://verify-chart-k8gq.vercel.app'
];

// 2. Robust CORS Configuration
const corsOptions = {
    origin: (origin, callback) => {
        // Log the origin for debugging on Render
        console.log('[CORS Filter] Incoming Request Origin:', origin);

        // Fail-safe for missing origin during redirects
        const effectiveOrigin = origin || '';

        if (!effectiveOrigin) {
            console.log('[CORS Filter] Allowing missing origin (likely direct or redirect)');
            return callback(null, true);
        }

        if (allowedOrigins.includes(effectiveOrigin)) {
            callback(null, true);
        } else {
            console.log(`[CORS Filter] Blocked Origin: ${effectiveOrigin}`);
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
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
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



app.get('/api/ping', (req, res) => res.json({ status: 'ok', timestamp: new Date(), env: process.env.NODE_ENV }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('--- REGISTERED ROUTES ---');
    if (app._router && app._router.stack) {
        listRoutes(app._router.stack).forEach(r => console.log(`[Route] ${r}`));
    } else if (app.router && app.router.stack) {
        listRoutes(app.router.stack).forEach(r => console.log(`[Route] ${r}`));
    } else {
        console.log('[Route Audit] Could not access router stack');
    }
    console.log('-------------------------');
});
