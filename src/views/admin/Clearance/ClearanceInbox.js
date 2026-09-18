import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
import ClearanceStatusBadge from './ClearanceStatusBadge'
import ClearanceDetail from './ClearanceDetail'
import MemoDocument from './MemoDocument'

// Everything waiting on the signed-in person: resignations to approve (as a
// supervisor, as someone's delegate, or as HR), clearance rows to sign, and
// benefits statements to fill. Acting on any of them opens the full
// clearance, so the signatory sees the whole form — HR's decision — not just
// their own line.
const ClearanceInbox = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const navigate = useNavigate()
  const [me, setMe] = useState(null)
  const [inbox, setInbox] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState(null)
  const [memoView, setMemoView] = useState(null)

  const openMemo = async (id) => {
    try {
      const r = await api(token, `/memo/${id}`)
      setMemoView(r.memo)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [m, i] = await Promise.all([api(token, '/me'), api(token, '/inbox')])
      setMe(m)
      setInbox(i)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) load().catch(() => {})
  }, [token, load])

  const due = (t) => {
    if (!t.due_at) return null
    const left = daysBetween(new Date(), t.due_at)
    if (left > 0) return <small className="text-medium-emphasis">due in {left}d</small>
    return (
      <small className="text-danger fw-bold">
        {left === 0 ? 'due today' : `overdue ${-left}d`}
      </small>
    )
  }

  const benefitsList = (inbox && inbox.benefits) || []
  const memoList = (inbox && inbox.memos) || []
  const total = inbox
    ? inbox.approvals.length + inbox.tasks.length + inbox.manual.length + benefitsList.length
    : 0

  return (
    <>
      <ToastContainer position="top-right" />
      <div
        className="d-flex justify-content-between align-items-center flex-wrap mb-3"
        style={{ gap: 8 }}
      >
        <div>
          <h4 className="mb-0">Clearance Inbox</h4>
          <small className="text-medium-emphasis">
            {loading
              ? 'Loading…'
              : total === 0
                ? 'Nothing is waiting on you.'
                : `${total} item${total === 1 ? '' : 's'} waiting on you.`}
            {me && me.acting_for && me.acting_for.length
              ? ` You are acting for ${me.acting_for.join(', ')}.`
              : ''}
          </small>
        </div>
        <div className="d-flex flex-wrap" style={{ gap: 8 }}>
          {me && (me.manages || (me.heads_units && me.heads_units.length > 0)) && (
            <CButton color="info" variant="outline" onClick={() => navigate('/clearance/my-unit')}>
              Manage my team
            </CButton>
          )}
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => navigate('/clearance/delegate')}
          >
            Delegate
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            onClick={() => load().catch(() => {})}
            disabled={loading}
          >
            Refresh
          </CButton>
        </div>
      </div>

      {inbox && inbox.approvals.length > 0 && (
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Resignations to approve</strong>{' '}
            <CBadge color="warning">{inbox.approvals.length}</CBadge>
          </CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Position</CTableHeaderCell>
                  <CTableHeaderCell>Release</CTableHeaderCell>
                  <CTableHeaderCell>Submitted</CTableHeaderCell>
                  <CTableHeaderCell>Stage</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {inbox.approvals.map((a) => (
                  <CTableRow key={a._id}>
                    <CTableDataCell>
                      <strong>{a.employee_name}</strong>
                      <br />
                      <small className="text-medium-emphasis">{a.domain_user}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {a.job_title}
                      {a.department ? (
                        <>
                          <br />
                          <small className="text-medium-emphasis">{a.department}</small>
                        </>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell>
                      {fmtDate(a.release_date)}
                      {a.immediate ? (
                        <CBadge color="danger" className="ms-1">
                          immediate
                        </CBadge>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell>{fmtDate(a.submitted_at)}</CTableDataCell>
                    <CTableDataCell>
                      <ClearanceStatusBadge status={a.status} />
                      {a.acting_for ? (
                        <>
                          <br />
                          <small className="text-info">for {a.acting_for}</small>
                        </>
                      ) : null}
                      {a.supervisor_unresolved && a.stage === 'supervisor' ? (
                        <>
                          <br />
                          <small className="text-warning">no supervisor mapped</small>
                        </>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="primary" onClick={() => setOpenId(a._id)}>
                        Review
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {benefitsList.length > 0 && (
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Benefits statements to fill</strong>{' '}
            <CBadge color="info">{benefitsList.length}</CBadge>
          </CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Branch</CTableHeaderCell>
                  <CTableHeaderCell>Your part</CTableHeaderCell>
                  <CTableHeaderCell>Opened</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {benefitsList.map((r) => (
                  <CTableRow key={`${r.clearance_id}-b`}>
                    <CTableDataCell>
                      <strong>{r.employee_name}</strong>
                      <br />
                      <small className="text-medium-emphasis">
                        {r.domain_user} · {r.job_title}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {r.branch_unit_name ? (
                        `${r.branch_unit_code ? `${r.branch_unit_code} — ` : ''}${r.branch_unit_name}`
                      ) : (
                        <em>none resolved</em>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {r.stage === 'branch' ? (
                        <CBadge color="info">branch rows</CBadge>
                      ) : (
                        <CBadge color="primary">HR rows &amp; issue</CBadge>
                      )}
                      {r.note ? (
                        <>
                          <br />
                          <small className="text-warning">{r.note}</small>
                        </>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell>{fmtDate(r.opened_at)}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="info" onClick={() => setOpenId(r.clearance_id)}>
                        Fill
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {inbox && inbox.tasks.length > 0 && (
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Rows for you to sign</strong>{' '}
            <CBadge color="warning">{inbox.tasks.length}</CBadge>
            <small className="text-medium-emphasis ms-2">
              SLA {inbox.sla_days} day{inbox.sla_days === 1 ? '' : 's'}
            </small>
          </CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Row</CTableHeaderCell>
                  <CTableHeaderCell>Release</CTableHeaderCell>
                  <CTableHeaderCell>Waiting since</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {inbox.tasks.map((r) => (
                  <CTableRow key={`${r.clearance_id}-${r.task.code}`}>
                    <CTableDataCell>
                      <strong>{r.employee_name}</strong>
                      <br />
                      <small className="text-medium-emphasis">
                        {r.domain_user} · {r.job_title}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      {r.task.label}
                      {r.acting_for ? (
                        <>
                          <br />
                          <small className="text-info">acting for {r.acting_for}</small>
                        </>
                      ) : null}
                      {r.task.items && r.task.items.length ? (
                        <>
                          <br />
                          <small className="text-medium-emphasis">
                            {r.task.items.length} item{r.task.items.length === 1 ? '' : 's'}
                          </small>
                        </>
                      ) : null}
                    </CTableDataCell>
                    <CTableDataCell>{fmtDate(r.release_date)}</CTableDataCell>
                    <CTableDataCell>
                      {fmtDate(r.task.notified_at)}
                      <br />
                      {due(r.task)}
                    </CTableDataCell>
                    <CTableDataCell>
                      <ClearanceStatusBadge task status={r.task.status} />
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="success" onClick={() => setOpenId(r.clearance_id)}>
                        Open form
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {inbox && inbox.manual.length > 0 && (
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Hand-signed rows to record</strong>{' '}
            <CBadge color="dark">{inbox.manual.length}</CBadge>
            <small className="text-medium-emphasis ms-2">
              print the form, obtain the signature, then record it
            </small>
          </CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Row</CTableHeaderCell>
                  <CTableHeaderCell>Ready since</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {inbox.manual.map((r) => (
                  <CTableRow key={`${r.clearance_id}-${r.task.code}`}>
                    <CTableDataCell>
                      <strong>{r.employee_name}</strong>{' '}
                      <small className="text-medium-emphasis">{r.domain_user}</small>
                    </CTableDataCell>
                    <CTableDataCell>{r.task.label}</CTableDataCell>
                    <CTableDataCell>
                      {fmtDate(r.task.notified_at)} {due(r.task)}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton size="sm" color="dark" onClick={() => setOpenId(r.clearance_id)}>
                        Open
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      {memoList.length > 0 && (
        <CCard className="mb-3">
          <CCardHeader>
            <strong>Memos sent to your unit</strong>{' '}
            <CBadge color="secondary">{memoList.length}</CBadge>
            <small className="text-medium-emphasis ms-2">inter-departmental memos from HR</small>
          </CCardHeader>
          <CCardBody className="p-0">
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Subject</CTableHeaderCell>
                  <CTableHeaderCell>Employee</CTableHeaderCell>
                  <CTableHeaderCell>Date</CTableHeaderCell>
                  <CTableHeaderCell>Sent</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {memoList.map((m) => (
                  <CTableRow key={m._id}>
                    <CTableDataCell>
                      <strong>{m.subject}</strong>
                    </CTableDataCell>
                    <CTableDataCell>{m.employee_name}</CTableDataCell>
                    <CTableDataCell>{fmtDate(m.memo_date)}</CTableDataCell>
                    <CTableDataCell>{fmtDate(m.sent_at)}</CTableDataCell>
                    <CTableDataCell className="text-end" style={{ whiteSpace: 'nowrap' }}>
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        className="me-1"
                        onClick={() => openMemo(m._id)}
                      >
                        View / Print
                      </CButton>
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() => setOpenId(m.clearance_id)}
                      >
                        Clearance
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      )}

      <CModal
        visible={!!memoView}
        onClose={() => setMemoView(null)}
        size="xl"
        scrollable
        backdrop="static"
        alignment="top"
      >
        <CModalHeader>
          <CModalTitle>{memoView ? memoView.subject : ''}</CModalTitle>
        </CModalHeader>
        <CModalBody style={{ background: '#eef0f4' }}>
          {memoView && <MemoDocument memo={memoView} />}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setMemoView(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>

      {!loading && inbox && total === 0 && (
        <CAlert color="light">
          You have nothing to approve, sign or fill. You will get a notification when something
          needs you.
        </CAlert>
      )}

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
          {openId && (
            <ClearanceDetail id={openId} token={token} onChanged={() => load().catch(() => {})} />
          )}
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

export default ClearanceInbox
