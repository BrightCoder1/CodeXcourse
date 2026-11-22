const jwt = require("jsonwebtoken");
const Student = require("../models/Student.models");

const studentAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = req.cookies?.studentToken ||
            (authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null);

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please log in."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "student" || !decoded.studentId) {
            return res.status(403).json({
                success: false,
                message: "Access denied. Students only."
            });
        }

        const student = await Student.findById(decoded.studentId);
        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Student account not found. Please log in again."
            });
        }

        req.student = student;
        return next();
    } catch (error) {
        if (error.name !== "JsonWebTokenError" &&
            error.name !== "TokenExpiredError") {
            console.error("Student authentication error:", error);
            return res.status(500).json({
                success: false,
                message: "Unable to verify student authentication."
            });
        }

        return res.status(401).json({
            success: false,
            message: "Invalid or expired session. Please log in again."
        });
    }
};

module.exports = studentAuth;
