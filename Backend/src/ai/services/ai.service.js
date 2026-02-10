const { createFinancialAdvisorChain, model, portfolioAnalysisPrompt, stockRecommendationPrompt } = require("../config/langchain.config");
const db = require("../../config/db");

// Session-based memory storage (in production, use Redis)
const conversationSessions = new Map();

/**
 * Get or create a conversation session for a user
 */
function getConversationSession(userId) {
    if (!conversationSessions.has(userId)) {
        conversationSessions.set(userId, createFinancialAdvisorChain());
    }
    return conversationSessions.get(userId);
}

/**
 * Clear conversation session (for new conversation)
 */
function clearConversationSession(userId) {
    conversationSessions.delete(userId);
}

/**
 * Main AI Chat Handler
 */
async function handleAIChat(userId, message, context = {}) {
    try {
        const chain = getConversationSession(userId);
        
        // Get user's portfolio summary
        const portfolioSummary = await getPortfolioSummary(userId);
        
        // Get market status
        const marketStatus = await getMarketStatus();
        
        // Invoke the chain with context
        const response = await chain.invoke({
            input: message,
            portfolio_summary: portfolioSummary,
            market_status: marketStatus,
        });
        
        return {
            success: true,
            response: response.response,
            context: {
                portfolioSummary,
                marketStatus
            }
        };
    } catch (error) {
        console.error("AI Chat Error:", error);
        throw new Error("Failed to generate AI response. Please try again.");
    }
}

/**
 * Generate Portfolio Analysis
 */
async function generatePortfolioAnalysis(userId) {
    try {
        // Get detailed portfolio data
        const portfolioData = await getDetailedPortfolioData(userId);
        
        // Get market context
        const marketContext = await getMarketContext();
        
        // Format portfolio data for prompt
        const portfolioDataString = formatPortfolioData(portfolioData);
        
        // Invoke AI analysis
        const response = await model.invoke(
            await portfolioAnalysisPrompt.format({
                portfolio_data: portfolioDataString,
                market_context: marketContext,
            })
        );
        
        return {
            success: true,
            analysis: response.content,
            portfolioData,
            timestamp: new Date()
        };
    } catch (error) {
        console.error("Portfolio Analysis Error:", error);
        throw new Error("Failed to analyze portfolio. Please try again.");
    }
}

/**
 * Generate Stock Recommendation
 */
async function generateStockRecommendation(userId, symbol, question = "Should I buy this stock?") {
    try {
        // Get stock data
        const stockData = await getStockData(symbol);
        
        // Get user's current holdings of this stock
        const userHoldings = await getUserStockHoldings(userId, symbol);
        
        // Get market sentiment (mock for now)
        const marketSentiment = "Neutral"; // TODO: Integrate sentiment API
        
        // Get recent news (mock for now)
        const recentNews = "No major news"; // TODO: Integrate news API
        
        // Generate recommendation
        const response = await model.invoke(
            await stockRecommendationPrompt.format({
                symbol: symbol,
                current_price: stockData.price,
                user_holdings: userHoldings ? `${userHoldings.quantity} shares at avg ₹${userHoldings.avg_price}` : "No holdings",
                market_sentiment: marketSentiment,
                recent_news: recentNews,
                question: question
            })
        );
        
        return {
            success: true,
            recommendation: response.content,
            stockData,
            timestamp: new Date()
        };
    } catch (error) {
        console.error("Stock Recommendation Error:", error);
        throw new Error("Failed to generate recommendation. Please try again.");
    }
}

/**
 * Helper: Get Portfolio Summary
 */
async function getPortfolioSummary(userId) {
    try {
        const { rows: holdings } = await db.query(`
            SELECT h.symbol, h.quantity, h.avg_price, 
                   (h.quantity * h.avg_price) as invested_value
            FROM holdings h
            JOIN portfolios p ON h.portfolio_id = p.id
            WHERE p.user_id = $1
        `, [userId]);
        
        if (holdings.length === 0) {
            return "No holdings yet. Portfolio is empty.";
        }
        
        const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.invested_value), 0);
        const holdingsList = holdings.map(h => 
            `${h.symbol}: ${h.quantity} shares @ ₹${parseFloat(h.avg_price).toFixed(2)}`
        ).join(", ");
        
        return `Total Holdings: ${holdings.length} stocks. Invested: ₹${totalInvested.toFixed(2)}. Holdings: ${holdingsList}`;
    } catch (error) {
        console.error("Portfolio Summary Error:", error);
        return "Unable to fetch portfolio data";
    }
}

/**
 * Helper: Get Market Status
 */
async function getMarketStatus() {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Simple market hours check (9:15 AM - 3:30 PM IST, Mon-Fri)
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 9 && hour < 16;
    
    if (isWeekday && isMarketHours) {
        return "Market is currently OPEN";
    } else {
        return "Market is currently CLOSED";
    }
}

/**
 * Helper: Get Detailed Portfolio Data
 */
async function getDetailedPortfolioData(userId) {
    try {
        const { rows: holdings } = await db.query(`
            SELECT h.symbol, h.quantity, h.avg_price,
                   (h.quantity * h.avg_price) as invested_value
            FROM holdings h
            JOIN portfolios p ON h.portfolio_id = p.id
            WHERE p.user_id = $1
        `, [userId]);
        
        // TODO: Add current prices and calculate P&L
        return holdings;
    } catch (error) {
        console.error("Detailed Portfolio Data Error:", error);
        return [];
    }
}

/**
 * Helper: Get Market Context
 */
async function getMarketContext() {
    // TODO: Integrate real market data APIs
    return "Market is showing moderate volatility. Major indices are mixed.";
}

/**
 * Helper: Format Portfolio Data
 */
function formatPortfolioData(portfolioData) {
    if (!portfolioData || portfolioData.length === 0) {
        return "No holdings in portfolio";
    }
    
    return portfolioData.map((holding, idx) => {
        return `${idx + 1}. ${holding.symbol}: ${holding.quantity} shares @ avg ₹${parseFloat(holding.avg_price).toFixed(2)} (Invested: ₹${parseFloat(holding.invested_value).toFixed(2)})`;
    }).join("\n");
}

/**
 * Helper: Get Stock Data
 */
async function getStockData(symbol) {
    try {
        const { rows } = await db.query(`
            SELECT price, updated_at 
            FROM market_prices 
            WHERE symbol = $1
        `, [symbol.toUpperCase()]);
        
        if (rows.length === 0) {
            return { price: "N/A", updated_at: new Date() };
        }
        
        return {
            price: parseFloat(rows[0].price),
            updated_at: rows[0].updated_at
        };
    } catch (error) {
        console.error("Stock Data Error:", error);
        return { price: "N/A", updated_at: new Date() };
    }
}

/**
 * Helper: Get User Stock Holdings
 */
async function getUserStockHoldings(userId, symbol) {
    try {
        const { rows } = await db.query(`
            SELECT h.quantity, h.avg_price
            FROM holdings h
            JOIN portfolios p ON h.portfolio_id = p.id
            WHERE p.user_id = $1 AND h.symbol = $2
        `, [userId, symbol.toUpperCase()]);
        
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error("User Stock Holdings Error:", error);
        return null;
    }
}

module.exports = {
    handleAIChat,
    generatePortfolioAnalysis,
    generateStockRecommendation,
    clearConversationSession,
};