const Course = require("../models/Course.model");
const CourseAssignment = require("../models/CourseAssignment.model");
const StudentAttendance = require("../models/StudentAttendance.model");
const {
  enrolledCourseQuery,
  parseDate,
  parseRange,
  todayString,
  validId,
} = require("../utils/attendanceUtils");

const getStudentCourses = (student) =>
  Course.find(
    Array.isArray(student.course_ids)
      ? { _id: { $in: student.course_ids } }
      : enrolledCourseQuery(student.course)
  )
    .select("courseName courseCode instructorName teacherName courseImageUrl status");

const getStudentAttendanceDashboard = async (req, res) => {
  try {
    const courses = await getStudentCourses(req.student);
    const courseIds = courses.map((course) => course._id);
    const assignments = await CourseAssignment.find({ course_id: { $in: courseIds } })
      .populate("teacher_id", "emp_name emp_id email emp_department")
      .select("course_id teacher_id");
    const teachersByCourse = new Map();
    assignments.forEach((assignment) => {
      if (!assignment.course_id || !assignment.teacher_id) return;
      const courseId = assignment.course_id.toString();
      const teachers = teachersByCourse.get(courseId) || [];
      teachers.push(assignment.teacher_id);
      teachersByCourse.set(courseId, teachers);
    });
    const date = parseDate(todayString(), { allowFuture: true });
    const records = await StudentAttendance.find({
      student_id: req.student._id,
      course_id: { $in: courseIds },
      date,
    }).select("course_id status check_in check_out total_minutes leave_reason marked_at marked_by_type session_id created_at");
    const attendanceByCourse = new Map(
      records.map((record) => [record.course_id.toString(), record])
    );

    return res.json({
      success: true,
      data: {
        date: todayString(),
        courses: courses.map((course) => {
          const storedAttendance = attendanceByCourse.get(course._id.toString());
          const isLegacySelfCheckIn = Boolean(
            storedAttendance &&
            storedAttendance.status === "present" &&
            storedAttendance.marked_by_type === "student" &&
            storedAttendance.session_id &&
            !storedAttendance.check_in &&
            !storedAttendance.check_out
          );
          const attendance = isLegacySelfCheckIn
            ? {
              ...storedAttendance.toObject(),
              status: "in_progress",
              check_in: storedAttendance.marked_at || storedAttendance.created_at,
              check_out: null,
              total_minutes: 0,
            }
            : storedAttendance;
          return {
            ...course.toObject(),
            assignedTeachers: teachersByCourse.get(course._id.toString()) || [],
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
    const action = req.body?.action;
    if (action !== "check-in" && action !== "check-out") {
      return res.status(400).json({
        success: false,
        message: "Attendance action must be check-in or check-out.",
      });
    }

    const hasCourseIdList = Array.isArray(req.student.course_ids);
    if (hasCourseIdList && !req.student.course_ids.some((courseId) =>
      courseId.toString() === req.params.courseId
    )) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }
    const course = await Course.findOne({
      _id: req.params.courseId,
      ...(hasCourseIdList ? {} : enrolledCourseQuery(req.student.course)),
    }).select("_id");
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    const date = parseDate(todayString(), { allowFuture: true });
    const attendanceFilter = {
      student_id: req.student._id,
      course_id: course._id,
      date,
    };
    const now = new Date();
    let record;

    if (action === "check-in") {
      const existing = await StudentAttendance.findOne(attendanceFilter).select("_id");
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Attendance has already been started or marked for this course today.",
        });
      }

      record = await StudentAttendance.create({
        ...attendanceFilter,
        status: "in_progress",
        check_in: now,
        check_out: null,
        total_minutes: 0,
        marked_by: req.student._id,
        marked_by_model: "Student",
        marked_by_type: "student",
        marked_at: now,
        session_id: null,
        created_at: now,
      });
    } else {
      let activeRecord = await StudentAttendance.findOne({
        ...attendanceFilter,
        check_in: { $ne: null },
        check_out: null,
      }).select("_id check_in status");
      let legacyCheckIn = false;
      if (!activeRecord) {
        activeRecord = await StudentAttendance.findOne({
          ...attendanceFilter,
          status: "present",
          marked_by_type: "student",
          session_id: { $ne: null },
          check_in: null,
          check_out: null,
        }).select("_id marked_at created_at status");
        legacyCheckIn = Boolean(activeRecord);
      }
      if (!activeRecord) {
        return res.status(409).json({
          success: false,
          message: "Check in to this course before checking out.",
        });
      }

      const checkInTime = activeRecord.check_in ||
        activeRecord.marked_at ||
        activeRecord.created_at;
      if (!checkInTime) {
        return res.status(409).json({
          success: false,
          message: "The check-in time is missing. Ask an administrator to review this attendance record.",
        });
      }
      const totalMinutes = Math.max(
        0,
        Math.floor((now.getTime() - new Date(checkInTime).getTime()) / 60000),
      );
      const updates = {
        check_in: checkInTime,
        check_out: now,
        total_minutes: totalMinutes,
        marked_at: now,
      };
      if (activeRecord.status === "in_progress") updates.status = "present";

      const updateFilter = { _id: activeRecord._id, check_out: null };
      if (legacyCheckIn) {
        updateFilter.$or = [{ check_in: null }, { check_in: { $exists: false } }];
      }
      record = await StudentAttendance.findOneAndUpdate(
        updateFilter,
        { $set: updates },
        { new: true, runValidators: true },
      );
      if (!record) {
        return res.status(409).json({
          success: false,
          message: "Attendance was updated already. Refresh and try again.",
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: action === "check-in"
        ? "Course check-in recorded."
        : "Course check-out recorded.",
      data: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance has already been started or marked for this course today.",
      });
    }
    console.error("Mark student course attendance error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to mark course attendance.",
    });
  }
};

const applyStudentCourseLeave = async (req, res) => {
  try {
    if (!validId(req.params.courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }
    const dateValue = req.body?.date;
    const date = parseDate(dateValue, { allowFuture: true });
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (!date || dateValue < todayString()) {
      return res.status(400).json({
        success: false,
        message: "Choose today or a future date for the leave application.",
      });
    }
    if (!reason || reason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Provide a leave reason of up to 500 characters.",
      });
    }

    const hasCourseIdList = Array.isArray(req.student.course_ids);
    if (hasCourseIdList && !req.student.course_ids.some((courseId) =>
      courseId.toString() === req.params.courseId
    )) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }
    const course = await Course.findOne({
      _id: req.params.courseId,
      ...(hasCourseIdList ? {} : enrolledCourseQuery(req.student.course)),
    }).select("_id");
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course.",
      });
    }

    const now = new Date();
    const record = await StudentAttendance.create({
      student_id: req.student._id,
      course_id: course._id,
      date,
      status: "leave",
      leave_reason: reason,
      marked_by: req.student._id,
      marked_by_model: "Student",
      marked_by_type: "student",
      marked_at: now,
      created_at: now,
    });
    return res.status(201).json({
      success: true,
      message: "Leave application submitted.",
      data: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance or a leave application already exists for this course and date.",
      });
    }
    console.error("Apply student course leave error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit the leave application.",
    });
  }
};

const getStudentAttendanceHistory = async (req, res) => {
  try {
    const parsedRange = parseRange(req.query);
    if (parsedRange.error) {
      return res.status(400).json({ success: false, message: parsedRange.error });
    }
    const filter = { student_id: req.student._id };
    if (Object.keys(parsedRange.range).length) filter.date = parsedRange.range;
    if (req.query.courseId) {
      if (!validId(req.query.courseId)) {
        return res.status(400).json({ success: false, message: "Invalid course ID." });
      }
      filter.course_id = req.query.courseId;
    }

    const courseAttendance = await StudentAttendance.find(filter)
      .populate("course_id", "courseName courseCode")
      .sort({ date: -1 });
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
        totalMinutes: 0,
      };
      if (record.status !== "leave" && record.status !== "in_progress") item.eligible += 1;
      if (record.status === "present" || record.status === "late") item.attended += 1;
      item.totalMinutes += record.total_minutes || 0;
      totals.set(courseId, item);
    });
    const percentages = [...totals.values()].map((item) => ({
      ...item,
      percentage: item.eligible
        ? Math.round((item.attended / item.eligible) * 1000) / 10
        : 0,
    }));

    return res.json({
      success: true,
      data: { courseAttendance, percentages },
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
  applyStudentCourseLeave,
  getStudentAttendanceDashboard,
  getStudentAttendanceHistory,
  markStudentCourseAttendance,
};
