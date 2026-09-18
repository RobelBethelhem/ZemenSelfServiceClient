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
  CNav,
  CNavItem,
  CNavLink,
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
  CFormSelect,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CRow,
  CCol,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, fmtDate, toInputDate } from './clearanceApi'
import UserPicker from './UserPicker'
import OrgTreePanel from './OrgTreePanel'

// HR's org map for clearance, in two registers:
//   Departments — head-office units, each headed by a Director who signs the
//                 department's row on the form and builds the tree beneath.
//   Branches    — the branch registry (code + name). A Branch Manager is
//                 attached to a branch from this list when registered.
//
// HR only appoints heads. Each head then registers the level beneath them
// from My Team — the delegation that keeps 2,500 employees mappable.
const emptyUnit = (kind) => ({
  name: '',
  code: '',
  kind,
  head_user: '',
  head_name: '',
  head_valid_from: toInputDate(new Date()),
  head_valid_to: '',
  head_reports_to: '',
  active: true,
})

const ClearanceUnits = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [units, setUnits] = useState(null)
  const [tab, setTab] = useState('department')
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [peopleOf, setPeopleOf] = useState(null)
  const [people, setPeople] = useState(null) // { tree, chain, roles, units } or { flat }

  const load = useCallback(async () => {
    try {
      const r = await api(token, '/units')
      setUnits(r.data || [])
    } catch (e) {
      toast.error(e.message)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const set = (k, v) => setEditing((u) => ({ ...u, [k]: v }))

  const save = async () => {
    if (!editing.name.trim() || !editing.code.trim())
      return toast.warn('Name and code are required.')
    setBusy(true)
    try {
      const body = {
        name: editing.name,
        code: editing.code,
        kind: editing.kind,
        head_user: editing.head_user,
        head_valid_from: editing.head_valid_from || null,
        head_valid_to: editing.head_valid_to || null,
        head_reports_to: editing.head_reports_to,
        active: editing.active,
      }
      if (editing._id) await api(token, `/units/${editing._id}`, { method: 'PATCH', body })
      else await api(token, '/units', { method: 'POST', body })
      toast.success('Saved.')
      setEditing(null)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
    return null
  }

  const openPeople = async (u) => {
    setPeopleOf(u)
    setPeople(null)
    try {
      if (u.head_user) {
        setPeople(await api(token, `/org/tree/${encodeURIComponent(u.head_user)}`))
      } else {
        const r = await api(token, `/units/${u._id}/members`)
        setPeople({ flat: r.data || [] })
      }
    } catch (e) {
      toast.error(e.message)
    }
  }

  const shown = (units || []).filter((u) => u.kind === tab)
  const isBranch = tab === 'branch'

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-4">
        <CCardHeader>
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: 8 }}
          >
            <div>
              <h4 className="mb-0">Units &amp; Heads</h4>
              <small className="text-medium-emphasis">
                Departments and their Directors; the branch registry and Branch Managers. Heads
                build the tree beneath them from <em>My Team</em>.
              </small>
            </div>
            <CButton color="primary" onClick={() => setEditing(emptyUnit(tab))}>
              {isBranch ? 'Register a branch' : 'New department'}
            </CButton>
          </div>
          <CNav variant="tabs" className="mt-3">
            <CNavItem>
              <CNavLink
                active={tab === 'department'}
                onClick={() => setTab('department')}
                style={{ cursor: 'pointer' }}
              >
                Departments{' '}
                <CBadge color="secondary">
                  {(units || []).filter((u) => u.kind === 'department').length}
                </CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={isBranch}
                onClick={() => setTab('branch')}
                style={{ cursor: 'pointer' }}
              >
                Branches{' '}
                <CBadge color="secondary">
                  {(units || []).filter((u) => u.kind === 'branch').length}
                </CBadge>
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        <CCardBody className="p-0">
          {!units ? (
            <div className="p-3">
              <CSpinner size="sm" /> Loading…
            </div>
          ) : shown.length === 0 ? (
            <CAlert color="light" className="m-3">
              {isBranch
                ? 'No branches registered yet. Register each branch by its code and name; then a District Manager (or HR) can register its Branch Manager.'
                : 'No departments.'}
            </CAlert>
          ) : (
            <CTable hover responsive className="mb-0">
              <CTableHead>
                <CTableRow>
                  {isBranch && <CTableHeaderCell style={{ width: 120 }}>Code</CTableHeaderCell>}
                  <CTableHeaderCell>{isBranch ? 'Branch' : 'Department'}</CTableHeaderCell>
                  <CTableHeaderCell>{isBranch ? 'Branch Manager' : 'Director'}</CTableHeaderCell>
                  <CTableHeaderCell>Appointment</CTableHeaderCell>
                  <CTableHeaderCell>People</CTableHeaderCell>
                  <CTableHeaderCell />
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {shown.map((u) => (
                  <CTableRow key={u._id} style={!u.active ? { opacity: 0.55 } : undefined}>
                    {isBranch && (
                      <CTableDataCell>
                        <code>{u.code}</code>
                      </CTableDataCell>
                    )}
                    <CTableDataCell>
                      <strong>{u.name}</strong>
                      {!isBranch && (
                        <CBadge color="secondary" className="ms-1">
                          {u.code}
                        </CBadge>
                      )}
                      {!u.active && (
                        <CBadge color="dark" className="ms-1">
                          inactive
                        </CBadge>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {u.head_user ? (
                        <>
                          {u.head_name || u.head_user}
                          <br />
                          <small className="text-medium-emphasis">{u.head_user}</small>
                        </>
                      ) : (
                        <span className="text-danger">not appointed</span>
                      )}
                    </CTableDataCell>
                    <CTableDataCell>
                      {u.head_user ? (
                        <>
                          {fmtDate(u.head_valid_from)} →{' '}
                          {u.head_valid_to ? fmtDate(u.head_valid_to) : 'open'}
                          {!u.head_active && (
                            <>
                              <br />
                              <small className="text-danger">not in force</small>
                            </>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </CTableDataCell>
                    <CTableDataCell>{u.member_count}</CTableDataCell>
                    <CTableDataCell className="text-end">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="outline"
                        className="me-1"
                        onClick={() => openPeople(u)}
                      >
                        People
                      </CButton>
                      <CButton
                        size="sm"
                        color="primary"
                        variant="outline"
                        onClick={() =>
                          setEditing({
                            ...u,
                            head_valid_from: toInputDate(u.head_valid_from),
                            head_valid_to: toInputDate(u.head_valid_to),
                          })
                        }
                      >
                        Edit
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {units &&
        !isBranch &&
        units.some((u) => u.kind === 'department' && u.active && !u.head_user) && (
          <CAlert color="warning">
            Some departments have no Director appointed. Their rows on a clearance form will have no
            signatory until one is appointed (or HR reassigns the row).
          </CAlert>
        )}

      <CModal
        visible={!!editing}
        onClose={() => !busy && setEditing(null)}
        backdrop="static"
        alignment="center"
        size="lg"
      >
        <CModalHeader closeButton={!busy}>
          <CModalTitle>
            {editing && editing._id
              ? 'Edit'
              : editing && editing.kind === 'branch'
                ? 'Register a branch'
                : 'New department'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {editing && (
            <CRow className="g-3">
              <CCol md={3}>
                <CFormLabel>{editing.kind === 'branch' ? 'Branch code' : 'Code'}</CFormLabel>
                <CFormInput
                  value={editing.code}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder={editing.kind === 'branch' ? 'e.g. 042' : 'e.g. CPM'}
                />
              </CCol>
              <CCol md={7}>
                <CFormLabel>
                  {editing.kind === 'branch' ? 'Branch name' : 'Department name'}
                </CFormLabel>
                <CFormInput
                  value={editing.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder={
                    editing.kind === 'branch'
                      ? 'e.g. Bole Branch'
                      : "e.g. Credit Portfolio Mgt. Dep't"
                  }
                />
              </CCol>
              <CCol md={2}>
                <CFormLabel>Kind</CFormLabel>
                <CFormSelect value={editing.kind} onChange={(e) => set('kind', e.target.value)}>
                  <option value="department">Department</option>
                  <option value="branch">Branch</option>
                </CFormSelect>
              </CCol>
              <CCol md={12}>
                <CFormLabel>
                  {editing.kind === 'branch' ? 'Branch Manager' : 'Director'}{' '}
                  <small className="text-medium-emphasis">
                    (optional here — a District Manager can also register the Branch Manager from My
                    Team)
                  </small>
                </CFormLabel>
                <UserPicker
                  token={token}
                  value={editing.head_user}
                  displayName={
                    editing.head_name ? `${editing.head_name} (${editing.head_user})` : ''
                  }
                  onChange={({ user, name }) =>
                    setEditing((u) => ({ ...u, head_user: user, head_name: name }))
                  }
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Appointed from</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.head_valid_from}
                  onChange={(e) => set('head_valid_from', e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Appointed to (blank = open-ended)</CFormLabel>
                <CFormInput
                  type="date"
                  value={editing.head_valid_to}
                  onChange={(e) => set('head_valid_to', e.target.value)}
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel>Head reports to (username)</CFormLabel>
                <CFormInput
                  value={editing.head_reports_to}
                  onChange={(e) => set('head_reports_to', e.target.value)}
                  placeholder={
                    editing.kind === 'branch' ? 'e.g. the district manager' : 'e.g. vp.operations'
                  }
                />
                <small className="text-medium-emphasis">
                  The head&apos;s own immediate supervisor.
                </small>
              </CCol>
              {editing._id && (
                <CCol md={12}>
                  <CFormCheck
                    id="unit-active"
                    label="Active"
                    checked={!!editing.active}
                    onChange={(e) => set('active', e.target.checked)}
                  />
                </CCol>
              )}
            </CRow>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            disabled={busy}
            onClick={() => setEditing(null)}
          >
            Cancel
          </CButton>
          <CButton color="primary" disabled={busy} onClick={save}>
            {busy ? <CSpinner size="sm" /> : 'Save'}
          </CButton>
        </CModalFooter>
      </CModal>

      <CModal
        visible={!!peopleOf}
        onClose={() => setPeopleOf(null)}
        size="xl"
        scrollable
        backdrop="static"
        alignment="top"
      >
        <CModalHeader>
          <CModalTitle>People in {peopleOf ? peopleOf.name : ''}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {!people ? (
            <CSpinner size="sm" />
          ) : people.tree ? (
            <OrgTreePanel
              token={token}
              tree={people.tree}
              roles={people.roles}
              units={people.units}
              isAdmin
              onChanged={() => openPeople(peopleOf)}
            />
          ) : (
            <>
              <CAlert color="info" className="py-2">
                This unit has no head appointed, so there is no tree to show. Appoint a head (Edit),
                or register people from <em>My Team</em> with the head as their manager.
              </CAlert>
              {people.flat.length ? (
                <ul className="mb-0">
                  {people.flat.map((m) => (
                    <li key={m._id}>
                      {m.name || m.domain_user} — {m.role}{' '}
                      {m.reports_to ? `(reports to ${m.reports_to_name || m.reports_to})` : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <small className="text-medium-emphasis">
                  Nobody is registered in this unit yet.
                </small>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={() => setPeopleOf(null)}>
            Close
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default ClearanceUnits
