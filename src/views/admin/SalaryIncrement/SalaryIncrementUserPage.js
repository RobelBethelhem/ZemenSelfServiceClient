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
} from '@coreui/react';
import SalaryIncrementLetterPrint from './SalaryIncrementLetterPrint';

const API_BASE = 'https://aps2.zemenbank.com/zbss/api/salary-increment';

const COMMITMENT_TERMS = `Approving this commitment means you agree to remain employed with Zemen Bank for a minimum period of six (6) months from the effective date of the salary increment.

If you voluntarily leave the Bank within this period after Approving, you may be required to repay all or part of the one-time performance-based bonus paid under your salary letter, in accordance with the Bank's HR policies.

You may flip your decision (Approve ↔ Reject) any number of times until the deadline. After the deadline your decision is final, the salary letter is prepared, and Rejected employees receive the salary increment with the bonus set to zero.`;

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

const decisionColor = (d) =>
  d === 'Approved' ? 'success' : d === 'Rejected' ? 'warning' : 'secondary';

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
        <p className="font-monospace">
          {letter.reference_number || (
            <span className="text-medium-emphasis">
              ZB/HC/INC/_____/{letter.fiscal_year}{' '}
              <small>(assigned on first print)</small>
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
            {letter.commitment_decision || 'Unknown'}
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
  const [submitting, setSubmitting] = useState(null); // 'Approved' | 'Rejected' | null

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
          : 'Commitment rejected. You can change this until the deadline.'
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
                <CAlert color="light" className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
                  {COMMITMENT_TERMS}
                </CAlert>

                {decision ? (
                  <CAlert
                    color={decision.decision === 'Approved' ? 'success' : 'warning'}
                    className="d-flex align-items-center justify-content-between"
                  >
                    <div>
                      Your current decision:{' '}
                      <strong>{decision.decision}</strong>
                      <small className="text-medium-emphasis ms-2">
                        ({fmtDateTime(decision.decided_at)}, flip
                        {decision.flips === 1 ? '' : 's'}: {decision.flips})
                      </small>
                    </div>
                    <CButton
                      color={decision.decision === 'Approved' ? 'warning' : 'success'}
                      disabled={!!submitting}
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
                        'Change to Reject'
                      ) : (
                        'Change to Approve'
                      )}
                    </CButton>
                  </CAlert>
                ) : (
                  <div className="d-flex" style={{ gap: 12 }}>
                    <CButton
                      color="success"
                      disabled={submitting !== null}
                      onClick={() => submitDecision('Approved')}
                    >
                      {submitting === 'Approved' ? (
                        <>
                          <CSpinner size="sm" className="me-2" /> Submitting…
                        </>
                      ) : (
                        'Approve Commitment'
                      )}
                    </CButton>
                    <CButton
                      color="warning"
                      disabled={submitting !== null}
                      onClick={() => submitDecision('Rejected')}
                    >
                      {submitting === 'Rejected' ? (
                        <>
                          <CSpinner size="sm" className="me-2" /> Submitting…
                        </>
                      ) : (
                        'Reject Commitment'
                      )}
                    </CButton>
                  </div>
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
                    <strong>{decision.decision}</strong>{' '}
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
                      {l.commitment_decision}
                    </CBadge>
                  )}
                </div>
                <small className="text-medium-emphasis">
                  {l.category}
                  {l.reference_number && <> · Ref {l.reference_number}</>}
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
    </>
  );
};

export default SalaryIncrementUserPage;
