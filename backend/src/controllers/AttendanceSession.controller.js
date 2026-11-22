const AttendanceSession = require("../models/AttendanceSession.model");
const CourseAssignment = require("../models/CourseAssignment.model");
const Student = require("../models/Student.models");
const StudentAttendance = require("../models/StudentAttendance.model");
const {
  courseStudentQuery,
  parseDate,
  todayString,
  validId,
} = require("../utils/attendanceUtils");

const getAssignedCourse = async (teacherId, courseId) => {
  if (!validId(courseId)) return null;
  const assignment = await CourseAssignment.findOne({
    teacher_id: teacherId,
    course_id: courseId,
  }).populate("course_id");
  return assignment?.course_id || null;
};

const verifySessionOwner = async (sessionId, teacherId) => {
  if (!validId(sessionId)) return { error: "Invalid attendance session ID.", status: 400 };
  const session = await AttendanceSession.findById(sessionId);
  if (!session) return { error: "Attendance session not found.", status: 404 };
  const [assignment, isOwner] = await Promise.all([
    CourseAssignment.exists({
      teacher_id: teacherId,
      course_id: session.course_id,
    }),
    Promise.resolve(session.teacher_id.toString() === teacherId.toString()),
  ]);
  if (!assignment || !isOwner) {
    return { error: "This attendance session is not assigned to your account.", status: 403 };
  }
  return { session };
};

const startAttendanceSession = async (req, res) => {
  try {
    const course = await getAssignedCourse(req.user._id, req.params.courseId);
    if (!course) {
      return res.status(validId(req.params.courseId) ? 403 : 400).json({
        success: false,
        message: validId(req.params.courseId)
          ? "This course is not assigned to your account."
          : "Invalid course ID.",
      });
    }

    const durationMinutes = Number(req.body.durationMinutes ?? 10);
    if (!Number.isInteger(durationMinutes) || durationMinutes < 1 || durationMinutes > 240) {
      return res.status(400).json({
        success: false,
        message: "Session duration must be between 1 and 240 minutes.",
      });
    }

    const date = parseDate(todayString(), { allowFuture: true });
    const now = new Date();
    const existing = await AttendanceSession.findOne({ course_id: course._id, date });
    if (existing && existing.is_open && existing.end_time > now) {
      return res.status(409).json({
        success: false,
        message: "Attendance session is already open for this course today.",
      });
    }

    const session = await AttendanceSession.findOneAndUpdate(
      { course_id: course._id, date },
      {
        $set: {
          teacher_id: req.user._id,
          start_time: now,
          end_time: new Date(now.getTime() + durationMinutes * 60 * 1000),
          is_open: true,
        },
        $setOnInsert: { created_at: now },
      },
      { new: true, upsert: true, runValidators: true },
    );
    return res.status(201).json({
      success: true,
      message: "Attendance session opened.",
      data: session,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An attendance session was started at the same time. Refresh and retry.",
      });
    }
    console.error("Start attendance session error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to start attendance session.",
    });
  }
};

const closeAttendanceSession = async (req, res) => {
  try {
    const result = await verifySessionOwner(req.params.sessionId, req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }
    result.session.is_open = false;
    await result.session.save();
    return res.json({
      success: true,
      message: "Attendance session closed.",
      data: result.session,
    });
  } catch (error) {
    console.error("Close attendance session error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to close attendance session.",
    });
  }
};

const markSessionAbsentees = async (req, res) => {
  try {
    const result = await verifySessionOwner(req.params.sessionId, req.user._id);
    if (result.error) {
      return res.status(result.status).json({ success: false, message: result.error });
    }

    const session = result.session;
    const now = new Date();
    if (session.is_open && now < session.end_time) {
      return res.status(409).json({
        success: false,
        message: "Close the attendance window before marking absentees.",
      });
    }
    if (session.is_open) {
      session.is_open = false;
      await session.save();
    }

    const course = await getAssignedCourse(req.user._id, session.course_id.toString());
    if (!course) {
      return res.status(403).json({
        success: false,
        message: "This course is not assigned to your account.",
      });
    }
    const students = await Student.find(courseStudentQuery(course)).select("_id");
    const operations = students.map((student) => ({
      updateOne: {
        filter: {
          student_id: student._id,
          course_id: course._id,
          date: session.date,
        },
        update: {
          $setOnInsert: {
            status: "absent",
            marked_by: req.user._id,
            marked_by_model: "User",
            marked_by_type: "teacher",
            marked_at: now,
            session_id: session._id,
            created_at: now,
          },
        },
        upsert: true,
      },
    }));
    let upsertedCount = 0;
    if (operations.length) {
      const result = await StudentAttendance.bulkWrite(operations, { ordered: true });
      upsertedCount = result.upsertedCount;
    }
    return res.json({
      success: true,
      message: "Unmarked students were recorded as absent.",
      count: upsertedCount,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance changed while absentees were being marked. Refresh and retry.",
      });
    }
    console.error("Mark session absentees error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to mark unmarked students absent.",
    });
  }
};

module.exports = {
  closeAttendanceSession,
  markSessionAbsentees,
  startAttendanceSession,
};
