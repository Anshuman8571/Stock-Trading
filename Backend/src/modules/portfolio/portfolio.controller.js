const { getHoldings } = require("./portfolio.service")
const { getPortfolioAnalytics } = require("./portfolio.analysis.service")

async function getPortfolioAnalyticsController(req, res, next) {
    try {
        const analytics = await getPortfolioAnalytics(req.user.userId)
        res.json({ success: true, analytics })
    } catch (error) {
        next(error)
    }
}
async function getMyPortfolio(req,res,next) {
    try {
        const holdings = await getHoldings(req.user.userId)
        res.json({ success: true, holdings})
    } catch (error) {
        next(error)
    }
}

module.exports ={ getMyPortfolio, getPortfolioAnalyticsController };