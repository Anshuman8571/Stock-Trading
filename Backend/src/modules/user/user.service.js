const db = require("../../config/db")
const bcrypt = require("bcrypt");
const errorHandler = require("../../middleware/globalErrorHandler");

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || 10, 10); 

async function getUserById(id) {
    const q = `SELECT id, username, email FROM users WHERE id = $1`;
    const { rows } = await db.query(q, [ id ]);
    return rows[0] || null;
}

async function userUpdate(userId, username, email) {
    const q =  `
        UPDATE users
        SET username = COALESCE($2, username),
            email = COALESCE($3, email)
        WHERE id = $1
        RETURNING id, username, email
    `;

    const { rows } = await db.query(q,[ userId, username, email ]);
    return rows[0];
}

async function changePassword(userId, oldPassword, newPassword) {
    const q = `
        SELECT password
        FROM users 
        WHERE id = $1    
    `
    const { rows } = await db.query(q,[ userId ])
    if(rows.length === 0){
        const err = new Error("User not found")
        err.status = 404
        throw err;
    }

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password)
    if(!isMatch){
        const err = new Error("Old password is wrong.")
        err.status = 400
        throw err;
    }

    const newHash = await bcrypt.hash(newPassword,SALT_ROUNDS)
    await db.query(`UPDATE users SET password = $1 WHERE id = $2`,[ newHash, userId ])
    return true;
}

module.exports = { changePassword, userUpdate, getUserById }