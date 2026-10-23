import React, { useEffect, useMemo, useState } from 'react';
import authService from '../services/authServices';

const PERIOD_OPTIONS = [
  { value: 'year', label: 'Yearly' },
  { value: 'month', label: 'Monthly' },
  { value: 'week', label: 'Weekly' },
  { value: 'day', label: 'Daily' }
];
const SVG_WIDTH = 560;
const SVG_HEIGHT = 250;
const PADDING_LEFT = 45;
const PADDING_RIGHT = 25;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 58;
const CHART_WIDTH = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT;
const CHART_HEIGHT = SVG_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
const CURRENT_DATE = new Date();

const formatCount = (count) => count.toLocaleString();

const startOfWeek = (date) => {
  const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysSinceMonday = (weekStart.getDay() + 6) % 7;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);
  return weekStart;
};

const getPeriods = (period, now) => {
  const count = period === 'year' ? 8 : period === 'day' ? 14 : 12;
  const periods = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    let start;
    if (period === 'year') {
      start = new Date(now.getFullYear() - index, 0, 1);
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth() - index, 1);
    } else if (period === 'week') {
      const currentWeek = startOfWeek(now);
      start = new Date(currentWeek);
      start.setDate(start.getDate() - index * 7);
    } else {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - index);
    }

    let label;
    if (period === 'year') {
      label = String(start.getFullYear());
    } else if (period === 'month') {
      label = new Intl.DateTimeFormat('en', { month: 'short' }).format(start);
    } else if (period === 'week') {
      label = `Week of ${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(start)}`;
    } else {
      label = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(start);
    }

    periods.push({ start, label, value: 0 });
  }

  return periods;
};

const StudentGrowth = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  useEffect(() => {
    let active = true;

    authService.getAllStudents()
      .then((allStudents) => {
        if (active) setStudents(allStudents);
      })
      .catch((fetchError) => {
        if (active) {
          setError(
            fetchError.response?.data?.message ||
              fetchError.message ||
              'Failed to load student growth data.'
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(() => {
    const periods = getPeriods(selectedPeriod, CURRENT_DATE);
    const periodByKey = new Map(periods.map((item) => [item.start.getTime(), item]));

    students.forEach((student) => {
      const registrationDate = student.createdAt ? new Date(student.createdAt) : null;
      if (!registrationDate || Number.isNaN(registrationDate.getTime())) return;

      let bucketStart;
      if (selectedPeriod === 'year') {
        bucketStart = new Date(registrationDate.getFullYear(), 0, 1);
      } else if (selectedPeriod === 'month') {
        bucketStart = new Date(registrationDate.getFullYear(), registrationDate.getMonth(), 1);
      } else if (selectedPeriod === 'week') {
        bucketStart = startOfWeek(registrationDate);
      } else {
        bucketStart = new Date(
          registrationDate.getFullYear(),
          registrationDate.getMonth(),
          registrationDate.getDate()
        );
      }

      const bucket = periodByKey.get(bucketStart.getTime());
      if (bucket) bucket.value += 1;
    });

    return periods;
  }, [students, selectedPeriod]);

  const maxCount = Math.max(1, ...data.map((item) => item.value));
  const tickStep = Math.max(1, Math.ceil(maxCount / 4));
  const axisMaximum = tickStep * 4;
  const yAxisTicks = Array.from({ length: 5 }, (_, index) => axisMaximum - tickStep * index);
  const points = data.map((item, index) => ({
    ...item,
    x: PADDING_LEFT + (index / (data.length - 1)) * CHART_WIDTH,
    y: PADDING_TOP + CHART_HEIGHT - (item.value / axisMaximum) * CHART_HEIGHT
  }));
  const linePath = points.reduce((path, point, index) => (
    `${path}${index === 0 ? 'M' : 'L'} ${point.x} ${point.y} `
  ), '');
  const areaPath = `${linePath}L ${points[points.length - 1].x} ${PADDING_TOP + CHART_HEIGHT} L ${points[0].x} ${PADDING_TOP + CHART_HEIGHT} Z`;
  const currentMonth = data[data.length - 1]?.value || 0;
  const previousMonth = data[data.length - 2]?.value || 0;
  const growthAmount = currentMonth - previousMonth;
  const growthPercent = previousMonth > 0
    ? Math.round((growthAmount / previousMonth) * 100)
    : null;
  const previousPeriodLabel = {
    year: 'year',
    month: 'month',
    week: 'week',
    day: 'day'
  }[selectedPeriod];
  const growthLabel = previousMonth === 0
    ? (currentMonth > 0 ? 'New registrations' : 'No change')
    : `${growthAmount > 0 ? '+' : ''}${growthPercent}% vs previous ${previousPeriodLabel}`;
  const periodLabel = PERIOD_OPTIONS.find((option) => option.value === selectedPeriod)?.label.toLowerCase();

  return (
    <div className="growth-card">
      <div className="growth-header">
        <div>
          <h3 className="growth-title">Student Growth</h3>
          <p className="growth-subtitle">New registrations by {periodLabel}</p>
        </div>
        <div className="growth-header-actions">
          <label className="growth-period-label">
            <span className="sr-only">Registration growth period</span>
            <select
              className="growth-period-select"
              value={selectedPeriod}
              onChange={(event) => {
                setSelectedPeriod(event.target.value);
                setHoveredPoint(null);
              }}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          {!loading && !error && (
            <div className={`growth-summary ${growthAmount < 0 ? 'growth-summary-down' : ''}`}>
              <strong>{growthLabel}</strong>
              <span>
                {growthAmount > 0 ? '+' : ''}{formatCount(growthAmount)} students
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="chart-wrapper">
        {loading ? (
          <div className="growth-chart-message">Loading student growth...</div>
        ) : error ? (
          <div className="growth-chart-message" role="alert">{error}</div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              className="growth-svg"
              role="img"
              aria-label={`${PERIOD_OPTIONS.find((option) => option.value === selectedPeriod)?.label} student registrations`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="studentGrowthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {yAxisTicks.map((value) => {
                const y = PADDING_TOP + CHART_HEIGHT - (value / axisMaximum) * CHART_HEIGHT;
                return (
                  <g key={value}>
                    <text
                      x={PADDING_LEFT - 10}
                      y={y + 4}
                      textAnchor="end"
                      className="axis-label"
                    >
                      {formatCount(value)}
                    </text>
                    <line
                      x1={PADDING_LEFT}
                      y1={y}
                      x2={SVG_WIDTH - PADDING_RIGHT}
                      y2={y}
                      className="grid-line"
                    />
                  </g>
                );
              })}

              <text
                x="14"
                y={PADDING_TOP + CHART_HEIGHT / 2}
                textAnchor="middle"
                className="axis-title"
                transform={`rotate(-90 14 ${PADDING_TOP + CHART_HEIGHT / 2})`}
              >
                New students
              </text>

              {points.map((point, index) => (
                <text
                  key={point.month}
                  x={point.x}
                  y={SVG_HEIGHT - 32}
                  textAnchor="middle"
                  className="axis-label"
                >
                  {selectedPeriod === 'day' && index % 2 === 1 ? '' : point.month}
                </text>
              ))}

              <text
                x={PADDING_LEFT + CHART_WIDTH / 2}
                y={SVG_HEIGHT - 7}
                textAnchor="middle"
                className="axis-title"
              >
                Registration period ({periodLabel})
              </text>

              <path d={areaPath} fill="url(#studentGrowthGradient)" />
              <path
                d={linePath}
                fill="none"
                stroke="#6d28d9"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {points.map((point) => (
                <g
                  key={point.month}
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onFocus={() => setHoveredPoint(point)}
                  onBlur={() => setHoveredPoint(null)}
                  className="point-node"
                  tabIndex={0}
                  role="img"
                  aria-label={`${point.month}: ${formatCount(point.value)} new students`}
                >
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="5"
                    fill="#ffffff"
                    stroke="#6d28d9"
                    strokeWidth="2.5"
                  />
                </g>
              ))}
            </svg>

            {hoveredPoint && (
              <div
                className="chart-tooltip"
                style={{
                  left: `${(hoveredPoint.x / SVG_WIDTH) * 100}%`,
                  top: `${(hoveredPoint.y / SVG_HEIGHT) * 100}%`
                }}
                role="status"
              >
                {hoveredPoint.month}: <strong>{formatCount(hoveredPoint.value)} students</strong>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentGrowth;
