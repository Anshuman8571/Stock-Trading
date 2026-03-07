const { getUserById, userUpdate, changePassword, deleteUserById } = require("../user/user.service")
const errorHandler = require("../../middleware/globalErrorHandler")
const db = require("../../config/db")

async function getMe(req, res, next) {
    try {
        const user = await getUserById(req.user.userId)
        if (!user) {
            const err = new Error("User does not exist.")
            err.status = 404
            throw err;
        }
        return res.json({ success: true, user })
    } catch (error) {
        next(error)
    }
}

async function updateMe(req, res, next) {
    try {
        const { username, email } = req.body;
        const user = await userUpdate(req.user.userId, username, email);
        return res.json({ success: true, user })
    } catch (error) {
        next(error)
    }
}

async function changeMyPassword(req, res, next) {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            const err = new Error("Both the passwords are required.")
            err.status = 400
            throw err;
        }
        await changePassword(req.user.userId, oldPassword, newPassword);
        return res.json({ success: true, message: "Password Changed." })
    } catch (error) {
        next(error)
    }
}

async function getNotifications(req, res, next) {
    try {
        const userId = req.user.userId;
        const { rows } = await db.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20", [userId])
        res.json({ success: true, notifications: rows })
    } catch (error) {
        next(error);
    }
}

async function markNotifications(req, res, next) {
    try {
        const { id } = req.params;
        await db.query("UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2", [id, req.user.userId])
        res.json({ success: true })
    } catch (error) {
        next(error);
    }
}

async function deleteMe(req, res, next) {
    try {
        const result = await deleteUserById(req.user.userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = { getMe, updateMe, changeMyPassword, getNotifications, markNotifications, deleteMe }