const AttendanceSession = require("../models/AttendanceSession.model");
const Course = require("../models/Course.model");
const CourseAssignment = require("../models/CourseAssignment.model");
const DailyAttendance = require("../models/DailyAttendance.model");
const StudentAttendance = require("../models/StudentAttendance.model");
const {
  enrolledCourseQuery,
  parseDate,
  parseRange,
  todayString,
  validId,
} = require("../utils/attendanceUtils");

const getStudentCourses = (student) =>
  Course.find(enrolledCourseQuery(student.course)).select("courseName courseCode instructorName teacherName status");

const getStudentAttendanceDashboard = async (req, res) => {
  try {
    const courses = await getStudentCourses(req.student);
    const courseIds = courses.map((course) => course._id);
    const date = parseDate(todayString(), { allowFuture: true });
    const now = new Date();
    const [sessions, records, dailyAttendance] = await Promise.all([
      AttendanceSession.find({ course_id: { $in: courseIds }, date })
        .select("course_id teacher_id start_time end_time is_open"),
      StudentAttendance.find({
        student_id: req.student._id,
        course_id: { $in: courseIds },
        date,
      }).select("course_id status marked_at marked_by_type created_at"),
      DailyAttendance.findOne({ student_id: req.student._id, date })
        .select("status marked_at"),
    ]);

    const sessionByCourse = new Map(
      sessions.map((session) => [session.course_id.toString(), session])
    );
    const attendanceByCourse = new Map(
      records.map((record) => [record.course_id.toString(), record])
    );

    return res.json({
      success: true,
      data: {
        date: todayString(),
        dailyAttendance,
        courses: courses.map((course) => {
          const session = sessionByCourse.get(course._id.toString());
          const attendance = attendanceByCourse.get(course._id.toString());
          const isOpen = Boolean(
            session &&
            session.is_open &&
            now >= session.start_time &&
            now <= session.end_time
          );
          return {
            ...course.toObject(),
            session: session || null,
            sessionStatus: isOpen ? "open" : session ? "closed" : "not_started",
            attendance: attendance || null,
          };
        }),
      },
    });
  } catch (error) {
    console.error("Get student attendance dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load attendance information.",
    });
  }
};

const markStudentCourseAttendance = async (req, res) => {
  try {
    if (!validId(req.params.courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }
    const course = await Course.findOne({
      _id: req.params.courseId,
      ...enrolledCourseQuery(req.student.course),
    }).select("_id");
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    const date = parseDate(todayString(), { allowFuture: true });
    const existing = await StudentAttendance.findOne({
      student_id: req.student._id,
      course_id: course._id,
      date,
    }).select("_id");
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked",
      });
    }

    const session = await AttendanceSession.findOne({ course_id: course._id, date });
    const now = new Date();
    if (!session || !session.is_open || now < session.start_time || now > session.end_time) {
      return res.status(409).json({
        success: false,
        message: "Attendance window is closed",
      });
    }
    const assignedTeacher = await CourseAssignment.exists({
      teacher_id: session.teacher_id,
      course_id: course._id,
    });
    if (!assignedTeacher) {
      return res.status(409).json({
        success: false,
        message: "Attendance window is closed",
      });
    }

    const record = await StudentAttendance.create({
      student_id: req.student._id,
      course_id: course._id,
      date,
      status: "present",
      marked_by: req.student._id,
      marked_by_model: "Student",
      marked_by_type: "student",
      marked_at: now,
      session_id: session._id,
      created_at: now,
    });
    return res.status(201).json({
      success: true,
      message: "Course attendance marked present.",
      data: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked",
      });
    }
    console.error("Mark student course attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to mark course attendance.",
    });
  }
};

const markStudentDailyAttendance = async (req, res) => {
  try {
    const date = parseDate(todayString(), { allowFuture: true });
    const existing = await DailyAttendance.findOne({
      student_id: req.student._id,
      date,
    }).select("_id");
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked",
      });
    }

    const now = new Date();
    const record = await DailyAttendance.create({
      student_id: req.student._id,
      date,
      status: "present",
      marked_at: now,
    });
    return res.status(201).json({
      success: true,
      message: "Daily attendance marked present.",
      data: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked",
      });
    }
    console.error("Mark student daily attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to mark daily attendance.",
    });
  }
};

const getStudentAttendanceHistory = async (req, res) => {
  try {
    const parsedRange = parseRange(req.query);
    if (parsedRange.error) {
      return res.status(400).json({ success: false, message: parsedRange.error });
    }
    const courseFilter = { student_id: req.student._id };
    const dailyFilter = { student_id: req.student._id };
    if (Object.keys(parsedRange.range).length) {
      courseFilter.date = parsedRange.range;
      dailyFilter.date = parsedRange.range;
    }
    if (req.query.courseId) {
      if (!validId(req.query.courseId)) {
        return res.status(400).json({ success: false, message: "Invalid course ID." });
      }
      courseFilter.course_id = req.query.courseId;
    }

    const [courseAttendance, dailyAttendance] = await Promise.all([
      StudentAttendance.find(courseFilter)
        .populate("course_id", "courseName courseCode")
        .sort({ date: -1 }),
      DailyAttendance.find(dailyFilter).sort({ date: -1 }),
    ]);
    const totals = new Map();
    courseAttendance.forEach((record) => {
      const courseId = record.course_id?._id?.toString();
      if (!courseId) return;
      const item = totals.get(courseId) || {
        courseId,
        courseName: record.course_id.courseName,
        courseCode: record.course_id.courseCode,
        attended: 0,
        eligible: 0,
      };
      if (record.status !== "leave") item.eligible += 1;
      if (record.status === "present" || record.status === "late") item.attended += 1;
      totals.set(courseId, item);
    });
    const percentages = [...totals.values()].map((item) => ({
      ...item,
      percentage: item.eligible
        ? Math.round((item.attended / item.eligible) * 1000) / 10
        : 0,
    }));
    const dailyEligible = dailyAttendance.filter((record) => record.status !== "leave");
    const dailyPercentage = dailyEligible.length
      ? Math.round(
        (dailyEligible.filter((record) =>
          record.status === "present" || record.status === "late").length /
          dailyEligible.length) * 1000
      ) / 10
      : 0;

    return res.json({
      success: true,
      data: { courseAttendance, dailyAttendance, percentages, dailyPercentage },
    });
  } catch (error) {
    console.error("Get student attendance history error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load attendance history.",
    });
  }
};

module.exports = {
  getStudentAttendanceDashboard,
  getStudentAttendanceHistory,
  markStudentCourseAttendance,
  markStudentDailyAttendance,
};
