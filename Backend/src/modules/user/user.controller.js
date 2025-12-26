const { getUserById, userUpdate,changePassword } = require("../user/user.service")
const errorHandler  = require("../../middleware/globalErrorHandler") 


async function getMe(req, res,next) {
    try {
        const user = await getUserById(req.user.userId)
        if(!user) {
            const err = new Error("User does not exist.")
            err.status = 404
            throw err;
        }
        return res.json({success: true, user})
    } catch (error) {
        next(error)
    }
}

async function updateMe(req,res,next) {
    try {
        const { username, email } = req.body;
        const user = await userUpdate(req.user.userId, username, email );
        return res.json({ success: true, user})
    } catch (error) {
        next(error)
    }
}

async function changeMyPassword(req,res,next) {
    try {
        const { oldPassword, newPassword } = req.body;
        if(!oldPassword || !newPassword){
            const err = new Error("Both the passwords are required.")
            err.status = 404
            throw err;
        }
        await changePassword(req.user.userId, oldPassword, newPassword);
        return res.json({ success: true,message: "Password Changed."})
    } catch (error) {
        next(error)
    }
}


module.exports = { getMe, updateMe, changeMyPassword }