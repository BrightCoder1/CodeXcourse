const AttendanceSession = require("../models/AttendanceSession.model");
const Course = require("../models/Course.model");
const CourseAssignment = require("../models/CourseAssignment.model");
const EmployeeAttendance = require("../models/EmployeeAttendance.model");
const Student = require("../models/Student.models");
const StudentAttendance = require("../models/StudentAttendance.model");
const User = require("../models/user.models");
const {
  courseStudentQuery,
  matchesLegacyCourseEnrollment,
  parseDate,
  parseRange,
  todayString,
  validId,
  validNameFilter,
} = require("../utils/attendanceUtils");

const STATUSES = ["present", "absent", "late", "leave"];
const STUDENT_STATUSES = [...STATUSES, "in_progress"];
const ADMIN_EDITABLE_STATUSES = STATUSES;
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
    }).select("student_id status check_in check_out total_minutes leave_reason marked_at marked_by_type created_at");
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
    if (!validNameFilter(req.query.studentId)) {
      return res.status(400).json({ success: false, message: "Student ID filter must be 100 characters or fewer." });
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
      if (!STUDENT_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ success: false, message: "Invalid attendance status." });
      }
      filter.status = req.query.status;
    }

    const courseRecords = await StudentAttendance.find(filter)
      .populate("student_id", "student_name middle_name last_name roll_number application_number admission_number course")
      .populate("course_id", "courseName courseCode")
      .populate("marked_by", "emp_name student_name middle_name last_name")
      .sort({ date: -1 });
    const records = courseRecords.map((record) => ({
      ...record.toObject(),
      record_type: "course",
    }));
    const nameFilter = typeof req.query.name === "string"
      ? req.query.name.trim().toLocaleLowerCase()
      : "";
    const studentIdFilter = typeof req.query.studentId === "string"
      ? req.query.studentId.trim().toLocaleLowerCase()
      : "";
    const data = records.filter((record) => {
      const student = record.student_id;
      const name = [student?.student_name, student?.middle_name, student?.last_name]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const identifiers = [
        student?._id,
        student?.roll_number,
        student?.application_number,
        student?.admission_number,
      ]
        .filter(Boolean)
        .map((identifier) => String(identifier).toLocaleLowerCase());
      return (!nameFilter || name.includes(nameFilter)) &&
        (!studentIdFilter || identifiers.some((identifier) => identifier.includes(studentIdFilter)));
    });
    return res.json({ success: true, data });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch student attendance.");
  }
};

const saveAdminStudentAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const status = req.body?.status;
    if (!validId(attendanceId) || !ADMIN_EDITABLE_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid course attendance record and status.",
      });
    }

    const record = await StudentAttendance.findByIdAndUpdate(
      attendanceId,
      {
        $set: {
          status,
          marked_by: req.user._id,
          marked_by_model: "User",
          marked_by_type: "admin",
          marked_at: new Date(),
        },
      },
      { new: true, runValidators: true },
    )
      .populate("student_id", "student_name middle_name last_name roll_number application_number course")
      .populate("course_id", "courseName courseCode")
      .populate("marked_by", "emp_name");
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Student attendance record was not found.",
      });
    }
    return res.json({
      success: true,
      message: "Student attendance status updated.",
      data: { ...record.toObject(), record_type: "course" },
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to update student attendance status.");
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

const getAdminCourseStudents = async (req, res) => {
  try {
    if (!validId(req.params.courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID." });
    }
    const course = await Course.findById(req.params.courseId)
      .select("_id courseName courseCode");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course was not found." });
    }

    const students = await Student.find()
      .select("_id student_name middle_name last_name email roll_number application_number admission_number course course_ids")
      .sort({ student_name: 1, last_name: 1 });
    const assignedStudentIds = students
      .filter((student) => Array.isArray(student.course_ids)
        ? student.course_ids.some((courseId) => courseId.toString() === course._id.toString())
        : matchesLegacyCourseEnrollment(student.course, course))
      .map((student) => student._id.toString());

    return res.json({
      success: true,
      data: {
        students: students.map((student) => student.toObject()),
        assignedStudentIds,
      },
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to fetch course students.");
  }
};

const saveAdminCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentIds = req.body?.studentIds;
    if (!validId(courseId) || !Array.isArray(studentIds) ||
        studentIds.some((studentId) => !validId(studentId))) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid course ID and a unique list of valid student IDs.",
      });
    }
    const normalizedStudentIds = studentIds.map((studentId) => studentId.toLowerCase());
    if (new Set(normalizedStudentIds).size !== normalizedStudentIds.length) {
      return res.status(400).json({
        success: false,
        message: "Provide a valid course ID and a unique list of valid student IDs.",
      });
    }

    const course = await Course.findById(courseId).select("_id courseName courseCode");
    if (!course) {
      return res.status(404).json({ success: false, message: "Course was not found." });
    }

    const [students, courses] = await Promise.all([
      Student.find()
        .select("_id course course_ids")
        .sort({ student_name: 1 }),
      Course.find().select("_id courseName courseCode"),
    ]);
    const studentsById = new Map(
      students.map((student) => [student._id.toString().toLowerCase(), student])
    );
    if (normalizedStudentIds.some((studentId) => !studentsById.has(studentId))) {
      return res.status(400).json({
        success: false,
        message: "One or more selected students were not found.",
      });
    }

    const selectedIds = new Set(normalizedStudentIds);
    const courseIdString = course._id.toString();
    const operations = [];
    students.forEach((student) => {
      const studentId = student._id.toString().toLowerCase();
      const currentlyAssigned = Array.isArray(student.course_ids)
        ? student.course_ids.some((id) => id.toString() === courseIdString)
        : matchesLegacyCourseEnrollment(student.course, course);
      if (!currentlyAssigned && !selectedIds.has(studentId)) return;

      const existingCourseIds = Array.isArray(student.course_ids)
        ? student.course_ids.map((id) => id.toString())
        : [
          courses.find((candidate) =>
            matchesLegacyCourseEnrollment(student.course, candidate)
          )?._id?.toString(),
        ].filter(Boolean);
      const nextCourseIds = new Set(
        existingCourseIds.filter((id) => id !== courseIdString)
      );
      if (selectedIds.has(studentId)) nextCourseIds.add(courseIdString);

      operations.push({
        updateOne: {
          filter: { _id: student._id },
          update: { $set: { course_ids: [...nextCourseIds] } },
        },
      });
    });

    if (operations.length) await Student.bulkWrite(operations);
    return res.json({
      success: true,
      message: "Student course assignments updated.",
      data: { assignedStudentIds: [...selectedIds] },
    });
  } catch (error) {
    return sendServerError(res, error, "Failed to update course student assignments.");
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
    const [studentTotals, employeeTotals, studentRates, employeeRates] = await Promise.all([
      StudentAttendance.aggregate([
        { $match: { date: today } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      EmployeeAttendance.aggregate([
        { $match: { date: today } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      StudentAttendance.aggregate([
        {
          $group: {
            _id: "$student_id",
            attended: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } },
            eligible: {
              $sum: {
                $cond: [{ $not: [{ $in: ["$status", ["leave", "in_progress"]] }] }, 1, 0],
              },
            },
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
          in_progress: countFor(studentTotals, "in_progress"),
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
};
