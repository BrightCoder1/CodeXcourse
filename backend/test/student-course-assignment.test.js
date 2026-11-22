const assert = require("node:assert/strict");
const test = require("node:test");
const mongoose = require("mongoose");
const AttendanceSession = require("../src/models/AttendanceSession.model");
const Course = require("../src/models/Course.model");
const CourseAssignment = require("../src/models/CourseAssignment.model");
const Student = require("../src/models/Student.models");
const StudentAttendance = require("../src/models/StudentAttendance.model");
const { student_register } = require("../src/controllers/Student.controller");
const { getStudentAttendanceDashboard } = require("../src/controllers/SelfAttendance.controller");

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

const replaceMethods = (replacements) => {
  const originals = replacements.map(([target, name, implementation]) => {
    const original = target[name];
    target[name] = implementation;
    return () => { target[name] = original; };
  });
  return () => originals.reverse().forEach((restore) => restore());
};

const validStudentBody = () => ({
  student_name: "Asha",
  last_name: "Sharma",
  date_of_birth: "2008-03-10",
  gender: "Female",
  aadhar_card_number: "123456789012",
  email: "asha@example.com",
  password: "student-password",
  phone_number: "9876543210",
  address: "Main Road",
  city: "Jaipur",
  state: "Rajasthan",
  pin_code: "302001",
  father_name: "Parent",
  mother_name: "Parent",
  parent_phone: "9876543211",
  qualification: "Secondary",
  application_number: "APP-2026-001",
  academic_session: "2026-27",
  department: "Computer Science",
  course: "secure-course",
  semester: 1,
  total_fee: 10000,
});

test("admin student registration stores a canonical course from the course catalog", async () => {
  let savedStudent;
  const courseId = new mongoose.Types.ObjectId();
  const originalSave = Student.prototype.save;
  Student.prototype.save = async function save() {
    savedStudent = this;
    return this;
  };
  const restore = replaceMethods([
    [Course, "findOne", () => ({
      select: async () => ({
        _id: courseId,
        courseName: "Secure Course",
      }),
    })],
    [Student, "findOne", async () => null],
  ]);
  try {
    const res = response();
    await student_register({ body: validStudentBody() }, res);

    assert.equal(res.statusCode, 201);
    assert.equal(savedStudent.course, "Secure Course");
    assert.equal(res.body.data.course, "Secure Course");
    assert.deepEqual(savedStudent.course_ids.map((id) => id.toString()), [courseId.toString()]);
  } finally {
    restore();
    Student.prototype.save = originalSave;
  }
});

test("student course dashboard includes the teacher assigned by the administrator", async () => {
  const courseId = new mongoose.Types.ObjectId();
  const teacher = {
    _id: new mongoose.Types.ObjectId(),
    emp_name: "Ravi Kumar",
    emp_id: "EMP-1001",
    email: "ravi@example.com",
    emp_department: "Web Development",
  };
  const course = {
    _id: courseId,
    courseName: "Secure Course",
    courseCode: "SEC101",
    status: "Active",
    toObject() {
      return {
        _id: this._id,
        courseName: this.courseName,
        courseCode: this.courseCode,
        status: this.status,
      };
    },
  };
  const assignmentQuery = {
    populate() {
      return this;
    },
    select: async () => [{ course_id: courseId, teacher_id: teacher }],
  };
  const restore = replaceMethods([
    [Course, "find", () => ({ select: async () => [course] })],
    [AttendanceSession, "find", () => ({ select: async () => [] })],
    [StudentAttendance, "find", () => ({ select: async () => [] })],
    [CourseAssignment, "find", () => assignmentQuery],
  ]);
  try {
    const res = response();
    await getStudentAttendanceDashboard({
      student: {
        _id: new mongoose.Types.ObjectId(),
        course: "Secure Course",
      },
    }, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.data.courses.length, 1);
    assert.equal(res.body.data.courses[0].courseName, "Secure Course");
    assert.deepEqual(res.body.data.courses[0].assignedTeachers, [teacher]);
    assert.equal(Object.prototype.hasOwnProperty.call(res.body.data, "dailyAttendance"), false);
  } finally {
    restore();
  }
});
