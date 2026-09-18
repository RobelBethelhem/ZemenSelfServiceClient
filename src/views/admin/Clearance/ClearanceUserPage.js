import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CAlert,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CRow,
  CCol,
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

import { api, fmtDate, toInputDate } from './clearanceApi'
import ClearanceStatusBadge from './ClearanceStatusBadge'
import ClearanceDetail from './ClearanceDetail'

// The employee's own view: submit a resignation, then follow it through
// supervisor and HR approval, the clearance form, and the certificate.
//
// A resignation is written *for* the employee in a fixed format from three
// inputs — reason, release date, optional statement — and shown as a preview
// before it is submitted, so every letter on file reads the same way.

const emptyForm = { reason: '', additional_statement: '', immediate: false, release_date: '' }

const ResignationForm = ({ token, onSubmitted, resubmitId, initial }) => {
  const [form, setForm] = useState({ ...emptyForm, ...(initial || {}) })
  const [preview, setPreview] = useState(null)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const doPreview = async () => {
    if (!form.reason.trim()) {
      toast.warn('Please give the reason for your resignation.')
      return
    }
    if (!form.immediate && !form.release_date) {
      toast.warn('Pick a release date, or choose Immediate.')
      return
    }
    setBusy(true)
    try {
      const r = await api(token, '/resign/preview', { method: 'POST', body: form })
      setPreview(r)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    setBusy(true)
    try {
      if (resubmitId) {
        await api(token, '/resign/resubmit', { method: 'POST', body: { id: resubmitId, ...form } })
        toast.success('Resignation resubmitted.')
      } else {
        await api(token, '/resign', { method: 'POST', body: form })
        toast.success('Resignation submitted to your supervisor.')
      }
      setPreview(null)
      onSubmitted()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const minDate = toInputDate(new Date())

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>
          {resubmitId ? 'Amend and resubmit your resignation' : 'Submit a resignation'}
        </strong>
      </CCardHeader>
      <CCardBody>
        <p className="text-medium-emphasis">
          Your letter is prepared in the Bank&apos;s standard format from the details below. It goes
          to your immediate supervisor, then to HR. On your release date the exit clearance form
          opens and every department is notified to sign.
        </p>
        <CRow className="g-3">
          <CCol md={12}>
            <CFormLabel>Reason for resignation</CFormLabel>
            <CFormTextarea
              rows={3}
              value={form.reason}
              onChange={(e) => set('reason', e.target.value)}
              placeholder="e.g. I have accepted a position elsewhere / personal reasons / further studies…"
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Requested release date</CFormLabel>
            <CFormInput
              type="date"
              min={minDate}
              value={form.release_date}
              disabled={form.immediate}
              onChange={(e) => set('release_date', e.target.value)}
            />
            <CFormCheck
              className="mt-2"
              id="resign-immediate"
              label="Immediate release (clearance opens as soon as HR approves)"
              checked={form.immediate}
              onChange={(e) => set('immediate', e.target.checked)}
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Additional statement (optional)</CFormLabel>
            <CFormTextarea
              rows={3}
              value={form.additional_statement}
              onChange={(e) => set('additional_statement', e.target.value)}
              placeholder="Anything you want included in the letter, e.g. handover arrangements."
            />
          </CCol>
        </CRow>
        <div className="mt-3">
          <CButton color="primary" disabled={busy} onClick={doPreview}>
            {busy ? <CSpinner size="sm" /> : 'Preview letter'}
          </CButton>
        </div>

        <CModal
          visible={!!preview}
          onClose={() => !busy && setPreview(null)}
          size="lg"
          backdrop="static"
          alignment="center"
        >
          <CModalHeader closeButton={!busy}>
            <CModalTitle>Your resignation letter</CModalTitle>
          </CModalHeader>
          <CModalBody>
            {preview &&
              preview.snapshot &&
              preview.snapshot.hris_gaps &&
              preview.snapshot.hris_gaps.length > 0 && (
                <CAlert color="warning" className="py-2">
                  HRIS had no value for <strong>{preview.snapshot.hris_gaps.join(', ')}</strong>;
                  the portal profile was used. HR will see this flagged.
                </CAlert>
              )}
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'Calibri, "Times New Roman", serif',
                fontSize: 14,
                background: '#fafafa',
                border: '1px solid #eee',
                padding: 16,
              }}
            >
              {preview && preview.letter}
            </pre>
            <small className="text-medium-emphasis">
              By submitting you confirm this letter is your resignation. Your supervisor and HR will
              read it exactly as shown.
            </small>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="outline"
              disabled={busy}
              onClick={() => setPreview(null)}
            >
              Edit
            </CButton>
            <CButton color="success" disabled={busy} onClick={submit}>
              {busy ? <CSpinner size="sm" /> : resubmitId ? 'Resubmit' : 'Submit resignation'}
            </CButton>
          </CModalFooter>
        </CModal>
      </CCardBody>
    </CCard>
  )
}
ResignationForm.propTypes = {
  token: PropTypes.string,
  onSubmitted: PropTypes.func.isRequired,
  resubmitId: PropTypes.string,
  initial: PropTypes.object,
}

const ClearanceUserPage = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [my, setMy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [amending, setAmending] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setMy(await api(token, '/my'))
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const current = my && my.current ? my.history.find((h) => h._id === my.current) : null
  // A new resignation can start only when there is nothing live. A Cleared
  // clearance stays on screen — that is where the certificate is printed from.
  const canStart = !current || current.status === 'Cancelled'

  const withdraw = async () => {
    setBusy(true)
    try {
      await api(token, '/withdraw', { method: 'POST', body: { id: current._id } })
      toast.success('Resignation withdrawn.')
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <ToastContainer position="top-right" />
      <h4 className="mb-1">Exit Clearance</h4>
      <p className="text-medium-emphasis mb-3">
        Resignation, departmental sign-offs and your clearance certificate — in one place.
      </p>

      {loading && !my ? (
        <CSpinner />
      ) : (
        <>
          {canStart && !amending && <ResignationForm token={token} onSubmitted={load} />}

          {current && !canStart && current.status === 'Rejected' && (
            <CAlert color="danger">
              Your resignation was <strong>not approved</strong>. Read the reason below, then amend
              and resubmit — or withdraw it.
              <div className="mt-2 d-flex" style={{ gap: 8 }}>
                <CButton size="sm" color="primary" onClick={() => setAmending(true)}>
                  Amend &amp; resubmit
                </CButton>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="outline"
                  disabled={busy}
                  onClick={withdraw}
                >
                  Withdraw
                </CButton>
              </div>
            </CAlert>
          )}
          {amending && current && (
            <ResignationForm
              token={token}
              resubmitId={current._id}
              initial={{
                reason: current.reason || '',
                immediate: !!current.immediate,
                release_date: current.immediate ? '' : toInputDate(current.release_date),
              }}
              onSubmitted={() => {
                setAmending(false)
                load()
              }}
            />
          )}

          {current && !canStart && (
            <ClearanceDetail
              id={current._id}
              token={token}
              onChanged={load}
              extraActions={
                ['Pending Supervisor', 'Pending HR', 'Approved'].includes(current.status) ? (
                  <CButton color="secondary" variant="ghost" disabled={busy} onClick={withdraw}>
                    Withdraw resignation
                  </CButton>
                ) : null
              }
            />
          )}

          {my && my.history && my.history.length > 1 && (
            <CCard className="mt-3">
              <CCardHeader>
                <strong>History</strong>
              </CCardHeader>
              <CCardBody>
                <CTable small hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Submitted</CTableHeaderCell>
                      <CTableHeaderCell>Type</CTableHeaderCell>
                      <CTableHeaderCell>Release</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Certificate</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {my.history.map((h) => (
                      <CTableRow key={h._id}>
                        <CTableDataCell>{fmtDate(h.submitted_at || h.createdAt)}</CTableDataCell>
                        <CTableDataCell>{h.termination_type}</CTableDataCell>
                        <CTableDataCell>{fmtDate(h.release_date)}</CTableDataCell>
                        <CTableDataCell>
                          <ClearanceStatusBadge status={h.status} />
                        </CTableDataCell>
                        <CTableDataCell>{h.certificate_number || '—'}</CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </CCardBody>
            </CCard>
          )}
        </>
      )}
    </>
  )
}

export default ClearanceUserPage
