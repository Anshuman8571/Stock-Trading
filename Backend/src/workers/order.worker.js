require("dotenv").config();
console.log("Worker file is loaded.....")
const { Worker } = require("bullmq")
const { executeOrder } = require("../modules/orders/order.service");
const { connectRedis } = require("../config/redis");
console.log("Worker depenencies loaded")

async function startWorker() {
    try {
        await connectRedis();
        console.log("Worker Redis connected.")
        const worker = new Worker("order-queue", async (job) => {
            console.log("Worker got picked up:", job.data)
            const { orderId } = job.data;
            if(!orderId){
                console.log("[ORDER WORKER] Missing orderId in Job", job.data)
            }
            console.log("orderId: ", orderId)
            await executeOrder(orderId);
            console.log("Completed Execution.")
        },
        {
            connection: {
                url: process.env.REDIS_URL
            }
        })
        console.log("Woker is listening to queue")

        worker.on("completed",(job) => {
            console.log("Order executed:", job.data.orderId);
        })


        worker.on("failed",(job,err)=>{
            console.error("Order failed:", job.data.orderId, err.message )
        })

        
    } catch (error) {
        console.error("Failed to start Worker", error);
    }
}

startWorker();
