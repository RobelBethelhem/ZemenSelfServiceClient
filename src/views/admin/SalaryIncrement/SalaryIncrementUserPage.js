import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CFormCheck,
} from '@coreui/react';
import jsPDF from 'jspdf';
import SalaryIncrementLetterPrint from './SalaryIncrementLetterPrint';
import logoImage from '../Letters/logo.png';
import watermarkImage from '../Letters/watermark.png';
import socialImage from '../Letters/social.png';
import { API_BASE as API_ROOT } from '../../../api/base';

const API_BASE = `${API_ROOT}/salary-increment`;

// Short acknowledgment shown inline next to the Accept / Decline buttons —
// written in the first person to match the legal language of the agreement
// the user is attesting to. The FY label is filled dynamically from the
// active commitment period.
const buildCommitmentAcknowledgment = (fyLabel) =>
  `I acknowledge the Bank's policy requiring six (6) months of obligatory service to remain eligible for the FY ${fyLabel} Bonus Payment. The Mandatory Service Period commences on the bonus payment date. I hereby confirm my voluntary agreement to these terms to proceed with the processing of my bonus. You may change your decision (Decline ↔ Accept) within the deadline.`;

// Full ZB Obligatory Service Agreement — shown in the "View Full Agreement"
// modal and rendered into the downloadable PDF. Same text the bank publishes
// in ZB_Obligatory_Service_Agreement.docx, with placeholders filled in
// dynamically from the user's HRIS record and the active commitment period.
const FULL_AGREEMENT_TITLE = 'ZEMEN BANK S.C.';
const FULL_AGREEMENT_SUBTITLE = 'OBLIGATORY SERVICE AGREEMENT FOR BONUS PAYMENT';

// Bumped from v1.0 when the Legal team revised the wording: both parties are
// now named by address, and clauses 4-8 were expanded. The version travels
// with every decision so an acceptance can always be tied to the exact text
// that was on screen — "they accepted" only means something alongside
// "accepted what".
const AGREEMENT_VERSION = 'v2.0';

// The Bank's registered address, as supplied by the Legal team. A constant
// rather than a lookup: it is the Bank's own address on its own agreement, and
// there is no HRIS record to read it from.
const BANK_ADDRESS =
  'Addis Ababa City, Lideta Sub-City, Woreda 08, House No. New, ' +
  'Telephone No. 011-5-53-93-61, P.O. Box 1212';

// Renders the Ethiopian fiscal-year label "YYYY/YY". The backend's /my
// response now carries this as period.fiscal_year_label; we only fall back
// to client-side computation if the field is missing (e.g. an older backend).
const fiscalYearLabel = (period) => {
  if (period && period.fiscal_year_label) return period.fiscal_year_label;
  const fy = period && period.fiscal_year;
  if (!fy || Number.isNaN(Number(fy))) return '____/__';
  const n = Number(fy);
  return `${n - 1}/${(n % 100).toString().padStart(2, '0')}`;
};

// Builds the agreement sections with all placeholders substituted. Anything
// not yet known (e.g. acceptance timestamp before the user clicks Accept)
// stays as a labeled placeholder.
const buildAgreementSections = ({ employeeInfo, period, decision }) => {
  const fullName = employeeInfo
    ? [employeeInfo.first_name, employeeInfo.middle_name, employeeInfo.last_name]
        .filter(Boolean)
        .join(' ') || '[EMPLOYEE NAME]'
    : '[EMPLOYEE NAME]';
  // Employee ID comes from HRIS only. The backend deliberately does NOT
  // substitute the portal's own value when HRIS cannot be matched, because a
  // plausible wrong number on a legal agreement is worse than a visible gap.
  const employeeId = (employeeInfo && employeeInfo.employee_id) || '____________';
  const fyLabel = fiscalYearLabel(period);
  const decidedAt = decision && decision.decided_at ? new Date(decision.decided_at) : null;
  const acceptedDate = decidedAt
    ? decidedAt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '[Pending acceptance]';
  const acceptedTime = decidedAt
    ? decidedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    : '[Pending acceptance]';
  // The Effective Date line was dropped in the v2.0 revision: the Mandatory
  // Service Period now runs from the bonus payment date (clause 2.1), not from
  // an agreement effective date, so printing one alongside it was misleading.

  // The execution date is the day the employee accepts. Before that it stays
  // an explicit placeholder rather than today's date, so an unaccepted
  // agreement never looks as though it has already been executed.
  const executionDate = decidedAt
    ? decidedAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '____ day of __________, ' + new Date().getFullYear();

  // Pulled from the employee's HRIS address record by the backend. When HRIS
  // has no address the line stays a blank rule — the same convention the
  // paper agreement uses — rather than silently printing nothing.
  const employeeAddress =
    (employeeInfo && employeeInfo.address) || '____________________________________';

  return [
    {
      type: 'p',
      text: `This Obligatory Service Agreement (hereinafter referred to as the "Agreement") is entered into on this ${executionDate}, at Addis Ababa, Ethiopia by and between:`,
    },
    {
      type: 'p',
      text: `ZEMEN BANK, Address ${BANK_ADDRESS} (hereinafter referred to as "the Bank")`,
    },
    { type: 'p', text: 'And' },
    {
      type: 'p',
      text: `${fullName}, Employee ID: ${employeeId}, Address ${employeeAddress} (hereinafter referred to as "the Employee")`,
    },
    { type: 'h', text: '1. Purpose' },
    { type: 'p', text: `This Agreement establishes the terms and conditions under which the Employee shall receive a Bonus Payment for the Financial Year ${fyLabel}. The bonus payment is granted pursuant to the Bank's internal policies and is strictly subject to the Employee's fulfillment of the mandatory service commitment specified herein.` },
    { type: 'h', text: '2. Obligatory Service Commitment' },
    { type: 'p', text: '2.1 In accordance with the Bank’s policy and the consideration of receiving the Bonus Payment, the Employee irrevocably commits to remain continuously employed in the Bank for an obligatory period of 6 (six) months commencing on bonus payment date (hereinafter referred to as the "Mandatory Service Period").' },
    { type: 'p', text: '2.2 The Employee acknowledges that this mandatory service commitment is an essential condition for entitlement to the Bonus Payment.' },
    { type: 'h', text: '3. Bonus Payment' },
    { type: 'p', text: '3.1 The Bank shall process and pay the Employee a bonus in accordance with its approved bonus payment guideline of this specific year subject to applicable statutory tax deductions in accordance with applicable tax laws.' },
    { type: 'p', text: '3.2 The bonus payment is conditional upon acceptance of this Agreement and willingness to fulfill the full obligatory service period.' },
    { type: 'h', text: '4. Early Termination and Repayment Obligation' },
    { type: 'p', text: '4.1 If the Employee resigns, terminates employment for reasons attributable to the Employee, or is dismissed for misconduct before completing the six (6) month service period, the Employee shall repay the full bonus amount received.' },
    { type: 'p', text: '4.2 Repayment shall be made on a gross basis, including all applicable taxes and deductions. Taxes already remitted will not reduce the repayment obligation. The Employee is responsible for pursuing any tax adjustments.' },
    { type: 'h', text: '5. Recovery Mechanism' },
    { type: 'p', text: '5.1 In the event a repayment obligation is triggered under Section 4, the Employee authorizes the Bank to set off and deduct the owed refund amount from the Employee’s final settlement payments (including salary, terminal benefits, or other payments due to the staff).' },
    { type: 'p', text: '5.2 If the final settlement or wage deduction is insufficient to satisfy the full refund amount, the Employee agrees to settle the remaining balance within 30 calendar days after resignation/separation.' },
    { type: 'h', text: '6. Exceptions' },
    { type: 'p', text: 'Repayment shall not apply in cases of death, permanent disability, or termination of contract by the Bank for causes not related to the employee’s performance or discipline.' },
    { type: 'h', text: '7. Acknowledgment and Consent' },
    { type: 'p', text: '7.1 The Employee confirms understanding and voluntary acceptance of all terms, including the financial implications of gross repayment.' },
    { type: 'p', text: '7.2 This Agreement constitutes the entire understanding between the parties regarding bonus payment and supersedes all prior agreements, representations, or understandings, whether written or oral.' },
    { type: 'h', text: '8. Dispute Resolution & Governing Law' },
    { type: 'p', text: '8.1 This Agreement shall be governed by, construed, and enforced in accordance with the laws of the Federal Democratic Republic of Ethiopia.' },
    { type: 'p', text: '8.2 The parties shall make good faith efforts to resolve any dispute arising out of or in connection with this Agreement through direct negotiations.' },
    { type: 'p', text: '8.3 If an amicable resolution cannot be reached within 15 days, the dispute shall be submitted to the competent Court of appropriate jurisdiction in Ethiopia.' },
    { type: 'h', text: '9. Digital Acceptance' },
    { type: 'p', text: 'This Agreement becomes binding upon acceptance in the ESS system. System records shall serve as proof of acceptance.' },
    { type: 'divider' },
    { type: 'h', text: 'Digital Execution and Acceptance' },
    { type: 'p', text: 'This Agreement is executed electronically through the Bank’s Employee Self-Service (ESS) system. By selecting "I Agree", the Employee:' },
    { type: 'bullet', text: 'Provides explicit electronic consent to this Agreement;' },
    { type: 'bullet', text: 'Acknowledges that such consent constitutes a legally binding signature equivalent to a handwritten signature;' },
    { type: 'bullet', text: 'Confirms that they have read, understood, and accepted all terms and conditions of the contract.' },
    { type: 'p', text: 'The Bank and the Employee agree that this electronic acceptance shall be valid, enforceable, and admissible for all legal and administrative purposes.' },
    { type: 'divider' },
    { type: 'h', text: 'System-Generated Acceptance Record' },
    { type: 'p', text: 'The following system-generated information shall serve as official proof of acceptance:' },
    { type: 'bullet', text: `Employee Name: ${fullName}` },
    { type: 'bullet', text: `Employee ID: ${employeeId}` },
    { type: 'bullet', text: `Date of Acceptance: ${acceptedDate}` },
    { type: 'bullet', text: `Time of Acceptance: ${acceptedTime}` },
    { type: 'bullet', text: `Agreement Version: ${AGREEMENT_VERSION}` },
  ];
};

// Maps internal "Approved"/"Rejected" enum values to the user-facing
// Accept/Decline language the bank uses in the agreement.
const decisionLabel = (d) =>
  d === 'Approved' ? 'Accepted' : d === 'Rejected' ? 'Declined' : d || '';
const decisionColor = (d) =>
  d === 'Approved' ? 'success' : d === 'Rejected' ? 'warning' : 'secondary';

const fmtDate = (d) => {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
};

const fmtDateTime = (d) => {
  if (!d) return '-';
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '-';
    return dt.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
};

const fmtMoney = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const statusColor = (s) =>
  s === 'Committed' ? 'success' : s === 'Revoked' ? 'danger' : 'warning';

// ---------- letter summary block (used inside the letter card) ----------

const LetterSummary = ({ letter }) => {
  const batch = letter.import_batch_id || {};
  const isRejected = letter.commitment_decision === 'Rejected';
  return (
    <CRow>
      <CCol md={6}>
        <h6>Employee</h6>
        <p>{letter.employee_name}</p>
        <h6>Category</h6>
        <p>{letter.category}</p>
        <h6>Reference Number</h6>
        {/* The Board decision number the admin sets for the whole batch —
            present from import, not assigned on print. Falls back to the
            retired per-letter value for anything printed before the change. */}
        <p className="font-monospace">
          {letter.import_batch_id?.reference_number ||
            letter.reference_number || (
              <span className="text-medium-emphasis">
                <small>Not yet set by HR</small>
              </span>
            )}
        </p>
      </CCol>
      <CCol md={6}>
        <h6>Important Dates</h6>
        <p className="mb-1">
          Board Meeting: <strong>{fmtDate(batch.board_meeting_date)}</strong>
        </p>
        <p className="mb-1">
          Effective Date: <strong>{fmtDate(batch.effective_date)}</strong>
        </p>
        <p className="mb-3">
          Letter Date: <strong>{fmtDate(batch.letter_date)}</strong>
        </p>
        <h6>Commitment</h6>
        <p>
          <CBadge color={decisionColor(letter.commitment_decision)}>
            {decisionLabel(letter.commitment_decision) || 'Unknown'}
          </CBadge>
          {letter.commitment_decided_at && (
            <small className="text-medium-emphasis ms-2">
              decided {fmtDate(letter.commitment_decided_at)}
            </small>
          )}
        </p>
      </CCol>
      <CCol xs={12} className="mt-3">
        <h6>Salary Change</h6>
        <p className="mb-1">
          From <strong>Birr {fmtMoney(letter.old_salary)}.00</strong> to{' '}
          <strong>Birr {fmtMoney(letter.new_salary)}.00</strong>
        </p>
        {letter.category === 'Promotion' &&
          letter.salary_after_promotion_adjustment != null && (
            <p className="mb-1">
              Salary after promotion adjustment:{' '}
              <strong>
                Birr {fmtMoney(letter.salary_after_promotion_adjustment)}.00
              </strong>
            </p>
          )}
        {!isRejected && letter.category !== 'Salary Only' && letter.bonus_months != null && (
          <p className="mb-0">
            Bonus:{' '}
            <strong>
              {letter.category === 'Discipline' && letter.discipline_pct != null
                ? `${Math.round(letter.discipline_pct * 100)}% of `
                : letter.category === 'Proportionate'
                ? 'proportionate amount of '
                : ''}
              {letter.bonus_months} month
              {Number(letter.bonus_months) === 1 ? '' : "'s"} salary
            </strong>
          </p>
        )}
        {isRejected && (
          <p className="mb-0 text-warning">
            Bonus: <strong>0</strong> (commitment was rejected)
          </p>
        )}
        {letter.category === 'Salary Only' && (
          <p className="mb-0 text-medium-emphasis">No bonus included for this category.</p>
        )}
      </CCol>
    </CRow>
  );
};

// ---------- main user page ----------

const SalaryIncrementUserPage = () => {
  const accessToken = useSelector((s) => s.user?.accessToken);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [letters, setLetters] = useState([]);
  const [period, setPeriod] = useState(null);
  const [decision, setDecision] = useState(null);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [submitting, setSubmitting] = useState(null); // 'Approved' | 'Rejected' | null
  const [showAgreement, setShowAgreement] = useState(false);

  // The employee must open the full Agreement and then tick the confirmation
  // before either decision button becomes available. Both halves matter: the
  // Acknowledgment clause turns on them having READ it, so a tick alone —
  // with the text never opened — would be a confirmation of nothing.
  //
  // This gates Decline as well as Accept. Declining forfeits the bonus, so it
  // is no less of a decision to make uninformed.
  const [hasOpenedAgreement, setHasOpenedAgreement] = useState(false);
  const [readConfirmed, setReadConfirmed] = useState(false);

  const openAgreement = () => {
    setHasOpenedAgreement(true);
    setShowAgreement(true);
  };

  const loadMy = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`${API_BASE}/my`, {
        headers: { 'x-access-token': accessToken || '' },
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(body.message || `Server returned ${resp.status}`);
        return;
      }
      setLetters(Array.isArray(body.letters) ? body.letters : []);
      setPeriod(body.period || null);
      setDecision(body.decision || null);
      setEmployeeInfo(body.employee_info || null);
    } catch (e) {
      setError((e && e.message) || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) loadMy();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const submitDecision = async (which) => {
    if (!period) return;
    // Belt and braces — the buttons are disabled until this holds, but a
    // decision must never reach the server without the confirmation that is
    // recorded alongside it.
    if (!readConfirmed) {
      toast.error('Please open the full Agreement and confirm you have read it first.');
      return;
    }
    setSubmitting(which);
    try {
      const resp = await fetch(`${API_BASE}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken || '',
        },
        body: JSON.stringify({
          fiscal_year: period.fiscal_year,
          decision: which,
          // Stored on the decision record so an acceptance can be tied to the
          // exact revision of the text the employee saw.
          agreement_version: AGREEMENT_VERSION,
          agreement_read_confirmed: true,
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast.error(body.message || `Failed to record decision (${resp.status})`);
        return;
      }
      toast.success(
        which === 'Approved'
          ? 'Commitment accepted. You can change this until the deadline.'
          : 'Commitment declined. You can change this until the deadline.'
      );
      await loadMy();
    } catch (e) {
      toast.error((e && e.message) || 'Network error');
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <CSpinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <CCard>
        <CCardBody>
          <CAlert color="danger" className="mb-0">
            {error}
          </CAlert>
        </CCardBody>
      </CCard>
    );
  }

  // Find a letter that matches the active period's fiscal year (if any).
  // The period may exist (commitment cycle ran) before the letter is imported,
  // so a missing match is fine — that's the "decision recorded, awaiting HR" state.
  const activeLetter =
    period && letters.find((l) => l.fiscal_year === period.fiscal_year);

  const otherLetters = letters.filter((l) => !activeLetter || l._id !== activeLetter._id);

  // ===== State A: no period at all and no letters anywhere =====
  if (!period && letters.length === 0) {
    return (
      <CCard>
        <CCardHeader>
          <h4 className="mb-0">Salary Increment & Bonus</h4>
        </CCardHeader>
        <CCardBody>
          <p className="text-medium-emphasis mb-0">
            No commitment cycle has been opened yet, and no salary letter is on file
            for you. When HR opens the commitment period, you will be able to approve
            or reject the 6-month commitment here.
          </p>
        </CCardBody>
      </CCard>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" />

      {/* ===== Period banner — always visible when a period exists ===== */}
      {period && (
        <CCard className="mb-4">
          <CCardHeader>
            <h4 className="mb-0">
              Salary Increment & Bonus — FY {period.fiscal_year}
            </h4>
            <small className="text-medium-emphasis">
              Commitment window: {fmtDateTime(period.start_date)} →{' '}
              {fmtDateTime(period.end_date)}
            </small>
          </CCardHeader>
          <CCardBody>
            {/* Period not started yet */}
            {!period.has_started && (
              <CAlert color="info" className="mb-0">
                The commitment window opens on{' '}
                <strong>{fmtDateTime(period.start_date)}</strong>. Please return then
                to record your decision.
              </CAlert>
            )}

            {/* Period currently open */}
            {period.is_open && (
              <>
                <p>
                  The commitment window is <strong>open until {fmtDateTime(period.end_date)}</strong>.
                  You can record or change your decision freely until the deadline.
                </p>
                <CAlert color="light" className="mb-2">
                  {buildCommitmentAcknowledgment(fiscalYearLabel(period))}
                </CAlert>
                <div className="mb-3">
                  <CButton
                    color="link"
                    className="p-0"
                    style={{ fontSize: 13 }}
                    onClick={openAgreement}
                  >
                    View Full Agreement →
                  </CButton>
                </div>

                {/* HRIS is the only source for the identity printed on the
                    agreement. When it cannot be matched the fields are left
                    blank rather than filled from the portal's own record, so
                    the gap has to be surfaced instead of passing unnoticed. */}
                {employeeInfo &&
                  (employeeInfo.employee_id_source === 'missing' ||
                    employeeInfo.address_source === 'missing') && (
                    <CAlert color="warning" className="py-2" style={{ fontSize: 13 }}>
                      Some of your details are missing from the HR system and will appear blank
                      on the agreement
                      {employeeInfo.employee_id_source === 'missing' &&
                      employeeInfo.address_source === 'missing'
                        ? ' (Employee ID and address)'
                        : employeeInfo.employee_id_source === 'missing'
                          ? ' (Employee ID)'
                          : ' (address)'}
                      . You can still record your decision — please ask HR to complete your
                      record.
                    </CAlert>
                  )}

                {/* Read confirmation. The checkbox stays disabled until the
                    Agreement has actually been opened, so ticking it is a
                    statement about something the employee has seen. */}
                <div
                  className="mb-3 p-3"
                  style={{
                    border: '1px solid #e3e7ee',
                    borderRadius: 8,
                    background: readConfirmed ? '#f2f9f4' : '#fbfcfe',
                  }}
                >
                  <CFormCheck
                    id="agreementReadConfirm"
                    checked={readConfirmed}
                    disabled={!hasOpenedAgreement}
                    onChange={(e) => setReadConfirmed(e.target.checked)}
                    label={
                      <span style={{ fontSize: 14 }}>
                        I confirm that I have <strong>read and understood</strong> the full
                        Obligatory Service Agreement, including the repayment obligation in
                        Section 4 and the recovery mechanism in Section 5.
                      </span>
                    }
                  />
                  {!hasOpenedAgreement && (
                    <div className="text-medium-emphasis mt-2" style={{ fontSize: 12.5 }}>
                      Open <strong>View Full Agreement</strong> above to enable this
                      confirmation.
                    </div>
                  )}
                </div>

                {decision ? (
                  <CAlert
                    color={decision.decision === 'Approved' ? 'success' : 'warning'}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <div>
                      Your current decision:{' '}
                      <strong>{decisionLabel(decision.decision)}</strong>
                      <small className="text-medium-emphasis ms-2">
                        ({fmtDateTime(decision.decided_at)}, flip
                        {decision.flips === 1 ? '' : 's'}: {decision.flips})
                      </small>
                    </div>
                    <CButton
                      color={decision.decision === 'Approved' ? 'warning' : 'success'}
                      disabled={!!submitting || !readConfirmed}
                      onClick={() =>
                        submitDecision(
                          decision.decision === 'Approved' ? 'Rejected' : 'Approved'
                        )
                      }
                    >
                      {submitting ? (
                        <>
                          <CSpinner size="sm" className="me-2" /> Saving…
                        </>
                      ) : decision.decision === 'Approved' ? (
                        'Change to Decline'
                      ) : (
                        'Change to Accept'
                      )}
                    </CButton>
                  </CAlert>
                ) : (
                  <>
                    <div className="d-flex" style={{ gap: 12 }}>
                      <CButton
                        color="success"
                        disabled={submitting !== null || !readConfirmed}
                        onClick={() => submitDecision('Approved')}
                      >
                        {submitting === 'Approved' ? (
                          <>
                            <CSpinner size="sm" className="me-2" /> Submitting…
                          </>
                        ) : (
                          'Accept'
                        )}
                      </CButton>
                      <CButton
                        color="warning"
                        disabled={submitting !== null || !readConfirmed}
                        onClick={() => submitDecision('Rejected')}
                      >
                        {submitting === 'Rejected' ? (
                          <>
                            <CSpinner size="sm" className="me-2" /> Submitting…
                          </>
                        ) : (
                          'Decline'
                        )}
                      </CButton>
                    </div>
                    {!readConfirmed && (
                      <div className="text-medium-emphasis mt-2" style={{ fontSize: 12.5 }}>
                        Both options unlock once you have opened the Agreement and confirmed
                        you have read it.
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* Period closed */}
            {period.has_ended && (
              <>
                {decision ? (
                  <CAlert
                    color={decision.decision === 'Approved' ? 'success' : 'warning'}
                    className="mb-0"
                  >
                    The commitment window has ended. Your final decision is{' '}
                    <strong>{decisionLabel(decision.decision)}</strong>{' '}
                    <small>({fmtDateTime(decision.decided_at)})</small>.
                    {!activeLetter && (
                      <>
                        {' '}HR is preparing the salary increment letter; it will appear
                        here once uploaded.
                      </>
                    )}
                  </CAlert>
                ) : (
                  <CAlert color="secondary" className="mb-0">
                    The commitment window has ended and no decision was recorded against
                    your account. If this is unexpected, please contact HR.
                  </CAlert>
                )}
              </>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* ===== Active letter card (if any letter exists for the active FY) ===== */}
      {activeLetter && (
        <>
          <CCard className="mb-4">
            <CCardHeader>
              <h5 className="mb-0">
                Your Salary Increment Letter — FY {activeLetter.fiscal_year}
              </h5>
              <small className="text-medium-emphasis">
                Status: <CBadge color={statusColor(activeLetter.status)}>{activeLetter.status}</CBadge>
              </small>
            </CCardHeader>
            <CCardBody>
              <LetterSummary letter={activeLetter} />
            </CCardBody>
          </CCard>

          {activeLetter.status === 'Committed' && (
            <CCard className="mb-4 border-success">
              <CCardHeader className="bg-success text-white">
                <h5 className="mb-0">Print Your Letter</h5>
              </CCardHeader>
              <CCardBody>
                <p className="mb-3">
                  Your letter is ready. The reference number is generated by the system
                  the first time it is printed and remains the same for every print
                  thereafter.
                </p>
                <SalaryIncrementLetterPrint
                  letter={activeLetter}
                  onPrinted={() => loadMy()}
                />
              </CCardBody>
            </CCard>
          )}

          {activeLetter.status === 'Revoked' && (
            <CCard className="mb-4 border-danger">
              <CCardHeader className="bg-danger text-white">
                <h5 className="mb-0">Letter Revoked</h5>
              </CCardHeader>
              <CCardBody>
                <p className="mb-0">
                  This letter was revoked on{' '}
                  <strong>{fmtDate(activeLetter.revoked_date)}</strong>.
                  {activeLetter.revoke_reason && (
                    <> Reason: {activeLetter.revoke_reason}.</>
                  )}
                </p>
              </CCardBody>
            </CCard>
          )}
        </>
      )}

      {/* ===== Previous-year letters card ===== */}
      {otherLetters.length > 0 && (
        <CCard>
          <CCardHeader>
            <h6 className="mb-0">Previous Years ({otherLetters.length})</h6>
          </CCardHeader>
          <CCardBody>
            {otherLetters.map((l, i) => (
              <div
                key={l._id}
                className={i < otherLetters.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}
              >
                <div>
                  <strong>FY {l.fiscal_year}</strong>{' '}
                  <CBadge color={statusColor(l.status)}>{l.status}</CBadge>
                  {l.commitment_decision && (
                    <CBadge color={decisionColor(l.commitment_decision)} className="ms-1">
                      {decisionLabel(l.commitment_decision)}
                    </CBadge>
                  )}
                </div>
                <small className="text-medium-emphasis">
                  {l.category}
                  {(l.import_batch_id?.reference_number || l.reference_number) && (
                    <> · Ref {l.import_batch_id?.reference_number || l.reference_number}</>
                  )}
                  {l.import_batch_id?.letter_date && (
                    <> · Issued {fmtDate(l.import_batch_id.letter_date)}</>
                  )}
                  {l.revoked_date && <> · Revoked {fmtDate(l.revoked_date)}</>}
                </small>
              </div>
            ))}
          </CCardBody>
        </CCard>
      )}

      <FullAgreementModal
        visible={showAgreement}
        onClose={() => setShowAgreement(false)}
        employeeInfo={employeeInfo}
        period={period}
        decision={decision}
      />
    </>
  );
};

// =====================================================================
// Full Agreement modal — shows the ZB Obligatory Service Agreement and
// lets the user download a PDF of it.
// =====================================================================
const FullAgreementModal = ({ visible, onClose, employeeInfo, period, decision }) => {
  const sections = buildAgreementSections({ employeeInfo, period, decision });
  const todayStr = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDownload = () => {
    try {
      const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
      const margin = 22;
      const lineWidth = 210 - margin * 2;
      let y = 0;

      const newPageHeader = () => {
        // Red vertical bar on the left edge of every page
        pdf.setDrawColor(255, 0, 0);
        pdf.setLineWidth(0.6);
        pdf.line(14, 14, 14, 297 - 14);

        // Top-left logo
        try {
          const img = document.querySelector('img[data-pdf-logo="1"]');
          if (img) pdf.addImage(img, 'PNG', 18, 14, 32, 12);
        } catch (_) {
          // logo embed best-effort; continue without it on failure
        }

        // Centered title
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(FULL_AGREEMENT_TITLE, 105, 22, { align: 'center' });
        pdf.setFontSize(11);
        pdf.text(FULL_AGREEMENT_SUBTITLE, 105, 28, { align: 'center' });

        // Underline under subtitle
        pdf.setLineWidth(0.3);
        pdf.line(45, 30, 165, 30);

        // Date right-aligned
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.text(`Date: ${todayStr}`, 210 - margin, 36, { align: 'right' });

        // Footer
        pdf.setFontSize(7.5);
        pdf.setTextColor(85, 85, 85);
        pdf.text(
          'Zemen Bank S.C.  ·  Ras Abebe Aregay St.  ·  P.O.Box 1212 Addis Ababa  ·  www.zemenbank.com',
          105, 297 - 8, { align: 'center' }
        );
        pdf.setTextColor(0, 0, 0);

        y = 44;
      };

      const ensureSpace = (need) => {
        if (y + need > 297 - 18) {
          pdf.addPage();
          newPageHeader();
        }
      };

      newPageHeader();
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      for (const section of sections) {
        if (section.type === 'h') {
          ensureSpace(8);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(11);
          pdf.text(section.text, margin, y);
          y += 6;
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(10);
        } else if (section.type === 'divider') {
          ensureSpace(6);
          pdf.setLineWidth(0.2);
          pdf.line(margin, y, 210 - margin, y);
          y += 5;
        } else if (section.type === 'bullet') {
          const lines = pdf.splitTextToSize(`•  ${section.text}`, lineWidth - 6);
          ensureSpace(lines.length * 5 + 1);
          pdf.text(lines, margin + 6, y);
          y += lines.length * 5 + 1;
        } else {
          const lines = pdf.splitTextToSize(section.text, lineWidth);
          ensureSpace(lines.length * 5 + 2);
          pdf.text(lines, margin, y);
          y += lines.length * 5 + 2;
        }
      }

      pdf.save('ZB_Obligatory_Service_Agreement.pdf');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('PDF generation failed', e);
    }
  };

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      scrollable
      backdrop="static"
      alignment="top"
    >
      <CModalHeader>
        <CModalTitle>Service Agreement</CModalTitle>
      </CModalHeader>
      <CModalBody style={{ background: '#eef0f4', padding: 16 }}>
        {/* A hidden image, present in the DOM so jsPDF can pull it for the
            PDF letterhead. */}
        <img
          src={logoImage}
          alt=""
          data-pdf-logo="1"
          style={{ display: 'none' }}
        />

        {/* Letter-styled agreement page */}
        <div
          style={{
            width: '210mm',
            maxWidth: '100%',
            margin: '0 auto',
            background: '#ffffff',
            position: 'relative',
            fontFamily: '"Times New Roman", Times, serif',
            fontSize: 12.5,
            lineHeight: 1.55,
            padding: '20mm 22mm 24mm 28mm',
            boxSizing: 'border-box',
            boxShadow: '0 6px 24px rgba(15,23,42,0.10)',
            border: '1px solid #e0e0e0',
            color: '#1a1a1a',
          }}
        >
          {/* Red vertical accent */}
          <div
            style={{
              position: 'absolute',
              top: 14,
              left: 14,
              bottom: 14,
              width: 2,
              background: 'red',
            }}
          />

          {/* Watermark */}
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${watermarkImage})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '60%',
              opacity: 0.05,
              pointerEvents: 'none',
              transform: 'rotate(-1deg)',
            }}
          />

          {/* Logo */}
          <img
            src={logoImage}
            alt="Zemen Bank"
            style={{
              position: 'absolute',
              top: 18,
              left: 22,
              width: 80,
            }}
          />

          {/* Header */}
          <div style={{ position: 'relative', textAlign: 'center', marginTop: 30, marginBottom: 18 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: 0.5 }}>
              {FULL_AGREEMENT_TITLE}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                marginTop: 4,
                textDecoration: 'underline',
              }}
            >
              {FULL_AGREEMENT_SUBTITLE}
            </div>
          </div>

          {/* Right-aligned date */}
          <div style={{ position: 'relative', textAlign: 'right', marginBottom: 18 }}>
            <div>
              <strong>Date:</strong> {todayStr}
            </div>
          </div>

          {/* Body sections */}
          <div style={{ position: 'relative' }}>
            {sections.map((section, idx) => {
              if (section.type === 'h') {
                return (
                  <div
                    key={idx}
                    style={{ fontWeight: 700, marginTop: 12, marginBottom: 4 }}
                  >
                    {section.text}
                  </div>
                );
              }
              if (section.type === 'divider') {
                return (
                  <hr
                    key={idx}
                    style={{
                      border: 'none',
                      borderTop: '1px dashed #b0b6bf',
                      margin: '12px 0',
                    }}
                  />
                );
              }
              if (section.type === 'bullet') {
                return (
                  <div
                    key={idx}
                    style={{ paddingLeft: 16, position: 'relative', marginBottom: 4 }}
                  >
                    <span style={{ position: 'absolute', left: 0 }}>•</span>
                    {section.text}
                  </div>
                );
              }
              return (
                <p key={idx} style={{ textAlign: 'justify', margin: '0 0 8px' }}>
                  {section.text}
                </p>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              position: 'relative',
              marginTop: 24,
              paddingTop: 8,
              borderTop: '1px solid #d1d5db',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <div style={{ fontSize: 9.5, color: '#555' }}>
              <div style={{ fontWeight: 700, color: '#1a1a1a' }}>
                ዘመን ባንክ አ.ማ. / Zemen Bank S.C.
              </div>
              <div>Ras Abebe Aregay St. · P.O.Box 1212 Addis Ababa, Ethiopia</div>
              <div>SWIFT: ZEMEETAA · Call Center 6500 · info@zemenbank.com</div>
              <div style={{ color: 'red', fontWeight: 700 }}>www.zemenbank.com</div>
            </div>
            <img src={socialImage} alt="" style={{ height: 18, opacity: 0.85 }} />
          </div>
        </div>
      </CModalBody>
      <CModalFooter>
        <CButton color="success" variant="outline" onClick={handleDownload}>
          Download Agreement (PDF)
        </CButton>
        <CButton color="secondary" onClick={onClose}>
          Close
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default SalaryIncrementUserPage;
