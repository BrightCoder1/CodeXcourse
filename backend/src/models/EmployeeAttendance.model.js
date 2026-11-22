const mongoose = require("mongoose");

const attendanceStatuses = ["present", "absent", "late", "leave"];

const employeeAttendanceSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: { type: Date, required: true },
    status: { type: String, enum: attendanceStatuses, required: true },
    check_in: { type: String, default: "" },
    check_out: { type: String, default: "" },
    marked_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_at: { type: Date, default: Date.now, required: true },
  },
  { collection: "employee_attendance", timestamps: false }
);

employeeAttendanceSchema.index(
  { employee_id: 1, date: 1 },
  { unique: true }
);
employeeAttendanceSchema.index({ date: 1, status: 1 });

module.exports = mongoose.model("EmployeeAttendance", employeeAttendanceSchema);
