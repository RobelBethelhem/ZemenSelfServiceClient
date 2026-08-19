import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
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

// Every sentence on the letter comes from here. The admin's bulk PDF export
// reads the same module, so the printed letter and the archived PDF cannot
// drift apart — see salaryLetterContent.js.
import {
  fmtLongDate,
  hasBonus,
  subjectLine,
  openingParaRuns,
  closingParaRuns,
  bodyParagraphRuns,
  recipientName,
  greetingLine,
  SIGNATORY_NAME,
  SIGNATORY_TITLE,
  SALUTATION_PREFIX,
  RECIPIENT_CITY,
  SUBJECT_LABEL,
  CC_LIST,
} from './salaryLetterContent';

import {
  BODY_PX,
  DATE_TOP_PX,
  gapAfterDateBlock,
  MM_PER_PX,
} from './salaryLetterGeometry';

/* global __VERIFY_URL_BASE__ */
const VERIFY_URL_BASE =
  typeof __VERIFY_URL_BASE__ !== 'undefined'
    ? __VERIFY_URL_BASE__
    : 'https://zhr.zemenbank.com/zbss/#/verify';

// ----------------------- per-category text -----------------------
//
// RETIRED (kept as history, not deleted): the formatting helpers and the
// <BodyParagraph> switch used to live here as JSX. They now come from
// ./salaryLetterContent, because the admin's bulk PDF export renders the very
// same letter through jsPDF and had no way to reuse JSX. Two hand-maintained
// copies of a legal paragraph is exactly the kind of thing that drifts, so the
// wording moved to one module and both renderers read it.

// Renders a paragraph's runs, bolding the ones marked. This is the HTML half of
// the run model; salaryLetterPdf.js does the same thing with a jsPDF font
// switch. Both read the identical run arrays, so the emphasis lands on exactly
// the same words in the printed letter and in the archived PDF.
const Runs = ({ runs }) => (
  <>
    {runs.map((r, i) =>
      r.b ? <strong key={i}>{r.t}</strong> : <React.Fragment key={i}>{r.t}</React.Fragment>
    )}
  </>
);

Runs.propTypes = {
  runs: PropTypes.arrayOf(
    PropTypes.shape({ t: PropTypes.string.isRequired, b: PropTypes.bool })
  ).isRequired,
};

const BodyParagraph = ({ letter }) => (
  <>
    {bodyParagraphRuns(letter).map((runs, i) => (
      <p key={i} style={{ marginBottom: 14, textAlign: 'justify' }}>
        <Runs runs={runs} />
      </p>
    ))}
  </>
);

// ----------------------- main component -----------------------

const SalaryIncrementLetterPrint = ({ letter, onPrinted, trackPrint = true }) => {
  const accessToken = useSelector((s) => s.user?.accessToken);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [printing, setPrinting] = useState(false);
  const [withoutLetterhead, setWithoutLetterhead] = useState(false);
  const printRef = useRef(null);

  // Local copy of the letter. It no longer needs to absorb a reference spliced
  // in at print time — that number now arrives with the batch — but the prop
  // can still change under the component, so the copy stays.
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

  // Records the print against the owner's audit trail (printed_count,
  // first/last_printed_at).
  //
  // It no longer fetches a reference — the letter carries the admin's batch
  // reference, which is on screen before this ever runs. The admin
  // reference-copy path (trackPrint === false) therefore has nothing to call
  // at all and skips this entirely; /admin-prepare-print stays on the server
  // for older clients.
  const recordPrint = async () => {
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

      // The reference is already on screen — it comes from the batch, not from
      // this call — so printing no longer waits on the server, and a failure
      // here can no longer stop someone printing their own letter.
      //
      // Only the owner's print is recorded. The admin reference copy
      // deliberately does not touch printed_count.
      //
      // RETIRED (kept, not deleted): fetching and splicing in a generated
      // reference before the snapshot.
      //   const ref = await ensureReference();
      //   if (!ref) return;
      //   if (ref !== enrichedLetter.reference_number) {
      //     setEnrichedLetter((prev) => ({ ...prev, reference_number: ref }));
      //     await new Promise((r) => setTimeout(r, 150));
      //   }
      if (trackPrint) {
        // Fire and continue: the audit count must not gate the print.
        recordPrint().catch(() => {});
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

      // The owner's print was recorded above; the admin reference copy
      // deliberately records nothing. Notify the parent so it can refresh.
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

  // The reference is the one the admin types at import time — the Board's own
  // decision-document number — shared by every letter in the batch and present
  // whether or not anyone prints, exactly like the effective, board-meeting and
  // letter dates it sits beside.
  //
  // It is also what the public verify page has always shown, so the number on
  // the paper and the number returned by scanning its QR code finally match.
  //
  // RETIRED (kept, not deleted): the per-letter number generated on first print.
  //   enrichedLetter.reference_number ||
  //   `ZB/HC/INC/_____/${enrichedLetter.fiscal_year || letter.fiscal_year || ''}`
  const referenceDisplay = (batch && batch.reference_number) || '—';
  // Suppress the bonus paragraph when the user rejected the commitment
  // (bonus_months was forced to 0 at import time).
  const showBonusParagraph = hasBonus(enrichedLetter);

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
          fontSize: BODY_PX,
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
            paddingTop: DATE_TOP_PX,
            paddingBottom: '40mm',
            height: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Date + Ref. No. — right-aligned, and level with the logo rather
              than stranded below it. The wrapper's top padding now stops at the
              logo's line, and the gap under this block puts everything after it
              back exactly where it was, so only the date moved. */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              marginBottom: gapAfterDateBlock(!withoutLetterhead) / MM_PER_PX,
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

          {/* Recipient block — both lines bold, city underlined per house style */}
          <div style={{ marginBottom: 4, fontWeight: 'bold' }}>
            {SALUTATION_PREFIX}&nbsp;&nbsp;
            {recipientName(enrichedLetter)}
          </div>
          <div style={{ marginBottom: 18, fontWeight: 'bold', textDecoration: 'underline' }}>
            {RECIPIENT_CITY}
          </div>

          {/* Subject — centred, with the underline on the subject itself and
              deliberately NOT on the "Subject:" label. */}
          <div style={{ marginBottom: 14, textAlign: 'center' }}>
            <strong>{SUBJECT_LABEL} </strong>
            <strong style={{ textDecoration: 'underline' }}>
              {subjectLine(showBonusParagraph)}
            </strong>
          </div>

          {/* Greeting */}
          <div style={{ marginBottom: 12, fontWeight: 'bold' }}>
            {greetingLine(enrichedLetter)}
          </div>

          {/* Body */}
          <p style={{ marginBottom: 14, textAlign: 'justify' }}>
            <Runs runs={openingParaRuns(showBonusParagraph, batch.board_meeting_date)} />
          </p>

          <BodyParagraph letter={enrichedLetter} />

          <p style={{ marginBottom: 24, textAlign: 'justify' }}>
            <Runs runs={closingParaRuns(showBonusParagraph)} />
          </p>

          <div style={{ marginBottom: 4 }}>Regards,</div>

          {/* Signature, with the stamp beside it.
              The frame is nudged 10px left of the text margin: the artwork's
              left third is a sparse lead-in flourish, so sitting flush at the
              margin makes the signature read as indented against the "Regards,"
              directly above it. The stamp is absolutely positioned inside this
              wrapper so it sits to the signature's right without adding to the
              flow height. */}
          <div style={{ position: 'relative', marginTop: 4 }}>
            <img
              src={ceoSignature}
              alt="CEO signature"
              style={{ width: 160, height: 'auto', display: 'block', marginLeft: -10 }}
            />
            {!withoutLetterhead && (
              <img
                src={stampImage}
                alt="Stamp"
                style={{
                  position: 'absolute',
                  left: 160,
                  top: -13,
                  width: 120,
                  height: 'auto',
                  zIndex: 1,
                }}
              />
            )}
          </div>
          {/* Raised above the stamp so the name stays readable through it, the
              way it does on a real stamped letter. */}
          <div style={{ position: 'relative', zIndex: 2 }}>
            <strong>{SIGNATORY_NAME}</strong>
          </div>
          <div style={{ position: 'relative', zIndex: 2, marginBottom: 44 }}>
            {SIGNATORY_TITLE}
          </div>

          {/* CC list */}
          <div>
            <div style={{ marginBottom: 2 }}>CC:</div>
            {CC_LIST.map((line) => (
              <div key={line}>{line}</div>
            ))}
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
