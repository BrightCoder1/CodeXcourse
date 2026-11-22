const mongoose = require("mongoose");

const attendanceSessionSchema = new mongoose.Schema(
  {
    course_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    is_open: { type: Boolean, default: true, required: true },
    created_at: { type: Date, default: Date.now, required: true },
  },
  { collection: "attendance_sessions", timestamps: false }
);

attendanceSessionSchema.index(
  { course_id: 1, date: 1 },
  { unique: true }
);
attendanceSessionSchema.index({ teacher_id: 1, date: 1 });

module.exports = mongoose.model("AttendanceSession", attendanceSessionSchema);
