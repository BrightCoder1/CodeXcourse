import React, { useState, useEffect } from 'react';

const DashboardHeader = ({ title = "Dashboard Overview", subtitle }) => {
  const getFormattedDateTime = () => {
    return new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const [currentDateTime, setCurrentDateTime] = useState(getFormattedDateTime());

  useEffect(() => {
    // If custom subtitle is provided, no timer needed
    if (subtitle) return;

    const timer = setInterval(() => {
      setCurrentDateTime(getFormattedDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [subtitle]);

  return (
    <header className="dashboard-header">
      <h1 className="dashboard-title">{title}</h1>
      <p className="dashboard-subtitle">{subtitle || currentDateTime}</p>
    </header>
  );
};

export default DashboardHeader;