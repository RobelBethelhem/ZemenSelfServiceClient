import React, { useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import { CButton, CSpinner } from '@coreui/react';
import zbLogo from '../../../assets/brand/zb.png';

/* global __VERIFY_URL_BASE__ */
const VERIFY_URL_BASE =
  typeof __VERIFY_URL_BASE__ !== 'undefined'
    ? __VERIFY_URL_BASE__
    : 'https://aps2.zemenbank.com/zbss/#/verify';

const API_BASE = 'https://aps2.zemenbank.com/zbss/api';

// ----------------------- formatting helpers -----------------------

const fmtMoney = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '______';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const fmtLongDate = (d) => {
  if (!d) return '______________';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '______________';
    return dt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '______________';
  }
};

// ----------------------- per-category text -----------------------

const subjectLine = (category) =>
  category === 'Salary Only'
    ? 'Salary Increment'
    : 'Salary Increment and One-time Performance Based Bonus';

const openingPara = (category, boardMeetingDate) => {
  const d = fmtLongDate(boardMeetingDate);
  if (category === 'Salary Only') {
    return `It gives me a great pleasure to inform you that, the Board of Directors of the Bank, in its meeting held on ${d}, has approved salary increment considering the Bank's overall performance for the fiscal year.`;
  }
  return `It gives me a great pleasure to inform you that, the Board of Directors of the Bank, in its meeting held on ${d}, has approved salary increment and one-time performance based bonus payment considering the Bank's overall performance for the fiscal year and individual performance.`;
};

const closingPara = (category) =>
  category === 'Salary Only'
    ? "Congratulations on the salary increment and I hope to count on your continued effort and dedication as we work towards the realization of the Bank's objectives and strategies in the periods ahead."
    : "Congratulations on your salary increase and performance based bonus payment. I hope to count on your continued effort and dedication as we work towards the realization of the Bank's objectives and strategies in the periods ahead.";

const BodyParagraph = ({ letter }) => {
  const batch = letter.import_batch_id || {};
  const effectiveDate = fmtLongDate(batch.effective_date);
  const oldSalary = fmtMoney(letter.old_salary);
  const newSalary = fmtMoney(letter.new_salary);
  const grade = letter.job_grade || '____';
  const step = letter.step || '____';
  const bonusMonths = letter.bonus_months !== null && letter.bonus_months !== undefined ? letter.bonus_months : '_____';

  switch (letter.category) {
    case 'Full':
      return (
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          Accordingly, I am pleased to inform you that effective {effectiveDate}, your
          salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00 which puts
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale. In
          addition, you will be awarded your {bonusMonths} month&apos;s salary as a
          one-time performance based bonus.
        </p>
      );

    case 'Proportionate':
      return (
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          Accordingly, I am pleased to inform you that effective {effectiveDate}, your
          salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00 which puts
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale. In
          addition, you will be awarded proportionate amount of your {bonusMonths}{' '}
          month&apos;s salary as a one-time performance based bonus.
        </p>
      );

    case 'Discipline': {
      const pct =
        letter.discipline_pct !== null && letter.discipline_pct !== undefined
          ? `${Math.round(Number(letter.discipline_pct) * 100)}%`
          : '_____';
      return (
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          Accordingly, I am pleased to inform you that effective {effectiveDate}, your
          salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00 which puts
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale. In
          addition, you will be awarded {pct} of your {bonusMonths} month&apos;s salary
          as a one-time performance based bonus.
        </p>
      );
    }

    case 'Salary Only':
      return (
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          Accordingly, I am pleased to inform you that effective {effectiveDate}, your
          salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00 which puts
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale.
        </p>
      );

    case 'Promotion': {
      const newGrade = letter.new_job_grade || '____';
      const newStep = letter.new_step || '____';
      const finalSalary = fmtMoney(letter.salary_after_promotion_adjustment);
      return (
        <>
          <p style={{ marginBottom: 14, textAlign: 'justify' }}>
            Accordingly, I am pleased to inform you that effective {effectiveDate}, your
            salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00.
          </p>
          <p style={{ marginBottom: 14, textAlign: 'justify' }}>
            Furthermore, due to your promotion, effective your date of release, your
            salary will be further increased to Birr {finalSalary}.00, which puts you
            under job grade {newGrade} step {newStep} of the Bank&apos;s salary scale.
            In addition, you will be awarded your {bonusMonths} month&apos;s salary as a
            one-time performance based bonus.
          </p>
        </>
      );
    }

    default:
      return null;
  }
};

// ----------------------- main component -----------------------

const SalaryIncrementLetterPrint = ({ letter, onPrinted }) => {
  const accessToken = useSelector((s) => s.user?.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [printing, setPrinting] = useState(false);
  const printRef = useRef(null);

  const verifyToken = async () => {
    if (!accessToken) return false;
    try {
      const resp = await fetch(`${API_BASE}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken,
        },
      });
      return resp.ok;
    } catch {
      return false;
    }
  };

  const markPrinted = async () => {
    try {
      await fetch(`${API_BASE}/salary-increment/mark-printed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken,
        },
        body: JSON.stringify({ id: letter._id }),
      });
    } catch {
      // best-effort; never block the print flow on this
    }
  };

  const handlePrint = async () => {
    if (printing) return;
    setPrinting(true);
    try {
      const ok = await verifyToken();
      if (!ok) {
        toast.error('Session expired. Please log in again.');
        dispatch({ type: 'clearUser' });
        navigate('/');
        return;
      }

      const content = printRef.current;
      if (!content) {
        toast.error('Letter content not ready. Please try again.');
        return;
      }

      // Small delay so the QR code finishes painting before snapshot.
      await new Promise((r) => setTimeout(r, 100));

      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollY: -window.scrollY,
        width: content.offsetWidth,
        height: content.offsetHeight,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error('Pop-up blocked. Please allow pop-ups for this site and try again.');
        return;
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Salary Increment Letter</title>
            <style>
              @page { size: A4; margin: 0mm; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
              body { width: 210mm; height: 297mm; position: relative; }
              img { width: 210mm; height: 297mm; object-fit: fill; display: block; position: absolute; top: 0; left: 0; }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; color-adjust: exact; margin: 0 !important; padding: 0 !important; }
                @page { margin: 0mm !important; }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Salary Increment Letter" />
            <script>
              window.onload = function() { setTimeout(function(){ window.print(); }, 150); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();

      // Audit-track the print (best effort) and notify parent so it can refresh state.
      markPrinted().then(() => {
        if (typeof onPrinted === 'function') onPrinted();
      });
    } catch (e) {
      console.error('Salary letter print error:', e);
      toast.error('Could not print the letter. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  if (!letter || !letter.import_batch_id) return null;

  const batch = letter.import_batch_id;
  const verifyUrl = `${VERIFY_URL_BASE}/${encodeURIComponent(letter._id)}`;

  return (
    <>
      <div className="mb-3 d-flex align-items-center" style={{ gap: 12 }}>
        <CButton color="primary" onClick={handlePrint} disabled={printing}>
          {printing ? (
            <>
              <CSpinner size="sm" className="me-2" /> Preparing…
            </>
          ) : (
            'Print Letter'
          )}
        </CButton>
        {letter.printed_count > 0 && (
          <small className="text-medium-emphasis">
            Previously printed {letter.printed_count} time
            {letter.printed_count === 1 ? '' : 's'}.
          </small>
        )}
      </div>

      {/* Captured by html2canvas. Sized to A4. */}
      <div
        ref={printRef}
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm 22mm',
          background: '#ffffff',
          color: '#000',
          fontFamily: '"Times New Roman", Times, serif',
          fontSize: 12,
          lineHeight: 1.5,
          boxSizing: 'border-box',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Letterhead logo */}
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <img
            src={zbLogo}
            alt="Zemen Bank"
            style={{ height: 70, objectFit: 'contain' }}
          />
        </div>

        {/* Category label (red) + Date (right) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 14,
          }}
        >
          <div style={{ color: '#c00', fontWeight: 'bold' }}>{letter.category}</div>
          <div>Date: {fmtLongDate(batch.letter_date)}</div>
        </div>

        {/* Reference */}
        <div style={{ marginBottom: 16 }}>
          Ref. No.:&nbsp;{batch.reference_number || '________________'}
        </div>

        {/* Recipient */}
        <div style={{ marginBottom: 4 }}>
          Ato/Woy.&nbsp;&nbsp;{letter.employee_name || '________________'}
        </div>
        <div style={{ marginBottom: 16 }}>Addis Ababa</div>

        {/* Subject */}
        <div style={{ marginBottom: 12 }}>
          <strong>Subject: {subjectLine(letter.category)}</strong>
        </div>

        {/* Greeting */}
        <div style={{ marginBottom: 12 }}>
          Dear: {letter.first_name || '____________'}
          {letter.category === 'Promotion' ? ',' : ''}
        </div>

        {/* Body */}
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          {openingPara(letter.category, batch.board_meeting_date)}
        </p>

        <BodyParagraph letter={letter} />

        <p style={{ marginBottom: 24, textAlign: 'justify' }}>
          {closingPara(letter.category)}
        </p>

        <div style={{ marginBottom: 4 }}>Regards,</div>
        <div style={{ marginTop: 28 }}>
          <strong>Dereje Zebene</strong>
        </div>
        <div style={{ marginBottom: 20 }}>President/CEO</div>

        {/* Footer: CC list (left) + QR (right) */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: 4 }}>CC:</div>
            <div>Finance &amp; Investors Relation Department</div>
            <div>PMES Department</div>
          </div>
          <div style={{ textAlign: 'center' }} data-qr-code>
            <QRCodeSVG value={verifyUrl} size={100} level="M" includeMargin={false} />
            <div style={{ fontSize: 9, marginTop: 4, color: '#444' }}>Scan to verify</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalaryIncrementLetterPrint;
