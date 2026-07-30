import React, { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
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
  CProgress,
  CProgressBar,
} from '@coreui/react'
import {
  fetchAnnouncementList,
  fetchAdminCategories,
  setAnnouncementStatus,
  deleteAnnouncement,
  fetchAnnouncementEngagement,
  ANNOUNCEMENT_STATUSES,
  ANNOUNCEMENT_MODES,
  MODE_LABELS,
  STATUS_LABELS,
} from '../../../api/announcement'

const STATUS_COLORS = {
  draft: 'secondary',
  published: 'success',
  archived: 'dark',
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

const describeWindow = (row) => {
  const from = fmtDate(row.publish_from)
  const to = fmtDate(row.publish_until)
  if (!from && !to) return 'Always'
  if (from && to) return `${from} → ${to}`
  if (from) return `From ${from}`
  return `Until ${to}`
}

const emptyFilters = { status: '', mode: '', category_id: '', q: '' }

const AnnouncementList = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [categories, setCategories] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busyId, setBusyId] = useState(null)

  const [confirmDelete, setConfirmDelete] = useState(null)
  const [engagement, setEngagement] = useState(null)
  const [engagementLoading, setEngagementLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchAnnouncementList({ accessToken, filters, page: 0, size: 100 })
      setRows(result.data || [])
    } catch (e) {
      setError(e.message || 'Could not load announcements.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [accessToken, filters])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    fetchAdminCategories({ accessToken })
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]))
  }, [accessToken])

  const changeStatus = async (row, status) => {
    setBusyId(row._id)
    setError('')
    try {
      await setAnnouncementStatus({ accessToken, id: row._id, status })
      setNotice(`“${row.title}” is now ${STATUS_LABELS[status].toLowerCase()}.`)
      await load()
    } catch (e) {
      setError(e.message || 'Could not change the status.')
    } finally {
      setBusyId(null)
    }
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    setBusyId(confirmDelete._id)
    try {
      await deleteAnnouncement({ accessToken, id: confirmDelete._id })
      setNotice(`“${confirmDelete.title}” was deleted.`)
      setConfirmDelete(null)
      await load()
    } catch (e) {
      setError(e.message || 'Could not delete the announcement.')
    } finally {
      setBusyId(null)
    }
  }

  const openEngagement = async (row) => {
    setEngagement({ row, data: [], meta: null })
    setEngagementLoading(true)
    try {
      const result = await fetchAnnouncementEngagement({ accessToken, id: row._id })
      setEngagement({ row, data: result.data || [], meta: result.meta || null })
    } catch (e) {
      setEngagement({ row, data: [], meta: null, error: e.message })
    } finally {
      setEngagementLoading(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>Announcements</strong>
              <div className="small text-medium-emphasis">
                Cards employees see on the screen after they sign in, and on their Announcements
                page.
              </div>
            </div>
            <div className="d-flex gap-2">
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => navigate('/admin/announcements/categories')}
              >
                Categories
              </CButton>
              <CButton color="primary" onClick={() => navigate('/admin/announcements/new')}>
                + New announcement
              </CButton>
            </div>
          </CCardHeader>

          <CCardBody>
            {error ? <CAlert color="danger">{error}</CAlert> : null}
            {notice ? (
              <CAlert color="success" dismissible onClose={() => setNotice('')}>
                {notice}
              </CAlert>
            ) : null}

            <CRow className="g-3 align-items-end mb-4">
              <CCol md={3}>
                <CFormLabel className="small mb-1">Search</CFormLabel>
                <CFormInput
                  value={filters.q}
                  placeholder="Title or summary"
                  onChange={(e) => setFilters((p) => ({ ...p, q: e.target.value }))}
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small mb-1">Status</CFormLabel>
                <CFormSelect
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="">All</option>
                  {ANNOUNCEMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CFormLabel className="small mb-1">Requirement</CFormLabel>
                <CFormSelect
                  value={filters.mode}
                  onChange={(e) => setFilters((p) => ({ ...p, mode: e.target.value }))}
                >
                  <option value="">All</option>
                  {ANNOUNCEMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {MODE_LABELS[m]}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={3}>
                <CFormLabel className="small mb-1">Category</CFormLabel>
                <CFormSelect
                  value={filters.category_id}
                  onChange={(e) => setFilters((p) => ({ ...p, category_id: e.target.value }))}
                >
                  <option value="">All</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={2}>
                <CButton
                  color="secondary"
                  variant="outline"
                  className="w-100"
                  onClick={() => setFilters(emptyFilters)}
                >
                  Reset
                </CButton>
              </CCol>
            </CRow>

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
              </div>
            ) : rows.length === 0 ? (
              <CAlert color="info" className="mb-0">
                No announcements match these filters. Use <strong>+ New announcement</strong> to
                create one.
              </CAlert>
            ) : (
              <div className="table-responsive">
                <CTable hover align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Title</CTableHeaderCell>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Requirement</CTableHeaderCell>
                      <CTableHeaderCell>Status</CTableHeaderCell>
                      <CTableHeaderCell>Shown</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Read</CTableHeaderCell>
                      <CTableHeaderCell>Updated</CTableHeaderCell>
                      <CTableHeaderCell />
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {rows.map((row) => (
                      <CTableRow key={row._id}>
                        <CTableDataCell>
                          <div className="fw-semibold">{row.title}</div>
                          <div className="small text-medium-emphasis">
                            {row.pinned ? '📌 Pinned · ' : ''}
                            {row.show_on_login ? 'On login screen' : 'Page only'}
                            {row.target_roles && row.target_roles.length === 1
                              ? ` · ${row.target_roles[0] === 'user' ? 'Employees' : 'Admins'} only`
                              : ''}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell>
                          {row.category ? (
                            <CBadge
                              style={{
                                background: row.category.color || '#0d6efd',
                                color: '#fff',
                              }}
                            >
                              {row.category.name}
                            </CBadge>
                          ) : (
                            <span className="text-medium-emphasis">—</span>
                          )}
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={row.mode === 'mandatory' ? 'warning' : 'light'}>
                            {MODE_LABELS[row.mode]}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={STATUS_COLORS[row.status] || 'secondary'}>
                            {STATUS_LABELS[row.status]}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell className="small">{describeWindow(row)}</CTableDataCell>
                        <CTableDataCell className="text-center small">
                          <div className="fw-semibold">{row.acknowledged_count}</div>
                          <div className="text-medium-emphasis">{row.seen_count} opened</div>
                        </CTableDataCell>
                        <CTableDataCell className="small text-medium-emphasis">
                          {fmtDateTime(row.updated_at || row.created_at)}
                          {row.updated_by ? <div>by {row.updated_by}</div> : null}
                        </CTableDataCell>
                        <CTableDataCell className="text-end text-nowrap">
                          <CButton
                            size="sm"
                            color="secondary"
                            variant="ghost"
                            onClick={() => openEngagement(row)}
                          >
                            Readers
                          </CButton>
                          {row.status === 'published' ? (
                            <CButton
                              size="sm"
                              color="secondary"
                              variant="ghost"
                              disabled={busyId === row._id}
                              onClick={() => changeStatus(row, 'draft')}
                            >
                              Unpublish
                            </CButton>
                          ) : (
                            <CButton
                              size="sm"
                              color="success"
                              variant="ghost"
                              disabled={busyId === row._id}
                              onClick={() => changeStatus(row, 'published')}
                            >
                              Publish
                            </CButton>
                          )}
                          {row.status !== 'archived' ? (
                            <CButton
                              size="sm"
                              color="dark"
                              variant="ghost"
                              disabled={busyId === row._id}
                              onClick={() => changeStatus(row, 'archived')}
                            >
                              Archive
                            </CButton>
                          ) : null}
                          <CButton
                            size="sm"
                            color="primary"
                            className="ms-1"
                            onClick={() =>
                              navigate(`/admin/announcements/edit?id=${row._id}`, {
                                state: { id: row._id },
                              })
                            }
                          >
                            Edit
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="ghost"
                            onClick={() => setConfirmDelete(row)}
                          >
                            Delete
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

      {/* --------------- delete confirmation --------------- */}
      <CModal visible={!!confirmDelete} onClose={() => setConfirmDelete(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>Delete announcement</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-2">
            Delete <strong>{confirmDelete ? confirmDelete.title : ''}</strong>?
          </p>
          <CAlert color="warning" className="mb-0 py-2 small">
            This also removes the record of who read it. If you only want to take it off
            employees&apos; screens, use <strong>Archive</strong> instead — that keeps the history.
          </CAlert>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </CButton>
          <CButton color="danger" disabled={!!busyId} onClick={doDelete}>
            Delete permanently
          </CButton>
        </CModalFooter>
      </CModal>

      {/* --------------- readers --------------- */}
      <CModal
        visible={!!engagement}
        onClose={() => setEngagement(null)}
        size="lg"
        alignment="center"
        scrollable
      >
        <CModalHeader>
          <CModalTitle>{engagement ? engagement.row.title : ''}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {engagementLoading ? (
            <div className="text-center py-4">
              <CSpinner color="primary" />
            </div>
          ) : engagement && engagement.error ? (
            <CAlert color="danger" className="mb-0">
              {engagement.error}
            </CAlert>
          ) : engagement && engagement.meta ? (
            <>
              <CRow className="g-3 mb-3">
                <CCol sm={4}>
                  <div className="small text-medium-emphasis">Audience</div>
                  <div className="fs-4 fw-semibold">{engagement.meta.audience}</div>
                </CCol>
                <CCol sm={4}>
                  <div className="small text-medium-emphasis">Opened</div>
                  <div className="fs-4 fw-semibold">{engagement.meta.seen}</div>
                </CCol>
                <CCol sm={4}>
                  <div className="small text-medium-emphasis">Confirmed read</div>
                  <div className="fs-4 fw-semibold">{engagement.meta.acknowledged}</div>
                </CCol>
              </CRow>

              {engagement.meta.ack_rate !== null ? (
                <div className="mb-4">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Confirmed</span>
                    <span className="fw-semibold">{engagement.meta.ack_rate}%</span>
                  </div>
                  <CProgress height={8}>
                    <CProgressBar value={engagement.meta.ack_rate} color="success" />
                  </CProgress>
                </div>
              ) : null}

              {engagement.data.length === 0 ? (
                <CAlert color="info" className="mb-0">
                  Nobody has opened this yet.
                </CAlert>
              ) : (
                <div className="table-responsive">
                  <CTable small align="middle" className="mb-0">
                    <CTableHead>
                      <CTableRow>
                        <CTableHeaderCell>Employee</CTableHeaderCell>
                        <CTableHeaderCell>Opened</CTableHeaderCell>
                        <CTableHeaderCell className="text-center">Times</CTableHeaderCell>
                        <CTableHeaderCell>Confirmed</CTableHeaderCell>
                      </CTableRow>
                    </CTableHead>
                    <CTableBody>
                      {engagement.data.map((r) => (
                        <CTableRow key={r._id}>
                          <CTableDataCell>
                            <div>{r.employee_name || r.domain_user}</div>
                            <div className="small text-medium-emphasis">{r.domain_user}</div>
                          </CTableDataCell>
                          <CTableDataCell className="small">
                            {fmtDateTime(r.seen_at)}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">{r.open_count}</CTableDataCell>
                          <CTableDataCell className="small">
                            {r.acknowledged ? (
                              <span className="text-success">
                                ✓ {fmtDateTime(r.acknowledged_at)}
                              </span>
                            ) : (
                              <span className="text-medium-emphasis">Not yet</span>
                            )}
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                    </CTableBody>
                  </CTable>
                </div>
              )}
            </>
          ) : null}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setEngagement(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AnnouncementList
