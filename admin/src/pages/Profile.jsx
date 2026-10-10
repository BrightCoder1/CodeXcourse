import React, { useState } from 'react';
import './Profile.css';

const Profile = () => {
  // Admin Profile State
  const [profileData, setProfileData] = useState({
    name: 'Admin User',
    role: 'Super Administrator',
    email: 'admin@skillsphere.edu',
    phone: '+91 98765 43210',
    designation: 'Head of Operations & Curriculum',
    location: 'Bangalore, India',
    bio: 'Overseeing academic curriculum development, instructor workflows, and student enrollment systems.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    joinedDate: 'March 2023',
    linkedin: 'linkedin.com/in/admin-skillsphere',
    github: 'github.com/admin-edu'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profileData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setProfileData(formData);
    setIsEditing(false);
    alert('Admin profile updated successfully!');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
      setProfileData((prev) => ({ ...prev, avatar: url }));
    }
  };

  return (
    <div className="admin-profile-container">
      {/* 1. Profile Banner & Card Header */}
      <div className="admin-profile-header-card">
        <div className="admin-profile-cover-strip"></div>
        <div className="admin-profile-header-body">
          <div className="admin-avatar-wrapper">
            <img src={profileData.avatar} alt={profileData.name} className="admin-profile-avatar" />
            <label className="admin-avatar-upload-btn" title="Change Avatar">
              <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </label>
          </div>

          <div className="admin-profile-meta-details">
            <div className="admin-meta-name-row">
              <h2 className="admin-name">{profileData.name}</h2>
              <span className="admin-role-badge">{profileData.role}</span>
            </div>
            <p className="admin-designation">{profileData.designation}</p>
            <div className="admin-meta-sub-info">
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                {profileData.email}
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {profileData.location}
              </span>
              <span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Joined {profileData.joinedDate}
              </span>
            </div>
          </div>

          <div className="admin-profile-header-actions">
            <button
              className="admin-edit-profile-btn"
              onClick={() => {
                setFormData(profileData);
                setIsEditing(!isEditing);
              }}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Admin Quick Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Admissions Overseen</span>
          <h3 className="admin-stat-value">24,582</h3>
          <span className="admin-stat-desc">Across all semesters</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Active Courses Monitored</span>
          <h3 className="admin-stat-value">185</h3>
          <span className="admin-stat-desc">12 pending syllabus reviews</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-label">Recent Financial Approvals</span>
          <h3 className="admin-stat-value">94</h3>
          <span className="admin-stat-desc">Fee slips & concessions</span>
        </div>
      </div>

      {/* 3. Main Grid: Personal Details Form + Activity Logs */}
      <div className="admin-profile-details-grid">
        {/* Form / Details Panel */}
        <div className="admin-profile-card admin-profile-form-card">
          <div className="admin-card-header-clean">
            <h3 className="admin-card-title">Personal & Contact Details</h3>
            <p className="admin-card-subtitle">Manage your profile credentials and bio</p>
          </div>

          <form onSubmit={handleSave} className="admin-profile-form">
            <div className="admin-form-row-2">
              <div className="admin-form-field">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Designation / Title</label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-field">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="admin-form-field">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-field">
                <label>Location / City</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="admin-form-field">
                <label>Role Clearance</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  disabled
                  className="admin-input-disabled"
                />
              </div>
            </div>

            <div className="admin-form-field">
              <label>Bio / Summary</label>
              <textarea
                rows="3"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                disabled={!isEditing}
              ></textarea>
            </div>

            <div className="admin-form-row-2">
              <div className="admin-form-field">
                <label>LinkedIn Handle</label>
                <input
                  type="text"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="admin-form-field">
                <label>GitHub / Portfolio</label>
                <input
                  type="text"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <div className="admin-form-submit-row">
                <button type="button" className="admin-btn-cancel" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn-save">
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Activity Logs Panel */}
        <div className="admin-profile-card admin-activity-card">
          <div className="admin-card-header-clean">
            <h3 className="admin-card-title">Recent Admin Logs</h3>
            <p className="admin-card-subtitle">Audit trail of latest administrative activities</p>
          </div>

          <div className="admin-timeline-list">
            <div className="admin-timeline-item">
              <div className="admin-timeline-dot admin-dot-purple"></div>
              <div className="admin-timeline-content">
                <strong>Approved New Course</strong>
                <p>Added "Data Structures & Algorithms in Java" to curriculum</p>
                <small>2 hours ago</small>
              </div>
            </div>

            <div className="admin-timeline-item">
              <div className="admin-timeline-dot admin-dot-green"></div>
              <div className="admin-timeline-content">
                <strong>Fee Deposit Verified</strong>
                <p>Recorded $800 fee slip payment for Aria Chen</p>
                <small>Yesterday at 4:15 PM</small>
              </div>
            </div>

            <div className="admin-timeline-item">
              <div className="admin-timeline-dot admin-dot-amber"></div>
              <div className="admin-timeline-content">
                <strong>Student Status Changed</strong>
                <p>Updated roll STU-1004 status to Inactive</p>
                <small>Oct 08, 2026</small>
              </div>
            </div>

            <div className="admin-timeline-item">
              <div className="admin-timeline-dot admin-dot-blue"></div>
              <div className="admin-timeline-content">
                <strong>Exported Financial Report</strong>
                <p>Downloaded comprehensive Excel spreadsheet for Q3 review</p>
                <small>Oct 05, 2026</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;