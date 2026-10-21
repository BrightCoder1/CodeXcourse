import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserPlus,
  FaSearch,
  FaEye,
  FaEdit,
  FaTrash,
  FaTimes,
  FaUserGraduate
} from "react-icons/fa";

const API_BASE_URL = "http://localhost:4000/api/student";

const Student = () => {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Profile modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper function to get auth headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("admin_token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  // 1. Fetch All Students
  const fetchStudents = async () => {
    try {
      const response = await axios.get(API_BASE_URL, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      // Backend returns { success: true, count: X, data: [...] }
      if (response.data && Array.isArray(response.data.data)) {
        setStudents(response.data.data);
      } else if (Array.isArray(response.data)) {
        setStudents(response.data);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401 ? "Unauthorized: Please login as Admin again." : "Failed to fetch students from server.");
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Delete Student Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student record?")) return;

    try {
      const response = await axios.delete(`${API_BASE_URL}/${id}`, {
        headers: getAuthHeaders(),
        withCredentials: true,
      });

      if (response.data?.success) {
        setStudents((prev) => prev.filter((s) => (s._id || s.id) !== id));
        alert("Student deleted successfully!");
      } else {
        alert(response.data?.message || "Failed to delete student.");
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert(err.response?.data?.message || "Failed to delete student.");
    }
  };

  // 3. Open Profile details modal
  const handleOpenProfile = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Close Profile details modal
  const handleCloseModal = () => {
    setSelectedStudent(null);
    setIsModalOpen(false);
  };

  // Search & Filter Logic
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase().trim();

    const fullName = `${student.student_name || ""} ${student.last_name || ""}`.toLowerCase();
    const email = (student.email || "").toLowerCase();
    const rollNo = (student.roll_number || student.application_number || "").toLowerCase();
    const course = (student.course || "").toLowerCase();
    const status = student.admission_status || "Pending";

    const matchesSearch =
      fullName.includes(query) ||
      email.includes(query) ||
      rollNo.includes(query) ||
      course.includes(query);

    const matchesStatus =
      statusFilter === "All" || status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="students-container">
      {/* Top Controls Bar */}
      <div className="students-top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div className="students-title-meta">
          <h2 style={{ margin: 0 }}>Students Directory</h2>
          <span style={{ color: "#6b7280" }}>
            Total: <strong>{students.length}</strong>
          </span>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #d1d5db" }}
          >
            <option value="All">All Status</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* Search Box */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search by name, roll, course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: "8px 12px 8px 30px", borderRadius: "6px", border: "1px solid #d1d5db" }}
            />
            <FaSearch style={{ position: "absolute", left: "10px", top: "11px", color: "#9ca3af" }} />
          </div>

          {/* Add Student Button */}
          <button
            type="button"
            onClick={() => navigate("/student/register")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#2563eb",
              color: "#fff",
              padding: "8px 14px",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <FaUserPlus /> <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div
          style={{
            color: "#dc2626",
            backgroundColor: "#fee2e2",
            padding: "12px 16px",
            borderRadius: "8px",
            marginBottom: "16px",
            border: "1px solid #f87171",
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Table */}
      <div style={{ backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
              <th style={{ padding: "12px 16px" }}>Student Name</th>
              <th style={{ padding: "12px 16px" }}>Roll / App No</th>
              <th style={{ padding: "12px 16px" }}>Course</th>
              <th style={{ padding: "12px 16px" }}>Semester</th>
              <th style={{ padding: "12px 16px" }}>Admission Date</th>
              <th style={{ padding: "12px 16px" }}>Status</th>
              <th style={{ padding: "12px 16px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "30px", color: "#6b7280" }}>
                  Loading student records...
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const studentId = student._id || student.id;
                const fullName = `${student.student_name || ""} ${student.last_name || ""}`.trim() || "N/A";
                const displayRoll = student.roll_number || student.application_number || "N/A";
                const admissionDate = student.admission_date || student.createdAt;
                const displayDate = admissionDate ? new Date(admissionDate).toLocaleDateString() : "N/A";
                const status = student.admission_status || "Pending";

                return (
                  <tr key={studentId} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{fullName}</div>
                      <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{student.email}</div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>{displayRoll}</td>
                    <td style={{ padding: "12px 16px" }}>{student.course || "N/A"}</td>
                    <td style={{ padding: "12px 16px" }}>{student.semester ? `Sem ${student.semester}` : "N/A"}</td>
                    <td style={{ padding: "12px 16px" }}>{displayDate}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          backgroundColor:
                            status.toLowerCase() === "approved" ? "#dcfce7" : status.toLowerCase() === "rejected" ? "#fee2e2" : "#fef3c7",
                          color:
                            status.toLowerCase() === "approved" ? "#166534" : status.toLowerCase() === "rejected" ? "#991b1b" : "#92400e",
                        }}
                      >
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        {/* Profile Button */}
                        <button
                          type="button"
                          title="View Profile"
                          onClick={() => handleOpenProfile(student)}
                          style={{
                            backgroundColor: "#3b82f6",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <FaEye /> Profile
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          title="Edit Student"
                          onClick={() => navigate("/student/register", { state: { student } })}
                          style={{
                            backgroundColor: "#f59e0b",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <FaEdit /> Edit
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          title="Delete Student"
                          onClick={() => handleDelete(studentId)}
                          style={{
                            backgroundColor: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "6px 10px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                  No student records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Student Profile Modal */}
      {isModalOpen && selectedStudent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              width: "100%",
              maxWidth: "650px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaUserGraduate size={20} color="#2563eb" />
                <h3 style={{ margin: 0, fontSize: "1.2rem", color: "#111827" }}>Student Profile</h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#6b7280" }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Personal Info */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#2563eb", borderBottom: "1px solid #f3f4f6", paddingBottom: "6px" }}>
                  Personal Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                  <div><strong>Full Name:</strong> {[selectedStudent.student_name, selectedStudent.middle_name, selectedStudent.last_name].filter(Boolean).join(" ") || "N/A"}</div>
                  <div><strong>Gender:</strong> {selectedStudent.gender || "N/A"}</div>
                  <div><strong>DOB:</strong> {selectedStudent.date_of_birth ? new Date(selectedStudent.date_of_birth).toLocaleDateString() : "N/A"}</div>
                  <div><strong>Aadhar:</strong> {selectedStudent.aadhar_card_number || "N/A"}</div>
                  <div><strong>Blood Group:</strong> {selectedStudent.blood_group || "N/A"}</div>
                  <div><strong>Category:</strong> {selectedStudent.category || "N/A"}</div>
                  <div><strong>Nationality:</strong> {selectedStudent.nationality || "N/A"}</div>
                  <div><strong>Father's Name:</strong> {selectedStudent.father_name || "N/A"}</div>
                  <div><strong>Mother's Name:</strong> {selectedStudent.mother_name || "N/A"}</div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#2563eb", borderBottom: "1px solid #f3f4f6", paddingBottom: "6px" }}>
                  Contact Information
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                  <div><strong>Email:</strong> {selectedStudent.email}</div>
                  <div><strong>Phone:</strong> {selectedStudent.phone_number}</div>
                  <div><strong>Parent Phone:</strong> {selectedStudent.parent_phone || "N/A"}</div>
                  <div><strong>Parent Email:</strong> {selectedStudent.parent_email || "N/A"}</div>
                  <div style={{ gridColumn: "span 2" }}>
                    <strong>Address:</strong> {[selectedStudent.address, selectedStudent.city, selectedStudent.state, selectedStudent.pin_code].filter(Boolean).join(", ")}
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#2563eb", borderBottom: "1px solid #f3f4f6", paddingBottom: "6px" }}>
                  Academic & Admission Details
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                  <div><strong>Application No:</strong> {selectedStudent.application_number}</div>
                  <div><strong>Roll Number:</strong> {selectedStudent.roll_number || "Not assigned"}</div>
                  <div><strong>Course:</strong> {selectedStudent.course}</div>
                  <div><strong>Department:</strong> {selectedStudent.department}</div>
                  <div><strong>Qualification:</strong> {selectedStudent.qualification || "N/A"}</div>
                  <div><strong>Semester:</strong> {selectedStudent.semester}</div>
                  <div><strong>Academic Session:</strong> {selectedStudent.academic_session}</div>
                  <div><strong>Admission Status:</strong> {selectedStudent.admission_status || "Pending"}</div>
                  <div><strong>Admission Date:</strong> {selectedStudent.admission_date ? new Date(selectedStudent.admission_date).toLocaleDateString() : "N/A"}</div>
                  <div><strong>Admission Type:</strong> {selectedStudent.admission_type || "N/A"}</div>
                  <div><strong>Specialization:</strong> {selectedStudent.specialization || "N/A"}</div>
                </div>
              </div>

              {/* Previous Education */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#2563eb", borderBottom: "1px solid #f3f4f6", paddingBottom: "6px" }}>
                  Previous Education
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                  <div><strong>10th:</strong> {[selectedStudent.tenth_board, selectedStudent.tenth_passing_year, selectedStudent.tenth_percentage && `${selectedStudent.tenth_percentage}%`].filter(Boolean).join(" · ") || "N/A"}</div>
                  <div><strong>12th:</strong> {[selectedStudent.twelfth_board, selectedStudent.twelfth_passing_year, selectedStudent.twelfth_percentage && `${selectedStudent.twelfth_percentage}%`].filter(Boolean).join(" · ") || "N/A"}</div>
                  <div><strong>Previous College:</strong> {selectedStudent.previous_college || "N/A"}</div>
                  <div><strong>Previous Course:</strong> {selectedStudent.previous_course || "N/A"}</div>
                  <div><strong>Graduation:</strong> {selectedStudent.graduation_percentage ? `${selectedStudent.graduation_percentage}%` : "N/A"}</div>
                  <div><strong>Entrance Exam:</strong> {[selectedStudent.entrance_exam_name, selectedStudent.entrance_exam_score].filter(Boolean).join(" · ") || "N/A"}</div>
                </div>
              </div>

              {/* Fee Information */}
              <div>
                <h4 style={{ margin: "0 0 10px 0", color: "#2563eb", borderBottom: "1px solid #f3f4f6", paddingBottom: "6px" }}>
                  Fee Summary
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                  <div><strong>Total Fee:</strong> ₹{selectedStudent.total_fee || 0}</div>
                  <div><strong>Paid Amount:</strong> ₹{selectedStudent.paid_amount || 0}</div>
                  <div><strong>Pending Amount:</strong> ₹{selectedStudent.pending_amount || 0}</div>
                  <div><strong>Payment Status:</strong> {selectedStudent.payment_status || "Pending"}</div>
                  <div><strong>Payment Method:</strong> {selectedStudent.payment_method || "N/A"}</div>
                  <div><strong>Transaction ID:</strong> {selectedStudent.transaction_id || "N/A"}</div>
                </div>
              </div>

              {selectedStudent.remarks && (
                <div>
                  <h4 style={{ margin: "0 0 10px 0", color: "#2563eb", borderBottom: "1px solid #f3f4f6", paddingBottom: "6px" }}>
                    Remarks
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>{selectedStudent.remarks}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={handleCloseModal}
                style={{ padding: "8px 16px", border: "1px solid #d1d5db", backgroundColor: "#fff", borderRadius: "6px", cursor: "pointer" }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleCloseModal();
                  navigate("/student/register", { state: { student: selectedStudent } });
                }}
                style={{ padding: "8px 16px", border: "none", backgroundColor: "#2563eb", color: "#fff", borderRadius: "6px", cursor: "pointer" }}
              >
                Edit Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Student;