const mongoose = require("mongoose");

const attendanceStatuses = ["present", "absent", "late", "leave", "in_progress"];

const studentAttendanceSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: attendanceStatuses, required: true },
    check_in: { type: Date, default: null },
    check_out: { type: Date, default: null },
    total_minutes: { type: Number, min: 0, default: 0 },
    leave_reason: { type: String, trim: true, maxlength: 500, default: "" },
    marked_by: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "marked_by_model",
      required: true,
    },
    marked_by_model: {
      type: String,
      enum: ["Student", "User"],
      default: "User",
      required: true,
    },
    marked_by_type: {
      type: String,
      enum: ["student", "teacher", "admin"],
      default: "teacher",
      required: true,
    },
    marked_at: { type: Date },
    session_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AttendanceSession",
      default: null,
    },
    created_at: { type: Date, default: Date.now, required: true },
  },
  { collection: "student_attendance", timestamps: false }
);

studentAttendanceSchema.index(
  { student_id: 1, course_id: 1, date: 1 },
  { unique: true }
);
studentAttendanceSchema.index({ course_id: 1, date: 1 });
studentAttendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("StudentAttendance", studentAttendanceSchema);
