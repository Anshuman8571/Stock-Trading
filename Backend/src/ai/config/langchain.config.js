const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } = require("@langchain/core/prompts");

const apiKey = process.env.GEMINI_API_KEY || (process.env.NODE_ENV === 'test' ? "dummy-key-for-test" : undefined);

// Initialize Gemini Model (FIXED)
const model = new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: "gemini-2.5-flash", 
    temperature: 0.7,
    maxOutputTokens: 2000, 
});

// 2. Define Prompts (Explicit & Clear)
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

// 3. Manual Chain Implementation
function createFinancialAdvisorChain() {
    let messageHistory = []; 

    return {
        invoke: async ({ input, portfolio_summary, market_status }) => {
            if (process.env.NODE_ENV === 'test') {
                return { response: "This is a mock AI response for testing." };
            }
            try {
                // 1. Format the History for the prompt
                const historyText = messageHistory.map(m => `${m.role}: ${m.content}`).join("\n");

                // 2. Create the specific prompt for this turn
                const formattedPrompt = await financialAdvisorPrompt.format({
                    portfolio_summary: portfolio_summary || "No portfolio data",
                    market_status: market_status || "Market Closed",
                    history: historyText,
                    input: input
                });

                // 3. Call the Model
                const response = await model.invoke(formattedPrompt);
                
                // 4. Update History
                messageHistory.push({ role: "User", content: input });
                messageHistory.push({ role: "AI", content: response.content });
                
                // Keep history manageable (last 10 turns = 20 messages)
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
    createFinancialAdvisorChain,
    portfolioAnalysisPrompt,
    stockRecommendationPrompt
};