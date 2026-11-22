const mongoose = require("mongoose");

const dailyAttendanceSchema = new mongoose.Schema(
  {
    student_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    date: { type: Date, required: true },
    status: {
      type: String,
      enum: ["present", "absent", "late", "leave"],
      required: true,
    },
    marked_at: { type: Date, required: true },
  },
  { collection: "daily_attendance", timestamps: false }
);

dailyAttendanceSchema.index({ student_id: 1, date: 1 }, { unique: true });
dailyAttendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("DailyAttendance", dailyAttendanceSchema);
