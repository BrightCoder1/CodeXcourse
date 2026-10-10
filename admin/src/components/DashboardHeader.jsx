import React from 'react';

const DashboardHeader = ({ title = "Dashboard Overview", subtitle = "Welcome to Date: 18, 2024" }) => {
  return (
    <header className="dashboard-header">
      <h1 className="dashboard-title">{title}</h1>
      <p className="dashboard-subtitle">{subtitle}</p>
    </header>
  );
};

export default DashboardHeader;