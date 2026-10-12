const mongoose = require("mongoose");

const StudentSchema = mongoose.Schema(
    {
        student_name: {
            type: String,
            required: true,
            trim: true
        },

        middle_name: {
            type: String,
            trim: true,
            default: ""
        },

        last_name: {
            type: String,
            required: true,
            trim: true
        },

        date_of_birth: {
            type: Date,
            required: true
        },

        gender: {
            type: String,
            enum: ["Male", "Female", "Other"],
            required: true
        },

        blood_group: {
            type: String,
            default: ""
        },

        nationality: {
            type: String,
            default: "Indian"
        },

        category: {
            type: String,
            enum: ["General", "OBC", "SC", "ST", "EWS", "Other"],
            default: "General"
        },

        // Identity Details
        aadhar_card_number: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{12}$/, "Aadhar number must contain 12 digits"]
        },

        pan_card_number: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN card number format"],
            default: undefined
        },

        // Contact Details
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        phone_number: {
            type: String,
            required: true,
            trim: true,
            match: [/^[0-9]{10}$/, "Phone number must contain 10 digits"]
        },

        alternate_phone: {
            type: String,
            default: ""
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        state: {
            type: String,
            required: true,
            trim: true
        },

        pin_code: {
            type: String,
            required: true,
            match: [/^[0-9]{6}$/, "PIN code must contain 6 digits"]
        },

        country: {
            type: String,
            default: "India"
        },

        // Parent / Guardian Details
        father_name: {
            type: String,
            required: true,
            trim: true
        },

        mother_name: {
            type: String,
            required: true,
            trim: true
        },

        guardian_name: {
            type: String,
            default: ""
        },

        parent_phone: {
            type: String,
            required: true,
            match: [/^[0-9]{10}$/, "Parent phone must contain 10 digits"]
        },

        parent_email: {
            type: String,
            default: "",
            lowercase: true,
            trim: true
        },

        parent_occupation: {
            type: String,
            default: ""
        },

        annual_family_income: {
            type: Number,
            min: 0,
            default: 0
        },

        // Academic Details
        qualification: {
            type: String,
            required: true
        },

        tenth_board: {
            type: String,
            default: ""
        },

        tenth_passing_year: {
            type: Number,
            min: 1900
        },

        tenth_percentage: {
            type: Number,
            min: 0,
            max: 100
        },

        twelfth_board: {
            type: String,
            default: ""
        },

        twelfth_passing_year: {
            type: Number,
            min: 1900
        },

        twelfth_percentage: {
            type: Number,
            min: 0,
            max: 100
        },

        previous_college: {
            type: String,
            default: ""
        },

        previous_course: {
            type: String,
            default: ""
        },

        graduation_percentage: {
            type: Number,
            min: 0,
            max: 100
        },

        entrance_exam_name: {
            type: String,
            default: ""
        },

        entrance_exam_score: {
            type: Number,
            min: 0
        },

        // Admission Details
        application_number: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        admission_number: {
            type: String,
            unique: true,
            sparse: true,
            trim: true
        },

        admission_date: {
            type: Date,
            default: Date.now
        },

        academic_session: {
            type: String,
            required: true
        },

        department: {
            type: String,
            required: true
        },

        course: {
            type: String,
            required: true
        },

        specialization: {
            type: String,
            default: ""
        },

        semester: {
            type: Number,
            required: true,
            min: 1
        },

        admission_type: {
            type: String,
            enum: ["Regular", "Lateral Entry"],
            default: "Regular"
        },

        admission_status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },

        roll_number: {
            type: String,
            default: undefined,
            trim: true
        },

        // Fee Details
        total_fee: {
            type: Number,
            required: true,
            min: 0
        },

        admission_fee: {
            type: Number,
            default: 0,
            min: 0
        },

        tuition_fee: {
            type: Number,
            default: 0,
            min: 0
        },

        scholarship_amount: {
            type: Number,
            default: 0,
            min: 0
        },

        paid_amount: {
            type: Number,
            default: 0,
            min: 0
        },

        pending_amount: {
            type: Number,
            default: 0,
            min: 0
        },

        payment_status: {
            type: String,
            enum: ["Pending", "Partial", "Paid"],
            default: "Pending"
        },

        payment_method: {
            type: String,
            enum: ["Cash", "UPI", "Card", "Bank Transfer", "Other"],
            default: "Other"
        },

        transaction_id: {
            type: String,
            default: ""
        },

        last_payment_date: {
            type: Date
        },

        // Admin Details
        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },

        updated_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin"
        },

        remarks: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

const Student = mongoose.model("Student", StudentSchema);

module.exports = Student;