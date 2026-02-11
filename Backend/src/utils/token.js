const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? "test-secret-key" : undefined);
function generateAccessToken(payload){
    if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "15m" })
}

function generateRefreshToken(payload){
    if (!JWT_SECRET) throw new Error("JWT_SECRET is missing");
    return jwt.sign(payload, JWT_SECRET, { expiresIn:"7d" })
}

module.exports = { generateAccessToken, generateRefreshToken }