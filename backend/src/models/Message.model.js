const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    ask_about: {
        type: String,
        required: [true, 'Please select what your inquiry is about.'],
        enum: ['Course Admission', 'Curriculum & Syllabus', 'Corporate Training', 'Career Counseling'],
        default: 'Course Admission'
    },
    fullname: {
        type: String,
        required: [true, 'Full name is required.'],
        trim: true,
        maxlength: 120
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        trim: true,
        lowercase: true,
        maxlength: 254
    },
    phone: {
        type: String,
        trim: true,
        default: '',
        maxlength: 30
    },
    query: {
        type: String,
        required: [true, 'Message is required.'],
        trim: true,
        maxlength: 5000
    }
}, {
    timestamps: true
});

MessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const MessageDB = mongoose.model('Message', MessageSchema);


module.exports = MessageDB;