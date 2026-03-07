require("dotenv").config();
const express = require("express")
const cors = require("cors")
const authRoutes = require("./modules/auth/auth.routes")
const userRoutes = require("./modules/user/user.routes")
const globalErrorHandler = require("./middleware/globalErrorHandler")
const portfolioRoutes = require("../src/modules/portfolio/portfolio.routes")
const orderRoutes = require("./modules/orders/orders.routes")
const marketRoutes = require("./modules/market/market.routes")
const { requeueLimitOrders } = require("./cron/limitOrder.cron")
const { recoverOrders } = require("./recovery/recoveryOrders")
const aiRoutes = require("./ai/routes/ai.routes")
const walletRoutes = require("./modules/wallet/wallet.routes")
const app = express();

app.set('trust proxy', 1);

app.use(cors({
    origin: "*",
    credentials: true
}))
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({ status: "Backend Running." })
})

if (process.env.NODE_ENV !== 'test') {
    setInterval(requeueLimitOrders, 1000 * 60 * 60 * 6);
}

app.use("/api/ai", aiRoutes)
app.use("/api/portfolio", portfolioRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)
app.use("/api/wallet", walletRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/market", marketRoutes)

app.use(globalErrorHandler)

module.exports = app;