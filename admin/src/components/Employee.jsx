import axios from 'axios';
import React, { useState, useEffect } from 'react';
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
  )
};

export default function Employee() {
  const navigate = useNavigate();

  // State management
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Modal States
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedAttendanceEmp, setSelectedAttendanceEmp] = useState(null);

  // Fetch employees from API using Axios
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:4000/api/get/employee');
        
        if (response.data && response.data.success) {
          setEmployees(response.data.data);
        } else {
          setEmployees([]);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Error fetching employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);


  

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toISOString().split('T')[0];
    } catch {
      return dateStr;
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const name = emp.emp_name || '';
    const id = emp.emp_id || '';
    const email = emp.email || '';
    const role = emp.emp_role || '';
    const course = emp.emp_course || '';
    const phone = emp.contact_number || '';

    const matchesSearch =
      name.toLowerCase().includes(term) ||
      id.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      role.toLowerCase().includes(term) ||
      course.toLowerCase().includes(term) ||
      phone.toLowerCase().includes(term);

    const matchesDept = filterDepartment === 'All' || emp.emp_department === filterDepartment;
    const matchesStatus = filterStatus === 'All' || emp.emp_status === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleEdit = (id) => {
    navigate(`/employees/edit/${id}`);
  };

  const handleDelete = async (id) => {
  if (!id) {
    alert("Employee ID is missing");
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to delete this employee?"
  );

  if (!confirmed) return;

  try {
    const response = await axios.delete(
      `http://localhost:4000/api/delete/employee/${encodeURIComponent(id)}`
    );

    if (response.data?.success === false) {
      throw new Error(
        response.data.message || "Failed to delete employee"
      );
    }

    alert("Employee deleted successfully");

    // Reload the employee list
    // Replace fetchEmployees() with your existing list-fetching function.
    await fetchEmployees();
  } catch (error) {
    console.error(
      "Delete employee error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      error.message ||
      "Unable to delete employee"
    );
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
            placeholder="Search by name, ID, email, phone, course..."
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
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Web Development">Web Development</option>
            <option value="Data Science">Data Science</option>
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
        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px' }}>Loading employees...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#ef4444' }}>Error: {error}</div>
        ) : (
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
                filteredEmployees.map((emp) => {
                  const idKey = emp._id || emp.emp_id;
                  return (
                    <tr key={idKey}>
                      <td className="emp-id-badge">{emp.emp_id || 'N/A'}</td>
                      <td>
                        <div className="emp-name-cell">
                          <span className="name">{emp.emp_name}</span>
                          <span className="email">{emp.email}</span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>{emp.contact_number}</span>
                        </div>
                      </td>
                      <td>{emp.emp_department}</td>
                      <td>{emp.emp_course}</td>
                      <td><span className="badge-role">{emp.emp_role}</span></td>
                      <td>{formatDate(emp.emp_joining_date)}</td>
                      <td>
                        <span className={`status-pill ${(emp.emp_status || 'active').toLowerCase().replace(/\s+/g, '-')}`}>
                          {emp.emp_status || 'Active'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn-attendance"
                          onClick={() => setSelectedAttendanceEmp(emp)}
                          title="View attendance record"
                        >
                          <Icons.Calendar />
                          <span>{emp.emp_attendance || '100%'}</span>
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
                            onClick={() => handleEdit(emp.emp_id || emp._id)}
                            title="Edit Details"
                          >
                            <Icons.Edit />
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleDelete(emp._id || emp.emp_id, emp.emp_name)}
                            title="Delete Employee"
                          >
                            <Icons.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No employees matched your search and filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Full Profile Modal */}
      {selectedProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedProfile(null)}>
          <div className="modal-card profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Employee Profile: {selectedProfile.emp_name}</h2>
              <button className="btn-close" onClick={() => setSelectedProfile(null)}>
                <Icons.Close />
              </button>
            </div>

            <div className="modal-body">
              {/* Highlight Notice Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <small style={{ color: '#64748b', display: 'block' }}>Emp ID</small>
                  <strong>{selectedProfile.emp_id || 'N/A'}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b', display: 'block' }}>Emp Name</small>
                  <strong>{selectedProfile.emp_name}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b', display: 'block' }}>Emp Email</small>
                  <strong>{selectedProfile.email}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b', display: 'block' }}>Emp Phone</small>
                  <strong>{selectedProfile.contact_number}</strong>
                </div>
                <div>
                  <small style={{ color: '#64748b', display: 'block' }}>Department</small>
                  <strong>{selectedProfile.emp_department}</strong>
                </div>
              </div>

              {/* All Details */}
              <div className="profile-grid">
                <div className="info-section">
                  <h4 className="section-title">General Information</h4>
                  <div className="info-group">
                    <label>Employee ID:</label>
                    <span>{selectedProfile.emp_id || 'N/A'}</span>
                  </div>
                  <div className="info-group">
                    <label>Department:</label>
                    <span>{selectedProfile.emp_department}</span>
                  </div>
                  <div className="info-group">
                    <label>Role:</label>
                    <span>{selectedProfile.emp_role}</span>
                  </div>
                  <div className="info-group">
                    <label>Assigned Course:</label>
                    <span>{selectedProfile.emp_course}</span>
                  </div>
                  <div className="info-group">
                    <label>Date of Birth:</label>
                    <span>{formatDate(selectedProfile.emp_dob)}</span>
                  </div>
                  <div className="info-group">
                    <label>Joining Date:</label>
                    <span>{formatDate(selectedProfile.emp_joining_date)}</span>
                  </div>
                  <div className="info-group">
                    <label>Status:</label>
                    <span>{selectedProfile.emp_status || 'Active'}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h4 className="section-title">Personal & Contact</h4>
                  <div className="info-group">
                    <label>Email:</label>
                    <span>{selectedProfile.email}</span>
                  </div>
                  <div className="info-group">
                    <label>Contact Number:</label>
                    <span>{selectedProfile.contact_number}</span>
                  </div>
                  <div className="info-group">
                    <label>Qualification:</label>
                    <span>{selectedProfile.emp_qualification}</span>
                  </div>
                  <div className="info-group">
                    <label>Aadhaar Number:</label>
                    <span>{selectedProfile.emp_aadharnumber ? '[Aadhaar Redacted]' : 'N/A'}</span>
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

                <div className="info-section span-2">
                  <h4 className="section-title">Banking & Attendance Details</h4>
                  <div className="bank-credential-grid">
                    <div className="info-group">
                      <label>Bank Account Number:</label>
                      <span>{selectedProfile.accountnumber}</span>
                    </div>
                    <div className="info-group">
                      <label>IFSC Code:</label>
                      <span>{selectedProfile.ifsc_code}</span>
                    </div>
                    <div className="info-group">
                      <label>Attendance Rate:</label>
                      <span>{selectedProfile.emp_attendance || '100%'}</span>
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
                  const id = selectedProfile.emp_id || selectedProfile._id;
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
              <h2>Attendance Record: {selectedAttendanceEmp.emp_name}</h2>
              <button className="btn-close" onClick={() => setSelectedAttendanceEmp(null)}>
                <Icons.Close />
              </button>
            </div>
            <div className="modal-body">
              <div className="attendance-summary-card">
                <div>
                  <span className="label">Overall Attendance</span>
                  <span className="value">{selectedAttendanceEmp.emp_attendance || '100%'}</span>
                </div>
                <div>
                  <span className="label">Status</span>
                  <span className="value">{selectedAttendanceEmp.emp_status || 'Active'}</span>
                </div>
              </div>
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