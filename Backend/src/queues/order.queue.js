const { Queue } = require("bullmq");
const orderQueue = new Queue("order-queue", {
    connection: {
        url: process.env.REDIS_URL
    }
})

module.exports = { orderQueue }