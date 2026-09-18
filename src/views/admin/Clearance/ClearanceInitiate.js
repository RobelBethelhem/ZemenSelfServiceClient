import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CFormSelect,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CFormCheck,
  CRow,
  CCol,
  CAlert,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, toInputDate } from './clearanceApi'
import { TERMINATION_TYPES } from './clearanceContent'
import UserPicker from './UserPicker'

// HR records a departure the Bank initiated — dismissal, retirement, end of
// contract — or a resignation received on paper. No supervisor step: HR is
// the authority. The form opens on the release date, or now if immediate.
const ClearanceInitiate = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const navigate = useNavigate()
  const [form, setForm] = useState({
    domain_user: '',
    name: '',
    termination_type: 'Termination',
    release_date: toInputDate(new Date()),
    immediate: false,
    reason: '',
  })
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.domain_user) {
      toast.warn('Pick the employee.')
      return
    }
    if (!form.immediate && !form.release_date) {
      toast.warn('Pick a release date, or tick Immediate.')
      return
    }
    setBusy(true)
    try {
      const r = await api(token, '/initiate', { method: 'POST', body: form })
      toast.success(`Recorded. Status: ${r.clearance.status}.`)
      navigate('/admin/clearance/list')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard>
        <CCardHeader>
          <h4 className="mb-0">Record a Departure</h4>
          <small className="text-medium-emphasis">
            For departures the Bank initiates. Employees resign themselves under{' '}
            <em>My Clearance</em>.
          </small>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            <CCol md={6}>
              <CFormLabel>Employee</CFormLabel>
              <UserPicker
                token={token}
                value={form.domain_user}
                onChange={({ user, name }) => setForm((f) => ({ ...f, domain_user: user, name }))}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Nature of departure</CFormLabel>
              <CFormSelect
                value={form.termination_type}
                onChange={(e) => set('termination_type', e.target.value)}
              >
                {TERMINATION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol md={6}>
              <CFormLabel>Release date (last working day)</CFormLabel>
              <CFormInput
                type="date"
                value={form.release_date}
                disabled={form.immediate}
                onChange={(e) => set('release_date', e.target.value)}
              />
              <CFormCheck
                className="mt-2"
                id="init-immediate"
                label="Immediate — open the clearance form now"
                checked={form.immediate}
                onChange={(e) => set('immediate', e.target.checked)}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Notes (optional)</CFormLabel>
              <CFormTextarea
                rows={3}
                value={form.reason}
                onChange={(e) => set('reason', e.target.value)}
                placeholder="Reference to the decision, letter number, etc."
              />
            </CCol>
          </CRow>
          <CAlert color="info" className="py-2 mt-3">
            The employee&apos;s name, title, department and employment date are taken from HRIS.
            Anything HRIS lacks is filled from the portal profile and flagged on the form.
          </CAlert>
          <CButton color="primary" disabled={busy} onClick={submit}>
            {busy ? (
              <>
                <CSpinner size="sm" className="me-2" /> Recording…
              </>
            ) : (
              'Record departure'
            )}
          </CButton>
        </CCardBody>
      </CCard>
    </>
  )
}

export default ClearanceInitiate
