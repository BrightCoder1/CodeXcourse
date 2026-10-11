const express = require("express");
const router = express.Router();
const {
  registerUser,
  getEmployees,
  getEmployeeById,
  editEmployee,
  deleteEmployee,
  loginUser,
  getProfile,
  getlogout,
  updateProfile,
  deleteProfile,
} = require("./controllers/User.controller.js");

const adminAuth = require("./middleware/adminAuth.js");

// Public Auth routes
router.post("/admin/login", loginUser);
router.get("/logout", getlogout);

// Admin-only management routes
router.post("/register",  registerUser);
router.get("/get/employee", getEmployees);
router.get("/get/employee/:id", getEmployeeById);
router.put("/update/employee/:id", editEmployee);
router.delete("/delete/employee/:id", deleteEmployee);


// Admin Profile verification routes
router.get("/profile", adminAuth, getProfile);
router.put("/update", adminAuth, updateProfile);
router.delete("/delete", adminAuth, deleteProfile);


// 404 Fallback
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});

module.exports = router;