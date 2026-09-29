const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()


const authMiddleware = async (req, res, next) => {
    try {
        console.log("Hello test middleware..")
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
        
        const token = req.cookies?.token || bearerToken;
        console.log("Hello test middleware..:  ", token)

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Access denied. Please login first."
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        )

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;