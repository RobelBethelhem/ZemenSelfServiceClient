import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormSwitch,
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
} from '@coreui/react'
import {
  FAQ_TOPICS,
  FAQ_CHANGED_EVENT,
  topicLabel,
  fetchAdminFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
} from '../../../api/faq'
import renderRichText from '../../../components/announcement/richText'

// HR's side of the floating help button: every active question here is shown
// to every signed-in employee. The topic decides which page the button opens
// on that question for.

const emptyDraft = () => ({
  id: null,
  question: '',
  answer: '',
  topic: 'general',
  order: 0,
  active: true,
})

const preview = (text, max = 140) => {
  const s = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
  return s.length > max ? `${s.slice(0, max)}…` : s
}

const FaqManager = () => {
  const accessToken = useSelector((state) => state.user.accessToken)

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [topicFilter, setTopicFilter] = useState('')
  const [search, setSearch] = useState('')

  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchAdminFaqs({ accessToken })
      setRows(result.data || [])
    } catch (e) {
      setError(e.message || 'Could not load the questions.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter(
      (row) =>
        (!topicFilter || row.topic === topicFilter) &&
        (!q ||
          String(row.question).toLowerCase().includes(q) ||
          String(row.answer).toLowerCase().includes(q)),
    )
  }, [rows, topicFilter, search])

  const activeCount = rows.filter((r) => r.active).length

  // Lets the help button in this same tab refresh without a reload.
  const announceChange = () => window.dispatchEvent(new Event(FAQ_CHANGED_EVENT))

  const save = async () => {
    if (!editing.question.trim()) {
      setFormError('Please write the question.')
      return
    }
    if (!editing.answer.trim()) {
      setFormError('Please write the answer.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editing.id) {
        await updateFaq({ accessToken, faq: editing })
        setNotice('Question updated.')
      } else {
        await createFaq({ accessToken, faq: editing })
        setNotice('Question added.')
      }
      setEditing(null)
      announceChange()
      await load()
    } catch (e) {
      setFormError(e.message || 'Could not save the question.')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    setSaving(true)
    try {
      await deleteFaq({ accessToken, id: confirmDelete._id })
      setNotice('Question deleted.')
      setConfirmDelete(null)
      announceChange()
      await load()
    } catch (e) {
      setError(e.message || 'Could not delete the question.')
      setConfirmDelete(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <strong>Frequently Asked Questions</strong>
              <div className="small text-medium-emphasis">
                Shown to every employee from the round <strong>?</strong> button (bottom-right,
                movable). A question with a letter topic opens first on that letter&apos;s page.
              </div>
            </div>
            <CButton color="primary" onClick={() => setEditing(emptyDraft())}>
              + New question
            </CButton>
          </CCardHeader>

          <CCardBody>
            {error ? (
              <CAlert color="danger" dismissible onClose={() => setError('')}>
                {error}
              </CAlert>
            ) : null}
            {notice ? (
              <CAlert color="success" dismissible onClose={() => setNotice('')}>
                {notice}
              </CAlert>
            ) : null}

            <CRow className="g-2 mb-3">
              <CCol md={4}>
                <CFormSelect
                  value={topicFilter}
                  aria-label="Filter by topic"
                  onChange={(e) => setTopicFilter(e.target.value)}
                >
                  <option value="">All topics</option>
                  {FAQ_TOPICS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={8}>
                <CFormInput
                  type="search"
                  placeholder="Search questions and answers"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </CCol>
            </CRow>

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
              </div>
            ) : rows.length === 0 ? (
              <CAlert color="info" className="mb-0">
                No questions yet. The help button stays hidden from employees until at least one
                question is shown.
              </CAlert>
            ) : (
              <>
                <div className="small text-medium-emphasis mb-2">
                  {activeCount} of {rows.length} question{rows.length === 1 ? '' : 's'} shown to
                  employees.
                </div>
                {filtered.length === 0 ? (
                  <CAlert color="secondary" className="mb-0">
                    No question matches this filter.
                  </CAlert>
                ) : (
                  <div className="table-responsive">
                    <CTable hover align="middle" className="mb-0">
                      <CTableHead>
                        <CTableRow>
                          <CTableHeaderCell className="text-center">Order</CTableHeaderCell>
                          <CTableHeaderCell>Question</CTableHeaderCell>
                          <CTableHeaderCell>Topic</CTableHeaderCell>
                          <CTableHeaderCell>State</CTableHeaderCell>
                          <CTableHeaderCell />
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {filtered.map((row) => (
                          <CTableRow key={row._id}>
                            <CTableDataCell className="text-center">{row.order}</CTableDataCell>
                            <CTableDataCell style={{ minWidth: 260 }}>
                              <div className="fw-semibold">{row.question}</div>
                              <div className="small text-medium-emphasis">
                                {preview(row.answer)}
                              </div>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color="info" className="text-wrap">
                                {topicLabel(row.topic)}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell>
                              <CBadge color={row.active ? 'success' : 'secondary'}>
                                {row.active ? 'Shown' : 'Hidden'}
                              </CBadge>
                            </CTableDataCell>
                            <CTableDataCell className="text-end text-nowrap">
                              <CButton
                                size="sm"
                                color="primary"
                                variant="outline"
                                onClick={() =>
                                  setEditing({
                                    id: row._id,
                                    question: row.question,
                                    answer: row.answer,
                                    topic: row.topic || 'general',
                                    order: row.order || 0,
                                    active: !!row.active,
                                  })
                                }
                              >
                                Edit
                              </CButton>
                              <CButton
                                size="sm"
                                color="danger"
                                variant="ghost"
                                className="ms-1"
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
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>

      <CModal
        visible={!!editing}
        onClose={() => {
          if (!saving) setEditing(null)
        }}
        alignment="center"
        size="lg"
        backdrop="static"
      >
        <CModalHeader closeButton={!saving}>
          <CModalTitle>{editing && editing.id ? 'Edit question' : 'New question'}</CModalTitle>
        </CModalHeader>
        {editing ? (
          <CModalBody>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Question</CFormLabel>
                <CFormInput
                  value={editing.question}
                  maxLength={300}
                  placeholder="e.g. On page 1 of the Guaranty form, whose details do I fill in?"
                  onChange={(e) => setEditing((p) => ({ ...p, question: e.target.value }))}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Answer</CFormLabel>
                <CFormTextarea
                  rows={6}
                  value={editing.answer}
                  maxLength={5000}
                  onChange={(e) => setEditing((p) => ({ ...p, answer: e.target.value }))}
                />
                <div className="small text-medium-emphasis mt-1">
                  Plain text. Optional: **bold**, *italic*, [link text](https://…). A blank line
                  starts a new paragraph.
                </div>
              </CCol>
              {editing.answer.trim() ? (
                <CCol xs={12}>
                  <div className="small text-medium-emphasis mb-1">Preview</div>
                  <div className="border rounded p-2 small" style={{ lineHeight: 1.55 }}>
                    {renderRichText(editing.answer, 'faq-preview')}
                  </div>
                </CCol>
              ) : null}
              <CCol md={6}>
                <CFormLabel className="small mb-1">Topic</CFormLabel>
                <CFormSelect
                  value={editing.topic}
                  onChange={(e) => setEditing((p) => ({ ...p, topic: e.target.value }))}
                >
                  {FAQ_TOPICS.map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol md={6}>
                <CFormLabel className="small mb-1">Sort order (lower shows first)</CFormLabel>
                <CFormInput
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing((p) => ({ ...p, order: Number(e.target.value) }))}
                />
              </CCol>
              <CCol xs={12}>
                <CFormSwitch
                  label="Show to employees"
                  checked={editing.active}
                  onChange={(e) => setEditing((p) => ({ ...p, active: e.target.checked }))}
                />
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
              'Save'
            )}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal visible={!!confirmDelete} onClose={() => setConfirmDelete(null)} alignment="center">
        <CModalHeader>
          <CModalTitle>Delete question</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Delete <strong>{confirmDelete ? confirmDelete.question : ''}</strong>?
          <div className="small text-medium-emphasis mt-2">
            To take it off the help button but keep it for later, edit it and switch off{' '}
            <strong>Show to employees</strong> instead.
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setConfirmDelete(null)}>
            Cancel
          </CButton>
          <CButton color="danger" disabled={saving} onClick={doDelete}>
            Delete
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default FaqManager
