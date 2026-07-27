import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormSelect,
  CFormLabel,
  CFormTextarea,
  CSpinner,
  CAlert,
  CBadge,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
} from '@coreui/react'
import {
  fetchRatingPolicies,
  saveRatingPolicy,
  fetchPolicyHistory,
  RATING_MODES,
  MODE_LABELS,
  MODE_HINTS,
} from '../../../api/serviceRating'

const MODE_COLORS = {
  mandatory: 'danger',
  optional: 'warning',
  disabled: 'secondary',
}

const TYPE_LABELS = {
  Experience: 'Experience Letter',
  Embassy: 'Embassy Letter',
  Guranty: 'Guaranty Letter',
  Supportive: 'Supportive Letter',
  Medical: 'Medical Referral Slip',
}

const fmtDate = (value) => {
  if (!value) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fmtDateTime = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// <input type="date"> needs yyyy-mm-dd, and must use LOCAL date parts —
// toISOString() would shift the day backwards for anyone east of UTC.
const toDateInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const describeWindow = (policy) => {
  const from = fmtDate(policy.effective_from)
  const to = fmtDate(policy.effective_to)
  if (!from && !to) return 'Always'
  if (from && to) return `${from} → ${to}`
  if (from) return `From ${from}`
  return `Until ${to}`
}

const ServiceRatingPolicyPage = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyType, setHistoryType] = useState('')
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await fetchRatingPolicies({ accessToken })
      setPolicies(data.policies || [])
    } catch (e) {
      setError(e.message || 'Could not load rating policies.')
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const openHistory = async (requestType = '') => {
    setHistoryType(requestType)
    setHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const data = await fetchPolicyHistory({ accessToken, requestType })
      setHistory(data.data || [])
    } catch (e) {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  const openEditor = (policy) => {
    setFormError('')
    setEditing({
      request_type: policy.request_type,
      mode: policy.mode || 'mandatory',
      fallback_mode: policy.fallback_mode || 'optional',
      effective_from: toDateInput(policy.effective_from),
      effective_to: toDateInput(policy.effective_to),
      note: policy.note || '',
    })
  }

  const save = async () => {
    if (
      editing.effective_from &&
      editing.effective_to &&
      editing.effective_to < editing.effective_from
    ) {
      setFormError('The end date cannot be earlier than the start date.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      await saveRatingPolicy({ accessToken, policy: editing })
      setNotice(`Rating policy for ${TYPE_LABELS[editing.request_type]} updated.`)
      setEditing(null)
      await load()
    } catch (e) {
      setFormError(e.message || 'Could not save the policy.')
    } finally {
      setSaving(false)
    }
  }

  const hasWindow = editing && (editing.effective_from || editing.effective_to)

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>Service Rating Policy</strong>
              <div className="small text-medium-emphasis">
                Choose, per letter type, whether the feedback survey is compulsory, offered, or
                switched off — optionally only for a set period.
              </div>
            </div>
            <CButton color="primary" variant="outline" onClick={() => openHistory('')}>
              Change history
            </CButton>
          </CCardHeader>

          <CCardBody>
            {error ? <CAlert color="danger">{error}</CAlert> : null}
            {notice ? (
              <CAlert color="success" dismissible onClose={() => setNotice('')}>
                {notice}
              </CAlert>
            ) : null}

            <CAlert color="info" className="py-2" style={{ fontSize: '0.85rem' }}>
              A letter type that has never been configured behaves as <strong>Mandatory</strong>.
              Whichever mode applies, a user who starts the survey must answer all four rating
              questions — the suggestion box stays optional. Partial submissions are never accepted.
            </CAlert>

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Letter type</CTableHeaderCell>
                      <CTableHeaderCell>In force now</CTableHeaderCell>
                      <CTableHeaderCell>Configured mode</CTableHeaderCell>
                      <CTableHeaderCell>Period</CTableHeaderCell>
                      <CTableHeaderCell>Outside period</CTableHeaderCell>
                      <CTableHeaderCell>Last change</CTableHeaderCell>
                      <CTableHeaderCell />
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {policies.map((p) => (
                      <CTableRow key={p.request_type}>
                        <CTableDataCell className="fw-semibold">
                          {TYPE_LABELS[p.request_type] || p.request_type}
                          {!p.configured ? (
                            <div className="small text-medium-emphasis">Not configured</div>
                          ) : null}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={MODE_COLORS[p.resolved_mode] || 'secondary'}>
                            {MODE_LABELS[p.resolved_mode] || p.resolved_mode}
                          </CBadge>
                          {p.configured && p.resolved_mode !== p.mode ? (
                            <div className="small text-medium-emphasis">outside the set period</div>
                          ) : null}
                        </CTableDataCell>
                        <CTableDataCell>{MODE_LABELS[p.mode] || p.mode}</CTableDataCell>
                        <CTableDataCell>{describeWindow(p)}</CTableDataCell>
                        <CTableDataCell>
                          {p.effective_from || p.effective_to
                            ? MODE_LABELS[p.fallback_mode] || p.fallback_mode
                            : '—'}
                        </CTableDataCell>
                        <CTableDataCell className="small text-medium-emphasis">
                          {p.updated_at ? (
                            <>
                              {fmtDateTime(p.updated_at)}
                              {p.updated_by ? <div>by {p.updated_by}</div> : null}
                            </>
                          ) : (
                            '—'
                          )}
                        </CTableDataCell>
                        <CTableDataCell className="text-end text-nowrap">
                          <CButton
                            size="sm"
                            color="secondary"
                            variant="ghost"
                            className="me-1"
                            onClick={() => openHistory(p.request_type)}
                          >
                            History
                          </CButton>
                          <CButton size="sm" color="primary" onClick={() => openEditor(p)}>
                            Change
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      {/* ---------------- editor ---------------- */}
      <CModal
        visible={!!editing}
        onClose={() => {
          if (!saving) setEditing(null)
        }}
        alignment="center"
        size="lg"
      >
        <CModalHeader closeButton={!saving}>
          <CModalTitle>
            {editing ? TYPE_LABELS[editing.request_type] || editing.request_type : ''}
          </CModalTitle>
        </CModalHeader>
        {editing ? (
          <CModalBody>
            <CRow className="g-3">
              <CCol md={12}>
                <CFormLabel className="small mb-1">Rating mode</CFormLabel>
                <CFormSelect
                  value={editing.mode}
                  onChange={(e) => setEditing((prev) => ({ ...prev, mode: e.target.value }))}
                >
                  {RATING_MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABELS[m]}
                    </option>
                  ))}
                </CFormSelect>
                <div className="small text-medium-emphasis mt-1">{MODE_HINTS[editing.mode]}</div>
              </CCol>

              <CCol md={6}>
                <CFormLabel className="small mb-1">Apply from (optional)</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.effective_from}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, effective_from: e.target.value }))
                  }
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small mb-1">Apply until (optional)</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.effective_to}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, effective_to: e.target.value }))
                  }
                />
              </CCol>

              <CCol md={12}>
                <CFormLabel className="small mb-1">Outside that period, fall back to</CFormLabel>
                <CFormSelect
                  value={editing.fallback_mode}
                  disabled={!hasWindow}
                  onChange={(e) =>
                    setEditing((prev) => ({ ...prev, fallback_mode: e.target.value }))
                  }
                >
                  {RATING_MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABELS[m]}
                    </option>
                  ))}
                </CFormSelect>
                <div className="small text-medium-emphasis mt-1">
                  {hasWindow
                    ? 'Used before the start date and after the end date.'
                    : 'Leave both dates empty and the mode above applies permanently.'}
                </div>
              </CCol>

              <CCol md={12}>
                <CFormLabel className="small mb-1">Reason for this change (optional)</CFormLabel>
                <CFormTextarea
                  rows={2}
                  maxLength={500}
                  value={editing.note}
                  placeholder="e.g. Q3 service review — collect mandatory feedback on Medical"
                  onChange={(e) => setEditing((prev) => ({ ...prev, note: e.target.value }))}
                />
                <div className="small text-medium-emphasis mt-1">
                  Stored in the change history alongside your username and the time.
                </div>
              </CCol>
            </CRow>

            {formError ? (
              <CAlert color="danger" className="mt-3 mb-0 py-2">
                {formError}
              </CAlert>
            ) : null}
          </CModalBody>
        ) : null}
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={saving}
            onClick={() => setEditing(null)}
          >
            Cancel
          </CButton>
          <CButton color="primary" disabled={saving} onClick={save}>
            {saving ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Saving…
              </>
            ) : (
              'Save policy'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      {/* ---------------- change history ---------------- */}
      <COffcanvas
        placement="end"
        visible={historyOpen}
        onHide={() => setHistoryOpen(false)}
        style={{ width: 'min(520px, 100%)' }}
      >
        <COffcanvasHeader className="border-bottom">
          <div>
            <COffcanvasTitle>Policy change history</COffcanvasTitle>
            <div className="small text-medium-emphasis">
              {historyType ? TYPE_LABELS[historyType] || historyType : 'All letter types'}
            </div>
          </div>
          <CButton
            color="secondary"
            variant="ghost"
            size="sm"
            onClick={() => setHistoryOpen(false)}
          >
            Close
          </CButton>
        </COffcanvasHeader>
        <COffcanvasBody>
          {historyLoading ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
            </div>
          ) : history.length === 0 ? (
            <CAlert color="info">No policy changes recorded yet.</CAlert>
          ) : (
            history.map((h, i) => (
              <CCard className="mb-3" key={`${h.request_type}-${h.changed_at}-${i}`}>
                <CCardBody>
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <div className="fw-semibold">
                      {TYPE_LABELS[h.request_type] || h.request_type}
                    </div>
                    <CBadge color={MODE_COLORS[h.mode] || 'secondary'}>
                      {MODE_LABELS[h.mode] || h.mode}
                    </CBadge>
                  </div>
                  <div className="small">
                    Period: <strong>{describeWindow(h)}</strong>
                    {h.effective_from || h.effective_to ? (
                      <>
                        {' · '}outside it:{' '}
                        <strong>{MODE_LABELS[h.fallback_mode] || h.fallback_mode}</strong>
                      </>
                    ) : null}
                  </div>
                  {h.note ? (
                    <div
                      className="mt-2"
                      style={{
                        borderLeft: '3px solid #d4d8e0',
                        paddingLeft: '0.75rem',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.85rem',
                      }}
                    >
                      {h.note}
                    </div>
                  ) : null}
                  <div className="small text-medium-emphasis mt-2">
                    {h.changed_by || 'unknown'} · {fmtDateTime(h.changed_at)}
                  </div>
                </CCardBody>
              </CCard>
            ))
          )}
        </COffcanvasBody>
      </COffcanvas>
    </CRow>
  )
}

export default ServiceRatingPolicyPage
