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
const {
  student_register,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require("./controllers/Student.controller.js");
const { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } = require("./controllers/Course.controller.js");


// Public Auth routes
router.post("/admin/login", loginUser);
router.get("/logout", getlogout);


// Admin-only management routes
router.post("/register", registerUser);
router.get("/get/employee", getEmployees);
router.get("/get/employee/:id", getEmployeeById);
router.put("/update/employee/:id", editEmployee);
router.delete("/delete/employee/:id", deleteEmployee);


// Admin Profile verification routes
router.get("/profile", adminAuth, getProfile);
router.put("/update", adminAuth, updateProfile);
router.delete("/delete", adminAuth, deleteProfile);



// Student Routes
router.post("/register/student", adminAuth, student_register);
router.get('/student', adminAuth, getAllStudents);
router.get('/student/:id', adminAuth, getStudentById);
router.put('/student/:id', adminAuth, updateStudent);
router.delete('/student/:id', adminAuth, deleteStudent);


// Course CRUD routes
router.route("/courses")
  .post(adminAuth, createCourse)
  .get(adminAuth, getAllCourses);
router.route("/courses/:id")
  .get(adminAuth, getCourseById)
  .put(adminAuth, updateCourse)
  .delete(adminAuth, deleteCourse);

// Keep the original course URLs available for existing clients.
router.post("/course/create", adminAuth, createCourse);
router.get("/get/course", adminAuth, getAllCourses);
router.get("/get/course/:id", adminAuth, getCourseById);
router.put("/update/course/:id", adminAuth, updateCourse);
router.delete("/delete/course/:id", adminAuth, deleteCourse);


// 404 Fallback
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});


module.exports = router;
