import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import './StudentRegister.css';
import {
  FaArrowLeft, FaSave, FaUser, FaIdCard, FaAddressBook,
  FaUsers, FaGraduationCap, FaUniversity, FaRupeeSign
} from 'react-icons/fa';

const initialFormData = {
  student_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'Male',
  blood_group: '',
  nationality: 'Indian',
  category: 'General',

  // Identity Details
  aadhar_card_number: '',
  pan_card_number: '',

  // Contact Details
  email: '',
  phone_number: '',
  alternate_phone: '',
  address: '',
  city: '',
  state: '',
  pin_code: '',
  country: 'India',

  // Parent / Guardian Details
  father_name: '',
  mother_name: '',
  guardian_name: '',
  parent_phone: '',
  parent_email: '',
  parent_occupation: '',
  annual_family_income: '',

  // Academic Details
  qualification: '',
  tenth_board: '',
  tenth_passing_year: '',
  tenth_percentage: '',
  twelfth_board: '',
  twelfth_passing_year: '',
  twelfth_percentage: '',
  previous_college: '',
  previous_course: '',
  graduation_percentage: '',
  entrance_exam_name: '',
  entrance_exam_score: '',

  // Admission Details
  application_number: '',
  admission_number: '',
  admission_date: new Date().toISOString().split('T')[0],
  academic_session: '',
  department: '',
  course: '',
  specialization: '',
  semester: 1,
  admission_type: 'Regular',
  admission_status: 'Pending',
  roll_number: '',

  // Fee Details
  total_fee: '',
  admission_fee: '',
  tuition_fee: '',
  scholarship_amount: '',
  paid_amount: '',
  pending_amount: '',
  payment_status: 'Pending',
  payment_method: 'Other',
  transaction_id: '',
  last_payment_date: '',

  // Remarks
  remarks: ''
};

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const formatDateForInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const getStudentFormData = (student) => {
  if (!student) return initialFormData;

  const studentFormData = { ...initialFormData };
  Object.keys(initialFormData).forEach((field) => {
    if (student[field] !== undefined && student[field] !== null) {
      studentFormData[field] = ['date_of_birth', 'admission_date', 'last_payment_date'].includes(field)
        ? formatDateForInput(student[field])
        : student[field];
    }
  });
  return studentFormData;
};

const StudentRegister = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const student = location.state?.student;
  const studentId = student?._id || student?.id;
  const isEditing = Boolean(studentId);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState(() => getStudentFormData(student));

  const handleCancelOrClear = () => {
    if (isEditing) {
      navigate('/students');
      return;
    }
    setFormData(initialFormData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      if (name === 'total_fee' || name === 'paid_amount') {
        const total = parseFloat(name === 'total_fee' ? value : updated.total_fee) || 0;
        const paid = parseFloat(name === 'paid_amount' ? value : updated.paid_amount) || 0;
        updated.pending_amount = Math.max(0, total - paid);

        if (paid === 0) {
          updated.payment_status = 'Pending';
        } else if (paid >= total && total > 0) {
          updated.payment_status = 'Paid';
        } else {
          updated.payment_status = 'Partial';
        }
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEditing) {
      const studentName = [formData.student_name, formData.middle_name, formData.last_name]
        .filter(Boolean)
        .join(' ');
      const confirmed = window.confirm(
        `Save the updated details${studentName ? ` for ${studentName}` : ''}?`
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const token =
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken') ||
      getCookie('token');

    const payload = { ...formData };
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
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null) {
        delete payload[key];
      } else if (payload[key] === '') {
        if (isEditing && numericFields.includes(key)) {
          payload[key] = null;
        } else if (isEditing && ['date_of_birth', 'admission_date', 'last_payment_date'].includes(key)) {
          payload[key] = null;
        } else if (!isEditing) {
          delete payload[key];
        }
      }
    });

    // Request headers setup
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await axios({
        method: isEditing ? 'put' : 'post',
        url: isEditing
          ? `http://localhost:4000/api/student/${studentId}`
          : 'http://localhost:4000/api/register/student',
        data: payload,
        headers,
        withCredentials: true
      });

      const message = response.data?.message ||
        (isEditing ? 'Student updated successfully!' : 'Student registered successfully!');
      setSuccessMessage(message);
      alert(message);
      if (isEditing) {
        navigate('/students');
      } else {
        setFormData(initialFormData);
      }

    } catch (err) {
      console.error('Registration Error:', err);
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Server error occurred during student registration.';
      setErrorMessage(errorMsg);
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="student-register-container">
      {/* Top Header Bar */}
      <header className="register-header">
        <div className="header-title-wrapper">
          <button type="button" className="back-btn" onClick={() => navigate('/students')}>
            <FaArrowLeft />
          </button>
          <div>
            <h1>{isEditing ? 'Edit Student' : 'Add New Student'}</h1>
            <p>{isEditing ? "Update the student's academic profile and information." : 'Enter the complete details of the student to register their academic profile.'}</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancelOrClear}
          >
            {isEditing ? 'Cancel' : 'Clear Form'}
          </button>
          <button type="submit" form="studentForm" className="btn-save" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : isEditing ? 'Update Student' : 'Save Student'}
          </button>
        </div>
      </header>

      {/* Messages */}
      {errorMessage && (
        <div className="alert-error" style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '12px 16px', borderRadius: '8px', margin: '16px 0', border: '1px solid #f87171' }}>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="alert-success" style={{ color: '#16a34a', backgroundColor: '#dcfce7', padding: '12px 16px', borderRadius: '8px', margin: '16px 0', border: '1px solid #86efac' }}>
          {successMessage}
        </div>
      )}

      {/* Form Content */}
      <form id="studentForm" onSubmit={handleSubmit} className="register-form">

        {/* SECTION 1: Basic & Personal Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaUser /></div>
            <div>
              <h2>Basic & Personal Details</h2>
              <p>Student personal information, identity, and demographics</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>First Name <span className="required">*</span></label>
              <input type="text" name="student_name" value={formData.student_name} onChange={handleChange} placeholder="Full legal first name" required />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input type="text" name="middle_name" value={formData.middle_name} onChange={handleChange} placeholder="Middle name (optional)" />
            </div>
            <div className="form-group">
              <label>Last Name <span className="required">*</span></label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Last name / Surname" required />
            </div>
            <div className="form-group">
              <label>Date of Birth <span className="required">*</span></label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender <span className="required">*</span></label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <input type="text" name="blood_group" value={formData.blood_group} onChange={handleChange} placeholder="e.g. O+, A+" />
            </div>
            <div className="form-group">
              <label>Nationality</label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Indian" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Identity Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaIdCard /></div>
            <div>
              <h2>Identity Details</h2>
              <p>Government identification documents</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Aadhar Card Number <span className="required">*</span></label>
              <input type="text" name="aadhar_card_number" value={formData.aadhar_card_number} onChange={handleChange} placeholder="12-digit Aadhar number" maxLength="12" required />
            </div>
            <div className="form-group">
              <label>PAN Card Number</label>
              <input type="text" name="pan_card_number" value={formData.pan_card_number} onChange={handleChange} placeholder="10-character alphanumeric PAN" maxLength="10" />
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaAddressBook /></div>
            <div>
              <h2>Contact & Address Details</h2>
              <p>Email, phone number, and residential address</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Email Address <span className="required">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="student@example.com" required />
            </div>
            <div className="form-group">
              <label>Phone Number <span className="required">*</span></label>
              <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="10-digit mobile number" maxLength="10" required />
            </div>
            <div className="form-group">
              <label>Alternate Phone</label>
              <input type="tel" name="alternate_phone" value={formData.alternate_phone} onChange={handleChange} placeholder="Alternate contact number" maxLength="10" />
            </div>
            <div className="form-group full-width">
              <label>Street Address <span className="required">*</span></label>
              <textarea name="address" value={formData.address} onChange={handleChange} placeholder="House no, Street name, Area" rows="2" required></textarea>
            </div>
            <div className="form-group">
              <label>City <span className="required">*</span></label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City name" required />
            </div>
            <div className="form-group">
              <label>State <span className="required">*</span></label>
              <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State name" required />
            </div>
            <div className="form-group">
              <label>PIN Code <span className="required">*</span></label>
              <input type="text" name="pin_code" value={formData.pin_code} onChange={handleChange} placeholder="6-digit PIN code" maxLength="6" required />
            </div>
            <div className="form-group">
              <label>Country</label>
              <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="India" />
            </div>
          </div>
        </div>

        {/* SECTION 4: Parent / Guardian Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaUsers /></div>
            <div>
              <h2>Parent / Guardian Details</h2>
              <p>Parent contact information, occupation, and family background</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Father's Name <span className="required">*</span></label>
              <input type="text" name="father_name" value={formData.father_name} onChange={handleChange} placeholder="Father's full name" required />
            </div>
            <div className="form-group">
              <label>Mother's Name <span className="required">*</span></label>
              <input type="text" name="mother_name" value={formData.mother_name} onChange={handleChange} placeholder="Mother's full name" required />
            </div>
            <div className="form-group">
              <label>Guardian's Name</label>
              <input type="text" name="guardian_name" value={formData.guardian_name} onChange={handleChange} placeholder="Guardian name (if applicable)" />
            </div>
            <div className="form-group">
              <label>Parent Phone Number <span className="required">*</span></label>
              <input type="tel" name="parent_phone" value={formData.parent_phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength="10" required />
            </div>
            <div className="form-group">
              <label>Parent Email</label>
              <input type="email" name="parent_email" value={formData.parent_email} onChange={handleChange} placeholder="parent@example.com" />
            </div>
            <div className="form-group">
              <label>Parent Occupation</label>
              <input type="text" name="parent_occupation" value={formData.parent_occupation} onChange={handleChange} placeholder="e.g. Service, Business" />
            </div>
            <div className="form-group">
              <label>Annual Family Income (₹)</label>
              <input type="number" name="annual_family_income" value={formData.annual_family_income} onChange={handleChange} placeholder="e.g. 500000" min="0" />
            </div>
          </div>
        </div>

        {/* SECTION 5: Academic Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaGraduationCap /></div>
            <div>
              <h2>Academic Details</h2>
              <p>Past educational qualifications, board results, and entrance exam scores</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Current Qualification <span className="required">*</span></label>
              <input type="text" name="qualification" value={formData.qualification} onChange={handleChange} placeholder="e.g. 12th Pass, Graduate" required />
            </div>

            {/* 10th Details */}
            <div className="form-group">
              <label>10th Board</label>
              <input type="text" name="tenth_board" value={formData.tenth_board} onChange={handleChange} placeholder="e.g. CBSE, ICSE, State Board" />
            </div>
            <div className="form-group">
              <label>10th Passing Year</label>
              <input type="number" name="tenth_passing_year" value={formData.tenth_passing_year} onChange={handleChange} placeholder="YYYY" />
            </div>
            <div className="form-group">
              <label>10th Percentage (%)</label>
              <input type="number" step="0.01" name="tenth_percentage" value={formData.tenth_percentage} onChange={handleChange} placeholder="e.g. 85.5" min="0" max="100" />
            </div>

            {/* 12th Details */}
            <div className="form-group">
              <label>12th Board</label>
              <input type="text" name="twelfth_board" value={formData.twelfth_board} onChange={handleChange} placeholder="e.g. CBSE, State Board" />
            </div>
            <div className="form-group">
              <label>12th Passing Year</label>
              <input type="number" name="twelfth_passing_year" value={formData.twelfth_passing_year} onChange={handleChange} placeholder="YYYY" />
            </div>
            <div className="form-group">
              <label>12th Percentage (%)</label>
              <input type="number" step="0.01" name="twelfth_percentage" value={formData.twelfth_percentage} onChange={handleChange} placeholder="e.g. 88.0" min="0" max="100" />
            </div>

            {/* Graduation Details */}
            <div className="form-group">
              <label>Previous College</label>
              <input type="text" name="previous_college" value={formData.previous_college} onChange={handleChange} placeholder="Name of previous institution" />
            </div>
            <div className="form-group">
              <label>Previous Course</label>
              <input type="text" name="previous_course" value={formData.previous_course} onChange={handleChange} placeholder="e.g. B.Sc, B.Com" />
            </div>
            <div className="form-group">
              <label>Graduation Percentage (%)</label>
              <input type="number" step="0.01" name="graduation_percentage" value={formData.graduation_percentage} onChange={handleChange} placeholder="e.g. 75.0" min="0" max="100" />
            </div>

            {/* Entrance Exam */}
            <div className="form-group">
              <label>Entrance Exam Name</label>
              <input type="text" name="entrance_exam_name" value={formData.entrance_exam_name} onChange={handleChange} placeholder="e.g. JEE, NEET, CUET" />
            </div>
            <div className="form-group">
              <label>Entrance Exam Score</label>
              <input type="number" name="entrance_exam_score" value={formData.entrance_exam_score} onChange={handleChange} placeholder="Score / Percentile" min="0" />
            </div>
          </div>
        </div>

        {/* SECTION 6: Admission Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaUniversity /></div>
            <div>
              <h2>Admission & Institutional Details</h2>
              <p>Department, course selection, session, and status</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Application Number <span className="required">*</span></label>
              <input type="text" name="application_number" value={formData.application_number} onChange={handleChange} placeholder="Unique application ID" required />
            </div>
            <div className="form-group">
              <label>Admission Number</label>
              <input type="text" name="admission_number" value={formData.admission_number} onChange={handleChange} placeholder="Generated admission ID" />
            </div>
            <div className="form-group">
              <label>Admission Date</label>
              <input type="date" name="admission_date" value={formData.admission_date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Academic Session <span className="required">*</span></label>
              <input type="text" name="academic_session" value={formData.academic_session} onChange={handleChange} placeholder="e.g. 2026-2027" required />
            </div>
            <div className="form-group">
              <label>Department <span className="required">*</span></label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="e.g. Computer Science & Engineering" required />
            </div>
            <div className="form-group">
              <label>Course <span className="required">*</span></label>
              <input type="text" name="course" value={formData.course} onChange={handleChange} placeholder="e.g. B.Tech Computer Science" required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input type="text" name="specialization" value={formData.specialization} onChange={handleChange} placeholder="e.g. Artificial Intelligence" />
            </div>
            <div className="form-group">
              <label>Semester <span className="required">*</span></label>
              <input type="number" name="semester" value={formData.semester} onChange={handleChange} min="1" required />
            </div>
            <div className="form-group">
              <label>Admission Type</label>
              <select name="admission_type" value={formData.admission_type} onChange={handleChange}>
                <option value="Regular">Regular</option>
                <option value="Lateral Entry">Lateral Entry</option>
              </select>
            </div>
            <div className="form-group">
              <label>Admission Status</label>
              <select name="admission_status" value={formData.admission_status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="form-group">
              <label>Roll Number</label>
              <input type="text" name="roll_number" value={formData.roll_number} onChange={handleChange} placeholder="College roll number" />
            </div>
          </div>
        </div>

        {/* SECTION 7: Fee Details */}
        <div className="form-card">
          <div className="card-header">
            <div className="card-icon"><FaRupeeSign /></div>
            <div>
              <h2>Fee & Payment Details</h2>
              <p>Tuition fees, payment amounts, and transaction records</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Total Fee (₹) <span className="required">*</span></label>
              <input type="number" name="total_fee" value={formData.total_fee} onChange={handleChange} placeholder="e.g. 100000" min="0" required />
            </div>
            <div className="form-group">
              <label>Admission Fee (₹)</label>
              <input type="number" name="admission_fee" value={formData.admission_fee} onChange={handleChange} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Tuition Fee (₹)</label>
              <input type="number" name="tuition_fee" value={formData.tuition_fee} onChange={handleChange} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Scholarship Amount (₹)</label>
              <input type="number" name="scholarship_amount" value={formData.scholarship_amount} onChange={handleChange} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Paid Amount (₹)</label>
              <input type="number" name="paid_amount" value={formData.paid_amount} onChange={handleChange} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Pending Amount (₹)</label>
              <input type="number" name="pending_amount" value={formData.pending_amount} onChange={handleChange} placeholder="0" min="0" readOnly />
            </div>
            <div className="form-group">
              <label>Payment Status</label>
              <select name="payment_status" value={formData.payment_status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select name="payment_method" value={formData.payment_method} onChange={handleChange}>
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Transaction ID</label>
              <input type="text" name="transaction_id" value={formData.transaction_id} onChange={handleChange} placeholder="UTR or Transaction reference" />
            </div>
            <div className="form-group">
              <label>Last Payment Date</label>
              <input type="date" name="last_payment_date" value={formData.last_payment_date} onChange={handleChange} />
            </div>
            <div className="form-group full-width">
              <label>Admin Remarks</label>
              <textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any special notes or remarks..." rows="2"></textarea>
            </div>
          </div>
        </div>

        {/* Bottom Actions Footer */}
        <div className="form-footer-actions">
          <button type="button" className="btn-cancel" onClick={handleCancelOrClear}>{isEditing ? 'Cancel' : 'Clear Form'}</button>
          <button type="submit" className="btn-save" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : isEditing ? 'Update Student' : 'Save Student'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default StudentRegister;
