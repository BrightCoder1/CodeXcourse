import { useEffect, useMemo, useState } from 'react';
import attendanceService from '../services/attendanceService';
import './Attendance.css';

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  leave: 'Leave',
  in_progress: 'Checked in',
};

const localDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const displayTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const displayDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const formatDuration = (minutes) => {
  const total = Number(minutes) || 0;
  const hours = Math.floor(total / 60);
  const remainder = total % 60;
  return hours ? `${hours}h ${remainder}m` : `${remainder}m`;
};

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`attendance-toast ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{type === 'error' ? '!' : '✓'}</span>
      {message}
    </div>
  );
}

function CourseAttendanceTab({ courses, busyCourseId, onAttendanceAction }) {
  return (
    <div className="self-course-list">
      {courses.length ? courses.map((course) => {
        const attendance = course.attendance;
        const checkedIn = attendance?.check_in && !attendance?.check_out;
        const hasRecord = Boolean(attendance && !checkedIn);
        const status = attendance?.status || 'ready';
        const message = attendance
          ? `${STATUS_LABELS[attendance.status] || 'Marked'}${attendance.total_minutes ? ` · ${formatDuration(attendance.total_minutes)}` : ''}`
          : 'Ready to check in anytime';

        return (
          <article className="self-course-card" key={course._id}>
            <div className="self-course-main">
              <div className="self-course-icon" aria-hidden="true">▣</div>
              <div className="self-course-details">
                <div className="self-course-title-row">
                  <h3>{course.courseName}</h3>
                  <span className="self-course-code">{course.courseCode}</span>
                </div>
                <p>{course.teacherName || course.instructorName || 'Course instructor'}</p>
                <span className={`self-window-state ${status}`}>
                  <span className="state-dot" />
                  {checkedIn
                    ? `${STATUS_LABELS[attendance.status] || 'Checked in'} — check out to finish attendance`
                    : message}
                </span>
                {attendance && (
                  <div className="self-course-time-details">
                    <span>In: {displayTime(attendance.check_in)}</span>
                    <span>Out: {displayTime(attendance.check_out)}</span>
                    <span>Total: {formatDuration(attendance.total_minutes)}</span>
                    {attendance.leave_reason && <span>Leave reason: {attendance.leave_reason}</span>}
                  </div>
                )}
              </div>
            </div>
            <div className="self-course-action">
              {hasRecord ? (
                <div className={`self-marked-confirmation ${status}`}>
                  <span className="self-marked-check" aria-hidden="true">✓</span>
                  <span>{STATUS_LABELS[attendance.status] || 'Attendance complete'}</span>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="self-attendance-button"
                    disabled={Boolean(checkedIn) || busyCourseId === course._id}
                    onClick={() => onAttendanceAction(course, 'check-in')}
                  >
                    {busyCourseId === course._id
                      ? 'Saving…'
                      : checkedIn
                        ? 'Checked in'
                        : 'Check in'}
                  </button>
                  <button
                    type="button"
                    className="self-attendance-button checkout"
                    disabled={!checkedIn || busyCourseId === course._id}
                    onClick={() => onAttendanceAction(course, 'check-out')}
                  >
                    {busyCourseId === course._id ? 'Saving…' : 'Check out'}
                  </button>
                </>
              )}
            </div>
          </article>
        );
      }) : (
        <div className="self-empty-state">
          <span aria-hidden="true">▣</span>
          <strong>No enrolled course found</strong>
          <p>Your course enrollment must match a course name or course code.</p>
        </div>
      )}
    </div>
  );
}

function AttendanceCalendar({ records, selectedCourseId, month, onMonthChange }) {
  const statusesByDate = useMemo(() => {
    const priority = { leave: 0, absent: 1, late: 2, present: 3, in_progress: 4 };
    const statuses = new Map();
    records
      .filter((record) => !selectedCourseId || record.course_id?._id === selectedCourseId)
      .forEach((record) => {
        const key = record.date.slice(0, 10);
        const current = statuses.get(key);
        if (!current || priority[record.status] > priority[current]) {
          statuses.set(key, record.status);
        }
      });
    return statuses;
  }, [records, selectedCourseId]);

  const calendarDays = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);

  return (
    <div className="self-calendar">
      <div className="self-calendar-heading">
        <button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))} aria-label="Previous month">‹</button>
        <strong>{month.toLocaleDateString([], { month: 'long', year: 'numeric' })}</strong>
        <button type="button" onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))} aria-label="Next month">›</button>
      </div>
      <div className="self-calendar-grid weekdays" aria-hidden="true">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day}>{day}</span>)}
      </div>
      <div className="self-calendar-grid">
        {calendarDays.map((day) => {
          const dateKey = localDateKey(day);
          const status = statusesByDate.get(dateKey);
          const outsideMonth = day.getMonth() !== month.getMonth();
          return (
            <span
              className={`self-calendar-day ${outsideMonth ? 'outside' : ''} ${status || ''}`}
              key={dateKey}
              title={status ? `${dateKey}: ${STATUS_LABELS[status]}` : dateKey}
            >
              {day.getDate()}
            </span>
          );
        })}
      </div>
      <div className="self-calendar-legend">
        {['present', 'absent', 'late', 'leave'].map((status) => (
          <span key={status}><i className={status} />{STATUS_LABELS[status]}</span>
        ))}
      </div>
    </div>
  );
}

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('courses');
  const [dashboard, setDashboard] = useState({ courses: [] });
  const [history, setHistory] = useState({ courseAttendance: [], percentages: [] });
  const [filters, setFilters] = useState({ from: '', to: '', courseId: '' });
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', courseId: '' });
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [dashboardRefresh, setDashboardRefresh] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [busyCourseId, setBusyCourseId] = useState('');
  const [busyLeave, setBusyLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState(() => ({
    courseId: '',
    date: localDateKey(new Date()),
    reason: '',
  }));
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    let active = true;
    attendanceService.getDashboard()
      .then((data) => {
        if (active) {
          setDashboard(data);
          setLeaveForm((form) => ({
            ...form,
            courseId: form.courseId || data.courses?.[0]?._id || '',
          }));
        }
      })
      .catch((error) => {
        if (active) showToast(error.message, 'error');
      })
      .finally(() => {
        if (active) setLoadingDashboard(false);
      });
    return () => { active = false; };
  }, [dashboardRefresh]);

  useEffect(() => {
    let active = true;
    attendanceService.getHistory(appliedFilters)
      .then((data) => {
        if (active) setHistory(data);
      })
      .catch((error) => {
        if (active) showToast(error.message, 'error');
      })
      .finally(() => {
        if (active) setLoadingHistory(false);
      });
    return () => { active = false; };
  }, [appliedFilters, historyRefresh]);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeoutId = window.setTimeout(
      () => setToast({ message: '', type: 'success' }),
      5000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const refreshAttendance = () => {
    setLoadingDashboard(true);
    setLoadingHistory(true);
    setDashboardRefresh((version) => version + 1);
    setHistoryRefresh((version) => version + 1);
  };

  const markCourseAttendance = async (course, action) => {
    setBusyCourseId(course._id);
    setToast({ message: '', type: 'success' });
    try {
      await attendanceService.markCourseAttendance(course._id, action);
      showToast(action === 'check-in'
        ? `${course.courseName}: checked in. Check out to count your time.`
        : `${course.courseName}: checked out and attendance time recorded.`);
      refreshAttendance();
    } catch (error) {
      showToast(error.message, 'error');
      refreshAttendance();
    } finally {
      setBusyCourseId('');
    }
  };

  const applyLeave = async (event) => {
    event.preventDefault();
    setBusyLeave(true);
    setToast({ message: '', type: 'success' });
    try {
      await attendanceService.applyCourseLeave(leaveForm.courseId, {
        date: leaveForm.date,
        reason: leaveForm.reason,
      });
      showToast('Leave application submitted.');
      setLeaveForm((form) => ({ ...form, reason: '' }));
      refreshAttendance();
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setBusyLeave(false);
    }
  };

  const courses = dashboard.courses || [];
  const todayKey = dashboard.date || leaveForm.date;
  const todayCourseRecords = history.courseAttendance.filter((record) =>
    record.date.slice(0, 10) === todayKey
  );
  const todayCompleted = todayCourseRecords.filter((record) =>
    record.status === 'present' || record.status === 'late'
  ).length;
  const todayMinutes = todayCourseRecords.reduce((total, record) => total + (record.total_minutes || 0), 0);
  const applyHistoryFilters = (event) => {
    event.preventDefault();
    setLoadingHistory(true);
    setAppliedFilters({ ...filters });
  };

  return (
    <section className="self-attendance-page">
      <header className="self-attendance-header">
        <div>
          <span className="self-attendance-eyebrow">STUDENT PORTAL</span>
          <h1>My attendance</h1>
          <p>Check in and check out for each course at any time today. Time is counted after checkout.</p>
        </div>
        <div className="self-attendance-date-card">
          <span>Today</span>
          <strong>{new Date(`${todayKey}T12:00:00`).toLocaleDateString([], { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
        </div>
      </header>

      <Toast message={toast.message} type={toast.type} />

      <div className="self-attendance-overview">
        <article className="self-overview-card">
          <span className="self-overview-icon purple">▣</span>
          <div><strong>{courses.length}</strong><span>Enrolled courses</span></div>
        </article>
        <article className="self-overview-card">
          <span className="self-overview-icon green">✓</span>
          <div><strong>{todayCompleted}</strong><span>Completed course sessions</span></div>
        </article>
        <article className="self-overview-card">
          <span className="self-overview-icon orange">◷</span>
          <div><strong>{formatDuration(todayMinutes)}</strong><span>Time recorded today</span></div>
        </article>
      </div>

      <nav className="self-attendance-tabs" aria-label="Attendance options">
        <button type="button" className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>Course attendance</button>
        <button type="button" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History & calendar</button>
      </nav>

      {activeTab === 'courses' && (
        <section className="self-attendance-panel">
          <div className="self-panel-heading">
            <div><h2>Course attendance</h2><p>No attendance window is needed. Check in when you start and check out when you finish.</p></div>
            <span className="self-panel-date">{new Date(`${todayKey}T12:00:00`).toLocaleDateString()}</span>
          </div>
          <form className="self-leave-form" onSubmit={applyLeave}>
            <h3>Apply for course leave</h3>
            <label>
              Course
              <select
                required
                value={leaveForm.courseId}
                onChange={(event) => setLeaveForm({ ...leaveForm, courseId: event.target.value })}
              >
                {courses.map((course) => <option key={course._id} value={course._id}>{course.courseName}</option>)}
              </select>
            </label>
            <label>
              Leave date
              <input
                required
                type="date"
                min={todayKey}
                value={leaveForm.date}
                onChange={(event) => setLeaveForm({ ...leaveForm, date: event.target.value })}
              />
            </label>
            <label className="self-leave-reason">
              Reason
              <textarea
                required
                maxLength={500}
                value={leaveForm.reason}
                onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })}
                placeholder="Briefly explain your leave request"
              />
            </label>
            <button type="submit" className="self-filter-button" disabled={!courses.length || busyLeave}>
              {busyLeave ? 'Submitting…' : 'Submit leave'}
            </button>
          </form>
          {loadingDashboard ? (
            <div className="self-loading" role="status"><span className="self-spinner" />Loading your courses…</div>
          ) : (
            <CourseAttendanceTab
              courses={courses}
              busyCourseId={busyCourseId}
              onAttendanceAction={markCourseAttendance}
            />
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <div className="self-history-layout">
          <section className="self-attendance-panel self-history-main">
            <div className="self-panel-heading">
              <div><h2>Course attendance history</h2><p>Review each course status, check-in/out, and recorded time.</p></div>
            </div>
            <form className="self-history-filters" onSubmit={applyHistoryFilters}>
              <label>From<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
              <label>To<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
              <label>Course<select value={filters.courseId} onChange={(event) => setFilters({ ...filters, courseId: event.target.value })}><option value="">All courses</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.courseName}</option>)}</select></label>
              <button type="submit" className="self-filter-button" disabled={loadingHistory}>{loadingHistory ? 'Loading…' : 'Apply filter'}</button>
            </form>

            {loadingHistory ? (
              <div className="self-loading"><span className="self-spinner" />Loading attendance history…</div>
            ) : (
              <>
                <div className="self-percentage-list">
                  {history.percentages.map((item) => (
                    <div className="self-percentage-card" key={item.courseId}>
                      <span><strong>{item.courseName}</strong><small>{item.attended} of {item.eligible} completed sessions · {formatDuration(item.totalMinutes)} recorded</small></span>
                      <strong>{item.percentage}%</strong>
                    </div>
                  ))}
                  {!history.percentages.length && <p className="self-history-empty">No course attendance records in this range.</p>}
                </div>

                <div className="self-history-table-wrap">
                  <table className="self-history-table">
                    <thead><tr><th>Date</th><th>Course</th><th>Status</th><th>In</th><th>Out</th><th>Time</th></tr></thead>
                    <tbody>
                      {history.courseAttendance.map((record) => (
                        <tr key={record._id}>
                          <td>{displayDate(record.date)}</td>
                          <td>{record.course_id?.courseName || 'Course attendance'}{record.leave_reason && <small className="attendance-leave-reason">{record.leave_reason}</small>}</td>
                          <td><span className={`self-history-status ${record.status}`}>{STATUS_LABELS[record.status] || record.status}</span></td>
                          <td>{displayTime(record.check_in)}</td>
                          <td>{displayTime(record.check_out)}</td>
                          <td>{formatDuration(record.total_minutes)}</td>
                        </tr>
                      ))}
                      {!history.courseAttendance.length && (
                        <tr><td colSpan="6" className="self-history-empty">No course attendance records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section className="self-attendance-panel self-calendar-panel">
            <div className="self-panel-heading"><div><h2>Course calendar</h2><p>Color shows your course attendance status.</p></div></div>
            <AttendanceCalendar
              records={history.courseAttendance}
              selectedCourseId={filters.courseId}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
            />
          </section>
        </div>
      )}
    </section>
  );
}
