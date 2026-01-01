const db = require("../../config/db");
const { getLivePrice } = require("../market/market.service")
const { getOrCreatePortfolio } = require("../portfolio/portfolio.service")

async function getPortfolioAnalytics(userId) {
    const portfolio = await getOrCreatePortfolio(userId);
    const { rows: holdings } = await db.query(`SELECT symbol, quantity, avg_price FROM holdings WHERE portfolio_id = $1`, [ portfolio.id ]);
    let investedValue = 0;
    let currentValue = 0;
    const breakdown = [];

    for (const holding of holdings){
        const invested = holding.quantity * holding.avg_price;
        investedValue += invested;
        console.log("Holdings from loop",holding)
        const { price } = await getLivePrice(holding.symbol);
        // if(!price || isNaN(price) )
        const currentPrice = price.price;
        const current = holding.quantity * currentPrice;
        currentValue += current;

        breakdown.push({
            symbol: holding.symbol,
            quantity: holding.quantity,
            avg_price: holding.avg_price,
            current_price: currentPrice,
            invested_value: invested,
            current_value: current
        }); 

        
    }
    const pnl = currentValue - investedValue;

    const exposure = breakdown.map(item => ({
        symbol:item.symbol,
        exposure_percentage: currentValue === 0? 0: ((item.current_value/currentValue) * 100).toFixed(2)
    }))
    return { investedValue, currentValue, pnl, exposure, breakdown }
}

module.exports = { getPortfolioAnalytics };