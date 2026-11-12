import { useState } from 'react';
import './Profile.css';

const initialStudent = {
  fullName: 'Rahul Bhola',
  gender: 'Male',
  dateOfBirth: '2026-10-22',
  aadhaar: '123456789011',
  bloodGroup: 'O+',
  category: 'OBC',
  nationality: 'Indian',
  fatherName: 'Rajesh',
  motherName: 'Sunita',
  email: 'vk12@gmail.com',
  phone: '6398628411',
  parentPhone: '9176501234',
  parentEmail: 'N/A',
  address: 'Kolkata, street road, Kolkata, Bangal, 234167',
  applicationNumber: '27BCA002',
  rollNumber: '26BTECH02',
  course: 'MCA',
  department: 'Engin',
  qualification: 'BCA',
  semester: '1',
  academicSession: '2026-2029',
  admissionStatus: 'Approved',
  admissionDate: '2026-10-21',
  admissionType: 'Regular',
  specialization: 'CBIL',
  tenth: 'CBSE · 2132 · 47%',
  twelfth: 'CBSE · 4543 · 66%',
  previousCollege: 'N/A',
  previousCourse: 'N/A',
  graduation: 'N/A',
  entranceExam: 'N/A',
};

const profileSections = [
  {
    title: 'Personal Information',
    fields: [
      { name: 'fullName', label: 'Full Name', required: true },
      { name: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'] },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { name: 'aadhaar', label: 'Aadhaar', inputMode: 'numeric', maxLength: 12 },
      { name: 'bloodGroup', label: 'Blood Group', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
      { name: 'category', label: 'Category', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
      { name: 'nationality', label: 'Nationality' },
      { name: 'fatherName', label: "Father's Name" },
      { name: 'motherName', label: "Mother's Name" },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'parentPhone', label: 'Parent Phone', type: 'tel' },
      { name: 'parentEmail', label: 'Parent Email' },
      { name: 'address', label: 'Address', wide: true },
    ],
  },
  {
    title: 'Academic & Admission Details',
    fields: [
      { name: 'applicationNumber', label: 'Application No.' },
      { name: 'rollNumber', label: 'Roll Number' },
      { name: 'course', label: 'Course' },
      { name: 'department', label: 'Department' },
      { name: 'qualification', label: 'Qualification' },
      { name: 'semester', label: 'Semester', type: 'number' },
      { name: 'academicSession', label: 'Academic Session' },
      { name: 'admissionStatus', label: 'Admission Status', options: ['Pending', 'Approved', 'Rejected'] },
      { name: 'admissionDate', label: 'Admission Date', type: 'date' },
      { name: 'admissionType', label: 'Admission Type', options: ['Regular', 'Lateral Entry'] },
      { name: 'specialization', label: 'Specialization' },
    ],
  },
  {
    title: 'Previous Education',
    fields: [
      { name: 'tenth', label: '10th' },
      { name: 'twelfth', label: '12th' },
      { name: 'previousCollege', label: 'Previous College' },
      { name: 'previousCourse', label: 'Previous Course' },
      { name: 'graduation', label: 'Graduation' },
      { name: 'entranceExam', label: 'Entrance Exam' },
    ],
  },
];

const initialPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';

  const date = new Date(`${dateValue}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

function ProfileSection({ title, children }) {
  return (
    <section className="profile-info-section">
      <h2>{title}</h2>
      <div className="profile-info-grid">{children}</div>
    </section>
  );
}

function ProfileDetail({ label, children, className = '' }) {
  return (
    <div className={`profile-detail ${className}`}>
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function ProfileFormSection({ title, fields, values, onChange }) {
  return (
    <section className="profile-info-section">
      <h2>{title}</h2>
      <div className="profile-info-grid">
        {fields.map((field) => (
          <label
            className={`profile-form-field ${field.wide ? 'profile-detail-wide' : ''}`}
            htmlFor={`profile-${field.name}`}
            key={field.name}
          >
            <span>{field.label}</span>
            {field.options ? (
              <select
                id={`profile-${field.name}`}
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
              >
                {field.options.map((option) => (
                  <option value={option} key={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                id={`profile-${field.name}`}
                type={field.type || 'text'}
                value={values[field.name]}
                onChange={(event) => onChange(field.name, event.target.value)}
                required={field.required}
                inputMode={field.inputMode}
                maxLength={field.maxLength}
                min={field.type === 'number' ? '1' : undefined}
              />
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

export default function Profile() {
  const [student, setStudent] = useState(initialStudent);
  const [draftStudent, setDraftStudent] = useState(initialStudent);
  const [isEditing, setIsEditing] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [passwordForm, setPasswordForm] = useState(initialPasswordForm);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');

  const initials = student.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const handleEdit = () => {
    setDraftStudent({ ...student });
    setPasswordForm(initialPasswordForm);
    setFormError('');
    setFeedback('');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDraftStudent({ ...student });
    setPasswordForm(initialPasswordForm);
    setFormError('');
    setIsEditing(false);
  };

  const handleSave = (event) => {
    event.preventDefault();
    setFormError('');

    const hasPasswordInput = Object.values(passwordForm).some(Boolean);
    if (hasPasswordInput) {
      if (Object.values(passwordForm).some((value) => !value)) {
        setFormError('Fill in the current password, new password, and confirmation to edit your password.');
        return;
      }
      if (passwordForm.newPassword.length < 8) {
        setFormError('New password must be at least 8 characters long.');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setFormError('New password and confirmation do not match.');
        return;
      }
    }

    setStudent({ ...draftStudent });
    setPasswordForm(initialPasswordForm);
    setIsEditing(false);
    setFeedback(
      hasPasswordInput
        ? 'Profile details updated for this page session. Password change is a frontend-only demo and is not connected to sign-in.'
        : 'Profile details updated for this page session.',
    );
  };

  const handleProfileChange = (field, value) => {
    setDraftStudent((current) => ({ ...current, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="student-profile-page">
      <header className="student-profile-header">
        <div>
          <p className="student-profile-eyebrow">STUDENT ACCOUNT</p>
          <h1>My Profile</h1>
          <p>{isEditing ? 'Update your profile information.' : 'Your personal, academic, and contact details.'}</p>
        </div>
        {!isEditing && (
          <button className="profile-edit-button" type="button" onClick={handleEdit}>
            Edit Profile
          </button>
        )}
      </header>

      {feedback && !isEditing && <p className="profile-feedback" role="status">{feedback}</p>}

      <div className="profile-identity-card">
        <div className="profile-identity-avatar">{initials}</div>
        <div className="profile-identity-main">
          <h2>{student.fullName}</h2>
          <p>{student.course} · Roll No. {student.rollNumber}</p>
        </div>
        <div className="profile-identity-meta">
          <span>Application No.</span>
          <strong>{student.applicationNumber}</strong>
        </div>
        <span className="profile-admission-status">{student.admissionStatus}</span>
      </div>

      {isEditing ? (
        <form className="profile-edit-form" onSubmit={handleSave}>
          {profileSections.map((section) => (
            <ProfileFormSection
              key={section.title}
              title={section.title}
              fields={section.fields}
              values={draftStudent}
              onChange={handleProfileChange}
            />
          ))}

          <section className="profile-info-section">
            <h2>Change Password</h2>
            <div className="profile-info-grid">
              <label className="profile-form-field" htmlFor="profile-current-password">
                <span>Current Password</span>
                <input
                  id="profile-current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => handlePasswordChange('currentPassword', event.target.value)}
                />
              </label>
              <label className="profile-form-field" htmlFor="profile-new-password">
                <span>New Password</span>
                <input
                  id="profile-new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(event) => handlePasswordChange('newPassword', event.target.value)}
                />
              </label>
              <label className="profile-form-field" htmlFor="profile-confirm-password">
                <span>Confirm New Password</span>
                <input
                  id="profile-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(event) => handlePasswordChange('confirmPassword', event.target.value)}
                />
              </label>
            </div>
            <p className="profile-demo-note">
              Frontend demo only: profile edits apply to this page session; password updates are not connected to sign-in.
            </p>
          </section>

          {formError && <p className="profile-form-error" role="alert">{formError}</p>}
          <div className="profile-form-actions">
            <button className="profile-cancel-button" type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="profile-save-button" type="submit">
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <>
          <ProfileSection title="Personal Information">
            <ProfileDetail label="Full Name">{student.fullName}</ProfileDetail>
            <ProfileDetail label="Gender">{student.gender}</ProfileDetail>
            <ProfileDetail label="Date of Birth">{formatDate(student.dateOfBirth)}</ProfileDetail>
            <ProfileDetail label="Aadhaar">
              <span className="profile-aadhaar-value">
                {showAadhaar ? student.aadhaar : `XXXX XXXX ${student.aadhaar.slice(-4)}`}
              </span>
              <button
                className="profile-reveal-button"
                type="button"
                aria-label={`${showAadhaar ? 'Hide' : 'Show'} full Aadhaar number`}
                aria-pressed={showAadhaar}
                onClick={() => setShowAadhaar((visible) => !visible)}
              >
                {showAadhaar ? 'Hide' : 'Show'}
              </button>
            </ProfileDetail>
            <ProfileDetail label="Blood Group">{student.bloodGroup}</ProfileDetail>
            <ProfileDetail label="Category">{student.category}</ProfileDetail>
            <ProfileDetail label="Nationality">{student.nationality}</ProfileDetail>
            <ProfileDetail label="Father's Name">{student.fatherName}</ProfileDetail>
            <ProfileDetail label="Mother's Name">{student.motherName}</ProfileDetail>
          </ProfileSection>

          <ProfileSection title="Contact Information">
            <ProfileDetail label="Email">
              <a href={`mailto:${student.email}`}>{student.email}</a>
            </ProfileDetail>
            <ProfileDetail label="Phone">
              <a href={`tel:${student.phone}`}>{student.phone}</a>
            </ProfileDetail>
            <ProfileDetail label="Parent Phone">
              <a href={`tel:${student.parentPhone}`}>{student.parentPhone}</a>
            </ProfileDetail>
            <ProfileDetail label="Parent Email">{student.parentEmail}</ProfileDetail>
            <ProfileDetail label="Address" className="profile-detail-wide">{student.address}</ProfileDetail>
          </ProfileSection>

          <ProfileSection title="Academic & Admission Details">
            <ProfileDetail label="Application No.">{student.applicationNumber}</ProfileDetail>
            <ProfileDetail label="Roll Number">{student.rollNumber}</ProfileDetail>
            <ProfileDetail label="Course">{student.course}</ProfileDetail>
            <ProfileDetail label="Department">{student.department}</ProfileDetail>
            <ProfileDetail label="Qualification">{student.qualification}</ProfileDetail>
            <ProfileDetail label="Semester">{student.semester}</ProfileDetail>
            <ProfileDetail label="Academic Session">{student.academicSession}</ProfileDetail>
            <ProfileDetail label="Admission Status">
              <span className="profile-inline-status">{student.admissionStatus}</span>
            </ProfileDetail>
            <ProfileDetail label="Admission Date">{formatDate(student.admissionDate)}</ProfileDetail>
            <ProfileDetail label="Admission Type">{student.admissionType}</ProfileDetail>
            <ProfileDetail label="Specialization">{student.specialization}</ProfileDetail>
          </ProfileSection>

          <ProfileSection title="Previous Education">
            <ProfileDetail label="10th">{student.tenth}</ProfileDetail>
            <ProfileDetail label="12th">{student.twelfth}</ProfileDetail>
            <ProfileDetail label="Previous College">{student.previousCollege}</ProfileDetail>
            <ProfileDetail label="Previous Course">{student.previousCourse}</ProfileDetail>
            <ProfileDetail label="Graduation">{student.graduation}</ProfileDetail>
            <ProfileDetail label="Entrance Exam">{student.entranceExam}</ProfileDetail>
          </ProfileSection>
        </>
      )}
    </section>
  );
}
