const { 
    registerUser, 
    loginUser,
    setupPIN,
    quickLoginWithPIN,
    disablePIN,
    checkPINStatus
} = require("./auth.service");

// ============================================
// TRADITIONAL REGISTRATION
// ============================================
async function register(req, res, next) {
    try {
        const { email, password, username, phone, fullName } = req.body;
        if(!email || !password || !username) {
            const err = new Error("Email, Password and Username are required")
            err.status = 400
            throw err;
        }
        const user = await registerUser({email, password, username, phone, full_name: fullName});
        res.status(201).json({
            success: true,
            message: "Registration successful",
            user
        })  
    } catch (error) {
        next(error)
    }
}

// ============================================
// TRADITIONAL LOGIN
// ============================================
async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        if(!email || !password) {
            const err = new Error("Email and Password are required")
            err.status = 400
            throw err;
        }    
        const result = await loginUser(email, password)
        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        next(error)
    }
}

// ============================================
// CHECK PIN STATUS (Before showing PIN option)
// ============================================
async function checkPIN(req, res, next) {
    try {
        const { email } = req.query;
        
        if (!email) {
            const err = new Error("Email is required");
            err.status = 400;
            throw err;
        }

        const status = await checkPINStatus(email);
        res.json(status);
    } catch (error) {
        next(error);
    }
}

// ============================================
// SETUP PIN (After First Login - Protected)
// ============================================
async function createPIN(req, res, next) {
    try {
        const { pin } = req.body;
        const userId = req.user.userId;
        
        if (!pin) {
            const err = new Error("PIN is required");
            err.status = 400;
            throw err;
        }

        const result = await setupPIN(userId, pin);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

// ============================================
// QUICK LOGIN WITH PIN
// ============================================
async function pinLogin(req, res, next) {
    try {
        const { email, pin } = req.body;
        
        if (!email || !pin) {
            const err = new Error("Email and PIN are required");
            err.status = 400;
            throw err;
        }

        const result = await quickLoginWithPIN(email, pin);
        
        res.json({
            success: true,
            message: "Quick login successful",
            ...result
        });
    } catch (error) {
        next(error);
    }
}

// ============================================
// DISABLE PIN (Protected)
// ============================================
async function removePIN(req, res, next) {
    try {
        const userId = req.user.userId;
        const result = await disablePIN(userId);
        res.json(result);
    } catch (error) {
        next(error);
    }
}

module.exports = { 
    register, 
    login,
    checkPIN,
    createPIN,
    pinLogin,
    removePIN
};