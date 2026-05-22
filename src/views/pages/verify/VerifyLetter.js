import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CSpinner,
  CBadge,
} from '@coreui/react';
import zbLogo from '../../../assets/brand/zb.png';
import { API_BASE } from '../../../api/base';

const formatDate = (value) => {
  if (!value) return '-';
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return String(value);
  }
};

const StatusBanner = ({ status, revokedDate, rejectedDate }) => {
  const colorByStatus = {
    Viewed: '#1e8e3e',
    Pending: '#b08000',
    Rejected: '#c5221f',
    Revoked: '#c5221f',
  };
  const titleByStatus = {
    Viewed: 'Genuine Letter',
    Pending: 'Awaiting Approval',
    Rejected: 'Letter Rejected',
    Revoked: 'Letter Revoked',
  };
  const messageByStatus = {
    Viewed: 'This letter was issued by Zemen Bank and is currently valid.',
    Pending:
      'This request has not been approved yet. The recipient should not treat it as a valid letter.',
    Rejected: rejectedDate
      ? `This letter request was rejected on ${formatDate(rejectedDate)}.`
      : 'This letter request was rejected and is not valid.',
    Revoked: revokedDate
      ? `This letter was revoked on ${formatDate(revokedDate)} and is no longer valid.`
      : 'This letter has been revoked and is no longer valid.',
  };
  const color = colorByStatus[status] || '#c5221f';
  const title = titleByStatus[status] || 'Invalid Letter';
  const message =
    messageByStatus[status] || 'This reference does not correspond to a valid letter.';

  return (
    <div
      style={{
        background: color,
        color: 'white',
        padding: '18px 22px',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700 }}>{title}</div>
      <div style={{ marginTop: 4, opacity: 0.95 }}>{message}</div>
    </div>
  );
};

const Field = ({ label, value }) => (
  <div style={{ padding: '10px 0', borderBottom: '1px solid #eee' }}>
    <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
      {label}
    </div>
    <div style={{ fontSize: 16, color: '#111', marginTop: 2 }}>{value || '-'}</div>
  </div>
);

const VerifyLetter = () => {
  const { ref } = useParams();
  const [state, setState] = useState({ phase: 'loading', data: null, error: null });

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const response = await fetch(
          `${API_BASE}/public/verify?ref=${encodeURIComponent(ref)}`,
          { method: 'GET' },
        );
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.toLowerCase().includes('application/json');
        const body = isJson ? await response.json().catch(() => ({})) : null;
        if (cancelled) return;
        if (!isJson) {
          // Server returned HTML/text (likely "Cannot GET ..." from Express,
          // or an IIS/proxy error page). The endpoint is not reachable.
          setState({ phase: 'error', data: null, error: 'service_unavailable' });
          return;
        }
        if (response.ok) {
          setState({ phase: 'done', data: body, error: null });
        } else if (response.status === 404 && body && body.reason === 'not_found') {
          setState({ phase: 'done', data: { valid: false, reason: 'not_found' }, error: null });
        } else {
          setState({
            phase: 'error',
            data: null,
            error: (body && body.reason) || 'server_error',
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ phase: 'error', data: null, error: 'network' });
        }
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [ref]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f4f6fb 0%, #e9eef7 100%)',
        padding: '40px 16px',
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8} lg={6} xl={5}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img
                src={zbLogo}
                alt="Zemen Bank"
                style={{ height: 60, objectFit: 'contain' }}
              />
              <div
                style={{
                  marginTop: 10,
                  fontSize: 13,
                  color: '#374151',
                  letterSpacing: 0.4,
                  textTransform: 'uppercase',
                }}
              >
                Zemen Bank — Letter Verification Portal
              </div>
            </div>

            <CCard style={{ borderRadius: 10, overflow: 'hidden', border: 'none', boxShadow: '0 6px 24px rgba(15,23,42,0.08)' }}>
              {state.phase === 'loading' && (
                <CCardBody style={{ padding: 40, textAlign: 'center' }}>
                  <CSpinner color="primary" />
                  <div style={{ marginTop: 16, color: '#374151' }}>
                    Verifying letter <code>{ref}</code> …
                  </div>
                </CCardBody>
              )}

              {state.phase === 'error' && (
                <>
                  <StatusBanner status="Invalid" />
                  <CCardBody>
                    <p style={{ color: '#374151' }}>
                      {state.error === 'network'
                        ? 'We could not reach the verification server. Please check your internet connection and try again.'
                        : state.error === 'service_unavailable'
                        ? 'The verification service is currently unavailable. Please try again later, or contact Zemen Bank.'
                        : 'The verification service is temporarily unavailable. Please try again later.'}
                    </p>
                    <Field label="Reference Number" value={ref} />
                  </CCardBody>
                </>
              )}

              {state.phase === 'done' && state.data && (
                <>
                  <StatusBanner
                    status={
                      state.data.valid
                        ? state.data.status || 'Viewed'
                        : state.data.status || 'Invalid'
                    }
                    revokedDate={state.data.revoked_date}
                    rejectedDate={state.data.rejected_date}
                  />
                  <CCardBody>
                    {state.data.reason === 'not_found' ? (
                      <>
                        <p style={{ color: '#374151' }}>
                          No letter with this reference number was found in our records.
                          The letter you are holding may be fraudulent or the reference
                          number may have been entered incorrectly.
                        </p>
                        <Field label="Reference Number" value={ref} />
                      </>
                    ) : (
                      <>
                        <Field label="Reference Number" value={state.data.reference_number || ref} />
                        <Field label="Letter Type" value={state.data.letter_type} />
                        <Field label="Employee Name" value={state.data.employee_name} />
                        {state.data.status === 'Rejected' ? (
                          <Field
                            label="Rejected Date"
                            value={formatDate(state.data.rejected_date)}
                          />
                        ) : state.data.status === 'Revoked' ? (
                          <>
                            <Field
                              label="Issued Date"
                              value={formatDate(state.data.issued_date)}
                            />
                            <Field
                              label="Revoked Date"
                              value={formatDate(state.data.revoked_date)}
                            />
                          </>
                        ) : (
                          <Field
                            label="Issued Date"
                            value={formatDate(state.data.issued_date)}
                          />
                        )}
                        <div style={{ padding: '10px 0' }}>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#6b7280',
                              textTransform: 'uppercase',
                              letterSpacing: 0.5,
                            }}
                          >
                            Status
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <CBadge
                              color={
                                state.data.status === 'Viewed'
                                  ? 'success'
                                  : state.data.status === 'Pending'
                                  ? 'warning'
                                  : 'danger'
                              }
                            >
                              {state.data.status || (state.data.valid ? 'Valid' : 'Invalid')}
                            </CBadge>
                          </div>
                        </div>
                      </>
                    )}
                    <p style={{ marginTop: 18, fontSize: 12, color: '#6b7280' }}>
                      Please compare the details shown here with the printed letter. If
                      anything does not match, the letter should be treated as invalid.
                      For further assistance, contact Zemen Bank.
                    </p>
                  </CCardBody>
                </>
              )}
            </CCard>

            <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: '#6b7280' }}>
              © {new Date().getFullYear()} Zemen Bank S.C. — Self-Service Portal
            </div>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default VerifyLetter;
