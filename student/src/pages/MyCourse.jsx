import { useEffect, useState } from 'react';
import CourseAttendanceTimeline from '../components/CourseAttendanceTimeline';
import Icon from '../components/Icon';
import attendanceService from '../services/attendanceService';
import { buildAssignedCourses } from '../services/courseProgress';
import './MyCourse.css';

const formatDuration = (minutes) => {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
};

const formatDate = (value) => (
  value ? new Date(value).toLocaleDateString() : 'No attendance recorded yet'
);

const fullName = (student) => [
  student?.student_name,
  student?.middle_name,
  student?.last_name,
].filter(Boolean).join(' ');

const MyCourse = ({ student }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  const studentName = fullName(student) || 'Student';
  const studentInitials = studentName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    let active = true;
    const loadCourses = async () => {
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
        if (active) setError(requestError.message || 'Unable to load your assigned courses.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourses();
    return () => {
      active = false;
    };
  }, [refreshVersion]);

  const totalLectures = courses.reduce((total, course) => total + course.lectures, 0);
  const coursesStarted = courses.filter((course) => course.lectures > 0).length;

  return (
    <section className="my-courses-page">
      <header className="my-courses-header">
        <div>
          <p className="my-courses-eyebrow">YOUR LEARNING SPACE</p>
          <h1>My Courses</h1>
          <p>Your assigned courses and lecture count from attendance.</p>
        </div>
        <div className="my-courses-header-actions">
          <span className="my-courses-student">
            <span className="my-courses-avatar">{studentInitials}</span>
            {studentName}
          </span>
          <button
            type="button"
            className="my-course-refresh-button"
            onClick={() => setRefreshVersion((version) => version + 1)}
            disabled={loading}
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>
      </header>

      {loading ? (
        <p className="my-courses-state" role="status">Loading your assigned courses…</p>
      ) : error ? (
        <div className="my-courses-state error">
          <p role="alert">{error}</p>
          <button
            type="button"
            className="my-course-refresh-button"
            onClick={() => setRefreshVersion((version) => version + 1)}
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="my-courses-summary">
            <article className="my-courses-stat">
              <span className="my-courses-stat-icon purple"><Icon name="book" size={21} /></span>
              <div>
                <strong>{courses.length}</strong>
                <span>Assigned courses</span>
              </div>
            </article>
            <article className="my-courses-stat">
              <span className="my-courses-stat-icon green"><Icon name="check-circle" size={21} /></span>
              <div>
                <strong>{totalLectures}</strong>
                <span>Lectures counted from attendance</span>
              </div>
            </article>
            <article className="my-courses-stat">
              <span className="my-courses-stat-icon blue"><Icon name="award" size={21} /></span>
              <div>
                <strong>{coursesStarted}</strong>
                <span>Courses with attendance</span>
              </div>
            </article>
          </div>

          {courses.length ? (
            <div className="my-courses-list">
              {courses.map((course) => (
                <article className="my-course-card" key={course.id}>
                  <div className="my-course-cover">
                    {course.image && (
                      <img
                        src={course.image}
                        alt=""
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    <span className="my-course-code">{course.code || 'COURSE'}</span>
                    <span className="my-course-purchased">
                      <Icon name="check-circle" size={15} />
                      Assigned
                    </span>
                  </div>

                  <div className="my-course-content">
                    <div className="my-course-title-row">
                      <div>
                        <h2>{course.name}</h2>
                        <p className="my-course-instructor">Instructor: {course.instructor}</p>
                      </div>
                      <span className={`my-course-progress-badge ${course.lectures ? 'started' : ''}`}>
                        {course.lectures ? `Lecture ${course.lectures}` : 'Attendance not started'}
                      </span>
                    </div>

                    <div className="my-course-details my-course-attendance-details">
                      <span>
                        <Icon name="book" size={17} />
                        <strong>{course.lectures}</strong> lecture{course.lectures === 1 ? '' : 's'} attended
                      </span>
                      <span>
                        <Icon name="check-circle" size={17} />
                        <strong>{formatDuration(course.totalMinutes)}</strong> time recorded
                      </span>
                    </div>

                    <div className="my-course-attendance-line">
                      <span>Attendance by lecture</span>
                      <strong>{course.lectures} {course.lectures === 1 ? 'lecture' : 'lectures'}</strong>
                    </div>
                    <CourseAttendanceTimeline
                      courseName={course.name}
                      records={course.attendanceRecords}
                    />

                    <div className="my-course-footer">
                      <span>Last attendance: {formatDate(course.lastAttendance)}</span>
                      {course.lectures > 0 && <span>Lecture count starts at 1 with your first check-in.</span>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="my-courses-state">No course has been assigned to your student account yet.</p>
          )}
        </>
      )}
    </section>
  );
};

export default MyCourse;
