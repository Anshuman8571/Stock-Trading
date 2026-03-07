const { DynamicStructuredTool } = require("@langchain/core/tools");
const { z } = require("zod");
const { searchVectorStore } = require("../services/news_vector.service");

// Define a tool for the Agent to search the Vector Store
const VectorSearchTool = new DynamicStructuredTool({
    name: "search_vector_database",
    description: "Searches the internal semantic vector database for facts, news, and sentiment about a specific stock. Always use this AFTER you have fetched news for a stock symbol to get specific facts or context.",
    schema: z.object({
        query: z.string().describe("The specific question or topic to search for (e.g., 'What was the revenue growth?' or 'What is the sentiment around Apple products?')"),
    }),
    func: async ({ query }) => {
        console.log(`[Tool Execution] Searching Vector DB for: "${query}"`);

        const results = await searchVectorStore(query, 3);

        if (!results || results.length === 0) {
            return "No relevant information found in the database. You may need to fetch news for the stock symbol first.";
        }

        // Format the results for the LLM
        let formattedData = "Here is the relevant information retrieved from the database:\n\n";
        results.forEach((doc, i) => {
            formattedData += `--- Source ${i + 1} (Symbol: ${doc.metadata.symbol}, Date: ${doc.metadata.timestamp}) ---\n`;
            formattedData += `${doc.pageContent}\n\n`;
        });

        return formattedData;
    },
});

module.exports = { VectorSearchTool };
