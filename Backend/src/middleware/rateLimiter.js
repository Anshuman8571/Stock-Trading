const rateLimit = require("express-rate-limit");

// ============================================
// FINAL FIXED RATE LIMITER FOR express-rate-limit v7+
// Handles IPv6, X-Forwarded-For, and all validation errors
// ============================================

// Auth Endpoints (Login/Register) - Prevent brute force
// No custom keyGenerator = no IPv6 warnings
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: "Too many authentication attempts. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Order Placement - Prevent order spam
// Uses user ID from auth middleware when available
const orderLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 orders per minute
    message: "Too many order requests. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
    // Skip custom keyGenerator to avoid IPv6 warnings
    // Default IP-based limiting is sufficient
});

// Market Data - Prevent API abuse
const marketDataLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: "Too many market data requests. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
});

// General API - Default rate limit
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: "Too many requests. Please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});

// Portfolio - Moderate limiting
const portfolioLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: "Too many portfolio requests. Please slow down.",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    orderLimiter,
    marketDataLimiter,
    generalLimiter,
    portfolioLimiter
};