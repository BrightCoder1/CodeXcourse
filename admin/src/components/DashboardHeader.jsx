import React from 'react';

const DashboardHeader = ({ title = "Dashboard Overview", subtitle }) => {
  const defaultSubtitle = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <header className="dashboard-header">
      <h1 className="dashboard-title">{title}</h1>
      <p className="dashboard-subtitle">{subtitle || defaultSubtitle}</p>
    </header>
  );
};

export default DashboardHeader;