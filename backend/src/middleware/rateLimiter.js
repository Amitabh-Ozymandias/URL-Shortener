const rateLimit = require("express-rate-limit");

/**
 * Global Rate Limiter for general API routes
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 150, // Limit each IP to 150 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        status: "fail",
        message: "Too many requests from this IP, please try again later."
    }
});

/**
 * Strict Rate Limiter for authentication routes (Login/Register)
 * Protects against brute-force and credential-stuffing attacks.
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 login/register attempts per window
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        status: "fail",
        message: "Too many authentication attempts. Please try again after 15 minutes."
    }
});

/**
 * Rate Limiter for public shortlink redirects
 * Allows high throughput while preventing scraping or Denial-of-Service attacks.
 */
const redirectLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 500, // 500 redirects per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        status: "fail",
        message: "Too many redirect requests. Please slow down."
    }
});

module.exports = {
    globalLimiter,
    authLimiter,
    redirectLimiter
};
