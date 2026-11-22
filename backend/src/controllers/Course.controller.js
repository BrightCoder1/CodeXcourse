const Course = require("../models/Course.model");
const AttendanceSession = require("../models/AttendanceSession.model");
const CourseAssignment = require("../models/CourseAssignment.model");
const Student = require("../models/Student.models");
const StudentAttendance = require("../models/StudentAttendance.model");
const { courseStudentQuery } = require("../utils/attendanceUtils");

const handleCourseError = (res, error, fallbackMessage) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Course code already exists. Please choose a different code.'
    });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({
    success: false,
    message: fallbackMessage
  });
};

const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseCode,
      instructorName,
      teacherName,
      qualification,
      startingDate,
      endingDate,
      status,
      courseImageUrl
    } = req.body;

    if (!courseName || !courseCode || !instructorName || !startingDate || !endingDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (Course Name, Code, Instructor, Dates).'
      });
    }

    const existingCourse = await Course.findOne({ courseCode: courseCode.trim().toUpperCase() });
    if (existingCourse) {
      return res.status(409).json({
        success: false,
        message: 'Course code already exists. Please choose a different code.'
      });
    }

    const newCourse = new Course({
      courseName: courseName.trim(),
      courseCode: courseCode.trim().toUpperCase(),
      instructorName: instructorName.trim(),
      teacherName: teacherName ? teacherName.trim() : '',
      qualification: qualification ? qualification.trim() : '',
      startingDate,
      endingDate,
      status: status || 'Active',
      courseImageUrl: courseImageUrl || ''
    });

    const savedCourse = await newCourse.save();

    return res.status(201).json({
      success: true,
      message: 'Course created successfully!',
      data: savedCourse
    });
  } catch (error) {
    return handleCourseError(res, error, 'Server error occurred while creating course.');
  }
};


const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    return handleCourseError(res, error, 'Failed to fetch courses from server.');
  }
};


const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }
    return res.status(200).json({
      success: true,
      data: course
    });
  } catch (error) {
    return handleCourseError(res, error, 'Failed to fetch course details.');
  }
};


const updateCourse = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.courseCode) {
      updates.courseCode = updates.courseCode.trim().toUpperCase();
      const duplicateCourse = await Course.findOne({
        courseCode: updates.courseCode,
        _id: { $ne: req.params.id }
      });
      if (duplicateCourse) {
        return res.status(409).json({
          success: false,
          message: 'Course code already exists. Please choose a different code.'
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course updated successfully!',
      data: updatedCourse
    });
  } catch (error) {
    return handleCourseError(res, error, 'Failed to update course.');
  }
};



const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    const [studentCount, teacherAssignmentCount, sessionCount, attendanceCount] = await Promise.all([
      Student.countDocuments(courseStudentQuery(course)),
      CourseAssignment.countDocuments({ course_id: course._id }),
      AttendanceSession.countDocuments({ course_id: course._id }),
      StudentAttendance.countDocuments({ course_id: course._id }),
    ]);
    if (studentCount || teacherAssignmentCount || sessionCount || attendanceCount) {
      return res.status(409).json({
        success: false,
        message: 'Remove assigned students, teachers, and attendance records before deleting this course.'
      });
    }

    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Course deleted successfully!'
    });
  } catch (error) {
    return handleCourseError(res, error, 'Failed to delete course.');
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse
};
