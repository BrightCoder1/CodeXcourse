const mongoose = require("mongoose");
const AttendanceSession = require("../models/AttendanceSession.model");
const Course = require("../models/Course.model");
const CourseAssignment = require("../models/CourseAssignment.model");
const DailyAttendance = require("../models/DailyAttendance.model");
const EmployeeAttendance = require("../models/EmployeeAttendance.model");
const Student = require("../models/Student.models");
const StudentAttendance = require("../models/StudentAttendance.model");
const User = require("../models/user.models");
const {
  courseStudentQuery,
  parseDate,
  parseRange,
  todayString,
  validId,
  validNameFilter,
} = require("../utils/attendanceUtils");

const STATUSES = ["present", "absent", "late", "leave"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const sendServerError = (res, error, message) => {
  console.error(message, error);
  return res.status(500).json({ success: false, message });
};

const getAssignedCourse = async (teacherId, courseId) => {
  if (!validId(courseId)) return null;
  const assignment = await CourseAssignment.findOne({
    teacher_id: teacherId,
    course_id: courseId,
  }).populate("course_id");
  return assignment?.course_id || null;
};

const getTeacherCourses = async (req, res) => {
  try {
    const assignments = await CourseAssignment.find({ teacher_id: req.user._id })
      .populate("course_id")
      .sort({ _id: 1 });
    return res.json({
      success: true,
      data: assignments.map((assignment) => assignment.course_id).filter(Boolean),
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch assigned courses.");
  }
};

const getTeacherCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!validId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }
    const date = parseDate(req.query.date);
    if (!date) {
      return res.status(400).json({
        success: false,
        message: "A valid, non-future date in YYYY-MM-DD format is required.",
      });
    }

    const course = await getAssignedCourse(req.user._id, courseId);
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "This course is not assigned to your account.",
      });
    }

    const students = await Student.find(courseStudentQuery(course))
      .select("student_name middle_name last_name email roll_number application_number course")
      .sort({ student_name: 1, last_name: 1 });
    const session = await AttendanceSession.findOne({
      course_id: course._id,
      date,
    }).select("teacher_id start_time end_time is_open");
    const records = await StudentAttendance.find({
      course_id: course._id,
      date,
      student_id: { $in: students.map((student) => student._id) },
    }).select("student_id status marked_at marked_by_type created_at");
    const attendanceByStudent = new Map(
      records.map((record) => [record.student_id.toString(), record])
    );

    return res.json({
      success: true,
      data: students.map((student) => ({
        ...student.toObject(),
        attendance: attendanceByStudent.get(student._id.toString()) || null,
        attendance_status: attendanceByStudent.get(student._id.toString())?.status || "",
      })),
      session,
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch the course attendance roster.");
  }
};

const saveTeacherAttendance = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!validId(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }
    const date = parseDate(req.body.date);
    const entries = req.body.entries;
    if (!date || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid, non-future date and at least one attendance entry.",
      });
    }
    if (entries.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Attendance can be saved for up to 1000 students at a time.",
      });
    }

    const course = await getAssignedCourse(req.user._id, courseId);
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "This course is not assigned to your account.",
      });
    }

    const studentIds = [];
    const seenIds = new Set();
    for (const entry of entries) {
      if (!entry || !validId(entry.studentId) || !STATUSES.includes(entry.status)) {
        return res.status(400).json({
          success: false,
          message: "Each attendance entry must include a valid student ID and status.",
        });
      }
      const studentId = new mongoose.Types.ObjectId(entry.studentId).toString();
      if (seenIds.has(studentId)) {
        return res.status(400).json({
          success: false,
          message: "A student can appear only once in an attendance submission.",
        });
      }
      seenIds.add(studentId);
      studentIds.push(new mongoose.Types.ObjectId(studentId));
    }

    const eligibleStudents = await Student.find({
      _id: { $in: studentIds },
      ...courseStudentQuery(course),
    }).select("_id");
    if (eligibleStudents.length !== studentIds.length) {
      return res.status(400).json({
        success: false,
        message: "Attendance contains a student who is not enrolled in this course.",
      });
    }

    const markedAt = new Date();
    const session = await AttendanceSession.findOne({ course_id: course._id, date })
      .select("_id");
    const updates = {
      marked_by: req.user._id,
      marked_by_model: "User",
      marked_by_type: req.user.emp_role === "admin" ? "admin" : "teacher",
      marked_at: markedAt,
    };
    if (session) updates.session_id = session._id;
    const operations = entries.map((entry) => ({
      updateOne: {
        filter: {
          student_id: entry.studentId,
          course_id: course._id,
          date,
        },
        update: {
          $set: { ...updates, status: entry.status },
          $setOnInsert: { created_at: markedAt },
        },
        upsert: true,
      },
    }));
    await StudentAttendance.bulkWrite(operations, { ordered: true });

    return res.json({
      success: true,
      message: "Attendance saved successfully.",
      count: entries.length,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance was updated at the same time. Refresh and try again.",
      });
    }
    return sendServerError(res, error, "Failed to save student attendance.");
  }
};

const getTeacherHistory = async (req, res) => {
  try {
    const { courseId } = req.query;
    if (!validId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "A valid course ID is required.",
      });
    }
    const course = await getAssignedCourse(req.user._id, courseId);
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "This course is not assigned to your account.",
      });
    }

    const parsedRange = parseRange(req.query);
    if (parsedRange.error) {
      return res.status(400).json({ success: false, message: parsedRange.error });
    }
    const filter = { course_id: course._id };
    if (Object.keys(parsedRange.range).length) filter.date = parsedRange.range;
    if (req.query.studentId) {
      if (!validId(req.query.studentId)) {
        return res.status(400).json({ success: false, message: "Invalid student ID." });
      }
      filter.student_id = req.query.studentId;
    }

    const records = await StudentAttendance.find(filter)
      .populate("student_id", "student_name middle_name last_name roll_number")
      .populate("marked_by", "emp_name student_name middle_name last_name")
      .populate("session_id", "start_time end_time")
      .sort({ date: -1, "student_id.student_name": 1 });
    return res.json({ success: true, data: records });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch attendance history.");
  }
};

const getAdminStudentAttendance = async (req, res) => {
  try {
    if (!validNameFilter(req.query.name)) {
      return res.status(400).json({ success: false, message: "Student name filter must be 100 characters or fewer." });
    }
    const parsedRange = parseRange(req.query);
    if (parsedRange.error) {
      return res.status(400).json({ success: false, message: parsedRange.error });
    }
    const filter = {};
    if (req.query.courseId) {
      if (!validId(req.query.courseId)) {
        return res.status(400).json({ success: false, message: "Invalid course ID." });
      }
      filter.course_id = req.query.courseId;
    }
    if (Object.keys(parsedRange.range).length) filter.date = parsedRange.range;
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: "Invalid attendance status." });
      }
      filter.status = req.query.status;
    }

    const dailyFilter = {};
    if (Object.keys(parsedRange.range).length) dailyFilter.date = parsedRange.range;
    if (req.query.status) dailyFilter.status = req.query.status;
    const [courseRecords, dailyRecords] = await Promise.all([
      StudentAttendance.find(filter)
        .populate("student_id", "student_name middle_name last_name roll_number application_number course")
        .populate("course_id", "courseName courseCode")
        .populate("marked_by", "emp_name student_name middle_name last_name")
        .sort({ date: -1 }),
      req.query.courseId
        ? []
        : DailyAttendance.find(dailyFilter)
          .populate("student_id", "student_name middle_name last_name roll_number application_number course")
          .sort({ date: -1, marked_at: -1 }),
    ]);
    const records = [
      ...courseRecords.map((record) => ({ ...record.toObject(), record_type: "course" })),
      ...dailyRecords.map((record) => ({ ...record.toObject(), record_type: "daily" })),
    ].sort((left, right) =>
      new Date(right.date) - new Date(left.date) ||
      new Date(right.marked_at || right.created_at) - new Date(left.marked_at || left.created_at)
    );
    const nameFilter = typeof req.query.name === "string"
      ? req.query.name.trim().toLocaleLowerCase()
      : "";
    const data = nameFilter
      ? records.filter((record) => {
        const student = record.student_id;
        const name = [student?.student_name, student?.middle_name, student?.last_name]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase();
        return name.includes(nameFilter);
      })
      : records;
    return res.json({ success: true, data });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch student attendance.");
  }
};

const getAdminEmployeeAttendance = async (req, res) => {
  try {
    if (!validNameFilter(req.query.name)) {
      return res.status(400).json({ success: false, message: "Employee name filter must be 100 characters or fewer." });
    }
    const parsedRange = parseRange(req.query);
    if (parsedRange.error) {
      return res.status(400).json({ success: false, message: parsedRange.error });
    }
    const filter = {};
    if (Object.keys(parsedRange.range).length) filter.date = parsedRange.range;
    if (req.query.status) {
      if (!STATUSES.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: "Invalid attendance status." });
      }
      filter.status = req.query.status;
    }

    const records = await EmployeeAttendance.find(filter)
      .populate("employee_id", "emp_name emp_id emp_role emp_department")
      .populate("marked_by", "emp_name")
      .sort({ date: -1 });
    const nameFilter = typeof req.query.name === "string"
      ? req.query.name.trim().toLocaleLowerCase()
      : "";
    const data = nameFilter
      ? records.filter((record) =>
        record.employee_id?.emp_name?.toLocaleLowerCase().includes(nameFilter))
      : records;
    return res.json({ success: true, data });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch employee attendance.");
  }
};

const saveAdminEmployeeAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { status, check_in = "", check_out = "" } = req.body;
    const date = parseDate(req.body.date);
    if (!validId(employeeId) || !date || !STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid employee, non-future date, and attendance status.",
      });
    }
    if (typeof check_in !== "string" || typeof check_out !== "string" ||
        (check_in && !TIME_PATTERN.test(check_in)) ||
        (check_out && !TIME_PATTERN.test(check_out))) {
      return res.status(400).json({
        success: false,
        message: "Check-in and check-out must use 24-hour HH:mm format.",
      });
    }
    if (check_in && check_out && check_out < check_in) {
      return res.status(400).json({
        success: false,
        message: "Check-out cannot be earlier than check-in.",
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      emp_role: "employee",
    }).select("_id");
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee or teacher was not found.",
      });
    }

    const record = await EmployeeAttendance.findOneAndUpdate(
      { employee_id: employee._id, date },
      {
        $set: {
          status,
          check_in,
          check_out,
          marked_by: req.user._id,
        },
        $setOnInsert: { created_at: new Date() },
      },
      { new: true, upsert: true, runValidators: true }
    ).populate("employee_id", "emp_name emp_id emp_role");
    return res.json({
      success: true,
      message: "Employee attendance saved successfully.",
      data: record,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance was updated at the same time. Refresh and try again.",
      });
    }
    return sendServerError(res, error, "Failed to save employee attendance.");
  }
};

const getAdminAssignments = async (req, res) => {
  try {
    const [teachers, courses, assignments] = await Promise.all([
      User.find({ emp_role: "employee" }).select("emp_name emp_id emp_department email").sort({ emp_name: 1 }),
      Course.find().select("courseName courseCode status").sort({ courseName: 1 }),
      CourseAssignment.find().select("teacher_id course_id"),
    ]);
    return res.json({
      success: true,
      data: {
        teachers,
        courses,
        assignments: assignments.map((assignment) => ({
          teacherId: assignment.teacher_id.toString(),
          courseId: assignment.course_id.toString(),
        })),
      },
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch teacher course assignments.");
  }
};

const updateAdminAssignments = async (req, res) => {
  try {
    const { teacherId, courseIds } = req.body;
    if (!validId(teacherId) || !Array.isArray(courseIds) ||
        courseIds.some((courseId) => !validId(courseId)) ||
        new Set(courseIds).size !== courseIds.length) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid teacher ID and a unique list of valid course IDs.",
      });
    }
    const teacher = await User.findOne({ _id: teacherId, emp_role: "employee" }).select("_id");
    if (!teacher) {
      return res.status(404).json({ success: false, message: "Teacher was not found." });
    }
    const existingCourses = await Course.countDocuments({ _id: { $in: courseIds } });
    if (existingCourses !== courseIds.length) {
      return res.status(400).json({ success: false, message: "One or more courses do not exist." });
    }

    await CourseAssignment.deleteMany({
      teacher_id: teacher._id,
      course_id: { $nin: courseIds },
    });
    if (courseIds.length) {
      await CourseAssignment.bulkWrite(
        courseIds.map((courseId) => ({
          updateOne: {
            filter: { teacher_id: teacher._id, course_id: courseId },
            update: { $setOnInsert: { teacher_id: teacher._id, course_id: courseId } },
            upsert: true,
          },
        })),
        { ordered: true }
      );
    }

    return res.json({
      success: true,
      message: "Teacher course assignments updated successfully.",
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An assignment changed at the same time. Refresh and try again.",
      });
    }
    return sendServerError(res, error, "Failed to update teacher course assignments.");
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const today = parseDate(todayString(), { allowFuture: true });
    const [studentTotals, employeeTotals, dailyStudentTotals, studentRates, employeeRates] = await Promise.all([
      StudentAttendance.aggregate([
        { $match: { date: today } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      EmployeeAttendance.aggregate([
        { $match: { date: today } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      DailyAttendance.aggregate([
        { $match: { date: today } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      StudentAttendance.aggregate([
        {
          $group: {
            _id: "$student_id",
            attended: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
            eligible: { $sum: { $cond: [{ $ne: ["$status", "leave"] }, 1, 0] } },
          },
        },
        { $lookup: { from: "students", localField: "_id", foreignField: "_id", as: "student" } },
        { $unwind: "$student" },
        {
          $project: {
            _id: 0,
            studentId: "$_id",
            name: { $trim: { input: { $concat: ["$student.student_name", " ", "$student.last_name"] } } },
            course: "$student.course",
            percentage: {
              $cond: [
                { $eq: ["$eligible", 0] },
                0,
                { $round: [{ $multiply: [{ $divide: ["$attended", "$eligible"] }, 100] }, 1] },
              ],
            },
          },
        },
        { $sort: { name: 1 } },
      ]),
      EmployeeAttendance.aggregate([
        {
          $group: {
            _id: "$employee_id",
            attended: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
            eligible: { $sum: { $cond: [{ $ne: ["$status", "leave"] }, 1, 0] } },
          },
        },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "employee" } },
        { $unwind: "$employee" },
        { $match: { "employee.emp_role": "employee" } },
        {
          $project: {
            _id: 0,
            employeeId: "$_id",
            name: "$employee.emp_name",
            percentage: {
              $cond: [
                { $eq: ["$eligible", 0] },
                0,
                { $round: [{ $multiply: [{ $divide: ["$attended", "$eligible"] }, 100] }, 1] },
              ],
            },
          },
        },
        { $sort: { name: 1 } },
      ]),
    ]);
    const countFor = (totals, status) =>
      totals.find((item) => item._id === status)?.count || 0;

    return res.json({
      success: true,
      data: {
        date: todayString(),
        students: {
          present: countFor(studentTotals, "present"),
          absent: countFor(studentTotals, "absent"),
          late: countFor(studentTotals, "late"),
          leave: countFor(studentTotals, "leave"),
        },
        dailyStudents: {
          present: countFor(dailyStudentTotals, "present"),
        },
        employees: {
          present: countFor(employeeTotals, "present"),
          absent: countFor(employeeTotals, "absent"),
          late: countFor(employeeTotals, "late"),
          leave: countFor(employeeTotals, "leave"),
        },
        studentPercentages: studentRates,
        teacherPercentages: employeeRates,
      },
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to calculate attendance summary.");
  }
};

const getStaffProfile = (req, res) => res.json({ success: true, user: req.user });

module.exports = {
  getTeacherCourses,
  getTeacherCourseStudents,
  saveTeacherAttendance,
  getTeacherHistory,
  getAdminStudentAttendance,
  getAdminEmployeeAttendance,
  saveAdminEmployeeAttendance,
  getAdminAssignments,
  updateAdminAssignments,
  getAttendanceSummary,
  getStaffProfile,
};
