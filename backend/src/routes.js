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
const studentAuth = require("./middleware/studentAuth.js");
const {
  studentLogin,
  getStudentProfile,
  getStudentFees,
  updateStudentProfile,
  studentLogout
} = require("./controllers/StudentDash.controller.js");
const {
  student_register,
  getAllStudents,
  getStudentCount,
  getRecentStudents,
  getStudentById,
  submitStudentFee,
  updateStudent,
  deleteStudent
} = require("./controllers/Student.controller.js");
const { createCourse, getAllCourses, getCourseById, updateCourse, deleteCourse } = require("./controllers/Course.controller.js");
const { createMessage } = require("./controllers/Message.controller.js");
const attendanceAdminAuth = require("./middleware/attendanceAdminAuth.js");
const staffAuth = require("./middleware/staffAuth.js");
const {
  getTeacherCourses,
  getTeacherCourseStudents,
  getTeacherHistory,
  getAdminStudentAttendance,
  saveAdminStudentAttendance,
  getAdminEmployeeAttendance,
  saveAdminEmployeeAttendance,
  getAdminAssignments,
  getAdminCourseStudents,
  saveAdminCourseStudents,
  updateAdminAssignments,
  getAttendanceSummary,
  getStaffProfile,
} = require("./controllers/Attendance.controller.js");
const {
  closeAttendanceSession,
  startAttendanceSession,
} = require("./controllers/AttendanceSession.controller.js");
const {
  applyStudentCourseLeave,
  getStudentAttendanceDashboard,
  getStudentAttendanceHistory,
  markStudentCourseAttendance,
} = require("./controllers/SelfAttendance.controller.js");

const teacherOnly = (req, res, next) => {
  if (req.user.emp_role !== "employee") {
    return res.status(403).json({ success: false, message: "Teachers only." });
  }
  return next();
};


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
router.post("/student/login", studentLogin);
router.post("/student/logout", studentAuth, studentLogout);
router.get("/student/profile", studentAuth, getStudentProfile);
router.get("/student/fees", studentAuth, getStudentFees);
router.put("/student/profile", studentAuth, updateStudentProfile);
router.post("/register/student", adminAuth, student_register);
router.get('/student', adminAuth, getAllStudents);
router.get('/student/count', adminAuth, getStudentCount);
router.get('/student/recent', adminAuth, getRecentStudents);
router.get('/student/:id', adminAuth, getStudentById);
router.post('/student/:id/fee-payments', adminAuth, submitStudentFee);
router.put('/student/:id', adminAuth, updateStudent);
router.delete('/student/:id', adminAuth, deleteStudent);

// Attendance routes: all staff endpoints authenticate on the server; teacher
// endpoints reject admins and admin endpoints reject employees.
router.get("/attendance/me", staffAuth, getStaffProfile);
router.get("/attendance/teacher/courses", staffAuth, teacherOnly, getTeacherCourses);
router.get("/attendance/teacher/courses/:courseId/students", staffAuth, teacherOnly, getTeacherCourseStudents);
router.get("/attendance/teacher/history", staffAuth, teacherOnly, getTeacherHistory);
router.post("/attendance/teacher/courses/:courseId/session", staffAuth, teacherOnly, startAttendanceSession);
router.patch("/attendance/teacher/sessions/:sessionId/close", staffAuth, teacherOnly, closeAttendanceSession);

router.get("/attendance/admin/summary", staffAuth, attendanceAdminAuth, getAttendanceSummary);
router.get("/attendance/admin/students", staffAuth, attendanceAdminAuth, getAdminStudentAttendance);
router.put("/attendance/admin/students/:attendanceId", staffAuth, attendanceAdminAuth, saveAdminStudentAttendance);
router.get("/attendance/admin/employees", staffAuth, attendanceAdminAuth, getAdminEmployeeAttendance);
router.put("/attendance/admin/employees/:employeeId", staffAuth, attendanceAdminAuth, saveAdminEmployeeAttendance);
router.get("/attendance/admin/assignments", staffAuth, attendanceAdminAuth, getAdminAssignments);
router.put("/attendance/admin/assignments", staffAuth, attendanceAdminAuth, updateAdminAssignments);
router.get("/attendance/admin/courses/:courseId/students", staffAuth, attendanceAdminAuth, getAdminCourseStudents);
router.put("/attendance/admin/courses/:courseId/students", staffAuth, attendanceAdminAuth, saveAdminCourseStudents);

router.get("/attendance/student", studentAuth, getStudentAttendanceDashboard);
router.get("/attendance/student/history", studentAuth, getStudentAttendanceHistory);
router.post("/attendance/student/courses/:courseId/mark", studentAuth, markStudentCourseAttendance);
router.post("/attendance/student/courses/:courseId/leave", studentAuth, applyStudentCourseLeave);

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


// Display the All courses on Main Web.
router.get("/display/course", getAllCourses);

// Public contact form message submission.
router.post("/message", createMessage);



// 404 Fallback
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Page Not Found",
  });
});


module.exports = router;
