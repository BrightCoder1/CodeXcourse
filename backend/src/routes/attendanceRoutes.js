const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const {
  markAttendance,
  markBulkAttendance,
  checkIn,
  checkOut,
  getAttendance,
  getUserAttendance,
  getAttendanceSummary,
  updateAttendance,
  deleteAttendance,
} = require("../controllers/attendanceController");

const router = express.Router();

// JWT middleware ke baad role claim se access check karo.
const authorize =
  (...roles) =>
  (req, res, next) => {
    const role = req.user && (req.user.role || req.user.emp_role);
    if (!role || !roles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "Is action ki permission nahi hai.",
      });
    }
    return next();
  };

router.post("/mark", authMiddleware, authorize("admin", "teacher"), markAttendance);
router.post(
  "/mark-bulk",
  authMiddleware,
  authorize("admin", "teacher"),
  markBulkAttendance
);
router.post("/check-in", authMiddleware, authorize("employee"), checkIn);
router.put("/check-out", authMiddleware, authorize("employee"), checkOut);
router.get("/", authMiddleware, authorize("admin"), getAttendance);
router.get("/summary", authMiddleware, authorize("admin"), getAttendanceSummary);
router.get("/user/:userId", authMiddleware, getUserAttendance);
router.put("/:id", authMiddleware, authorize("admin"), updateAttendance);
router.delete("/:id", authMiddleware, authorize("admin"), deleteAttendance);

module.exports = router;
