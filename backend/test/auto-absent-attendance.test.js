const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const Course = require("../src/models/Course.model");
const Student = require("../src/models/Student.models");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const { runAutoAbsentAttendance } = require("../src/utils/autoAbsentAttendance");

const replaceMethods = (replacements) => {
  const originals = replacements.map(([target, name, implementation]) => {
    const original = target[name];
    target[name] = implementation;
    return () => { target[name] = original; };
  });
  return () => originals.reverse().forEach((restore) => restore());
};

test("automatic attendance adds absent only when no daily record exists", async () => {
  const course = {
    _id: new mongoose.Types.ObjectId(),
    courseName: "Web Development",
    courseCode: "WEB101",
  };
  const student = { _id: new mongoose.Types.ObjectId() };
  const now = new Date(2026, 10, 27, 12, 0, 0);
  let operations;
  const restore = replaceMethods([
    [Course, "find", (filter) => {
      assert.equal(filter.status.$ne, "Inactive");
      return { select: async () => [course] };
    }],
    [Student, "find", () => ({ select: async () => [student] })],
    [StudentAttendance, "bulkWrite", async (updates) => {
      operations = updates;
      return { upsertedCount: 1 };
    }],
  ]);

  try {
    const result = await runAutoAbsentAttendance(now);

    assert.equal(result.markedCount, 1);
    assert.equal(operations.length, 1);
    assert.equal(operations[0].updateOne.filter.student_id, student._id);
    assert.equal(operations[0].updateOne.filter.course_id, course._id);
    assert.equal(operations[0].updateOne.update.$setOnInsert.status, "absent");
    assert.equal(operations[0].updateOne.update.$setOnInsert.marked_by_type, "system");
    assert.equal(operations[0].updateOne.upsert, true);
  } finally {
    restore();
  }
});
