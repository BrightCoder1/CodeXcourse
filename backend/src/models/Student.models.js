const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const studentSchema = new mongoose.Schema(
    {
        // Basic & Personal Details
        student_name: { type: String, required: true, trim: true },
        middle_name: { type: String, trim: true },
        last_name: { type: String, required: true, trim: true },
        date_of_birth: { type: Date, required: true },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true
        },
        blood_group: { type: String, trim: true },
        nationality: { type: String, default: 'Indian' },
        category: {
            type: String,
            enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'],
            default: 'General'
        },

        // Identity Details
        aadhar_card_number: { type: String, required: true, trim: true },
        pan_card_number: { type: String, trim: true, uppercase: true },

        // Contact Details
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            select: false,
            minlength: [8, 'Password must be at least 8 characters long']
        },
        phone_number: { type: String, required: true, trim: true },
        alternate_phone: { type: String, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        state: { type: String, required: true, trim: true },
        pin_code: { type: String, required: true, trim: true },
        country: { type: String, default: 'India' },

        // Parent / Guardian Details
        father_name: { type: String, required: true, trim: true },
        mother_name: { type: String, required: true, trim: true },
        guardian_name: { type: String, trim: true },
        parent_phone: { type: String, required: true, trim: true },
        parent_email: { type: String, lowercase: true, trim: true },
        parent_occupation: { type: String, trim: true },
        annual_family_income: { type: Number, default: 0 },

        // Academic Details
        qualification: { type: String, required: true, trim: true },
        tenth_board: { type: String, trim: true },
        tenth_passing_year: { type: Number },
        tenth_percentage: { type: Number },
        twelfth_board: { type: String, trim: true },
        twelfth_passing_year: { type: Number },
        twelfth_percentage: { type: Number },
        previous_college: { type: String, trim: true },
        previous_course: { type: String, trim: true },
        graduation_percentage: { type: Number },
        entrance_exam_name: { type: String, trim: true },
        entrance_exam_score: { type: Number },

        // Admission Details
        application_number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        admission_number: { type: String, trim: true },
        admission_date: { type: Date, default: Date.now },
        academic_session: { type: String, required: true, trim: true },
        department: { type: String, required: true, trim: true },
        course: { type: String, required: true, trim: true },
        course_ids: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
            default: undefined,
        },
        specialization: { type: String, trim: true },
        semester: { type: Number, default: 1, min: 1 },
        admission_type: {
            type: String,
            enum: ['Regular', 'Lateral Entry'],
            default: 'Regular'
        },
        admission_status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        roll_number: { type: String, trim: true },

        // Fee Details
        total_fee: { type: Number, required: true, min: 0 },
        admission_fee: { type: Number, default: 0 },
        tuition_fee: { type: Number, default: 0 },
        scholarship_amount: { type: Number, default: 0 },
        paid_amount: { type: Number, default: 0 },
        pending_amount: { type: Number, default: 0 },
        payment_status: {
            type: String,
            enum: ['Pending', 'Partial', 'Paid'],
            default: 'Pending'
        },
        payment_method: {
            type: String,
            enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'],
            default: 'Other'
        },
        transaction_id: { type: String, trim: true },
        last_payment_date: { type: Date },
        payment_history: [{
            receipt_number: { type: String, required: true },
            amount: { type: Number, required: true, min: 0.01 },
            payment_method: {
                type: String,
                enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'],
                required: true
            },
            received_by: { type: String, trim: true },
            remark: { type: String, trim: true },
            paid_at: { type: Date, default: Date.now },
            total_fee: { type: Number, required: true },
            pending_amount: { type: Number, required: true }
        }],

        // Remarks
        remarks: { type: String, trim: true }
    },
    { timestamps: true }
);

studentSchema.pre('save', async function () {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
});

studentSchema.methods.comparePassword = function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

studentSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            studentId: this._id.toString(),
            role: 'student',
            email: this.email
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = mongoose.model('Student', studentSchema);