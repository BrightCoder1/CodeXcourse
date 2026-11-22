const jwt = require("jsonwebtoken");
const User = require("../models/user.models");

const staffAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token =
      req.cookies?.token ||
      (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid session. Please log in again.",
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user || !["admin", "employee"].includes(user.emp_role)) {
      return res.status(401).json({
        success: false,
        message: "Staff account not found. Please log in again.",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name !== "JsonWebTokenError" &&
        error.name !== "TokenExpiredError") {
      console.error("Staff authentication error:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to verify staff authentication.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or expired session. Please log in again.",
    });
  }
};

module.exports = staffAuth;
