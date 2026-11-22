require("dotenv").config();
const mongoose = require("mongoose");
require("../src/models/CourseAssignment.model");
require("../src/models/AttendanceSession.model");
require("../src/models/DailyAttendance.model");
require("../src/models/StudentAttendance.model");
require("../src/models/EmployeeAttendance.model");

const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/codexcourse";

async function migrateAttendance() {
  try {
    await mongoose.connect(mongoUri);
    const modelNames = [
      "CourseAssignment",
      "AttendanceSession",
      "DailyAttendance",
      "StudentAttendance",
      "EmployeeAttendance",
    ];

    for (const modelName of modelNames) {
      await mongoose.model(modelName).createIndexes();
      console.log(`${modelName}: collection and indexes are ready.`);
    }
  } catch (error) {
    console.error("Attendance migration failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

migrateAttendance();
