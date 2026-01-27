const db = require("../config/db")
const { orderQueue } = require("../queues/order.queue")

const PROCESSING_TIMEOUT_MINUTES = 2;

async function recoverOrders() {
    console.log("Starting order recovery...")
    const { rows: pendingLimitOrders } = await db.query(`SELECT id FROM orders WHERE status = 'PENDING' AND order_type = 'LIMIT' AND (expires_at IS NULL OR expires_at > NOW())`);

    for(const order of pendingLimitOrders){
        await orderQueue.add("execute-order",
            { orderId: order.id},
            {
                attempts: 3,
                backoff: { type: "exponential", delay: 5000 },
                removeOnComplete: true,
                removeOnFail: false
            }
        )
    }

    console.log(`Re-enqueued ${pendingLimitOrders.length}`)

    const failRes = await db.query(`UPDATE orders SET status = 'FAILED', failure_reason = 'WORKER_CRASH_RECOVERY', updated_at = NOW() 
                                    WHERE status = 'PROCESSING' AND updated_at < NOW() - ($1 * INTERVAL '1 minute')
                                    RETURNING id, order_type
                                    `,[PROCESSING_TIMEOUT_MINUTES])

    console.log(`Failed ${failRes.rowCount} stuck PROCESSING orders`)
    console.log("Order recovery complete")
}

module.exports = { recoverOrders }