import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CForm,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CRow,
  CCol,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react';
import { API_BASE as API_ROOT } from '../../../api/base';

const API_BASE = `${API_ROOT}/salary-increment`;

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

const toInputDate = (d) => {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
};

const SalaryIncrementPeriod = () => {
  const accessToken = useSelector((s) => s.user?.accessToken);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(null);

  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPeriod = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/period`, {
        headers: { 'x-access-token': accessToken || '' },
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast.error(body.message || 'Failed to load period');
        return;
      }
      const p = body.period;
      setPeriod(p);
      if (p) {
        setFiscalYear(p.fiscal_year);
        setStartDate(toInputDate(p.start_date));
        setEndDate(toInputDate(p.end_date));
        setNotes(p.notes || '');
      }
    } catch (e) {
      toast.error((e && e.message) || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) loadPeriod();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!fiscalYear || !startDate || !endDate) {
      toast.error('Fiscal year, start date, and end date are required.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      toast.error('End date must be after start date.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch(`${API_BASE}/period`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken || '',
        },
        body: JSON.stringify({
          fiscal_year: Number(fiscalYear),
          start_date: startDate,
          end_date: endDate,
          notes,
        }),
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        toast.error(body.message || `Server returned ${resp.status}`);
        return;
      }
      toast.success('Commitment period saved.');
      await loadPeriod();
    } catch (e) {
      toast.error((e && e.message) || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const now = new Date();
  const isOpen = period && new Date(period.start_date) <= now && now <= new Date(period.end_date);
  const hasEnded = period && now > new Date(period.end_date);

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-4">
        <CCardHeader>
          <h4 className="mb-0">Commitment Period</h4>
          <small className="text-medium-emphasis">
            Define the window during which employees can approve or reject the
            6-month commitment. Their decisions feed the salary-increment Excel
            import.
          </small>
        </CCardHeader>
        <CCardBody>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 24 }}>
              <CSpinner color="primary" />
            </div>
          ) : (
            <>
              {period && (
                <CAlert
                  color={isOpen ? 'success' : hasEnded ? 'secondary' : 'info'}
                  className="d-flex align-items-center justify-content-between"
                >
                  <div>
                    <strong>FY {period.fiscal_year}</strong>{' '}
                    <CBadge color={isOpen ? 'success' : hasEnded ? 'secondary' : 'info'}>
                      {isOpen ? 'Open' : hasEnded ? 'Closed' : 'Scheduled'}
                    </CBadge>
                    <div className="mt-1">
                      {fmtDateTime(period.start_date)} → {fmtDateTime(period.end_date)}
                    </div>
                  </div>
                </CAlert>
              )}

              <CForm onSubmit={handleSave}>
                <CRow className="mb-3">
                  <CCol md={3}>
                    <CFormLabel htmlFor="fiscal_year">Fiscal Year</CFormLabel>
                    <CFormInput
                      type="number"
                      id="fiscal_year"
                      value={fiscalYear}
                      onChange={(e) => setFiscalYear(e.target.value)}
                      min={2000}
                      max={3000}
                      required
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel htmlFor="start_date">Start Date</CFormLabel>
                    <CFormInput
                      type="date"
                      id="start_date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </CCol>
                  <CCol md={5}>
                    <CFormLabel htmlFor="end_date">End Date (deadline)</CFormLabel>
                    <CFormInput
                      type="date"
                      id="end_date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                    <small className="text-medium-emphasis">
                      To extend the deadline later, simply re-submit this form with a later
                      end date.
                    </small>
                  </CCol>
                </CRow>

                <CRow className="mb-3">
                  <CCol>
                    <CFormLabel htmlFor="notes">Notes (optional)</CFormLabel>
                    <CFormTextarea
                      id="notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Internal note about this commitment cycle…"
                    />
                  </CCol>
                </CRow>

                <CButton type="submit" color="primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <CSpinner size="sm" className="me-2" /> Saving…
                    </>
                  ) : period ? (
                    'Update Period'
                  ) : (
                    'Create Period'
                  )}
                </CButton>
              </CForm>

              {period && hasEnded && (
                <CAlert color="warning" className="mt-3 mb-0">
                  This period has closed. Use the "All Letters" page to download the
                  decisions export, then prepare and upload the salary-increment
                  workbook.
                </CAlert>
              )}
            </>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default SalaryIncrementPeriod;
