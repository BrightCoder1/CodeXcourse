import React, { useState, useEffect } from 'react';
import axios from 'axios';
import attendanceServices from '../services/attendanceServices';
import {
  FaPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUserTie,
  FaGraduationCap,
  FaUsers,
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:4000/api/courses';

const initialFormData = {
  courseName: '',
  courseCode: '',
  instructorName: '',
  teacherName: '',
  qualification: '',
  startingDate: '',
  endingDate: '',
  status: 'Active',
  courseImageUrl: ''
};

const studentDisplayName = (student) =>
  [student?.student_name, student?.middle_name, student?.last_name]
    .filter(Boolean)
    .join(' ') || 'Unnamed student';

const studentIdentifier = (student) =>
  student?.roll_number || student?.application_number || student?.admission_number || student?._id;

const Course = () => {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherLoadError, setTeacherLoadError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);

  // View Details Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [studentAssignmentCourse, setStudentAssignmentCourse] = useState(null);
  const [assignmentStudents, setAssignmentStudents] = useState([]);
  const [assignmentStudentIds, setAssignmentStudentIds] = useState([]);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentError, setAssignmentError] = useState('');
  const [assignmentNotice, setAssignmentNotice] = useState('');

  // Auth Header helper
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('adminToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  // 1. Fetch All Courses from MongoDB
  const fetchCourses = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await axios.get(API_BASE_URL, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCourses(data);
    } catch (err) {
      console.error('Fetch Courses Error:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to fetch courses from backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await attendanceServices.getAdminAssignments();
      if (!Array.isArray(data?.teachers)) {
        throw new Error('Registered teacher list was not returned by the server.');
      }
      setTeachers(data.teachers);
    } catch (err) {
      console.error('Fetch Teachers Error:', err);
      setTeacherLoadError(err.message || 'Failed to load registered teachers.');
    }
  };

  const handleOpenStudentAssignments = async (course) => {
    const courseId = course._id || course.id;
    setStudentAssignmentCourse(course);
    setAssignmentStudents([]);
    setAssignmentStudentIds([]);
    setAssignmentSearch('');
    setAssignmentError('');
    setAssignmentNotice('');
    setAssignmentLoading(true);
    try {
      const data = await attendanceServices.getCourseStudents(courseId);
      if (!Array.isArray(data?.students) || !Array.isArray(data?.assignedStudentIds)) {
        throw new Error('Student assignments were not returned by the server.');
      }
      setAssignmentStudents(data.students);
      setAssignmentStudentIds(data.assignedStudentIds);
    } catch (err) {
      console.error('Fetch Course Students Error:', err);
      setAssignmentError(err.message || 'Failed to load students for this course.');
    } finally {
      setAssignmentLoading(false);
    }
  };

  const toggleStudentAssignment = (studentId) => {
    setAssignmentStudentIds((current) => current.includes(studentId)
      ? current.filter((id) => id !== studentId)
      : [...current, studentId]);
  };

  const handleSaveStudentAssignments = async () => {
    if (!studentAssignmentCourse) return;
    const courseId = studentAssignmentCourse._id || studentAssignmentCourse.id;
    setAssignmentSaving(true);
    setAssignmentError('');
    try {
      const response = await attendanceServices.saveCourseStudents(courseId, {
        studentIds: assignmentStudentIds,
      });
      setAssignmentNotice(response.message || 'Student course assignments updated.');
      setStudentAssignmentCourse(null);
    } catch (err) {
      console.error('Save Course Students Error:', err);
      setAssignmentError(err.message || 'Failed to update course student assignments.');
    } finally {
      setAssignmentSaving(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchTeachers();
  }, []);

  // Form input handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeacherNameChange = (value) => {
    const normalizedValue = value.trim().toLocaleLowerCase();
    const selectedTeacher = teachers.find((teacher) =>
      teacher.emp_name?.toLocaleLowerCase() === normalizedValue ||
      teacher.emp_id?.toLocaleLowerCase() === normalizedValue
    );
    setFormData((prev) => ({
      ...prev,
      teacherName: selectedTeacher?.emp_name || value,
    }));
  };

  // Open modal for Adding
  const handleOpenAdd = () => {
    setEditingCourseId(null);
    setFormData(initialFormData);
    setIsFormModalOpen(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (course) => {
    const id = course._id || course.id;
    setEditingCourseId(id);
    setFormData({
      courseName: course.courseName || '',
      courseCode: course.courseCode || '',
      instructorName: course.instructorName || '',
      teacherName: course.teacherName || '',
      qualification: course.qualification || '',
      startingDate: course.startingDate ? course.startingDate.split('T')[0] : '',
      endingDate: course.endingDate ? course.endingDate.split('T')[0] : '',
      status: course.status || 'Active',
      courseImageUrl: course.courseImageUrl || ''
    });
    setIsFormModalOpen(true);
  };

  // Open modal for Viewing Details
  const handleOpenView = async (course) => {
    const id = course._id || course.id;
    try {
      const res = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      if (!res.data?.data) {
        throw new Error('Course details were not returned by the server.');
      }
      setSelectedCourse(res.data.data);
      setViewModalOpen(true);
    } catch (err) {
      console.error('Fetch Course Details Error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to fetch course details.');
    }
  };

  // 2. Create or Update Course API
  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        courseImageUrl:
          formData.courseImageUrl ||
          'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'
      };

      if (editingCourseId) {
        // PUT Update
        const res = await axios.put(`${API_BASE_URL}/${editingCourseId}`, payload, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        const updated = res.data?.data;
        if (!updated) throw new Error('Updated course was not returned by the server.');
        setCourses((prev) =>
          prev.map((c) => ((c._id || c.id) === editingCourseId ? { ...c, ...updated } : c))
        );
        alert('Course updated successfully!');
      } else {
        // POST Create
        const res = await axios.post(API_BASE_URL, payload, {
          headers: getAuthHeaders(),
          withCredentials: true
        });
        const created = res.data?.data;
        if (!created) throw new Error('Created course was not returned by the server.');
        setCourses((prev) => [created, ...prev]);
        alert('Course added successfully!');
      }

      setIsFormModalOpen(false);
      setFormData(initialFormData);
      setEditingCourseId(null);
    } catch (err) {
      console.error('Save Course Error:', err);
      alert(err.response?.data?.message || err.message || 'Error occurred while saving course.');
    }
  };

  // 3. Delete Course API
  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course record?')) return;

    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true
      });
      setCourses((prev) => prev.filter((c) => (c._id || c.id) !== id));
      alert('Course deleted successfully!');
    } catch (err) {
      console.error('Delete Course Error:', err);
      alert(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  // Search & Status Filtering
  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase().trim();
    const name = (course.courseName || '').toLowerCase();
    const code = (course.courseCode || '').toLowerCase();
    const instructor = (course.instructorName || '').toLowerCase();
    const teacher = (course.teacherName || '').toLowerCase();
    const status = course.status || 'Active';

    const matchesSearch =
      q === '' ||
      name.includes(q) ||
      code.includes(q) ||
      instructor.includes(q) ||
      teacher.includes(q);

    const matchesStatus =
      statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const assignmentQuery = assignmentSearch.trim().toLocaleLowerCase();
  const filteredAssignmentStudents = assignmentStudents.filter((student) => {
    if (!assignmentQuery) return true;
    return [
      studentDisplayName(student),
      studentIdentifier(student),
      student.email,
      student._id,
    ].filter(Boolean).join(' ').toLocaleLowerCase().includes(assignmentQuery);
  });

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Top Header & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Courses Management</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '4px' }}>
            Manage curriculum, faculty instructors, schedules and active courses
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Search by course, code, teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '9px 14px 9px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '240px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          {/* Add Course Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', padding: '9px 16px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: '0.2s' }}
          >
            <FaPlus size={14} /> Add Course
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div style={{ backgroundColor: '#fee2e2', border: '1px solid #f87171', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {errorMessage}
        </div>
      )}
      {assignmentNotice && (
        <div role="status" style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px' }}>
          {assignmentNotice}
        </div>
      )}

      {/* Courses Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '1.1rem' }}>
          Loading course records...
        </div>
      ) : filteredCourses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredCourses.map((course) => {
            const courseId = course._id || course.id;
            const statusStyle =
              course.status === 'Active'
                ? { bg: '#dcfce7', text: '#15803d' }
                : course.status === 'Upcoming'
                ? { bg: '#e0e7ff', text: '#4338ca' }
                : { bg: '#fee2e2', text: '#b91c1c' };

            return (
              <div
                key={courseId}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e2e8f0',
                  transition: 'transform 0.2s',
                }}
              >
                {/* Image & Status Tag */}
                <div style={{ position: 'relative', height: '170px', width: '100%', backgroundColor: '#e2e8f0' }}>
                  <img
                    src={course.courseImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}
                    alt={course.courseName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      color: '#fff',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {course.courseCode}
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.text,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '20px'
                    }}
                  >
                    {course.status || 'Active'}
                  </span>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 10px 0', minHeight: '44px' }}>
                    {course.courseName}
                  </h3>

                  {/* Instructor / Teacher Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.88rem', color: '#475569', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaUserTie color="#2563eb" />
                      <span><strong>Instructor:</strong> {course.instructorName || 'N/A'}</span>
                    </div>
                    {course.teacherName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaGraduationCap color="#10b981" />
                        <span><strong>Teacher:</strong> {course.teacherName} {course.qualification ? `(${course.qualification})` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Course Timeline */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '0.82rem', color: '#64748b', marginBottom: '16px' }}>
                    <div>
                      <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>Start</span>
                      {course.startingDate ? new Date(course.startingDate).toLocaleDateString() : 'N/A'}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', fontWeight: 600, color: '#334155' }}>End</span>
                      {course.endingDate ? new Date(course.endingDate).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  {/* Action Buttons: View, Edit, Students, Delete */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenView(course)}
                      style={{ flex: '1 1 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 0', backgroundColor: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <FaEye /> View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(course)}
                      style={{ flex: '1 1 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 0', backgroundColor: '#fef3c7', color: '#b45309', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenStudentAssignments(course)}
                      style={{ flex: '1 1 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 0', backgroundColor: '#ecfeff', color: '#0e7490', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <FaUsers /> Students
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCourse(courseId)}
                      style={{ flex: '1 1 40%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '7px 0', backgroundColor: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
          <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>No course records found matching your filters.</p>
        </div>
      )}

      {/* 1. Add / Edit Modal */}
      {isFormModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>
                {editingCourseId ? 'Edit Course Details' : 'Add New Course'}
              </h3>
              <button type="button" onClick={() => setIsFormModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Course Name *</label>
                <input
                  type="text"
                  name="courseName"
                  required
                  placeholder="e.g. Advanced Machine Learning"
                  value={formData.courseName}
                  onChange={handleInputChange}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Course Code *</label>
                  <input
                    type="text"
                    name="courseCode"
                    required
                    placeholder="e.g. CS-ML401"
                    value={formData.courseCode}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Instructor Name *</label>
                  <input
                    type="text"
                    name="instructorName"
                    required
                    placeholder="e.g. Prof. David Miller"
                    value={formData.instructorName}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              {/* Teacher & Qualification */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Teacher Name or ID</label>
                  <input
                    type="text"
                    list="registered-teachers"
                    placeholder="Type a teacher name or employee ID"
                    value={formData.teacherName}
                    onChange={(event) => handleTeacherNameChange(event.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <datalist id="registered-teachers">
                    {teachers.map((teacher) => (
                      <React.Fragment key={teacher._id}>
                        <option value={teacher.emp_name} label={teacher.emp_id || teacher.email} />
                        {teacher.emp_id && <option value={teacher.emp_id} label={teacher.emp_name} />}
                      </React.Fragment>
                    ))}
                  </datalist>
                  {teacherLoadError && (
                    <small role="alert" style={{ display: 'block', marginTop: '5px', color: '#b42318' }}>
                      {teacherLoadError}
                    </small>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Qualification</label>
                  <input
                    type="text"
                    name="qualification"
                    placeholder="e.g. M.Tech, Ph.D in AI"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Starting Date *</label>
                  <input
                    type="date"
                    name="startingDate"
                    required
                    value={formData.startingDate}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Ending Date *</label>
                  <input
                    type="date"
                    name="endingDate"
                    required
                    value={formData.endingDate}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Course Image URL</label>
                  <input
                    type="url"
                    name="courseImageUrl"
                    placeholder="Paste image web link (optional)"
                    value={formData.courseImageUrl}
                    onChange={handleInputChange}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                >
                  {editingCourseId ? 'Save Changes' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. View Course Details Modal */}
      {viewModalOpen && selectedCourse && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '520px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ position: 'relative', height: '180px', width: '100%' }}>
              <img
                src={selectedCourse.courseImageUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60'}
                alt={selectedCourse.courseName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                style={{ position: 'absolute', top: '12px', right: '12px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '4px' }}>
                  {selectedCourse.courseCode}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: selectedCourse.status === 'Active' ? '#15803d' : '#b91c1c' }}>
                  ● {selectedCourse.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', margin: '0 0 16px 0' }}>
                {selectedCourse.courseName}
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '0.9rem' }}>
                <div><strong>Lead Instructor:</strong> {selectedCourse.instructorName}</div>
                <div><strong>Assigned Teacher:</strong> {selectedCourse.teacherName || 'Not Assigned'}</div>
                <div><strong>Qualification:</strong> {selectedCourse.qualification || 'Not Specified'}</div>
                <div>
                  <strong>Schedule:</strong> {selectedCourse.startingDate ? new Date(selectedCourse.startingDate).toLocaleDateString() : 'N/A'} - {selectedCourse.endingDate ? new Date(selectedCourse.endingDate).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  style={{ padding: '8px 20px', borderRadius: '6px', border: 'none', backgroundColor: '#0f172a', color: '#fff', cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {studentAssignmentCourse && (
        <div
          onClick={() => !assignmentSaving && setStudentAssignmentCourse(null)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-assignment-title"
            onClick={(event) => event.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '620px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}
          >
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', padding: '18px 22px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h3 id="student-assignment-title" style={{ margin: 0, color: '#0f172a', fontSize: '1.2rem' }}>
                  Assign students
                </h3>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  {studentAssignmentCourse.courseName} · {assignmentStudentIds.length} selected
                </p>
              </div>
              <button
                type="button"
                aria-label="Close student assignments"
                disabled={assignmentSaving}
                onClick={() => setStudentAssignmentCourse(null)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <FaTimes size={18} />
              </button>
            </header>

            <div style={{ padding: '16px 22px 0' }}>
              <label htmlFor="student-assignment-search" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Search students by name, ID, or email
              </label>
              <input
                id="student-assignment-search"
                type="search"
                value={assignmentSearch}
                onChange={(event) => setAssignmentSearch(event.target.value)}
                placeholder="Enter a student name or ID"
                style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '7px' }}
              />
            </div>

            {assignmentError && (
              <p role="alert" style={{ margin: '12px 22px 0', color: '#b91c1c', backgroundColor: '#fee2e2', borderRadius: '6px', padding: '9px 12px' }}>
                {assignmentError}
              </p>
            )}

            <div style={{ padding: '12px 22px', overflowY: 'auto', minHeight: '160px' }}>
              {assignmentLoading ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>Loading students...</p>
              ) : filteredAssignmentStudents.length ? (
                filteredAssignmentStudents.map((student) => (
                    <label
                      key={student._id}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={assignmentStudentIds.includes(student._id)}
                        onChange={() => toggleStudentAssignment(student._id)}
                        disabled={assignmentSaving}
                        style={{ width: '17px', height: '17px', accentColor: '#2563eb' }}
                      />
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                        <strong style={{ color: '#1e293b', fontSize: '0.92rem' }}>{studentDisplayName(student)}</strong>
                        <small style={{ color: '#64748b', overflowWrap: 'anywhere' }}>
                          {studentIdentifier(student)}{student.email ? ` · ${student.email}` : ''}
                        </small>
                      </span>
                    </label>
                ))
              ) : (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '24px 0' }}>
                  {assignmentStudents.length ? 'No students match your search.' : 'No students are registered yet.'}
                </p>
              )}
            </div>

            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 22px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                disabled={assignmentSaving}
                onClick={() => setStudentAssignmentCourse(null)}
                style={{ padding: '9px 16px', borderRadius: '7px', border: '1px solid #cbd5e1', backgroundColor: '#fff', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={assignmentLoading || assignmentSaving || Boolean(assignmentError)}
                onClick={handleSaveStudentAssignments}
                style={{ padding: '9px 16px', borderRadius: '7px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 600, cursor: assignmentLoading || assignmentSaving || assignmentError ? 'not-allowed' : 'pointer', opacity: assignmentLoading || assignmentSaving || assignmentError ? 0.65 : 1 }}
              >
                {assignmentSaving ? 'Saving...' : 'Save assignments'}
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
};

export default Course;