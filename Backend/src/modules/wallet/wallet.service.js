const db = require("../../config/db");
const { redis } = require("../../config/redis");

const OTP_EXPIRY = 300; // 5 minutes

// Mock SMS Sender
async function sendSMS(phone, message) {
    console.log(`[SMS MOCK] To: ${phone} | Message: ${message}`);
}

async function getBalance(userId) {
    const { rows } = await db.query(`SELECT wallet_balance FROM users WHERE id = $1`, [userId]);
    return rows[0] ? Number(rows[0].wallet_balance) : 0;
}

async function initiateDeposit(userId, amount) {
    if (amount <= 0) throw new Error("Amount must be positive");

    const { rows } = await db.query(`SELECT phone FROM users WHERE id = $1`, [userId]);
    
    if (!rows.length || !rows[0].phone) throw new Error("User phone number not found");

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
    const key = `deposit_otp:${userId}`;

    await redis.setEx(key, OTP_EXPIRY, JSON.stringify({ otp, amount }));

    await sendSMS(rows[0].phone, `Your OTP for depositing Rs. ${amount} is ${otp}. Valid for 5 mintes`);

    return { message: "OTP sent to registered phone number", validFor: "5 minutes" };
}

async function verifyDeposit(userId, otp) {
    const key = `deposit_otp:${userId}`;
    const data = await redis.get(key);

    if (!data) throw new Error("OTP expired or invalid");

    const { otp: storedOtp, amount } = JSON.parse(data);

    // ✅ FIX: Force String conversion and trim whitespace to prevent false negatives
    if (String(storedOtp).trim() !== String(otp).trim()) {
        throw new Error("Incorrect OTP");
    }

    // Atomic Balance Update
    await db.query(`UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2`, [amount, userId]);

    // Clear OTP
    await redis.del(key);

    return { success: true, newBalance: await getBalance(userId) };
}

module.exports = { getBalance, initiateDeposit, verifyDeposit };