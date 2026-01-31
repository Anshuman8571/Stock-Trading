const db = require("../../config/db")
const { v4: uuidv4 } = require("uuid")
const { reduceHoldings, updateHoldings } = require("../portfolio/portfolio.service")
const { getLivePrice } = require("../market/market.service")
// const { updateHoldings } = require("../portfolio/portfolio.service") 
// const orderEvents = require("../../events/order.events")
const { publishOrderEvent } = require("../../events/order.pubsub")
const { getPriceSnapshot } = require("../market/market.snapshot.service")

async function createPendingOrder(userId, symbol, quantity, side, orderType = "MARKET", limitPrice=null, validForMinutes = 30) {
    const normalisedSymbol = symbol.trim().toUpperCase();
    const orderId = uuidv4();
    const expiresAt = orderType === "LIMIT"
                        ? new Date(Date.now() + validForMinutes * 60 * 1000)
                        : null;
    const result = await db.query(`INSERT INTO orders (id, user_id, symbol, quantity, side,  status, order_type, limit_price, expires_at) VALUES ($1, $2, $3, $4, $5, 'PENDING', $6, $7, $8)`, [ orderId, userId, normalisedSymbol, quantity, side, orderType, limitPrice, expiresAt ] );
    console.log("Pending Order is created", orderId)
    return { id: orderId }
}
//Separated executution logic
async function executeOrder(orderId) {
    console.log("Execution starts....", orderId)

    let client = null;
    let order = null;
    try {
        client = await db.getClient();
        await client.query("BEGIN");

        const claimRes = await client.query(`UPDATE orders SET status = 'PROCESSING', updated_at = NOW() WHERE id = $1 AND status = 'PENDING' RETURNING *`, [ orderId ])
        if(claimRes.rowCount === 0){
            await client.query("ROLLBACK");
            console.log(`Order ${orderId} not claimable (not pending)`);
            return;
        }

        order = claimRes.rows[0];
        const symbol = order.symbol.toUpperCase();
        console.log("Fetching price for:",symbol)
        
        const { price, source, ageMS } = await getPriceSnapshot(symbol);
        if(!price || !Number.isFinite(price)) throw new Error("Invalid Market Price.")
        // await client.query(`UPDATE orders SET status = 'PROCESSING', updated_at = NOW() WHERE id = $1`, [ orderId ])
        // Limit Order Validation
        if(order.order_type === "LIMIT"){
            const limitNotMet = 
                (order.side === "BUY" && price > order.limit_price) ||
                (order.side === "SELL" && price < order.limit_price);
            if(limitNotMet){
                await client.query(`UPDATE orders SET status = 'PENDING', updated_at = NOW() WHERE id = $1`, [ orderId ])
                await client.query("COMMIT");
                console.log("Limit condition not met, reverting to PENDING")
                return;
            }
        } 

        // Update holdings inside the transation
        if(order.side === "BUY"){
            await updateHoldings(client, order.user_id, symbol, order.quantity, price)
        } else {
            await reduceHoldings(client, order.user_id, symbol, order.quantity);
        }

        // Finalize Order
        await client.query(`UPDATE orders SET status = 'EXECUTED', price = $1, executed_at = NOW(), updated_at = NOW() WHERE id = $2`,[ price, orderId ])
        await client.query("COMMIT");
        
        await createNotification(order.user_id, "Order Executed", `Your ${order.side} order for ${order.symbol} was executed at ₹${price}`)
        await publishOrderEvent({
            orderId,
            userId: order.user_id,
            side: order.side,
            orderType: order.order_type,
            status: "EXECUTED",
            price,
            priceSource: source,
            snapshotAgeMS: ageMS
        })
        console.log("Order Executed Successfully");

    } catch (error) {
        console.log("The order get Failed.", orderId)
        if(client){
            console.log("Getting Rollback")
            await client.query("ROLLBACK")
            await client.query(`UPDATE orders SET status = 'FAILED', failure_reason = $1, updated_at = NOW() WHERE id = $2 AND status IN ('PROCESSING')`, [ error.message, orderId ] )
        }
        if(order){
            await createNotification(order.user_id,"Order Failed",`Your order for ${ order.symbol } failed. Reason: ${ error.message }`)

        }
        if(!order) {
            const res = await db.query("SELECT * FROM orders WHERE id = $1", [ orderId ])
            order = res.rows[0] ?? null;
        }
        await publishOrderEvent({
            orderId,
            userId: order.user_id,
            side: order.side,
            orderType: order.order_type,
            status: "FAILED",
            reason: error.message
        })
        throw error;
    } finally {
        if(client) client.release();
    }
}

async function cancelOrder(userId, orderId) {
    const result = await db.query(`UPDATE orders SET status = 'CANCELLED', cancel_reason = 'USER_CANCELLED', updated_at = NOW() WHERE id = $1 AND user_id = $2 AND status = 'PENDING' AND order_type = 'LIMIT' RETURNING id, status`, [ orderId, userId ])
    if(result.rowCount === 0){
        const err = new Error ("Order cannot be cancelled (not found, not pending, or not a limit order)");
        err.status = 400;
        throw err;
    }
    console.log("Order Cancelled Successfully")
    // orderEvents.emit("order:update",{
    //     orderId,
    //     userId,
    //     side: result.rows[0].side,
    //     status: "CANCELLED",
    //     reason: "USER_CANCELLED"
    // })
    await publishOrderEvent({
        orderId,
        userId,
        side: result.rows[0].side,
        orderType: "LIMIT",
        status: "CANCELLED",
        reason: "USER_CANCELLED"
    })
    await createNotification(userId, "Order Cancelled", "You successfully cancelled your Limit Order")
    return result.rows[0];
}


async function getOrderHistory(userId) {
    const { rows } = await db.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at`,[ userId ]);
    return rows;
}

async function createNotification(userId, title, message) {
    try {
        await db.query(`INSERT INTO notifications (user_id, title, message) VALUES ($1, $2, $3)`, [ userId, title, message ])
    } catch (error) {
        console.error("Failed to create notifications", err)
    }
}
module.exports = { createPendingOrder, getOrderHistory, executeOrder, cancelOrder }