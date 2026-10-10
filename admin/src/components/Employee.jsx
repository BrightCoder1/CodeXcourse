import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// SVG Icons
const Icons = {
  Plus: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Calendar: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Lock: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

// Initial Mock Data
const INITIAL_EMPLOYEES = [
  {
    emp_id: 'EMP-1001',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@codex.com',
    contact: '+91 98765 43210',
    department: 'Web Development',
    course: 'Full Stack MERN',
    role: 'Senior Instructor',
    status: 'Active',
    dob: '1992-05-14',
    joining_date: '2022-03-01',
    qualification: 'M.Tech in Computer Science',
    aadhar_number: '[Aadhaar Redacted]',
    pan_number: 'ABCDE1234F',
    address: '42, Cyber Residency, Outer Ring Road, Bengaluru, KA',
    account_number: '9182736450192',
    ifsc_code: 'HDFC0001234',
    password: 'Password@123',
    attendance_rate: '96%'
  },
  {
    emp_id: 'EMP-1002',
    name: 'Priya Nair',
    email: 'priya.nair@codex.com',
    contact: '+91 98112 23344',
    department: 'Data Science',
    course: 'Python & Machine Learning',
    role: 'Lead Mentor',
    status: 'Active',
    dob: '1995-11-20',
    joining_date: '2023-01-15',
    qualification: 'B.Tech IT, PG Diploma in AI',
    aadhar_number: '[Aadhaar Redacted]',
    pan_number: 'XYZPK9876L',
    address: '15, Indiranagar 100ft Rd, Bengaluru, KA',
    account_number: '1029384756012',
    ifsc_code: 'SBIN0004567',
    password: 'SecurePriya#99',
    attendance_rate: '92%'
  },
  {
    emp_id: 'EMP-1003',
    name: 'Amit Patel',
    email: 'amit.patel@codex.com',
    contact: '+91 97234 56789',
    department: 'Design',
    course: 'UI/UX Design Masterclass',
    role: 'Design Faculty',
    status: 'On Leave',
    dob: '1990-08-09',
    joining_date: '2021-09-10',
    qualification: 'Bachelor of Design (NID)',
    aadhar_number: '[Aadhaar Redacted]',
    pan_number: 'LMNOP4321Q',
    address: '88, HSR Layout, Sector 3, Bengaluru, KA',
    account_number: '4567891230456',
    ifsc_code: 'ICIC0000890',
    password: 'AmitPass%2024',
    attendance_rate: '88%'
  }
];

export default function Employee() {
  const navigate = useNavigate();

  // State management
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal States
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedAttendanceEmp, setSelectedAttendanceEmp] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Filter Logic
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      emp.name.toLowerCase().includes(term) ||
      emp.emp_id.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.role.toLowerCase().includes(term) ||
      emp.course.toLowerCase().includes(term);

    const matchesDept = filterDepartment === 'All' || emp.department === filterDepartment;
    const matchesStatus = filterStatus === 'All' || emp.status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Action Handlers
  const handleEdit = (empId) => {
    navigate(`/employees/edit/${empId}`);
  };

  const handleDelete = (empId, empName) => {
    const confirmed = window.confirm(`Are you sure you want to delete employee "${empName}" (${empId})?`);
    if (confirmed) {
      setEmployees((prev) => prev.filter((item) => item.emp_id !== empId));
    }
  };

  return (
    <div className="employee-page">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees Directory</h1>
          <p className="page-subtitle">Manage all instructors, faculty members, and operational staff.</p>
        </div>
        {/* Declarative routing via Link prevents full page reload */}
        <Link to="/employees/add" className="btn-primary" style={{ textDecoration: 'none' }}>
          <Icons.Plus />
          <span>Add Employee</span>
        </Link>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="filter-card">
        <div className="search-bar-wrapper">
          <span className="search-icon"><Icons.Search /></span>
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, ID, email, course, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select 
            value={filterDepartment} 
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Departments</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
            <option value="Design">Design</option>
          </select>

          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Employee Data Table */}
      <div className="table-wrapper">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Employee Name</th>
              <th>Department</th>
              <th>Assigned Course</th>
              <th>Role</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Attendance</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((emp) => (
                <tr key={emp.emp_id}>
                  <td className="emp-id-badge">{emp.emp_id}</td>
                  <td>
                    <div className="emp-name-cell">
                      <span className="name">{emp.name}</span>
                      <span className="email">{emp.email}</span>
                    </div>
                  </td>
                  <td>{emp.department}</td>
                  <td>{emp.course}</td>
                  <td><span className="badge-role">{emp.role}</span></td>
                  <td>{emp.joining_date}</td>
                  <td>
                    <span className={`status-pill ${emp.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn-attendance"
                      onClick={() => setSelectedAttendanceEmp(emp)}
                      title="View attendance record"
                    >
                      <Icons.Calendar />
                      <span>{emp.attendance_rate}</span>
                    </button>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action view"
                        onClick={() => setSelectedProfile(emp)}
                        title="View Full Profile"
                      >
                        <Icons.Eye />
                      </button>
                      <button
                        className="btn-action edit"
                        onClick={() => handleEdit(emp.emp_id)}
                        title="Edit Details"
                      >
                        <Icons.Edit />
                      </button>
                      <button
                        className="btn-action delete"
                        onClick={() => handleDelete(emp.emp_id, emp.name)}
                        title="Delete Employee"
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">
                  No employees matched your search and filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Full Profile Modal */}
      {selectedProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedProfile(null)}>
          <div className="modal-card profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Profile: {selectedProfile.name}</h2>
              <button className="btn-close" onClick={() => setSelectedProfile(null)}>
                <Icons.Close />
              </button>
            </div>

            <div className="modal-body">
              <div className="profile-grid">
                {/* General Information */}
                <div className="info-section">
                  <h4 className="section-title">General Information</h4>
                  <div className="info-group">
                    <label>Employee ID:</label>
                    <span>{selectedProfile.emp_id}</span>
                  </div>
                  <div className="info-group">
                    <label>Department:</label>
                    <span>{selectedProfile.department}</span>
                  </div>
                  <div className="info-group">
                    <label>Role:</label>
                    <span>{selectedProfile.role}</span>
                  </div>
                  <div className="info-group">
                    <label>Assigned Course:</label>
                    <span>{selectedProfile.course}</span>
                  </div>
                  <div className="info-group">
                    <label>Date of Birth:</label>
                    <span>{selectedProfile.dob}</span>
                  </div>
                  <div className="info-group">
                    <label>Joining Date:</label>
                    <span>{selectedProfile.joining_date}</span>
                  </div>
                  <div className="info-group">
                    <label>Status:</label>
                    <span>{selectedProfile.status}</span>
                  </div>
                </div>

                {/* Personal & Contact Details */}
                <div className="info-section">
                  <h4 className="section-title">Personal & Contact</h4>
                  <div className="info-group">
                    <label>Email:</label>
                    <span>{selectedProfile.email}</span>
                  </div>
                  <div className="info-group">
                    <label>Contact Number:</label>
                    <span>{selectedProfile.contact}</span>
                  </div>
                  <div className="info-group">
                    <label>Qualification:</label>
                    <span>{selectedProfile.qualification}</span>
                  </div>
                  <div className="info-group">
                    <label>Aadhaar Number:</label>
                    <span>{selectedProfile.aadhar_number}</span>
                  </div>
                  <div className="info-group">
                    <label>PAN Number:</label>
                    <span>{selectedProfile.pan_number}</span>
                  </div>
                  <div className="info-group">
                    <label>Address:</label>
                    <span>{selectedProfile.address}</span>
                  </div>
                </div>

                {/* Banking & Account Credentials */}
                <div className="info-section span-2">
                  <h4 className="section-title">Banking & Account Credentials</h4>
                  <div className="bank-credential-grid">
                    <div className="info-group">
                      <label>Bank Account Number:</label>
                      <span>{selectedProfile.account_number}</span>
                    </div>
                    <div className="info-group">
                      <label>IFSC Code:</label>
                      <span>{selectedProfile.ifsc_code}</span>
                    </div>
                    <div className="info-group">
                      <label>Portal Password:</label>
                      <div className="password-reveal-container">
                        <span>{showPassword ? selectedProfile.password : '••••••••••••'}</span>
                        <button 
                          className="toggle-password-btn"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setSelectedProfile(null)}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  const id = selectedProfile.emp_id;
                  setSelectedProfile(null);
                  handleEdit(id);
                }}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {selectedAttendanceEmp && (
        <div className="modal-backdrop" onClick={() => setSelectedAttendanceEmp(null)}>
          <div className="modal-card attendance-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Attendance Record: {selectedAttendanceEmp.name}</h2>
              <button className="btn-close" onClick={() => setSelectedAttendanceEmp(null)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <div className="attendance-summary-card">
                <div>
                  <span className="label">Overall Attendance</span>
                  <span className="value">{selectedAttendanceEmp.attendance_rate}</span>
                </div>
                <div>
                  <span className="label">Total Classes Taken</span>
                  <span className="value">64 / 68</span>
                </div>
                <div>
                  <span className="label">Leave Deductions</span>
                  <span className="value">4 Days</span>
                </div>
              </div>

              <h4 style={{ margin: '16px 0 8px 0', fontSize: '14px', color: '#64748b' }}>Recent Logs</h4>
              <ul className="attendance-log-list">
                <li><span>Yesterday</span> <strong className="tag present">Present</strong></li>
                <li><span>2 days ago</span> <strong className="tag present">Present</strong></li>
                <li><span>3 days ago</span> <strong className="tag leave">Approved Leave</strong></li>
                <li><span>4 days ago</span> <strong className="tag present">Present</strong></li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={() => setSelectedAttendanceEmp(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}