import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 *60 * 1000,
    max:10,
    message:{
        message:"Too many attempts, please try again later",
    }
})

export const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message:{
        message:'Too many search requests, slow down',
    }
});

export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 60,
    message:{
        message:"Too many uploads, try again later",
    }

})

export const adminLimiter = rateLimit ({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message:{
        message:"Too many admin requests",
    }
})

export const reviewRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    standardHeaders:true,
    legacyHeaders: false,
    message: {
        message:"Too many reviews submitted. Please try again later"
    }
})