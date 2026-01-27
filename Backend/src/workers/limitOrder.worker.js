require("dotenv").config();
const db = require("../config/db");
const orderEvents = require("../events/order.events");
const { getLivePrice } = require("../modules/market/market.service");
const { executeOrder } = require("../modules/orders/order.service");
const { updateHoldings, reduceHoldings } = require("../modules/portfolio/portfolio.service")

// async function processLimitOrders() {
//     if(process.env.NODE_ENV === "test") {
//         console.log("Limit worker disabled in test environment");
//         process.exit(0);
//     }
//     console.log("Scanning limit Orders: ")
//     const { rows: expiredOrders } = await db.query(`UPDATE orders SET status = 'CANCELLED', cancel_reason = 'LIMIT EXPIRED' WHERE status = 'PENDING' AND order_type = 'LIMIT' AND expires_at IS NOT NULL AND expires_at <= NOW() OR expires_at IS NULL`);
//     for(const order of expiredOrders){
//         orderEvents.emit("order:update",{
//             orderId:order.id,
//             userId: order.user_id,
//             status: "CANCELLED",
//             reason: "LIMIT_EXPIRED"
//         })
//     }
//     const { rows: symbols } = await db.query(`SELECT DISTINCT symbol FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND expires_at > NOW()`);

//     for(const { symbol } of symbols){
//         try {
//             const { price } = await getLivePrice(symbol)
//             const marketPrice = Number(price);

//             if(!Number.isFinite(marketPrice)) continue;
//             await executeEligibleOrder(symbol, marketPrice);
//         } catch (error) {
//             console.error(`Error processing ${symbol}`, error.message)
//             throw error;
//         }
//     }
// }


// async function executeEligibleOrder(symbol, marketPrice) {
//     const client  = await db.getClient();

//     try {
//         await client.query("BEGIN")
//         const { rows: orders } = await client.query(`SELECT * FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND symbol = $1 AND expires_at > NOW() AND ((side = 'BUY' AND limit_price >= $2) OR (side = 'SELL' AND limit_price <= $2)) FOR UPDATE SKIP LOCKED`, [ symbol, marketPrice ]);

//         for(const order of orders){
//             console.log(`EXECUTING limit order ${order.id}`);

//             if(order.side === "BUY") await updateHoldings(client, order.user_id, symbol, order.quantity, marketPrice);
//             else {
//                 await reduceHoldings(client, order.user_id, symbol, order.quantity)
//             }
//             await client.query(`UPDATE orders SET status = 'EXECUTED', price = $1, executed_at = NOW() WHERE id = $2`, [ marketPrice, order.id ])
//             await client.query("COMMIT")
//         }
//     } catch (error) {
//         await client.query("ROLLBACK");
//         console.error("Limit execution failed:", error)
//         throw error
//     } finally{
//         client.release();
//     }
// }

orderEvents.on("price:update", async ({ symbol }) => {
    try{
        const { rows } = await db.query(`SELECT id FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND symbol = $1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at`, [ symbol ])
        for(const order of orders){
            await executeOrder(order.id)
        }
    } catch(error){
        console.error(`[LIMIT WORKER] Failed for symbol ${symbol}`, error.message)
    }
})