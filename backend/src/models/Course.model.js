const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
            required: [true, 'Course name is required'],
            trim: true
        },
        courseCode: {
            type: String,
            required: [true, 'Course code is required'],
            unique: true,
            uppercase: true,
            trim: true
        },
        instructorName: {
            type: String,
            required: [true, 'Instructor name is required'],
            trim: true
        },
        teacherName: {
            type: String,
            trim: true,
            default: ''
        },
        qualification: {
            type: String,
            trim: true,
            default: ''
        },
        startingDate: {
            type: Date,
            required: [true, 'Starting date is required']
        },
        endingDate: {
            type: Date,
            required: [true, 'Ending date is required']
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Upcoming', 'Completed'],
            default: 'Active'
        },
        courseImageUrl: {
            type: String,
            trim: true,
            default: ''
        }
    },
    {
        timestamps: true
    }
);


courseSchema.index({ courseCode: 1 });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;