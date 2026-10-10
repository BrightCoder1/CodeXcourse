import React, { useState } from 'react';

const initialStudents = [
  {
    id: 1,
    name: 'Aria Chen',
    email: 'aria.chen@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    course: 'Intro to Python',
    rollNo: 'STU-1001',
    joinDate: '2024-07-18',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Leo Novak',
    email: 'leo.novak@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    course: 'React basics',
    rollNo: 'STU-1002',
    joinDate: '2024-07-12',
    status: 'Pending'
  },
  {
    id: 3,
    name: 'Sophia Patel',
    email: 'sophia.p@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    course: 'UI/UX Design',
    rollNo: 'STU-1003',
    joinDate: '2024-06-25',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Liam Miller',
    email: 'liam.m@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    course: 'Full Stack MERN',
    rollNo: 'STU-1004',
    joinDate: '2024-05-14',
    status: 'Inactive'
  },
  {
    id: 5,
    name: 'Emma Watson',
    email: 'emma.w@example.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    course: 'Data Structures in Java',
    rollNo: 'STU-1005',
    joinDate: '2024-08-01',
    status: 'Active'
  }
];

const emptyStudent = {
  name: '',
  email: '',
  rollNo: '',
  course: '',
  joinDate: '',
  status: 'Active',
  avatar: ''
};

const Student = () => {
  const [students, setStudents] = useState(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [formData, setFormData] = useState(emptyStudent);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setFormData(emptyStudent);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudentId(student.id);
    setFormData(student);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;

    const fallbackAvatar =
      formData.avatar.trim() ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.name)}`;

    if (editingStudentId) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudentId
            ? { ...s, ...formData, avatar: fallbackAvatar }
            : s
        )
      );
    } else {
      const newStudent = {
        id: Date.now(),
        ...formData,
        avatar: fallbackAvatar,
        joinDate: formData.joinDate || new Date().toISOString().split('T')[0]
      };
      setStudents([newStudent, ...students]);
    }

    setIsModalOpen(false);
    setFormData(emptyStudent);
    setEditingStudentId(null);
  };

  // Filter & Search logic
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.course.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="students-container">
      {/* Top Header & Bar */}
      <div className="students-top-bar">
        <div className="students-title-meta">
          <h2 className="students-heading">Students Directory</h2>
          <span className="total-students-counter">
            Total: <strong>{students.length}</strong>
          </span>
        </div>

        <div className="students-actions">
          {/* Status Filter */}
          <div className="filter-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-dropdown"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Search Bar */}
          <div className="student-search-box">
            <svg
              className="search-svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by student, roll no, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="student-search-field"
            />
          </div>

          {/* Add Student Button */}
          <button className="add-student-btn" onClick={handleOpenAdd}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="student-table-card">
        <div className="table-responsive">
          <table className="student-main-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Enrolled Course</th>
                <th>Join Date</th>
                <th>Status</th>
                <th className="action-col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((item) => (
                  <tr key={item.id}>
                    <td className="student-cell">
                      <img src={item.avatar} alt={item.name} className="student-img" />
                      <div className="student-meta">
                        <span className="student-title-name">{item.name}</span>
                        <span className="student-sub-email">{item.email}</span>
                      </div>
                    </td>
                    <td className="roll-cell">{item.rollNo || 'N/A'}</td>
                    <td className="course-cell">{item.course}</td>
                    <td className="date-cell">{item.joinDate}</td>
                    <td className="status-cell">
                      <span className={`student-status-badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="action-buttons-cell">
                      <button
                        className="tbl-icon-btn edit-icon-btn"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit Student"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="tbl-icon-btn delete-icon-btn"
                        onClick={() => handleDelete(item.id)}
                        title="Delete Student"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-records-cell">
                    No student records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="student-modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingStudentId ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="student-modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Roll Number / ID</label>
                  <input
                    type="text"
                    name="rollNo"
                    required
                    placeholder="e.g. STU-1006"
                    value={formData.rollNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Enrolled Course</label>
                  <input
                    type="text"
                    name="course"
                    required
                    placeholder="e.g. Modern React"
                    value={formData.course}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Joining Date</label>
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Profile Picture URL (Optional)</label>
                <input
                  type="url"
                  name="avatar"
                  placeholder="https://..."
                  value={formData.avatar}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save">
                  {editingStudentId ? 'Update Student' : 'Save Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;