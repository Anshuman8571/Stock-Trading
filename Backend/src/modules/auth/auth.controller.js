const bcrypt = require("bcrypt");
const db = require("../../config/db")
const { registerUser, loginUser } = require("./auth.service")



async function register(req,res,next) {
    try {
        const { email, password, username, phone, fullName } = req.body;
        if(!email || !password || !username) {
            const err = new Error("Email, Password and Username are required")
            err.status = 400
            throw err;
        }
        const user = await registerUser({email, password, username, phone, full_name: fullName});
        res.status(201).json(user)  
    } catch (error) {
        next(error)
    }
}


async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            const err = new Error("Email and Password are required")
            err.status = 400
            throw err;
        }    
        const token = await loginUser(email,password)
        res.json(token)
    } catch (error) {
        next(error)
    }
}

module.exports = { register, login }
