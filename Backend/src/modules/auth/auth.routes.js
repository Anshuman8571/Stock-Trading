const express = require("express")
const { register, login } = require("./auth.controller")
const { validateRegister, validateLogin } = require("../../validators/auth.validator")
const router = express.Router();

router.post("/register", validateRegister,register)
router.post("/login", validateLogin,login)

module.exports = router;