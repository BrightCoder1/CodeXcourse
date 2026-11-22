import { useCallback, useEffect, useMemo, useState } from 'react';
import attendanceService from '../services/attendanceService';
import './Attendance.css';

const STATUS_LABELS = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  leave: 'Leave',
};

const localDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const displayTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const displayDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString();
};

const sessionIsOpen = (session, now) => Boolean(
  session?.is_open &&
  now >= new Date(session.start_time) &&
  now <= new Date(session.end_time),
);

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`attendance-toast ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span aria-hidden="true">{type === 'error' ? '!' : '✓'}</span>
      {message}
    </div>
  );
}

function CourseAttendanceTab({ courses, now, busyCourseId, onMark }) {
  return (
    <div className="self-course-list">
      {courses.length ? courses.map((course) => {
        const marked = course.attendance;
        const open = sessionIsOpen(course.session, now);
        const markedTime = marked?.marked_at || marked?.created_at;
        const unavailable = course.sessionStatus === 'not_started' || !course.session;
        const message = marked
          ? `${STATUS_LABELS[marked.status] || 'Marked'} at ${displayTime(markedTime)}`
          : open
            ? 'Attendance window is open'
            : unavailable
              ? 'Not started'
              : 'Attendance closed';

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
                <span className={`self-window-state ${marked ? 'marked' : open ? 'open' : 'closed'}`}>
                  <span className="state-dot" />
                  {marked ? 'Already marked' : open ? 'Attendance open' : message}
                </span>
              </div>
            </div>
            <div className="self-course-action">
              {marked ? (
                <div className="self-marked-confirmation">
                  <span className="self-marked-check" aria-hidden="true">✓</span>
                  <span>{message}</span>
                </div>
              ) : (
                <>
                  {!open && <span className="self-closed-reason">{message}</span>}
                  <button
                    type="button"
                    className="self-attendance-button"
                    disabled={!open || busyCourseId === course._id}
                    onClick={() => onMark(course)}
                  >
                    {busyCourseId === course._id ? 'Saving…' : 'Mark present'}
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
    const priority = { leave: 0, absent: 1, late: 2, present: 3 };
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
        {['present', 'absent', 'late'].map((status) => (
          <span key={status}><i className={status} />{STATUS_LABELS[status]}</span>
        ))}
      </div>
    </div>
  );
}

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('courses');
  const [dashboard, setDashboard] = useState({ courses: [], dailyAttendance: null });
  const [history, setHistory] = useState({
    courseAttendance: [],
    dailyAttendance: [],
    percentages: [],
    dailyPercentage: 0,
  });
  const [filters, setFilters] = useState({ from: '', to: '', courseId: '' });
  const [appliedFilters, setAppliedFilters] = useState({ from: '', to: '', courseId: '' });
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [now, setNow] = useState(() => new Date());
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [busyCourseId, setBusyCourseId] = useState('');
  const [dailyBusy, setDailyBusy] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => setToast({ message, type });
  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      setDashboard(await attendanceService.getDashboard());
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    attendanceService.getDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((error) => {
        if (active) showToast(error.message, 'error');
      })
      .finally(() => {
        if (active) setLoadingDashboard(false);
      });
    return () => { active = false; };
  }, []);

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
    const intervalId = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!toast.message) return undefined;
    const timeoutId = window.setTimeout(
      () => setToast({ message: '', type: 'success' }),
      5000,
    );
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const markCourse = async (course) => {
    setBusyCourseId(course._id);
    setToast({ message: '', type: 'success' });
    try {
      await attendanceService.markCoursePresent(course._id);
      showToast(`${course.courseName}: attendance marked present.`);
      await loadDashboard();
      setLoadingHistory(true);
      setHistoryRefresh((version) => version + 1);
    } catch (error) {
      showToast(error.message, 'error');
      if (error.message === 'Attendance already marked' ||
          error.message === 'Attendance window is closed') {
        await loadDashboard();
      }
    } finally {
      setBusyCourseId('');
    }
  };

  const markDaily = async () => {
    if (!window.confirm('Mark your daily attendance for today? This can only be done once.')) return;
    setDailyBusy(true);
    setToast({ message: '', type: 'success' });
    try {
      const record = await attendanceService.markDailyPresent();
      showToast(`Daily attendance marked at ${displayTime(record.marked_at)}.`);
      await loadDashboard();
      setLoadingHistory(true);
      setHistoryRefresh((version) => version + 1);
    } catch (error) {
      showToast(error.message, 'error');
      if (error.message === 'Attendance already marked') await loadDashboard();
    } finally {
      setDailyBusy(false);
    }
  };

  const courses = dashboard.courses || [];
  const dailyAttendance = dashboard.dailyAttendance;
  const todayKey = dashboard.date || localDateKey(now);
  const todayCourseRecords = history.courseAttendance.filter((record) =>
    record.date.slice(0, 10) === todayKey
  );
  const todayPresent = todayCourseRecords.filter((record) => record.status === 'present').length;
  const overallPercentage = history.percentages.length
    ? Math.round(
      history.percentages.reduce((sum, item) => sum + item.percentage, 0) /
      history.percentages.length,
    )
    : 0;
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
          <p>Mark attendance during your class window and keep track of your history.</p>
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
          <div><strong>{todayPresent}</strong><span>Course sessions attended today</span></div>
        </article>
        <article className="self-overview-card">
          <span className="self-overview-icon orange">%</span>
          <div><strong>{overallPercentage}%</strong><span>Average attendance</span></div>
        </article>
      </div>

      <nav className="self-attendance-tabs" aria-label="Attendance options">
        <button type="button" className={activeTab === 'courses' ? 'active' : ''} onClick={() => setActiveTab('courses')}>Course attendance</button>
        <button type="button" className={activeTab === 'daily' ? 'active' : ''} onClick={() => setActiveTab('daily')}>My daily attendance</button>
        <button type="button" className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History & calendar</button>
      </nav>

      {activeTab === 'courses' && (
        <section className="self-attendance-panel">
          <div className="self-panel-heading">
            <div><h2>Course attendance</h2><p>Your teacher opens attendance for a limited time during class.</p></div>
            <span className="self-panel-date">{new Date(`${todayKey}T12:00:00`).toLocaleDateString()}</span>
          </div>
          {loadingDashboard ? (
            <div className="self-loading" role="status"><span className="self-spinner" />Loading your courses…</div>
          ) : (
            <CourseAttendanceTab
              courses={courses}
              now={now}
              busyCourseId={busyCourseId}
              onMark={markCourse}
            />
          )}
        </section>
      )}

      {activeTab === 'daily' && (
        <section className="self-attendance-panel self-daily-panel">
          <div className="self-panel-heading">
            <div><h2>My daily attendance</h2><p>Mark your presence at the institute once per day.</p></div>
            <span className="self-panel-date">{history.dailyPercentage}% recorded-day attendance</span>
          </div>
          {loadingDashboard ? (
            <div className="self-loading" role="status"><span className="self-spinner" />Checking today&apos;s attendance…</div>
          ) : dailyAttendance ? (
            <div className="self-daily-marked">
              <span className="self-daily-check" aria-hidden="true">✓</span>
              <div><strong>Daily attendance marked</strong><span>Marked at {displayTime(dailyAttendance.marked_at)}</span></div>
              <span className="self-daily-badge">Present</span>
            </div>
          ) : (
            <div className="self-daily-action">
              <div><strong>You have not marked attendance today</strong><span>This action is available once each day.</span></div>
              <button type="button" className="self-attendance-button" disabled={dailyBusy} onClick={markDaily}>
                {dailyBusy ? 'Saving…' : 'Mark my attendance'}
              </button>
            </div>
          )}
        </section>
      )}

      {activeTab === 'history' && (
        <div className="self-history-layout">
          <section className="self-attendance-panel self-history-main">
            <div className="self-panel-heading">
              <div><h2>Attendance history</h2><p>Course-wise and daily records for your account.</p></div>
            </div>
            <form className="self-history-filters" onSubmit={applyHistoryFilters}>
              <label>From<input type="date" max={localDateKey(now)} value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label>
              <label>To<input type="date" max={localDateKey(now)} value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label>
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
                      <span><strong>{item.courseName}</strong><small>{item.attended} of {item.eligible} marked days attended</small></span>
                      <strong>{item.percentage}%</strong>
                    </div>
                  ))}
                  {!history.percentages.length && <p className="self-history-empty">No course attendance records in this range.</p>}
                </div>

                <div className="self-history-table-wrap">
                  <table className="self-history-table">
                    <thead><tr><th>Date</th><th>Type / Course</th><th>Status</th><th>Marked at</th></tr></thead>
                    <tbody>
                      {[
                        ...history.courseAttendance.map((record) => ({
                          id: record._id,
                          date: record.date,
                          label: record.course_id?.courseName || 'Course attendance',
                          status: record.status,
                          markedAt: record.marked_at || record.created_at,
                        })),
                        ...history.dailyAttendance.map((record) => ({
                          id: `daily-${record._id}`,
                          date: record.date,
                          label: 'Daily attendance',
                          status: record.status,
                          markedAt: record.marked_at,
                        })),
                      ].map((record) => (
                        <tr key={record.id}>
                          <td>{displayDate(record.date)}</td><td>{record.label}</td>
                          <td><span className={`self-history-status ${record.status}`}>{STATUS_LABELS[record.status] || record.status}</span></td>
                          <td>{displayTime(record.markedAt)}</td>
                        </tr>
                      ))}
                      {!history.courseAttendance.length && !history.dailyAttendance.length && (
                        <tr><td colSpan="4" className="self-history-empty">No attendance records found.</td></tr>
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
