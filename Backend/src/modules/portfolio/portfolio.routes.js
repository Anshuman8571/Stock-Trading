const express = require("express")
const router = express.Router();
const { getMyPortfolio, getPortfolioAnalyticsController } = require("./portfolio.controller");
const authMiddleware  = require("../../middleware/authMiddleware")

router.get("/", authMiddleware, getMyPortfolio);
router.get("/analytics", authMiddleware, getPortfolioAnalyticsController)


module.exports = router;