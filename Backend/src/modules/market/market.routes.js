const express = require("express")
const router = express.Router()
const { getPrice } = require("./market.controller");
const authMiddleware = require("../../middleware/authMiddleware")

router.get("/price/:symbol", authMiddleware, getPrice)

module.exports = router