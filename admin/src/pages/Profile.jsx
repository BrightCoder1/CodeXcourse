import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authServices";
import "./Profile.css";

const profileFields = [
  { key: "emp_id", label: "Employee ID" },
  { key: "emp_name", label: "Full name", editable: true, required: true },
  { key: "email", label: "Email address", type: "email", editable: true, required: true },
  { key: "contact_number", label: "Contact number", type: "tel", editable: true, required: true },
  { key: "emp_dob", label: "Date of birth", type: "date", editable: true, required: true },
  { key: "emp_qualification", label: "Qualification", editable: true, required: true },
  {
    key: "emp_department",
    label: "Department",
    editable: true,
    required: true,
    options: [
      "Web Development",
      "Data Science & AI",
      "UI/UX Design",
      "Mobile Development",
      "Administration",
    ],
  },
  { key: "emp_course", label: "Course", editable: true, required: true },
  { key: "emp_role", label: "Role" },
  { key: "emp_joining_date", label: "Joining date", type: "date", editable: true, required: true },
  {
    key: "emp_status",
    label: "Status",
    editable: true,
    options: ["Active", "On Leave", "Probation", "Inactive"],
  },
  { key: "emp_attendance", label: "Attendance", editable: true },
  { key: "emp_aadharnumber", label: "Aadhaar number", editable: true, inputMode: "numeric", maxLength: 12 },
  { key: "pan_number", label: "PAN number", editable: true, maxLength: 10 },
  { key: "address", label: "Address", editable: true },
  { key: "accountnumber", label: "Account number", editable: true, inputMode: "numeric", maxLength: 18 },
  { key: "ifsc_code", label: "IFSC code", editable: true, maxLength: 11 },
  { key: "createdAt", label: "Account created", date: true },
  { key: "updatedAt", label: "Last updated", date: true },
];

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const formatValue = (value, date) => {
  if (value === undefined || value === null || value === "") {
    return "Not provided";
  }

  if (date) {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime())
      ? "Not provided"
      : parsedDate.toLocaleDateString();
  }

  return String(value);
};

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const isAdmin = user?.emp_role === "admin";

  const handleEdit = () => {
    if (!isAdmin) return;
    const editableData = Object.fromEntries(
      profileFields
        .filter(({ editable }) => editable)
        .map(({ key, type }) => [
          key,
          type === "date" ? formatDate(user?.[key]) : user?.[key] || "",
        ])
    );
    setFormData({
      ...editableData,
      current_password: "",
      password: "",
      confirm_password: "",
    });
    setError("");
    setSuccess("");
    setIsEditing(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!isAdmin) return;

    if (formData.password && formData.password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (formData.password && !formData.current_password) {
      setError("Enter your current password to change it.");
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError("New password and confirmation do not match.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const profileData = { ...formData };
      delete profileData.confirm_password;
      if (!profileData.password) {
        delete profileData.password;
        delete profileData.current_password;
      }
      const updatedUser = await authService.updateProfile(profileData);
      updateUser(updatedUser);
      setIsEditing(false);
      setSuccess("Profile updated successfully.");
    } catch (saveError) {
      setError(
        saveError.response?.data?.message ||
          saveError.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
  };

  return (
    <section className="admin-profile-container">
      <header className="profile-page-heading">
        <div>
          <h1>Profile & Update</h1>
          <p>Your account and details.</p>
        </div>
        {isAdmin && !isEditing && (
          <button type="button" className="admin-edit-profile-btn" onClick={handleEdit}>
            Edit profile
          </button>
        )}
      </header>

      <div className="profile-user-card">
        <div className="profile-user-initial" aria-hidden="true">
          {(user?.emp_name || user?.email || "U").charAt(0).toUpperCase()}
        </div>
        <div>
          <h2>{user?.emp_name || "User"}</h2>
          <span className="admin-role-badge">{user?.emp_role || "User"}</span>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <section className="admin-profile-card profile-details-card">
          <div className="profile-details-heading">
            <div>
              <h2 className="admin-card-title">User details</h2>
              <p className="admin-card-subtitle">
                {isEditing
                  ? "Edit your profile details. Role and employee ID are managed by the system."
                  : "Profile information associated with your account."}
              </p>
            </div>
          </div>

          {error && <p className="profile-message profile-error" role="alert">{error}</p>}
          {success && <p className="profile-message profile-success" role="status">{success}</p>}

          <dl className="profile-details-grid">
            {profileFields.map(({ key, label, editable, type = "text", required, options, inputMode, maxLength, date }) => (
              <div className="profile-detail" key={key}>
                <dt>{label}</dt>
                <dd>
                  {isEditing && editable ? (
                    options ? (
                      <select
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                        required={required}
                      >
                        <option value="">Select {label.toLowerCase()}</option>
                        {options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    ) : key === "address" ? (
                      <textarea
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    ) : (
                      <input
                        type={type}
                        name={key}
                        value={formData[key] || ""}
                        onChange={handleInputChange}
                        required={required}
                        inputMode={inputMode}
                        maxLength={maxLength}
                        autoComplete={key === "email" ? "email" : "off"}
                      />
                    )
                  ) : (
                    formatValue(user?.[key], date)
                  )}
                </dd>
              </div>
            ))}
          </dl>

          {isEditing && isAdmin && (
            <div className="profile-password-section">
              <h3>Change password</h3>
              <p>Enter your current password to verify your identity. Leave all password fields blank to keep it unchanged.</p>
              <div className="profile-password-grid">
                <label>
                  Current password
                  <input
                    type="password"
                    name="current_password"
                    value={formData.current_password || ""}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    placeholder="Enter current password"
                  />
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    name="password"
                    value={formData.password || ""}
                    onChange={handleInputChange}
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password || ""}
                    onChange={handleInputChange}
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                  />
                </label>
              </div>
            </div>
          )}

          {isEditing && isAdmin && (
            <div className="profile-form-actions">
              <button
                type="button"
                className="admin-btn-cancel"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="admin-btn-save" disabled={saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </section>
      </form>
    </section>
  );
}
