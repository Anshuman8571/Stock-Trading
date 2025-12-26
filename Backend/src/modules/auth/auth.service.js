const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")
const db = require("../../config/db")

const { generateAccessToken, generateRefreshToken } = require("../../utils/token")
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUND || "10", 10)





async function registerUser(email, password) {
    const exist = await db.query(`SELECT id FROM users WHERE email = $1`,[ email ])
    if(exist.rows.length > 0) throw new Error("User already exists.")
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const userId = uuidv4()
    await db.query(`INSERT INTO users (id, email, password) VALUES ($1, $2, $3)`, [userId,email, hashPassword]);
    return { id:userId, email, }
}


async function loginUser(email, password) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [ email ]);
    const user = result.rows[0]
    if(!user) return new Error("User does not exists. Please register with this mail or check mail again.")

    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw new Error("Invalid Credentials");
    }
    const accessToken = generateAccessToken({ userId: user.id })
    const refreshToken = generateRefreshToken({ userId:user.id })
    await db.query(`INSERT INTO refresh_tokens (id, user_id, token) VALUES ($1, $2, $3)`,[ uuidv4(), user.userId, refreshToken ])

    return { user, accessToken, refreshToken }
}

module.exports = { registerUser, loginUser }