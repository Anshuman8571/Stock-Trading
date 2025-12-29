const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)


async function explainPortfolio(analytics) {
    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash"
    })
    const prompt = `
        You are a financial assistant.
        Here is a user's portfolio summary:
        - Total Invested Value: ${analytics.investedValue}
        - Current Portfolio Value: ${analytics.currentValue}
        - Unrealised P&L: ${analytics.pnl}

        Stock Exposure:
        ${analytics.exposure
            .map(e => `- ${e.symbol}: ${e.exposure_percentage}%`)
            .join("\n")
        }
        Explain the portfolio performance in simple terms.
        Do not give investment advice.
        Do not predict prices.
        Focus on facts and current exposure.
    `;
    try {
        const result = await model.generateContent(prompt)
        const response = result.response.text();
        return response
    } catch (error) {
        console.error("Error generating portfolio explaination", error)
        throw error
    }

    return response;
}

module.exports = { explainPortfolio }