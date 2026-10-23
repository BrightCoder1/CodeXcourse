import React, { useEffect, useMemo, useState } from 'react';
import authService from '../services/authServices';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);

const escapeXml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const createWorksheet = (name, rows) => `
  <Worksheet ss:Name="${escapeXml(name)}">
    <Table>
      ${rows.map((row) => `<Row>${row.map((value) => {
        const type = typeof value === 'number' && Number.isFinite(value) ? 'Number' : 'String';
        return `<Cell><Data ss:Type="${type}">${escapeXml(value)}</Data></Cell>`;
      }).join('')}</Row>`).join('')}
    </Table>
  </Worksheet>`;

const getStudentAdmissionDate = (student) => {
  const value = student.admission_date || student.createdAt;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const Analytics = () => {
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [studentsError, setStudentsError] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedDay, setSelectedDay] = useState('all');
  const [exportError, setExportError] = useState('');

  useEffect(() => {
    let active = true;

    authService.getAllStudents()
      .then((allStudents) => {
        if (active) setStudents(allStudents);
      })
      .catch((error) => {
        if (active) {
          setStudentsError(
            error.response?.data?.message ||
              error.message ||
              'Failed to load student fee data.'
          );
        }
      })
      .finally(() => {
        if (active) setLoadingStudents(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const availableYears = useMemo(
    () => Array.from(new Set(
      students
        .map(getStudentAdmissionDate)
        .filter(Boolean)
        .map((date) => date.getFullYear())
    )).sort((left, right) => right - left),
    [students]
  );

  const filteredStudents = useMemo(
    () => students.filter((student) => {
      if (selectedYear === 'all' && selectedMonth === 'all' && selectedDay === 'all') {
        return true;
      }

      const date = getStudentAdmissionDate(student);
      if (!date) return false;

      return (
        (selectedYear === 'all' || date.getFullYear() === Number(selectedYear)) &&
        (selectedMonth === 'all' || date.getMonth() + 1 === Number(selectedMonth)) &&
        (selectedDay === 'all' || date.getDate() === Number(selectedDay))
      );
    }),
    [students, selectedYear, selectedMonth, selectedDay]
  );

  const feeData = useMemo(() => {
    const courses = new Map();
    let totalFees = 0;
    let collected = 0;
    let outstanding = 0;

    filteredStudents.forEach((student) => {
      const courseName = student.course?.trim() || 'Unspecified course';
      const totalFee = Math.max(0, Number(student.total_fee) || 0);
      const paidAmount = Math.max(0, Number(student.paid_amount) || 0);
      const pendingAmount = Math.max(0, totalFee - paidAmount);
      totalFees += totalFee;
      collected += paidAmount;
      outstanding += pendingAmount;
      const courseFees = courses.get(courseName) || {
        course: courseName,
        totalFees: 0,
        collected: 0,
        outstanding: 0
      };

      courseFees.totalFees += totalFee;
      courseFees.collected += paidAmount;
      courseFees.outstanding += pendingAmount;
      courses.set(courseName, courseFees);
    });

    return {
      courses: Array.from(courses.values()).sort(
        (left, right) =>
          right.collected + right.outstanding - left.collected - left.outstanding
      ),
      totalFees,
      collected,
      outstanding
    };
  }, [filteredStudents]);

  const maxFeeAmount = Math.max(
    1,
    ...feeData.courses.map((item) => Math.max(item.collected, item.outstanding))
  );
  const feeAxisTicks = Array.from({ length: 5 }, (_, index) =>
    (maxFeeAmount * (4 - index)) / 4
  );
  const collectionRate = feeData.totalFees
    ? Math.min(100, (feeData.collected / feeData.totalFees) * 100)
    : 0;
  const growthStats = [
    { id: 1, title: 'Registered Students', value: filteredStudents.length.toLocaleString('en-IN'), period: 'Students in selected period' },
    { id: 2, title: 'Total Fees', value: formatCurrency(feeData.totalFees), period: 'Expected from students' },
    { id: 3, title: 'Fees Collected', value: formatCurrency(feeData.collected), period: 'Recorded payments' },
    { id: 4, title: 'Outstanding Fees', value: formatCurrency(feeData.outstanding), period: 'Remaining balance' }
  ];
  const summaryValue = (value) =>
    loadingStudents ? 'Loading...' : studentsError ? 'Unavailable' : value;

  const handleExport = () => {
    try {
      setExportError('');
      const monthLabel = selectedMonth === 'all'
        ? 'All months'
        : new Intl.DateTimeFormat('en', { month: 'long' }).format(
          new Date(2024, Number(selectedMonth) - 1, 1)
        );
      const filterDescription = [
        selectedYear === 'all' ? 'All years' : `Year ${selectedYear}`,
        monthLabel,
        selectedDay === 'all' ? 'All days' : `Day ${selectedDay}`
      ].join(', ');
      const workbook = `<?xml version="1.0"?>
        <?mso-application progid="Excel.Sheet"?>
        <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
          ${createWorksheet('Summary', [
            ['Student Fee Analytics'],
            ['Date filter', filterDescription],
            ['Registered students', filteredStudents.length],
            ['Total fees', feeData.totalFees],
            ['Fees collected', feeData.collected],
            ['Outstanding fees', feeData.outstanding],
            ['Collection rate (%)', Number(collectionRate.toFixed(2))]
          ])}
          ${createWorksheet('Course Fees', [
            ['Course', 'Fees Collected (INR)', 'Outstanding Fees (INR)', 'Total Fees (INR)'],
            ...feeData.courses.map((course) => [
              course.course,
              course.collected,
              course.outstanding,
              course.totalFees
            ]),
            ['Total', feeData.collected, feeData.outstanding, feeData.totalFees]
          ])}
        </Workbook>`;
      const blob = new Blob(['\uFEFF', workbook], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `student-fee-analytics-${new Date().toISOString().slice(0, 10)}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    } catch (error) {
      console.error('Failed to export student fee analytics:', error);
      setExportError(error instanceof Error ? error.message : 'Failed to export the report.');
    }
  };

  return (
    <div className="analytics-container">
      {/* Header with Filters */}
      <div className="analytics-header">
        <div>
          <h2 className="analytics-title">Student Fee Analytics</h2>
          <p className="analytics-subtitle">
            Student fee collection and outstanding balances by course
          </p>
        </div>

        <div className="analytics-actions">
          <button
            type="button"
            className="export-report-btn"
            onClick={handleExport}
            disabled={loadingStudents || Boolean(studentsError)}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Report
          </button>
        </div>
      </div>
      {exportError && <p className="fee-export-error" role="alert">{exportError}</p>}

      {/* Top 4 Growth Highlight Cards */}
      <div className="growth-stats-grid">
        {growthStats.map((stat) => (
          <div key={stat.id} className="growth-stat-card">
            <span className="stat-title">{stat.title}</span>
            <div className="stat-body">
              <span className="stat-value">{summaryValue(stat.value)}</span>
              <div className="stat-period">{stat.period}</div>
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
              <h3 className="panel-title">Fees Collected vs. Outstanding</h3>
              <p className="panel-sub">Amounts for students admitted in the selected period</p>
            </div>
            <div className="fee-chart-controls">
              <div className="fee-date-filters" role="group" aria-label="Filter fee analytics by admission date">
                <select
                  className="fee-date-filter"
                  aria-label="Filter by year"
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                >
                  <option value="all">All years</option>
                  {availableYears.map((year) => (
                    <option value={year} key={year}>{year}</option>
                  ))}
                </select>
                <select
                  className="fee-date-filter"
                  aria-label="Filter by month"
                  value={selectedMonth}
                  onChange={(event) => setSelectedMonth(event.target.value)}
                >
                  <option value="all">All months</option>
                  {Array.from({ length: 12 }, (_, index) => (
                    <option value={index + 1} key={index}>
                      {new Intl.DateTimeFormat('en', { month: 'long' }).format(new Date(2024, index, 1))}
                    </option>
                  ))}
                </select>
                <select
                  className="fee-date-filter"
                  aria-label="Filter by day"
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(event.target.value)}
                >
                  <option value="all">All days</option>
                  {Array.from({ length: 31 }, (_, index) => (
                    <option value={index + 1} key={index}>{index + 1}</option>
                  ))}
                </select>
              </div>
              <div className="legend-group">
                <div className="legend-item">
                  <span className="legend-dot dot-primary"></span>
                  <span>Collected</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-secondary"></span>
                  <span>Outstanding</span>
                </div>
              </div>
            </div>
          </div>

          {loadingStudents ? (
            <div className="fee-chart-message">Loading student fee data...</div>
          ) : studentsError ? (
            <div className="fee-chart-message" role="alert">{studentsError}</div>
          ) : feeData.courses.length ? (
            <div className="fee-chart-layout">
              <div className="fee-y-axis" aria-hidden="true">
                  <span className="fee-y-axis-title">Fees (INR)</span>
                  <div className="fee-y-axis-ticks">
                    {feeAxisTicks.map((tick, index) => (
                      <span key={index}>{formatCurrency(tick)}</span>
                    ))}
                  </div>
              </div>
              <div className="fee-chart-scroll">
                  <div className="fee-chart-container">
                    {feeData.courses.map((item) => (
                      <div className="fee-chart-column" key={item.course}>
                        <div
                          className="fee-bars-group"
                          role="group"
                          tabIndex={0}
                          aria-label={`${item.course}: ${formatCurrency(item.collected)} collected, ${formatCurrency(item.outstanding)} outstanding`}
                        >
                          <div
                            className="fee-chart-tooltip"
                            role="status"
                          >
                            <strong>{item.course}</strong>
                            <span><i className="tooltip-dot tooltip-dot-collected" />Collected: {formatCurrency(item.collected)}</span>
                            <span><i className="tooltip-dot tooltip-dot-outstanding" />Outstanding: {formatCurrency(item.outstanding)}</span>
                          </div>
                          <div
                            className="fee-bar fee-bar-collected"
                            style={{ height: `${(item.collected / maxFeeAmount) * 100}%` }}
                          />
                          <div
                            className="fee-bar fee-bar-outstanding"
                            style={{ height: `${(item.outstanding / maxFeeAmount) * 100}%` }}
                          />
                        </div>
                        <span className="fee-chart-label" title={item.course}>
                          {item.course}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="fee-x-axis-title">Course</div>
              </div>
            </div>
          ) : (
            <div className="fee-chart-message">No student fee data is available for the selected date.</div>
          )}
        </div>

        {/* Growth Drivers / Side Breakdown */}
        <div className="breakdown-panel">
          <h3 className="panel-title">Fee Collection Summary</h3>
          <p className="panel-sub">Collected and outstanding student fees</p>

          <div className="channel-list">
            <div className="channel-item">
              <div className="channel-meta">
                <span className="channel-name">Fees collected</span>
                <span className="channel-val">{summaryValue(formatCurrency(feeData.collected))}</span>
              </div>
              <div className="prog-track">
                <div className="prog-bar" style={{ width: `${collectionRate}%`, backgroundColor: '#7c3aed' }}></div>
              </div>
            </div>

            <div className="channel-item">
              <div className="channel-meta">
                <span className="channel-name">Outstanding fees</span>
                <span className="channel-val">{summaryValue(formatCurrency(feeData.outstanding))}</span>
              </div>
              <div className="prog-track">
                <div className="prog-bar" style={{ width: `${100 - collectionRate}%`, backgroundColor: '#c084fc' }}></div>
              </div>
            </div>
          </div>

          <div className="growth-summary-box">
            <h4>Collection rate</h4>
            <p role={studentsError ? 'alert' : undefined}>
              {studentsError || (loadingStudents
                ? 'Loading fee collection summary...'
                : `${collectionRate.toFixed(1)}% of recorded student fees have been collected from ${filteredStudents.length} students in the selected period.`)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;