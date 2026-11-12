import { NavLink } from 'react-router-dom';
import Icon from './Icon';
import './Sidebar.css';

const Sidebar = ({ collapsed, onToggle }) => {
    return (
        <aside className={`sidebar-container ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="brand-logo-wrapper">
                    <div className="brand-icon-box">
                        <Icon name="code" size={22} className="brand-icon" />
                    </div>
                    {!collapsed && <span className="brand-title">CodeXCourse</span>}
                </div>

                <button
                    className="toggle-btn"
                    onClick={onToggle}
                    aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed
                        ? <Icon name="chevron-right" size={16} />
                        : <Icon name="chevron-left" size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    <li className="nav-item">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? 'Dashboard' : ''}
                        >
                            <Icon name="dashboard" className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">Dashboard</span>}
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/profile"
                            end
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? 'Profile' : ''}
                        >
                            <Icon name="user" className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">Profile</span>}
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/mycourse"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? 'My Course' : ''}
                        >
                            <Icon name="book" className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">My Course</span>}
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/courselist"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? 'Course List' : ''}
                        >
                            <Icon name="list" className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">Course List</span>}
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/attendance"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? 'Attendance' : ''}
                        >
                            <Icon name="calendar" className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">Attendance</span>}
                        </NavLink>
                    </li>

                    <li className="nav-item">
                        <NavLink
                            to="/fees"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            title={collapsed ? 'Fees' : ''}
                        >
                            <Icon name="credit-card" className="nav-icon" size={20} />
                            {!collapsed && <span className="nav-label">Fees</span>}
                        </NavLink>
                    </li>
                </ul>
            </nav>

            <button
                className="nav-link logout-btn"
                title={collapsed ? 'Logout' : ''}
                type="button"
            >
                <Icon name="logout" className="nav-icon" size={20} />
                {!collapsed && <span className="nav-label">Logout</span>}
            </button>
        </aside>
    );
};

export default Sidebar;