const express = require("express");
const router = express.Router();
const { registerUser, getEmployees, getEmployeeById, editEmployee, deleteEmployee, loginUser, getProfile, getlogout, updateProfile, deleteProfile } = require("./controllers/User.controller.js");
const authMiddleware = require("./middleware/auth.middleware.js")


router.post("/register", registerUser);
router.get("/get/employee", getEmployees);
router.get("/get/employee/:id", getEmployeeById);
router.put("/update/employee/:id", editEmployee)

router.post("/login", loginUser)
router.get("/profile", authMiddleware, getProfile);
router.get("/logout", getlogout)
router.put("/update", authMiddleware, updateProfile);
router.delete("/delete", authMiddleware, deleteProfile);
router.delete("/delete/employee/:id", deleteEmployee);


router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Page Not Found"
    });
});



module.exports = router;