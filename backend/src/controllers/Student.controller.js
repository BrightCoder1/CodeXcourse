const Student = require('../models/Student.models');

const student_register = async (req, res) => {
    try {
        const {
            student_name,
            last_name,
            date_of_birth,
            gender,
            aadhar_card_number,
            email,
            phone_number,
            address,
            city,
            state,
            pin_code,
            father_name,
            mother_name,
            parent_phone,
            qualification,
            application_number,
            academic_session,
            department,
            course,
            semester,
            total_fee
        } = req.body;

        // Validate required fields
        if (
            !student_name ||
            !last_name ||
            !date_of_birth ||
            !gender ||
            !aadhar_card_number ||
            !email ||
            !phone_number ||
            !address ||
            !city ||
            !state ||
            !pin_code ||
            !father_name ||
            !mother_name ||
            !parent_phone ||
            !qualification ||
            !application_number ||
            !academic_session ||
            !department ||
            !course ||
            !semester ||
            total_fee === undefined || total_fee === ''
        ) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields marked with *.'
            });
        }

        // Check for existing records (email or application number conflict)
        const existingStudent = await Student.findOne({
            $or: [{ email: email.toLowerCase() }, { application_number }]
        });

        if (existingStudent) {
            const field = existingStudent.email === email.toLowerCase() ? 'Email' : 'Application Number';
            return res.status(409).json({
                success: false,
                message: `${field} already exists. Please check the details.`
            });
        }

        // Sanitize numeric fields to avoid empty string cast errors
        const sanitizedData = { ...req.body };
        const numericFields = [
            'annual_family_income',
            'tenth_passing_year',
            'tenth_percentage',
            'twelfth_passing_year',
            'twelfth_percentage',
            'graduation_percentage',
            'entrance_exam_score',
            'semester',
            'total_fee',
            'admission_fee',
            'tuition_fee',
            'scholarship_amount',
            'paid_amount',
            'pending_amount'
        ];

        numericFields.forEach(field => {
            if (sanitizedData[field] === '' || sanitizedData[field] === undefined) {
                delete sanitizedData[field];
            }
        });

        const newStudent = new Student(sanitizedData);
        const savedStudent = await newStudent.save();

        return res.status(201).json({
            success: true,
            message: 'Student registered successfully!',
            data: savedStudent
        });
    } catch (error) {
        console.error('Registration Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Server error occurred during student registration.'
        });
    }
};

// 2. Get All Students (Directory Table ke liye)
const getAllStudents = async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });

    } catch (error) {
        console.error('Get All Students Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch students.'
        });
    }
};

// 3. Get Single Student by ID
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }
        return res.status(200).json({
            success: true,
            data: student
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student details.'
        });
    }
};

// 4. Update Student Details
const updateStudent = async (req, res) => {
    try {
        const duplicateConditions = [];
        if (req.body.email) {
            duplicateConditions.push({ email: req.body.email.toLowerCase() });
        }
        if (req.body.application_number) {
            duplicateConditions.push({ application_number: req.body.application_number });
        }

        if (duplicateConditions.length) {
            const duplicateStudent = await Student.findOne({
                _id: { $ne: req.params.id },
                $or: duplicateConditions
            });
            if (duplicateStudent) {
                const field = duplicateStudent.email === req.body.email?.toLowerCase()
                    ? 'Email'
                    : 'Application Number';
                return res.status(409).json({
                    success: false,
                    message: `${field} already exists. Please check the details.`
                });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student record updated successfully!',
            data: updatedStudent
        });
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || 'Student detail';
            return res.status(409).json({
                success: false,
                message: `${field} already exists. Please check the details.`
            });
        }
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to update student.'
        });
    }
};

// 5. Delete Student Record
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Student deleted successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to delete student.'
        });
    }
};

module.exports = {
    student_register,
    getAllStudents,
    getStudentById,
    updateStudent,
    deleteStudent
};
