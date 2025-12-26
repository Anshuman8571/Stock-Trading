const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")
const { getOrCreatePortfolio } = require("../portfolio/portfolio.service")
const { getLivePrice } = require("../market/market.service")
const { updateHoldings } = require("../portfolio/portfolio.service") 


async function createPendingOrder(userId, symbol, quantity) {
    // const { price } = await getLivePrice(symbol)
    // console.log(require("../portfolio/portfolio.service"))
    const orderId = uuidv4();

    const result = await db.query(`INSERT INTO orders (id, user_id, symbol, quantity, status) VALUES ($1, $2, $3, $4, 'PENDING') RETURNING id`, [ orderId, userId, symbol, quantity ] );
    // const portfolio = await getOrCreatePortfolio(userId);

    // const { rows } = await db.query(`SELECT * FROM holdings WHERE portfolio_id = $1 AND symbol = $2`, [portfolio.id, symbol] )

    // if(rows.length === 0) {
    //     await db.query(`INSERT INTO holdings (id,portfolio_id, symbol, quantity, avg_price) VALUES ($1, $2, $3, $4, $5)`, [uuidv4(), portfolio.id, symbol, quantity, price]);   
    // } else {
    //     const holding = rows[0];
    //     const totalQuantity = holding.quantity + quantity;
    //     const avgPrice = (holding.quantity * holding.avg_price + quantity * price)/totalQuantity;
    //     await db.query(`UPDATE holdings SET quantity = $1, avg_price = $2 WHERE id = $3`, [totalQuantity, avgPrice, holding.id]);
    //     await db.query(`UPDATE orders SET status = 'EXECUTED' WHERE id = $1`,[orderId])
        
    // }
    // return { orderId,status: 'EXECUTED' }
    return { id: result.rows[0].id }

}
//Separated executution logic
async function executeOrder(orderId) {
    const res = await db.query(`SELECT * FROM orders WHERE id = $1`, [ orderId ])
    const order = res.rows[0]
    if(!order) throw new Error("Order not found");
    try {
        const { price } = await getLivePrice(order.symbol);
        await updateHoldings( order.user_id, order.symbol, order.quantity, price)
        await db.query(`UPDATE orders SET status = 'EXECUTED', price = $1 WHERE id = $2`, [ price, orderId ])
    } catch (error) {
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