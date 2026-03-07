const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const { chat, analyzePortfolio, recommendStock, clearSession, healthCheck, agentChat, clearAgent } = require("../controller/ai.controller");

// Health check (public)
router.get("/health", healthCheck);

// All other routes require authentication
router.use(authMiddleware);

// AI Chat
router.post("/chat", chat);

// Portfolio Analysis
router.post("/analyze-portfolio", analyzePortfolio);

// Stock Recommendation
router.post("/recommend-stock", recommendStock);

// Clear conversation session
router.post("/clear-session", clearSession);

// Agentic Market Research
router.post("/agent-chat", agentChat);

// Clear Agent Session
router.post("/clear-agent", clearAgent);

module.exports = router;