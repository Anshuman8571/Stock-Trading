const { handleAIChat, generatePortfolioAnalysis, generateStockRecommendation, clearConversationSession } = require("../services/ai.service");

/**
 * POST /api/ai/chat
 * Main AI chat endpoint
 */
async function chat(req, res, next) {
    try {
        const { message, context } = req.body;
        const userId = req.user.userId;
        
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }
        
        const result = await handleAIChat(userId, message.trim(), context);
        
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/ai/analyze-portfolio
 * Generate comprehensive portfolio analysis
 */
async function analyzePortfolio(req, res, next) {
    try {
        const userId = req.user.userId;
        
        const result = await generatePortfolioAnalysis(userId);
        
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/ai/recommend-stock
 * Get AI recommendation for a specific stock
 */
async function recommendStock(req, res, next) {
    try {
        const { symbol, question } = req.body;
        const userId = req.user.userId;
        
        if (!symbol || typeof symbol !== 'string') {
            return res.status(400).json({
                success: false,
                error: "Stock symbol is required"
            });
        }
        
        const result = await generateStockRecommendation(
            userId, 
            symbol.trim().toUpperCase(),
            question || "Should I buy this stock?"
        );
        
        res.json(result);
    } catch (error) {
        next(error);
    }
}

/**
 * POST /api/ai/clear-session
 * Clear conversation history (start fresh)
 */
async function clearSession(req, res, next) {
    try {
        const userId = req.user.userId;
        
        clearConversationSession(userId);
        
        res.json({
            success: true,
            message: "Conversation session cleared"
        });
    } catch (error) {
        next(error);
    }
}

/**
 * GET /api/ai/health
 * Check AI service health
 */
async function healthCheck(req, res, next) {
    try {
        const geminiApiKey = process.env.GEMINI_API_KEY; // ✅ FIXED: Was "geminiapiKey"
        console.log("GeminiAPI Key",geminiApiKey)
        res.json({
            success: true,
            status: "AI service is running",
            gemini_configured: !!geminiApiKey, // ✅ FIXED: Was "openai_configured"
            model: "gemini-1.5-flash",
            features: [
                "AI Chat",
                "Portfolio Analysis",
                "Stock Recommendations",
                "Conversation Memory"
            ]
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    chat,
    analyzePortfolio,
    recommendStock,
    clearSession,
    healthCheck,
};