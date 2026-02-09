const express = require("express")
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware")
const { buyStock, sellStock, orderHistory, cancelMyOrder } = require("./orders.controller");
const { orderUpdateSSE } = require("./order.sse.controller");
const { validateBuyOrder, validateSellOrder } = require("../../validators/order.validators")

router.post("/buy", authMiddleware, validateBuyOrder , buyStock)
router.post("/sell", authMiddleware, validateSellOrder, sellStock)
router.get("/history", authMiddleware, orderHistory)
router.get("/cancel/:orderId", authMiddleware, cancelMyOrder)
router.get("/stream", authMiddleware, orderUpdateSSE)
module.exports = router;
