const { Queue } = require("bullmq");
const orderQueue = new Queue("order-queue", {
    connection: {
        url: process.env.REDIS_URL
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: true,
        removeOnFail: false
    }
})

module.exports = { orderQueue }