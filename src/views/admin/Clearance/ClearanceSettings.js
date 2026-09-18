import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CBadge,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CFormSelect,
  CRow,
  CCol,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, toInputDate } from './clearanceApi'
import UserPicker from './UserPicker'

// Who the President/CEO is (and who may sign for them while they are away),
// the roles people may hold in the reporting tree, and how insistently the
// system reminds signatories.
const ClearanceSettings = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [s, setS] = useState(null)
  const [roles, setRoles] = useState([])
  const [names, setNames] = useState({ ceo: '', delegate: '' })
  const [delegateActive, setDelegateActive] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await api(token, '/settings')
      setS({
        ceo_user: r.settings.ceo_user || '',
        ceo_delegate_user: r.settings.ceo_delegate_user || '',
        ceo_delegate_from: toInputDate(r.settings.ceo_delegate_from),
        ceo_delegate_to: toInputDate(r.settings.ceo_delegate_to),
        sla_days: r.settings.sla_days,
        remind_every_days: r.settings.remind_every_days,
        escalate_after_days: r.settings.escalate_after_days,
      })
      setRoles((r.settings.roles || []).map((x) => ({ ...x })))
      setNames({ ceo: r.ceo_name, delegate: r.ceo_delegate_name })
      setDelegateActive(!!r.delegate_active)
    } catch (e) {
      toast.error(e.message)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const set = (k, v) => setS((x) => ({ ...x, [k]: v }))
  const setRole = (i, patch) =>
    setRoles((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))

  const save = async () => {
    if (roles.some((r) => !String(r.label || '').trim()))
      return toast.warn('Every role needs a label.')
    setBusy(true)
    try {
      await api(token, '/settings', {
        method: 'PUT',
        body: {
          ...s,
          ceo_delegate_from: s.ceo_delegate_from || null,
          ceo_delegate_to: s.ceo_delegate_to || null,
          roles: roles.map((r) => ({
            label: r.label.trim(),
            manages: !!r.manages,
            unit_head_for: r.unit_head_for || '',
          })),
        },
      })
      toast.success('Saved.')
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
    return null
  }

  if (!s) {
    return (
      <>
        <ToastContainer position="top-right" />
        <CSpinner />
      </>
    )
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-3">
        <CCardHeader>
          <h4 className="mb-0">Clearance Settings</h4>
        </CCardHeader>
        <CCardBody>
          <h6>Final approval</h6>
          <CRow className="g-3 mb-4">
            <CCol md={6}>
              <CFormLabel>President/CEO</CFormLabel>
              <UserPicker
                token={token}
                value={s.ceo_user}
                displayName={names.ceo ? `${names.ceo} (${s.ceo_user})` : ''}
                onChange={({ user }) => set('ceo_user', user)}
              />
              <small className="text-medium-emphasis">
                Signs the final row electronically if the template says so; otherwise HR records the
                hand signature from the printed form.
              </small>
            </CCol>
            <CCol md={6}>
              <CFormLabel>
                Delegate {delegateActive && <CBadge color="success">active now</CBadge>}
              </CFormLabel>
              <UserPicker
                token={token}
                value={s.ceo_delegate_user}
                displayName={names.delegate ? `${names.delegate} (${s.ceo_delegate_user})` : ''}
                onChange={({ user }) => set('ceo_delegate_user', user)}
              />
              <CRow className="g-2 mt-1">
                <CCol>
                  <CFormInput
                    type="date"
                    value={s.ceo_delegate_from}
                    onChange={(e) => set('ceo_delegate_from', e.target.value)}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    type="date"
                    value={s.ceo_delegate_to}
                    onChange={(e) => set('ceo_delegate_to', e.target.value)}
                  />
                </CCol>
              </CRow>
              <small className="text-medium-emphasis">
                May sign the final row exactly as the CEO while today is inside these dates.
              </small>
            </CCol>
          </CRow>

          <h6>Roles in the reporting tree</h6>
          <p className="text-medium-emphasis mb-2" style={{ fontSize: 13 }}>
            A role that <em>manages</em> may register people beneath itself. Exactly one role heads
            a department (the Director) and one heads a branch (the Branch Manager) — registering a
            person with that role makes them the unit&apos;s head.
          </p>
          <CTable small bordered className="mb-2" style={{ maxWidth: 720 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Role</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 130 }}>Manages</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 190 }}>Heads a…</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 60 }} />
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {roles.map((r, i) => (
                <CTableRow key={i}>
                  <CTableDataCell>
                    <CFormInput
                      size="sm"
                      value={r.label}
                      onChange={(e) => setRole(i, { label: e.target.value })}
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormCheck
                      id={`role-m-${i}`}
                      label="yes"
                      checked={!!r.manages}
                      onChange={(e) => setRole(i, { manages: e.target.checked })}
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      size="sm"
                      value={r.unit_head_for || ''}
                      onChange={(e) => setRole(i, { unit_head_for: e.target.value })}
                    >
                      <option value="">—</option>
                      <option value="department">department</option>
                      <option value="branch">branch</option>
                    </CFormSelect>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      onClick={() => setRoles((rs) => rs.filter((_, j) => j !== i))}
                    >
                      ×
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
          <CButton
            size="sm"
            color="secondary"
            variant="outline"
            className="mb-4"
            onClick={() =>
              setRoles((rs) => [...rs, { label: '', manages: false, unit_head_for: '' }])
            }
          >
            Add role
          </CButton>

          <h6>Reminders</h6>
          <CRow className="g-3">
            <CCol md={4}>
              <CFormLabel>A row is due after (days)</CFormLabel>
              <CFormInput
                type="number"
                min={0}
                max={60}
                value={s.sla_days}
                onChange={(e) => set('sla_days', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Then remind every (days)</CFormLabel>
              <CFormInput
                type="number"
                min={1}
                max={30}
                value={s.remind_every_days}
                onChange={(e) => set('remind_every_days', e.target.value)}
              />
            </CCol>
            <CCol md={4}>
              <CFormLabel>Tell HR it is stuck after (days)</CFormLabel>
              <CFormInput
                type="number"
                min={1}
                max={90}
                value={s.escalate_after_days}
                onChange={(e) => set('escalate_after_days', e.target.value)}
              />
            </CCol>
          </CRow>
          <CAlert color="light" className="mt-3 py-2">
            Reminders go to whoever can currently sign the row; hand-signed rows and rows with no
            signatory go to HR. The scheduler runs every fifteen minutes; nothing fires twice for
            the same day.
          </CAlert>
          <CButton color="primary" disabled={busy} onClick={save}>
            {busy ? <CSpinner size="sm" /> : 'Save settings'}
          </CButton>
        </CCardBody>
      </CCard>
    </>
  )
}

export default ClearanceSettings
