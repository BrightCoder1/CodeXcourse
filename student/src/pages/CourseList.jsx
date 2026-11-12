import { useState } from 'react';
import Icon from '../components/Icon';
import './CourseList.css';

const courses = [
  {
    id: 'dsa001',
    courseName: 'DSA',
    courseCode: 'DSA001',
    instructorName: 'Vishal Kumar',
    teacherName: 'Vishal',
    qualification: '12',
    startingDate: '2026-11-12',
    endingDate: '2026-11-28',
    status: 'Inactive',
    courseImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'mern101',
    courseName: 'Full Stack MERN Bootcamp',
    courseCode: 'MERN101',
    instructorName: 'CodeX Team',
    teacherName: 'Neha Sharma',
    qualification: 'M.Tech',
    startingDate: '2026-11-10',
    endingDate: '2027-01-30',
    status: 'Active',
    courseImageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'react201',
    courseName: 'Advanced React & Redux',
    courseCode: 'REACT201',
    instructorName: 'Aisha Khan',
    teacherName: 'Rahul Verma',
    qualification: '8',
    startingDate: '2026-12-02',
    endingDate: '2027-02-28',
    status: 'Upcoming',
    courseImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'python101',
    courseName: 'Python Programming',
    courseCode: 'PYTHON101',
    instructorName: 'Priya Singh',
    teacherName: 'Priya Singh',
    qualification: 'MCA',
    startingDate: '2026-08-01',
    endingDate: '2026-10-30',
    status: 'Completed',
    courseImageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'node301',
    courseName: 'Node.js & Express APIs',
    courseCode: 'NODE301',
    instructorName: 'Arjun Mehta',
    teacherName: 'Arjun Mehta',
    qualification: '6',
    startingDate: '2026-11-05',
    endingDate: '2027-01-15',
    status: 'Active',
    courseImageUrl: 'https://images.unsplash.com/photo-1555949422-9b5b4b8b2f3b?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'design110',
    courseName: 'UI/UX Design Fundamentals',
    courseCode: 'DESIGN110',
    instructorName: 'Meera Patel',
    teacherName: 'Meera Patel',
    qualification: 'B.Des',
    startingDate: '2026-11-20',
    endingDate: '2027-01-20',
    status: 'Upcoming',
    courseImageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80',
  },
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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
          {courses.length} {courses.length === 1 ? 'course' : 'courses'}
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

      {filteredCourses.length > 0 ? (
        <div className="course-card-grid">
          {filteredCourses.map((course) => {
            const status = course.status || 'Active';

            return (
              <article className="course-card" key={course.id}>
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
