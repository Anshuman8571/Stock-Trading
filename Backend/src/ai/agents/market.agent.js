const { createReactAgent } = require("@langchain/langgraph/prebuilt");
const { MemorySaver } = require("@langchain/langgraph");
const { model } = require("../config/langchain.config");
const { NewsFetcherTool } = require("../tools/news_fetcher.tool");
const { VectorSearchTool } = require("../tools/vector_search.tool");
const { createPortfolioFetcherTool } = require("../tools/portfolio_fetcher.tool");
const { StockDataFetcherTool } = require("../tools/stock_data.tool");
const { clearVectorStore } = require("../services/news_vector.service");

// Memory Storage
const agentSessions = new Map();

/**
 * Define the specialized Omni-Agent Prompt
 */
const systemPrompt = `You are an elite, autonomous AI Financial Analyst specializing in market research and portfolio analysis.

Your goal is to answer user questions about specific stocks by gathering real-time data or to analyze their personal investment portfolio when requested.

CRITICAL INSTRUCTIONS:
1. When asked about a specific external stock, you MUST immediately use the 'fetch_stock_price' tool FIRST to retrieve its exact real-time quantitative price numbers.
2. After getting the stock price, you MUST use the 'fetch_live_news' tool sequentially to get the latest qualitative headlines.
3. DO NOT STOP AND ASK THE USER IF YOU SHOULD SEARCH. As soon as the 'fetch_live_news' tool finishes, you MUST immediately use the 'search_vector_database' tool.
4. If the user asks about their "portfolio", "investments", "holdings", or asks for analysis of how they are doing, you MUST use the 'fetch_user_portfolio' tool to securely retrieve their exact database records.
5. Base your final answers strictly on the facts retrieved from your tools. Combine the numerical stock data, sentiment, and user holdings. Provide a well-structured and comprehensive summary. Include risk warnings where appropriate.`;

/**
 * Get or create an Agent Executor session for a user
 */
async function getAgentExecutor(userId) {
    if (!agentSessions.has(userId)) {
        console.log(`Creating new Omni Agent session for user ${userId}`);

        // Clear old vector data when starting a new fresh session
        clearVectorStore();

        // Dynamically create the tools for THIS specific user
        const userTools = [
            StockDataFetcherTool,
            NewsFetcherTool,
            VectorSearchTool,
            createPortfolioFetcherTool(userId)
        ];

        // Create the Agent
        const agent = createReactAgent({
            llm: model,
            tools: userTools,
            messageModifier: systemPrompt,
            checkpointSaver: new MemorySaver(),
        });

        const threadId = Math.random().toString(36).substring(7);
        agentSessions.set(userId, { agent, threadId });
    }

    return agentSessions.get(userId);
}

/**
 * Clear User Agent Session
 */
function clearAgentSession(userId) {
    agentSessions.delete(userId);
    clearVectorStore();
}

/**
 * Handle Market Agent Interaction
 */
async function handleMarketAgentChat(userId, query) {
    try {
        const session = await getAgentExecutor(userId);

        console.log(`[Agent Started] Query: ${query}`);

        // Run the agent loop
        const result = await session.agent.invoke(
            { messages: [["user", query]] },
            { configurable: { thread_id: session.threadId } }
        );

        const messages = result.messages;
        const lastMessage = messages[messages.length - 1];

        return {
            success: true,
            response: lastMessage.content,
            agent_steps: messages.length
        };

    } catch (error) {
        console.error("Market Agent Error:", error);
        throw new Error("Failed to execute agent. Check model availability or API keys.");
    }
}

module.exports = {
    handleMarketAgentChat,
    clearAgentSession
};
