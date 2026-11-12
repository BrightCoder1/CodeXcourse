import Icon from '../components/Icon';
import './Fees.css';

const feePayments = [
  {
    id: 'FEE-2026-1048',
    title: 'Course fee - installment 1',
    amount: 18000,
    dueDate: '20 Oct 2026',
    paidDate: '20 Oct 2026',
    status: 'Paid',
    paymentMethod: 'UPI',
  },
  {
    id: 'FEE-2026-1049',
    title: 'Course fee - installment 2',
    amount: 12000,
    dueDate: '01 Dec 2026',
    paidDate: null,
    status: 'Pending',
    paymentMethod: null,
  },
];

const student = {
  name: 'Vishal Kumar',
  course: 'Full Stack MERN Bootcamp',
  totalFee: 30000,
};

const formatAmount = (amount) => `INR ${amount.toLocaleString('en-IN')}`;

const escapePdfText = (value) => value
  .replace(/[^\x20-\x7E]/g, '')
  .replace(/([\\()])/g, '\\$1');

const createReceiptPdf = (payment) => {
  const lines = [
    'CodeXCourse',
    'FEE PAYMENT RECEIPT',
    `Receipt number: ${payment.id}`,
    `Student: ${student.name}`,
    `Course: ${student.course}`,
    `Description: ${payment.title}`,
    `Amount paid: ${formatAmount(payment.amount)}`,
    `Payment date: ${payment.paidDate}`,
    `Payment method: ${payment.paymentMethod}`,
    `Fee due date: ${payment.dueDate}`,
    `Total course fee: ${formatAmount(student.totalFee)}`,
    'Status: PAID',
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

const downloadReceipt = (payment) => {
  const receiptUrl = URL.createObjectURL(createReceiptPdf(payment));
  const downloadLink = document.createElement('a');
  downloadLink.href = receiptUrl;
  downloadLink.download = `${payment.id}-receipt.pdf`;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.setTimeout(() => URL.revokeObjectURL(receiptUrl), 1000);
};

export default function Fees() {
  const paidAmount = feePayments
    .filter((payment) => payment.status === 'Paid')
    .reduce((total, payment) => total + payment.amount, 0);
  const pendingAmount = student.totalFee - paidAmount;
  const paidPayments = feePayments.filter((payment) => payment.status === 'Paid');

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
          {student.name}
        </span>
      </header>

      <div className="fees-summary-grid">
        <article className="fees-summary-card">
          <span className="fees-summary-icon total"><Icon name="credit-card" size={21} /></span>
          <div>
            <p>Total course fee</p>
            <strong>{formatAmount(student.totalFee)}</strong>
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
            <h2 id="fee-records-heading">Fee records</h2>
            <p>{student.course}</p>
          </div>
          <span className="fees-balance-status">Partially paid</span>
        </div>

        <div className="fees-record-list">
          {feePayments.map((payment) => (
            <article className="fees-record" key={payment.id}>
              <span className={`fees-record-icon ${payment.status.toLowerCase()}`}>
                <Icon name={payment.status === 'Paid' ? 'check-circle' : 'clock'} size={21} />
              </span>
              <div className="fees-record-main">
                <div className="fees-record-title">
                  <h3>{payment.title}</h3>
                  <span className={`fees-status ${payment.status.toLowerCase()}`}>{payment.status}</span>
                </div>
                <div className="fees-record-meta">
                  <span>Due {payment.dueDate}</span>
                  {payment.paidDate && <span>Paid {payment.paidDate} · {payment.paymentMethod}</span>}
                </div>
              </div>
              <strong className="fees-record-amount">{formatAmount(payment.amount)}</strong>
              {payment.status === 'Paid' ? (
                <button
                  type="button"
                  className="fees-download-btn"
                  onClick={() => downloadReceipt(payment)}
                  aria-label={`Download receipt for ${payment.title}`}
                >
                  <Icon name="download" size={17} />
                  <span>Download slip</span>
                </button>
              ) : (
                <span className="fees-no-receipt">No slip yet</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <p className="fees-demo-note">
        These are sample fee records. Live balances and receipts require a student account connected to the fee system.
      </p>
      <span className="sr-only" aria-live="polite">
        {paidPayments.length} paid fee record{paidPayments.length === 1 ? '' : 's'} available for receipt download.
      </span>
    </section>
  );
}
