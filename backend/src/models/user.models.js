const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const userSchema = new mongoose.Schema(
    {
        // Auto-generated Unique Employee ID (e.g., EMP-1001)
        emp_id: {
            type: String,
            unique: true,
            index: true,
        },

        // 1. Basic & Personal Details
        emp_name: {
            type: String,
            required: [true, "Employee name is required"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email address is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"],
        },
        contact_number: {
            type: String,
            required: [true, "Contact number is required"],
            trim: true,
            match: [/^\d{10}$/, "Please enter a valid 10-digit phone number"],
        },
        emp_dob: {
            type: Date,
            required: [true, "Date of birth is required"],
        },
        emp_qualification: {
            type: String,
            required: [true, "Employee qualification is required"],
            trim: true,
        },

        // 2. Institutional & Role Details
        emp_department: {
            type: String,
            required: [true, "Department is required"],
            enum: [
                "Web Development",
                "Data Science & AI",
                "UI/UX Design",
                "Mobile Development",
                "Administration",
            ],
        },
        emp_course: {
            type: String,
            required: [true, "Assigned course is required"],
            trim: true,
        },
        emp_role: {
            type: String,
            required: [true, "Role is required"],
            trim: true,
            enum: ["admin", "employee"],
            default: "employee",
        },
        emp_joining_date: {
            type: Date,
            required: [true, "Joining date is required"],
            default: Date.now,
        },
        emp_status: {
            type: String,
            enum: ["Active", "On Leave", "Probation", "Inactive"],
            default: "Active",
        },
        emp_attendance: {
            type: String,
            default: "100%",
            trim: true,
        },

        // 3. Verification & Address
        emp_aadharnumber: {
            type: String,
            trim: true,
            match: [/^\d{12}$/, "Aadhaar must be a 12-digit number"],
        },
        pan_number: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number"],
        },
        address: {
            type: String,
            trim: true,
        },

        // 4. Bank Details & Security Credentials
        accountnumber: {
            type: String,
            trim: true,
            match: [/^\d{9,18}$/, "Account number must be between 9 and 18 digits"],
        },
        ifsc_code: {
            type: String,
            trim: true,
            uppercase: true,
            match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, "Please enter a valid 11-digit IFSC code"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
        },
    },
    { timestamps: true }
);

// --->> Auto-generate unique sequential emp_id (EMP-1001, EMP-1002, ...)
userSchema.pre("save", async function () {
    if (!this.emp_id) {
        const lastUser = await mongoose
            .model("User")
            .findOne({ emp_id: { $regex: /^EMP-\d+$/ } })
            .sort({ createdAt: -1 })
            .select("emp_id");

        let nextNumber = 1001;

        if (lastUser && lastUser.emp_id) {
            const match = lastUser.emp_id.match(/^EMP-(\d+)$/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }

        this.emp_id = `EMP-${nextNumber}`;
    }
});

// --->> Password Hash
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }
    this.password = await bcrypt.hash(this.password, 10);
});

// --->> Generate JWT Token
userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            userId: this._id,
            emp_id: this.emp_id,
            email: this.email,
            role: this.emp_role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRE || "7d",
        }
    );
};

// --->> Compare Password
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;