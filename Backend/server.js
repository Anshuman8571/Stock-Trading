const app = require("./src/app");
const dotenv = require("dotenv");
const { recoverOrders } = require("./src/recovery/recoveryOrders");
const { requeueLimitOrders } = require("./src/cron/limitOrder.cron");
dotenv.config()
const PORT = process.env.PORT || 3000;


(async () => {
    try {
        await recoverOrders();
        requeueLimitOrders();
        setInterval(requeueLimitOrders, 6*60*60*1000);
        app.listen(PORT, () =>{
            console.log(`Backend Server is running on port ${PORT}`)
        })
    } catch (error) {
        console.error("Startup Failed", error);
        process.exit(1);
    }
})()
