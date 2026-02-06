const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")

// This function can do 2 things: can create a portfolio and return it and if the portfolio exists, will return that portfolio. 
async function getOrCreatePortfolio(userId, client = db) {
    const { rows } = await client.query(`SELECT * FROM portfolios WHERE user_id = $1`,[ userId ])
    if(rows.length > 0) return rows[0];
    const portfolioId = uuidv4();

    await client.query(`INSERT INTO portfolios (id, user_id) VALUES ($1, $2)`, [ portfolioId, userId ])

    return { id: portfolioId, user_id: userId };
}

async function getHoldings(userId) {
    const portfolio = await getOrCreatePortfolio(userId);
    const { rows } = await db.query(`SELECT symbol, quantity, avg_price FROM holdings WHERE portfolio_id = $1`, [ portfolio.id ]);
    return rows;
}

async function getHolding(userId, symbol) {
    const portfolio = await getOrCreatePortfolio(userId);
    const normalisedSymbol = symbol.trim().toUpperCase();

    const { rows } = await db.query(`SELECT quantity FROM holdings WHERE portfolio_id =$1 AND symbol = $2`, [ portfolio.id, normalisedSymbol ])
    return rows[0]
}

async function updateHoldings(client,userId, symbol, quantity, price) {
    console.log("Starting updateHoldings")
    const portfolio  = await getOrCreatePortfolio(userId, client)

    const result = await client.query(`SELECT * FROM holdings WHERE portfolio_id = $1 AND symbol = $2 FOR UPDATE`, [ portfolio.id, symbol ])
    if(result.rows.length === 0){
        await client.query(`INSERT INTO holdings (id, portfolio_id, symbol, quantity, avg_price) VALUES ($1, $2, $3, $4, $5)`, [ uuidv4(), portfolio.id, symbol, quantity, price ]);
        console.log("The order is added.")
        return;
    }
    const holding = result.rows[0];
    console.log("holding from updateHoldings",holding)
    const totalOldValue = holding.quantity * holding.avg_price;
    const totalNewValue = quantity * price;

    const newQuantity = holding.quantity + quantity;
    const newAvgPrice = (totalOldValue + totalNewValue) / newQuantity;

    await client.query(`UPDATE holdings SET quantity = $1, avg_price = $2 WHERE id =$3`, [ newQuantity, newAvgPrice, holding.id ])
    console.log("The order gets updated.")
}

async function reduceHoldings(client, userId, symbol, quantity) {
    const portfolio = await getOrCreatePortfolio(userId, client);
    const result = await client.query(`SELECT * FROM holdings WHERE portfolio_id = $1 AND symbol = $2 FOR UPDATE`, [ portfolio.id, symbol ]);

    if(result.rows.length === 0) throw new Error("No holdings available to sell")
    
    const holding = result.rows[0];
    if( holding.quantity < quantity ) throw new Error("Insufficient quantity to sell.")
    
    const remainingQty = holding.quantity - quantity;
    if(remainingQty === 0) await client.query(`DELETE FROM holdings WHERE id = $1`, [ holding.id ])
    else await client.query(`UPDATE holdings SET quantity = $1 WHERE id = $2`, [ remainingQty, holding.id ])
}
module.exports = { getHoldings, getOrCreatePortfolio, updateHoldings, reduceHoldings, getHolding }