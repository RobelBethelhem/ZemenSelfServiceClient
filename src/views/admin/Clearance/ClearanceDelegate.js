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
  CFormInput,
  CFormLabel,
  CFormCheck,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, fmtDate, toInputDate } from './clearanceApi'
import UserPicker from './UserPicker'

// "I am away from the 3rd to the 17th; X acts for me." While the window is
// open the delegate stands in for the delegator everywhere the module asks
// who may act — signing rows, approving a resignation as supervisor, filling
// the branch rows of a benefits statement. When it closes, authority returns
// on its own. HR can set one up for anyone.
const ClearanceDelegate = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [me, setMe] = useState(null)
  const [rows, setRows] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    delegator: '',
    delegator_name: '',
    delegate: '',
    delegate_name: '',
    valid_from: toInputDate(new Date()),
    valid_to: '',
    reason: '',
  })

  const load = useCallback(async () => {
    try {
      const [m, d] = await Promise.all([
        api(token, '/me'),
        api(token, `/delegations${showAll ? '?all=1' : ''}`),
      ])
      setMe(m)
      setRows(d.data || [])
    } catch (e) {
      toast.error(e.message)
    }
  }, [token, showAll])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const create = async () => {
    if (!form.delegate) return toast.warn('Pick who will act.')
    if (!form.valid_from || !form.valid_to) return toast.warn('Give a start and an end date.')
    setBusy(true)
    try {
      await api(token, '/delegations', {
        method: 'POST',
        body: {
          delegator: form.delegator || undefined,
          delegate: form.delegate,
          valid_from: form.valid_from,
          valid_to: form.valid_to,
          reason: form.reason,
        },
      })
      toast.success('Delegation saved.')
      setForm((f) => ({ ...f, delegate: '', delegate_name: '', valid_to: '', reason: '' }))
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
    return null
  }

  const endNow = async (d) => {
    setBusy(true)
    try {
      await api(token, `/delegations/${d._id}`, { method: 'PATCH', body: { end_now: true } })
      toast.success('Delegation ended.')
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const status = (d) => {
    if (d.active === false) return <CBadge color="secondary">ended</CBadge>
    if (d.in_window) return <CBadge color="success">in force</CBadge>
    if (d.expired) return <CBadge color="secondary">expired</CBadge>
    return <CBadge color="info">upcoming</CBadge>
  }

  const mine = me ? (rows || []).filter((d) => d.delegator === me.domain_user) : []
  const actingForMe = mine.filter((d) => d.in_window)
  const iActFor = me ? (rows || []).filter((d) => d.delegate === me.domain_user && d.in_window) : []

  return (
    <>
      <ToastContainer position="top-right" />
      <h4 className="mb-1">Delegate</h4>
      <p className="text-medium-emphasis mb-3">
        Hand your clearance authority to someone for a period — signing rows, approving resignations
        as supervisor, filling the benefits statement. It returns to you automatically when the
        period ends.
      </p>

      {me && (actingForMe.length > 0 || iActFor.length > 0) && (
        <CAlert color="info" className="py-2">
          {actingForMe.map((d) => (
            <div key={d._id}>
              <strong>{d.delegate_name}</strong> is acting for you until {fmtDate(d.valid_to)}.
            </div>
          ))}
          {iActFor.map((d) => (
            <div key={d._id}>
              You are acting for <strong>{d.delegator_name}</strong> until {fmtDate(d.valid_to)}.
            </div>
          ))}
        </CAlert>
      )}

      <CCard className="mb-3">
        <CCardHeader>
          <strong>New delegation</strong>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3">
            {me && me.is_admin && (
              <CCol md={6}>
                <CFormLabel>
                  Delegating on behalf of{' '}
                  <small className="text-medium-emphasis">(leave empty for yourself)</small>
                </CFormLabel>
                <UserPicker
                  token={token}
                  value={form.delegator}
                  displayName={
                    form.delegator_name ? `${form.delegator_name} (${form.delegator})` : ''
                  }
                  onChange={({ user, name }) =>
                    setForm((f) => ({ ...f, delegator: user, delegator_name: name }))
                  }
                />
              </CCol>
            )}
            <CCol md={6}>
              <CFormLabel>Who will act</CFormLabel>
              <UserPicker
                token={token}
                value={form.delegate}
                displayName={form.delegate_name ? `${form.delegate_name} (${form.delegate})` : ''}
                onChange={({ user, name }) =>
                  setForm((f) => ({ ...f, delegate: user, delegate_name: name }))
                }
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel>From</CFormLabel>
              <CFormInput
                type="date"
                value={form.valid_from}
                onChange={(e) => set('valid_from', e.target.value)}
              />
            </CCol>
            <CCol md={3}>
              <CFormLabel>To (inclusive)</CFormLabel>
              <CFormInput
                type="date"
                value={form.valid_to}
                min={form.valid_from}
                onChange={(e) => set('valid_to', e.target.value)}
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Reason (optional)</CFormLabel>
              <CFormInput
                value={form.reason}
                onChange={(e) => set('reason', e.target.value)}
                placeholder="e.g. annual leave"
              />
            </CCol>
          </CRow>
          <CButton color="primary" className="mt-3" disabled={busy} onClick={create}>
            {busy ? <CSpinner size="sm" /> : 'Save delegation'}
          </CButton>
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader
          className="d-flex justify-content-between align-items-center flex-wrap"
          style={{ gap: 8 }}
        >
          <strong>{showAll ? 'All delegations' : 'My delegations'}</strong>
          {me && me.is_admin && (
            <CFormCheck
              id="deleg-all"
              label="Show everyone's (HR)"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
            />
          )}
        </CCardHeader>
        <CCardBody className="p-0">
          {!rows ? (
            <div className="p-3">
              <CSpinner size="sm" /> Loading…
            </div>
          ) : rows.length === 0 ? (
            <CAlert color="light" className="m-3">
              No delegations.
            </CAlert>
          ) : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Delegator</CTableHeaderCell>
                  <CTableHeaderCell>Acts for them</CTableHeaderCell>
                  <CTableHeaderCell>Period</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Reason</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {rows.map((d) => (
                  <CTableRow key={d._id}>
                    <CTableDataCell>
                      <strong>{d.delegator_name}</strong>
                      <br />
                      <small className="text-medium-emphasis">{d.delegator}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <strong>{d.delegate_name}</strong>
                      <br />
                      <small className="text-medium-emphasis">{d.delegate}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {fmtDate(d.valid_from)} → {fmtDate(d.valid_to)}
                    </CTableDataCell>
                    <CTableDataCell>{status(d)}</CTableDataCell>
                    <CTableDataCell>{d.reason || '—'}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      {d.active !== false &&
                        !d.expired &&
                        (me.is_admin || d.delegator === me.domain_user) && (
                          <CButton
                            size="sm"
                            color="danger"
                            variant="outline"
                            disabled={busy}
                            onClick={() => endNow(d)}
                          >
                            End now
                          </CButton>
                        )}
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>
    </>
  )
}

export default ClearanceDelegate
