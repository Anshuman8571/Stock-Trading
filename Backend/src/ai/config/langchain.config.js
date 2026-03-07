const { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } = require("@langchain/core/prompts");

const apiKey = process.env.GEMINI_API_KEY || (process.env.NODE_ENV === 'test' ? "dummy-key-for-test" : undefined);

// Initialize Gemini Model
const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: "gemini-2.5-flash-lite",
    temperature: 0.7,
    maxOutputTokens: 2000,
    maxRetries: 0,
});

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    apiKey: apiKey,
    model: "gemini-embedding-001", // User's specific embedding model provisioned by Google
});

// Define Prompts (Explicit & Clear)
const financialAdvisorPrompt = ChatPromptTemplate.fromMessages([
    SystemMessagePromptTemplate.fromTemplate(`
You are an expert AI Financial Advisor for a stock trading platform.

User Portfolio:
{portfolio_summary}

Market Status:
{market_status}

Rules:
- Be specific, actionable, and data-driven
- Always include risk warnings
- Never guarantee returns
    `),
    HumanMessagePromptTemplate.fromTemplate(`
Conversation History:
{history}

User Question:
{input}
    `)
]);

// Manual Chain Implementation
function createFinancialAdvisorChain() {
    let messageHistory = [];

    return {
        invoke: async ({ input, portfolio_summary, market_status }) => {
            if (process.env.NODE_ENV === 'test') {
                return { response: "This is a mock AI response for testing." };
            }
            try {
                // Formatting history
                const historyText = messageHistory.map(m => `${m.role}: ${m.content}`).join("\n");

                const formattedPrompt = await financialAdvisorPrompt.format({
                    portfolio_summary: portfolio_summary || "No portfolio data",
                    market_status: market_status || "Market Closed",
                    history: historyText,
                    input: input
                });

                const response = await model.invoke(formattedPrompt);

                messageHistory.push({ role: "User", content: input });
                messageHistory.push({ role: "AI", content: response.content });

                if (messageHistory.length > 20) messageHistory = messageHistory.slice(-20);

                return { response: response.content };
            } catch (error) {
                console.error("Gemini Chain Error:", error);
                throw error;
            }
        }
    };
}

// Portfolio Analysis Prompt
const portfolioAnalysisPrompt = ChatPromptTemplate.fromTemplate(`
You are analyzing a user's stock portfolio. Provide a comprehensive analysis.

Portfolio Data:
{portfolio_data}

Market Context:
{market_context}

Provide a detailed analysis covering:
1. Overall Performance Assessment
2. Risk Analysis (concentration, volatility, sector exposure)
3. Strengths and Weaknesses
4. Specific Recommendations for improvement
5. Suggested actions (buy/sell/hold for each position)

Be specific, data-driven, and actionable. Use bullet points for clarity.

Analysis:
`);

// Stock Recommendation Prompt
const stockRecommendationPrompt = ChatPromptTemplate.fromTemplate(`
You are a stock analyst providing recommendations.

Stock Symbol: {symbol}
Current Price: {current_price}
User's Holdings: {user_holdings}
Market Sentiment: {market_sentiment}
Recent News: {recent_news}

Question: {question}

Provide a clear recommendation with:
1. Summary (Buy/Sell/Hold with confidence level)
2. Key Reasons (3-5 bullet points)
3. Risk Factors to consider
4. Price targets (if applicable)
5. Time horizon suggestion

Be balanced and objective. Include both bullish and bearish perspectives.

Recommendation:
`);

module.exports = {
    model,
    embeddingsModel,
    createFinancialAdvisorChain,
    portfolioAnalysisPrompt,
    stockRecommendationPrompt
};