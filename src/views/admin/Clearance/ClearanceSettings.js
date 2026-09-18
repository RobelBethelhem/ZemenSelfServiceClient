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
// the roles people may hold in the reporting tree, the benefits statement's
// rows and who fills each, the branch that serves head-office staff, and how
// insistently the system reminds signatories.
const ClearanceSettings = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [s, setS] = useState(null)
  const [roles, setRoles] = useState([])
  const [benefitsRows, setBenefitsRows] = useState([])
  const [branches, setBranches] = useState([])
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
        service_branch_id: r.settings.service_branch_id ? String(r.settings.service_branch_id) : '',
      })
      setRoles((r.settings.roles || []).map((x) => ({ ...x })))
      setBenefitsRows((r.settings.benefits_rows || []).map((x) => ({ ...x })))
      setBranches(r.branches || [])
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
  const setRow = (i, patch) =>
    setBenefitsRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  const moveRow = (i, d) =>
    setBenefitsRows((rs) => {
      const j = i + d
      if (j < 0 || j >= rs.length) return rs
      const copy = [...rs]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy
    })

  const save = async () => {
    if (roles.some((r) => !String(r.label || '').trim()))
      return toast.warn('Every role needs a label.')
    if (benefitsRows.some((r) => !String(r.label || '').trim()))
      return toast.warn('Every benefits row needs a label.')
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
          benefits_rows: benefitsRows.map((r) => ({
            code: r.code || '',
            label: r.label.trim(),
            filled_by: r.filled_by || 'hr',
            system_source: r.filled_by === 'system' ? r.system_source || '' : '',
          })),
          service_branch_id: s.service_branch_id || '',
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

          <h6>Benefits statement</h6>
          <p className="text-medium-emphasis mb-2" style={{ fontSize: 13 }}>
            The &ldquo;List of Benefits&rdquo; attached to every clearance once HR opens the
            signatories.
            <strong> System</strong> rows come from the record; <strong>branch</strong> rows are
            filled by the employee&apos;s branch manager (or the service branch, for head-office
            staff); <strong>HR</strong> rows by HR. Signatories see it once HR issues it.
          </p>
          <CRow className="g-3 mb-2">
            <CCol md={6}>
              <CFormLabel>Service branch for head-office employees</CFormLabel>
              <CFormSelect
                value={s.service_branch_id}
                onChange={(e) => set('service_branch_id', e.target.value)}
              >
                <option value="">— none (HR fills the branch rows) —</option>
                {branches.map((b) => (
                  <option key={b._id} value={String(b._id)}>
                    {b.code} — {b.name}
                  </option>
                ))}
              </CFormSelect>
              <small className="text-medium-emphasis">
                Branch 164 is chosen automatically the first time it exists in the registry; change
                it here.
              </small>
            </CCol>
          </CRow>
          <CTable small bordered className="mb-2" style={{ maxWidth: 900 }}>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell style={{ width: 70 }} />
                <CTableHeaderCell>Row</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 150 }}>Filled by</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 210 }}>System source</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 60 }} />
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {benefitsRows.map((r, i) => (
                <CTableRow key={r.code || i}>
                  <CTableDataCell style={{ whiteSpace: 'nowrap' }}>
                    <CButton
                      size="sm"
                      color="light"
                      onClick={() => moveRow(i, -1)}
                      disabled={i === 0}
                    >
                      ↑
                    </CButton>
                    <CButton
                      size="sm"
                      color="light"
                      onClick={() => moveRow(i, 1)}
                      disabled={i === benefitsRows.length - 1}
                    >
                      ↓
                    </CButton>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      size="sm"
                      value={r.label}
                      onChange={(e) => setRow(i, { label: e.target.value })}
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      size="sm"
                      value={r.filled_by || 'hr'}
                      onChange={(e) => setRow(i, { filled_by: e.target.value })}
                    >
                      <option value="system">System</option>
                      <option value="branch">Branch manager</option>
                      <option value="hr">HR</option>
                    </CFormSelect>
                  </CTableDataCell>
                  <CTableDataCell>
                    {r.filled_by === 'system' ? (
                      <CFormSelect
                        size="sm"
                        value={r.system_source || ''}
                        onChange={(e) => setRow(i, { system_source: e.target.value })}
                      >
                        <option value="">— pick —</option>
                        <option value="date_of_employment">Date of employment</option>
                        <option value="release_date">Release / resignation date</option>
                      </CFormSelect>
                    ) : (
                      <span className="text-medium-emphasis">—</span>
                    )}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      onClick={() => setBenefitsRows((rs) => rs.filter((_, j) => j !== i))}
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
              setBenefitsRows((rs) => [
                ...rs,
                { code: '', label: '', filled_by: 'hr', system_source: '' },
              ])
            }
          >
            Add row
          </CButton>

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
            Reminders go to whoever can currently sign the row (or their delegate); hand-signed rows
            and rows with no signatory go to HR. When an approved departure&apos;s release date
            arrives, HR is reminded once to open the signatories. The scheduler runs every fifteen
            minutes.
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
