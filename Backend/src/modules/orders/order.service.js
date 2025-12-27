const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")
const { getOrCreatePortfolio } = require("../portfolio/portfolio.service")
const { getLivePrice } = require("../market/market.service")
const { updateHoldings } = require("../portfolio/portfolio.service") 


async function createPendingOrder(userId, symbol, quantity) {
    const orderId = uuidv4();
    const result = await db.query(`INSERT INTO orders (id, user_id, symbol, quantity, status) VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id`, [ orderId, userId, symbol, quantity ] );
    return { id: result.rows[0].id }
}
//Separated executution logic
async function executeOrder(orderId) {
    console.log("Execution starts....")
    const res = await db.query(`SELECT * FROM orders WHERE id = $1`, [ orderId ])
    const order = res.rows[0]
    if(!order) throw new Error("Order not found");
    try {
        const { price } = await getLivePrice(order.symbol);
        // const { price } = 100;
        console.log("Price: ",price)
        await updateHoldings( order.user_id, order.symbol, order.quantity, price)
        console.log("The order gets executed.")
        await db.query(`UPDATE orders SET status = 'EXECUTED', price = $1 WHERE id = $2`, [ price, orderId ])
    } catch (error) {
        console.log("The order get Failed.")
        await db.query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [ orderId ])
        throw error
    }
}


async function placeSellOrder(userId, symbol, quantity, price) {
    const portfolio = await getOrCreatePortfolio(userId);
    const { rows } = await db.query(`SELECT* FROM holdings WHERE portfolio_id = $1 AND symbol = $2`, [ portfolio.id, symbol ])
    if(rows.length === 0 || rows[0].quantity < quantity){
        const err = new Error("Not enough quantity to sell");
        err.status = 400;
        throw err;
    } 
    const orderId = uuidv4();
    await db.query(`INSERT INTO orders (id, user_id, symbol, quantity, price, side, status) VALUES ($1, $2, $3, $4, $5,'SELL', 'PENDING')`, [ orderId, userId, symbol, quantity, price ]);

    const remainingQty = rows[0].quantity - quantity;

    if((remainingQty === 0)){
        await db.query(`DELETE FROM holdings WHERE id = $1`, [ rows[0].id ]);
    } else {
        await db.query(`UPDATE holdings SET quantity = $1 WHERE id = $2`, [ remainingQty, rows[0].id ])
        
    }

    await db.query(`UPDATE orders SET status = 'EXECUTED' WHERE id  = $1`, [ orderId ])
    const sellOrderRow = await db.query(`SELECT * FROM orders WHERE id = $1`, [ orderId ])
    return sellOrderRow.rows;
}


async function getOrderHistory(userId) {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at`,[ userId ]);
    return rows;
}

module.exports = { createPendingOrder, placeSellOrder, getOrderHistory, executeOrder }