const { getBalance, initiateDeposit, verifyDeposit } = require("./wallet.service");

async function checkBalance(req, res, next) {
    try {
        const balance = await getBalance(req.user.userId);
        res.json({ success: true, balance })
    } catch (error) {
        next(error);
    }
}

async function depositAmount(req, res, next) {
    try {
        const { amount } = req.body;
        const result = await initiateDeposit(req.user.userId, amount);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
}

async function depositVerification(req, res, next) {
    try {
        const { otp } = req.body;
        const result = await verifyDeposit(req.user.userId, otp);
        res.json(result); 
    } catch (error) {
        next(error);
    }
}

module.exports = { checkBalance, depositAmount, depositVerification };