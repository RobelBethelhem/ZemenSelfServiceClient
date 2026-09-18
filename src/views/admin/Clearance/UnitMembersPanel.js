import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
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
import { toast } from 'react-toastify'

import { api, fmtDate, toInputDate } from './clearanceApi'
import UserPicker from './UserPicker'

// The people registered under one unit, editable by that unit's head (while
// appointed) or by HR. Shared by "My Unit" and HR's Units screen.
//
// Registering someone here is what makes their Immediate Supervisor resolve,
// and ticking "may sign clearance rows" is how a Director delegates the
// department's signature to a Manager.
const emptyMember = {
  domain_user: '',
  name: '',
  role_in_unit: 'staff',
  reports_to: '',
  can_sign_clearance: false,
  valid_from: toInputDate(new Date()),
  valid_to: '',
  active: true,
}

const UnitMembersPanel = ({ token, unit, canEdit }) => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // member object (with _id for edit)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api(token, `/units/${unit._id}/members`)
      setMembers(r.data || [])
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [token, unit._id])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    if (!editing.domain_user) {
      toast.warn('Pick the person.')
      return
    }
    setBusy(true)
    try {
      const body = {
        role_in_unit: editing.role_in_unit,
        reports_to: editing.reports_to,
        can_sign_clearance: editing.can_sign_clearance,
        valid_from: editing.valid_from || null,
        valid_to: editing.valid_to || null,
        active: editing.active,
      }
      if (editing._id) {
        await api(token, `/units/${unit._id}/members/${editing._id}`, { method: 'PATCH', body })
      } else {
        await api(token, `/units/${unit._id}/members`, {
          method: 'POST',
          body: { ...body, domain_user: editing.domain_user },
        })
      }
      toast.success('Saved.')
      setEditing(null)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const set = (k, v) => setEditing((m) => ({ ...m, [k]: v }))

  return (
    <CCard>
      <CCardHeader
        className="d-flex justify-content-between align-items-center flex-wrap"
        style={{ gap: 8 }}
      >
        <div>
          <strong>{unit.name}</strong> <CBadge color="secondary">{unit.code}</CBadge>{' '}
          <CBadge color={unit.kind === 'branch' ? 'info' : 'primary'}>{unit.kind}</CBadge>
          <div>
            <small className="text-medium-emphasis">
              Head: {unit.head_name || unit.head_user || 'not appointed'}
              {unit.head_user && !unit.head_active ? (
                <span className="text-danger"> (appointment not in force)</span>
              ) : null}
            </small>
          </div>
        </div>
        {canEdit && (
          <CButton size="sm" color="primary" onClick={() => setEditing({ ...emptyMember })}>
            Register a person
          </CButton>
        )}
      </CCardHeader>
      <CCardBody className="p-0">
        {loading ? (
          <div className="p-3">
            <CSpinner size="sm" /> Loading…
          </div>
        ) : members.length === 0 ? (
          <CAlert color="light" className="m-3">
            Nobody is registered under this unit yet. Until they are, employees here have no
            immediate supervisor on their clearance and HR steps in.
          </CAlert>
        ) : (
          <CTable hover responsive small className="mb-0">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Person</CTableHeaderCell>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell>Reports to</CTableHeaderCell>
                <CTableHeaderCell>Signs clearance</CTableHeaderCell>
                <CTableHeaderCell>Valid</CTableHeaderCell>
                {canEdit && <CTableHeaderCell />}
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {members.map((m) => (
                <CTableRow
                  key={m._id}
                  style={!m.active || !m.in_window ? { opacity: 0.55 } : undefined}
                >
                  <CTableDataCell>
                    <strong>{m.name || m.domain_user}</strong>
                    <br />
                    <small className="text-medium-emphasis">{m.domain_user}</small>
                  </CTableDataCell>
                  <CTableDataCell>{m.role_in_unit}</CTableDataCell>
                  <CTableDataCell>
                    {m.reports_to ? m.reports_to_name || m.reports_to : <em>unit head</em>}
                  </CTableDataCell>
                  <CTableDataCell>
                    {m.can_sign_clearance ? <CBadge color="success">yes</CBadge> : '—'}
                  </CTableDataCell>
                  <CTableDataCell>
                    {fmtDate(m.valid_from)} → {m.valid_to ? fmtDate(m.valid_to) : 'open'}
                    {!m.active ? (
                      <CBadge color="secondary" className="ms-1">
                        inactive
                      </CBadge>
                    ) : !m.in_window ? (
                      <CBadge color="warning" className="ms-1">
                        expired
                      </CBadge>
                    ) : null}
                  </CTableDataCell>
                  {canEdit && (
                    <CTableDataCell className="text-end">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        onClick={() =>
                          setEditing({
                            ...m,
                            valid_from: toInputDate(m.valid_from),
                            valid_to: toInputDate(m.valid_to),
                          })
                        }
                      >
                        Edit
                      </CButton>
                    </CTableDataCell>
                  )}
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>

      <CModal
        visible={!!editing}
        onClose={() => !busy && setEditing(null)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader closeButton={!busy}>
          <CModalTitle>
            {editing && editing._id ? 'Edit registration' : 'Register a person'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editing && (
            <CRow className="g-3">
              <CCol md={12}>
                <CFormLabel>Person</CFormLabel>
                {editing._id ? (
                  <div>
                    <strong>{editing.name || editing.domain_user}</strong>{' '}
                    <code>{editing.domain_user}</code>
                  </div>
                ) : (
                  <UserPicker
                    token={token}
                    value={editing.domain_user}
                    onChange={({ user, name }) =>
                      setEditing((m) => ({ ...m, domain_user: user, name }))
                    }
                  />
                )}
              </CCol>
              <CCol md={6}>
                <CFormLabel>Role in unit</CFormLabel>
                <CFormSelect
                  value={editing.role_in_unit}
                  onChange={(e) => set('role_in_unit', e.target.value)}
                >
                  <option value="deputy">
                    {unit.kind === 'branch' ? 'Deputy Manager' : 'Deputy'}
                  </option>
                  <option value="manager">Manager</option>
                  <option value="staff">Staff</option>
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Reports to</CFormLabel>
                <CFormSelect
                  value={editing.reports_to}
                  onChange={(e) => set('reports_to', e.target.value)}
                >
                  <option value="">Unit head ({unit.head_name || unit.head_user || '—'})</option>
                  {members
                    .filter((x) => x.domain_user !== editing.domain_user && x.active)
                    .map((x) => (
                      <option key={x._id} value={x.domain_user}>
                        {x.name || x.domain_user} ({x.role_in_unit})
                      </option>
                    ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel>Valid from</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.valid_from}
                  onChange={(e) => set('valid_from', e.target.value)}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel>Valid to (blank = open-ended)</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.valid_to}
                  onChange={(e) => set('valid_to', e.target.value)}
                />
              </CCol>
              <CCol md={12}>
                <CFormCheck
                  id="member-can-sign"
                  label="May sign this unit's row on clearance forms (delegated signing authority)"
                  checked={!!editing.can_sign_clearance}
                  onChange={(e) => set('can_sign_clearance', e.target.checked)}
                />
                {editing._id && (
                  <CFormCheck
                    id="member-active"
                    className="mt-1"
                    label="Active"
                    checked={!!editing.active}
                    onChange={(e) => set('active', e.target.checked)}
                  />
                )}
              </CCol>
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
    </CCard>
  )
}

UnitMembersPanel.propTypes = {
  token: PropTypes.string,
  unit: PropTypes.object.isRequired,
  canEdit: PropTypes.bool,
}

export default UnitMembersPanel
