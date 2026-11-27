const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const Course = require("../src/models/Course.model");
const Student = require("../src/models/Student.models");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const { todayString } = require("../src/utils/attendanceUtils");
const {
  getAdminCourseStudents,
  saveAdminCourseStudents,
} = require("../src/controllers/Attendance.controller");

const response = () => ({
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

const selectedQuery = (value) => ({ select: async () => value });
const sortedStudentQuery = (value) => ({
  select() {
    return this;
  },
  sort: async () => value,
});

const replaceMethods = (replacements) => {
  const originals = replacements.map(([target, name, implementation]) => {
    const original = target[name];
    target[name] = implementation;
    return () => { target[name] = original; };
  });
  return () => originals.reverse().forEach((restore) => restore());
};

test("admin course student list includes explicit and legacy enrollments", async () => {
  const courseId = new mongoose.Types.ObjectId();
  const course = { _id: courseId, courseName: "Web Development", courseCode: "WEB101" };
  const explicitStudent = {
    _id: new mongoose.Types.ObjectId(),
    course_ids: [courseId],
    toObject() { return this; },
  };
  const legacyStudent = {
    _id: new mongoose.Types.ObjectId(),
    course: "web-development",
    course_ids: undefined,
    toObject() { return this; },
  };
  const unassignedStudent = {
    _id: new mongoose.Types.ObjectId(),
    course: "Web Development",
    course_ids: [],
    toObject() { return this; },
  };
  const restore = replaceMethods([
    [Course, "findById", () => selectedQuery(course)],
    [Student, "find", () => sortedStudentQuery([
      explicitStudent,
      legacyStudent,
      unassignedStudent,
    ])],
  ]);
  try {
    const res = response();
    await getAdminCourseStudents({ params: { courseId: courseId.toString() } }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.data.assignedStudentIds, [
      explicitStudent._id.toString(),
      legacyStudent._id.toString(),
    ]);
  } finally {
    restore();
  }
});

test("admin attendance roster returns existing records for enrolled students", async () => {
  const courseId = new mongoose.Types.ObjectId();
  const studentId = new mongoose.Types.ObjectId();
  const attendance = {
    student_id: studentId,
    status: "late",
  };
  const restore = replaceMethods([
    [Course, "findById", () => selectedQuery({
      _id: courseId,
      courseName: "Web Development",
      courseCode: "WEB101",
    })],
    [Student, "find", () => sortedStudentQuery([{
      _id: studentId,
      course_ids: [courseId],
      toObject() { return this; },
    }])],
    [StudentAttendance, "find", (filter) => {
      assert.equal(filter.course_id, courseId);
      assert.equal(filter.date.toISOString().slice(0, 10), todayString());
      return { select: async () => [attendance] };
    }],
  ]);
  try {
    const res = response();
    await getAdminCourseStudents({
      params: { courseId: courseId.toString() },
      query: { date: todayString() },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.assignedStudentIds[0], studentId.toString());
    assert.equal(res.body.data.attendanceByStudent[studentId.toString()].status, "late");
  } finally {
    restore();
  }
});

test("admin course assignment changes preserve other courses and migrate legacy enrollment", async () => {
  const currentCourseId = new mongoose.Types.ObjectId();
  const legacyCourseId = new mongoose.Types.ObjectId();
  const otherCourseId = new mongoose.Types.ObjectId();
  const currentCourse = {
    _id: currentCourseId,
    courseName: "New Course",
    courseCode: "NEW101",
  };
  const students = [
    {
      _id: new mongoose.Types.ObjectId(),
      course_ids: [otherCourseId],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      course_ids: [currentCourseId, otherCourseId],
    },
    {
      _id: new mongoose.Types.ObjectId(),
      course: "legacy-course",
      course_ids: undefined,
    },
  ];
  const otherCourse = {
    _id: legacyCourseId,
    courseName: "Legacy Course",
    courseCode: "LEG101",
  };
  let bulkOperations;
  const restore = replaceMethods([
    [Course, "findById", () => selectedQuery(currentCourse)],
    [Course, "find", () => selectedQuery([currentCourse, otherCourse])],
    [Student, "find", () => sortedStudentQuery(students)],
    [Student, "bulkWrite", async (operations) => {
      bulkOperations = operations;
    }],
  ]);
  try {
    const res = response();
    await saveAdminCourseStudents({
      params: { courseId: currentCourseId.toString() },
      body: {
        studentIds: [
          students[0]._id.toString(),
          students[2]._id.toString(),
        ],
      },
    }, res);

    assert.equal(res.statusCode, 200);
    const assignmentsByStudent = new Map(
      bulkOperations.map((operation) => [
        operation.updateOne.filter._id.toString(),
        operation.updateOne.update.$set.course_ids,
      ])
    );
    assert.deepEqual(assignmentsByStudent.get(students[0]._id.toString()).sort(), [
      currentCourseId.toString(),
      otherCourseId.toString(),
    ].sort());
    assert.deepEqual(
      assignmentsByStudent.get(students[1]._id.toString()),
      [otherCourseId.toString()],
    );
    assert.deepEqual(assignmentsByStudent.get(students[2]._id.toString()).sort(), [
      currentCourseId.toString(),
      legacyCourseId.toString(),
    ].sort());
  } finally {
    restore();
  }
});

test("admin can remove a student's final course assignment", async () => {
  const courseId = new mongoose.Types.ObjectId();
  const course = { _id: courseId, courseName: "Web Development", courseCode: "WEB101" };
  const student = {
    _id: new mongoose.Types.ObjectId(),
    course_ids: [courseId],
  };
  let bulkOperations;
  const restore = replaceMethods([
    [Course, "findById", () => selectedQuery(course)],
    [Course, "find", () => selectedQuery([course])],
    [Student, "find", () => sortedStudentQuery([student])],
    [Student, "bulkWrite", async (operations) => {
      bulkOperations = operations;
    }],
  ]);
  try {
    const res = response();
    await saveAdminCourseStudents({
      params: { courseId: courseId.toString() },
      body: { studentIds: [] },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.deepEqual(bulkOperations[0].updateOne.update.$set.course_ids, []);
  } finally {
    restore();
  }
});
