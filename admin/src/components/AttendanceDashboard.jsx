import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import attendanceServices from "../services/attendanceServices";
import "../pages/Attendance.css";

export default function AttendanceDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    attendanceServices.getSummary()
      .then((data) => {
        if (active) setSummary(data);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      });
    return () => { active = false; };
  }, []);

  return (
    <section className="dashboard-attendance">
      <div className="dashboard-attendance-heading">
        <div>
          <h2>Attendance today</h2>
          <p>{summary?.date || "Loading daily overview"}</p>
        </div>
        <Link to="/attendance">Manage attendance</Link>
      </div>
      {error ? <p role="alert">{error}</p> : (
        <div className="dashboard-attendance-stats">
          <div><span>Students present</span><strong>{summary?.students?.present ?? "—"}</strong></div>
          <div><span>Students absent</span><strong>{summary?.students?.absent ?? "—"}</strong></div>
          <div><span>Teachers present</span><strong>{summary?.employees?.present ?? "—"}</strong></div>
          <div><span>Teachers absent</span><strong>{summary?.employees?.absent ?? "—"}</strong></div>
        </div>
      )}
    </section>
  );
}
