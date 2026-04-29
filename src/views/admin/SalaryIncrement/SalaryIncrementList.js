import React, { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CBadge,
  CSpinner,
  CAlert,
} from '@coreui/react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SalaryIncrementLetterPrint from './SalaryIncrementLetterPrint';

const API_BASE = 'https://aps2.zemenbank.com/zbss/api/salary-increment';

const STATUS_COLORS = {
  Imported: 'warning',
  Committed: 'success',
  Revoked: 'danger',
};

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

const SalaryIncrementList = () => {
  const accessToken = useSelector((s) => s.user?.accessToken);

  // --- filter state (server-side) ---
  const [fiscalYear, setFiscalYear] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // --- pagination state ---
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

  // --- data state ---
  const [data, setData] = useState([]);
  const [totalRowCount, setTotalRowCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- revoke modal state ---
  const [revokeTarget, setRevokeTarget] = useState(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  // --- print modal state ---
  const [printTarget, setPrintTarget] = useState(null);

  // --- export ---
  const [exporting, setExporting] = useState(false);

  const handleExportDecisions = async () => {
    if (!fiscalYear) {
      toast.warn('Pick a Fiscal Year filter first.');
      return;
    }
    setExporting(true);
    try {
      const resp = await fetch(
        `${API_BASE}/decisions/export?fiscal_year=${encodeURIComponent(fiscalYear)}`,
        { headers: { 'x-access-token': accessToken || '' } }
      );
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({}));
        toast.error(body.message || `Export failed (${resp.status})`);
        return;
      }
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-decisions-fy-${fiscalYear}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Decisions export downloaded.');
    } catch (e) {
      toast.error((e && e.message) || 'Network error');
    } finally {
      setExporting(false);
    }
  };

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (fiscalYear) params.set('fiscal_year', String(fiscalYear));
      if (category) params.set('category', category);
      if (status) params.set('status', status);
      if (searchQuery) params.set('q', searchQuery);
      params.set('page', String(pagination.pageIndex + 1));
      params.set('limit', String(pagination.pageSize));

      const resp = await fetch(`${API_BASE}/list?${params.toString()}`, {
        headers: { 'x-access-token': accessToken || '' },
      });
      const body = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        setError(body.message || `Server returned ${resp.status}`);
        setData([]);
        setTotalRowCount(0);
        return;
      }

      setData(Array.isArray(body.data) ? body.data : []);
      setTotalRowCount((body.meta && body.meta.totalRowCount) || 0);
    } catch (e) {
      setError((e && e.message) || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accessToken,
    fiscalYear,
    category,
    status,
    searchQuery,
    pagination.pageIndex,
    pagination.pageSize,
  ]);

  const resetPage = () => setPagination((p) => ({ ...p, pageIndex: 0 }));

  const handleRevoke = async () => {
    if (!revokeTarget || !revokeTarget._id) return;
    setRevoking(true);
    try {
      const resp = await fetch(`${API_BASE}/revoke`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken || '',
        },
        body: JSON.stringify({
          id: revokeTarget._id,
          reason: revokeReason.trim() || null,
        }),
      });
      const body = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        toast.error(body.message || `Failed to revoke (${resp.status})`);
        return;
      }

      toast.success('Letter revoked.');
      setRevokeTarget(null);
      setRevokeReason('');
      await fetchList();
    } catch (e) {
      toast.error((e && e.message) || 'Network error');
    } finally {
      setRevoking(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employee_name',
        header: 'Employee',
        size: 180,
      },
      {
        accessorKey: 'domain_user',
        header: 'Domain User',
        size: 140,
      },
      {
        accessorKey: 'fiscal_year',
        header: 'FY',
        size: 70,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 130,
        Cell: ({ cell }) => (
          <CBadge color="primary" shape="rounded-pill">
            {cell.getValue()}
          </CBadge>
        ),
      },
      {
        accessorKey: 'commitment_decision',
        header: 'Commitment',
        size: 120,
        Cell: ({ cell }) => {
          const v = cell.getValue();
          if (!v) return <span className="text-medium-emphasis">-</span>;
          return (
            <CBadge color={v === 'Approved' ? 'success' : 'warning'}>{v}</CBadge>
          );
        },
      },
      {
        accessorFn: (row) => `${fmtMoney(row.old_salary)} → ${fmtMoney(row.new_salary)}`,
        id: 'salary_change',
        header: 'Salary Change',
        size: 200,
      },
      {
        accessorKey: 'bonus_months',
        header: 'Bonus',
        size: 100,
        Cell: ({ cell, row }) => {
          const v = cell.getValue();
          const pct = row.original.discipline_pct;
          if (v === null || v === undefined) return '-';
          if (pct !== null && pct !== undefined) {
            return `${Math.round(Number(pct) * 100)}% × ${v} mo`;
          }
          return `${v} mo`;
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        Cell: ({ cell }) => (
          <CBadge color={STATUS_COLORS[cell.getValue()] || 'secondary'}>
            {cell.getValue()}
          </CBadge>
        ),
      },
      {
        accessorKey: 'imported_at',
        header: 'Imported',
        size: 110,
        Cell: ({ cell }) => fmtDate(cell.getValue()),
      },
      {
        accessorKey: 'commitment_date',
        header: 'Accepted',
        size: 110,
        Cell: ({ cell }) => fmtDate(cell.getValue()),
      },
      {
        accessorKey: 'printed_count',
        header: 'Prints',
        size: 80,
        Cell: ({ cell }) => cell.getValue() || 0,
      },
      {
        accessorFn: (row) =>
          (row.import_batch_id && row.import_batch_id.reference_number) || '-',
        id: 'reference_number',
        header: 'Reference',
        size: 170,
      },
    ],
    []
  );

  const table = useMaterialReactTable({
    columns,
    data,
    state: {
      pagination,
      isLoading: loading,
      showProgressBars: loading,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: totalRowCount,
    enableColumnResizing: true,
    enableSorting: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <div style={{ display: 'flex', gap: 6 }}>
        <CButton
          size="sm"
          color="primary"
          variant="outline"
          disabled={row.original.status !== 'Committed'}
          title={
            row.original.status !== 'Committed'
              ? `Letter must be Committed before it can be printed (current: ${row.original.status})`
              : 'Open the printable letter'
          }
          onClick={() => setPrintTarget(row.original)}
        >
          Print
        </CButton>
        <CButton
          size="sm"
          color="danger"
          variant="outline"
          disabled={row.original.status === 'Revoked'}
          onClick={() => {
            setRevokeTarget(row.original);
            setRevokeReason('');
          }}
        >
          Revoke
        </CButton>
      </div>
    ),
    initialState: {
      density: 'compact',
    },
    muiTableProps: { sx: { tableLayout: 'fixed' } },
  });

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-4">
        <CCardHeader>
          <div className="d-flex justify-content-between align-items-center flex-wrap" style={{ gap: 8 }}>
            <div>
              <h4 className="mb-0">Salary Increment Letters</h4>
              <small className="text-medium-emphasis">
                All imported letters across fiscal years.
              </small>
            </div>
            <CButton
              color="success"
              variant="outline"
              disabled={!fiscalYear || exporting}
              title={
                fiscalYear
                  ? `Download an xlsx of every Approved/Rejected commitment decision for FY ${fiscalYear}`
                  : 'Pick a Fiscal Year filter below first'
              }
              onClick={handleExportDecisions}
            >
              {exporting ? (
                <>
                  <CSpinner size="sm" className="me-2" /> Exporting…
                </>
              ) : (
                'Export Decisions (xlsx)'
              )}
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3 g-2">
            <CCol md={2}>
              <CFormLabel>Fiscal Year</CFormLabel>
              <CFormInput
                type="number"
                value={fiscalYear}
                placeholder="Any"
                min={2000}
                max={3000}
                onChange={(e) => {
                  setFiscalYear(e.target.value);
                  resetPage();
                }}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel>Category</CFormLabel>
              <CFormSelect
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  resetPage();
                }}
              >
                <option value="">All categories</option>
                <option value="Full">Full</option>
                <option value="Proportionate">Proportionate</option>
                <option value="Discipline">Discipline</option>
                <option value="Salary Only">Salary Only</option>
                <option value="Promotion">Promotion</option>
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  resetPage();
                }}
              >
                <option value="">All statuses</option>
                <option value="Imported">Imported</option>
                <option value="Committed">Committed</option>
                <option value="Revoked">Revoked</option>
              </CFormSelect>
            </CCol>
            <CCol md={4}>
              <CFormLabel>Search</CFormLabel>
              <CFormInput
                type="text"
                value={searchQuery}
                placeholder="Name, username, or reference number…"
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  resetPage();
                }}
              />
              <small className="text-medium-emphasis">
                Matches substrings of employee name, first name, domain user, and the
                batch reference number.
              </small>
            </CCol>
          </CRow>

          {error && <CAlert color="danger">{error}</CAlert>}

          <MaterialReactTable table={table} />
        </CCardBody>
      </CCard>

      <CModal
        visible={!!revokeTarget}
        onClose={() => !revoking && setRevokeTarget(null)}
        backdrop="static"
      >
        <CModalHeader closeButton={!revoking}>
          <CModalTitle>Revoke Salary Increment Letter</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {revokeTarget && (
            <>
              <p className="mb-2">
                You are about to revoke the salary increment letter for{' '}
                <strong>{revokeTarget.employee_name}</strong>{' '}
                <span className="text-medium-emphasis">
                  ({revokeTarget.domain_user})
                </span>
              </p>
              <p className="mb-3">
                <CBadge color="primary" shape="rounded-pill">
                  {revokeTarget.category}
                </CBadge>{' '}
                · FY {revokeTarget.fiscal_year} · Status{' '}
                <CBadge color={STATUS_COLORS[revokeTarget.status] || 'secondary'}>
                  {revokeTarget.status}
                </CBadge>
              </p>

              {revokeTarget.printed_count > 0 && (
                <CAlert color="warning" className="py-2">
                  This user has already printed this letter{' '}
                  <strong>{revokeTarget.printed_count}</strong> time
                  {revokeTarget.printed_count === 1 ? '' : 's'}. Any printed copies'
                  QR codes will start resolving to "Revoked" on the public verify page
                  once you confirm.
                </CAlert>
              )}

              <p className="text-medium-emphasis">
                Revoking flips the letter's status to <strong>Revoked</strong> and
                records the revocation against your admin account. The user will no
                longer be able to print further copies.
              </p>

              <CFormLabel>Reason (optional, recommended for audit)</CFormLabel>
              <CFormTextarea
                rows={3}
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="e.g. Issued in error; employee resigned within commitment period; corrected re-import…"
                disabled={revoking}
              />
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={revoking}
            onClick={() => setRevokeTarget(null)}
          >
            Cancel
          </CButton>
          <CButton color="danger" disabled={revoking} onClick={handleRevoke}>
            {revoking ? (
              <>
                <CSpinner size="sm" className="me-2" /> Revoking…
              </>
            ) : (
              'Revoke Letter'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ============= Print modal ============= */}
      <CModal
        visible={!!printTarget}
        onClose={() => setPrintTarget(null)}
        size="xl"
        scrollable
        backdrop="static"
        alignment="top"
      >
        <CModalHeader>
          <CModalTitle>
            {printTarget && (
              <>
                Letter for <strong>{printTarget.employee_name}</strong>{' '}
                <span className="text-medium-emphasis">({printTarget.domain_user})</span>{' '}
                <CBadge color="primary" shape="rounded-pill">
                  {printTarget.category}
                </CBadge>{' '}
                <small className="text-medium-emphasis">FY {printTarget.fiscal_year}</small>
              </>
            )}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: '#eef0f4' }}>
          <CAlert color="info" className="py-2 mb-3">
            This is a <strong>reference copy</strong> for HR archives. It does{' '}
            <strong>not</strong> count toward the user&apos;s print history, and only
            the user themselves can change a letter&apos;s status to Committed.
          </CAlert>
          {printTarget && (
            <SalaryIncrementLetterPrint letter={printTarget} trackPrint={false} />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setPrintTarget(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  );
};

export default SalaryIncrementList;
