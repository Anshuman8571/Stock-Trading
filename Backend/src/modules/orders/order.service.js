const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")
const { getOrCreatePortfolio, reduceHoldings,updateHoldings } = require("../portfolio/portfolio.service")
const { getLivePrice } = require("../market/market.service")
// const { updateHoldings } = require("../portfolio/portfolio.service") 


async function createPendingOrder(userId, symbol, quantity, side, orderType = "MARKET", limitPrice=null, validForMinutes = 30) {
    const normalisedSymbol = symbol.trim().toUpperCase();
    const orderId = uuidv4();
    const expiresAt = orderType === "LIMIT"
                        ? new Date(Date.now() + validForMinutes * 60 * 1000)
                        : null;
    const result = await db.query(`INSERT INTO orders (id, user_id, symbol, quantity, side,  status, order_type, limit_price, expires_at) VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, $8)`, [ orderId, userId, normalisedSymbol, quantity, side, orderType, limitPrice, expiresAt ] );
    return { id: orderId }
}
//Separated executution logic
async function executeOrder(orderId) {
    console.log("Execution starts....", orderId)

    console.log("1")
    const res = await db.query(`SELECT * FROM orders WHERE id = $1 `, [ orderId ])
    const order = res.rows[0]
    if(!order) throw new Error("Order Not Found.");
    if(order.status !== "PENDING") {
        console.log(`Skipping order ${orderId}, status=${order.status}`)
        return
    }
    console.log("2")

    const symbol = order.symbol.toUpperCase();
    console.log("just before fetching price from getLivePrice")
    const { price } = await getLivePrice(symbol);
    console.log("executeOrder price",price)
    const orderPrice = price;
    if(!orderPrice || !Number.isFinite(orderPrice)) throw new Error("Invalid market price.")
    console.log("OrderPrice: ",orderPrice)

    if(order.order_type === "LIMIT"){
        if(order.side === "BUY" && orderPrice > order.limit_price || order.side === "SELL" && orderPrice < order.limit_price){
            console.log("Limit condition not met. Skipping")
            return 
        }
    }

    let client = null;
    
    try {
        client = await db.getClient();
        await client.query("BEGIN");

        const lockRes = await client.query(`SELECT status FROM orders WHERE id = $1 FOR UPDATE`, [ orderId ])
        if(lockRes.rows[0].status !== "PENDING"){
            await client.query("ROLLBACK")
            return;
        }
        console.log("Updating Order")
        if(order.side === 'BUY') await updateHoldings( client, order.user_id, symbol, order.quantity, orderPrice)
        else if(order.side === 'SELL') await reduceHoldings( client, order.user_id, symbol, order.quantity)
        console.log("The order gets executed.")
        await client.query(`UPDATE orders SET status = 'EXECUTED', price = $1, executed_at = NOW() WHERE id = $2`, [ orderPrice, orderId ] )
        await client.query(`COMMIT`)
        console.log("order executed:", orderId)
    } catch (error) {
        console.log("The order get Failed.")
        if(client){
            await client.query("ROLLBACK")
            await client.query(`UPDATE orders SET status = 'FAILED' WHERE id = $1`, [ orderId ] )
        }
        throw error;
    } finally {
        if(client) client.release();
    }
}

async function cancelOrder(userId, orderId) {
    const result = await db.query(`UPDATE orders SET status = 'CANCELLED', cancel_reason = 'USER_CANCELLED' WHERE id = $1 AND user_id = $2 AND status = 'PENDING' AND order_type = 'LIMIT' RETURNING id, status`, [ orderId, userId ])
    if(result.rowCount === 0){
        const err = new Error ("Order cannot be cancelled (not found, not pending, or not a limit order)");
        err.status = 400;
        throw err;
    }
    console.log("Order Cancelled Successfully")
    return result.rows[0];
}


async function getOrderHistory(userId) {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at`,[ userId ]);
    return rows;
}

module.exports = { createPendingOrder, getOrderHistory, executeOrder, cancelOrder }