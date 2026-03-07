const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")
const db = require("../../config/db")
const { generateAccessToken, generateRefreshToken } = require("../../utils/token")

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUND || "10", 10)

// ============================================
// TRADITIONAL EMAIL/PASSWORD REGISTRATION
// ============================================
async function registerUser({ email, password, username, phone, full_name }) {
    const exist = await db.query(`SELECT id FROM users WHERE email = $1`, [email])
    if (exist.rows.length > 0) {
        const error = new Error("User already exist with this username or email");
        error.status = 400;
        throw error;
    }
    const hashPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const userId = uuidv4()
    await db.query(
        `INSERT INTO users (id, email, password, username, phone, full_name) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, email, hashPassword, username, phone, full_name]
    );

    return { userId, email, username };
}

// ============================================
// TRADITIONAL EMAIL/PASSWORD LOGIN
// ============================================
async function loginUser(email, password) {
    const result = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    const user = result.rows[0]
    if (!user) {
        const err = new Error("User does not exist. Please register.");
        err.status = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        const err = new Error("Invalid credentials.");
        err.status = 401;
        throw err;
    }

    const accessToken = generateAccessToken({ userId: user.id })
    const refreshToken = generateRefreshToken({ userId: user.id })
    await db.query(`INSERT INTO refresh_tokens (id, user_id, token) VALUES ($1, $2, $3)`, [uuidv4(), user.id, refreshToken])

    return {
        user: {
            id: user.id,
            email: user.email,
            username: user.username,
            pin_enabled: user.pin_enabled || false
        },
        accessToken,
        refreshToken
    }
}

// ============================================
// GROWW-STYLE PIN SETUP (After First Login)
// ============================================
async function setupPIN(userId, pin) {
    try {
        // Validate PIN (must be 4 digits like Groww)
        if (!/^\d{4}$/.test(pin)) {
            throw new Error("PIN must be exactly 4 digits");
        }

        // Hash PIN for security
        const hashedPIN = await bcrypt.hash(pin, SALT_ROUNDS);

        // Store PIN and enable it
        await db.query(
            `UPDATE users SET pin = $1, pin_enabled = true WHERE id = $2`,
            [hashedPIN, userId]
        );

        return {
            success: true,
            message: "PIN setup successful. You can now use PIN for quick login."
        };
    } catch (error) {
        console.error("Setup PIN Error:", error);
        throw error;
    }
}

// ============================================
// GROWW-STYLE QUICK LOGIN WITH PIN
// ============================================
async function quickLoginWithPIN(email, pin) {
    try {
        // Get user by email
        const result = await db.query(
            `SELECT * FROM users WHERE email = $1 AND pin_enabled = true`,
            [email]
        );

        const user = result.rows[0];
        if (!user) {
            throw new Error("PIN not set up for this account");
        }

        // Verify PIN
        const isMatch = await bcrypt.compare(pin, user.pin);
        if (!isMatch) {
            throw new Error("Invalid PIN");
        }

        // Generate tokens
        const accessToken = generateAccessToken({ userId: user.id });
        const refreshToken = generateRefreshToken({ userId: user.id });

        await db.query(
            `INSERT INTO refresh_tokens (id, user_id, token) VALUES ($1, $2, $3)`,
            [uuidv4(), user.id, refreshToken]
        );

        return {
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                pin_enabled: true
            },
            accessToken,
            refreshToken
        };
    } catch (error) {
        console.error("PIN Login Error:", error);
        throw error;
    }
}

// ============================================
// DISABLE PIN
// ============================================
async function disablePIN(userId) {
    await db.query(
        `UPDATE users SET pin = NULL, pin_enabled = false WHERE id = $1`,
        [userId]
    );
    return { success: true, message: "PIN disabled" };
}

// ============================================
// CHECK IF USER HAS PIN
// ============================================
async function checkPINStatus(email) {
    const result = await db.query(
        `SELECT pin_enabled FROM users WHERE email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        return { exists: false, pin_enabled: false };
    }

    return {
        exists: true,
        pin_enabled: result.rows[0].pin_enabled || false
    };
}

module.exports = {
    registerUser,
    loginUser,
    setupPIN,
    quickLoginWithPIN,
    disablePIN,
    checkPINStatus
};