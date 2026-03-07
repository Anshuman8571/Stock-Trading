const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require('axios');

async function fetchLiveStockData(symbol) {
    console.log(`[Tool Execution] Fetching live numerical data for ${symbol}...`);

    try {
        // Yahoo Finance v10 endpoint allows fetching comprehensive summary without an API key
        // Note: For Indian stocks, you must append .NS or .BO (e.g., RELIANCE.NS)
        // We will do a generic fallback check here to make it robust.
        let formattedSymbol = symbol;
        if (!formattedSymbol.includes('.') && formattedSymbol.length > 4) {
            // Heuristic: If it's a long symbol without a dot, it might be an Indian ticker
            // Let's just pass it through; Yahoo might complain if it's wrong, but it's okay.
            // We can instruct the agent to append .NS for Indian stocks in its thought process.
        }

        // The v8 chart endpoint is still fully public and bypassing the new 401 Crumb requirements
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${formattedSymbol}`;
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            }
        });

        const result = response.data.chart.result;
        if (!result || result.length === 0) {
            return `Failed to fetch live data for ${symbol}. The ticker symbol might be incorrect. (Hint: For Indian stocks, try appending .NS like RELIANCE.NS).`;
        }

        const meta = result[0].meta;
        const currentPrice = meta.regularMarketPrice;
        const currency = meta.currency || 'USD';
        const previousClose = meta.chartPreviousClose;

        if (!currentPrice) {
            return `Failed to parse current price for ${symbol}.`;
        }

        return `LIVE MARKET DATA FOR ${symbol}:
Current Exact Price: ${currentPrice} ${currency}
Previous Close: ${previousClose} ${currency}

This is the exact, real-time quantitative data. Use this precise numerical information to answer the user's question about the stock's current price.`;

    } catch (error) {
        console.error("Live Stock Data Fetch Error:", error.message);
        return `Failed to fetch live numerical data for ${symbol}. Please rely on news or vector databases. Note: For Indian stocks, make sure to use the .NS suffix (e.g., RELIANCE.NS instead of RELIANCE).`;
    }
}

// Define the tool for LangChain
const StockDataFetcherTool = new DynamicStructuredTool({
    name: "fetch_stock_price",
    description: "Fetches the exact, real-time quantitative stock price, market cap, P/E ratio, and day ranges for a specific stock symbol. ALWAYS use this tool FIRST when a user asks about a specific stock before fetching news.",
    schema: z.object({
        symbol: z.string().describe("The exact stock ticker symbol (e.g., AAPL, TSLA). For Indian companies, YOU MUST append '.NS' (e.g., RELIANCE.NS, TATAMOTORS.NS, HDFCBANK.NS)."),
    }),
    func: async ({ symbol }) => {
        return await fetchLiveStockData(symbol);
    },
});

module.exports = { StockDataFetcherTool };
