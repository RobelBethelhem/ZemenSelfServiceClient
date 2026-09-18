import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CFormTextarea,
  CFormInput,
  CFormLabel,
  CCollapse,
  CRow,
  CCol,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { toast } from 'react-toastify'

import { api, fmtDate, fmtDateTime, fmtLongDate, toInputDate } from './clearanceApi'
import { STATUS_META } from './clearanceContent'
import ClearanceStatusBadge from './ClearanceStatusBadge'
import ClearanceFormView from './ClearanceFormView'
import ClearanceFormPrint from './ClearanceFormPrint'
import ResignationLetterView from './ResignationLetterView'
import TaskActModal from './TaskActModal'
import UserPicker from './UserPicker'

// One clearance, in full, with every action the viewer is entitled to.
//
// Embedded by the employee's page, the signatory inbox and HR's list, so the
// three audiences see the same document. What each may do comes from the
// server (`viewer` capabilities) — the component never guesses at authority.

// A small reason/confirm dialog reused for reject, reopen, cancel.
const PromptModal = ({
  visible,
  title,
  label,
  placeholder,
  confirmLabel,
  color,
  onClose,
  onConfirm,
  busy,
}) => {
  const [text, setText] = useState('')
  useEffect(() => {
    if (visible) setText('')
  }, [visible])
  return (
    <CModal
      visible={visible}
      onClose={() => !busy && onClose()}
      backdrop="static"
      alignment="center"
    >
      <CModalHeader closeButton={!busy}>
        <CModalTitle>{title}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CFormLabel>{label}</CFormLabel>
        <CFormTextarea
          rows={3}
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
        />
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" disabled={busy} onClick={onClose}>
          Back
        </CButton>
        <CButton
          color={color}
          disabled={busy || !text.trim()}
          onClick={() => onConfirm(text.trim())}
        >
          {busy ? <CSpinner size="sm" /> : confirmLabel}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
PromptModal.propTypes = {
  visible: PropTypes.bool,
  title: PropTypes.string,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  confirmLabel: PropTypes.string,
  color: PropTypes.string,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  busy: PropTypes.bool,
}

// The List of Benefits: system rows are fixed, branch rows belong to the
// branch, HR rows to HR. Each side saves what it may; the branch submits to
// HR; HR issues. Once issued it is read-only and on the form.
const BenefitsCard = ({ token, clearance, viewer, names, onChanged }) => {
  const b = clearance.benefits
  const v = viewer.benefits
  const [values, setValues] = useState({})
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const init = {}
    ;(b && b.rows ? b.rows : []).forEach((r) => {
      init[r.code] = r.value || ''
    })
    setValues(init)
  }, [b])

  if (!v.exists) return null
  const who = (u) => (u && names[u]) || u || ''

  if (!v.can_view) {
    return (
      <CCard className="mb-3">
        <CCardHeader>
          <strong>Benefits statement</strong>
        </CCardHeader>
        <CCardBody>
          <small className="text-medium-emphasis">
            Being prepared —{' '}
            {b && b.branch_submitted_at
              ? 'branch rows submitted; HR completing.'
              : 'waiting for the branch.'}{' '}
            Signatories see it once HR issues it.
          </small>
        </CCardBody>
      </CCard>
    )
  }

  const editable = (r) =>
    !b.issued &&
    ((r.filled_by === 'branch' && v.can_fill_branch) || (r.filled_by === 'hr' && v.can_fill_hr))
  const dirty = (b.rows || []).some(
    (r) => editable(r) && (values[r.code] || '') !== (r.value || ''),
  )

  const run = async (path, okMsg) => {
    setBusy(true)
    try {
      await api(token, path, { method: 'POST', body: { id: clearance._id } })
      toast.success(okMsg)
      await onChanged()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }
  const save = async () => {
    const payload = {}
    ;(b.rows || []).forEach((r) => {
      if (editable(r)) payload[r.code] = values[r.code] || ''
    })
    setBusy(true)
    try {
      await api(token, '/benefits/fill', {
        method: 'POST',
        body: { id: clearance._id, values: payload },
      })
      toast.success('Saved.')
      await onChanged()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  const fillerBadge = (r) =>
    r.filled_by === 'system' ? (
      <CBadge color="light" style={{ color: '#444' }}>
        system
      </CBadge>
    ) : r.filled_by === 'branch' ? (
      <CBadge color="info">branch</CBadge>
    ) : (
      <CBadge color="primary">HR</CBadge>
    )

  return (
    <CCard className="mb-3">
      <CCardHeader
        className="d-flex justify-content-between align-items-center flex-wrap"
        style={{ gap: 8 }}
      >
        <div>
          <strong>Benefits statement</strong>{' '}
          {b.issued ? (
            <CBadge color="success">issued {fmtDate(b.issued_at)}</CBadge>
          ) : b.branch_submitted_at ? (
            <CBadge color="warning">branch submitted · HR to complete</CBadge>
          ) : (
            <CBadge color="secondary">waiting for the branch</CBadge>
          )}
          <div>
            <small className="text-medium-emphasis">
              Branch rows:{' '}
              {b.branch_unit_name
                ? `${b.branch_unit_code ? `${b.branch_unit_code} — ` : ''}${b.branch_unit_name}`
                : 'no branch resolved — HR fills them'}
              {v.fillers && v.fillers.length ? ` (${v.fillers.map(who).join(', ')})` : ''}
              {b.branch_submitted_at
                ? ` · submitted ${fmtDateTime(b.branch_submitted_at)} by ${who(b.branch_submitted_by)}`
                : ''}
            </small>
          </div>
        </div>
        {!b.issued && (
          <div className="d-flex flex-wrap" style={{ gap: 6 }}>
            {(v.can_fill_branch || v.can_fill_hr) && (
              <CButton size="sm" color="primary" disabled={busy || !dirty} onClick={save}>
                {busy ? <CSpinner size="sm" /> : 'Save'}
              </CButton>
            )}
            {v.can_submit_branch && (
              <CButton
                size="sm"
                color="info"
                disabled={busy || dirty}
                title={dirty ? 'Save first' : ''}
                onClick={() => run('/benefits/submit-branch', 'Branch rows submitted to HR.')}
              >
                Submit branch rows to HR
              </CButton>
            )}
            {v.can_issue && (
              <CButton
                size="sm"
                color="success"
                disabled={busy || dirty}
                title={dirty ? 'Save first' : ''}
                onClick={() => run('/benefits/issue', 'Statement issued to the signatories.')}
              >
                Issue to signatories
              </CButton>
            )}
          </div>
        )}
      </CCardHeader>
      <CCardBody className="p-0">
        <CTable small bordered className="mb-0">
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>List of Benefits</CTableHeaderCell>
              <CTableHeaderCell style={{ width: 90 }}>Filled by</CTableHeaderCell>
              <CTableHeaderCell>Amount / Details</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {(b.rows || []).map((r) => (
              <CTableRow key={r.code}>
                <CTableDataCell>
                  <strong>{r.label}</strong>
                </CTableDataCell>
                <CTableDataCell>{fillerBadge(r)}</CTableDataCell>
                <CTableDataCell>
                  {editable(r) ? (
                    <CFormInput
                      size="sm"
                      value={values[r.code] || ''}
                      placeholder={
                        r.filled_by === 'branch'
                          ? 'e.g. None / 100% of Bank’s contribution'
                          : 'e.g. 22.01 days / Not Eligible / 1 month salary'
                      }
                      onChange={(e) => setValues((x) => ({ ...x, [r.code]: e.target.value }))}
                    />
                  ) : (
                    <>
                      {r.value || <span className="text-medium-emphasis">—</span>}
                      {r.filled_by_user && r.filled_by_user !== 'system' && r.value ? (
                        <small className="text-medium-emphasis ms-2">
                          {who(r.filled_by_user)}, {fmtDate(r.filled_at)}
                        </small>
                      ) : null}
                    </>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}
BenefitsCard.propTypes = {
  token: PropTypes.string,
  clearance: PropTypes.object.isRequired,
  viewer: PropTypes.object.isRequired,
  names: PropTypes.object,
  onChanged: PropTypes.func.isRequired,
}

const ClearanceDetail = ({ id, token, onChanged, extraActions }) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  const [actTask, setActTask] = useState(null)
  const [prompt, setPrompt] = useState(null) // { kind, task }
  const [verifyTask, setVerifyTask] = useState(null)
  const [verifyName, setVerifyName] = useState('')
  const [verifyDate, setVerifyDate] = useState(toInputDate(new Date()))
  const [reassignTask, setReassignTask] = useState(null)
  const [reassignUsers, setReassignUsers] = useState([])
  const [printArtifact, setPrintArtifact] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setData(await api(token, `/detail/${id}`))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id, token])

  useEffect(() => {
    if (id && token) load()
  }, [id, token, load])

  const changed = async () => {
    await load()
    if (onChanged) onChanged()
  }

  const run = async (fn, okMsg) => {
    setBusy(true)
    try {
      await fn()
      if (okMsg) toast.success(okMsg)
      setPrompt(null)
      setVerifyTask(null)
      setReassignTask(null)
      await changed()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="py-4 text-center">
        <CSpinner /> <span className="ms-2">Loading clearance…</span>
      </div>
    )
  }
  if (error) return <CAlert color="danger">{error}</CAlert>
  if (!data) return null

  const { clearance: c, viewer: v, names, acting = {}, sla_days: slaDays } = data
  const meta = STATUS_META[c.status] || {}
  const who = (u) => (u && names[u]) || u || ''

  const decide = (decision, reason = '') =>
    run(
      () => api(token, '/decide', { method: 'POST', body: { id: c._id, decision, reason } }),
      decision === 'approve' ? 'Approved.' : 'Rejected.',
    )

  const renderActions = (t) => {
    const btns = []
    if (v.can_act.includes(t.code)) {
      btns.push(
        <CButton
          key="act"
          size="sm"
          color={t.status === 'Outstanding' ? 'warning' : 'success'}
          onClick={() => setActTask(t)}
        >
          {t.status === 'Outstanding' ? 'Update / Sign' : 'Sign'}
        </CButton>,
      )
    }
    if (v.can_verify_manual.includes(t.code)) {
      btns.push(
        <CButton
          key="verify"
          size="sm"
          color="dark"
          onClick={() => {
            setVerifyTask(t)
            setVerifyName('')
            setVerifyDate(toInputDate(new Date()))
          }}
        >
          Record hand signature
        </CButton>,
      )
    }
    if (v.can_reopen.includes(t.code)) {
      btns.push(
        <CButton
          key="reopen"
          size="sm"
          color="secondary"
          variant="outline"
          onClick={() => setPrompt({ kind: 'reopen', task: t })}
        >
          Reopen
        </CButton>,
      )
    }
    if (v.can_reassign && !t.is_final && t.status !== 'Not Applicable' && t.status !== 'Cleared') {
      btns.push(
        <CButton
          key="reassign"
          size="sm"
          color="info"
          variant="outline"
          onClick={() => {
            setReassignTask(t)
            setReassignUsers([])
          }}
        >
          Reassign
        </CButton>,
      )
    }
    if (!btns.length) return null
    return (
      <div className="d-flex flex-wrap" style={{ gap: 6 }}>
        {btns}
      </div>
    )
  }

  return (
    <>
      {/* ---------- header ---------- */}
      <CCard className="mb-3">
        <CCardBody>
          <CRow className="g-3">
            <CCol md={7}>
              <h5 className="mb-1">
                {c.employee_name} <span className="text-medium-emphasis">({c.domain_user})</span>
              </h5>
              <div className="text-medium-emphasis">
                {c.job_title || '—'}
                {c.department ? ` · ${c.department}` : ''}
                {c.unit_name && c.unit_name !== c.department ? ` · ${c.unit_name}` : ''}
              </div>
              <div className="mt-2">
                <CBadge color="primary" shape="rounded-pill" className="me-2">
                  {c.termination_type}
                </CBadge>
                <small>
                  Release: <strong>{fmtLongDate(c.release_date)}</strong>
                  {c.immediate ? ' (immediate)' : ''}
                  {' · '}initiated by {c.initiated_by === 'hr' ? 'HR' : 'the employee'} on{' '}
                  {fmtDate(c.submitted_at || c.createdAt)}
                  {c.opened_at
                    ? ` · signatories opened ${fmtDate(c.opened_at)} by ${who(c.opened_by)}`
                    : ''}
                </small>
              </div>
            </CCol>
            <CCol md={5} className="text-md-end">
              <div>
                <ClearanceStatusBadge status={c.status} />
              </div>
              <small className="text-medium-emphasis d-block mt-1">{meta.text}</small>
              {c.certificate_number && (
                <div className="mt-2">
                  Certificate <strong>{c.certificate_number}</strong>
                  <br />
                  <small className="text-medium-emphasis">
                    cleared {fmtDateTime(c.cleared_at)}
                  </small>
                </div>
              )}
            </CCol>
          </CRow>

          {v.acting_for_supervisor && (
            <CAlert color="info" className="py-2 mt-3 mb-0">
              You are acting for <strong>{who(v.acting_for_supervisor)}</strong> (delegation in
              force).
            </CAlert>
          )}
          {c.hris_gaps && c.hris_gaps.length > 0 && (
            <CAlert color="warning" className="py-2 mt-3 mb-0">
              HRIS had no value for: <strong>{c.hris_gaps.join(', ')}</strong>. Those fields were
              filled from the portal profile and are marked on the form — please verify and correct
              HRIS.
            </CAlert>
          )}
          {c.supervisor_unresolved && c.status !== 'Cleared' && c.status !== 'Cancelled' && (
            <CAlert color="info" className="py-2 mt-3 mb-0">
              No immediate supervisor is mapped for this employee in the reporting tree, so HR acts
              at the supervisor stage. Register the employee under their manager to fix this for
              next time.
            </CAlert>
          )}
          {c.status === 'Approved' && (
            <CAlert color="light" className="py-2 mt-3 mb-0">
              Approved but not yet opened. HR opens the signatories from <em>Open Signatories</em>;
              until then the employee may withdraw.
            </CAlert>
          )}
          {c.status === 'Cancelled' && c.cancelled && (
            <CAlert color="secondary" className="py-2 mt-3 mb-0">
              Cancelled by {who(c.cancelled.by)} on {fmtDateTime(c.cancelled.at)}:{' '}
              {c.cancelled.reason}
            </CAlert>
          )}

          {/* ---------- top-level actions ---------- */}
          <div className="d-flex flex-wrap mt-3" style={{ gap: 8 }}>
            {v.decide_stage && (
              <>
                <CButton color="success" disabled={busy} onClick={() => decide('approve')}>
                  Approve resignation
                  {v.decide_stage === 'supervisor' && v.is_admin && !v.is_supervisor
                    ? ' (on behalf of supervisor)'
                    : ''}
                </CButton>
                <CButton
                  color="danger"
                  variant="outline"
                  disabled={busy}
                  onClick={() => setPrompt({ kind: 'reject' })}
                >
                  Reject…
                </CButton>
              </>
            )}
            {v.can_open_now && (
              <CButton
                color="success"
                disabled={busy}
                onClick={() =>
                  run(
                    () => api(token, '/open-now', { method: 'POST', body: { id: c._id } }),
                    'Signatories opened.',
                  )
                }
              >
                Open signatories
              </CButton>
            )}
            {v.can_print_form && !v.can_print_certificate && (
              <CButton color="dark" variant="outline" onClick={() => setPrintArtifact('form')}>
                Print form for CEO signature
              </CButton>
            )}
            {v.can_print_certificate && (
              <CButton color="dark" onClick={() => setPrintArtifact('certificate')}>
                Print certificate
              </CButton>
            )}
            {v.can_cancel && (
              <CButton
                color="danger"
                variant="ghost"
                disabled={busy}
                onClick={() => setPrompt({ kind: 'cancel' })}
              >
                Cancel clearance…
              </CButton>
            )}
            {extraActions}
          </div>
        </CCardBody>
      </CCard>

      {/* ---------- departure approval ---------- */}
      <CCard className="mb-3">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <strong>Departure approval</strong>
          {(c.resignation_letter || c.resignation_letter_parts) && (
            <CButton
              size="sm"
              color="secondary"
              variant="ghost"
              onClick={() => setShowLetter((s) => !s)}
            >
              {showLetter ? 'Hide' : 'Show'} resignation letter
            </CButton>
          )}
        </CCardHeader>
        <CCardBody>
          <CCollapse visible={showLetter}>
            <div className="mb-3">
              <ResignationLetterView
                parts={c.resignation_letter_parts || null}
                text={c.resignation_letter}
                compact
              />
            </div>
          </CCollapse>
          {c.reason && !c.resignation_letter && (
            <p className="mb-2">
              <strong>Reason / notes:</strong> {c.reason}
            </p>
          )}
          <div>
            <strong>Supervisor:</strong>{' '}
            {c.supervisor_user ? (
              <>
                {who(c.supervisor_user)}
                {acting[Object.keys(acting).find((d) => acting[d] === c.supervisor_user) || '']
                  ? null
                  : null}
                {Object.keys(acting).some((d) => acting[d] === c.supervisor_user) ? (
                  <small className="text-medium-emphasis">
                    {' '}
                    — {who(Object.keys(acting).find((d) => acting[d] === c.supervisor_user))} is
                    acting for them
                  </small>
                ) : null}
              </>
            ) : (
              'not mapped'
            )}
          </div>
          {(c.decision_history || []).length === 0 ? (
            <small className="text-medium-emphasis">No decisions yet.</small>
          ) : (
            <ul className="mb-0 mt-2">
              {c.decision_history.map((d, i) => (
                <li key={i}>
                  <CBadge color={d.decision === 'approve' ? 'success' : 'danger'} className="me-2">
                    {d.decision === 'approve' ? 'Approved' : 'Rejected'}
                  </CBadge>
                  <strong>{d.stage === 'hr' ? 'HR' : 'Supervisor'}</strong>
                  {d.on_behalf ? ' (HR on behalf)' : ''}
                  {d.acting_for ? ` (${who(d.by)} for ${who(d.acting_for)})` : ''} —{' '}
                  {d.by_name || who(d.by)}, {fmtDateTime(d.at)}
                  {d.reason ? <div className="text-medium-emphasis ms-4">“{d.reason}”</div> : null}
                </li>
              ))}
            </ul>
          )}
        </CCardBody>
      </CCard>

      {/* ---------- benefits statement ---------- */}
      <BenefitsCard token={token} clearance={c} viewer={v} names={names} onChanged={changed} />

      {/* ---------- the form ---------- */}
      <CCard className="mb-3">
        <CCardHeader>
          <strong>Clearance form</strong>
          {c.template_version ? (
            <small className="text-medium-emphasis ms-2">template v{c.template_version}</small>
          ) : null}
          {c.opened_at ? (
            <small className="text-medium-emphasis ms-2">opened {fmtDateTime(c.opened_at)}</small>
          ) : null}
        </CCardHeader>
        <CCardBody>
          <ClearanceFormView
            clearance={c}
            names={names}
            acting={acting}
            benefits={v.benefits.can_view && c.benefits && c.benefits.issued ? c.benefits : null}
            renderActions={renderActions}
            slaDays={slaDays}
          />
        </CCardBody>
      </CCard>

      {/* ---------- modals ---------- */}
      <TaskActModal
        visible={!!actTask}
        onClose={() => setActTask(null)}
        token={token}
        clearanceId={c._id}
        task={actTask}
        employeeName={c.employee_name}
        onDone={changed}
      />

      <PromptModal
        visible={!!prompt && prompt.kind === 'reject'}
        title="Reject resignation"
        label="Reason (the employee will see this)"
        placeholder="e.g. Handover plan required before release; please resubmit with a later date."
        confirmLabel="Reject"
        color="danger"
        busy={busy}
        onClose={() => setPrompt(null)}
        onConfirm={(reason) => decide('reject', reason)}
      />
      <PromptModal
        visible={!!prompt && prompt.kind === 'reopen'}
        title={`Reopen: ${prompt && prompt.task ? prompt.task.label : ''}`}
        label="Why is this row being reopened?"
        placeholder="e.g. A second laptop was found issued to this employee."
        confirmLabel="Reopen row"
        color="warning"
        busy={busy}
        onClose={() => setPrompt(null)}
        onConfirm={(note) =>
          run(
            () =>
              api(token, '/task/reopen', {
                method: 'POST',
                body: { id: c._id, task_code: prompt.task.code, note },
              }),
            'Row reopened.',
          )
        }
      />
      <PromptModal
        visible={!!prompt && prompt.kind === 'cancel'}
        title="Cancel clearance"
        label="Reason"
        placeholder="e.g. Resignation withdrawn; employee retained."
        confirmLabel="Cancel clearance"
        color="danger"
        busy={busy}
        onClose={() => setPrompt(null)}
        onConfirm={(reason) =>
          run(
            () => api(token, '/cancel', { method: 'POST', body: { id: c._id, reason } }),
            'Cancelled.',
          )
        }
      />

      <CModal
        visible={!!verifyTask}
        onClose={() => !busy && setVerifyTask(null)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader closeButton={!busy}>
          <CModalTitle>Record hand signature — {verifyTask ? verifyTask.label : ''}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p>
            Confirm that the printed form was signed by hand. Your name and the time are recorded as
            the verifier.
          </p>
          <CFormLabel>Signed by (name as written)</CFormLabel>
          <CFormInput
            value={verifyName}
            onChange={(e) => setVerifyName(e.target.value)}
            placeholder="e.g. Dereje Zebene"
          />
          <CFormLabel className="mt-2">Signed on</CFormLabel>
          <CFormInput
            type="date"
            value={verifyDate}
            onChange={(e) => setVerifyDate(e.target.value)}
          />
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={busy}
            onClick={() => setVerifyTask(null)}
          >
            Back
          </CButton>
          <CButton
            color="dark"
            disabled={busy || !verifyName.trim()}
            onClick={() =>
              run(
                () =>
                  api(token, '/task/verify-manual', {
                    method: 'POST',
                    body: {
                      id: c._id,
                      task_code: verifyTask.code,
                      signed_by_name: verifyName.trim(),
                      signed_on: verifyDate,
                    },
                  }),
                'Signature recorded.',
              )
            }
          >
            {busy ? <CSpinner size="sm" /> : 'Record signature'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={!!reassignTask}
        onClose={() => !busy && setReassignTask(null)}
        backdrop="static"
        alignment="center"
      >
        <CModalHeader closeButton={!busy}>
          <CModalTitle>Reassign — {reassignTask ? reassignTask.label : ''}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-2">
            Replace who may sign this row on this clearance only. The template and the reporting
            tree are not changed.
          </p>
          <UserPicker
            token={token}
            value=""
            onChange={({ user }) =>
              user && setReassignUsers((prev) => (prev.includes(user) ? prev : [...prev, user]))
            }
            placeholder="Add a person…"
          />
          <div className="mt-2 d-flex flex-wrap" style={{ gap: 6 }}>
            {reassignUsers.map((u) => (
              <CBadge
                key={u}
                color="info"
                style={{ cursor: 'pointer' }}
                onClick={() => setReassignUsers((p) => p.filter((x) => x !== u))}
                title="remove"
              >
                {u} ×
              </CBadge>
            ))}
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={busy}
            onClick={() => setReassignTask(null)}
          >
            Back
          </CButton>
          <CButton
            color="info"
            disabled={busy || !reassignUsers.length}
            onClick={() =>
              run(
                () =>
                  api(token, '/task/reassign', {
                    method: 'POST',
                    body: { id: c._id, task_code: reassignTask.code, users: reassignUsers },
                  }),
                'Row reassigned.',
              )
            }
          >
            {busy ? <CSpinner size="sm" /> : 'Reassign'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={!!printArtifact}
        onClose={() => setPrintArtifact(null)}
        size="xl"
        scrollable
        backdrop="static"
        alignment="top"
      >
        <CModalHeader>
          <CModalTitle>
            {printArtifact === 'certificate' ? 'Exit Clearance Certificate' : 'Exit Clearance Form'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: '#eef0f4' }}>
          {printArtifact && (
            <ClearanceFormPrint
              clearance={c}
              names={names}
              acting={acting}
              benefits={v.benefits.can_view && c.benefits && c.benefits.issued ? c.benefits : null}
              artifact={printArtifact}
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setPrintArtifact(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

ClearanceDetail.propTypes = {
  id: PropTypes.string.isRequired,
  token: PropTypes.string,
  onChanged: PropTypes.func,
  extraActions: PropTypes.node,
}

export default ClearanceDetail
