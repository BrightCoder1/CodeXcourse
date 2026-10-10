import React, { useState } from 'react';

const growthStats = [
  {
    id: 1,
    title: 'Annual Revenue Run Rate',
    value: '$542,800',
    change: '+24.6%',
    period: 'vs last year',
    trend: 'up'
  },
  {
    id: 2,
    title: 'Platform Learners',
    value: '48,250',
    change: '+38.2%',
    period: 'YoY Growth',
    trend: 'up'
  },
  {
    id: 3,
    title: 'Course Completion & Retention',
    value: '84.6%',
    change: '+5.4%',
    period: 'vs industry avg',
    trend: 'up'
  },
  {
    id: 4,
    title: 'Net Profit Margin',
    value: '31.8%',
    change: '+3.1%',
    period: 'Q3 performance',
    trend: 'up'
  }
];

const monthlyData = [
  { month: 'Jan', revenue: 28, growth: 12 },
  { month: 'Feb', revenue: 34, growth: 18 },
  { month: 'Mar', revenue: 32, growth: 15 },
  { month: 'Apr', revenue: 42, growth: 24 },
  { month: 'May', revenue: 48, growth: 29 },
  { month: 'Jun', revenue: 53, growth: 33 },
  { month: 'Jul', revenue: 61, growth: 42 },
  { month: 'Aug', revenue: 70, growth: 50 },
  { month: 'Sep', revenue: 78, growth: 55 },
  { month: 'Oct', revenue: 86, growth: 64 },
  { month: 'Nov', revenue: 92, growth: 71 },
  { month: 'Dec', revenue: 104, growth: 82 }
];

const Analytics = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [activeHover, setActiveHover] = useState(null);

  const maxRevenue = 120; // Scale base ($k)

  return (
    <div className="analytics-container">
      {/* Header with Filters */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Company Growth & Performance</h2>
          <p className="analytics-subtitle">
            Financial growth trajectory, learner scaling, and operational efficiency
          </p>
        </div>

        <div className="analytics-actions">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="year-select"
          >
            <option value="2024">Year 2024 (Current)</option>
            <option value="2023">Year 2023</option>
            <option value="2022">Year 2022</option>
          </select>
          <button className="export-report-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>

      {/* Top 4 Growth Highlight Cards */}
      <div className="growth-stats-grid">
        {growthStats.map((stat) => (
          <div key={stat.id} className="growth-stat-card">
            <span className="stat-title">{stat.title}</span>
            <div className="stat-body">
              <span className="stat-value">{stat.value}</span>
              <div className="stat-badge-group">
                <span className="stat-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                  {stat.change}
                </span>
                <span className="stat-period">{stat.period}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section & Breakdown */}
      <div className="analytics-main-grid">
        {/* Main Growth Graph */}
        <div className="chart-panel">
          <div className="chart-panel-header">
            <div>
              <h3 className="panel-title">Revenue Trajectory ($ in thousands)</h3>
              <p className="panel-sub">Monthly cash generation & new subscriptions</p>
            </div>
            <div className="legend-group">
              <div className="legend-item">
                <span className="legend-dot dot-primary"></span>
                <span>Gross Revenue</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-secondary"></span>
                <span>Net Growth</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div className="bars-chart-container">
            {monthlyData.map((item, idx) => {
              const revHeight = (item.revenue / maxRevenue) * 100;
              const growthHeight = (item.growth / maxRevenue) * 100;

              return (
                <div
                  key={idx}
                  className="bar-column-wrapper"
                  onMouseEnter={() => setActiveHover(item)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  <div className="bars-group">
                    <div
                      className="bar-fill bar-primary"
                      style={{ height: `${revHeight}%` }}
                      title={`Revenue: $${item.revenue}k`}
                    ></div>
                    <div
                      className="bar-fill bar-secondary"
                      style={{ height: `${growthHeight}%` }}
                      title={`Growth: +${item.growth}%`}
                    ></div>
                  </div>
                  <span className="bar-label">{item.month}</span>
                </div>
              );
            })}
          </div>

          {/* Hover Details */}
          {activeHover && (
            <div className="hover-status-box">
              <span>{activeHover.month} Highlights:</span>
              <strong>Gross: ${activeHover.revenue},000</strong>
              <span className="badge-inline">+{activeHover.growth}% Expansion</span>
            </div>
          )}
        </div>

        {/* Growth Drivers / Side Breakdown */}
        <div className="breakdown-panel">
          <h3 className="panel-title">Growth Channels</h3>
          <p className="panel-sub">Top sources contributing to year's revenue</p>

          <div className="channel-list">
            <div className="channel-item">
              <div className="channel-meta">
                <span className="channel-name">Online Direct Enrollments</span>
                <span className="channel-val">52% ($282K)</span>
              </div>
              <div className="prog-track">
                <div className="prog-bar" style={{ width: '52%', backgroundColor: '#7c3aed' }}></div>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-meta">
                <span className="channel-name">Enterprise & Corporate Training</span>
                <span className="channel-val">28% ($151K)</span>
              </div>
              <div className="prog-track">
                <div className="prog-bar" style={{ width: '28%', backgroundColor: '#0284c7' }}></div>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-meta">
                <span className="channel-name">Campus University Partnerships</span>
                <span className="channel-val">14% ($76K)</span>
              </div>
              <div className="prog-track">
                <div className="prog-bar" style={{ width: '14%', backgroundColor: '#10b981' }}></div>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-meta">
                <span className="channel-name">Certification Exam Fees</span>
                <span className="channel-val">6% ($33K)</span>
              </div>
              <div className="prog-track">
                <div className="prog-bar" style={{ width: '6%', backgroundColor: '#f59e0b' }}></div>
              </div>
            </div>
          </div>

          <div className="growth-summary-box">
            <h4>Executive Summary</h4>
            <p>
              Company reached break-even operational cashflow in Q2, with quarterly student acquisition cost decreasing by <strong>18.4%</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;