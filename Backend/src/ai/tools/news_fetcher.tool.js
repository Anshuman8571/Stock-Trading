const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const axios = require('axios');
const cheerio = require('cheerio');
const { processAndStoreNews } = require("../services/news_vector.service");

/**
 * This is a simulated News Fetcher Tool.
 * In a real-world scenario, you would use a News API (like AlphaVantage, Finnhub, or NewsAPI).
 * Since we don't assume the user has a paid API key, we will simulate fetching news 
 * by scraping a public financial site or returning a realistic mock based on the symbol.
 */
async function fetchRecentNews(symbol) {
    console.log(`[Tool Execution] Fetching news for ${symbol}...`);

    // We will use Google News RSS search as it provides vastly superior international coverage
    // and naturally understands both US tickers (AAPL) and Indian entities (Reliance).
    try {
        const url = `https://news.google.com/rss/search?q=${symbol}+stock`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data, { xmlMode: true });

        let combinedNews = "";
        let articleCount = 0;

        $('item').each((i, el) => {
            if (i >= 3) return false; // Get top 3 news items to strictly conserve free-tier API quotas
            const title = $(el).find('title').text();
            const description = $(el).find('description').text();
            const pubDate = $(el).find('pubDate').text();

            combinedNews += `Headline: ${title}\nDate: ${pubDate}\nSummary: ${description}\n\n`;
            articleCount++;
        });

        if (articleCount === 0) {
            return `No recent news headlines found for ${symbol}.`;
        }

        console.log(`[Tool Execution] Found ${articleCount} articles. Vectorizing data...`);

        // 🚀 RAG PIPELINE TRIGGER: Before returning the text to the LLM, 
        // we store it in our FAISS Vector DB for future semantic retrieval.
        await processAndStoreNews(combinedNews, { symbol: symbol, source: "Yahoo Finance", timestamp: new Date().toISOString() });

        return "SUCCESS: News data has been fetched and stored in the Vector Database. You can now use your vector_search_tool to analyze it.";

    } catch (error) {
        console.error("News fetch error:", error.message);
        return `Failed to fetch live news for ${symbol}. Please rely on your training data.`;
    }
}

// Define the tool for LangChain
const NewsFetcherTool = new DynamicStructuredTool({
    name: "fetch_live_news",
    description: "Fetches the latest live financial news headlines for a specific stock symbol and automatically stores them in the Vector Database for analysis. Use this when you need up-to-date sentiment or facts about a company.",
    schema: z.object({
        symbol: z.string().describe("The stock ticker symbol (e.g., RELIANCE, TATAMOTORS, HDFCBANK)"),
    }),
    func: async ({ symbol }) => {
        return await fetchRecentNews(symbol);
    },
});

module.exports = { NewsFetcherTool };
