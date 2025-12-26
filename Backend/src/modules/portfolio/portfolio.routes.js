const express = require("express")
const router = express.Router();
const { getMyPortfolio } = require("./portfolio.controller");
const authMiddleware  = require("../../middleware/authMiddleware")

router.get("/", authMiddleware, getMyPortfolio);

module.exports = router;