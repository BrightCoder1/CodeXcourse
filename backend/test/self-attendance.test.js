const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const Course = require("../src/models/Course.model");
const CourseAssignment = require("../src/models/CourseAssignment.model");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const {
  applyStudentCourseLeave,
  getStudentAttendanceDashboard,
  markStudentCourseAttendance,
} = require("../src/controllers/SelfAttendance.controller");
const {
  courseStudentQuery,
  enrolledCourseQuery,
  matchesLegacyCourseEnrollment,
  todayString,
} = require("../src/utils/attendanceUtils");

const ids = {
  student: new mongoose.Types.ObjectId(),
  anotherStudent: new mongoose.Types.ObjectId(),
  course: new mongoose.Types.ObjectId(),
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

const createStudentRequest = (action = "check-in") => ({
  student: { _id: ids.student, course: "Secure Course" },
  params: { courseId: ids.course.toString() },
  body: { action, studentId: ids.anotherStudent.toString() },
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

test("course matching supports slugged course names and stored course IDs", () => {
  const enrollmentQuery = enrolledCourseQuery("secure-course");
  assert.equal(enrollmentQuery.$or[0].courseName.test("Secure Course"), true);
  assert.equal(enrollmentQuery.$or[0].courseName.test("secure_course"), true);
  assert.equal(enrollmentQuery.$or[1].courseCode.test("secure-course"), true);

  const storedCourseId = new mongoose.Types.ObjectId().toString();
  assert.deepEqual(enrolledCourseQuery(storedCourseId).$or[2], { _id: storedCourseId });

  const courseId = new mongoose.Types.ObjectId();
  const course = { _id: courseId, courseName: "Secure Course", courseCode: "SEC101" };
  const rosterQuery = courseStudentQuery(course);
  assert.equal(rosterQuery.$or[0].course_ids, courseId);
  assert.equal(rosterQuery.$or[1].course_ids.$exists, false);
  assert.equal(rosterQuery.$or[1].course.$in[0].test("secure-course"), true);
  assert.equal(rosterQuery.$or[1].course.$in[1].test("SEC101"), true);
  assert.equal(matchesLegacyCourseEnrollment("secure-course", course), true);
});

test("student can check in without a teacher session and starts an in-progress record", async () => {
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
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), response);

    assert.equal(response.statusCode, 201);
    assert.equal(created.student_id.toString(), ids.student.toString());
    assert.equal(created.marked_by.toString(), ids.student.toString());
    assert.equal(created.marked_by_type, "student");
    assert.equal(created.status, "in_progress");
    assert.ok(created.check_in instanceof Date);
    assert.equal(created.check_out, null);
    assert.equal(created.total_minutes, 0);
    assert.equal(created.session_id, null);
  } finally {
    restore();
  }
});

test("student check-out records server-calculated minutes and completes attendance", async () => {
  const checkIn = new Date(Date.now() - 95 * 60_000);
  let update;
  const restore = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, {
      findOne: () => queryResult({
        _id: new mongoose.Types.ObjectId(),
        check_in: checkIn,
        status: "in_progress",
      }),
      findOneAndUpdate: async (filter, changes, options) => {
        update = { filter, changes, options };
        return { ...changes.$set };
      },
    }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest("check-out"), response);

    assert.equal(response.statusCode, 201);
    assert.equal(update.changes.$set.status, "present");
    assert.ok(update.changes.$set.total_minutes >= 95);
    assert.ok(update.changes.$set.check_out instanceof Date);
    assert.equal(update.options.new, true);
  } finally {
    restore();
  }
});

test("student can check out a legacy self-marked record and backfill its check-in time", async () => {
  const markedAt = new Date(Date.now() - 70 * 60_000);
  let update;
  const restore = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, {
      findOne: (filter) => queryResult(filter.status === "present"
        ? {
          _id: new mongoose.Types.ObjectId(),
          status: "present",
          marked_at: markedAt,
        }
        : null),
      findOneAndUpdate: async (filter, changes) => {
        update = { filter, changes };
        return changes.$set;
      },
    }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest("check-out"), response);

    assert.equal(response.statusCode, 201);
    assert.equal(update.changes.$set.check_in, markedAt);
    assert.ok(update.changes.$set.total_minutes >= 70);
    assert.ok(update.filter.$or);
  } finally {
    restore();
  }
});

test("student dashboard offers checkout for a legacy self-marked attendance record", async () => {
  const markedAt = new Date(Date.now() - 70 * 60_000);
  const course = {
    _id: ids.course,
    courseName: "Secure Course",
    courseCode: "SEC101",
    toObject() {
      return { _id: this._id, courseName: this.courseName, courseCode: this.courseCode };
    },
  };
  const legacyRecord = {
    course_id: ids.course,
    status: "present",
    marked_by_type: "student",
    session_id: ids.session,
    marked_at: markedAt,
    created_at: markedAt,
    toObject() {
      return { ...this };
    },
  };
  const restore = replaceMethods([
    [Course, { find: () => queryResult([course]) }],
    [CourseAssignment, { find: () => ({
      populate() { return this; },
      select: async () => [],
    }) }],
    [StudentAttendance, { find: () => queryResult([legacyRecord]) }],
  ]);
  try {
    const response = createResponse();
    await getStudentAttendanceDashboard({ student: { _id: ids.student, course: "Secure Course" } }, response);
    const attendance = response.body.data.courses[0].attendance;
    assert.equal(attendance.status, "in_progress");
    assert.equal(attendance.check_in, markedAt);
    assert.equal(attendance.check_out, null);
  } finally {
    restore();
  }
});

test("student cannot check in when not enrolled or already checked in", async () => {
  const restoreNotEnrolled = replaceMethods([
    [Course, { findOne: () => queryResult(null) }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), response);
    assert.equal(response.statusCode, 403);
    assert.equal(response.body.message, "You are not enrolled in this course.");
  } finally {
    restoreNotEnrolled();
  }

  const restoreDuplicate = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, { findOne: () => queryResult({ _id: ids.session }) }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest(), response);
    assert.equal(response.statusCode, 409);
  } finally {
    restoreDuplicate();
  }
});

test("student cannot check out without an active check-in", async () => {
  const restore = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, { findOne: () => queryResult(null) }],
  ]);
  try {
    const response = createResponse();
    await markStudentCourseAttendance(createStudentRequest("check-out"), response);
    assert.equal(response.statusCode, 409);
    assert.equal(response.body.message, "Check in to this course before checking out.");
  } finally {
    restore();
  }
});

test("student can apply for leave for an enrolled course using authenticated student ID", async () => {
  let created;
  const restore = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, {
      create: async (record) => {
        created = record;
        return record;
      },
    }],
  ]);
  try {
    const response = createResponse();
    await applyStudentCourseLeave({
      ...createStudentRequest(),
      body: { date: todayString(), reason: "Medical appointment" },
    }, response);

    assert.equal(response.statusCode, 201);
    assert.equal(created.student_id.toString(), ids.student.toString());
    assert.equal(created.status, "leave");
    assert.equal(created.leave_reason, "Medical appointment");
  } finally {
    restore();
  }
});

test("leave applications reject empty reasons and duplicate course dates", async () => {
  const restoreInvalid = replaceMethods([]);
  try {
    const response = createResponse();
    await applyStudentCourseLeave({
      ...createStudentRequest(),
      body: { date: todayString(), reason: " " },
    }, response);
    assert.equal(response.statusCode, 400);
  } finally {
    restoreInvalid();
  }

  const duplicateError = Object.assign(new Error("duplicate"), { code: 11000 });
  const restoreDuplicate = replaceMethods([
    [Course, { findOne: () => queryResult({ _id: ids.course }) }],
    [StudentAttendance, { create: async () => { throw duplicateError; } }],
  ]);
  try {
    const response = createResponse();
    await applyStudentCourseLeave({
      ...createStudentRequest(),
      body: { date: todayString(), reason: "Out of town" },
    }, response);
    assert.equal(response.statusCode, 409);
  } finally {
    restoreDuplicate();
  }
});
