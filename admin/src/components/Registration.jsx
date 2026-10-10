import React from 'react';

// SVG Icons
const UserPlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);

const UserCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <polyline points="16 11 18 13 22 9" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const Registration = ({ onNavigate }) => {
  const cards = [
    {
      id: 'student-register',
      title: 'Student Register',
      description: 'Enroll new students into system',
      icon: <UserPlusIcon />,
      route: '/register/student',
      theme: 'purple',
    },
    {
      id: 'student-request',
      title: 'Student Request',
      description: 'Review pending admission queries',
      icon: <UserCheckIcon />,
      route: '/requests/student',
      theme: 'amber',
    },
    {
      id: 'employee-register',
      title: 'Employee Register',
      description: 'Onboard staff and instructors',
      icon: <BriefcaseIcon />,
      route: '/register/employee',
      theme: 'blue',
    },
    {
      id: 'overall-analytics',
      title: 'Overall Analytics',
      description: 'System health & key reports',
      icon: <BarChartIcon />,
      route: '/analytics/overall',
      theme: 'emerald',
    },
  ];

  const handleCardClick = (route) => {
    if (onNavigate) {
      onNavigate(route);
    } else {
      // Default fallback (agar react-router use kar rahe ho to navigate call kar sakte ho)
      window.location.href = route;
    }
  };

  return (
    <div className="registration-strip-container">
      <div className="registration-row">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`action-card theme-${card.theme}`}
            onClick={() => handleCardClick(card.route)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(card.route)}
          >
            <div className="action-card-header">
              <div className="action-icon-badge">{card.icon}</div>
              <span className="arrow-badge">
                <ArrowRightIcon />
              </span>
            </div>

            <div className="action-card-body">
              <h4 className="action-card-title">{card.title}</h4>
              <p className="action-card-desc">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Registration;