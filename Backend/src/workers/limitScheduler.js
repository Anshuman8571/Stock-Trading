require("dotenv").config();
const { processLimitOrders } = require("./limitOrder.worker")

console.log("Limit order scheduler started:")

setInterval(async () =>{
    try {
        await processLimitOrders();
    } catch (error) {
        console.error("Scheduler error: ", error.message);
    }
}, 5000);

module.exports = { processLimitOrders }