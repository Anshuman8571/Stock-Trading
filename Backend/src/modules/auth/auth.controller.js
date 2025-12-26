const bcrypt = require("bcrypt");
const db = require("../../config/db")
const { registerUser, loginUser } = require("./auth.service")



async function register(req,res) {
    try {
        const { email, password } = req.body;
        if(!email || !password) return res.status(400).json({ error: "Email and Password are required." })
        const user = await registerUser(email, password);
        res.status(201).json(user)  
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}


async function login(req, res) {
    try {
        const { email, password } = req.body;
        if(!email || !password) return res.status(400).json({ error: "Email and Password are required." })    
        const token = await loginUser(email,password)
        res.json(token)
    } catch (error) {
        res.status(401).json({ error: error.message })
    }
}

module.exports = { register, login }
