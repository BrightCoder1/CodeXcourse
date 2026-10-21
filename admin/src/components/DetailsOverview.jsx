import React from 'react';
import { useNavigate } from 'react-router-dom';

const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserPlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const PieChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const DetailsOverview = () => {
  const navigate = useNavigate();

  const cardsData = [
    {
      id: 1,
      title: 'Total Students',
      value: '24,582',
      badge: '+8% from last month',
      path: '/students', // Table show on page
      actionLabel: 'View Directory',
      icon: <UsersIcon />
    },
    {
      id: 2,
      title: 'New Student Admission',
      value: 'Register',
      badge: 'Admission Open',
      path: '/student/register', // Register form
      actionLabel: 'Register Now',
      icon: <UserPlusIcon />
    },
    {
      id: 3,
      title: 'Add Employee',
      value: 'Staff Portal',
      badge: 'HR Management',
      path: '/employees/add', // Employee add
      actionLabel: 'Add New Staff',
      icon: <BriefcaseIcon />
    },
    {
      id: 4,
      title: 'Analytics & Reports',
      value: '78.4%',
      badge: 'Performance',
      path: '/analysis', // Show anal page
      actionLabel: 'View Analysis',
      icon: <PieChartIcon />
    }
  ];

  return (
    <div
      className="overview-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        padding: '16px 0'
      }}
    >
      {cardsData.map((card) => (
        <div
          key={card.id}
          className="overview-card"
          onClick={() => navigate(card.path)}
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.04)',
            cursor: 'pointer',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.08)';
            e.currentTarget.style.borderColor = '#93c5fd';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.04)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }}
        >
          {/* Top Row: Title, Badge, and Icon */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>
                {card.title}
              </span>
              {card.badge && (
                <div style={{ marginTop: '6px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#f1f5f9',
                      color: '#2563eb',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {card.badge}
                  </span>
                </div>
              )}
            </div>
            <div
              style={{
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                padding: '10px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {card.icon}
            </div>
          </div>

          {/* Bottom Row: Metric Value and Direct Navigation Prompt */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 style={{ margin: 0, fontSize: '1.65rem', fontWeight: 700, color: '#0f172a' }}>
              {card.value}
            </h2>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#2563eb'
              }}
            >
              <span>{card.actionLabel}</span>
              <ArrowRightIcon />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DetailsOverview;