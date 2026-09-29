const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getProfile, getlogout, updateProfile, deleteProfile } = require("./controllers/User.controller.js");
const authMiddleware = require("./middleware/auth.middleware.js")


router.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello, Home page..."
    });
});

router.post("/register", registerUser);
router.post("/login", loginUser)
router.get("/profile", authMiddleware, getProfile);
router.get("/logout", getlogout)
router.put("/update", authMiddleware, updateProfile);
router.delete("/delete", authMiddleware, deleteProfile);


router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Page Not Found"
    });
});



module.exports = router;