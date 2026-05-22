import React, { useRef, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { toast } from 'react-toastify';
import { CButton, CSpinner, CFormSwitch } from '@coreui/react';

// Shared letterhead/visual assets — these images are used by the existing
// letter types too; importing the same files keeps every printed letter
// visually consistent without duplicating the binaries.
import logoImage from '../Letters/logo.png';
import watermarkImage from '../Letters/watermark.png';
import stampImage from '../Letters/stamp.png';
import socialImage from '../Letters/social.png';
import ceoSignature from '../Letters/ceo_signature.png';

import { API_BASE } from '../../../api/base';

/* global __VERIFY_URL_BASE__ */
const VERIFY_URL_BASE =
  typeof __VERIFY_URL_BASE__ !== 'undefined'
    ? __VERIFY_URL_BASE__
    : 'https://zhr.zemenbank.com/zbss/#/verify';

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
// `hasBonus` is false when the category is Salary Only OR the user rejected
// the commitment (bonus_months was forced to 0 at import time). In both
// cases the letter is structurally a salary-increment-only letter — no
// bonus subject/paragraph/closing sentence.

const subjectLine = (hasBonus) =>
  hasBonus
    ? 'Salary Increment and One-time Performance Based Bonus'
    : 'Salary Increment';

const openingPara = (hasBonus, boardMeetingDate) => {
  const d = fmtLongDate(boardMeetingDate);
  if (!hasBonus) {
    return `It gives me a great pleasure to inform you that, the Board of Directors of the Bank, in its meeting held on ${d}, has approved salary increment considering the Bank's overall performance for the fiscal year.`;
  }
  return `It gives me a great pleasure to inform you that, the Board of Directors of the Bank, in its meeting held on ${d}, has approved salary increment and one-time performance based bonus payment considering the Bank's overall performance for the fiscal year and individual performance.`;
};

const closingPara = (hasBonus) =>
  hasBonus
    ? "Congratulations on your salary increase and performance based bonus payment. I hope to count on your continued effort and dedication as we work towards the realization of the Bank's objectives and strategies in the periods ahead."
    : "Congratulations on the salary increment and I hope to count on your continued effort and dedication as we work towards the realization of the Bank's objectives and strategies in the periods ahead.";

const BodyParagraph = ({ letter }) => {
  const batch = letter.import_batch_id || {};
  const effectiveDate = fmtLongDate(batch.effective_date);
  const oldSalary = fmtMoney(letter.old_salary);
  const newSalary = fmtMoney(letter.new_salary);
  const grade = letter.job_grade || '____';
  const step = letter.step || '____';
  const bonusMonths =
    letter.bonus_months !== null && letter.bonus_months !== undefined
      ? letter.bonus_months
      : '_____';

  // Same condition as the rest of the letter — no bonus paragraph for
  // Salary Only or for users who rejected the commitment.
  const hasBonus =
    letter.commitment_decision !== 'Rejected' && letter.category !== 'Salary Only';

  switch (letter.category) {
    case 'Full':
      return (
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          Accordingly, I am pleased to inform you that effective {effectiveDate}, your
          salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00 which puts
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale.
          {hasBonus && (
            <>
              {' '}In addition, you will be awarded your {bonusMonths} month&apos;s salary
              as a one-time performance based bonus.
            </>
          )}
        </p>
      );

    case 'Proportionate':
      return (
        <p style={{ marginBottom: 14, textAlign: 'justify' }}>
          Accordingly, I am pleased to inform you that effective {effectiveDate}, your
          salary is increased from Birr {oldSalary}.00 to Birr {newSalary}.00 which puts
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale.
          {hasBonus && (
            <>
              {' '}In addition, you will be awarded proportionate amount of your{' '}
              {bonusMonths} month&apos;s salary as a one-time performance based bonus.
            </>
          )}
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
          you under Job grade {grade} step {step} of the Bank&apos;s salary scale.
          {hasBonus && (
            <>
              {' '}In addition, you will be awarded {pct} of your {bonusMonths}{' '}
              month&apos;s salary as a one-time performance based bonus.
            </>
          )}
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
            {hasBonus && (
              <>
                {' '}In addition, you will be awarded your {bonusMonths} month&apos;s
                salary as a one-time performance based bonus.
              </>
            )}
          </p>
        </>
      );
    }

    default:
      return null;
  }
};

// ----------------------- main component -----------------------

const SalaryIncrementLetterPrint = ({ letter, onPrinted, trackPrint = true }) => {
  const accessToken = useSelector((s) => s.user?.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [printing, setPrinting] = useState(false);
  const [withoutLetterhead, setWithoutLetterhead] = useState(false);
  const printRef = useRef(null);

  // Local "enriched" copy of the letter so we can splice in a freshly
  // assigned reference_number before the html2canvas snapshot runs.
  const [enrichedLetter, setEnrichedLetter] = useState(letter);
  useEffect(() => {
    setEnrichedLetter(letter);
  }, [letter]);

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

  // Calls /mark-printed (owner audit + reference) or /admin-prepare-print
  // (silent reference) depending on trackPrint. Returns reference_number
  // when the call succeeds; null otherwise.
  const ensureReference = async () => {
    const endpoint = trackPrint
      ? `${API_BASE}/salary-increment/mark-printed`
      : `${API_BASE}/salary-increment/admin-prepare-print`;
    try {
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken,
        },
        body: JSON.stringify({ id: letter._id }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast.error(body.message || `Failed to prepare letter (${resp.status})`);
        return null;
      }
      return body.reference_number || null;
    } catch (e) {
      toast.error((e && e.message) || 'Network error preparing letter');
      return null;
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

      // Ensure the letter has a system reference number BEFORE we snapshot,
      // so the printed image shows the real number rather than a placeholder.
      const ref = await ensureReference();
      if (!ref) return;
      if (ref !== enrichedLetter.reference_number) {
        setEnrichedLetter((prev) => ({ ...prev, reference_number: ref }));
        // wait for React to commit + paint the new reference
        await new Promise((r) => setTimeout(r, 150));
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

      // The reference + audit work happened in ensureReference() above (which
      // already covered both the user "track print" path and the admin
      // "reference copy" path). Just notify the parent so it can refresh.
      if (typeof onPrinted === 'function') onPrinted();
    } catch (e) {
      console.error('Salary letter print error:', e);
      toast.error('Could not print the letter. Please try again.');
    } finally {
      setPrinting(false);
    }
  };

  if (!letter || !letter.import_batch_id) return null;

  const batch = enrichedLetter.import_batch_id || letter.import_batch_id;
  const verifyUrl = `${VERIFY_URL_BASE}/${encodeURIComponent(letter._id)}`;
  const referenceDisplay =
    enrichedLetter.reference_number ||
    `ZB/HC/INC/_____/${enrichedLetter.fiscal_year || letter.fiscal_year || ''}`;
  // Suppress the bonus paragraph when the user rejected the commitment
  // (bonus_months was forced to 0 at import time).
  const showBonusParagraph =
    enrichedLetter.commitment_decision !== 'Rejected' &&
    enrichedLetter.category !== 'Salary Only';

  return (
    <>
      <div
        className="mb-3 d-flex align-items-center"
        style={{ gap: 16, flexWrap: 'wrap' }}
      >
        <CButton color="primary" onClick={handlePrint} disabled={printing}>
          {printing ? (
            <>
              <CSpinner size="sm" className="me-2" /> Preparing…
            </>
          ) : (
            'Print Letter'
          )}
        </CButton>

        <CFormSwitch
          id="salaryLetterheadToggle"
          label="Without Letterhead"
          checked={withoutLetterhead}
          onChange={(e) => setWithoutLetterhead(e.target.checked)}
          style={{ fontSize: 14 }}
        />

        {letter.printed_count > 0 && (
          <small className="text-medium-emphasis">
            Previously printed {letter.printed_count} time
            {letter.printed_count === 1 ? '' : 's'}.
          </small>
        )}
      </div>

      {/* A4-sized printable area — captured by html2canvas. */}
      <div
        ref={printRef}
        style={{
          width: '210mm',
          minHeight: '297mm',
          height: '297mm',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff',
          color: '#000',
          fontFamily: 'Calibri, "Times New Roman", Times, serif',
          fontSize: 12.5,
          lineHeight: 1.55,
          boxSizing: 'border-box',
          margin: '0 auto',
        }}
      >
        {/* Red vertical bar — letterhead only */}
        {!withoutLetterhead && (
          <div
            style={{
              position: 'absolute',
              top: 30,
              left: 30,
              bottom: 30,
              width: 4,
              backgroundColor: 'red',
            }}
          />
        )}

        {/* Watermark — letterhead only */}
        {!withoutLetterhead && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${watermarkImage})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '33% 40%',
              backgroundSize: '150%',
              opacity: 0.07,
              pointerEvents: 'none',
              transform: 'rotate(-1deg)',
            }}
          />
        )}

        {/* Logo top-left — letterhead only */}
        {!withoutLetterhead && (
          <img
            src={logoImage}
            alt="Logo"
            style={{
              position: 'absolute',
              top: 60,
              left: 50,
              width: 180,
              height: 'auto',
            }}
          />
        )}

        {/* Body wrapper. We pad enough to clear the logo block and the
            footer/QR area so the body never collides with letterhead chrome. */}
        <div
          style={{
            position: 'relative',
            paddingLeft: '22mm',
            paddingRight: '22mm',
            paddingTop: withoutLetterhead ? '20mm' : '50mm',
            paddingBottom: '40mm',
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Date + Ref. No. — both right-aligned to mirror existing letters */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginBottom: 18,
            }}
          >
            <div className="fw-bold">
              <span className="me-2">Date:</span>
              {fmtLongDate(batch.letter_date)}
            </div>
            <div className="fw-bold">
              <span className="me-2">Ref. No.:</span>
              {referenceDisplay}
            </div>
          </div>

          {/* Recipient block — Addis Ababa underlined per house style */}
          <div style={{ marginBottom: 4 }}>
            Ato/Woy.&nbsp;&nbsp;
            {enrichedLetter.employee_name || '________________'}
          </div>
          <div style={{ marginBottom: 18, textDecoration: 'underline' }}>
            Addis Ababa
          </div>

          {/* Subject — underlined per house style */}
          <div style={{ marginBottom: 14, textDecoration: 'underline' }}>
            <strong>Subject: {subjectLine(showBonusParagraph)}</strong>
          </div>

          {/* Greeting */}
          <div style={{ marginBottom: 12 }}>
            Dear: {enrichedLetter.first_name || '____________'}
            {enrichedLetter.category === 'Promotion' ? ',' : ''}
          </div>

          {/* Body */}
          <p style={{ marginBottom: 14, textAlign: 'justify' }}>
            {openingPara(showBonusParagraph, batch.board_meeting_date)}
          </p>

          <BodyParagraph letter={enrichedLetter} />

          <p style={{ marginBottom: 24, textAlign: 'justify' }}>
            {closingPara(showBonusParagraph)}
          </p>

          <div style={{ marginBottom: 4 }}>Regards,</div>

          {/* CEO signature image. Sits between "Regards," and the printed name. */}
          <img
            src={ceoSignature}
            alt="CEO signature"
            style={{ width: 160, height: 'auto', marginTop: 4, marginBottom: 0 }}
          />
          <div>
            <strong>Dereje Zebene</strong>
          </div>
          <div style={{ marginBottom: 20 }}>President/CEO</div>

          {/* Stamp — overlaps the signature area on the right; letterhead only */}
          {!withoutLetterhead && (
            <img
              src={stampImage}
              alt="Stamp"
              style={{
                position: 'absolute',
                left: '22mm',
                marginLeft: 180,
                marginTop: -110,
                width: 130,
                height: 'auto',
                zIndex: 6,
              }}
            />
          )}

          {/* CC list */}
          <div style={{ marginTop: 8 }}>
            <div style={{ marginBottom: 2 }}>CC:</div>
            <div>Finance &amp; Investors Relation Department</div>
            <div>PMES Department</div>
          </div>
        </div>

        {/* QR — bottom-right of the page, always present */}
        <div
          data-qr-code
          style={{
            position: 'absolute',
            right: 50,
            bottom: withoutLetterhead ? 30 : 130,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <QRCodeSVG value={verifyUrl} size={90} level="M" includeMargin={false} />
          <div style={{ fontSize: 9, marginTop: 4, color: '#444' }}>
            Scan to verify
          </div>
        </div>

        {/* Bottom footer (contact info + social + tagline) — letterhead only */}
        {!withoutLetterhead && (
          <div
            className="fst-italic"
            style={{
              position: 'absolute',
              bottom: 20,
              left: 50,
              right: 50,
              fontSize: 10,
              lineHeight: 1.35,
            }}
          >
            <div style={{ fontWeight: 'bold' }}>
              ዘመን ባንክ አ.ማ. / Zemen Bank S.C.
            </div>
            <div>Ras Abebe Aregay St.</div>
            <div>P.O.Box 1212 Addis Ababa, Ethiopia</div>
            <div>SWIFT Code: ZEMEETAA</div>
            <div>Call Center 6500</div>
            <div>info@zemenbank.com</div>
            <div style={{ color: 'red', fontWeight: 'bold' }}>www.zemenbank.com</div>
            <div
              style={{
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <img
                src={socialImage}
                alt="social"
                style={{ width: 110, height: 'auto' }}
              />
              <span style={{ color: 'red', fontWeight: 'bold' }}>
                DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SalaryIncrementLetterPrint;
