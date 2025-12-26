const { getHoldings } = require("./portfolio.service")

async function getMyPortfolio(req,res,next) {
    try {
        const holdings = await getHoldings(req.user.userId)
        res.json({ success: true, holdings})
    } catch (error) {
        next(error)
    }
}

module.exports ={ getMyPortfolio};