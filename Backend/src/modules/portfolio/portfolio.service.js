const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")

// This function can do 2 things: can create a portfolio and return it and if the portfolio exists, will return that portfolio. 
async function getOrCreatePortfolio(userId) {
    const { rows } = await db.query(`SELECT * FROM portfolios WHERE user_id = $1`,[ userId ])
    if(rows.length > 0) return rows[0];
    const portfolioId = uuidv4();

    await db.query(`INSERT INTO portfolios (id, user_id) VALUES ($1, $2)`, [ portfolioId, userId ])

    return { id: portfolioId, user_id: userId };
}

async function getHoldings(userId) {
    const portfolio = await getOrCreatePortfolio(userId);

    const { rows } = await db.query(`SELECT symbol, quantity, avg_price FROM holdings WHERE portfolio_id = $1`, [ portfolio.id ]);
    return rows;
}

module.exports = { getHoldings,getOrCreatePortfolio }