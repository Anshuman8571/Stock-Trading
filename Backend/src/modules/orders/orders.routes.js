const express = require("express")
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware")
const { buyStock, sellStock, orderHistory } = require("./orders.controller");

router.post("/buy", authMiddleware, buyStock)
router.post("/sell", authMiddleware, sellStock)
router.get("/history", authMiddleware, orderHistory)

module.exports = router;
