const assert = require("node:assert/strict");
const test = require("node:test");
const DailyAttendance = require("../src/models/DailyAttendance.model");
const EmployeeAttendance = require("../src/models/EmployeeAttendance.model");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const {
  getAdminStudentAttendance,
  getAttendanceSummary,
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

test("admin student records include daily self-attendance with course records", async () => {
  const courseRecord = {
    _id: "course-record",
    student_id: { student_name: "Asha" },
    date: new Date("2026-11-23T00:00:00.000Z"),
    status: "present",
    created_at: new Date("2026-11-23T08:00:00.000Z"),
    toObject() {
      return { ...this };
    },
  };
  const dailyRecord = {
    _id: "daily-record",
    student_id: { student_name: "Asha" },
    date: new Date("2026-11-23T00:00:00.000Z"),
    status: "present",
    marked_at: new Date("2026-11-23T07:10:00.000Z"),
    toObject() {
      return { ...this };
    },
  };
  const restore = replaceMethods([
    [StudentAttendance, "find", (filter) => {
      assert.deepEqual(filter, {});
      return createQuery([courseRecord]);
    }],
    [DailyAttendance, "find", (filter) => {
      assert.deepEqual(filter, {});
      return createQuery([dailyRecord]);
    }],
  ]);
  try {
    const response = createResponse();
    await getAdminStudentAttendance({ query: {} }, response);

    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      response.body.data.map((record) => record.record_type),
      ["course", "daily"]
    );
    assert.equal(response.body.data[1].marked_at, dailyRecord.marked_at);
  } finally {
    restore();
  }
});

test("admin attendance summary includes today's daily self-check-ins", async () => {
  const restore = replaceMethods([
    [StudentAttendance, "aggregate", async () => []],
    [EmployeeAttendance, "aggregate", async () => []],
    [DailyAttendance, "aggregate", async () => [{ _id: "present", count: 3 }]],
  ]);
  try {
    const response = createResponse();
    await getAttendanceSummary({}, response);

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.data.dailyStudents.present, 3);
  } finally {
    restore();
  }
});
