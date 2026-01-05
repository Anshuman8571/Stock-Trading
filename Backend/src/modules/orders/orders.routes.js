const express = require("express")
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware")
const { buyStock, sellStock, orderHistory, cancelMyOrder } = require("./orders.controller");
const { orderUpdateSSE } = require("./order.sse.controller");

router.post("/buy", authMiddleware, buyStock)
router.post("/sell", authMiddleware, sellStock)
router.get("/history", authMiddleware, orderHistory)
router.get("/cancel/:orderId", authMiddleware, cancelMyOrder)
router.get("/stream", authMiddleware, orderUpdateSSE)
module.exports = router;
