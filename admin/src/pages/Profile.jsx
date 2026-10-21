import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authServices";
import "./Profile.css";

const profileFields = [
  { key: "emp_id", label: "Employee ID" },
  { key: "emp_name", label: "Full name", editable: true },
  { key: "email", label: "Email address", editable: true },
  { key: "contact_number", label: "Contact number", editable: true },
  { key: "emp_dob", label: "Date of birth", date: true },
  { key: "emp_qualification", label: "Qualification" },
  { key: "emp_department", label: "Department" },
  { key: "emp_course", label: "Course" },
  { key: "emp_role", label: "Role" },
  { key: "emp_joining_date", label: "Joining date", date: true },
  { key: "emp_status", label: "Status" },
  { key: "emp_attendance", label: "Attendance" },
  { key: "emp_aadharnumber", label: "Aadhaar number" },
  { key: "pan_number", label: "PAN number" },
  { key: "address", label: "Address", editable: true },
  { key: "accountnumber", label: "Account number" },
  { key: "ifsc_code", label: "IFSC code" },
  { key: "createdAt", label: "Account created", date: true },
  { key: "updatedAt", label: "Last updated", date: true },
];

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
    setFormData({
      emp_name: user.emp_name || "",
      email: user.email || "",
      contact_number: user.contact_number || "",
      address: user.address || "",
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

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updatedUser = await authService.updateProfile(formData);
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
          <h1>My Profile</h1>
          <p>Your account and employee details.</p>
        </div>
        {isAdmin && !isEditing && (
          <button className="admin-edit-profile-btn" onClick={handleEdit}>
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
                  ? "Update your contact information."
                  : "Profile information associated with your account."}
              </p>
            </div>
          </div>

          {error && <p className="profile-message profile-error" role="alert">{error}</p>}
          {success && <p className="profile-message profile-success" role="status">{success}</p>}

          <dl className="profile-details-grid">
            {profileFields.map(({ key, label, editable, date }) => (
              <div className="profile-detail" key={key}>
                <dt>{label}</dt>
                <dd>
                  {isEditing && editable ? (
                    <input
                      type={key === "email" ? "email" : "text"}
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleInputChange}
                      required={key === "emp_name" || key === "email"}
                    />
                  ) : (
                    formatValue(user?.[key], date)
                  )}
                </dd>
              </div>
            ))}
          </dl>

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
