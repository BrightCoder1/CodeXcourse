import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import CourseAttendanceTimeline from '../components/CourseAttendanceTimeline';
import attendanceService from '../services/attendanceService';
import { buildAssignedCourses } from '../services/courseProgress';
import './StudentDashboard.css';

const formatDuration = (minutes) => {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
};

const StudentDashboard = ({ student }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const [certificateNotice, setCertificateNotice] = useState('');
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const studentName = [student?.student_name, student?.middle_name, student?.last_name]
    .filter(Boolean)
    .join(' ') || 'Student';

  useEffect(() => {
    const intervalId = window.setInterval(() => setCurrentTime(new Date()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [dashboard, history] = await Promise.all([
          attendanceService.getDashboard(),
          attendanceService.getHistory({}),
        ]);
        const assignedCourses = buildAssignedCourses(dashboard, history);
        if (active) setCourses(assignedCourses);
      } catch (requestError) {
        if (active) setError(requestError.message || 'Unable to load your dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      active = false;
    };
  }, [refreshVersion]);

  const totalLectures = courses.reduce((total, course) => total + course.lectures, 0);
  const totalMinutes = courses.reduce((total, course) => total + course.totalMinutes, 0);
  const coursesStarted = courses.filter((course) => course.lectures > 0).length;
  const dateLabel = currentTime.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timeLabel = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
  const stats = [
    { title: 'Assigned Courses', value: courses.length, icon: 'shopping-bag', color: '#4f22b3' },
    { title: 'Attendance Lectures', value: totalLectures, icon: 'check-circle', color: '#16a34a' },
    { title: 'Hours Learned', value: formatDuration(totalMinutes), icon: 'clock', color: '#ea580c' },
    { title: 'Courses Started', value: coursesStarted, icon: 'award', color: '#0284c7' },
  ];

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Welcome back, {studentName}!</h2>
          <p>Track your course attendance and learning progress.</p>
        </div>
        <div className="dashboard-header-actions">
          <time className="dashboard-datetime" dateTime={currentTime.toISOString()}>
            <span>{dateLabel}</span>
            <strong>{timeLabel}</strong>
          </time>
          <button
            type="button"
            className="dashboard-refresh"
            onClick={() => setRefreshVersion((version) => version + 1)}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {certificateNotice && (
        <p className="dashboard-notice" role="status">{certificateNotice}</p>
      )}

      {loading ? (
        <p className="dashboard-state" role="status">Loading your course details…</p>
      ) : error ? (
        <div className="dashboard-state error">
          <p role="alert">{error}</p>
          <button type="button" className="dashboard-refresh" onClick={() => setRefreshVersion((version) => version + 1)}>
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.title} className="stat-card">
                <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                  <Icon name={stat.icon} size={24} />
                </div>
                <div className="stat-content">
                  <span className="stat-val">{stat.value}</span>
                  <span className="stat-title">{stat.title}</span>
                </div>
              </div>
            ))}
          </div>

          <section className="dashboard-section">
            <h3>My Assigned Courses</h3>
            {courses.length ? (
              <div className="progress-courses-grid">
                {courses.map((course) => (
                  <article key={course.id} className="progress-card">
                    <div className="progress-card-heading">
                      <div>
                        <h4>{course.name}</h4>
                        <p className="instructor">By {course.instructor}</p>
                      </div>
                      <span className={`lecture-count ${course.lectures ? 'started' : ''}`}>
                        {course.lectures ? `Lecture ${course.lectures}` : 'Not started'}
                      </span>
                    </div>

                    <div className="attendance-line-heading">
                      <span>Attendance by lecture</span>
                      <strong>{course.lectures} {course.lectures === 1 ? 'lecture' : 'lectures'}</strong>
                    </div>
                    <CourseAttendanceTimeline
                      courseName={course.name}
                      records={course.attendanceRecords}
                    />

                    <div className="progress-footer">
                      <span>
                        {formatDuration(course.totalMinutes)} recorded
                        {course.lastAttendance
                          ? ` · Last: ${new Date(course.lastAttendance).toLocaleDateString()}`
                          : ''}
                      </span>
                      <button
                        type="button"
                        className="certificate-btn"
                        onClick={() => setCertificateNotice('Not provide by the Company plase contect')}
                      >
                        <Icon name="award" size={16} />
                        Certificate
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="dashboard-state">No course has been assigned to your student account yet.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
