import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CFormLabel,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_BASE = 'https://aps2.zemenbank.com/zbss/api/salary-increment';

const STAT_TILE_COLORS = {
  Imported: 'warning',
  Committed: 'success',
  Revoked: 'danger',
};

const Tile = ({ label, value, sub, color }) => (
  <div
    style={{
      padding: 14,
      borderRadius: 12,
      background: '#fff',
      border: '1px solid #d1d5db',
      height: '100%',
    }}
  >
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: '#6b7280' }}>
      {label.toUpperCase()}
    </div>
    <div
      style={{
        fontSize: 28,
        fontWeight: 700,
        marginTop: 4,
        color: color || '#1a1a1a',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 11.5, color: '#6b7280', marginTop: 2 }}>{sub}</div>
    )}
  </div>
);

const BreakdownRow = ({ items, colorMap }) => {
  const entries = Object.entries(items || {});
  const total = entries.reduce((acc, [, v]) => acc + (Number(v) || 0), 0);
  if (entries.length === 0) {
    return <div className="text-medium-emphasis" style={{ fontSize: 12 }}>No data.</div>;
  }
  return (
    <div>
      {entries.map(([k, v]) => {
        const pct = total === 0 ? 0 : Math.round((Number(v) / total) * 100);
        return (
          <div key={k} className="mb-2">
            <div className="d-flex justify-content-between" style={{ fontSize: 12.5 }}>
              <span>
                {colorMap && colorMap[k] ? (
                  <CBadge color={colorMap[k]} className="me-2">
                    {k}
                  </CBadge>
                ) : (
                  <strong>{k}</strong>
                )}
              </span>
              <span className="text-medium-emphasis font-monospace">
                {v} <span style={{ fontSize: 11 }}>({pct}%)</span>
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 4,
                background: '#e5e7eb',
                overflow: 'hidden',
                marginTop: 3,
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: '#3b82f6',
                  transition: 'width .3s',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SalaryIncrementAnalytics = () => {
  const accessToken = useSelector((s) => s.user?.accessToken);
  const [fiscalYear, setFiscalYear] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pre-fill from latest period (same convention as the list page).
  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${API_BASE}/period`, {
          headers: { 'x-access-token': accessToken },
        });
        const body = await resp.json().catch(() => ({}));
        if (cancelled) return;
        if (resp.ok && body.period && body.period.fiscal_year) {
          setFiscalYear(String(body.period.fiscal_year));
        } else {
          setFiscalYear(String(new Date().getFullYear()));
        }
      } catch {
        if (!cancelled) setFiscalYear(String(new Date().getFullYear()));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fiscalYear) params.set('fiscal_year', fiscalYear);
      const resp = await fetch(`${API_BASE}/analytics?${params.toString()}`, {
        headers: { 'x-access-token': accessToken || '' },
      });
      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        setError(body.message || `Server returned ${resp.status}`);
        setData(null);
        return;
      }
      setData(body);
    } catch (e) {
      setError((e && e.message) || 'Network error');
    } finally {
      setLoading(false);
    }
  }, [accessToken, fiscalYear]);

  useEffect(() => {
    if (accessToken && fiscalYear !== '') load();
  }, [accessToken, fiscalYear, load]);

  const printPct = data && data.total_letters > 0
    ? Math.round((data.printing.users_printed / data.total_letters) * 100)
    : 0;

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
            <div>
              <h4 className="mb-0">Salary Increment Analytics</h4>
              <small className="text-medium-emphasis">
                How many users committed, how many are printing, breakdown by category and status.
              </small>
            </div>
            <CButton
              color="secondary"
              variant="outline"
              disabled={loading}
              onClick={load}
            >
              {loading ? <><CSpinner size="sm" className="me-2" /> Loading…</> : 'Refresh'}
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3 g-2">
            <CCol md={3}>
              <CFormLabel>Fiscal Year</CFormLabel>
              <CFormInput
                type="number"
                value={fiscalYear}
                placeholder="All years"
                min={2000}
                max={3000}
                onChange={(e) => setFiscalYear(e.target.value)}
              />
              <small className="text-medium-emphasis">
                Leave blank to see aggregates across all imported years.
              </small>
            </CCol>
          </CRow>

          {error && <CAlert color="danger">{error}</CAlert>}

          {data && (
            <>
              {/* Headline tiles */}
              <CRow className="g-3 mb-4">
                <CCol md={3} sm={6}>
                  <Tile
                    label="Total letters"
                    value={data.total_letters}
                    sub={data.fiscal_year ? `FY ${data.fiscal_year}` : 'All fiscal years'}
                  />
                </CCol>
                <CCol md={3} sm={6}>
                  <Tile
                    label="Users printed"
                    value={data.printing.users_printed}
                    sub={`${printPct}% of total`}
                    color="#10b981"
                  />
                </CCol>
                <CCol md={3} sm={6}>
                  <Tile
                    label="Total print events"
                    value={data.printing.total_print_events}
                    sub="Counts every reprint"
                    color="#3b82f6"
                  />
                </CCol>
                <CCol md={3} sm={6}>
                  <Tile
                    label="Never printed"
                    value={data.printing.users_never_printed}
                    sub="Letter issued but not yet printed"
                    color="#b45309"
                  />
                </CCol>
              </CRow>

              <CRow className="g-3 mb-4">
                <CCol md={3} sm={6}>
                  <Tile
                    label="Decisions recorded"
                    value={data.commitments.total_decisions}
                    sub="Across the commitment period"
                  />
                </CCol>
                <CCol md={3} sm={6}>
                  <Tile
                    label="Accepted"
                    value={data.commitments.approved}
                    color="#10b981"
                  />
                </CCol>
                <CCol md={3} sm={6}>
                  <Tile
                    label="Declined"
                    value={data.commitments.rejected}
                    color="#b45309"
                  />
                </CCol>
                <CCol md={3} sm={6}>
                  <Tile
                    label="Users who flipped"
                    value={data.commitments.users_who_flipped}
                    sub="Changed their decision at least once"
                    color="#6366f1"
                  />
                </CCol>
              </CRow>

              {/* Breakdown panels */}
              <CRow className="g-3">
                <CCol md={4}>
                  <CCard>
                    <CCardHeader>
                      <strong>Status breakdown</strong>
                    </CCardHeader>
                    <CCardBody>
                      <BreakdownRow items={data.by_status} colorMap={STAT_TILE_COLORS} />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={4}>
                  <CCard>
                    <CCardHeader>
                      <strong>Category breakdown</strong>
                    </CCardHeader>
                    <CCardBody>
                      <BreakdownRow items={data.by_category} />
                    </CCardBody>
                  </CCard>
                </CCol>
                <CCol md={4}>
                  <CCard>
                    <CCardHeader>
                      <strong>Letters per fiscal year</strong>
                    </CCardHeader>
                    <CCardBody>
                      <BreakdownRow items={data.by_fiscal_year} />
                    </CCardBody>
                  </CCard>
                </CCol>
              </CRow>
            </>
          )}

          {!data && !loading && !error && (
            <CAlert color="info">No analytics data yet — pick a fiscal year above.</CAlert>
          )}
        </CCardBody>
      </CCard>
    </>
  );
};

export default SalaryIncrementAnalytics;
