const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const Course = require("../src/models/Course.model");
const CourseAssignment = require("../src/models/CourseAssignment.model");
const AttendanceSession = require("../src/models/AttendanceSession.model");
const Student = require("../src/models/Student.models");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const User = require("../src/models/user.models");
const {
  createCourse,
  deleteCourse,
  updateCourse,
} = require("../src/controllers/Course.controller");

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(statusCode) {
    this.statusCode = statusCode;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
});

const replaceMethods = (replacements) => {
  const originals = replacements.map(([target, name, implementation]) => {
    const original = target[name];
    target[name] = implementation;
    return () => { target[name] = original; };
  });
  return () => originals.reverse().forEach((restore) => restore());
};

test("course creation creates a primary attendance assignment for its selected teacher", async () => {
  const teacherId = new mongoose.Types.ObjectId();
  let savedCourse;
  let createdAssignment;
  const originalSave = Course.prototype.save;
  Course.prototype.save = async function save() {
    savedCourse = this;
    return this;
  };
  const restore = replaceMethods([
    [User, "findOne", () => ({
      select: async () => ({
        _id: teacherId,
        emp_name: "Ravi Kumar",
        emp_qualification: "MCA",
      }),
    })],
    [Course, "findOne", async () => null],
    [CourseAssignment, "deleteMany", async () => ({ deletedCount: 0 })],
    [CourseAssignment, "findOneAndUpdate", async (filter, update) => {
      createdAssignment = { filter, update };
      return { _id: new mongoose.Types.ObjectId() };
    }],
  ]);
  try {
    const res = createResponse();
    await createCourse({
      body: {
        courseName: "Node.js",
        courseCode: "NODE001",
        instructorName: "Lead Instructor",
        teacherId: teacherId.toString(),
        startingDate: "2026-01-01",
        endingDate: "2026-12-31",
      },
    }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(savedCourse.teacherName, "Ravi Kumar");
    assert.equal(savedCourse.qualification, "MCA");
    assert.equal(createdAssignment.filter.teacher_id.toString(), teacherId.toString());
    assert.equal(createdAssignment.filter.course_id.toString(), savedCourse._id.toString());
    assert.equal(createdAssignment.update.$set.is_primary, true);
  } finally {
    restore();
    Course.prototype.save = originalSave;
  }
});

test("course updates retain old name/code aliases and support clearing the primary teacher", async () => {
  const courseId = new mongoose.Types.ObjectId();
  const currentCourse = {
    _id: courseId,
    courseName: "Legacy Course",
    courseCode: "OLD101",
    aliases: [],
    startingDate: new Date("2026-01-01T00:00:00.000Z"),
    endingDate: new Date("2026-12-31T00:00:00.000Z"),
  };
  let update;
  let assignmentRemoval;
  const restore = replaceMethods([
    [Course, "findById", async () => currentCourse],
    [Course, "findOne", async () => null],
    [Course, "findByIdAndUpdate", async (id, changes) => {
      update = { id, changes };
      return { ...currentCourse, ...changes.$set };
    }],
    [CourseAssignment, "deleteMany", async (filter) => {
      assignmentRemoval = filter;
      return { deletedCount: 1 };
    }],
  ]);
  try {
    const response = createResponse();
    await updateCourse({
      params: { id: courseId.toString() },
      body: {
        courseName: "Updated Course",
        courseCode: "NEW101",
        teacherId: "",
      },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(update.id.toString(), courseId.toString());
    assert.deepEqual(update.changes.$set.aliases, ["Legacy Course", "OLD101"]);
    assert.equal(update.changes.$set.teacherName, "");
    assert.deepEqual(assignmentRemoval, { course_id: courseId, is_primary: true });
  } finally {
    restore();
  }
});

test("course creation rejects schedules whose end date precedes the start date", async () => {
  const response = createResponse();
  await createCourse({
    body: {
      courseName: "Node.js",
      courseCode: "NODE002",
      instructorName: "Lead Instructor",
      startingDate: "2026-12-31",
      endingDate: "2026-01-01",
    },
  }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "Course end date must be on or after its start date.");
});

test("course deletion is blocked when students or attendance data reference it", async () => {
  const courseId = new mongoose.Types.ObjectId();
  const course = {
    _id: courseId,
    courseName: "Secure Course",
    courseCode: "SEC101",
  };
  let deleted = false;
  const restore = replaceMethods([
    [Course, "findById", async () => course],
    [Student, "countDocuments", async () => 1],
    [CourseAssignment, "countDocuments", async () => 0],
    [AttendanceSession, "countDocuments", async () => 0],
    [StudentAttendance, "countDocuments", async () => 0],
    [Course, "findByIdAndDelete", async () => {
      deleted = true;
      return course;
    }],
  ]);
  try {
    const response = createResponse();
    await deleteCourse({ params: { id: courseId.toString() } }, response);

    assert.equal(response.statusCode, 409);
    assert.equal(deleted, false);
  } finally {
    restore();
  }
});
