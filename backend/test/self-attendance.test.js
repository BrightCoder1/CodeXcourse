const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const AttendanceSession = require("../src/models/AttendanceSession.model");
const Course = require("../src/models/Course.model");
const CourseAssignment = require("../src/models/CourseAssignment.model");
const DailyAttendance = require("../src/models/DailyAttendance.model");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const {
  markStudentCourseAttendance,
  markStudentDailyAttendance,
} = require("../src/controllers/SelfAttendance.controller");

const ids = {
  student: new mongoose.Types.ObjectId(),
  anotherStudent: new mongoose.Types.ObjectId(),
  course: new mongoose.Types.ObjectId(),
  teacher: new mongoose.Types.ObjectId(),
  session: new mongoose.Types.ObjectId(),
};

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

const createStudentRequest = () => ({
  student: { _id: ids.student, course: "Secure Course" },
  params: { courseId: ids.course.toString() },
  body: { studentId: ids.anotherStudent.toString() },
});

const queryResult = (value) => ({ select: async () => value });

const replaceMethods = (replacements) => {
  const originals = replacements.flatMap(([target, methods]) =>
    Object.entries(methods).map(([name, implementation]) => {
      const original = target[name];
      target[name] = implementation;
      return () => { target[name] = original; };
    })
  );
  return () => originals.reverse().forEach((restore) => restore());
};

test("course self-attendance uses authenticated student and an active assigned session", async () => {
  let created;
  const restore = replaceMethods([
    [Course, {
      findOne: (filter) => {
        assert.equal(filter._id.toString(), ids.course.toString());
        return queryResult({ _id: ids.course });
      },
    }],
    [StudentAttendance, {
      findOne: () => queryResult(null),
      create: async (record) => {
        created = record;
        return record;
      },
    }],
    [AttendanceSession, {
      findOne: async () => ({
        _id: ids.session,
        teacher_id: ids.teacher,
        is_open: true,
        start_time: new Date(Date.now() - 60_000),
        end_time: new Date(Date.now() + 60_000),
      }),
    }],
    [CourseAssignment, { exists: async () => ({ _id: ids.course }) }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), response);

    assert.equal(response.statusCode, 201);
    assert.equal(created.student_id.toString(), ids.student.toString());
    assert.equal(created.marked_by.toString(), ids.student.toString());
    assert.equal(created.marked_by_type, "student");
    assert.equal(created.session_id.toString(), ids.session.toString());
  } finally {
    restore();
  }
});

test("course self-attendance rejects students not enrolled in the requested course", async () => {
  const restore = replaceMethods([
    [Course, { findOne: () => queryResult(null) }],
    [StudentAttendance, { findOne: () => queryResult(null) }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), response);

    assert.equal(response.statusCode, 403);
    assert.equal(response.body.message, "You are not enrolled in this course.");
  } finally {
    restore();
  }
});

test("course self-attendance returns the required duplicate and closed-window messages", async () => {
  const restore = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, { findOne: () => queryResult({ _id: new mongoose.Types.ObjectId() }) }],
  ]);
  try {
    const duplicateResponse = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), duplicateResponse);
    assert.equal(duplicateResponse.statusCode, 409);
    assert.equal(duplicateResponse.body.message, "Attendance already marked");
  } finally {
    restore();
  }

  const restoreClosedSession = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, { findOne: () => queryResult(null) }],
    [AttendanceSession, { findOne: async () => null }],
  ]);
  try {
    const closedResponse = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), closedResponse);
    assert.equal(closedResponse.statusCode, 409);
    assert.equal(closedResponse.body.message, "Attendance window is closed");
  } finally {
    restoreClosedSession();
  }
});

test("daily self-attendance derives student ID from the authenticated session", async () => {
  let created;
  const restore = replaceMethods([
    [DailyAttendance, {
      findOne: () => queryResult(null),
      create: async (record) => {
        created = record;
        return record;
      },
    }],
  ]);
  try {
    const request = createStudentRequest();
    request.body.student_id = ids.anotherStudent.toString();
    const response = createResponse();
    await markStudentDailyAttendance(request, response);

    assert.equal(response.statusCode, 201);
    assert.equal(created.student_id.toString(), ids.student.toString());
    assert.equal(created.status, "present");
  } finally {
    restore();
  }
});

test("daily self-attendance rejects a second mark for the day", async () => {
  const restore = replaceMethods([
    [DailyAttendance, {
      findOne: () => queryResult({ _id: new mongoose.Types.ObjectId() }),
    }],
  ]);
  try {
    const response = createResponse();
    await markStudentDailyAttendance(createStudentRequest(), response);

    assert.equal(response.statusCode, 409);
    assert.equal(response.body.message, "Attendance already marked");
  } finally {
    restore();
  }
});
