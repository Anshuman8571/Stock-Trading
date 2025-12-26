const express = require("express")
const cors = require("cors")
const authRoutes  = require("./modules/auth/auth.routes")
const userRoutes = require("./modules/user/user.routes")
const globalErrorHandler = require("./middleware/globalErrorHandler")
const portfolioRoutes = require("../src/modules/portfolio/portfolio.routes")
const orderRoutes = require("./modules/orders/orders.routes")
const marketRoutes = require("./modules/market/market.routes")
const app = express();
app.use(cors())
app.use(express.json());
app.use(globalErrorHandler)
app.get("/health", (req,res) => {
    res.json({status: "Backend Running."})
})

app.use("/api/portfolio",portfolioRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/orders",orderRoutes)
app.use("/api/market",marketRoutes)

module.exports = app;