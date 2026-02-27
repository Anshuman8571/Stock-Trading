const jwt = require("jsonwebtoken");
function authMiddleware(req, res, next){
    let token;
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith("Bearer ")) token = authHeader.split(" ")[1];
    else if(req.query && req.query.token) token = req.query.token;
    if(!token) return res.status(401).json({ error: "Authorizatrion Token Missing" })

    // if(!authHeader) return res.status(401).json({ error: "Authorization header missing."});
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error:"Invalid or expired token." })
    }
}

module.exports = authMiddleware