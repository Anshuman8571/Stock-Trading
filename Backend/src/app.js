require("dotenv").config();
const express = require("express")
const cors = require("cors")
const authRoutes  = require("./modules/auth/auth.routes")
const userRoutes = require("./modules/user/user.routes")
const globalErrorHandler = require("./middleware/globalErrorHandler")
const portfolioRoutes = require("../src/modules/portfolio/portfolio.routes")
const orderRoutes = require("./modules/orders/orders.routes")
const marketRoutes = require("./modules/market/market.routes")
const { requeueLimitOrders } = require("./cron/limitOrder.cron")
const { recoverOrders } = require("./recovery/recoveryOrders")
const app = express();
app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(express.json());
app.get("/health", (req,res) => {
    res.json({status: "Backend Running."})
})


setInterval(requeueLimitOrders, 1000 * 60 * 60 * 6);
app.use("/api/portfolio",portfolioRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/orders",orderRoutes)
app.use("/api/market",marketRoutes)


app.use(globalErrorHandler)


// (async () => {
//     try {
//         await recoverOrders();
//     } catch (error) {
//         console.log("Startup recovery failed", error)
//     }

// })();


module.exports = app;