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
  CFormCheck,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react';

const API_BASE = 'https://aps2.zemenbank.com/zbss/api/salary-increment';

const COMMITMENT_TERMS = `By accepting this letter you acknowledge and agree to remain employed with Zemen Bank for a minimum period of six (6) months from the effective date of the salary increment.

If you voluntarily resign or otherwise leave the Bank's employment before the end of this six-month period, you may be required to repay all or part of the salary increase and any one-time performance-based bonus received under this letter, in accordance with the Bank's Human Resources policies.

This acceptance is final and is recorded with a timestamp for audit purposes.`;

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

const fmtMoney = (n) => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-';
  return Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
};

const statusColor = (s) =>
  s === 'Committed' ? 'success' : s === 'Revoked' ? 'danger' : 'warning';

const RegularSummary = ({ letter }) => (
  <div>
    <p className="mb-1">
      From <strong>Birr {fmtMoney(letter.old_salary)}.00</strong> to{' '}
      <strong>Birr {fmtMoney(letter.new_salary)}.00</strong>
    </p>
    {letter.job_grade && (
      <p className="mb-1">
        Job Grade <strong>{letter.job_grade}</strong>
        {letter.step ? (
          <>
            {' '}step <strong>{letter.step}</strong>
          </>
        ) : null}
      </p>
    )}
    {letter.category === 'Full' && letter.bonus_months != null && (
      <p className="mb-0">
        Bonus: <strong>{letter.bonus_months} month{Number(letter.bonus_months) === 1 ? '' : "'s"} salary</strong>
      </p>
    )}
    {letter.category === 'Proportionate' && letter.bonus_months != null && (
      <p className="mb-0">
        Bonus: proportionate amount of{' '}
        <strong>{letter.bonus_months} month{Number(letter.bonus_months) === 1 ? '' : "'s"} salary</strong>
      </p>
    )}
    {letter.category === 'Discipline' &&
      letter.bonus_months != null &&
      letter.discipline_pct != null && (
        <p className="mb-0">
          Bonus: <strong>{Math.round(letter.discipline_pct * 100)}%</strong> of{' '}
          <strong>{letter.bonus_months} month{Number(letter.bonus_months) === 1 ? '' : "'s"} salary</strong>
        </p>
      )}
    {letter.category === 'Salary Only' && (
      <p className="mb-0 text-medium-emphasis">No bonus included for this category.</p>
    )}
  </div>
);

const PromotionSummary = ({ letter }) => (
  <div>
    {(letter.old_job_position || letter.new_job_position) && (
      <p className="mb-1">
        Promotion: <strong>{letter.old_job_position || '-'}</strong> →{' '}
        <strong>{letter.new_job_position || '-'}</strong>
      </p>
    )}
    <p className="mb-1">
      Salary increase: <strong>Birr {fmtMoney(letter.old_salary)}.00</strong> to{' '}
      <strong>Birr {fmtMoney(letter.new_salary)}.00</strong>
    </p>
    {letter.salary_after_promotion_adjustment != null && (
      <p className="mb-1">
        Salary after promotion adjustment:{' '}
        <strong>Birr {fmtMoney(letter.salary_after_promotion_adjustment)}.00</strong>
      </p>
    )}
    {letter.new_job_grade && (
      <p className="mb-1">
        New Job Grade <strong>{letter.new_job_grade}</strong>
        {letter.new_step ? (
          <>
            {' '}step <strong>{letter.new_step}</strong>
          </>
        ) : null}
      </p>
    )}
    {letter.bonus_months != null && (
      <p className="mb-0">
        Bonus: <strong>{letter.bonus_months} month{Number(letter.bonus_months) === 1 ? '' : "'s"} salary</strong>
      </p>
    )}
  </div>
);

const LetterSummary = ({ letter }) => {
  const batch = letter.import_batch_id || {};
  return (
    <CRow>
      <CCol md={6}>
        <h6>Employee</h6>
        <p>{letter.employee_name}</p>

        <h6>Category</h6>
        <p>{letter.category}</p>

        <h6>Reference Number</h6>
        <p>{batch.reference_number || '-'}</p>
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

        <h6>Status</h6>
        <CBadge color={statusColor(letter.status)}>{letter.status}</CBadge>
      </CCol>
      <CCol xs={12} className="mt-3">
        <h6>Salary Change</h6>
        {letter.category === 'Promotion' ? (
          <PromotionSummary letter={letter} />
        ) : (
          <RegularSummary letter={letter} />
        )}
      </CCol>
    </CRow>
  );
};

const PreviousLetters = ({ letters }) => (
  <CCard>
    <CCardHeader>
      <h6 className="mb-0">Previous Years ({letters.length})</h6>
    </CCardHeader>
    <CCardBody>
      {letters.map((l, i) => (
        <div
          key={l._id}
          className={i < letters.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}
        >
          <div>
            <strong>FY {l.fiscal_year}</strong>{' '}
            <CBadge color={statusColor(l.status)}>{l.status}</CBadge>
          </div>
          <small className="text-medium-emphasis">
            {l.category}
            {l.import_batch_id?.letter_date && (
              <> · Issued {fmtDate(l.import_batch_id.letter_date)}</>
            )}
            {l.commitment_date && <> · Accepted {fmtDate(l.commitment_date)}</>}
            {l.revoked_date && <> · Revoked {fmtDate(l.revoked_date)}</>}
          </small>
        </div>
      ))}
    </CCardBody>
  </CCard>
);

const SalaryIncrementUserPage = () => {
  const accessToken = useSelector((s) => s.user?.accessToken);
  const [loading, setLoading] = useState(true);
  const [letters, setLetters] = useState([]);
  const [error, setError] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [committing, setCommitting] = useState(false);

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
        setLetters([]);
        return;
      }
      setLetters(Array.isArray(body.letters) ? body.letters : []);
    } catch (e) {
      setError((e && e.message) || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) loadMy();
    else setLoading(false);
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async (letter) => {
    if (!letter || !letter._id) return;
    setCommitting(true);
    try {
      const resp = await fetch(`${API_BASE}/commit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken || '',
        },
        body: JSON.stringify({ id: letter._id }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast.error(body.message || `Failed to accept commitment (${resp.status})`);
        return;
      }
      toast.success('Commitment accepted. Your letter is now valid.');
      setAgreed(false);
      await loadMy();
    } catch (e) {
      toast.error((e && e.message) || 'Network error');
    } finally {
      setCommitting(false);
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

  if (letters.length === 0) {
    return (
      <CCard>
        <CCardHeader>
          <h4 className="mb-0">Salary Increment & Bonus</h4>
        </CCardHeader>
        <CCardBody>
          <p className="text-medium-emphasis mb-0">
            You have no salary increment letter on file at this time.
          </p>
        </CCardBody>
      </CCard>
    );
  }

  // API returns letters newest first.
  const latest = letters[0];
  const others = letters.slice(1);

  return (
    <>
      <ToastContainer position="top-right" />

      <CCard className="mb-4">
        <CCardHeader>
          <h4 className="mb-0">Salary Increment & Bonus</h4>
          <small className="text-medium-emphasis">Fiscal Year {latest.fiscal_year}</small>
        </CCardHeader>
        <CCardBody>
          <LetterSummary letter={latest} />
        </CCardBody>
      </CCard>

      {latest.status === 'Imported' && (
        <CCard className="mb-4 border-warning">
          <CCardHeader className="bg-warning text-dark">
            <h5 className="mb-0">6-Month Commitment Required</h5>
          </CCardHeader>
          <CCardBody>
            <p style={{ whiteSpace: 'pre-wrap' }}>{COMMITMENT_TERMS}</p>
            <CFormCheck
              id="agree-commitment"
              label="I have read and accept the 6-month commitment terms above."
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <div className="mt-3">
              <CButton
                color="primary"
                disabled={!agreed || committing}
                onClick={() => handleAccept(latest)}
              >
                {committing ? (
                  <>
                    <CSpinner size="sm" className="me-2" /> Accepting…
                  </>
                ) : (
                  'Accept Commitment'
                )}
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      )}

      {latest.status === 'Committed' && (
        <CCard className="mb-4 border-success">
          <CCardHeader className="bg-success text-white">
            <h5 className="mb-0">Commitment Accepted</h5>
          </CCardHeader>
          <CCardBody>
            <p>
              You accepted the 6-month commitment on{' '}
              <strong>{fmtDate(latest.commitment_date)}</strong>. Your salary increment
              letter is now active.
            </p>
            <CAlert color="info" className="mb-0">
              The printable letter view is being prepared. The "Print Letter" button will
              appear here in the next release.
            </CAlert>
          </CCardBody>
        </CCard>
      )}

      {latest.status === 'Revoked' && (
        <CCard className="mb-4 border-danger">
          <CCardHeader className="bg-danger text-white">
            <h5 className="mb-0">Letter Revoked</h5>
          </CCardHeader>
          <CCardBody>
            <p className="mb-0">
              This letter was revoked on{' '}
              <strong>{fmtDate(latest.revoked_date)}</strong>.
              {latest.revoke_reason && <> Reason: {latest.revoke_reason}.</>}
            </p>
          </CCardBody>
        </CCard>
      )}

      {others.length > 0 && <PreviousLetters letters={others} />}
    </>
  );
};

export default SalaryIncrementUserPage;
