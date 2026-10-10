import React, { useState, useMemo } from 'react';

// Initial Directory of Students
const initialStudents = [
  { id: 'STU-1001', name: 'Aria Chen', course: 'Intro to Python', totalFee: 1200, paidFee: 800, pendingFee: 400, lastDate: '2024-08-30' },
  { id: 'STU-1002', name: 'Leo Novak', course: 'React basics', totalFee: 1500, paidFee: 500, pendingFee: 1000, lastDate: '2024-09-05' },
  { id: 'STU-1003', name: 'Sophia Patel', course: 'UI/UX Design', totalFee: 1100, paidFee: 1100, pendingFee: 0, lastDate: '2024-07-20' },
  { id: 'STU-1004', name: 'Liam Miller', course: 'Full Stack MERN', totalFee: 2000, paidFee: 1200, pendingFee: 800, lastDate: '2024-08-25' },
  { id: 'STU-1005', name: 'Emma Watson', course: 'DSA in Java', totalFee: 1400, paidFee: 1400, pendingFee: 0, lastDate: '2024-08-10' },
];

// Initial Transactions History
const initialTransactions = [
  {
    txnId: 'TXN-9081',
    studentName: 'Aria Chen',
    studentId: 'STU-1001',
    course: 'Intro to Python',
    totalAmount: 1200,
    amountPaid: 800,
    remainingBalance: 400,
    paymentMode: 'Online UPI',
    submittedTo: 'Accounts Desk (Mr. Sharma)',
    remarkNotice: '1st Installment cleared via UPI ref 890123',
    date: '2024-07-18',
    status: 'Completed',
  },
  {
    txnId: 'TXN-9082',
    studentName: 'Leo Novak',
    studentId: 'STU-1002',
    course: 'React basics',
    totalAmount: 1500,
    amountPaid: 500,
    remainingBalance: 1000,
    paymentMode: 'Card Payment',
    submittedTo: 'Mrs. Verma',
    remarkNotice: 'Balance due next month before 5th',
    date: '2024-07-12',
    status: 'Completed',
  },
  {
    txnId: 'TXN-9083',
    studentName: 'Sophia Patel',
    studentId: 'STU-1003',
    course: 'UI/UX Design',
    totalAmount: 1100,
    amountPaid: 1100,
    remainingBalance: 0,
    paymentMode: 'Net Banking',
    submittedTo: 'Admin Office',
    remarkNotice: 'Full course fee settled',
    date: '2024-07-20',
    status: 'Completed',
  },
];

const Finance = () => {
  const [students, setStudents] = useState(initialStudents);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States: Search & Select Student
  const [searchIdQuery, setSearchIdQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Form States: Financial & Meta Fields
  const [totalAmount, setTotalAmount] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online UPI');
  const [submittedTo, setSubmittedTo] = useState('');
  const [remarkNotice, setRemarkNotice] = useState('');

  // Search Results for Student ID / Name
  const searchResults = useMemo(() => {
    if (!searchIdQuery.trim()) return [];
    const q = searchIdQuery.toLowerCase().trim();
    return students.filter(
      (s) => s.id.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [searchIdQuery, students]);

  // Handle Selecting a Student from dropdown
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearchIdQuery(`${student.id} - ${student.name}`);
    setTotalAmount(student.totalFee);
    setPayAmount('');
    setIsDropdownOpen(false);
  };

  // Auto calculate pending fees (Total - Pay)
  const numericTotal = parseFloat(totalAmount) || 0;
  const numericPay = parseFloat(payAmount) || 0;
  const autoPendingFee = Math.max(0, numericTotal - numericPay);

  // Handle Fee Form Submission
  const handleFeeSubmit = (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      alert('Kripya student ID search karke student select karein.');
      return;
    }
    if (numericPay <= 0) {
      alert('Valid pay amount enter karein.');
      return;
    }
    if (numericPay > numericTotal) {
      alert('Pay amount total amount se jyada nahi ho sakta.');
      return;
    }
    if (!submittedTo.trim()) {
      alert('Kripya "Submitted To" (Staff/Receiver Name) enter karein.');
      return;
    }

    // 1. Update Student's record
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              totalFee: numericTotal,
              paidFee: s.paidFee + numericPay,
              pendingFee: autoPendingFee,
            }
          : s
      )
    );

    // 2. Add New Transaction entry
    const newTxn = {
      txnId: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      studentName: selectedStudent.name,
      studentId: selectedStudent.id,
      course: selectedStudent.course,
      totalAmount: numericTotal,
      amountPaid: numericPay,
      remainingBalance: autoPendingFee,
      paymentMode: paymentMethod,
      submittedTo: submittedTo.trim(),
      remarkNotice: remarkNotice.trim() || 'N/A',
      date: new Date().toISOString().split('T')[0],
      status: 'Completed',
    };

    setTransactions([newTxn, ...transactions]);

    // Reset Form
    setSelectedStudent(null);
    setSearchIdQuery('');
    setTotalAmount('');
    setPayAmount('');
    setSubmittedTo('');
    setRemarkNotice('');
    alert(`Fee of $${numericPay} successfully submitted for ${selectedStudent.name}!`);
  };

  // 1. Download Individual Fee Slip (Print to PDF Receipt)
  const handleDownloadSlip = (item) => {
    const slipWindow = window.open('', '_blank', 'width=750,height=600');
    if (!slipWindow) {
      alert('Please allow popups to download/print the fee receipt.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fee Receipt - ${item.txnId}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1f2937; margin: 0; }
            .receipt-box { border: 2px dashed #d1d5db; border-radius: 12px; padding: 30px; max-width: 620px; margin: auto; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #7c3aed; padding-bottom: 12px; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #7c3aed; }
            .meta-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
            .table-box { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table-box th, .table-box td { border: 1px solid #e5e7eb; padding: 10px; text-align: left; }
            .table-box th { background: #fbf6ec; }
            .total-badge { font-size: 18px; font-weight: bold; color: #15803d; }
            .notice-box { background: #faf6eb; border-left: 3px solid #7c3aed; padding: 8px 12px; font-size: 13px; margin-top: 14px; }
            .footer-msg { text-align: center; margin-top: 25px; font-size: 13px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="header">
              <div>
                <h2>ACADEMIC INSTITUTE</h2>
                <small>Official Student Fee Receipt</small>
              </div>
              <div style="text-align: right;">
                <strong>Receipt #: ${item.txnId}</strong><br />
                <small>Date: ${item.date}</small>
              </div>
            </div>

            <div class="meta-row">
              <span><strong>Student:</strong> ${item.studentName}</span>
              <span><strong>Student ID:</strong> ${item.studentId}</span>
            </div>
            <div class="meta-row">
              <span><strong>Course:</strong> ${item.course}</span>
              <span><strong>Payment Method:</strong> ${item.paymentMode}</span>
            </div>
            <div class="meta-row">
              <span><strong>Submitted To:</strong> ${item.submittedTo || 'Admin Desk'}</span>
            </div>

            <table class="table-box">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total Course Fee</td>
                  <td style="text-align: right;">$${item.totalAmount || item.amountPaid + item.remainingBalance}.00</td>
                </tr>
                <tr>
                  <td>Installment / Amount Paid Now</td>
                  <td style="text-align: right; color: #15803d; font-weight: bold;">$${item.amountPaid}.00</td>
                </tr>
                <tr>
                  <td><strong>Pending Due Balance</strong></td>
                  <td style="text-align: right; color: #dc2626; font-weight: bold;">$${item.remainingBalance}.00</td>
                </tr>
              </tbody>
            </table>

            ${item.remarkNotice && item.remarkNotice !== 'N/A' ? `<div class="notice-box"><strong>Remark/Notice:</strong> ${item.remarkNotice}</div>` : ''}

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
              <div>Status: <span style="color: #15803d; font-weight: bold;">PAID</span></div>
              <div class="total-badge">Received: $${item.amountPaid}.00</div>
            </div>

            <div class="footer-msg">
              <p>Thank you! This is an official digitally generated receipt.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    slipWindow.document.open();
    slipWindow.document.write(htmlContent);
    slipWindow.document.close();
  };

  // 2. Download All Students Fees in Excel / CSV
  const handleExportToExcel = () => {
    const headers = ['Student ID', 'Student Name', 'Course', 'Total Fee ($)', 'Paid Fee ($)', 'Pending Fee ($)', 'Due Date'];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.course}"`,
      s.totalFee,
      s.paidFee,
      s.pendingFee,
      s.lastDate,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `All_Student_Fees_Details_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Transactions by Search
  const filteredTxns = transactions.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      q === '' ||
      t.studentName.toLowerCase().includes(q) ||
      t.studentId.toLowerCase().includes(q) ||
      t.txnId.toLowerCase().includes(q) ||
      t.course.toLowerCase().includes(q) ||
      t.submittedTo.toLowerCase().includes(q)
    );
  });

  // Calculate totals for KPI
  const totalPending = students.reduce((acc, curr) => acc + curr.pendingFee, 0);
  const totalCollected = students.reduce((acc, curr) => acc + curr.paidFee, 0);

  return (
    <div className="finance-container">
      {/* Top Bar with Excel Export */}
      <div className="finance-top-bar">
        <div>
          <h2 className="finance-heading">Finance & Fee Management</h2>
          <p className="finance-sub">Search students by ID, record payments, auto-calculate pending dues, and print receipts</p>
        </div>

        <button className="excel-export-btn" onClick={handleExportToExcel}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download All Fees (Excel)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="finance-stats-grid">
        <div className="f-card total-paid">
          <span className="f-label">Total Fees Collected</span>
          <h3 className="f-val">${totalCollected.toLocaleString()}</h3>
          <span className="f-badge success">+15.8% collected this month</span>
        </div>

        <div className="f-card total-pending">
          <span className="f-label">Total Fees Pending</span>
          <h3 className="f-val">${totalPending.toLocaleString()}</h3>
          <span className="f-badge alert">Action required</span>
        </div>

        <div className="f-card pending-students">
          <span className="f-label">Students with Pending Dues</span>
          <h3 className="f-val">{students.filter((s) => s.pendingFee > 0).length}</h3>
          <span className="f-badge gray">Out of {students.length} enrolled students</span>
        </div>
      </div>

      {/* Main Action Grid: Integrated Fee Form + Pending Dues Watchlist */}
      <div className="finance-action-grid">
        {/* Integrated Fee Submission Form */}
        <div className="form-panel-card">
          <div className="form-title-group">
            <h3 className="panel-heading">Submit Student Fee</h3>
            <p className="panel-subtext">Search by Student ID, auto-compute pending dues & record deposit</p>
          </div>

          <form onSubmit={handleFeeSubmit} className="fee-form">
            {/* 1. Student ID Autocomplete Search */}
            <div className="form-group autocomplete-group">
              <label>Search & Select Student (By ID / Name)</label>
              <div className="search-input-wrapper">
                <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Type ID (e.g. STU-1001) or Name..."
                  value={searchIdQuery}
                  onChange={(e) => {
                    setSearchIdQuery(e.target.value);
                    setIsDropdownOpen(true);
                    if (selectedStudent) setSelectedStudent(null);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  required
                />
                {selectedStudent && (
                  <button
                    type="button"
                    className="clear-student-btn"
                    onClick={() => {
                      setSelectedStudent(null);
                      setSearchIdQuery('');
                      setTotalAmount('');
                      setPayAmount('');
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown List */}
              {isDropdownOpen && searchResults.length > 0 && (
                <ul className="student-dropdown-results">
                  {searchResults.map((item) => (
                    <li key={item.id} onClick={() => handleSelectStudent(item)}>
                      <span className="stu-id-tag">{item.id}</span>
                      <div className="stu-info-col">
                        <strong>{item.name}</strong>
                        <small>{item.course}</small>
                      </div>
                      <span className="stu-fee-tag">${item.totalFee}</span>
                    </li>
                  ))}
                </ul>
              )}

              {isDropdownOpen && searchIdQuery.trim() && searchResults.length === 0 && !selectedStudent && (
                <div className="no-result-dropdown">Koi student nahi mila "{searchIdQuery}" ID se</div>
              )}
            </div>

            {/* Selected Student Meta Information */}
            {selectedStudent && (
              <div className="selected-meta-box">
                <div><span>Course:</span> <strong>{selectedStudent.course}</strong></div>
                <div><span>Previous Paid:</span> <strong>${selectedStudent.paidFee}</strong></div>
                <div><span>Existing Due:</span> <strong className="due-text">${selectedStudent.pendingFee}</strong></div>
              </div>
            )}

            {/* 2. Total Amount & Pay Amount */}
            <div className="form-row">
              <div className="form-group">
                <label>Total Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1500"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Pay Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  max={numericTotal || undefined}
                  placeholder="e.g. 500"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* 3. Auto Pending Fees (Total - Pay) & Payment Method */}
            <div className="form-row">
              <div className="form-group">
                <label>Auto Pending Fees (Total - Pay)</label>
                <div className={`pending-display-box ${autoPendingFee > 0 ? 'has-due' : 'cleared'}`}>
                  <span className="currency-sign">$</span>
                  <span className="pending-value">{autoPendingFee.toFixed(2)}</span>
                  <span className="pending-status-pill">
                    {autoPendingFee === 0 && numericTotal > 0 ? 'Full Paid' : 'Due Balance'}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Online UPI">Online UPI / GPay / PhonePe</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Card Payment">Debit / Credit Card</option>
                  <option value="Cash">Cash Deposit</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>
            </div>

            {/* 4. Submitted To (Receiver/Staff Name) */}
            <div className="form-group">
              <label>Submitted To (Staff / Receiver Name)</label>
              <input
                type="text"
                placeholder="e.g. Accounts Desk (Mr. Sharma)"
                value={submittedTo}
                onChange={(e) => setSubmittedTo(e.target.value)}
                required
              />
            </div>

            {/* 5. Remark / Notice */}
            <div className="form-group">
              <label>Remark / Notice</label>
              <textarea
                rows="2"
                placeholder="e.g. 1st installment clear. Remaining balance due on next month 20th."
                value={remarkNotice}
                onChange={(e) => setRemarkNotice(e.target.value)}
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="submit-fee-btn"
              disabled={!selectedStudent || numericPay <= 0}
            >
              Record Fee & Generate Receipt
            </button>
          </form>
        </div>

        {/* Student Pending Fee Tracker */}
        <div className="pending-table-panel">
          <h3 className="panel-heading">Pending Dues Watchlist</h3>
          <p className="panel-subtext">Students with outstanding fees</p>

          <div className="pending-list">
            {students.filter((s) => s.pendingFee > 0).map((s) => (
              <div key={s.id} className="pending-item">
                <div className="pending-info">
                  <strong>{s.name}</strong>
                  <small>{s.course} • <span className="mono-id">{s.id}</span></small>
                </div>
                <div className="pending-amount">
                  <span className="due-badge">${s.pendingFee} Pending</span>
                  <small>Due by: {s.lastDate}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table with PDF Slip Download */}
      <div className="recent-transactions-card">
        <div className="card-top-header">
          <div>
            <h3 className="panel-heading">Recent Submitted Fees & Slips</h3>
            <p className="panel-subtext">Download individual fee receipts in PDF</p>
          </div>

          <div className="txn-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by student, ID, receipt, receiver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Paid Amount</th>
                <th>Pending Due</th>
                <th>Payment Mode</th>
                <th>Submitted To</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Slip / PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length > 0 ? (
                filteredTxns.map((t) => (
                  <tr key={t.txnId}>
                    <td className="tx-id-cell">{t.txnId}</td>
                    <td>
                      <div className="tx-student-meta">
                        <strong>{t.studentName}</strong>
                        <small className="mono-id">{t.studentId}</small>
                      </div>
                    </td>
                    <td>{t.course}</td>
                    <td className="amount-paid-cell">+${t.amountPaid}</td>
                    <td className="amount-remain-cell">${t.remainingBalance}</td>
                    <td>
                      <span className="pay-mode-pill">{t.paymentMode}</span>
                    </td>
                    <td className="submitted-to-cell">{t.submittedTo}</td>
                    <td>{t.date}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="download-slip-btn"
                        onClick={() => handleDownloadSlip(t)}
                        title="Print / Save PDF Receipt"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 6 2 18 2 18 9" />
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <rect width="12" height="8" x="6" y="14" />
                        </svg>
                        <span>PDF Slip</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-tx-data">
                    No transactions found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;