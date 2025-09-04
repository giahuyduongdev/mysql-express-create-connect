'use strict';
const rateLimit = require('express-rate-limit');

// Apply rate limiting middleware
const createRateLimiter = (numlimit) => {
    return rateLimit({
        windowMs: 60 * 1000, // 1 minute
        max: numlimit,
        message: {
            error: 'Too many requests',
            message: `Too many requests. Maximum ${numlimit} requests per minutes.`
        }
    });
};

module.exports = {
    createRateLimiter
}