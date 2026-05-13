/**
 * src/shared/middlewares/rate-limiter.middleware.ts
 */

import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many auth attempts, please try again later',
    skipSuccessfulRequests: true,
    skip: () => process.env.NODE_ENV === 'test',
});
