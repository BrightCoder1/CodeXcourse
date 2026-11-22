import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import attendanceServices from "../services/attendanceServices";
import "./Attendance.css";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const STATUS_OPTIONS = ["present", "absent", "late", "leave"];
const STATUS_LABELS = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  leave: "Leave",
};

const fullName = (student) =>
  [student?.student_name, student?.middle_name, student?.last_name]
    .filter(Boolean)
    .join(" ");

const markedByName = (record) =>
  record.marked_by?.emp_name ||
  fullName(record.marked_by) ||
  "";

const attendanceSource = (record) =>
  record.record_type === "daily" ? "Daily attendance" : record.course_id?.courseName || "—";

const markedByLabel = (record) => {
  const markerType = record.marked_by_type || (record.record_type === "daily" ? "student" : "teacher");
  const markerName = record.record_type === "daily" ? "Self" : markedByName(record);
  return `${markerType.replace(/^./, (letter) => letter.toUpperCase())}${markerName ? ` · ${markerName}` : ""}`;
};

const csvCell = (value) => {
  const text = String(value ?? "").replace(/"/g, '""');
  const safeText = /^\s*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safeText}"`;
};

const downloadCsv = (filename, headers, rows) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

function StatusSelect({ value, onChange, label }) {
  return (
    <select
      className={`attendance-status-select ${value ? `status-${value}` : ""}`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
    >
      <option value="">Select status</option>
      {STATUS_OPTIONS.map((status) => (
        <option key={status} value={status}>{STATUS_LABELS[status]}</option>
      ))}
    </select>
  );
}

function SummaryCards({ summary }) {
  const cards = [
    { title: "Students present today", value: summary?.students?.present || 0, tone: "green" },
    { title: "Students absent today", value: summary?.students?.absent || 0, tone: "red" },
    { title: "Daily student self-check-ins", value: summary?.dailyStudents?.present || 0, tone: "green" },
    { title: "Teachers present today", value: summary?.employees?.present || 0, tone: "blue" },
    { title: "Teachers absent today", value: summary?.employees?.absent || 0, tone: "orange" },
  ];
  return (
    <div className="attendance-summary-grid">
      {cards.map((card) => (
        <article className={`attendance-summary-card ${card.tone}`} key={card.title}>
          <span>{card.title}</span>
          <strong>{card.value}</strong>
          <small>{summary?.date || today()}</small>
        </article>
      ))}
    </div>
  );
}

function TeacherAttendance() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today());
  const [students, setStudents] = useState([]);
  const [session, setSession] = useState(null);
  const [durationMinutes, setDurationMinutes] = useState(10);
  const [loadedRosterKey, setLoadedRosterKey] = useState("");
  const [history, setHistory] = useState([]);
  const [historyRange, setHistoryRange] = useState({ from: "", to: "" });
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    attendanceServices.getTeacherCourses()
      .then((data) => {
        setCourses(data);
        setCourseId(data[0]?._id || "");
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!courseId || !date) return;
    let active = true;
    const rosterKey = `${courseId}:${date}`;
    attendanceServices.getTeacherStudents(courseId, date)
      .then(({ students: roster, session: dailySession }) => {
        if (active) {
          setStudents(roster);
          setSession(dailySession);
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoadedRosterKey(rosterKey);
      });
    return () => { active = false; };
  }, [courseId, date]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  const loadingRoster = Boolean(courseId && date && loadedRosterKey !== `${courseId}:${date}`);

  const updateStudentStatus = (studentId, status) => {
    setStudents((current) => current.map((student) =>
      student._id === studentId ? { ...student, attendance_status: status } : student
    ));
  };

  const counts = useMemo(() => students.reduce((total, student) => {
    const status = student.attendance_status;
    if (status) total[status] += 1;
    return total;
  }, { present: 0, absent: 0, late: 0, leave: 0 }), [students]);
  const allMarked = students.length > 0 && students.every((student) =>
    STATUS_OPTIONS.includes(student.attendance_status)
  );

  const saveAttendance = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await attendanceServices.saveTeacherAttendance(courseId, {
        date,
        entries: students.map((student) => ({
          studentId: student._id,
          status: student.attendance_status,
        })),
      });
      setNotice("Attendance saved. You can reopen this date to review or edit it.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const refreshRoster = async () => {
    const result = await attendanceServices.getTeacherStudents(courseId, date);
    setStudents(result.students);
    setSession(result.session);
  };

  const startSession = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await attendanceServices.startSession(courseId, durationMinutes);
      setSession(result.data);
      await refreshRoster();
      setNotice(`Attendance window opened for ${durationMinutes} minutes.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const closeSession = async () => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await attendanceServices.closeSession(session._id);
      await refreshRoster();
      setNotice("Attendance window closed.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const markAbsentees = async () => {
    if (!window.confirm("Mark every student who has not checked in as absent?")) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await attendanceServices.markSessionAbsentees(session._id);
      await refreshRoster();
      setNotice(`${result.count} students marked absent.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const loadHistory = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setHistory(await attendanceServices.getTeacherHistory({
        courseId,
        ...historyRange,
      }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const selectedCourse = courses.find((course) => course._id === courseId);
  const isToday = date === today();
  const canMarkAbsentees = Boolean(session && (!session.is_open || now > new Date(session.end_time)));

  return (
    <div className="attendance-page">
      <header className="attendance-page-header">
        <div>
          <p className="attendance-eyebrow">TEACHER WORKSPACE</p>
          <h1>Class attendance</h1>
          <p>Mark attendance for your assigned classes and review past sessions.</p>
        </div>
      </header>

      <section className="attendance-panel attendance-controls">
        <label>
          Class / course
          <select value={courseId} onChange={(event) => {
            setCourseId(event.target.value);
            setStudents([]);
            setSession(null);
            setHistory([]);
          }}>
            <option value="">Choose an assigned course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.courseName} · {course.courseCode}
              </option>
            ))}
          </select>
        </label>
        <label>
          Attendance date
          <input type="date" max={today()} value={date} onChange={(event) => {
            setDate(event.target.value);
            if (!event.target.value) {
              setStudents([]);
              setSession(null);
            }
          }} />
        </label>
        {selectedCourse && (
          <div className="selected-course-note">
            <strong>{selectedCourse.courseCode}</strong>
            <span>{selectedCourse.courseName}</span>
          </div>
        )}
      </section>

      {error && <div className="attendance-alert error" role="alert">{error}</div>}
      {notice && <div className="attendance-alert success" role="status">{notice}</div>}

      <section className="attendance-panel attendance-session-panel">
        <div>
          <h2>Self-attendance window</h2>
          <p>
            {session
              ? `Session: ${new Date(session.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${new Date(session.end_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
              : "Open a timed window so enrolled students can mark themselves present."}
          </p>
        </div>
        <div className="attendance-session-actions">
          {(!session || !session.is_open) && (
            <>
              <label className="session-duration-label">
                Window (minutes)
                <input type="number" min="1" max="240" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} />
              </label>
              <button type="button" className="attendance-primary-button" disabled={!courseId || !isToday || busy} onClick={startSession}>
                {session ? "Start attendance again" : "Start attendance"}
              </button>
            </>
          )}
          {session?.is_open && (
            <button type="button" className="attendance-secondary-button" disabled={busy} onClick={closeSession}>Close attendance</button>
          )}
          {session && (
            <button type="button" className="attendance-secondary-button" disabled={!canMarkAbsentees || busy} onClick={markAbsentees}>
              Mark unmarked absent
            </button>
          )}
        </div>
        {!isToday && <span className="attendance-session-hint">Sessions can only be opened for today.</span>}
      </section>

      <section className="attendance-panel">
        <div className="attendance-section-heading">
          <div>
            <h2>Today&apos;s class list</h2>
            <p>{students.length} enrolled students · {date || "Select a date"}</p>
          </div>
          <div className="attendance-counts">
            {STATUS_OPTIONS.map((status) => (
              <span className={`attendance-count ${status}`} key={status}>
                {counts[status]} {STATUS_LABELS[status]}
              </span>
            ))}
          </div>
        </div>

        {loadingRoster ? (
          <p className="attendance-empty">Loading class roster…</p>
        ) : !courseId ? (
          <p className="attendance-empty">
            {courses.length ? "Select one of your assigned courses to get started." : "No courses have been assigned to your account yet."}
          </p>
        ) : students.length === 0 ? (
          <p className="attendance-empty">No students are enrolled in this course.</p>
        ) : (
          <>
            <div className="attendance-student-list">
              {students.map((student, index) => (
                <article className="attendance-student-row" key={student._id}>
                  <span className="student-order">{String(index + 1).padStart(2, "0")}</span>
                  <div className="attendance-student-avatar">{fullName(student).slice(0, 1).toUpperCase()}</div>
                  <div className="attendance-student-info">
                    <strong>{fullName(student)}</strong>
                    <span>{student.roll_number || student.application_number || student.email}</span>
                  </div>
                  <StatusSelect
                    value={student.attendance_status}
                    label={`Attendance status for ${fullName(student)}`}
                    onChange={(status) => updateStudentStatus(student._id, status)}
                  />
                </article>
              ))}
            </div>
            <div className="attendance-actions">
              <span>{allMarked ? "All students have a status." : "Select a status for every student before saving."}</span>
              <button type="button" className="attendance-primary-button" disabled={!allMarked || busy} onClick={saveAttendance}>
                {busy ? "Saving…" : "Save attendance"}
              </button>
            </div>
          </>
        )}
      </section>

      <section className="attendance-panel">
        <div className="attendance-section-heading">
          <div>
            <h2>Attendance history</h2>
            <p>View records only for courses assigned to your account.</p>
          </div>
        </div>
        <form className="attendance-filter-row" onSubmit={loadHistory}>
          <label>From<input type="date" max={today()} value={historyRange.from} onChange={(event) => setHistoryRange({ ...historyRange, from: event.target.value })} /></label>
          <label>To<input type="date" max={today()} value={historyRange.to} onChange={(event) => setHistoryRange({ ...historyRange, to: event.target.value })} /></label>
          <button type="submit" className="attendance-secondary-button" disabled={!courseId}>Apply date range</button>
        </form>
        <div className="attendance-table-wrap">
          <table className="attendance-table">
            <thead><tr><th>Date</th><th>Student</th><th>Roll number</th><th>Status</th><th>Marked by</th><th>Marked at</th></tr></thead>
            <tbody>
              {history.length ? history.map((record) => (
                <tr key={record._id}>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{fullName(record.student_id) || "Student"}</td>
                  <td>{record.student_id?.roll_number || "—"}</td>
                  <td><span className={`attendance-status-badge ${record.status}`}>{STATUS_LABELS[record.status]}</span></td>
                  <td>{(record.marked_by_type || "teacher").replace(/^./, (letter) => letter.toUpperCase())}{markedByName(record) ? ` · ${markedByName(record)}` : ""}</td>
                  <td>{new Date(record.marked_at || record.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td>
                </tr>
              )) : <tr><td className="attendance-empty-cell" colSpan="6">Set a date range and apply to view attendance history.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function AdminAttendance() {
  const [tab, setTab] = useState("students");
  const [summary, setSummary] = useState(null);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [studentsRecords, setStudentsRecords] = useState([]);
  const [employeeRecords, setEmployeeRecords] = useState([]);
  const [studentFilters, setStudentFilters] = useState({ courseId: "", from: "", to: "", name: "", status: "" });
  const [employeeFilters, setEmployeeFilters] = useState({ from: "", to: "", name: "", status: "" });
  const [markDate, setMarkDate] = useState(today());
  const [dailyEmployees, setDailyEmployees] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAdminData = async () => {
    try {
      const [summaryData, assignmentData, studentRecords] = await Promise.all([
        attendanceServices.getSummary(),
        attendanceServices.getAdminAssignments(),
        attendanceServices.getStudentAttendance(studentFilters),
      ]);
      setSummary(summaryData);
      setCourses(assignmentData.courses);
      setTeachers(assignmentData.teachers);
      setAssignments(assignmentData.assignments);
      setStudentsRecords(studentRecords);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      attendanceServices.getSummary(),
      attendanceServices.getAdminAssignments(),
      attendanceServices.getStudentAttendance({}),
    ])
      .then(([summaryData, assignmentData, studentRecords]) => {
        if (!active) return;
        setSummary(summaryData);
        setCourses(assignmentData.courses);
        setTeachers(assignmentData.teachers);
        setAssignments(assignmentData.assignments);
        setStudentsRecords(studentRecords);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!markDate || !teachers.length) return;
    let active = true;
    attendanceServices.getEmployeeAttendance({ from: markDate, to: markDate })
      .then((records) => {
        if (!active) return;
        const next = {};
        records.forEach((record) => {
          if (record.employee_id?._id) {
            next[record.employee_id._id] = {
              status: record.status,
              check_in: record.check_in || "",
              check_out: record.check_out || "",
            };
          }
        });
        setDailyEmployees(next);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => { active = false; };
  }, [markDate, teachers]);

  const loadStudents = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setStudentsRecords(await attendanceServices.getStudentAttendance(studentFilters));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const loadEmployees = async (event) => {
    event.preventDefault();
    setError("");
    try {
      setEmployeeRecords(await attendanceServices.getEmployeeAttendance(employeeFilters));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const loadTeacherAssignments = (teacherId) => {
    setSelectedTeacher(teacherId);
    setSelectedCourseIds(assignments
      .filter((assignment) => assignment.teacherId === teacherId)
      .map((assignment) => assignment.courseId));
  };

  const saveTeacherAssignments = async () => {
    setError("");
    setNotice("");
    try {
      await attendanceServices.saveAssignments({
        teacherId: selectedTeacher,
        courseIds: selectedCourseIds,
      });
      setNotice("Course assignments updated.");
      await loadAdminData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateDailyEmployee = (employeeId, field, value) => {
    setDailyEmployees((current) => ({
      ...current,
      [employeeId]: { ...current[employeeId], [field]: value },
    }));
  };

  const saveDailyEmployee = async (employeeId) => {
    const attendance = dailyEmployees[employeeId];
    if (!attendance?.status) return;
    setSavingId(employeeId);
    setError("");
    setNotice("");
    try {
      await attendanceServices.saveEmployeeAttendance(employeeId, {
        date: markDate,
        ...attendance,
      });
      setNotice("Employee attendance saved.");
      const [summaryData, records] = await Promise.all([
        attendanceServices.getSummary(),
        attendanceServices.getEmployeeAttendance({ from: markDate, to: markDate }),
      ]);
      setSummary(summaryData);
      setEmployeeRecords(records);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId("");
    }
  };

  const exportStudents = () => downloadCsv(
    "student-attendance.csv",
    ["Date", "Student", "Roll number", "Attendance type / Course", "Status", "Marked by type", "Marked by", "Marked at"],
    studentsRecords.map((record) => [
      record.date?.slice(0, 10),
      fullName(record.student_id),
      record.student_id?.roll_number,
      attendanceSource(record),
      STATUS_LABELS[record.status],
      record.marked_by_type || (record.record_type === "daily" ? "student" : "teacher"),
      record.record_type === "daily" ? "Self" : markedByName(record),
      (record.marked_at || record.created_at)?.slice(0, 16),
    ]),
  );

  const exportEmployees = () => downloadCsv(
    "employee-attendance.csv",
    ["Date", "Employee", "Employee ID", "Status", "Check-in", "Check-out"],
    employeeRecords.map((record) => [
      record.date?.slice(0, 10),
      record.employee_id?.emp_name,
      record.employee_id?.emp_id,
      STATUS_LABELS[record.status],
      record.check_in,
      record.check_out,
    ]),
  );

  if (loading) {
    return <div className="attendance-page"><p className="attendance-empty">Loading attendance workspace…</p></div>;
  }

  return (
    <div className="attendance-page">
      <header className="attendance-page-header">
        <div>
          <p className="attendance-eyebrow">CODEXCOURSE · PEOPLE OPERATIONS</p>
          <h1>Attendance management</h1>
          <p>Track class participation, staff check-ins, and attendance trends.</p>
        </div>
        <button type="button" className="attendance-secondary-button" onClick={loadAdminData}>Refresh dashboard</button>
      </header>

      <SummaryCards summary={summary} />
      {error && <div className="attendance-alert error" role="alert">{error}</div>}
      {notice && <div className="attendance-alert success" role="status">{notice}</div>}

      <nav className="attendance-tabs" aria-label="Attendance sections">
        {[
          ["students", "Student records"],
          ["employees", "Employee attendance"],
          ["assignments", "Course assignments"],
          ["insights", "Attendance insights"],
        ].map(([value, label]) => (
          <button type="button" key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>
        ))}
      </nav>

      {tab === "students" && (
        <section className="attendance-panel">
          <div className="attendance-section-heading">
            <div><h2>Student attendance</h2><p>Course attendance and student daily self-check-ins appear here.</p></div>
            <button type="button" className="attendance-secondary-button" disabled={!studentsRecords.length} onClick={exportStudents}>Export CSV</button>
          </div>
          <form className="attendance-filter-row admin-filter-row" onSubmit={loadStudents}>
            <label>Course<select value={studentFilters.courseId} onChange={(event) => setStudentFilters({ ...studentFilters, courseId: event.target.value })}><option value="">All courses</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.courseName}</option>)}</select></label>
            <label>From<input type="date" max={today()} value={studentFilters.from} onChange={(event) => setStudentFilters({ ...studentFilters, from: event.target.value })} /></label>
            <label>To<input type="date" max={today()} value={studentFilters.to} onChange={(event) => setStudentFilters({ ...studentFilters, to: event.target.value })} /></label>
            <label>Student name<input value={studentFilters.name} onChange={(event) => setStudentFilters({ ...studentFilters, name: event.target.value })} placeholder="Search students" /></label>
            <label>Status<select value={studentFilters.status} onChange={(event) => setStudentFilters({ ...studentFilters, status: event.target.value })}><option value="">All statuses</option>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
            <button type="submit" className="attendance-primary-button">Apply filters</button>
          </form>
          <div className="attendance-table-wrap">
            <table className="attendance-table"><thead><tr><th>Date</th><th>Student</th><th>Roll number</th><th>Attendance type / Course</th><th>Status</th><th>Marked by</th><th>Marked at</th></tr></thead>
              <tbody>{studentsRecords.length ? studentsRecords.map((record) => <tr key={`${record.record_type || "course"}-${record._id}`}><td>{new Date(record.date).toLocaleDateString()}</td><td>{fullName(record.student_id) || "Student"}</td><td>{record.student_id?.roll_number || "—"}</td><td>{attendanceSource(record)}</td><td><span className={`attendance-status-badge ${record.status}`}>{STATUS_LABELS[record.status]}</span></td><td>{markedByLabel(record)}</td><td>{new Date(record.marked_at || record.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</td></tr>) : <tr><td colSpan="7" className="attendance-empty-cell">No attendance records match these filters.</td></tr>}</tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "employees" && (
        <>
          <section className="attendance-panel">
            <div className="attendance-section-heading"><div><h2>Mark employee attendance</h2><p>Set a status and optional times for any employee or teacher.</p></div><label className="date-only-label">Date<input type="date" max={today()} value={markDate} onChange={(event) => setMarkDate(event.target.value)} /></label></div>
            <div className="attendance-table-wrap">
              <table className="attendance-table employee-mark-table"><thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Check-in</th><th>Check-out</th><th /></tr></thead>
                <tbody>{teachers.length ? teachers.map((teacher) => {
                  const attendance = dailyEmployees[teacher._id] || {};
                  return <tr key={teacher._id}>
                    <td><strong>{teacher.emp_name}</strong><small>{teacher.emp_id || teacher.email}</small></td>
                    <td>{teacher.emp_department || "—"}</td>
                    <td><StatusSelect value={attendance.status || ""} label={`Attendance status for ${teacher.emp_name}`} onChange={(value) => updateDailyEmployee(teacher._id, "status", value)} /></td>
                    <td><input className="time-input" type="time" value={attendance.check_in || ""} onChange={(event) => updateDailyEmployee(teacher._id, "check_in", event.target.value)} /></td>
                    <td><input className="time-input" type="time" value={attendance.check_out || ""} onChange={(event) => updateDailyEmployee(teacher._id, "check_out", event.target.value)} /></td>
                    <td><button type="button" className="attendance-secondary-button compact" disabled={!attendance.status || savingId === teacher._id} onClick={() => saveDailyEmployee(teacher._id)}>{savingId === teacher._id ? "Saving…" : "Save"}</button></td>
                  </tr>;
                }) : <tr><td colSpan="6" className="attendance-empty-cell">No employee records are available.</td></tr>}</tbody>
              </table>
            </div>
          </section>
          <section className="attendance-panel">
            <div className="attendance-section-heading"><div><h2>Employee attendance history</h2><p>Filter and export saved staff attendance records.</p></div><button type="button" className="attendance-secondary-button" disabled={!employeeRecords.length} onClick={exportEmployees}>Export CSV</button></div>
            <form className="attendance-filter-row admin-filter-row" onSubmit={loadEmployees}>
              <label>From<input type="date" max={today()} value={employeeFilters.from} onChange={(event) => setEmployeeFilters({ ...employeeFilters, from: event.target.value })} /></label>
              <label>To<input type="date" max={today()} value={employeeFilters.to} onChange={(event) => setEmployeeFilters({ ...employeeFilters, to: event.target.value })} /></label>
              <label>Employee name<input value={employeeFilters.name} onChange={(event) => setEmployeeFilters({ ...employeeFilters, name: event.target.value })} placeholder="Search employees" /></label>
              <label>Status<select value={employeeFilters.status} onChange={(event) => setEmployeeFilters({ ...employeeFilters, status: event.target.value })}><option value="">All statuses</option>{STATUS_OPTIONS.map((status) => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
              <button type="submit" className="attendance-primary-button">Apply filters</button>
            </form>
            <div className="attendance-table-wrap">
              <table className="attendance-table"><thead><tr><th>Date</th><th>Employee</th><th>Employee ID</th><th>Status</th><th>Check-in</th><th>Check-out</th></tr></thead>
                <tbody>{employeeRecords.length ? employeeRecords.map((record) => <tr key={record._id}><td>{new Date(record.date).toLocaleDateString()}</td><td>{record.employee_id?.emp_name || "—"}</td><td>{record.employee_id?.emp_id || "—"}</td><td><span className={`attendance-status-badge ${record.status}`}>{STATUS_LABELS[record.status]}</span></td><td>{record.check_in || "—"}</td><td>{record.check_out || "—"}</td></tr>) : <tr><td colSpan="6" className="attendance-empty-cell">Apply filters to view employee attendance records.</td></tr>}</tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {tab === "assignments" && (
        <section className="attendance-panel">
          <div className="attendance-section-heading"><div><h2>Assign courses to teachers</h2><p>Only assigned courses will be available in the teacher attendance workspace.</p></div></div>
          <div className="assignment-editor">
            <label>Teacher<select value={selectedTeacher} onChange={(event) => loadTeacherAssignments(event.target.value)}><option value="">Select a teacher</option>{teachers.map((teacher) => <option value={teacher._id} key={teacher._id}>{teacher.emp_name} · {teacher.emp_id}</option>)}</select></label>
            {selectedTeacher && (
              <>
                <div className="assignment-course-grid">{courses.map((course) => <label className="assignment-course-option" key={course._id}>
                  <input type="checkbox" checked={selectedCourseIds.includes(course._id)} onChange={(event) => setSelectedCourseIds((ids) => event.target.checked ? [...ids, course._id] : ids.filter((id) => id !== course._id))} />
                  <span><strong>{course.courseName}</strong><small>{course.courseCode} · {course.status}</small></span>
                </label>)}</div>
                <button type="button" className="attendance-primary-button" onClick={saveTeacherAssignments}>Save course assignments</button>
              </>
            )}
          </div>
        </section>
      )}

      {tab === "insights" && (
        <div className="attendance-insights-grid">
          <section className="attendance-panel">
            <div className="attendance-section-heading"><div><h2>Student attendance rate</h2><p>Present and late count as attended days; leave is excluded from the denominator.</p></div></div>
            <div className="attendance-rate-list">{summary?.studentPercentages?.length ? summary.studentPercentages.map((person) => <div className="attendance-rate-row" key={person.studentId}><span><strong>{person.name}</strong><small>{person.course || "Course not specified"}</small></span><strong>{person.percentage}%</strong></div>) : <p className="attendance-empty">No student attendance has been recorded.</p>}</div>
          </section>
          <section className="attendance-panel">
            <div className="attendance-section-heading"><div><h2>Teacher attendance rate</h2><p>Attendance rates are calculated from recorded workdays.</p></div></div>
            <div className="attendance-rate-list">{summary?.teacherPercentages?.length ? summary.teacherPercentages.map((person) => <div className="attendance-rate-row" key={person.employeeId}><span><strong>{person.name}</strong><small>Employee attendance</small></span><strong>{person.percentage}%</strong></div>) : <p className="attendance-empty">No teacher attendance has been recorded.</p>}</div>
          </section>
        </div>
      )}
    </div>
  );
}

export default function Attendance() {
  const { user } = useAuth();
  return user?.emp_role === "employee" ? <TeacherAttendance /> : <AdminAttendance />;
}

export { TeacherAttendance };
