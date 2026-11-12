import Icon from '../components/Icon';
import './MyCourse.css';

const purchasedCourses = [
  {
    id: 'mern101',
    name: 'Full Stack MERN Bootcamp',
    code: 'MERN101',
    instructor: 'CodeX Team',
    studentName: 'Rahul Bhola',
    completedLectures: 21,
    totalLectures: 52,
    lastLecture: 'Authentication & Authorization',
    purchasedOn: '25 Oct 2026',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'dsa001',
    name: 'Data Structures & Algorithms',
    code: 'DSA001',
    instructor: 'Vishal Kumar',
    studentName: 'Rahul Bhola',
    completedLectures: 14,
    totalLectures: 40,
    lastLecture: 'Linked Lists',
    purchasedOn: '12 Oct 2026',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'react201',
    name: 'Advanced React & Redux',
    code: 'REACT201',
    instructor: 'Aisha Khan',
    studentName: 'Rahul Bhola',
    completedLectures: 45,
    totalLectures: 45,
    lastLecture: 'Custom Hooks',
    purchasedOn: '02 Nov 2026',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
  },
];

const MyCourse = () => {
  const completedLectures = purchasedCourses.reduce(
    (total, course) => total + course.completedLectures,
    0,
  );
  const totalLectures = purchasedCourses.reduce(
    (total, course) => total + course.totalLectures,
    0,
  );
  const completedCourses = purchasedCourses.filter(
    (course) => course.completedLectures === course.totalLectures,
  ).length;

  return (
    <section className="my-courses-page">
      <header className="my-courses-header">
        <div>
          <p className="my-courses-eyebrow">YOUR LEARNING SPACE</p>
          <h1>My Courses</h1>
          <p>Purchased courses and your lecture-by-lecture progress.</p>
        </div>
        <span className="my-courses-student">
          <span className="my-courses-avatar">RB</span>
          Rahul Bhola
        </span>
      </header>

      <div className="my-courses-summary">
        <article className="my-courses-stat">
          <span className="my-courses-stat-icon purple"><Icon name="shopping-bag" size={21} /></span>
          <div>
            <strong>{purchasedCourses.length}</strong>
            <span>Purchased courses</span>
          </div>
        </article>
        <article className="my-courses-stat">
          <span className="my-courses-stat-icon green"><Icon name="check-circle" size={21} /></span>
          <div>
            <strong>{completedLectures} <small>/ {totalLectures}</small></strong>
            <span>Lectures completed</span>
          </div>
        </article>
        <article className="my-courses-stat">
          <span className="my-courses-stat-icon blue"><Icon name="award" size={21} /></span>
          <div>
            <strong>{completedCourses}</strong>
            <span>Courses completed</span>
          </div>
        </article>
      </div>

      <div className="my-courses-list">
        {purchasedCourses.map((course) => {
          const progress = Math.round((course.completedLectures / course.totalLectures) * 100);
          const isComplete = progress === 100;

          return (
            <article className="my-course-card" key={course.id}>
              <div className="my-course-cover">
                <img
                  src={course.image}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <span className="my-course-code">{course.code}</span>
                <span className="my-course-purchased">
                  <Icon name="check-circle" size={15} />
                  Purchased
                </span>
              </div>

              <div className="my-course-content">
                <div className="my-course-title-row">
                  <div>
                    <h2>{course.name}</h2>
                    <p className="my-course-instructor">Instructor: {course.instructor}</p>
                  </div>
                  <span className={`my-course-progress-badge ${isComplete ? 'complete' : ''}`}>
                    {isComplete ? 'Completed' : 'In progress'}
                  </span>
                </div>

                <div className="my-course-progress">
                  <div className="my-course-progress-labels">
                    <span>Course progress</span>
                    <strong>{progress}%</strong>
                  </div>
                  <div
                    className="my-course-progress-track"
                    role="progressbar"
                    aria-label={`${course.name} progress`}
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow={progress}
                  >
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>

                <div className="my-course-details">
                  <span>
                    <Icon name="book" size={17} />
                    <strong>{course.completedLectures} / {course.totalLectures}</strong> lectures completed
                  </span>
                  <span>
                    <Icon name="user" size={17} />
                    Progress for <strong>{course.studentName}</strong>
                  </span>
                </div>

                <div className="my-course-footer">
                  <span>Last lecture: {course.lastLecture}</span>
                  <span>Purchased {course.purchasedOn}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <p className="my-courses-demo-note">
        Sample purchase and lecture progress data. Live student records are not connected yet.
      </p>
    </section>
  );
};

export default MyCourse;
