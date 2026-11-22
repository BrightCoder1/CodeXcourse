import React from 'react';
import Icon from '../components/Icon';
import './StudentDashboard.css';

const StudentDashboard = ({ student }) => {
  const studentName = [student?.student_name, student?.middle_name, student?.last_name]
    .filter(Boolean)
    .join(' ') || 'Student';
  const stats = [
    { title: 'Enrolled Courses', value: '4', icon: 'shopping-bag', color: '#4f22b3' },
    { title: 'Completed', value: '2', icon: 'check-circle', color: '#16a34a' },
    { title: 'Hours Learned', value: '38h', icon: 'clock', color: '#ea580c' },
    { title: 'Certificates', value: '2', icon: 'award', color: '#0284c7' },
  ];

  const inProgressCourses = [
    {
      id: 1,
      title: 'Full Stack MERN Bootcamp',
      instructor: 'CodeX Team',
      progress: 68,
      lastAccessed: 'Yesterday',
    },
    {
      id: 2,
      title: 'Advanced React & Redux Toolkit',
      instructor: 'Alex Rivera',
      progress: 35,
      lastAccessed: '3 days ago',
    },
  ];

  return (
    <div className="student-dashboard">
      <header className="dashboard-header">
        <div>
          <h2>Welcome back, {studentName}! 👋</h2>
          <p>Track your learning progress and pick up where you left off.</p>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="stats-grid">
        {stats.map((stat, i) => {
          return (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                <Icon name={stat.icon} size={24} />
              </div>
              <div className="stat-content">
                <span className="stat-val">{stat.value}</span>
                <span className="stat-title">{stat.title}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Course Progress Section */}
      <section className="dashboard-section">
        <h3>Continue Learning</h3>
        <div className="progress-courses-grid">
          {inProgressCourses.map((c) => (
            <div key={c.id} className="progress-card">
              <h4>{c.title}</h4>
              <p className="instructor">By {c.instructor}</p>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill" style={{ width: `${c.progress}%` }}></div>
              </div>
              <div className="progress-footer">
                <span>{c.progress}% Complete</span>
                <button className="resume-btn">Resume</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
