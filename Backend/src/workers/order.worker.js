console.log("Worker file is loaded.....")
const { Worker } = require("bullmq")
const { executeOrder } = require("../modules/orders/order.service")
    
console.log("Worker depenencies loaded")

const worker = new Worker("order-queue", async (job) => {
        console.log("Worker got picked up:", job.data)
        const { orderId } = job.data.orderId;
        await executeOrder(orderId);
    },
    {
        connection: {
            host: "localhost",
            port: 6379
        }
    }
)

console.log("Worker is listening to queue")

worker.on("completed",(job) => {
    console.log("Order executed:", job.data.orderId);
})


worker.on("failed",(job,err)=>{
    console.error("Order failed:", job.data.orderId, err.message )
})