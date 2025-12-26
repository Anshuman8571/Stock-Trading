const { Queue } = require("bullmq");
const orderQueue = new Queue("order-queue", {
    connection: {
        host: "localhost",
        port: 6379
    }
})

module.exports = { orderQueue }