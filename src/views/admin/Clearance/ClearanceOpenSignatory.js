import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CBadge,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, fmtDate, daysBetween } from './clearanceApi'
import ClearanceDetail from './ClearanceDetail'

// The gate between "approved" and "signing". Supervisor and HR approval put a
// departure here; nothing opens until HR opens it — and until HR does, the
// employee may still withdraw. The scheduler reminds HR when a release date
// arrives; it never opens anything itself.
const ClearanceOpenSignatory = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [rows, setRows] = useState(null)
  const [busyId, setBusyId] = useState(null)
  const [openId, setOpenId] = useState(null)

  const load = useCallback(async () => {
    try {
      const r = await api(token, '/list?status=Approved&limit=200')
      setRows(r.data || [])
    } catch (e) {
      toast.error(e.message)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const openNow = async (c) => {
    setBusyId(c._id)
    try {
      await api(token, '/open-now', { method: 'POST', body: { id: c._id } })
      toast.success(`Signatories opened for ${c.employee_name}.`)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusyId(null)
    }
  }

  const releaseInfo = (c) => {
    const d = daysBetween(new Date(), c.release_date)
    if (c.immediate) return <CBadge color="danger">immediate</CBadge>
    if (d > 0)
      return (
        <small className="text-medium-emphasis">
          in {d} day{d === 1 ? '' : 's'}
        </small>
      )
    if (d === 0) return <CBadge color="warning">today</CBadge>
    return (
      <CBadge color="danger">
        {-d} day{d === -1 ? '' : 's'} ago
      </CBadge>
    )
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-3">
        <CCardHeader>
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: 8 }}
          >
            <div>
              <h4 className="mb-0">Open Signatories</h4>
              <small className="text-medium-emphasis">
                Approved departures waiting for HR to open the clearance form. Until you open one,
                the employee can still withdraw.
              </small>
            </div>
            <CButton color="secondary" variant="outline" onClick={load}>
              Refresh
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody className="p-0">
          {!rows ? (
            <div className="p-3">
              <CSpinner size="sm" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <CAlert color="light" className="m-3 mb-3">
              Nothing is waiting to be opened.
            </CAlert>
          ) : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Departure</CTableHeaderCell>
                  <CTableHeaderCell>Release date</CTableHeaderCell>
                  <CTableHeaderCell>Approved</CTableHeaderCell>
                  <CTableHeaderCell>Unit</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map((c) => (
                  <CTableRow key={c._id}>
                    <CTableDataCell>
                      <strong>{c.employee_name}</strong>
                      <br />
                      <small className="text-medium-emphasis">
                        {c.domain_user}
                        {c.job_title ? ` · ${c.job_title}` : ''}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="primary" shape="rounded-pill">
                        {c.termination_type}
                      </CBadge>
                      <br />
                      <small className="text-medium-emphasis">
                        by {c.initiated_by === 'hr' ? 'HR' : 'employee'}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {fmtDate(c.release_date)}
                      <br />
                      {releaseInfo(c)}
                    </CTableDataCell>
                    <CTableDataCell>{fmtDate(c.approved_at)}</CTableDataCell>
                    <CTableDataCell>
                      {c.unit_name || c.department || '—'}
                      {c.unit_kind ? (
                        <>
                          <br />
                          <small className="text-medium-emphasis">{c.unit_kind}</small>
                        </>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell className="text-end" style={{ whiteSpace: 'nowrap' }}>
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        className="me-1"
                        onClick={() => setOpenId(c._id)}
                      >
                        View
                      </CButton>
                      <CButton
                        size="sm"
                        color="success"
                        disabled={busyId === c._id}
                        onClick={() => openNow(c)}
                      >
                        {busyId === c._id ? <CSpinner size="sm" /> : 'Open signatories'}
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
      <CAlert color="light">
        Opening snapshots the form from the active template and the benefits statement from
        Settings, notifies every department whose row opens, and asks the employee&apos;s branch (or
        the service branch, for head-office staff) to fill its rows of the benefits statement.
      </CAlert>

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

export default ClearanceOpenSignatory
