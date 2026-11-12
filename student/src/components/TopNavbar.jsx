import { Link } from 'react-router-dom';
import Icon from './Icon';
import './TopNavbar.css';

const TopNavbar = ({ isDarkMode, onToggleTheme }) => (
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
        aria-label="Open Vishal Kumar's profile"
      >
        <div className="user-avatar">VK</div>
        <span className="user-name">Vishal Kumar</span>
      </Link>
    </div>
  </header>
);

export default TopNavbar;
