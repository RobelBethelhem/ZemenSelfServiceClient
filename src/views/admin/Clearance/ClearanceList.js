/* eslint-disable react/prop-types */
// The Cell renderers below are material-react-table callbacks that receive the
// library's { row, cell } objects, not components with a prop contract of their
// own — the same pattern SalaryIncrementList uses.
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CButton,
  CBadge,
  CAlert,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from '@coreui/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, fmtDate } from './clearanceApi'
import { STATUS_META, TERMINATION_TYPES } from './clearanceContent'
import ClearanceStatusBadge from './ClearanceStatusBadge'
import ClearanceDetail from './ClearanceDetail'

// HR's view of every clearance, with the progress of each at a glance and the
// full document one click away.
const ClearanceList = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const navigate = useNavigate()

  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [q, setQ] = useState('')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 })
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const p = new URLSearchParams()
      if (status) p.set('status', status)
      if (type) p.set('termination_type', type)
      if (q) p.set('q', q)
      p.set('page', String(pagination.pageIndex + 1))
      p.set('limit', String(pagination.pageSize))
      const r = await api(token, `/list?${p.toString()}`)
      setData(r.data || [])
      setTotal((r.meta && r.meta.totalRowCount) || 0)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [token, status, type, q, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const columns = useMemo(
    () => [
      {
        accessorKey: 'employee_name',
        header: 'Employee',
        size: 200,
        Cell: ({ row }) => (
          <>
            <strong>{row.original.employee_name}</strong>
            <br />
            <small className="text-medium-emphasis">
              {row.original.domain_user}
              {row.original.job_title ? ` · ${row.original.job_title}` : ''}
            </small>
          </>
        ),
      },
      { accessorKey: 'department', header: 'Department', size: 160 },
      {
        accessorKey: 'termination_type',
        header: 'Type',
        size: 110,
        Cell: ({ cell }) => (
          <CBadge color="primary" shape="rounded-pill">
            {cell.getValue()}
          </CBadge>
        ),
      },
      {
        accessorKey: 'release_date',
        header: 'Release',
        size: 110,
        Cell: ({ cell, row }) => (
          <>
            {fmtDate(cell.getValue())}
            {row.original.immediate ? (
              <>
                <br />
                <small className="text-danger">immediate</small>
              </>
            ) : null}
          </>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 150,
        Cell: ({ cell }) => <ClearanceStatusBadge status={cell.getValue()} />,
      },
      {
        id: 'progress',
        header: 'Rows',
        size: 170,
        accessorFn: (r) => r.counts,
        Cell: ({ row }) => {
          const k = row.original.counts || {}
          if (!k.total) return <span className="text-medium-emphasis">—</span>
          return (
            <div className="d-flex flex-wrap" style={{ gap: 4 }}>
              <CBadge color="success" title="cleared">
                {k.cleared}
              </CBadge>
              {k.pending ? (
                <CBadge color="warning" title="pending">
                  {k.pending}
                </CBadge>
              ) : null}
              {k.waiting ? (
                <CBadge color="secondary" title="waiting on dependency">
                  {k.waiting}
                </CBadge>
              ) : null}
              {k.outstanding ? (
                <CBadge color="danger" title="outstanding">
                  {k.outstanding}
                </CBadge>
              ) : null}
              <small className="text-medium-emphasis">/ {k.total}</small>
            </div>
          )
        },
      },
      {
        accessorKey: 'certificate_number',
        header: 'Certificate',
        size: 160,
        Cell: ({ cell }) => cell.getValue() || '—',
      },
      {
        accessorKey: 'submitted_at',
        header: 'Submitted',
        size: 110,
        Cell: ({ cell, row }) => fmtDate(cell.getValue() || row.original.createdAt),
      },
    ],
    [],
  )

  const table = useMaterialReactTable({
    columns,
    data,
    state: { pagination, isLoading: loading, showProgressBars: loading },
    onPaginationChange: setPagination,
    manualPagination: true,
    rowCount: total,
    enableColumnResizing: true,
    enableSorting: false,
    enableColumnFilters: false,
    enableGlobalFilter: false,
    enableRowActions: true,
    positionActionsColumn: 'last',
    renderRowActions: ({ row }) => (
      <CButton
        size="sm"
        color="primary"
        variant="outline"
        onClick={() => setOpenId(row.original._id)}
      >
        Open
      </CButton>
    ),
    initialState: { density: 'compact' },
    muiTableProps: { sx: { tableLayout: 'fixed' } },
  })

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-4">
        <CCardHeader>
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: 8 }}
          >
            <div>
              <h4 className="mb-0">Exit Clearances</h4>
              <small className="text-medium-emphasis">
                Every departure, from resignation to certificate.
              </small>
            </div>
            <div className="d-flex flex-wrap" style={{ gap: 8 }}>
              <CButton color="primary" onClick={() => navigate('/admin/clearance/new')}>
                Record a departure
              </CButton>
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => navigate('/clearance/inbox')}
              >
                Inbox
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="mb-3 g-2">
            <CCol md={3}>
              <CFormLabel>Status</CFormLabel>
              <CFormSelect
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
              >
                <option value="">All statuses</option>
                {Object.keys(STATUS_META).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={3}>
              <CFormLabel>Type</CFormLabel>
              <CFormSelect
                value={type}
                onChange={(e) => {
                  setType(e.target.value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
              >
                <option value="">All types</option>
                {TERMINATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Search</CFormLabel>
              <CFormInput
                value={q}
                placeholder="Name, username, employee ID or certificate number…"
                onChange={(e) => {
                  setQ(e.target.value)
                  setPagination((p) => ({ ...p, pageIndex: 0 }))
                }}
              />
            </CCol>
          </CRow>
          {error && <CAlert color="danger">{error}</CAlert>}
          <MaterialReactTable table={table} />
        </CCardBody>
      </CCard>

      <CModal
        visible={!!openId}
        onClose={() => setOpenId(null)}
        size="xl"
        scrollable
        backdrop="static"
        alignment="top"
      >
        <CModalHeader>
          <CModalTitle>Exit clearance</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: '#f4f5f7' }}>
          {openId && <ClearanceDetail id={openId} token={token} onChanged={load} />}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setOpenId(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ClearanceList
