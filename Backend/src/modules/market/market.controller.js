const { getLivePrice } = require("./market.service");

async function getPrice(req, res, next) {
    try {
        const { symbol } = req.params;
        const price = await getLivePrice(symbol)
        res.json({ success: true, symbol,price })
    } catch (error) {
        next(error)
    }
}

module.exports = { getPrice }