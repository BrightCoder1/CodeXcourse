import React, { useEffect, useMemo, useState } from "react";
import authService from "../services/authServices";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const formatMoney = (value) => currency.format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN");
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);

const normalizeStudent = (student) => {
  const name = [
    student.student_name,
    student.middle_name,
    student.last_name,
  ].filter(Boolean).join(" ");
  const totalFee = Number(student.total_fee) || 0;
  const paidFee = Number(student.paid_amount) || 0;

  return {
    ...student,
    mongoId: student._id,
    id: student.roll_number || student.admission_number || student.application_number || student._id,
    name: name || "Unnamed student",
    course: student.course || "—",
    totalFee,
    paidFee,
    pendingFee: Math.max(0, totalFee - paidFee),
    transactions: Array.isArray(student.payment_history) ? student.payment_history : [],
  };
};

const openPdfWindow = (title, content) => {
  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    window.alert("Please allow pop-ups to print or save the PDF.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; padding: 28px; }
          h1 { color: #5b21b6; font-size: 22px; margin: 0 0 6px; }
          .subtitle { color: #6b7280; font-size: 12px; margin: 0 0 20px; }
          .meta { display: flex; justify-content: space-between; gap: 12px; margin: 10px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 18px; }
          th, td { padding: 9px 10px; text-align: left; border: 1px solid #d1d5db; font-size: 12px; }
          th { background: #f3f0fa; }
          .amount { text-align: right; white-space: nowrap; }
          .received { color: #15803d; font-weight: 700; }
          .pending { color: #b91c1c; font-weight: 700; }
          .footer { margin-top: 24px; color: #6b7280; font-size: 11px; text-align: center; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        ${content}
        <script>window.onload = function () { window.print(); };</script>
      </body>
    </html>`);
  printWindow.document.close();
};

const Finance = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [receivedBy, setReceivedBy] = useState("");
  const [remark, setRemark] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    authService.getAllStudents()
      .then((data) => {
        if (active) setStudents(data.map(normalizeStudent));
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || error.message || "Failed to load students.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pendingStudents = useMemo(() => {
    const query = pendingSearch.trim().toLowerCase();
    return students.filter((student) => (
      student.pendingFee > 0 &&
      (!query || [
        student.id,
        student.application_number,
        student.admission_number,
        student.roll_number,
        student.name,
        student.course,
      ].some((value) => String(value || "").toLowerCase().includes(query)))
    ));
  }, [pendingSearch, students]);

  const searchResults = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return [];
    return students.filter((student) => [
      student.id,
      student.application_number,
      student.admission_number,
      student.roll_number,
      student.mongoId,
      student.name,
      student.course,
    ].some((value) => String(value || "").toLowerCase().includes(query))).slice(0, 8);
  }, [studentSearch, students]);

  const transactions = useMemo(() => students.flatMap((student) => (
    student.transactions.map((transaction, index) => ({
      txnId: transaction.receipt_number || `${student.mongoId}-${index}`,
      studentName: student.name,
      studentId: student.id,
      course: student.course,
      totalAmount: Number(transaction.total_fee ?? student.totalFee) || 0,
      amountPaid: Number(transaction.amount) || 0,
      remainingBalance: Number(transaction.pending_amount ?? student.pendingFee) || 0,
      paymentMode: transaction.payment_method || student.payment_method || "—",
      submittedTo: transaction.received_by || "—",
      remark: transaction.remark || "",
      date: transaction.paid_at,
    }))
  )), [students]);

  const filteredTransactions = useMemo(() => {
    const query = transactionSearch.trim().toLowerCase();
    return transactions
      .filter((transaction) => !query || [
        transaction.studentName,
        transaction.studentId,
        transaction.txnId,
        transaction.course,
        transaction.submittedTo,
      ].some((value) => String(value || "").toLowerCase().includes(query)))
      .sort((first, second) => new Date(second.date || 0) - new Date(first.date || 0));
  }, [transactionSearch, transactions]);

  const selectedTransactions = useMemo(() => {
    if (!selectedStudent) return [];
    return [...selectedStudent.transactions].sort(
      (first, second) => new Date(second.paid_at || 0) - new Date(first.paid_at || 0)
    );
  }, [selectedStudent]);

  const totalCollected = students.reduce((sum, student) => sum + student.paidFee, 0);
  const totalPending = students.reduce((sum, student) => sum + student.pendingFee, 0);
  const numericPay = Number(payAmount) || 0;
  const remainingAfterPayment = Math.max(0, (selectedStudent?.pendingFee || 0) - numericPay);

  const selectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.id} - ${student.name}`);
    setPayAmount("");
    setIsDropdownOpen(false);
    setSubmitError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedStudent) {
      setSubmitError("Please search and select a student first.");
      return;
    }
    if (!Number.isFinite(numericPay) || numericPay <= 0 || numericPay > selectedStudent.pendingFee) {
      setSubmitError("Payment must be greater than zero and cannot exceed the pending fee.");
      return;
    }
    if (!receivedBy.trim()) {
      setSubmitError("Please enter the name of the staff member receiving this payment.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");
    try {
      const savedStudent = normalizeStudent(await authService.submitStudentFee(
        selectedStudent.mongoId,
        {
          amount: numericPay,
          payment_method: paymentMethod,
          received_by: receivedBy.trim(),
          remark: remark.trim(),
        }
      ));

      setStudents((current) => current.map((student) => (
        student.mongoId === savedStudent.mongoId ? savedStudent : student
      )));
      setSelectedStudent(savedStudent);
      setPayAmount("");
      setReceivedBy("");
      setRemark("");
      setSuccessMessage(`Payment recorded successfully. Receipt: ${savedStudent.transactions.at(-1)?.receipt_number || "ready"}.`);
    } catch (error) {
      setSubmitError(error.response?.data?.message || error.message || "Unable to submit the fee.");
    } finally {
      setSubmitting(false);
    }
  };

  const downloadFeeListPdf = () => {
    const rows = students.map((student) => `<tr>
      <td>${escapeHtml(student.id)}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.course)}</td>
      <td class="amount">${escapeHtml(formatMoney(student.totalFee))}</td>
      <td class="amount received">${escapeHtml(formatMoney(student.paidFee))}</td>
      <td class="amount pending">${escapeHtml(formatMoney(student.pendingFee))}</td>
      <td>${student.pendingFee > 0 ? "Pending" : "Paid"}</td>
    </tr>`).join("");
    openPdfWindow("Current Student Fee List", `
      <h1>Current Student Fee List</h1>
      <p class="subtitle">Generated ${escapeHtml(new Date().toLocaleString("en-IN"))}</p>
      <div class="meta"><strong>Total collected: ${escapeHtml(formatMoney(totalCollected))}</strong>
        <strong>Total pending: ${escapeHtml(formatMoney(totalPending))}</strong></div>
      <table>
        <thead><tr><th>Student ID</th><th>Student Name</th><th>Course</th><th class="amount">Total Fee</th>
          <th class="amount">Paid</th><th class="amount">Pending</th><th>Status</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7">No students found.</td></tr>'}</tbody>
      </table>
      <p class="footer">Current fee balances from the student database.</p>
    `);
  };

  const downloadPaymentsPdf = () => {
    const rows = filteredTransactions.map((transaction) => `<tr>
      <td>${escapeHtml(transaction.txnId)}</td>
      <td>${escapeHtml(transaction.studentId)}</td>
      <td>${escapeHtml(transaction.studentName)}</td>
      <td>${escapeHtml(transaction.course)}</td>
      <td>${escapeHtml(formatDate(transaction.date))}</td>
      <td>${escapeHtml(transaction.paymentMode)}</td>
      <td class="amount received">${escapeHtml(formatMoney(transaction.amountPaid))}</td>
      <td class="amount pending">${escapeHtml(formatMoney(transaction.remainingBalance))}</td>
      <td>${escapeHtml(transaction.submittedTo)}</td>
    </tr>`).join("");
    openPdfWindow("Submitted Fee Payments", `
      <h1>Submitted Fee Payments</h1>
      <p class="subtitle">Generated ${escapeHtml(new Date().toLocaleString("en-IN"))}${transactionSearch.trim() ? ` · Filter: ${escapeHtml(transactionSearch.trim())}` : ""}</p>
      <table>
        <thead><tr><th>Receipt</th><th>Student ID</th><th>Student</th><th>Course</th><th>Date</th>
          <th>Method</th><th class="amount">Paid</th><th class="amount">Pending</th><th>Received by</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="9">No fee payments found.</td></tr>'}</tbody>
      </table>
      <p class="footer">Saved student payment history.</p>
    `);
  };

  const downloadStudentHistoryPdf = () => {
    if (!selectedStudent) return;
    const rows = selectedTransactions.map((transaction) => `<tr>
      <td>${escapeHtml(transaction.receipt_number || "—")}</td>
      <td>${escapeHtml(formatDate(transaction.paid_at))}</td>
      <td>${escapeHtml(transaction.payment_method || "—")}</td>
      <td>${escapeHtml(transaction.received_by || "—")}</td>
      <td class="amount received">${escapeHtml(formatMoney(transaction.amount))}</td>
      <td class="amount pending">${escapeHtml(formatMoney(transaction.pending_amount))}</td>
      <td>${escapeHtml(transaction.remark || "—")}</td>
    </tr>`).join("");
    openPdfWindow(`Fee History - ${selectedStudent.id}`, `
      <h1>Student Fee History</h1>
      <p class="subtitle">${escapeHtml(selectedStudent.name)} · Student ID: ${escapeHtml(selectedStudent.id)}</p>
      <div class="meta"><span>Course: ${escapeHtml(selectedStudent.course)}</span>
        <span>Total fee: ${escapeHtml(formatMoney(selectedStudent.totalFee))}</span></div>
      <div class="meta"><strong>Paid: ${escapeHtml(formatMoney(selectedStudent.paidFee))}</strong>
        <strong>Pending: ${escapeHtml(formatMoney(selectedStudent.pendingFee))}</strong></div>
      <table>
        <thead><tr><th>Receipt</th><th>Date</th><th>Method</th><th>Received by</th>
          <th class="amount">Paid</th><th class="amount">Pending</th><th>Remark</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="7">No fee payments recorded.</td></tr>'}</tbody>
      </table>
    `);
  };

  const downloadReceiptPdf = (transaction) => {
    openPdfWindow(`Fee Receipt - ${transaction.txnId}`, `
      <h1>Fee Payment Receipt</h1>
      <p class="subtitle">Receipt: ${escapeHtml(transaction.txnId)} · ${escapeHtml(formatDate(transaction.date))}</p>
      <div class="meta"><span><strong>Student:</strong> ${escapeHtml(transaction.studentName)}</span>
        <span><strong>Student ID:</strong> ${escapeHtml(transaction.studentId)}</span></div>
      <div class="meta"><span><strong>Course:</strong> ${escapeHtml(transaction.course)}</span>
        <span><strong>Payment method:</strong> ${escapeHtml(transaction.paymentMode)}</span></div>
      <div class="meta"><span><strong>Received by:</strong> ${escapeHtml(transaction.submittedTo)}</span></div>
      <table>
        <thead><tr><th>Description</th><th class="amount">Amount</th></tr></thead>
        <tbody>
          <tr><td>Total course fee</td><td class="amount">${escapeHtml(formatMoney(transaction.totalAmount))}</td></tr>
          <tr><td>Paid now</td><td class="amount received">${escapeHtml(formatMoney(transaction.amountPaid))}</td></tr>
          <tr><td>Pending balance</td><td class="amount pending">${escapeHtml(formatMoney(transaction.remainingBalance))}</td></tr>
          ${transaction.remark ? `<tr><td>Remark</td><td>${escapeHtml(transaction.remark)}</td></tr>` : ""}
        </tbody>
      </table>
      <p class="footer">Thank you. This is a digitally generated fee receipt.</p>
    `);
  };

  return (
    <div className="finance-container">
      <div className="finance-top-bar">
        <div>
          <h2 className="finance-heading">Finance &amp; Fee Management</h2>
          <p className="finance-sub">Submit student fees, track payment history, and download PDF reports</p>
        </div>
        <button className="excel-export-btn" type="button" onClick={downloadFeeListPdf}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Download Current Fee List (PDF)</span>
        </button>
      </div>

      {loadError && <div className="finance-message error" role="alert">{loadError}</div>}

      <div className="finance-stats-grid">
        <div className="f-card total-paid">
          <span className="f-label">Total Fees Collected</span>
          <h3 className="f-val">{formatMoney(totalCollected)}</h3>
          <span className="f-badge success">Collected from student records</span>
        </div>
        <div className="f-card total-pending">
          <span className="f-label">Total Fees Pending</span>
          <h3 className="f-val">{formatMoney(totalPending)}</h3>
          <span className="f-badge alert">Across all enrolled students</span>
        </div>
        <div className="f-card pending-students">
          <span className="f-label">Students with Pending Dues</span>
          <h3 className="f-val">{students.filter((student) => student.pendingFee > 0).length}</h3>
          <span className="f-badge gray">Out of {students.length} enrolled students</span>
        </div>
      </div>

      <div className="finance-action-grid">
        <div className="form-panel-card">
          <div className="form-title-group">
            <h3 className="panel-heading">Submit Student Fee</h3>
            <p className="panel-subtext">Select a student and record a payment to update the database</p>
          </div>

          <form onSubmit={handleSubmit} className="fee-form">
            <div className="form-group autocomplete-group">
              <label htmlFor="finance-student-search">Search &amp; Select Student (ID / Name)</label>
              <div className="search-input-wrapper">
                <svg className="search-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  id="finance-student-search"
                  type="text"
                  placeholder="Type application, admission, roll ID or name"
                  value={studentSearch}
                  onChange={(event) => {
                    setStudentSearch(event.target.value);
                    setSelectedStudent(null);
                    setIsDropdownOpen(true);
                    setSuccessMessage("");
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  autoComplete="off"
                />
                {selectedStudent && (
                  <button
                    type="button"
                    className="clear-student-btn"
                    aria-label="Clear selected student"
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch("");
                      setPayAmount("");
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
              {isDropdownOpen && searchResults.length > 0 && (
                <ul className="student-dropdown-results">
                  {searchResults.map((student) => (
                    <li key={student.mongoId} onMouseDown={() => selectStudent(student)}>
                      <span className="stu-id-tag">{student.id}</span>
                      <div className="stu-info-col">
                        <strong>{student.name}</strong>
                        <small>{student.course} · Pending {formatMoney(student.pendingFee)}</small>
                      </div>
                      <span className="stu-fee-tag">{formatMoney(student.totalFee)}</span>
                    </li>
                  ))}
                </ul>
              )}
              {isDropdownOpen && studentSearch.trim() && searchResults.length === 0 && !loading && (
                <div className="no-result-dropdown">No students found for “{studentSearch}”</div>
              )}
            </div>

            {selectedStudent && (
              <>
                <div className="selected-meta-box">
                  <div><span>Student:</span> <strong>{selectedStudent.name}</strong></div>
                  <div><span>Student ID:</span> <strong>{selectedStudent.id}</strong></div>
                  <div><span>Course:</span> <strong>{selectedStudent.course}</strong></div>
                  <div><span>Total fee:</span> <strong>{formatMoney(selectedStudent.totalFee)}</strong></div>
                  <div><span>Previously paid:</span> <strong>{formatMoney(selectedStudent.paidFee)}</strong></div>
                  <div><span>Current due:</span> <strong className="due-text">{formatMoney(selectedStudent.pendingFee)}</strong></div>
                  {selectedStudent.academic_session && (
                    <div><span>Session:</span> <strong>{selectedStudent.academic_session}</strong></div>
                  )}
                  {selectedStudent.phone_number && (
                    <div><span>Phone:</span> <strong>{selectedStudent.phone_number}</strong></div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fee-amount">Payment Amount (₹)</label>
                    <input
                      id="fee-amount"
                      type="number"
                      min="0.01"
                      max={selectedStudent.pendingFee}
                      step="0.01"
                      placeholder="Enter amount"
                      value={payAmount}
                      onChange={(event) => setPayAmount(event.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fee-method">Payment Method</label>
                    <select id="fee-method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                      <option value="Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Pending After This Payment</label>
                  <div className={`pending-display-box ${remainingAfterPayment > 0 ? "has-due" : "cleared"}`}>
                    <span className="currency-sign">₹</span>
                    <span className="pending-value">{remainingAfterPayment.toFixed(2)}</span>
                    <span className="pending-status-pill">{remainingAfterPayment > 0 ? "Due Balance" : "Fully Paid"}</span>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="fee-receiver">Received By</label>
                  <input
                    id="fee-receiver"
                    type="text"
                    maxLength="100"
                    placeholder="Staff / receiver name"
                    value={receivedBy}
                    onChange={(event) => setReceivedBy(event.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="fee-remark">Remark (optional)</label>
                  <textarea
                    id="fee-remark"
                    rows="2"
                    maxLength="500"
                    placeholder="Payment note"
                    value={remark}
                    onChange={(event) => setRemark(event.target.value)}
                  />
                </div>
              </>
            )}

            {submitError && <div className="finance-message error" role="alert">{submitError}</div>}
            {successMessage && <div className="finance-message success" role="status">{successMessage}</div>}
            <button
              type="submit"
              className="submit-fee-btn"
              disabled={!selectedStudent || numericPay <= 0 || numericPay > selectedStudent.pendingFee || submitting}
            >
              {submitting ? "Saving Payment..." : "Submit Fee & Generate Receipt"}
            </button>
          </form>

          {selectedStudent && (
            <div className="student-fee-history">
              <div className="fee-history-header">
                <div>
                  <h4 className="panel-heading">Fee Payment History</h4>
                  <p className="panel-subtext">{selectedTransactions.length} saved payment(s)</p>
                </div>
                <button type="button" className="download-slip-btn" onClick={downloadStudentHistoryPdf}>
                  Download History PDF
                </button>
              </div>
              <div className="table-responsive">
                <table className="finance-table">
                  <thead><tr><th>Receipt</th><th>Date</th><th>Paid</th><th>Pending</th><th>Method</th></tr></thead>
                  <tbody>
                    {selectedTransactions.length ? selectedTransactions.map((payment, index) => (
                      <tr key={payment.receipt_number || `${payment.paid_at}-${index}`}>
                        <td className="tx-id-cell">{payment.receipt_number || "—"}</td>
                        <td>{formatDate(payment.paid_at)}</td>
                        <td className="amount-paid-cell">{formatMoney(payment.amount)}</td>
                        <td className="amount-remain-cell">{formatMoney(payment.pending_amount)}</td>
                        <td><span className="pay-mode-pill">{payment.payment_method || "—"}</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="no-tx-data">No fee payments have been recorded for this student.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="pending-table-panel">
          <h3 className="panel-heading">Pending Students</h3>
          <p className="panel-subtext">Search by student ID or name, then click to select for payment</p>
          <div className="pending-search-box">
            <input
              type="search"
              aria-label="Search students with pending fees"
              placeholder="Search pending student ID or name"
              value={pendingSearch}
              onChange={(event) => setPendingSearch(event.target.value)}
            />
          </div>
          <div className="pending-list">
            {loading ? <p className="no-pending-students">Loading students...</p> : null}
            {!loading && pendingStudents.map((student) => (
              <button
                type="button"
                key={student.mongoId}
                className={`pending-item pending-item-button ${selectedStudent?.mongoId === student.mongoId ? "selected" : ""}`}
                onClick={() => selectStudent(student)}
              >
                <span className="pending-info">
                  <strong>{student.name}</strong>
                  <small>{student.course} · <span className="mono-id">{student.id}</span></small>
                </span>
                <span className="pending-amount">
                  <span className="due-badge">{formatMoney(student.pendingFee)} Due</span>
                  <small>Click to submit</small>
                </span>
              </button>
            ))}
            {!loading && !pendingStudents.length && (
              <p className="no-pending-students">
                {pendingSearch ? "No pending students match your search." : "No students have pending fees."}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="recent-transactions-card">
        <div className="card-top-header">
          <div>
            <h3 className="panel-heading">Submitted Fee Payments</h3>
            <p className="panel-subtext">Payment history saved in the student database · Print receipts as PDF</p>
          </div>
          <div className="txn-search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              aria-label="Search fee payments"
              placeholder="Search by student, ID, receipt..."
              value={transactionSearch}
              onChange={(event) => setTransactionSearch(event.target.value)}
            />
          </div>
          <button type="button" className="download-slip-btn" onClick={downloadPaymentsPdf}>
            Download Payments PDF
          </button>
        </div>
        <div className="table-responsive">
          <table className="finance-table">
            <thead>
              <tr><th>Receipt ID</th><th>Student</th><th>Course</th><th>Paid Amount</th><th>Pending Due</th><th>Payment Mode</th><th>Received By</th><th>Date</th><th style={{ textAlign: "right" }}>Receipt</th></tr>
            </thead>
            <tbody>
              {filteredTransactions.length ? filteredTransactions.map((transaction) => (
                <tr key={transaction.txnId}>
                  <td className="tx-id-cell">{transaction.txnId}</td>
                  <td><div className="tx-student-meta"><strong>{transaction.studentName}</strong><small className="mono-id">{transaction.studentId}</small></div></td>
                  <td>{transaction.course}</td>
                  <td className="amount-paid-cell">+{formatMoney(transaction.amountPaid)}</td>
                  <td className="amount-remain-cell">{formatMoney(transaction.remainingBalance)}</td>
                  <td><span className="pay-mode-pill">{transaction.paymentMode}</span></td>
                  <td className="submitted-to-cell">{transaction.submittedTo}</td>
                  <td>{formatDate(transaction.date)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="download-slip-btn" type="button" onClick={() => downloadReceiptPdf(transaction)} title="Print or save PDF receipt">
                      PDF Slip
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="9" className="no-tx-data">
                  {loading ? "Loading payment history..." : transactionSearch ? "No payments match your search." : "No fee payments have been recorded yet."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Finance;
