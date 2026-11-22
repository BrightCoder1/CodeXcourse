const attendanceAdminAuth = (req, res, next) => {
  if (req.user?.emp_role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admins only.",
    });
  }
  return next();
};

module.exports = attendanceAdminAuth;
