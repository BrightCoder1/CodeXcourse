import React, { useEffect, useMemo, useState } from "react";
import authService from "../services/authServices";

const formatDate = (value) => {
  if (!value) return "Not provided";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not provided" : date.toLocaleDateString();
};

const formatLabel = (key) =>
  key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase());

const formatValue = (key, value) => {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (key === "date_of_birth" || key === "admission_date" || key === "last_payment_date" || key === "createdAt" || key === "updatedAt") {
    return formatDate(value);
  }
  return String(value);
};

const RecentStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    let active = true;

    authService.getRecentStudents()
      .then((recentStudents) => {
        if (active) setStudents(recentStudents);
      })
      .catch((fetchError) => {
        if (active) {
          setError(
            fetchError.response?.data?.message ||
              fetchError.message ||
              "Failed to load recent student registrations."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return students;

    return students.filter((student) =>
      [
        student.student_name,
        student.middle_name,
        student.last_name,
        student.email,
        student.course,
        student.roll_number,
        student.application_number,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [searchQuery, students]);

  const studentName = (student) =>
    [student.student_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(" ");

  const studentId = (student) =>
    student.roll_number || student.application_number || "Not provided";

  const profileDetails = selectedStudent
    ? Object.entries(selectedStudent).filter(
        ([key]) => !["_id", "__v"].includes(key)
      )
    : [];

  return (
    <div className="recent-students-card">
      <div className="recent-header">
        <div>
          <h3 className="recent-title">Recent Student Registrations</h3>
          <p className="recent-subtitle">The 10 most recently registered students</p>
        </div>
        <div className="header-actions">
          <form
            className="recent-search-form"
            role="search"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="text"
              placeholder="Search recent students..."
              aria-label="Search recent students"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="search-input"
            />
            <button type="submit" className="recent-search-button">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="table-responsive">
        <table className="students-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Student ID</th>
              <th>Course</th>
              <th>Registered</th>
              <th>Status</th>
              <th>Profile</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="no-data-cell">Loading recent registrations...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="no-data-cell" role="alert">{error}</td></tr>
            ) : filteredStudents.length ? (
              filteredStudents.map((student) => (
                <tr key={student._id}>
                  <td className="student-info-cell">
                    <span className="student-avatar recent-student-initial" aria-hidden="true">
                      {studentName(student).charAt(0).toUpperCase()}
                    </span>
                    <span className="student-name">{studentName(student)}</span>
                  </td>
                  <td>{studentId(student)}</td>
                  <td className="course-cell">{student.course || "Not provided"}</td>
                  <td className="date-cell">{formatDate(student.createdAt)}</td>
                  <td className="status-cell">
                    <span className={`status-badge ${(student.admission_status || "Pending").toLowerCase()}`}>
                      {student.admission_status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="recent-profile-button"
                      onClick={() => setSelectedStudent(student)}
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-data-cell">
                  {searchQuery
                    ? "No recent students match your search."
                    : "No students have been registered yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedStudent && (
        <div
          className="recent-profile-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSelectedStudent(null);
          }}
        >
          <section
            className="recent-profile-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recent-profile-title"
          >
            <header className="recent-profile-dialog-header">
              <div>
                <h3 id="recent-profile-title">Student Profile</h3>
                <p>{studentName(selectedStudent)}</p>
              </div>
              <button
                type="button"
                className="recent-profile-close"
                aria-label="Close student profile"
                onClick={() => setSelectedStudent(null)}
              >
                ×
              </button>
            </header>
            <dl className="recent-profile-details">
              {profileDetails.map(([key, value]) => (
                <div className="recent-profile-detail" key={key}>
                  <dt>{formatLabel(key)}</dt>
                  <dd>{formatValue(key, value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      )}
    </div>
  );
};

export default RecentStudent;
