require("dotenv").config();
const db = require("../config/db");
const orderEvents = require("../events/order.events");
const { getLivePrice } = require("../modules/market/market.service");
const { executeOrder } = require("../modules/orders/order.service");
const { updateHoldings, reduceHoldings } = require("../modules/portfolio/portfolio.service")

orderEvents.on("price:update", async ({ symbol }) => {
    try{
        const { rows: orders } = await db.query(`SELECT id FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND symbol = $1 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at`, [ symbol ])
        for(const order of orders){
            await executeOrder(order.id)
        }
    } catch(error){
        console.error(`[LIMIT WORKER] Failed for symbol ${symbol}`, error.message)
    }
})