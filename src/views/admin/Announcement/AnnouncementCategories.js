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
  CFormLabel,
  CFormSwitch,
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
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../../api/announcement'

// Categories are data, not a hardcoded list — "Job Post", "Policy Update",
// "Event" and anything else HR needs later, without a code change.

const emptyDraft = () => ({
  id: null,
  name: '',
  color: '#0d6efd',
  description: '',
  order: 0,
  active: true,
})

const AnnouncementCategories = () => {
  const accessToken = useSelector((state) => state.user.accessToken)
  const navigate = useNavigate()

  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await fetchAdminCategories({ accessToken })
      setRows(result.data || [])
    } catch (e) {
      setError(e.message || 'Could not load categories.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    load()
  }, [load])

  const save = async () => {
    if (!editing.name.trim()) {
      setFormError('Please give the category a name.')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      if (editing.id) {
        await updateCategory({ accessToken, category: editing })
        setNotice(`“${editing.name}” updated.`)
      } else {
        await createCategory({ accessToken, category: editing })
        setNotice(`“${editing.name}” created.`)
      }
      setEditing(null)
      await load()
    } catch (e) {
      setFormError(e.message || 'Could not save the category.')
    } finally {
      setSaving(false)
    }
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    setSaving(true)
    try {
      await deleteCategory({ accessToken, id: confirmDelete._id })
      setNotice(`“${confirmDelete.name}” deleted.`)
      setConfirmDelete(null)
      await load()
    } catch (e) {
      // The most common case is "still in use" — surface it on the page rather
      // than inside the modal that is about to close.
      setError(e.message || 'Could not delete the category.')
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
              <strong>Announcement Categories</strong>
              <div className="small text-medium-emphasis">
                Group announcements — job posts, policy updates, events. Each category&apos;s colour
                drives its chip on the card.
              </div>
            </div>
            <div className="d-flex gap-2">
              <CButton
                color="secondary"
                variant="outline"
                onClick={() => navigate('/admin/announcements')}
              >
                ← Announcements
              </CButton>
              <CButton color="primary" onClick={() => setEditing(emptyDraft())}>
                + New category
              </CButton>
            </div>
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

            {loading ? (
              <div className="text-center py-5">
                <CSpinner color="primary" />
              </div>
            ) : rows.length === 0 ? (
              <CAlert color="info" className="mb-0">
                No categories yet. Announcements work without one, but a category makes the deck
                much easier to scan.
              </CAlert>
            ) : (
              <div className="table-responsive">
                <CTable hover align="middle" className="mb-0">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell>Category</CTableHeaderCell>
                      <CTableHeaderCell>Description</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">In use</CTableHeaderCell>
                      <CTableHeaderCell className="text-center">Order</CTableHeaderCell>
                      <CTableHeaderCell>State</CTableHeaderCell>
                      <CTableHeaderCell />
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {rows.map((row) => (
                      <CTableRow key={row._id}>
                        <CTableDataCell>
                          <CBadge style={{ background: row.color || '#0d6efd', color: '#fff' }}>
                            {row.name}
                          </CBadge>
                          <div className="small text-medium-emphasis mt-1">{row.slug}</div>
                        </CTableDataCell>
                        <CTableDataCell className="small">
                          {row.description || <span className="text-medium-emphasis">—</span>}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          {row.announcement_count}
                        </CTableDataCell>
                        <CTableDataCell className="text-center">{row.order}</CTableDataCell>
                        <CTableDataCell>
                          <CBadge color={row.active ? 'success' : 'secondary'}>
                            {row.active ? 'Active' : 'Hidden'}
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
                                name: row.name,
                                color: row.color || '#0d6efd',
                                description: row.description || '',
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
          </CCardBody>
        </CCard>
      </CCol>

      <CModal
        visible={!!editing}
        onClose={() => {
          if (!saving) setEditing(null)
        }}
        alignment="center"
      >
        <CModalHeader closeButton={!saving}>
          <CModalTitle>{editing && editing.id ? 'Edit category' : 'New category'}</CModalTitle>
        </CModalHeader>
        {editing ? (
          <CModalBody>
            <CRow className="g-3">
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Name</CFormLabel>
                <CFormInput
                  value={editing.name}
                  placeholder="e.g. Job Post"
                  onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))}
                />
              </CCol>
              <CCol xs={12}>
                <CFormLabel className="small mb-1">Description</CFormLabel>
                <CFormInput
                  value={editing.description}
                  maxLength={240}
                  onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))}
                />
              </CCol>
              <CCol xs={6}>
                <CFormLabel className="small mb-1">Colour</CFormLabel>
                <CFormInput
                  type="color"
                  value={editing.color}
                  onChange={(e) => setEditing((p) => ({ ...p, color: e.target.value }))}
                />
              </CCol>
              <CCol xs={6}>
                <CFormLabel className="small mb-1">Sort order</CFormLabel>
                <CFormInput
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing((p) => ({ ...p, order: Number(e.target.value) }))}
                />
              </CCol>
              <CCol xs={12}>
                <CFormSwitch
                  label="Available when creating announcements"
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
          <CModalTitle>Delete category</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Delete <strong>{confirmDelete ? confirmDelete.name : ''}</strong>?
          {confirmDelete && confirmDelete.announcement_count > 0 ? (
            <CAlert color="warning" className="mt-3 mb-0 py-2 small">
              {confirmDelete.announcement_count} announcement
              {confirmDelete.announcement_count === 1 ? '' : 's'} still use this category, so the
              deletion will be refused. Set it <strong>Hidden</strong> instead to keep it off new
              posts.
            </CAlert>
          ) : null}
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

export default AnnouncementCategories
