const db = require("../config/db");
const { orderQueue } = require("../queues/order.queue")

async function requeueLimitOrders() {
    if(process.env.NODE_ENV === "test") return;
    const { rows } = await db.query(`SELECT id FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND expires_at IS NOT NULL AND expires_at < NOW()`);
    for(const order of rows){
        await orderQueue.add("execute-order",
            {orderId: order.id},
            { 
                jobId:order.id,
                removeOnComplete: true
            }
        )
    }

    console.log("Re-enqueued limit order: ", rows.length)
}

module.exports = { requeueLimitOrders }