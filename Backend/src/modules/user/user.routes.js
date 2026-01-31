const express = require("express");
const router = express.Router();
const { getMe,updateMe, changeMyPassword, getNotifications, markNOtifications } = require("./user.controller");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/me",authMiddleware,getMe);
router.post("/update-user",authMiddleware,updateMe)
router.post("/change-password",authMiddleware,changeMyPassword)
router.get("/notifications", authMiddleware, getNotifications);
router.get("/notifications/:id/read", authMiddleware, markNOtifications)

module.exports = router;