const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const db = require("../../config/db");

function createPortfolioFetcherTool(userId) {
    return new DynamicStructuredTool({
        name: "fetch_user_portfolio",
        description: "Fetches the current authenticated user's personal stock portfolio holdings from the PostgreSQL database. Use this tool ONLY when the user asks about their own portfolio, their current investments, or asks for an analysis of their holdings. DO NOT use this tool for general market questions.",
        schema: z.object({
            request: z.string().optional().describe("Optional request context or focus area (e.g. 'summary', 'performance')"),
        }),
        func: async () => {
            console.log(`[Tool Execution] Fetching portfolio for user ${userId}...`);
            if (!userId || userId === 'anonymous') {
                return "The user is not authenticated. Cannot fetch portfolio data.";
            }

            try {
                const { rows: holdings } = await db.query(`
                    SELECT h.symbol, h.quantity, h.avg_price, 
                           (h.quantity * h.avg_price) as invested_value
                    FROM holdings h
                    JOIN portfolios p ON h.portfolio_id = p.id
                    WHERE p.user_id = $1
                `, [userId]);

                if (holdings.length === 0) {
                    return "No holdings yet. The user's portfolio is currently empty.";
                }

                const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.invested_value), 0);
                const holdingsList = holdings.map(h =>
                    `- ${h.symbol}: ${h.quantity} shares @ ₹${parseFloat(h.avg_price).toFixed(2)} (Total Invested: ₹${parseFloat(h.invested_value).toFixed(2)})`
                ).join("\n");

                return `Here is the user's current private portfolio data from the database:\n\nTotal Unique Stocks: ${holdings.length}\nTotal Amount Invested: ₹${totalInvested.toFixed(2)}\n\nHoldings Breakdown:\n${holdingsList}\n\nYou can now use this specific personal data to provide a comprehensive analysis or answer their specific questions. You may also want to fetch the live news for these specific symbols to cross-reference them.`;
            } catch (error) {
                console.error("Portfolio Fetch Error:", error);
                return "Error securely fetching the portfolio from the database.";
            }
        },
    });
}

module.exports = { createPortfolioFetcherTool };
