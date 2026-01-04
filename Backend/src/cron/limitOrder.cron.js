const db = require("../config/db");
const { orderQueue } = require("../queues/order.queue")

async function requeueLimitOrders() {
    const { rows } = await db.query(`SELECT id FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT'`);
    for(const order of rows){
        await orderQueue.add("execute-order",
            {orderid: order.id},
            { removeOnComplete: true }
        )
    }

    console.log("Re-enqueued limit order: ", rows.length)
}

module.exports = { requeueLimitOrders }