import React, { useState } from 'react';

const initialCourses = [
  {
    id: 1,
    name: 'Introduction to Python Programming',
    code: 'CS-PY101',
    instructor: 'Dr. Sarah Mitchell',
    startDate: '2024-08-01',
    endDate: '2024-11-30',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Modern React & Next.js Architecture',
    code: 'CS-RCT202',
    instructor: 'Alex Rivera',
    startDate: '2024-08-15',
    endDate: '2024-12-10',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  },
  {
    id: 3,
    name: 'UI/UX Design Systems & Figma',
    code: 'DES-301',
    instructor: 'Elena Rostova',
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    image: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=60',
    status: 'Inactive'
  },
  {
    id: 4,
    name: 'Full Stack MERN Web Development',
    code: 'FS-MERN401',
    instructor: 'Vikram Mehta',
    startDate: '2024-09-10',
    endDate: '2025-01-20',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Data Structures & Algorithms in Java',
    code: 'CS-DSA205',
    instructor: 'Prof. Rajesh Sharma',
    startDate: '2024-08-20',
    endDate: '2024-12-25',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  },
  {
    id: 6,
    name: 'Machine Learning & Deep Neural Nets',
    code: 'AI-ML502',
    instructor: 'Dr. Ananya Iyer',
    startDate: '2024-10-01',
    endDate: '2025-02-15',
    image: 'https://images.unsplash.com/photo-1507146426996-ef0538821e1b?w=600&auto=format&fit=crop&q=60',
    status: 'Inactive'
  },
  {
    id: 7,
    name: 'DevOps: Docker, Kubernetes & CI/CD',
    code: 'DO-K8S303',
    instructor: 'Marcus Vance',
    startDate: '2024-09-15',
    endDate: '2024-12-30',
    image: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  },
  {
    id: 8,
    name: 'Cybersecurity & Ethical Hacking',
    code: 'SEC-ETH108',
    instructor: 'Nathan Drake',
    startDate: '2024-10-10',
    endDate: '2025-01-15',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60',
    status: 'Inactive'
  },
  {
    id: 9,
    name: 'Cloud Computing with AWS & Azure',
    code: 'CLD-AW704',
    instructor: 'Pooja Kapoor',
    startDate: '2024-08-25',
    endDate: '2024-11-28',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  },
  {
    id: 10,
    name: 'Database Engineering: SQL & MongoDB',
    code: 'DB-ENG204',
    instructor: 'Kavita Nair',
    startDate: '2024-09-05',
    endDate: '2024-12-20',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=60',
    status: 'Active'
  }
];

const emptyFormData = {
  name: '',
  code: '',
  instructor: '',
  startDate: '',
  endDate: '',
  image: '',
  status: 'Active'
};

const Course = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState(emptyFormData);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open modal for new course
  const handleOpenAddModal = () => {
    setEditingCourseId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  // Open modal to edit existing course
  const handleOpenEditModal = (course) => {
    setEditingCourseId(course.id);
    setFormData({
      name: course.name,
      code: course.code,
      instructor: course.instructor,
      startDate: course.startDate,
      endDate: course.endDate,
      image: course.image,
      status: course.status
    });
    setIsModalOpen(true);
  };

  // Delete course
  const handleDeleteCourse = (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this course?');
    if (isConfirmed) {
      setCourses((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Save (Create or Update)
  const handleSaveCourse = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (editingCourseId) {
      // Edit mode
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourseId
            ? {
                ...c,
                ...formData,
                image:
                  formData.image ||
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'
              }
            : c
        )
      );
    } else {
      // Add mode
      const newCourse = {
        id: Date.now(),
        ...formData,
        image:
          formData.image ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'
      };
      setCourses([newCourse, ...courses]);
    }

    setIsModalOpen(false);
    setFormData(emptyFormData);
    setEditingCourseId(null);
  };

  // Live filter for search and status
  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      course.name.toLowerCase().includes(q) ||
      course.code.toLowerCase().includes(q) ||
      course.instructor.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'All' ||
      course.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="course-module-container">
      {/* Top Header & Controls */}
      <div className="course-top-bar">
        <div className="course-title-section">
          <h2 className="section-title">Courses Management</h2>
          <p className="section-subtitle">
            Manage course syllabus, active status, schedules, and faculty
          </p>
        </div>

        <div className="course-actions">
          {/* Status Filter */}
          <div className="course-filter-wrapper">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="course-status-select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="course-search-wrapper">
            <svg
              className="search-icon"
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
              placeholder="Search course, code, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="course-search-input"
            />
          </div>

          {/* Add Course Button */}
          <button className="add-course-btn" onClick={handleOpenAddModal}>
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
            <span>Add Course</span>
          </button>
        </div>
      </div>

      {/* Courses Cards Grid */}
      <div className="courses-grid">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.id} className="course-card">
              <div className="course-card-image-box">
                <img
                  src={course.image}
                  alt={course.name}
                  className="course-card-img"
                />
                <span className="course-code-tag">{course.code}</span>
                <span
                  className={`course-status-badge ${course.status.toLowerCase()}`}
                >
                  {course.status}
                </span>
              </div>

              <div className="course-card-content">
                <h3 className="course-name">{course.name}</h3>

                <div className="teacher-info">
                  <span className="info-label">Instructor:</span>
                  <span className="teacher-name">{course.instructor}</span>
                </div>

                <div className="course-dates">
                  <div className="date-item">
                    <span className="info-label">Start:</span>
                    <span className="date-val">{course.startDate}</span>
                  </div>
                  <div className="date-item">
                    <span className="info-label">End:</span>
                    <span className="date-val">{course.endDate}</span>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                <div className="course-card-actions">
                  <button
                    className="card-action-btn edit-btn"
                    onClick={() => handleOpenEditModal(course)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    className="card-action-btn delete-btn"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-courses-view">
            <p>No courses found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title">
                {editingCourseId ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="modal-form">
              <div className="form-group">
                <label>Course Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Advanced Machine Learning"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Course Code</label>
                  <input
                    type="text"
                    name="code"
                    required
                    placeholder="e.g. CS-ML401"
                    value={formData.code}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Instructor Name</label>
                  <input
                    type="text"
                    name="instructor"
                    required
                    placeholder="e.g. Prof. David Miller"
                    value={formData.instructor}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Starting Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Ending Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Course Image URL</label>
                  <input
                    type="url"
                    name="image"
                    placeholder="Paste image web link (optional)"
                    value={formData.image}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingCourseId ? 'Update Course' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Course;