const Student = require("../models/Student.models");

const editableProfileFields = [
    "student_name",
    "middle_name",
    "last_name",
    "date_of_birth",
    "gender",
    "aadhar_card_number",
    "pan_card_number",
    "blood_group",
    "nationality",
    "category",
    "email",
    "phone_number",
    "alternate_phone",
    "address",
    "city",
    "state",
    "pin_code",
    "country",
    "father_name",
    "mother_name",
    "guardian_name",
    "parent_phone",
    "parent_email",
    "qualification",
    "tenth_board",
    "tenth_passing_year",
    "tenth_percentage",
    "twelfth_board",
    "twelfth_passing_year",
    "twelfth_percentage",
    "previous_college",
    "previous_course",
    "graduation_percentage",
    "entrance_exam_name",
    "entrance_exam_score"
];

const requiredProfileFields = new Set([
    "student_name",
    "last_name",
    "date_of_birth",
    "gender",
    "aadhar_card_number",
    "email",
    "phone_number",
    "address",
    "city",
    "state",
    "pin_code",
    "father_name",
    "mother_name",
    "parent_phone",
    "qualification"
]);

const studentLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });
        }

        const student = await Student.findOne({
            email: email.trim().toLowerCase()
        }).select("+password");

        if (!student || !student.password ||
            !(await student.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });
        }

        const token = student.generateToken();
        res.cookie("studentToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({
            success: true,
            message: "Student login successful."
        });
    } catch (error) {
        console.error("Student login error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to log in. Please try again."
        });
    }
};

const getStudentProfile = async (req, res) => {
    return res.status(200).json({
        success: true,
        student: req.student
    });
};

const getStudentFees = async (req, res) => {
    const student = req.student;
    return res.status(200).json({
        success: true,
        student: {
            _id: student._id,
            student_name: student.student_name,
            middle_name: student.middle_name,
            last_name: student.last_name,
            email: student.email,
            application_number: student.application_number,
            roll_number: student.roll_number,
            course: student.course,
            total_fee: student.total_fee,
            paid_amount: student.paid_amount,
            pending_amount: student.pending_amount,
            payment_status: student.payment_status,
            payment_history: student.payment_history
        }
    });
};

const updateStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.student._id).select("+password");
        if (!student) {
            return res.status(404).json({
                success: false,
                message: "Student account not found."
            });
        }

        const updates = {};
        for (const field of editableProfileFields) {
            if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
                continue;
            }

            const value = req.body[field];
            if (value === "" || value === null) {
                if (requiredProfileFields.has(field)) {
                    return res.status(400).json({
                        success: false,
                        message: `${field.replace(/_/g, " ")} is required.`
                    });
                }
                updates[field] = undefined;
                continue;
            }

            updates[field] = typeof value === "string" ? value.trim() : value;
        }

        if (updates.email !== undefined) {
            updates.email = updates.email.toLowerCase();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email address."
                });
            }

            const existingStudent = await Student.findOne({
                email: updates.email,
                _id: { $ne: student._id }
            }).select("_id");
            if (existingStudent) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered."
                });
            }
        }

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const isChangingPassword = Boolean(currentPassword || newPassword || confirmPassword);
        if (isChangingPassword) {
            if (typeof currentPassword !== "string" || !currentPassword ||
                typeof newPassword !== "string" || !newPassword ||
                typeof confirmPassword !== "string" || !confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Enter your current password, new password, and confirmation to change your password."
                });
            }
            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: "New password must be at least 8 characters long."
                });
            }
            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "New password and confirmation do not match."
                });
            }
            if (!student.password || !(await student.comparePassword(currentPassword))) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect."
                });
            }
        }

        student.set(updates);
        if (isChangingPassword) {
            student.password = newPassword;
        }
        await student.save();

        const studentData = student.toObject();
        delete studentData.password;

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully.",
            student: studentData
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email is already registered."
            });
        }
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        console.error("Update student profile error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to update your profile. Please try again."
        });
    }
};

const studentLogout = async (req, res) => {
    res.clearCookie("studentToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return res.status(200).json({
        success: true,
        message: "Student logged out successfully."
    });
};

module.exports = {
    studentLogin,
    getStudentProfile,
    getStudentFees,
    updateStudentProfile,
    studentLogout
};
