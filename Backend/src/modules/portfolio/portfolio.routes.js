const express = require("express")
const router = express.Router();
const { getMyPortfolio, getPortfolioAnalyticsController } = require("./portfolio.controller");
const authMiddleware  = require("../../middleware/authMiddleware");
const { explainMyPortfolio } = require("./portfolio.ai.controller");

router.get("/", authMiddleware, getMyPortfolio);
router.get("/analytics", authMiddleware, getPortfolioAnalyticsController)
router.get("/ai/explain", authMiddleware, explainMyPortfolio)

module.exports = router;