import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

// SVG Icons
const Icons = {
  Logo: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  Courses: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Students: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Finances: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <circle cx="7" cy="15" r="1" fill="currentColor" />
      <circle cx="11" cy="15" r="1" fill="currentColor" />
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
};

const menuItems = [
  { name: 'Dashboard', path: '/', icon: <Icons.Dashboard /> },
  { name: 'Courses', path: '/courses', icon: <Icons.Courses /> },
  { name: 'Students', path: '/students', icon: <Icons.Students /> },
  { name: 'Analytics', path: '/analytics', icon: <Icons.Analytics /> },
  { name: 'Finances', path: '/finances', icon: <Icons.Finances /> },
];

export default function Navbar() {
  const location = useLocation();

  // Desktop minimize state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer open state
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Auto-close mobile drawer when switching route
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const toggleDesktopCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const toggleMobileMenu = () => {
    setIsMobileOpen(prev => !prev);
  };

  return (
    <>
      {/* 📱 Mobile Top Bar with Hamburger Trigger */}
      <header className="mobile-topbar">
        <div className="mobile-brand">
          <div className="brand-logo">
            <Icons.Logo />
          </div>
          <span className="brand-title">CodeXCourse</span>
        </div>
        <button 
          className="mobile-toggle-btn" 
          onClick={toggleMobileMenu}
          aria-label="Open menu"
        >
          <Icons.Menu />
        </button>
      </header>

      {/* 📱 Dark overlay on mobile when drawer is open */}
      <div 
        className={`mobile-backdrop ${isMobileOpen ? 'show' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* 🖥️ Sidebar Component (Responsive across all screens) */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        
        {/* Brand & Toggle Header */}
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">
              <Icons.Logo />
            </div>
            {!isCollapsed && <span className="brand-title">CodeXCourse</span>}
          </div>

          {/* Mobile close button */}
          <button 
            className="mobile-close-btn" 
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Desktop Minimize / Expand Button */}
        <button 
          className="desktop-collapse-btn" 
          onClick={toggleDesktopCollapse} 
          title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
          aria-label={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
        >
          {isCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
        </button>

        {/* Main Navigation Links */}
        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                data-tooltip={item.name}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Footer Section */}
        <div className="sidebar-footer">
          <Link
            to="/settings"
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`}
            data-tooltip="Settings"
          >
            <span className="nav-icon">
              <Icons.Settings />
            </span>
            <span className="nav-label">Settings</span>
          </Link>
        </div>
      </aside>
    </>
  );
}