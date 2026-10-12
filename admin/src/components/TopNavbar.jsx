import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './TopNavbar.css';

const Icons = {
    Search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Bell: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    ),
    Mail: () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    ),
    ChevronDown: () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
        </svg>
    ),
};

export default function TopNavbar() {
    const [searchValue, setSearchValue] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDropdownOpen(false);

        try {
            await logout();
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            navigate('/c/admin/login', { replace: true });
        }
    };

    return (
        <header className="top-navbar">
            <div className="search-box">
                <span className="search-icon">
                    <Icons.Search />
                </span>
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className="search-input"
                />
            </div>

            <div className="top-navbar-actions">
                <button type="button" className="icon-btn" aria-label="Notifications">
                    <Icons.Bell />
                    <span className="notification-badge" />
                </button>

                <button type="button" className="icon-btn" aria-label="Messages">
                    <Icons.Mail />
                </button>

                <div className="profile-wrapper" style={{ position: 'relative' }}>
                    <button
                        type="button"
                        className="profile-btn"
                        onClick={() => setDropdownOpen((open) => !open)}
                        aria-label="User menu"
                        aria-expanded={dropdownOpen}
                    >
                        <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces"
                            alt="Admin avatar"
                            className="profile-avatar"
                        />
                        <span className="profile-name">
                            {user?.emp_name || 'Admin'}
                        </span>
                        <Icons.ChevronDown />
                    </button>

                    {dropdownOpen && (
                        <div className="profile-dropdown" style={{ position: 'absolute', right: 0, zIndex: 1000 }}>
                            <Link
                                to="/profile"
                                className="dropdown-item"
                                onClick={() => setDropdownOpen(false)}
                            >
                                My Profile
                            </Link>

                            <hr className="dropdown-divider" />

                            <button
                                type="button"
                                className="dropdown-item logout-btn"
                                onClick={handleLogout}
                            >
                                Log Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}