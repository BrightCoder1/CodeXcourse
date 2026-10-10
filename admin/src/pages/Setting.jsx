import React, { useState } from 'react';

const Setting = () => {
    // Default active tab set to security
    const [activeTab, setActiveTab] = useState('security');

    // Security Settings State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [twoFactorAuth, setTwoFactorAuth] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState('30');

    // Notifications State
    const [notifications, setNotifications] = useState({
        emailOnStudentRegister: true,
        emailOnFeeSubmit: true,
        smsOnOverdueFee: false,
        weeklyReportEmail: true,
    });

    // System Controls State
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [allowPublicRegistration, setAllowPublicRegistration] = useState(true);

    // Form Handlers
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleNotificationToggle = (key) => {
        setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleUpdatePassword = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New password aur Confirm password match nahi ho rahe.');
            return;
        }
        alert('Admin security credentials successfully update ho gaye hain!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    return (
        <div className="settings-container">
            {/* Settings Header */}
            <div className="settings-header">
                <div>
                    <h2 className="settings-title">Admin Settings & Configuration</h2>
                    <p className="settings-subtitle">
                        Manage admin security, notification alerts, and system controls
                    </p>
                </div>
            </div>

            {/* Settings Navigation Tabs */}
            <div className="settings-tabs-strip">
                <button
                    className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Security & Auth
                </button>

                <button
                    className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    Notifications
                </button>

                <button
                    className={`tab-btn ${activeTab === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveTab('system')}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    System Controls
                </button>
            </div>

            {/* Tab Panels */}
            <div className="settings-content-card">
                {/* 1. Security & Authentication */}
                {activeTab === 'security' && (
                    <div className="settings-section-stack">
                        <form onSubmit={handleUpdatePassword} className="settings-form">
                            <h3 className="section-title">Change Master Password</h3>
                            <p className="section-sub">Ensure you use at least 8 characters with numbers and special symbols</p>

                            <div className="form-grid-3">
                                <div className="form-field">
                                    <label>Current Password</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        placeholder="••••••••"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>New Password</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        placeholder="••••••••"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="form-field">
                                    <label>Confirm New Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="action-row">
                                <button type="submit" className="save-btn">
                                    Update Password
                                </button>
                            </div>
                        </form>

                        <hr className="divider-line" />

                        <div className="security-options-box">
                            <h3 className="section-title">Two-Factor Authentication (2FA)</h3>
                            <p className="section-sub">Add extra security check when logging into admin panel</p>

                            <div className="toggle-item-row">
                                <div>
                                    <strong>Enable 2FA Verification (OTP)</strong>
                                    <p>Send one-time password to admin email upon login</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={twoFactorAuth}
                                        onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="session-select-row">
                                <label>Admin Auto-Logout Session Timeout</label>
                                <select
                                    value={sessionTimeout}
                                    onChange={(e) => setSessionTimeout(e.target.value)}
                                    className="timeout-select"
                                >
                                    <option value="15">15 Minutes of inactivity</option>
                                    <option value="30">30 Minutes of inactivity</option>
                                    <option value="60">1 Hour of inactivity</option>
                                    <option value="never">Never (Stay logged in)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Notification Preferences */}
                {activeTab === 'notifications' && (
                    <div className="settings-section-stack">
                        <h3 className="section-title">Automated Notification Rules</h3>
                        <p className="section-sub">Configure when email and SMS reminders get triggered</p>

                        <div className="toggle-list">
                            <div className="toggle-item-row">
                                <div>
                                    <strong>New Student Enrollment Alert</strong>
                                    <p>Receive immediate email when a student registers or is admitted</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailOnStudentRegister}
                                        onChange={() => handleNotificationToggle('emailOnStudentRegister')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item-row">
                                <div>
                                    <strong>Fee Deposit Confirmation</strong>
                                    <p>Email receipt copy automatically to student and admin accounts</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.emailOnFeeSubmit}
                                        onChange={() => handleNotificationToggle('emailOnFeeSubmit')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item-row">
                                <div>
                                    <strong>Automated Overdue Fee SMS Alerts</strong>
                                    <p>Send scheduled SMS reminders to students having pending dues</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.smsOnOverdueFee}
                                        onChange={() => handleNotificationToggle('smsOnOverdueFee')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item-row">
                                <div>
                                    <strong>Weekly Growth & Analytics Digest</strong>
                                    <p>Receive comprehensive executive report every Monday morning</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={notifications.weeklyReportEmail}
                                        onChange={() => handleNotificationToggle('weeklyReportEmail')}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>
                        </div>

                        <div className="action-row">
                            <button
                                type="button"
                                className="save-btn"
                                onClick={() => alert('Notification preferences saved successfully!')}
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                )}

                {/* 3. System Controls & Maintenance */}
                {activeTab === 'system' && (
                    <div className="settings-section-stack">
                        <h3 className="section-title">System Health & Access Rules</h3>
                        <p className="section-sub">Control portal accessibility and system wide maintenance</p>

                        <div className="toggle-list">
                            <div className="toggle-item-row">
                                <div>
                                    <strong>Allow Public Student Registration</strong>
                                    <p>Allow students to apply from public portals without admin invite</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={allowPublicRegistration}
                                        onChange={() => setAllowPublicRegistration(!allowPublicRegistration)}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            <div className="toggle-item-row danger-zone">
                                <div>
                                    <strong className="danger-text">Maintenance Mode</strong>
                                    <p>Temporarily disable non-admin access to update databases or schedules</p>
                                </div>
                                <label className="switch-toggle">
                                    <input
                                        type="checkbox"
                                        checked={maintenanceMode}
                                        onChange={() => setMaintenanceMode(!maintenanceMode)}
                                    />
                                    <span className="slider slider-danger"></span>
                                </label>
                            </div>
                        </div>

                        <div className="system-data-actions">
                            <h4 className="sub-heading">Database & Cache Utilities</h4>
                            <div className="data-buttons-grid">
                                <button
                                    type="button"
                                    className="util-btn"
                                    onClick={() => alert('System cache flushed successfully!')}
                                >
                                    Clear Cached Session Data
                                </button>
                                <button
                                    type="button"
                                    className="util-btn backup-btn"
                                    onClick={() => alert('Complete database snapshot backup triggered.')}
                                >
                                    Create Backup Snapshot (.JSON)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Setting;