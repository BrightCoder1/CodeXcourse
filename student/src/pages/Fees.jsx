import { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import './Fees.css';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const LOGIN_URL = import.meta.env.VITE_PUBLIC_APP_URL || 'http://localhost:5173/login';

const formatAmount = (amount) => (
  `INR ${Number(amount || 0).toLocaleString('en-IN')}`
);

const formatDate = (dateValue) => {
  if (!dateValue) return '—';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const formatSubmissionDateTime = (dateValue) => {
  if (!dateValue) return 'Not recorded';

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 'Not recorded';

  return `${new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  }).format(date)} IST`;
};

const escapePdfText = (value) => String(value)
  .replace(/[^\x20-\x7E]/g, '')
  .replace(/([\\()])/g, '\\$1');

const createReceiptPdf = (payment, student, studentName) => {
  const totalFee = Number(payment.total_fee ?? student.total_fee) || 0;
  const balance = Number(payment.pending_amount ?? student.pending_amount) || 0;
  const lines = [
    'CodeXCourse',
    'FEE PAYMENT RECEIPT',
    `Receipt number: ${payment.receipt_number || 'Not available'}`,
    `Student: ${studentName}`,
    `Email: ${student.email || 'Not available'}`,
    `Application number: ${student.application_number || 'Not available'}`,
    `Course: ${student.course || 'Not available'}`,
    `Amount paid: ${formatAmount(payment.amount)}`,
    `Fee submission date/time: ${formatSubmissionDateTime(payment.paid_at)}`,
    `Payment method: ${payment.payment_method || 'Not available'}`,
    `Received by: ${payment.received_by || 'Not available'}`,
    `Total course fee: ${formatAmount(totalFee)}`,
    `Balance after payment: ${formatAmount(balance)}`,
    ...(payment.remark ? [`Remark: ${payment.remark}`] : []),
    'Status: PAID',
    'Signature: ____________________________________',
    'This is a digitally generated receipt.',
  ];

  const textCommands = lines
    .map((line, index) => `(${escapePdfText(line)}) Tj${index < lines.length - 1 ? '\n0 -32 Td' : ''}`)
    .join('\n');
  const content = `BT\n/F1 16 Tf\n50 790 Td\n${textCommands}\nET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${new TextEncoder().encode(content).length} >>\nstream\n${content}\nendstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const downloadReceipt = (payment, student, studentName) => {
  const receiptUrl = URL.createObjectURL(createReceiptPdf(payment, student, studentName));
  const downloadLink = document.createElement('a');
  downloadLink.href = receiptUrl;
  downloadLink.download = `${payment.receipt_number || 'fee-receipt'}.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(receiptUrl), 1000);
};

export default function Fees({ student }) {
  const [feeStudent, setFeeStudent] = useState(student);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [refreshError, setRefreshError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isActive = true;
    let isFetching = false;

    const loadFees = async () => {
      if (isFetching) return;
      isFetching = true;

      try {
        const response = await fetch(`${API_URL}/student/fees`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
          window.location.assign(LOGIN_URL);
          return;
        }
        if (!response.ok || !data.success || !data.student) {
          throw new Error(data.message || 'Unable to refresh your fee details.');
        }
        if (isActive) {
          setFeeStudent(data.student);
          setRefreshError('');
        }
      } catch (error) {
        if (isActive) {
          setRefreshError(error.message || 'Unable to refresh your fee details.');
        }
      } finally {
        isFetching = false;
        if (isActive) {
          setIsRefreshing(false);
        }
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        loadFees();
      }
    };

    loadFees();
    const intervalId = window.setInterval(refreshWhenVisible, 10000);
    window.addEventListener('focus', loadFees);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.removeEventListener('focus', loadFees);
    };
  }, [retryCount]);

  const studentDetails = feeStudent || student;
  const studentName = [
    studentDetails.student_name,
    studentDetails.middle_name,
    studentDetails.last_name,
  ]
    .filter(Boolean)
    .join(' ') || 'Student';
  const payments = Array.isArray(studentDetails.payment_history)
    ? [...studentDetails.payment_history].sort(
      (first, second) => new Date(second.paid_at || 0) - new Date(first.paid_at || 0),
    )
    : [];
  const totalFee = Number(studentDetails.total_fee) || 0;
  const historyPaidAmount = payments.reduce(
    (total, payment) => total + (Number(payment.amount) || 0),
    0,
  );
  const paidAmount = Number(studentDetails.paid_amount) || historyPaidAmount;
  const pendingAmount = Math.max(totalFee - paidAmount, 0);
  const paymentStatus = pendingAmount === 0 && totalFee > 0
    ? 'Paid'
    : paidAmount > 0
      ? 'Partial'
      : 'Pending';
  const statusClass = paymentStatus === 'Paid' ? 'paid' : 'pending';
  const refreshFees = () => {
    setIsRefreshing(true);
    setRetryCount((count) => count + 1);
  };

  return (
    <section className="fees-page">
      <header className="fees-header">
        <div>
          <p className="fees-eyebrow">STUDENT ACCOUNT</p>
          <h1>Fees &amp; Payments</h1>
          <p className="fees-subtitle">Check your fee balance and download receipts for completed payments.</p>
        </div>
        <span className="fees-account-name">
          <Icon name="user" size={18} />
          {studentName}
        </span>
      </header>

      {refreshError && (
        <div className="fees-refresh-error" role="alert">
          <span>{refreshError}</span>
          <button type="button" onClick={refreshFees}>
            Retry
          </button>
        </div>
      )}
      {!refreshError && isRefreshing && (
        <p className="fees-refresh-status" role="status">Loading latest fee details...</p>
      )}

      <div className="fees-summary-grid">
        <article className="fees-summary-card">
          <span className="fees-summary-icon total"><Icon name="credit-card" size={21} /></span>
          <div>
            <p>Total course fee</p>
            <strong>{formatAmount(totalFee)}</strong>
          </div>
        </article>
        <article className="fees-summary-card">
          <span className="fees-summary-icon paid"><Icon name="check-circle" size={21} /></span>
          <div>
            <p>Amount paid</p>
            <strong>{formatAmount(paidAmount)}</strong>
          </div>
        </article>
        <article className="fees-summary-card">
          <span className="fees-summary-icon pending"><Icon name="clock" size={21} /></span>
          <div>
            <p>Pending balance</p>
            <strong>{formatAmount(pendingAmount)}</strong>
          </div>
        </article>
      </div>

      <section className="fees-panel" aria-labelledby="fee-records-heading">
        <div className="fees-panel-heading">
          <div>
            <h2 id="fee-records-heading">Submitted Fee Payments</h2>
            <p>{studentDetails.course || 'Course not assigned'}</p>
          </div>
          <div className="fees-panel-actions">
            <span className={`fees-balance-status ${statusClass}`}>{paymentStatus}</span>
            <button
              className="fees-refresh-btn"
              type="button"
              onClick={refreshFees}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {payments.length > 0 ? (
          <div className="fees-table-wrap">
            <table className="fees-table">
              <thead>
                <tr>
                  <th scope="col">Receipt ID</th>
                  <th scope="col">Student</th>
                  <th scope="col">Course</th>
                  <th scope="col">Paid Amount</th>
                  <th scope="col">Pending Due</th>
                  <th scope="col">Payment Mode</th>
                  <th scope="col">Received By</th>
                  <th scope="col">Date</th>
                  <th scope="col">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => {
                  const receiptNumber = payment.receipt_number || `payment-${index + 1}`;
                  const balance = Number(payment.pending_amount ?? pendingAmount);

                  return (
                    <tr key={receiptNumber}>
                      <td className="fees-receipt-id">{receiptNumber}</td>
                      <td>
                        <strong>{studentName}</strong>
                        <small>{studentDetails.roll_number || studentDetails.application_number || '—'}</small>
                      </td>
                      <td>{studentDetails.course || '—'}</td>
                      <td className="fees-table-amount">{formatAmount(payment.amount)}</td>
                      <td className="fees-table-balance">{formatAmount(Number.isFinite(balance) ? balance : pendingAmount)}</td>
                      <td>{payment.payment_method || '—'}</td>
                      <td>{payment.received_by || '—'}</td>
                      <td>{formatDate(payment.paid_at)}</td>
                      <td>
                        <button
                          type="button"
                          className="fees-download-btn"
                          onClick={() => downloadReceipt(payment, studentDetails, studentName)}
                          aria-label={`Download receipt ${receiptNumber}`}
                        >
                          <Icon name="download" size={17} />
                          <span>PDF Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fees-list-empty" role="status">
            <p>No fee payments have been recorded for this student account yet.</p>
            <p>Payments submitted by admin will appear here automatically.</p>
          </div>
        )}
      </section>

      <span className="sr-only" aria-live="polite">
        {payments.length} paid fee record{payments.length === 1 ? '' : 's'} available for receipt download.
      </span>
    </section>
  );
}
