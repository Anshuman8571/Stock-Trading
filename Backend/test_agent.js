require('dotenv').config({ path: './.env' }); // Adjust if needed
const { handleMarketAgentChat } = require('./src/ai/agents/market.agent');

async function testAgent() {
    console.log("=== Starting Market Agent Test ===\n");
    const userId = "test-user-123";

    // First query asking about a stock
    const query1 = "What is the exact current stock price of TSLA, and what's the latest news on them?";
    console.log(`User: ${query1}\n`);

    try {
        const result1 = await handleMarketAgentChat(userId, query1);
        console.dir(result1, { depth: null });
        console.log(`\n\nAgent Output:\n${result1.response}\n`);
        console.log(`Agent Steps Taken: ${result1.agent_steps}\n`);

        // Second query to see if it remembers the context and uses the Vector Store
        console.log("--------------------------------------------------\n");
        const query2 = "Are there any mentions of specific dates or numbers in that TSLA news?";
        console.log(`User: ${query2}\n`);

        const result2 = await handleMarketAgentChat(userId, query2);
        console.dir(result2, { depth: null });
        console.log(`\n\nAgent Output:\n${result2.response}\n`);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

// Check if API key exists before running
if (!process.env.GEMINI_API_KEY) {
    console.error("ERROR: GEMINI_API_KEY environment variable is not set.");
    console.log("Please create a .env file in the Backend folder with your API key.");
    process.exit(1);
}

testAgent();
