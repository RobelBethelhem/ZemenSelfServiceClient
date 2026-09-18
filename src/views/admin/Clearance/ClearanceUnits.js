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
  CFormSelect,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CRow,
  CCol,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, fmtDate, toInputDate } from './clearanceApi'
import UserPicker from './UserPicker'
import UnitMembersPanel from './UnitMembersPanel'

// HR's org map for clearance: every branch and head-office department, and
// who heads each one, with the dates the appointment is in force.
//
// HR only has to appoint heads. Each head then registers their own people
// from "My Unit" — which is the only way 2,500 employees get mapped without
// HR typing every one.
const emptyUnit = {
  name: '',
  code: '',
  kind: 'department',
  head_user: '',
  head_name: '',
  head_valid_from: toInputDate(new Date()),
  head_valid_to: '',
  head_reports_to: '',
  active: true,
}

const ClearanceUnits = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [units, setUnits] = useState(null)
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [membersOf, setMembersOf] = useState(null)
  const [kindFilter, setKindFilter] = useState('')

  const load = useCallback(async () => {
    try {
      const r = await api(token, '/units')
      setUnits(r.data || [])
    } catch (e) {
      toast.error(e.message)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const set = (k, v) => setEditing((u) => ({ ...u, [k]: v }))

  const save = async () => {
    if (!editing.name.trim() || !editing.code.trim()) {
      toast.warn('Name and code are required.')
      return
    }
    setBusy(true)
    try {
      const body = {
        name: editing.name,
        code: editing.code,
        kind: editing.kind,
        head_user: editing.head_user,
        head_valid_from: editing.head_valid_from || null,
        head_valid_to: editing.head_valid_to || null,
        head_reports_to: editing.head_reports_to,
        active: editing.active,
      }
      if (editing._id) await api(token, `/units/${editing._id}`, { method: 'PATCH', body })
      else await api(token, '/units', { method: 'POST', body })
      toast.success('Saved.')
      setEditing(null)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const shown = (units || []).filter((u) => !kindFilter || u.kind === kindFilter)

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
              <h4 className="mb-0">Units &amp; Heads</h4>
              <small className="text-medium-emphasis">
                Branches and head-office departments, and who heads each. Heads register their own
                staff.
              </small>
            </div>
            <div className="d-flex" style={{ gap: 8 }}>
              <CFormSelect
                size="sm"
                value={kindFilter}
                onChange={(e) => setKindFilter(e.target.value)}
                style={{ width: 160 }}
              >
                <option value="">All kinds</option>
                <option value="department">Departments</option>
                <option value="branch">Branches</option>
              </CFormSelect>
              <CButton color="primary" onClick={() => setEditing({ ...emptyUnit })}>
                New unit
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody className="p-0">
          {!units ? (
            <div className="p-3">
              <CSpinner size="sm" /> Loading…
            </div>
          ) : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Unit</CTableHeaderCell>
                  <CTableHeaderCell>Kind</CTableHeaderCell>
                  <CTableHeaderCell>Head</CTableHeaderCell>
                  <CTableHeaderCell>Appointment</CTableHeaderCell>
                  <CTableHeaderCell>People</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {shown.map((u) => (
                  <CTableRow key={u._id} style={!u.active ? { opacity: 0.55 } : undefined}>
                    <CTableDataCell>
                      <strong>{u.name}</strong> <CBadge color="secondary">{u.code}</CBadge>
                      {!u.active && (
                        <CBadge color="dark" className="ms-1">
                          inactive
                        </CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color={u.kind === 'branch' ? 'info' : 'primary'}>{u.kind}</CBadge>
                    </CTableDataCell>
                    <CTableDataCell>
                      {u.head_user ? (
                        <>
                          {u.head_name || u.head_user}
                          <br />
                          <small className="text-medium-emphasis">{u.head_user}</small>
                        </>
                      ) : (
                        <span className="text-danger">not appointed</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {u.head_user ? (
                        <>
                          {fmtDate(u.head_valid_from)} →{' '}
                          {u.head_valid_to ? fmtDate(u.head_valid_to) : 'open'}
                          {!u.head_active && (
                            <>
                              <br />
                              <small className="text-danger">not in force</small>
                            </>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{u.member_count}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        className="me-1"
                        onClick={() => setMembersOf(u)}
                      >
                        People
                      </CButton>
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() =>
                          setEditing({
                            ...u,
                            head_valid_from: toInputDate(u.head_valid_from),
                            head_valid_to: toInputDate(u.head_valid_to),
                          })
                        }
                      >
                        Edit
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {units && units.some((u) => u.active && !u.head_user) && (
        <CAlert color="warning">
          Some units have no head appointed. Their rows on a clearance form will have no signatory
          until one is appointed (or HR reassigns the row).
        </CAlert>
      )}

      <CModal
        visible={!!editing}
        onClose={() => !busy && setEditing(null)}
        backdrop="static"
        alignment="center"
        size="lg"
      >
        <CModalHeader closeButton={!busy}>
          <CModalTitle>{editing && editing._id ? 'Edit unit' : 'New unit'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editing && (
            <CRow className="g-3">
              <CCol md={7}>
                <CFormLabel>Name</CFormLabel>
                <CFormInput
                  value={editing.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. Bole Branch / Credit Portfolio Mgt. Dep't"
                />
              </CCol>
              <CCol md={3}>
                <CFormLabel>Code</CFormLabel>
                <CFormInput
                  value={editing.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="BR-042 / CPM"
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel>Kind</CFormLabel>
                <CFormSelect value={editing.kind} onChange={(e) => set('kind', e.target.value)}>
                  <option value="department">Department</option>
                  <option value="branch">Branch</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormLabel>
                  {editing.kind === 'branch' ? 'Branch Manager' : 'Director'} (unit head)
                </CFormLabel>
                <UserPicker
                  token={token}
                  value={editing.head_user}
                  displayName={
                    editing.head_name ? `${editing.head_name} (${editing.head_user})` : ''
                  }
                  onChange={({ user, name }) =>
                    setEditing((u) => ({ ...u, head_user: user, head_name: name }))
                  }
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Appointed from</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.head_valid_from}
                  onChange={(e) => set('head_valid_from', e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Appointed to (blank = open-ended)</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.head_valid_to}
                  onChange={(e) => set('head_valid_to', e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Head reports to (username)</CFormLabel>
                <CFormInput
                  value={editing.head_reports_to}
                  onChange={(e) => set('head_reports_to', e.target.value)}
                  placeholder="e.g. vp.operations"
                />
                <small className="text-medium-emphasis">
                  Used as the head&apos;s own supervisor on their clearance.
                </small>
              </CCol>
              {editing._id && (
                <CCol md={12}>
                  <CFormCheck
                    id="unit-active"
                    label="Active"
                    checked={!!editing.active}
                    onChange={(e) => set('active', e.target.checked)}
                  />
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={busy}
            onClick={() => setEditing(null)}
          >
            Cancel
          </CButton>
          <CButton color="primary" disabled={busy} onClick={save}>
            {busy ? <CSpinner size="sm" /> : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={!!membersOf}
        onClose={() => setMembersOf(null)}
        size="xl"
        scrollable
        backdrop="static"
        alignment="top"
      >
        <CModalHeader>
          <CModalTitle>People in {membersOf ? membersOf.name : ''}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: '#f4f5f7' }}>
          {membersOf && <UnitMembersPanel token={token} unit={membersOf} canEdit />}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setMembersOf(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ClearanceUnits
