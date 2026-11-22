import { useState } from 'react';
import './Profile.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const LOGIN_URL = import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5173/login';

const profileSections = [
  {
    title: 'Personal Information',
    fields: [
      { name: 'student_name', label: 'First Name', required: true },
      { name: 'middle_name', label: 'Middle Name' },
      { name: 'last_name', label: 'Last Name', required: true },
      { name: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'aadhar_card_number', label: 'Aadhaar Number', required: true, masked: true },
      { name: 'pan_card_number', label: 'PAN Card' },
      { name: 'blood_group', label: 'Blood Group' },
      { name: 'category', label: 'Category', options: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'] },
      { name: 'nationality', label: 'Nationality' },
      { name: 'father_name', label: "Father's Name", required: true },
      { name: 'mother_name', label: "Mother's Name", required: true },
      { name: 'guardian_name', label: "Guardian's Name" },
    ],
  },
  {
    title: 'Contact Information',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'phone_number', label: 'Phone Number', type: 'tel', required: true },
      { name: 'alternate_phone', label: 'Alternate Phone', type: 'tel' },
      { name: 'address', label: 'Street Address', required: true },
      { name: 'city', label: 'City', required: true },
      { name: 'state', label: 'State', required: true },
      { name: 'pin_code', label: 'PIN Code', required: true },
      { name: 'country', label: 'Country' },
      { name: 'parent_phone', label: 'Parent Phone', type: 'tel', required: true },
      { name: 'parent_email', label: 'Parent Email', type: 'email' },
    ],
  },
  {
    title: 'Academic & Admission Details',
    fields: [
      { name: 'application_number', label: 'Application No.' },
      { name: 'admission_number', label: 'Admission No.' },
      { name: 'roll_number', label: 'Roll Number' },
      { name: 'course', label: 'Course' },
      { name: 'department', label: 'Department' },
      { name: 'qualification', label: 'Qualification', editable: true, required: true },
      { name: 'semester', label: 'Semester', type: 'number' },
      { name: 'academic_session', label: 'Academic Session' },
      { name: 'admission_status', label: 'Admission Status' },
      { name: 'admission_date', label: 'Admission Date', type: 'date' },
      { name: 'admission_type', label: 'Admission Type' },
      { name: 'specialization', label: 'Specialization' },
    ],
  },
  {
    title: 'Previous Education',
    fields: [
      { name: 'tenth_board', label: '10th Board', editable: true },
      { name: 'tenth_passing_year', label: '10th Passing Year', type: 'number', editable: true },
      { name: 'tenth_percentage', label: '10th Percentage (%)', type: 'number', suffix: '%', editable: true },
      { name: 'twelfth_board', label: '12th Board', editable: true },
      { name: 'twelfth_passing_year', label: '12th Passing Year', type: 'number', editable: true },
      { name: 'twelfth_percentage', label: '12th Percentage (%)', type: 'number', suffix: '%', editable: true },
      { name: 'previous_college', label: 'Previous College', editable: true },
      { name: 'previous_course', label: 'Previous Course', editable: true },
      { name: 'graduation_percentage', label: 'Graduation Percentage (%)', type: 'number', suffix: '%', editable: true },
      { name: 'entrance_exam_name', label: 'Entrance Exam', editable: true },
      { name: 'entrance_exam_score', label: 'Entrance Exam Score', type: 'number', editable: true },
    ],
  },
];

const editableFields = profileSections.flatMap(({ title, fields }) => (
  fields
    .filter((field) => field.editable === true || [
      'Personal Information',
      'Contact Information',
    ].includes(title))
    .map((field) => field.name)
));

const emptyPasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const displayValue = (value) => (
  value === undefined || value === null || value === '' ? 'N/A' : value
);

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const formatInputDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

function ProfileTable({ title, fields, student, draft, isEditing, showAadhaar, onChange, onToggleAadhaar }) {
  return (
    <section className="profile-info-section">
      <h2>{title}</h2>
      <div className="profile-table-wrap">
        <table className="profile-table">
          <tbody>
            {fields.map((field) => {
              const value = isEditing ? draft[field.name] : student[field.name];
              const canEdit = field.editable !== false && (
                field.editable === true ||
                ['Personal Information', 'Contact Information'].includes(title)
              );

              return (
                <tr key={field.name}>
                  <th scope="row">{field.label}</th>
                  <td>
                    {isEditing && canEdit ? (
                      field.options ? (
                        <select
                          id={`profile-${field.name}`}
                          value={value ?? ''}
                          onChange={(event) => onChange(field.name, event.target.value)}
                          required={field.required}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map((option) => (
                            <option value={option} key={option}>{option}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          id={`profile-${field.name}`}
                          type={field.type || 'text'}
                          value={field.type === 'date' ? formatInputDate(value) : value ?? ''}
                          onChange={(event) => onChange(field.name, event.target.value)}
                          required={field.required}
                          min={field.type === 'number' ? '0' : undefined}
                          max={field.suffix ? '100' : undefined}
                          step={field.suffix ? '0.01' : undefined}
                        />
                      )
                    ) : (
                      <span>
                        {field.type === 'date'
                          ? formatDate(value)
                          : field.masked && value && !showAadhaar
                            ? `XXXX XXXX ${String(value).slice(-4)}`
                            : field.suffix && value !== undefined && value !== null && value !== ''
                              ? `${value}${field.suffix}`
                              : displayValue(value)}
                        {field.masked && value && !isEditing && (
                          <button
                            className="profile-reveal-button"
                            type="button"
                            aria-label={`${showAadhaar ? 'Hide' : 'Show'} full Aadhaar number`}
                            aria-pressed={showAadhaar}
                            onClick={onToggleAadhaar}
                          >
                            {showAadhaar ? 'Hide' : 'Show'}
                          </button>
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function Profile({ student, onStudentUpdated }) {
  const [draft, setDraft] = useState(student);
  const [isEditing, setIsEditing] = useState(false);
  const [showAadhaar, setShowAadhaar] = useState(false);
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [formError, setFormError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fullName = [student.student_name, student.middle_name, student.last_name]
    .filter(Boolean)
    .join(' ') || 'Student';
  const initials = fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  const beginEditing = () => {
    setDraft({ ...student });
    setPasswordForm(emptyPasswordForm);
    setFormError('');
    setFeedback('');
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft({ ...student });
    setPasswordForm(emptyPasswordForm);
    setFormError('');
    setIsEditing(false);
  };

  const handleProfileChange = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setFormError('');
    setFeedback('');

    const hasPasswordInput = Object.values(passwordForm).some(Boolean);
    if (hasPasswordInput) {
      if (Object.values(passwordForm).some((value) => !value)) {
        setFormError('Enter your current password, new password, and confirmation to change your password.');
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

    const payload = Object.fromEntries(
      editableFields.map((field) => [field, draft[field] ?? '']),
    );
    if (hasPasswordInput) {
      payload.currentPassword = passwordForm.currentPassword;
      payload.newPassword = passwordForm.newPassword;
      payload.confirmPassword = passwordForm.confirmPassword;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/student/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        window.location.assign(LOGIN_URL);
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || 'Unable to update your profile.');
      }

      setDraft(data.student);
      onStudentUpdated(data.student);
      setPasswordForm(emptyPasswordForm);
      setIsEditing(false);
      setFeedback(data.message || 'Profile updated successfully.');
    } catch (error) {
      setFormError(error.message || 'Unable to update your profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="student-profile-page">
      <header className="student-profile-header">
        <div>
          <p className="student-profile-eyebrow">STUDENT ACCOUNT</p>
          <h1>My Profile</h1>
          <p>{isEditing ? 'Edit your profile details below.' : 'Your personal, academic, and contact details.'}</p>
        </div>
        {!isEditing && (
          <button className="profile-edit-button" type="button" onClick={beginEditing}>
            Edit Profile
          </button>
        )}
      </header>

      {feedback && !isEditing && <p className="profile-feedback" role="status">{feedback}</p>}

      <div className="profile-identity-card">
        <div className="profile-identity-avatar">{initials}</div>
        <div className="profile-identity-main">
          <h2>{fullName}</h2>
          <p>{displayValue(student.course)} · Roll No. {displayValue(student.roll_number)}</p>
        </div>
        <div className="profile-identity-meta">
          <span>Application No.</span>
          <strong>{displayValue(student.application_number)}</strong>
        </div>
        <span className="profile-admission-status">{displayValue(student.admission_status)}</span>
      </div>

      <form onSubmit={handleSave}>
        {profileSections.map((section) => (
          <ProfileTable
            key={section.title}
            title={section.title}
            fields={section.fields}
            student={student}
            draft={draft}
            isEditing={isEditing}
            showAadhaar={showAadhaar}
            onChange={handleProfileChange}
            onToggleAadhaar={() => setShowAadhaar((visible) => !visible)}
          />
        ))}

        {isEditing && (
          <>
            <section className="profile-info-section">
              <h2>Reset Password</h2>
              <div className="profile-password-grid">
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
                Leave all password fields blank if you only want to update profile details.
              </p>
            </section>
            {formError && <p className="profile-form-error" role="alert">{formError}</p>}
            <div className="profile-form-actions">
              <button
                className="profile-cancel-button"
                type="button"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button className="profile-save-button" type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}
