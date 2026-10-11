const User = require("../models/user.models.js");
const mongoose = require("mongoose");

const registerUser = async (req, res) => {
    const {
        emp_name,
        email,
        contact_number,
        emp_dob,
        emp_qualification,
        emp_department,
        emp_course,
        emp_role,
        emp_joining_date,
        emp_status,
        emp_attendance,
        emp_aadharnumber,
        pan_number,
        address,
        accountnumber,
        ifsc_code,
        password,
    } = req.body;

    // Validate required fields
    if (
        !emp_name ||
        !email ||
        !contact_number ||
        !emp_dob ||
        !emp_qualification ||
        !emp_department ||
        !emp_course ||
        !emp_role ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields.",
        });
    }

    try {
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An employee with this email is already registered.",
            });
        }

        // Create employee record (emp_id is generated automatically by the pre-save hook)
        const newUser = await User.create({
            emp_name,
            email,
            contact_number,
            emp_dob,
            emp_qualification,
            emp_department,
            emp_course,
            emp_role,
            emp_joining_date: emp_joining_date || Date.now(),
            emp_status: emp_status || "Active",
            emp_attendance: emp_attendance || "100%",
            emp_aadharnumber,
            pan_number,
            address,
            accountnumber,
            ifsc_code,
            password,
        });

        const user = newUser.toObject();
        delete user.password;

        return res.status(201).json({
            success: true,
            message: "Employee registered successfully.",
            user,
        });
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err) => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(", "),
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error occurred.",
        });
    }
};



// Get all employees
const getEmployees = async (req, res) => {
    try {
        const employees = await User.find({ emp_role: "employee" })
            .select("-password");

        return res.status(200).json({
            success: true,
            data: employees
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch employees"
        });
    }
};

const getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        let query;

        if (mongoose.Types.ObjectId.isValid(id)) {
            query = {
                $or: [{ _id: id }, { emp_id: id }],
            };
        } else {
            query = { emp_id: id };
        }

        const employee = await User.findOne(query).select("-password");

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: employee,
        });
    } catch (error) {
        console.error("Get employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch employee",
        });
    }
};

const editEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required"
            });
        }

        const query = mongoose.Types.ObjectId.isValid(id)
            ? {
                $or: [
                    { _id: id },
                    { emp_id: id }
                ]
            }
            : { emp_id: id };

        const employee = await User.findOne(query);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const editableFields = [
            "emp_name",
            "email",
            "contact_number",
            "emp_dob",
            "emp_qualification",
            "emp_department",
            "emp_course",
            "emp_role",
            "emp_joining_date",
            "emp_status",
            "emp_attendance",
            "emp_aadharnumber",
            "pan_number",
            "address",
            "accountnumber",
            "ifsc_code"
        ];

        for (const field of editableFields) {
            if (
                Object.prototype.hasOwnProperty.call(
                    req.body,
                    field
                )
            ) {
                const value = req.body[field];
                employee[field] = [
                    "emp_aadharnumber",
                    "pan_number",
                    "accountnumber",
                    "ifsc_code"
                ].includes(field) && typeof value === "string" && !value.trim()
                    ? undefined
                    : value;
            }
        }

        // Update password only when a new password is provided.
        // Ensure your User model hashes passwords before saving.
        if (
            typeof req.body.password === "string" &&
            req.body.password.trim()
        ) {
            employee.password = req.body.password;
        }

        await employee.save();

        const updatedEmployee = employee.toObject();
        delete updatedEmployee.password;

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updatedEmployee
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: Object.values(err.errors)
                    .map((error) => error.message)
                    .join(", ")
            });
        }

        if (err.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "An employee with this email is already registered"
            });
        }

        console.error("Update employee error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to update employee"
        });
    }
};



const deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        let query;

        if (mongoose.Types.ObjectId.isValid(id)) {
            query = {
                $or: [{ _id: id }, { emp_id: id }],
            };
        } else {
            query = { emp_id: id };
        }

        const employee = await User.findOneAndDelete(query);

        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
            data: {
                _id: employee._id,
                emp_id: employee.emp_id,
                emp_name: employee.emp_name,
            },
        });
    } catch (error) {
        console.error("Delete employee error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete employee",
        });
    }
};




const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required."
        });
    }

    try {
        // Find user
        const userFind = await User.findOne({ email });

        if (!userFind) {
            return res.status(401).json({
                success: false,
                message: "Email and Password are wrong!"
            });
        }

        // Check password
        const passwordMatches = await userFind.comparePassword(password);

        if (!passwordMatches) {
            return res.status(401).json({
                success: false,
                message: "Email and Password are wrong!"
            });
        }

        // Generate JWT token
        const token = await userFind.generateToken();

        // Store token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        // Remove password from response
        const user = userFind.toObject();
        delete user.password;

        return res.status(200).json({
            success: true,
            message: "User Login Successfully!",
            user,
            token
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User profile fetched successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};




const getlogout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({
            success: true,
            message: "User Logout Successfully!"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ===============================
// UPDATE USER PROFILE
// ===============================
const updateProfile = async (req, res) => {
    try {
        const { username, email, phone, address } = req.body;

        // Find logged-in user
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Update username
        if (username !== undefined) {
            user.username = username;
        }

        // Update email
        if (email !== undefined && email !== user.email) {

            const existingUser = await User.findOne({ email });

            if (
                existingUser &&
                existingUser._id.toString() !== user._id.toString()
            ) {
                return res.status(409).json({
                    success: false,
                    message: "Email is already registered."
                });
            }

            user.email = email;
        }

        // Update phone
        if (phone !== undefined) {
            user.phone = phone;
        }

        // Update address
        if (address !== undefined) {
            user.address = address;
        }

        // Save changes
        await user.save();

        // Remove password before response
        const updatedUser = user.toObject();
        delete updatedUser.password;

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ===============================
// DELETE USER PROFILE
// ===============================
const deleteProfile = async (req, res) => {
    try {
        const userId = req.user.userId;

        // Find user
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Delete user
        await User.findByIdAndDelete(userId);

        // Clear login cookie
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        });

        return res.status(200).json({
            success: true,
            message: "Profile deleted successfully"
        });

    } catch (error) {
        console.error("Delete Profile Error:", error);

        return res.status(500).json({
            success: false,
            message: "Something went wrong while deleting profile",
            error: error.message
        });
    }
};



module.exports = {
    registerUser,
    getEmployees,
    getEmployeeById,
    editEmployee,
    deleteEmployee,
    
    loginUser,
    getProfile,
    getlogout,
    updateProfile,
    deleteProfile
};