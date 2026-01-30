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
            console.log(`JOb ${job.id} Picked up. OrderID : ${ job.data.orderId }`)
            const { orderId } = job.data;
            if(!orderId){
                console.log("[ORDER WORKER] Missing orderId in Job", job.data)
                throw new Error("Missing OrderId")
            }
            await executeOrder(orderId);
            console.log(`Job ${job.is} Completed.`)
        },
        {
            connection: {
                url: process.env.REDIS_URL,
                reconnectOnError: (err) =>{
                    const targetError = "READONLY";
                    if(err.message.slice(0, targetError.length) === targetError){
                        return true;
                    }
                    return 2;
                }
            },
            concurrency: 5,
            lockDuration: 30000
        })
        console.log("Woker is listening to queue")

        worker.on("completed",(job) => {
            console.log("Order executed:", job.data.orderId);
        })


        worker.on("failed",(job,err)=>{
            console.error("Order failed:", job.data.orderId, err.message )
        })

        worker.on("error", (err) =>{
            console.error("Worker encountered an Error:", err)
        })

        const gracefulShutdown = async (signal) =>{
            console.log(`Recieved ${signal}, closing worker...`)
            try {
                await worker.close();
                console.log("BullMQ worker closed.")

                await db.close()
                console.log("Database pool closed.")

                if(redis.isOpen){
                    await redis.quit();
                    console.log("Shared Redis connection closed.")
                }
                console.log("Graceful shutdown complete/.")
                process.exit(0)
            } catch (error) {
                console.error("Error during shutdown: ", error);
                process.exit(1);
            }
        };
        process.on("SIGINT",() => gracefulShutdown("SIGINT"));
        process.on("sigterm", () => gracefulShutdown("SIGTERM"));
        
    } catch (error) {
        console.error("Failed to start Worker", error);
        process.exit(1)
    }
}

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, 'reason:', reason);
})

process.on("uncaughtException", (error) =>{
    console.error("Uncaught Exxception", error);
    process.exit(1);
})

startWorker();
