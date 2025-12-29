const { getPortfolioAnalytics } = require("./portfolio.analysis.service");
const { explainPortfolio } = require("../ai/portfolio.ai.service");

async function explainMyPortfolio(req, res, next) {
    try {
        const analytics = await getPortfolioAnalytics(req.user.userId);
        const explaination = await explainPortfolio(analytics);

        res.json({
            success: true,
            explaination
        })
    } catch (error) {
        next(error)
    }
}

module.exports = { explainMyPortfolio };