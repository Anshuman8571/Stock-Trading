const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const {  checkBalance, depositAmount, depositVerification  } = require("./wallet.controller");

router.use(authMiddleware);
router.get("/balance", checkBalance);;
router.post("/deposit/init", depositAmount);
router.post("/deposit/verify", depositVerification);

module.exports = router;