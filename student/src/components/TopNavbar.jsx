import { Link } from 'react-router-dom';
import Icon from './Icon';
import './TopNavbar.css';

const TopNavbar = ({ isDarkMode, onToggleTheme, student }) => {
  const studentName = [student?.student_name, student?.middle_name, student?.last_name]
    .filter(Boolean)
    .join(' ') || 'Student';
  const initials = studentName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <span className="portal-badge">Student Portal</span>
      </div>

      <div className="top-navbar-right">
        <button
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          aria-pressed={isDarkMode}
          type="button"
        >
          <Icon name={isDarkMode ? 'sun' : 'moon'} size={18} />
          <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
        </button>

        <Link
          className="navbar-user"
          to="/profile"
          aria-label={`Open ${studentName}'s profile`}
        >
          <div className="user-avatar">{initials}</div>
          <span className="user-name">{studentName}</span>
        </Link>
      </div>
    </header>
  );
};

export default TopNavbar;
