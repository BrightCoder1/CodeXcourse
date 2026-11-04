const Student = require('../models/Student.models');
const mongoose = require('mongoose');
const { randomBytes } = require('crypto');

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

const getStudentCount = async (req, res) => {
    try {
        const count = await Student.countDocuments();
        return res.status(200).json({
            success: true,
            count
        });
    } catch (error) {
        console.error('Get Student Count Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student count.'
        });
    }
};


const getRecentStudents = async (req, res) => {
    try {
        const students = await Student.find()
            .sort({ createdAt: -1 })
            .limit(10);

        return res.status(200).json({
            success: true,
            count: students.length,
            data: students
        });
    } catch (error) {
        console.error('Get Recent Students Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch recent students.'
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

const submitStudentFee = async (req, res) => {
    try {
        const amount = Number(req.body.amount);
        const paymentMethods = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];
        const paymentMethod = req.body.payment_method;
        const receivedBy = typeof req.body.received_by === 'string'
            ? req.body.received_by.trim()
            : '';
        const remark = typeof req.body.remark === 'string'
            ? req.body.remark.trim()
            : '';

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount must be greater than zero.'
            });
        }
        if (!paymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Please select a valid payment method.'
            });
        }
        if (!receivedBy || receivedBy.length > 100) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a receiver name (maximum 100 characters).'
            });
        }
        if (remark.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Remark must be 500 characters or fewer.'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid student ID.'
            });
        }

        let student = null;
        for (let attempt = 0; attempt < 3 && !student; attempt += 1) {
            const currentStudent = await Student.findById(req.params.id);
            if (!currentStudent) {
                return res.status(404).json({
                    success: false,
                    message: 'Student not found.'
                });
            }

            const totalFee = Number(currentStudent.total_fee) || 0;
            const currentPaid = Number(currentStudent.paid_amount) || 0;
            const currentPending = Math.max(0, totalFee - currentPaid);
            if (amount > currentPending) {
                return res.status(400).json({
                    success: false,
                    message: "Payment amount cannot exceed the student's pending fee."
                });
            }

            const nextPaid = currentPaid + amount;
            const nextPending = Math.max(0, totalFee - nextPaid);
            const paidAt = new Date();
            const payment = {
                receipt_number: `FEE-${Date.now()}-${randomBytes(3).toString('hex').toUpperCase()}`,
                amount,
                payment_method: paymentMethod,
                received_by: receivedBy,
                remark,
                paid_at: paidAt,
                total_fee: totalFee,
                pending_amount: nextPending
            };

            student = await Student.findOneAndUpdate(
                {
                    _id: currentStudent._id,
                    $expr: {
                        $and: [
                            { $eq: [{ $ifNull: ['$paid_amount', 0] }, currentPaid] },
                            { $eq: [{ $ifNull: ['$total_fee', 0] }, totalFee] }
                        ]
                    }
                },
                {
                    $set: {
                        paid_amount: nextPaid,
                        pending_amount: nextPending,
                        payment_status: nextPending === 0 ? 'Paid' : 'Partial',
                        payment_method: paymentMethod,
                        last_payment_date: paidAt
                    },
                    $push: { payment_history: payment }
                },
                { new: true, runValidators: true }
            );
        }

        if (!student) {
            return res.status(409).json({
                success: false,
                message: 'The student fee changed during payment. Please refresh and try again.'
            });
        }

        return res.status(201).json({
            success: true,
            message: 'Student fee payment recorded successfully.',
            data: student
        });
    } catch (error) {
        console.error('Submit Student Fee Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to record student fee payment.'
        });
    }
};

// 4. Update Student Details
const updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found.'
            });
        }

        const updateData = { ...req.body };
        delete updateData._id;
        delete updateData.id;
        delete updateData.__v;
        delete updateData.createdAt;
        delete updateData.updatedAt;

        const email = typeof updateData.email === 'string'
            ? updateData.email.trim().toLowerCase()
            : updateData.email;
        const applicationNumber = typeof updateData.application_number === 'string'
            ? updateData.application_number.trim()
            : updateData.application_number;
        const admissionNumber = typeof updateData.admission_number === 'string'
            ? updateData.admission_number.trim()
            : updateData.admission_number;

        const uniqueFieldLabels = {
            email: 'Email',
            application_number: 'Application Number',
            admission_number: 'Admission Number'
        };
        const uniqueConditions = [];
        if (email) {
            updateData.email = email;
            if (email !== student.email) {
                uniqueConditions.push({ field: 'email', value: email });
            }
        }
        if (applicationNumber) {
            updateData.application_number = applicationNumber;
            if (applicationNumber !== student.application_number) {
                uniqueConditions.push({
                    field: 'application_number',
                    value: applicationNumber
                });
            }
        }
        if (admissionNumber !== undefined) {
            const currentAdmissionNumber = typeof student.admission_number === 'string'
                ? student.admission_number.trim()
                : '';
            if (admissionNumber === currentAdmissionNumber) {
                delete updateData.admission_number;
            } else {
                updateData.admission_number = admissionNumber;
                if (admissionNumber) {
                    uniqueConditions.push({
                        field: 'admission_number',
                        value: admissionNumber
                    });
                }
            }
        }

        if (uniqueConditions.length) {
            const duplicateStudent = await Student.findOne({
                _id: { $ne: student._id },
                $or: uniqueConditions.map(({ field, value }) => ({ [field]: value }))
            });
            if (duplicateStudent) {
                const duplicate = uniqueConditions.find(
                    ({ field, value }) => duplicateStudent[field] === value
                );
                const field = uniqueFieldLabels[duplicate?.field] || 'Student detail';
                return res.status(409).json({
                    success: false,
                    message: `${field} already belongs to another student. Please use a different value.`
                });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            student._id,
            { $set: updateData },
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
            const duplicateField =
                Object.keys(error.keyPattern || {})[0] ||
                Object.keys(error.keyValue || {})[0] ||
                Object.keys(error.errors || {})[0] ||
                error.message?.match(/dup key:\s*\{\s*([^:,\s]+)\s*:/i)?.[1];
            const field = duplicateField
                ? duplicateField
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (letter) => letter.toUpperCase())
                : null;

            if (!field) {
                console.error('Student update duplicate-key error did not identify a field:', {
                    index: error.index,
                    message: error.message
                });
            }

            return res.status(409).json({
                success: false,
                message: field
                    ? `${field} already belongs to another student. Please use a different value.`
                    : 'A unique value conflicts with another student record. Check the backend log for the conflicting index.'
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
    getStudentCount,
    getRecentStudents,
    getStudentById,
    submitStudentFee,
    updateStudent,
    deleteStudent
};
