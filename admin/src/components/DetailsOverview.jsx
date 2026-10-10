import React from 'react';


const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const BookOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="14" x="3" y="5" rx="2" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="7" y1="15" x2="7.01" y2="15" />
    <line x1="11" y1="15" x2="13" y2="15" />
  </svg>
);

const CashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="12" x="2" y="6" rx="2" />
    <circle cx="12" cy="12" r="2" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

const PieChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const DetailsOverview = () => {
  const cardsData = [
    {
      id: 1,
      title: 'Total Students',
      value: '24,582',
      badge: '+8% from last month',
      icon: <UsersIcon />
    },
    {
      id: 2,
      title: 'Active Courses',
      value: '185',
      badge: null,
      icon: <BookOpenIcon />
    },
    {
      id: 3,
      title: 'Revenue',
      value: '$45,210',
      badge: '+12% from last month',
      icon: <CashIcon />
    },
    {
      id: 4,
      title: 'Completion Rate',
      value: '78.4%',
      badge: null,
      icon: <PieChartIcon />
    }
  ];

  return (
    <div className="overview-grid">
      {cardsData.map((card) => (
        <div key={card.id} className="overview-card">
          {/* Card Top Row: Title, Optional Badge, and Icon */}
          <div className="card-top-row">
            <div className="title-and-badge">
              <span className="card-title">{card.title}</span>
              {card.badge && (
                <span className="growth-badge">{card.badge}</span>
              )}
            </div>
            <div className="card-icon">{card.icon}</div>
          </div>

          {/* Card Bottom Row: Metric Value */}
          <div className="card-bottom-row">
            <h2 className="card-value">{card.value}</h2>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailsOverview;