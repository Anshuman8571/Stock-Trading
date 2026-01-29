const db = require("../../config/db")
const { executeOrder } = require("./order.service")

async function executePendingLimitOrder(symbol) {
    const { rows: orders } = await db.query( `SELECT id FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND symbol = $1 ORDER BY created_at`, [ symbol ])
    for(const order of orders){
        await executeOrder(order.id);
    }
}

module.exports = { executePendingLimitOrder }