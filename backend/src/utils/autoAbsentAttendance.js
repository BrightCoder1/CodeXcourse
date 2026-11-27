const Course = require("../models/Course.model");
const Student = require("../models/Student.models");
const StudentAttendance = require("../models/StudentAttendance.model");
const { courseStudentQuery, parseDate } = require("./attendanceUtils");

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const AUTO_ABSENT_INTERVAL_MS = 15 * 60 * 1000;

const localDateString = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const runAutoAbsentAttendance = async (now = new Date()) => {
  const overdueDate = parseDate(localDateString(new Date(now.getTime() - DAY_IN_MS)), {
    allowFuture: true,
  });
  if (!overdueDate) {
    throw new Error("Unable to determine the overdue attendance date.");
  }
  const nextDate = new Date(overdueDate.getTime() + DAY_IN_MS);
  const courses = await Course.find({
    startingDate: { $lt: nextDate },
    endingDate: { $gte: overdueDate },
    status: { $ne: "Inactive" },
  }).select("_id courseName courseCode");
  let markedCount = 0;

  for (const course of courses) {
    const students = await Student.find(courseStudentQuery(course)).select("_id");
    if (!students.length) continue;

    const result = await StudentAttendance.bulkWrite(
      students.map((student) => ({
        updateOne: {
          filter: {
            student_id: student._id,
            course_id: course._id,
            date: overdueDate,
          },
          update: {
            $setOnInsert: {
              status: "absent",
              marked_by_type: "system",
              marked_at: now,
              created_at: now,
            },
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );
    markedCount += result.upsertedCount || 0;
  }

  return { date: localDateString(new Date(overdueDate)), markedCount };
};

const startAutoAbsentAttendance = () => {
  let isRunning = false;
  const run = async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const result = await runAutoAbsentAttendance();
      console.info(
        `Auto-absent attendance completed for ${result.date}: ${result.markedCount} records created.`,
      );
    } catch (error) {
      console.error("Auto-absent attendance failed:", error);
    } finally {
      isRunning = false;
    }
  };

  run();
  const timer = setInterval(run, AUTO_ABSENT_INTERVAL_MS);
  timer.unref();
  return timer;
};

module.exports = {
  runAutoAbsentAttendance,
  startAutoAbsentAttendance,
};
