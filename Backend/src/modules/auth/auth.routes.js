const express = require("express");
const { 
    register, 
    login,
    checkPIN,
    createPIN,
    pinLogin,
    removePIN
} = require("./auth.controller");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Traditional email/password
router.post("/register", register);
router.post("/login", login);

// Check if user has PIN enabled
router.get("/pin/check", checkPIN);

// Quick login with PIN
router.post("/pin/login", pinLogin);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// PIN management (must be logged in)
router.post("/pin/setup", authMiddleware, createPIN);
router.delete("/pin/remove", authMiddleware, removePIN);

module.exports = router;