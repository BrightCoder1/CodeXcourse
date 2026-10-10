import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

// SVG Icons
const Icons = {
  ArrowLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Save: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  ),
  Eye: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  EyeOff: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  User: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  FileText: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Lock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

export default function EmployeeAdd() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  // Form Fields State
  const [formData, setFormData] = useState({
    emp_name: '',
    emp_id: '',
    emp_department: '',
    emp_course: '',
    emp_dob: '',
    emp_joining_date: new Date().toISOString().split('T')[0],
    emp_role: '',
    emp_status: 'Active',
    emp_attendance: '100%',
    emp_qualification: '',
    emp_aadharnumber: '',
    pan_number: '',
    address: '',
    email: '',
    contact_number: '',
    accountnumber: '',
    ifsc_code: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-generate employee ID
  const generateEmpId = () => {
    const randomId = `EMP-${Math.floor(1000 + Math.random() * 9000)}`;
    setFormData((prev) => ({ ...prev, emp_id: randomId }));
  };

  useEffect(() => {
    if (!isEditMode) {
      generateEmpId();
    }
  }, [isEditMode]);

  // Handle inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.emp_name.trim()) newErrors.emp_name = 'Employee name is required';
    if (!formData.emp_id.trim()) newErrors.emp_id = 'Employee ID is required';
    if (!formData.emp_department.trim()) newErrors.emp_department = 'Department is required';
    if (!formData.emp_course.trim()) newErrors.emp_course = 'Course is required';
    if (!formData.emp_role.trim()) newErrors.emp_role = 'Role is required';
    if (!formData.emp_dob) newErrors.emp_dob = 'Date of birth is required';
    if (!formData.emp_joining_date) newErrors.emp_joining_date = 'Joining date is required';
    if (!formData.emp_qualification.trim()) newErrors.emp_qualification = 'Qualification is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }

    if (!formData.contact_number.trim()) {
      newErrors.contact_number = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contact_number.replace(/\D/g, ''))) {
      newErrors.contact_number = 'Enter a valid 10-digit contact number';
    }

    if (formData.emp_aadharnumber && !/^\d{12}$/.test(formData.emp_aadharnumber.replace(/\s+/g, ''))) {
      newErrors.emp_aadharnumber = 'Aadhaar must be a 12-digit number';
    }

    if (formData.pan_number && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.pan_number.trim())) {
      newErrors.pan_number = 'Enter a valid PAN (e.g. ABCDE1234F)';
    }

    if (formData.accountnumber && !/^\d{9,18}$/.test(formData.accountnumber.trim())) {
      newErrors.accountnumber = 'Account number must be 9-18 digits';
    }

    if (formData.ifsc_code && !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(formData.ifsc_code.trim())) {
      newErrors.ifsc_code = 'Enter a valid 11-digit IFSC code (e.g. HDFC0001234)';
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    // Save to API / LocalStorage / Context here
    console.log('Employee Data Submitted:', formData);

    setTimeout(() => {
      setIsSubmitting(false);
      alert(isEditMode ? 'Employee updated successfully!' : 'Employee added successfully!');
      navigate('/employees');
    }, 500);
  };

  return (
    <div className="add-employee-container">
      {/* Top Header */}
      <div className="form-page-header">
        <div className="header-title-group">
          <button 
            type="button" 
            className="btn-back-circle" 
            onClick={() => navigate('/employees')}
            title="Back to Employees"
          >
            <Icons.ArrowLeft />
          </button>
          <div>
            <h1>{isEditMode ? 'Edit Employee' : 'Add New Employee'}</h1>
            <p>Enter the complete details of the employee to register their profile.</p>
          </div>
        </div>

        <div className="header-action-group">
          <Link to="/employees" className="btn-cancel-link">
            Cancel
          </Link>
          <button 
            type="submit" 
            form="add-employee-form" 
            className="btn-submit-primary" 
            disabled={isSubmitting}
          >
            <Icons.Save />
            <span>{isSubmitting ? 'Saving...' : (isEditMode ? 'Update' : 'Save Employee')}</span>
          </button>
        </div>
      </div>

      {/* Main Registration Form */}
      <form id="add-employee-form" onSubmit={handleSubmit} noValidate>
        
        {/* 1. Basic & Personal Details */}
        <section className="form-card">
          <div className="form-card-title">
            <span className="section-icon"><Icons.User /></span>
            <div>
              <h3>Basic & Personal Details</h3>
              <small>Employee identity, contact information, and qualifications</small>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Employee ID */}
            <div className="form-field">
              <label>Employee ID <span className="req">*</span></label>
              <div className="input-with-action">
                <input
                  type="text"
                  name="emp_id"
                  value={formData.emp_id}
                  onChange={handleChange}
                  placeholder="e.g. EMP-1010"
                  className={errors.emp_id ? 'has-error' : ''}
                />
                {!isEditMode && (
                  <button type="button" className="btn-icon-addon" onClick={generateEmpId} title="Regenerate ID">
                    <Icons.Refresh />
                  </button>
                )}
              </div>
              {errors.emp_id && <span className="error-msg">{errors.emp_id}</span>}
            </div>

            {/* Employee Name */}
            <div className="form-field">
              <label>Employee Name <span className="req">*</span></label>
              <input
                type="text"
                name="emp_name"
                value={formData.emp_name}
                onChange={handleChange}
                placeholder="Full legal name"
                className={errors.emp_name ? 'has-error' : ''}
              />
              {errors.emp_name && <span className="error-msg">{errors.emp_name}</span>}
            </div>

            {/* Email */}
            <div className="form-field">
              <label>Email Address <span className="req">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="employee@codex.com"
                className={errors.email ? 'has-error' : ''}
              />
              {errors.email && <span className="error-msg">{errors.email}</span>}
            </div>

            {/* Contact Number */}
            <div className="form-field">
              <label>Contact Number <span className="req">*</span></label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className={errors.contact_number ? 'has-error' : ''}
              />
              {errors.contact_number && <span className="error-msg">{errors.contact_number}</span>}
            </div>

            {/* Date of Birth */}
            <div className="form-field">
              <label>Date of Birth <span className="req">*</span></label>
              <input
                type="date"
                name="emp_dob"
                value={formData.emp_dob}
                onChange={handleChange}
                className={errors.emp_dob ? 'has-error' : ''}
              />
              {errors.emp_dob && <span className="error-msg">{errors.emp_dob}</span>}
            </div>

            {/* Qualification */}
            <div className="form-field">
              <label>Employee Qualification <span className="req">*</span></label>
              <input
                type="text"
                name="emp_qualification"
                value={formData.emp_qualification}
                onChange={handleChange}
                placeholder="e.g. M.Tech in CS, B.Tech IT, MCA"
                className={errors.emp_qualification ? 'has-error' : ''}
              />
              {errors.emp_qualification && <span className="error-msg">{errors.emp_qualification}</span>}
            </div>
          </div>
        </section>

        {/* 2. Employment & Academic Information */}
        <section className="form-card">
          <div className="form-card-title">
            <span className="section-icon"><Icons.Briefcase /></span>
            <div>
              <h3>Institutional & Role Details</h3>
              <small>Department, assigned course, designation, and joining status</small>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Department */}
            <div className="form-field">
              <label>Employee Department <span className="req">*</span></label>
              <select 
                name="emp_department" 
                value={formData.emp_department} 
                onChange={handleChange}
                className={errors.emp_department ? 'has-error' : ''}
              >
                <option value="">-- Select Department --</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Administration">Administration</option>
              </select>
              {errors.emp_department && <span className="error-msg">{errors.emp_department}</span>}
            </div>

            {/* Course */}
            <div className="form-field">
              <label>Assigned Course <span className="req">*</span></label>
              <input
                type="text"
                name="emp_course"
                value={formData.emp_course}
                onChange={handleChange}
                placeholder="e.g. Full Stack MERN, Python Bootcamp"
                className={errors.emp_course ? 'has-error' : ''}
              />
              {errors.emp_course && <span className="error-msg">{errors.emp_course}</span>}
            </div>

            {/* Role */}
            <div className="form-field">
              <label>Employee Role <span className="req">*</span></label>
              <input
                type="text"
                name="emp_role"
                value={formData.emp_role}
                onChange={handleChange}
                placeholder="e.g. Senior Instructor, Lead Mentor"
                className={errors.emp_role ? 'has-error' : ''}
              />
              {errors.emp_role && <span className="error-msg">{errors.emp_role}</span>}
            </div>

            {/* Joining Date */}
            <div className="form-field">
              <label>Joining Date <span className="req">*</span></label>
              <input
                type="date"
                name="emp_joining_date"
                value={formData.emp_joining_date}
                onChange={handleChange}
                className={errors.emp_joining_date ? 'has-error' : ''}
              />
              {errors.emp_joining_date && <span className="error-msg">{errors.emp_joining_date}</span>}
            </div>

            {/* Status */}
            <div className="form-field">
              <label>Employee Status</label>
              <select name="emp_status" value={formData.emp_status} onChange={handleChange}>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Probation">Probation</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Attendance Target */}
            <div className="form-field">
              <label>Initial Attendance Target / Rate</label>
              <input
                type="text"
                name="emp_attendance"
                value={formData.emp_attendance}
                onChange={handleChange}
                placeholder="e.g. 100%"
              />
            </div>
          </div>
        </section>

        {/* 3. Verification & Address */}
        <section className="form-card">
          <div className="form-card-title">
            <span className="section-icon"><Icons.FileText /></span>
            <div>
              <h3>Identification & Address</h3>
              <small>Government IDs and residential permanent address</small>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Aadhaar Number */}
            <div className="form-field">
              <label>Aadhaar Number (12 Digits)</label>
              <input
                type="text"
                name="emp_aadharnumber"
                maxLength="14"
                value={formData.emp_aadharnumber}
                onChange={handleChange}
                placeholder="1234 5678 9012"
                className={errors.emp_aadharnumber ? 'has-error' : ''}
              />
              {errors.emp_aadharnumber && <span className="error-msg">{errors.emp_aadharnumber}</span>}
            </div>

            {/* PAN Number */}
            <div className="form-field">
              <label>PAN Card Number</label>
              <input
                type="text"
                name="pan_number"
                maxLength="10"
                style={{ textTransform: 'uppercase' }}
                value={formData.pan_number}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className={errors.pan_number ? 'has-error' : ''}
              />
              {errors.pan_number && <span className="error-msg">{errors.pan_number}</span>}
            </div>

            {/* Address */}
            <div className="form-field full-width">
              <label>Residential Address</label>
              <textarea
                name="address"
                rows="3"
                value={formData.address}
                onChange={handleChange}
                placeholder="House / Flat No., Street, City, State, PIN code"
              />
            </div>
          </div>
        </section>

        {/* 4. Bank & Security Credentials */}
        <section className="form-card">
          <div className="form-card-title">
            <span className="section-icon"><Icons.Lock /></span>
            <div>
              <h3>Bank Account & Security</h3>
              <small>Salary account details and employee login credentials</small>
            </div>
          </div>

          <div className="form-fields-grid">
            {/* Account Number */}
            <div className="form-field">
              <label>Bank Account Number</label>
              <input
                type="text"
                name="accountnumber"
                value={formData.accountnumber}
                onChange={handleChange}
                placeholder="9 to 18 digits account number"
                className={errors.accountnumber ? 'has-error' : ''}
              />
              {errors.accountnumber && <span className="error-msg">{errors.accountnumber}</span>}
            </div>

            {/* IFSC Code */}
            <div className="form-field">
              <label>Bank IFSC Code</label>
              <input
                type="text"
                name="ifsc_code"
                style={{ textTransform: 'uppercase' }}
                maxLength="11"
                value={formData.ifsc_code}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                className={errors.ifsc_code ? 'has-error' : ''}
              />
              {errors.ifsc_code && <span className="error-msg">{errors.ifsc_code}</span>}
            </div>

            {/* Password */}
            <div className="form-field full-width">
              <label>Portal Login Password <span className="req">*</span></label>
              <div className="input-with-action">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Set login password for employee"
                  className={errors.password ? 'has-error' : ''}
                />
                <button
                  type="button"
                  className="btn-icon-addon"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <Icons.EyeOff /> : <Icons.Eye />}
                </button>
              </div>
              {errors.password && <span className="error-msg">{errors.password}</span>}
            </div>
          </div>
        </section>

        {/* Bottom Submission Bar */}
        <div className="form-bottom-actions">
          <button type="button" className="btn-cancel-secondary" onClick={() => navigate('/employees')}>
            Cancel
          </button>
          <button type="submit" className="btn-submit-primary" disabled={isSubmitting}>
            <Icons.Save />
            <span>{isSubmitting ? 'Saving...' : (isEditMode ? 'Update Employee' : 'Submit & Add Employee')}</span>
          </button>
        </div>
      </form>
    </div>
  );
}