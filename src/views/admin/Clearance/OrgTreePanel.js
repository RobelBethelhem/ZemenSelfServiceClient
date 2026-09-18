import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CBadge,
  CSpinner,
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
  CAlert,
} from '@coreui/react'
import { toast } from 'react-toastify'

import { api, fmtDate, toInputDate } from './clearanceApi'
import UserPicker from './UserPicker'

// The reporting tree beneath one person, as the server built it: every node
// says who reports to it and whether the viewer may edit it or add beneath
// it. Directors see their whole department; a district manager sees their
// branches; a branch manager sees their branch. HR sees everything.
//
// A person is registered with a role (from Settings), a unit — a department,
// or a branch picked from the registry — and a validity window. Registering a
// Branch Manager for a branch makes them that branch's head automatically.

const emptyPerson = (parent, roles) => ({
  domain_user: '',
  name: '',
  role_in_unit: (roles.find((r) => !r.manages) || roles[0] || {}).label || 'Staff',
  unit_id: (parent && parent.node && parent.node.unit_id) || '',
  reports_to: parent ? parent.user : '',
  reports_to_name: parent ? parent.name : '',
  can_sign_clearance: false,
  valid_from: toInputDate(new Date()),
  valid_to: '',
  active: true,
})

const PersonModal = ({ token, roles, units, editing, isAdmin, onClose, onSaved }) => {
  const [form, setForm] = useState(editing)
  const [busy, setBusy] = useState(false)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isEdit = !!form._id
  const roleInfo = roles.find((r) => r.label === form.role_in_unit) || {}
  const unit = [...units.departments, ...units.branches].find(
    (u) => String(u._id) === String(form.unit_id),
  )
  const wantsBranch = roleInfo.unit_head_for === 'branch'

  const save = async () => {
    if (!form.domain_user) return toast.warn('Pick the person.')
    if (!form.role_in_unit) return toast.warn('Pick a role.')
    if (!form.unit_id)
      return toast.warn(wantsBranch ? 'Pick the branch from the registry.' : 'Pick the unit.')
    if (wantsBranch && unit && unit.kind !== 'branch')
      return toast.warn('A Branch Manager must be attached to a branch.')
    setBusy(true)
    try {
      const body = {
        role_in_unit: form.role_in_unit,
        unit_id: form.unit_id,
        reports_to: form.reports_to,
        can_sign_clearance: !!form.can_sign_clearance,
        valid_from: form.valid_from || null,
        valid_to: form.valid_to || null,
        active: form.active !== false,
      }
      if (isEdit) await api(token, `/org/node/${form._id}`, { method: 'PATCH', body })
      else
        await api(token, '/org/node', {
          method: 'POST',
          body: { ...body, domain_user: form.domain_user },
        })
      toast.success('Saved.')
      onSaved()
      onClose()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
    return null
  }

  return (
    <CModal
      visible
      onClose={() => !busy && onClose()}
      backdrop="static"
      alignment="center"
      size="lg"
    >
      <CModalHeader closeButton={!busy}>
        <CModalTitle>{isEdit ? 'Edit registration' : 'Register a person'}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CRow className="g-3">
          <CCol md={12}>
            <CFormLabel>Person</CFormLabel>
            {isEdit ? (
              <div>
                <strong>{form.name || form.domain_user}</strong> <code>{form.domain_user}</code>
              </div>
            ) : (
              <UserPicker
                token={token}
                value={form.domain_user}
                onChange={({ user, name }) => setForm((f) => ({ ...f, domain_user: user, name }))}
              />
            )}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Role</CFormLabel>
            <CFormSelect
              value={form.role_in_unit}
              onChange={(e) => set('role_in_unit', e.target.value)}
            >
              {roles.map((r) => (
                <option key={r.label} value={r.label}>
                  {r.label}
                  {r.manages ? ' — may register people beneath' : ''}
                </option>
              ))}
            </CFormSelect>
            {roleInfo.unit_head_for ? (
              <small className="text-medium-emphasis">
                Heads a {roleInfo.unit_head_for}: registering them makes them that{' '}
                {roleInfo.unit_head_for}
                &apos;s head.
              </small>
            ) : null}
          </CCol>
          <CCol md={6}>
            <CFormLabel>{wantsBranch ? 'Branch (from the registry)' : 'Unit'}</CFormLabel>
            <CFormSelect value={form.unit_id} onChange={(e) => set('unit_id', e.target.value)}>
              <option value="">— pick —</option>
              {!wantsBranch && (
                <optgroup label="Departments">
                  {units.departments.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.code})
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Branches">
                {units.branches.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.code} — {u.name}
                  </option>
                ))}
              </optgroup>
            </CFormSelect>
            {!units.branches.length && wantsBranch ? (
              <small className="text-danger">
                No branches registered yet — HR adds them under Units &amp; Heads.
              </small>
            ) : null}
          </CCol>
          <CCol md={12}>
            <CFormLabel>Reports to (immediate supervisor)</CFormLabel>
            {isAdmin ? (
              <UserPicker
                token={token}
                value={form.reports_to}
                displayName={
                  form.reports_to_name
                    ? `${form.reports_to_name} (${form.reports_to})`
                    : form.reports_to
                }
                onChange={({ user, name }) =>
                  setForm((f) => ({ ...f, reports_to: user, reports_to_name: name }))
                }
                placeholder="Leave empty only for a Director who reports outside the tree"
              />
            ) : (
              <div>
                <strong>{form.reports_to_name || form.reports_to}</strong>{' '}
                <code>{form.reports_to}</code>
              </div>
            )}
          </CCol>
          <CCol md={6}>
            <CFormLabel>Valid from</CFormLabel>
            <CFormInput
              type="date"
              value={form.valid_from}
              onChange={(e) => set('valid_from', e.target.value)}
            />
          </CCol>
          <CCol md={6}>
            <CFormLabel>Valid to (blank = open-ended)</CFormLabel>
            <CFormInput
              type="date"
              value={form.valid_to}
              onChange={(e) => set('valid_to', e.target.value)}
            />
          </CCol>
          <CCol md={12}>
            <CFormCheck
              id="node-can-sign"
              label="May sign this unit's row on clearance forms (delegated signing authority)"
              checked={!!form.can_sign_clearance}
              onChange={(e) => set('can_sign_clearance', e.target.checked)}
            />
            {isEdit && (
              <CFormCheck
                id="node-active"
                className="mt-1"
                label="Active (untick when the person leaves this position)"
                checked={form.active !== false}
                onChange={(e) => set('active', e.target.checked)}
              />
            )}
          </CCol>
        </CRow>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" disabled={busy} onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="primary" disabled={busy} onClick={save}>
          {busy ? <CSpinner size="sm" /> : 'Save'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}
PersonModal.propTypes = {
  token: PropTypes.string,
  roles: PropTypes.array.isRequired,
  units: PropTypes.object.isRequired,
  editing: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
}

const NodeRow = ({ node, depth, onAdd, onEdit }) => {
  const n = node.node
  return (
    <>
      <div
        className="d-flex align-items-center flex-wrap py-1"
        style={{
          gap: 8,
          paddingLeft: depth * 22,
          borderBottom: '1px solid rgba(0,0,0,.06)',
          opacity: n && (n.active === false || !n.in_window) ? 0.6 : 1,
        }}
      >
        <span style={{ width: 14, textAlign: 'center', color: '#999' }}>{depth ? '└' : '●'}</span>
        <strong>{node.name}</strong>
        <small className="text-medium-emphasis">{node.user}</small>
        {n ? (
          <>
            <CBadge color={node.manages ? 'primary' : 'secondary'}>{n.role}</CBadge>
            {n.unit_code ? (
              <CBadge
                color={n.unit_kind === 'branch' ? 'info' : 'light'}
                style={n.unit_kind === 'branch' ? undefined : { color: '#444' }}
              >
                {n.unit_kind === 'branch' ? `${n.unit_code} · ${n.unit_name}` : n.unit_name}
              </CBadge>
            ) : null}
            {n.can_sign_clearance ? <CBadge color="success">signs clearance</CBadge> : null}
            {!n.in_window ? <CBadge color="warning">expired</CBadge> : null}
            {n.active === false ? <CBadge color="dark">inactive</CBadge> : null}
            <small className="text-medium-emphasis">
              {fmtDate(n.valid_from)} → {n.valid_to ? fmtDate(n.valid_to) : 'open'}
            </small>
          </>
        ) : (
          <CBadge color="warning" title="Heads a unit but has no registration of their own yet">
            {node.heads_units && node.heads_units.length
              ? `head of ${node.heads_units.map((u) => u.code).join(', ')}`
              : 'not registered'}
          </CBadge>
        )}
        <span className="ms-auto d-flex" style={{ gap: 4 }}>
          {node.can_add_under && (
            <CButton size="sm" color="primary" variant="outline" onClick={() => onAdd(node)}>
              Add under
            </CButton>
          )}
          {node.can_edit && n && (
            <CButton size="sm" color="secondary" variant="outline" onClick={() => onEdit(node)}>
              Edit
            </CButton>
          )}
        </span>
      </div>
      {node.children.map((c) => (
        <NodeRow key={c.user} node={c} depth={depth + 1} onAdd={onAdd} onEdit={onEdit} />
      ))}
    </>
  )
}
NodeRow.propTypes = {
  node: PropTypes.object.isRequired,
  depth: PropTypes.number.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
}

const OrgTreePanel = ({ token, tree, roles, units, isAdmin, onChanged }) => {
  const [modal, setModal] = useState(null)
  if (!tree) return null
  const count = (n) => 1 + n.children.reduce((s, c) => s + count(c), 0)

  return (
    <>
      <div
        className="d-flex justify-content-between align-items-center mb-2 flex-wrap"
        style={{ gap: 8 }}
      >
        <small className="text-medium-emphasis">
          {count(tree) - 1} {count(tree) - 1 === 1 ? 'person' : 'people'} beneath {tree.name}. Every
          arrow is an immediate supervisor.
        </small>
        {!tree.node && !tree.can_add_under && (
          <CAlert color="warning" className="py-1 px-2 mb-0">
            Not registered in the tree and heads no unit — nothing can be added beneath.
          </CAlert>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <NodeRow
          node={tree}
          depth={0}
          onAdd={(parent) => setModal(emptyPerson(parent, roles))}
          onEdit={(n) =>
            setModal({
              ...n.node,
              name: n.name,
              reports_to_name: '',
              valid_from: toInputDate(n.node.valid_from),
              valid_to: toInputDate(n.node.valid_to),
            })
          }
        />
      </div>
      {modal && (
        <PersonModal
          token={token}
          roles={roles}
          units={units}
          editing={modal}
          isAdmin={!!isAdmin}
          onClose={() => setModal(null)}
          onSaved={onChanged}
        />
      )}
    </>
  )
}

OrgTreePanel.propTypes = {
  token: PropTypes.string,
  tree: PropTypes.object,
  roles: PropTypes.array.isRequired,
  units: PropTypes.object.isRequired,
  isAdmin: PropTypes.bool,
  onChanged: PropTypes.func.isRequired,
}

export default OrgTreePanel
