import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialStudents = [
  {
    id: 1,
    name: "Aria Chen",
    email: "aria.chen@example.com",
    course: "Intro to Python",
    rollNo: "STU-1001",
    joinDate: "2024-07-18",
    status: "Active",
  },
  {
    id: 2,
    name: "Leo Novak",
    email: "leo.novak@example.com",
    course: "React basics",
    rollNo: "STU-1002",
    joinDate: "2024-07-12",
    status: "Pending",
  },
  {
    id: 3,
    name: "Sophia Patel",
    email: "sophia.p@example.com",
    course: "UI/UX Design",
    rollNo: "STU-1003",
    joinDate: "2024-06-25",
    status: "Active",
  },
  {
    id: 4,
    name: "Liam Miller",
    email: "liam.miller@example.com",
    course: "Full Stack MERN",
    rollNo: "STU-1004",
    joinDate: "2024-05-14",
    status: "Inactive",
  },
  {
    id: 5,
    name: "Emma Watson",
    email: "emma.watson@example.com",
    course: "Data Structures in Java",
    rollNo: "STU-1005",
    joinDate: "2024-08-01",
    status: "Active",
  },
];


const Student = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState(() => {
    const savedStudents = localStorage.getItem("students");
    return savedStudents ? JSON.parse(savedStudents) : initialStudents;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      const updatedStudents = students.filter(
        (student) => student.id !== id
      );

      setStudents(updatedStudents);
      localStorage.setItem("students", JSON.stringify(updatedStudents));
    }
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch =
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query) ||
      student.rollNo.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query);

    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="students-container">
      <div className="students-top-bar">
        <div className="students-title-meta">
          <h2 className="students-heading">Students Directory</h2>

          <span className="total-students-counter">
            Total: <strong>{students.length}</strong>
          </span>
        </div>

        <div className="students-actions">
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

          <div className="student-search-box">
            <input
              type="text"
              placeholder="Search by student, roll no, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="student-search-field"
            />
          </div>

          <button
            type="button"
            className="add-student-btn"
            onClick={() => navigate("/student/register")}
          >
            <span>+</span>
            <span>Add Student</span>
          </button>
        </div>
      </div>

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
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td className="student-cell">
                      <div className="student-meta">
                        <span className="student-title-name">
                          {student.name}
                        </span>
                        <span className="student-sub-email">
                          {student.email}
                        </span>
                      </div>
                    </td>

                    <td className="roll-cell">
                      {student.rollNo || "N/A"}
                    </td>

                    <td className="course-cell">{student.course}</td>
                    <td className="date-cell">{student.joinDate}</td>

                    <td className="status-cell">
                      <span
                        className={`student-status-badge ${student.status.toLowerCase()}`}
                      >
                        {student.status}
                      </span>
                    </td>

                    <td className="action-buttons-cell">
                      <button
                        type="button"
                        className="tbl-icon-btn edit-icon-btn"
                        title="Edit Student"
                        onClick={() =>
                          navigate("/student/register", {
                            state: { student },
                          })
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="tbl-icon-btn delete-icon-btn"
                        title="Delete Student"
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
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
    </div>
  );
};

export default Student;