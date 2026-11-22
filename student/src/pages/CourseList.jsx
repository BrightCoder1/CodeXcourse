import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import './CourseList.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

const formatDate = (dateValue) => {
  if (!dateValue) return '—';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const controller = new AbortController();

    const loadCourses = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetch(`${API_URL}/display/course`, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || !data.success || !Array.isArray(data.data)) {
          throw new Error(data.message || 'The server returned an invalid courses response.');
        }

        setCourses(data.data);
      } catch (error) {
        if (!controller.signal.aborted) {
          setErrorMessage(error.message || 'Unable to load courses. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadCourses();
    return () => controller.abort();
  }, [retryCount]);

  const query = searchQuery.trim().toLowerCase();
  const filteredCourses = courses.filter((course) => {
    const matchesSearch = [
      course.courseName,
      course.courseCode,
      course.instructorName,
      course.teacherName,
    ].some((value) => (value || '').toLowerCase().includes(query));
    const status = course.status || 'Active';
    const matchesStatus = statusFilter === 'All' || status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <section className="course-list-page">
      <header className="course-list-header">
        <div>
          <p className="course-list-eyebrow">LEARN WITH CODEXCOURSE</p>
          <h1>All Courses</h1>
          <p className="course-list-subtitle">Explore your courses, instructors, and class schedules.</p>
        </div>
        <span className="course-count">
          {isLoading ? 'Loading courses…' : `${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
        </span>
      </header>

      <div className="course-list-toolbar">
        <label className="course-search">
          <Icon name="search" size={18} />
          <span className="sr-only">Search courses</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search courses, code, or instructor"
          />
        </label>

        <label className="course-status-filter">
          <span className="sr-only">Filter by course status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
      </div>

      {isLoading ? (
        <div className="course-list-message" role="status">Loading courses...</div>
      ) : errorMessage ? (
        <div className="course-list-error" role="alert">
          <p>{errorMessage}</p>
          <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
            Try again
          </button>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="course-card-grid">
          {filteredCourses.map((course) => {
            const status = course.status || 'Active';

            return (
              <article className="course-card" key={course._id}>
                <div className="course-card-cover">
                  {course.courseImageUrl && (
                    <img
                      src={course.courseImageUrl}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="course-code">{course.courseCode || 'COURSE'}</span>
                  <span className={`course-status ${status.toLowerCase()}`}>{status}</span>
                </div>

                <div className="course-card-content">
                  <h2>{course.courseName || 'Untitled course'}</h2>

                  <div className="course-faculty">
                    <p>
                      <Icon name="user" size={19} />
                      <span><strong>Instructor:</strong> {course.instructorName || 'Not assigned'}</span>
                    </p>
                    {course.teacherName && (
                      <p>
                        <Icon name="graduation-cap" size={19} />
                        <span>
                          <strong>Teacher:</strong> {course.teacherName}
                          {course.qualification ? ` (${course.qualification})` : ''}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="course-dates">
                    <div>
                      <span>Start</span>
                      <time dateTime={course.startingDate || undefined}>
                        {formatDate(course.startingDate)}
                      </time>
                    </div>
                    <div>
                      <span>End</span>
                      <time dateTime={course.endingDate || undefined}>
                        {formatDate(course.endingDate)}
                      </time>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="course-list-empty">
          <span className="course-empty-icon"><Icon name="book" size={24} /></span>
          <h2>{courses.length ? 'No matching courses' : 'No courses available yet'}</h2>
          <p>
            {courses.length
              ? 'Try another search term or choose a different status.'
              : 'Courses will appear here once they are added.'}
          </p>
        </div>
      )}
    </section>
  );
};

export default CourseList;
