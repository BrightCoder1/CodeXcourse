const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const EmployeeAttendance = require("../src/models/EmployeeAttendance.model");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const {
  getAdminStudentAttendance,
  getAttendanceSummary,
  saveAdminStudentAttendance,
} = require("../src/controllers/Attendance.controller");

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

const createQuery = (records) => ({
  populate() {
    return this;
  },
  sort() {
    return this;
  },
  then(resolve, reject) {
    return Promise.resolve(records).then(resolve, reject);
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

test("admin student records contain course attendance and in/out times only", async () => {
  const courseRecord = {
    _id: new mongoose.Types.ObjectId(),
    student_id: { student_name: "Asha" },
    date: new Date("2026-11-23T00:00:00.000Z"),
    status: "present",
    check_in: new Date("2026-11-23T08:00:00.000Z"),
    check_out: new Date("2026-11-23T10:30:00.000Z"),
    total_minutes: 150,
    toObject() {
      return { ...this };
    },
  };
  const restore = replaceMethods([
    [StudentAttendance, "find", (filter) => {
      assert.deepEqual(filter, {});
      return createQuery([courseRecord]);
    }],
  ]);
  try {
    const response = createResponse();
    await getAdminStudentAttendance({ query: {} }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.length, 1);
    assert.equal(response.body.data[0].record_type, "course");
    assert.equal(response.body.data[0].total_minutes, 150);
    assert.equal(response.body.data[0].check_out, courseRecord.check_out);
  } finally {
    restore();
  }
});

test("admin student attendance filters can combine a name with an application ID", async () => {
  const matchingRecord = {
    _id: new mongoose.Types.ObjectId(),
    student_id: {
      _id: new mongoose.Types.ObjectId(),
      student_name: "Asha",
      last_name: "Sharma",
      application_number: "APP-2026-102",
      roll_number: "ROLL-102",
    },
    toObject() {
      return { ...this };
    },
  };
  const otherRecord = {
    _id: new mongoose.Types.ObjectId(),
    student_id: {
      _id: new mongoose.Types.ObjectId(),
      student_name: "Asha",
      last_name: "Sharma",
      application_number: "APP-2026-101",
      roll_number: "ROLL-101",
    },
    toObject() {
      return { ...this };
    },
  };
  const restore = replaceMethods([
    [StudentAttendance, "find", (filter) => {
      assert.deepEqual(filter, {});
      return createQuery([matchingRecord, otherRecord]);
    }],
  ]);
  try {
    const response = createResponse();
    await getAdminStudentAttendance({
      query: { name: "asha", studentId: "app-2026-102" },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      response.body.data.map((record) => record._id),
      [matchingRecord._id],
    );
  } finally {
    restore();
  }
});

test("admin can change a student's course attendance status", async () => {
  const recordId = new mongoose.Types.ObjectId();
  const updatedRecord = {
    _id: recordId,
    status: "absent",
    check_in: new Date("2026-11-23T08:00:00.000Z"),
    check_out: new Date("2026-11-23T10:30:00.000Z"),
    total_minutes: 150,
    toObject() {
      return { ...this };
    },
  };
  const updateQuery = {
    populate() {
      return this;
    },
    then(resolve, reject) {
      return Promise.resolve(updatedRecord).then(resolve, reject);
    },
  };
  let update;
  const restore = replaceMethods([
    [StudentAttendance, "findByIdAndUpdate", (...args) => {
      update = args;
      return updateQuery;
    }],
  ]);
  try {
    const response = createResponse();
    await saveAdminStudentAttendance({
      params: { attendanceId: recordId.toString() },
      body: { status: "absent" },
      user: { _id: new mongoose.Types.ObjectId() },
    }, response);

    assert.equal(response.statusCode, 200);
    assert.equal(update[0], recordId.toString());
    assert.equal(update[1].$set.status, "absent");
    assert.equal(update[1].$set.marked_by_type, "admin");
    assert.equal(Object.hasOwn(update[1].$set, "check_in"), false);
    assert.equal(Object.hasOwn(update[1].$set, "check_out"), false);
    assert.equal(response.body.data.record_type, "course");
  } finally {
    restore();
  }
});

test("attendance summary reports active student check-ins without daily attendance", async () => {
  let studentAggregateCall = 0;
  const restore = replaceMethods([
    [StudentAttendance, "aggregate", async () => {
      studentAggregateCall += 1;
      return studentAggregateCall === 1
        ? [{ _id: "in_progress", count: 2 }]
        : [];
    }],
    [EmployeeAttendance, "aggregate", async () => []],
  ]);
  try {
    const response = createResponse();
    await getAttendanceSummary({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.students.in_progress, 2);
    assert.equal(Object.hasOwn(response.body.data, "dailyStudents"), false);
  } finally {
    restore();
  }
});
