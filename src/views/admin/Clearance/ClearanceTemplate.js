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
  CFormSelect,
  CFormInput,
  CFormLabel,
  CFormCheck,
  CRow,
  CCol,
  CCollapse,
} from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { api, fmtDateTime } from './clearanceApi'
import { SIGNER_MODES, SIGNATURE_MODES, TERMINATION_TYPES } from './clearanceContent'
import UserPicker from './UserPicker'

// The form's shape, editable by HR: rows, sub-items, who signs, how they
// sign, when a row applies, and which rows must wait for others.
//
// Saving publishes a new version. Clearances already open keep the version
// they started with, so editing here never changes a form somebody is in the
// middle of signing.
const slug = (s) =>
  String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40)

const newRow = (order) => ({
  code: '',
  label: '',
  order,
  items: [],
  signer: { mode: 'unit_head', unit_id: '', users: [] },
  signature_mode: 'electronic',
  applies_to: { unit_kinds: [], termination_types: [], unit_ids: [] },
  depends_on: [],
  is_final: false,
  _open: true,
})

const ClearanceTemplate = () => {
  const token = useSelector((s) => s.user?.accessToken)
  const [meta, setMeta] = useState(null) // { template, units, termination_types }
  const [versions, setVersions] = useState([])
  const [name, setName] = useState('')
  const [rows, setRows] = useState([])
  const [busy, setBusy] = useState(false)
  const [dirty, setDirty] = useState(false)

  const load = useCallback(async () => {
    try {
      const [a, v] = await Promise.all([api(token, '/templates/active'), api(token, '/templates')])
      setMeta(a)
      setVersions(v.data || [])
      setName(a.template.name || 'Exit Clearance')
      setRows(
        (a.template.rows || []).map((r) => ({
          ...r,
          signer: {
            mode: r.signer.mode,
            unit_id: r.signer.unit_id || '',
            users: r.signer.users || [],
          },
          applies_to: {
            unit_kinds: (r.applies_to && r.applies_to.unit_kinds) || [],
            termination_types: (r.applies_to && r.applies_to.termination_types) || [],
            unit_ids: ((r.applies_to && r.applies_to.unit_ids) || []).map(String),
          },
          depends_on: r.depends_on || [],
          _open: false,
        })),
      )
      setDirty(false)
    } catch (e) {
      toast.error(e.message)
    }
  }, [token])

  useEffect(() => {
    if (token) load()
  }, [token, load])

  const update = (i, patch) => {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)))
    setDirty(true)
  }
  const move = (i, d) => {
    setRows((rs) => {
      const j = i + d
      if (j < 0 || j >= rs.length) return rs
      const copy = [...rs]
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
      return copy.map((r, k) => ({ ...r, order: k + 1 }))
    })
    setDirty(true)
  }
  const remove = (i) => {
    setRows((rs) => rs.filter((_, j) => j !== i).map((r, k) => ({ ...r, order: k + 1 })))
    setDirty(true)
  }
  const toggleIn = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  const save = async () => {
    setBusy(true)
    try {
      const body = {
        name,
        rows: rows.map((r, i) => ({
          code: r.code || slug(r.label),
          label: r.label,
          order: i + 1,
          items: r.items.map((it) => ({ code: it.code || slug(it.label), label: it.label })),
          signer: {
            mode: r.signer.mode,
            unit_id: r.signer.mode === 'unit_head' ? r.signer.unit_id || undefined : undefined,
            users: r.signer.mode === 'users' ? r.signer.users : [],
          },
          signature_mode: r.signature_mode,
          applies_to: r.applies_to,
          depends_on: r.depends_on,
          is_final: !!r.is_final,
        })),
      }
      const r = await api(token, '/templates', { method: 'POST', body })
      toast.success(`Published as version ${r.template.version}.`)
      await load()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  if (!meta) {
    return (
      <>
        <ToastContainer position="top-right" />
        <CSpinner />
      </>
    )
  }

  const units = meta.units || []
  const codes = rows.map((r) => r.code || slug(r.label)).filter(Boolean)

  return (
    <>
      <ToastContainer position="top-right" />
      <CCard className="mb-3">
        <CCardHeader>
          <div
            className="d-flex justify-content-between align-items-center flex-wrap"
            style={{ gap: 8 }}
          >
            <div>
              <h4 className="mb-0">Clearance Form Template</h4>
              <small className="text-medium-emphasis">
                Active: <strong>v{meta.template.version}</strong> · {meta.template.name} · published{' '}
                {fmtDateTime(meta.template.createdAt)}
              </small>
            </div>
            <div className="d-flex" style={{ gap: 8 }}>
              <CButton color="secondary" variant="outline" disabled={busy || !dirty} onClick={load}>
                Discard changes
              </CButton>
              <CButton color="primary" disabled={busy || !dirty} onClick={save}>
                {busy ? <CSpinner size="sm" /> : 'Publish new version'}
              </CButton>
            </div>
          </div>
        </CCardHeader>
        <CCardBody>
          <CRow className="g-3 mb-3">
            <CCol md={6}>
              <CFormLabel>Template name</CFormLabel>
              <CFormInput
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setDirty(true)
                }}
              />
            </CCol>
            <CCol md={6} className="d-flex align-items-end">
              <CButton
                color="primary"
                variant="outline"
                onClick={() => {
                  setRows((rs) => [...rs, newRow(rs.length + 1)])
                  setDirty(true)
                }}
              >
                Add row
              </CButton>
            </CCol>
          </CRow>

          {rows.map((r, i) => {
            const code = r.code || slug(r.label)
            return (
              <CCard
                key={i}
                className="mb-2"
                style={r.is_final ? { borderColor: '#333' } : undefined}
              >
                <CCardHeader
                  className="d-flex align-items-center flex-wrap"
                  style={{ gap: 8, cursor: 'pointer' }}
                  onClick={() => update(i, { _open: !r._open })}
                >
                  <CBadge color="secondary">{i + 1}</CBadge>
                  <strong>{r.label || <em>untitled row</em>}</strong>
                  <small className="text-medium-emphasis">{code}</small>
                  {r.is_final && <CBadge color="dark">final approval</CBadge>}
                  {r.signature_mode === 'manual' && (
                    <CBadge color="dark" title="hand-signed">
                      hand-signed
                    </CBadge>
                  )}
                  {r.items.length > 0 && (
                    <CBadge color="light" style={{ color: '#444' }}>
                      {r.items.length} items
                    </CBadge>
                  )}
                  {r.depends_on.length > 0 && (
                    <CBadge color="info">after {r.depends_on.join(', ')}</CBadge>
                  )}
                  {r.signer.mode === 'unit_head' && !r.signer.unit_id && (
                    <CBadge color="danger">no unit</CBadge>
                  )}
                  <span
                    className="ms-auto d-flex"
                    style={{ gap: 4 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <CButton size="sm" color="light" onClick={() => move(i, -1)} disabled={i === 0}>
                      ↑
                    </CButton>
                    <CButton
                      size="sm"
                      color="light"
                      onClick={() => move(i, 1)}
                      disabled={i === rows.length - 1}
                    >
                      ↓
                    </CButton>
                    <CButton size="sm" color="danger" variant="ghost" onClick={() => remove(i)}>
                      remove
                    </CButton>
                  </span>
                </CCardHeader>
                <CCollapse visible={!!r._open}>
                  <CCardBody>
                    <CRow className="g-3">
                      <CCol md={5}>
                        <CFormLabel>Label (as printed)</CFormLabel>
                        <CFormInput
                          value={r.label}
                          onChange={(e) =>
                            update(i, {
                              label: e.target.value,
                              code: r.code || slug(e.target.value),
                            })
                          }
                        />
                      </CCol>
                      <CCol md={3}>
                        <CFormLabel>Code</CFormLabel>
                        <CFormInput
                          value={r.code}
                          placeholder={slug(r.label)}
                          onChange={(e) => update(i, { code: slug(e.target.value) })}
                        />
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Signature</CFormLabel>
                        <CFormSelect
                          value={r.signature_mode}
                          onChange={(e) => update(i, { signature_mode: e.target.value })}
                        >
                          {SIGNATURE_MODES.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>

                      <CCol md={4}>
                        <CFormLabel>Who signs</CFormLabel>
                        <CFormSelect
                          value={r.signer.mode}
                          onChange={(e) =>
                            update(i, { signer: { ...r.signer, mode: e.target.value } })
                          }
                        >
                          {SIGNER_MODES.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </CFormSelect>
                      </CCol>
                      {r.signer.mode === 'unit_head' && (
                        <CCol md={8}>
                          <CFormLabel>Unit</CFormLabel>
                          <CFormSelect
                            value={r.signer.unit_id}
                            onChange={(e) =>
                              update(i, { signer: { ...r.signer, unit_id: e.target.value } })
                            }
                          >
                            <option value="">— pick a unit —</option>
                            {units.map((u) => (
                              <option key={u._id} value={u._id}>
                                {u.name} ({u.code}, {u.kind}){u.active ? '' : ' — inactive'}
                              </option>
                            ))}
                          </CFormSelect>
                        </CCol>
                      )}
                      {r.signer.mode === 'users' && (
                        <CCol md={8}>
                          <CFormLabel>People</CFormLabel>
                          <UserPicker
                            token={token}
                            value=""
                            onChange={({ user }) =>
                              user &&
                              update(i, {
                                signer: {
                                  ...r.signer,
                                  users: r.signer.users.includes(user)
                                    ? r.signer.users
                                    : [...r.signer.users, user],
                                },
                              })
                            }
                            placeholder="Add a person…"
                          />
                          <div className="mt-1 d-flex flex-wrap" style={{ gap: 4 }}>
                            {r.signer.users.map((u) => (
                              <CBadge
                                key={u}
                                color="info"
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  update(i, {
                                    signer: {
                                      ...r.signer,
                                      users: r.signer.users.filter((x) => x !== u),
                                    },
                                  })
                                }
                              >
                                {u} ×
                              </CBadge>
                            ))}
                          </div>
                        </CCol>
                      )}

                      <CCol md={12}>
                        <CFormLabel>
                          Sub-items (each answered Fulfilled / N/A / Outstanding)
                        </CFormLabel>
                        {r.items.map((it, k) => (
                          <div key={k} className="d-flex mb-1" style={{ gap: 6 }}>
                            <CFormInput
                              size="sm"
                              value={it.label}
                              placeholder="e.g. Housing Loan"
                              onChange={(e) =>
                                update(i, {
                                  items: r.items.map((x, m) =>
                                    m === k
                                      ? {
                                          ...x,
                                          label: e.target.value,
                                          code: x.code || slug(e.target.value),
                                        }
                                      : x,
                                  ),
                                })
                              }
                            />
                            <CButton
                              size="sm"
                              color="danger"
                              variant="ghost"
                              onClick={() =>
                                update(i, { items: r.items.filter((_, m) => m !== k) })
                              }
                            >
                              ×
                            </CButton>
                          </div>
                        ))}
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          onClick={() =>
                            update(i, { items: [...r.items, { code: '', label: '' }] })
                          }
                        >
                          Add item
                        </CButton>
                      </CCol>

                      <CCol md={4}>
                        <CFormLabel>Applies to unit kind</CFormLabel>
                        {['branch', 'department'].map((k) => (
                          <CFormCheck
                            key={k}
                            id={`ak-${i}-${k}`}
                            label={k}
                            checked={r.applies_to.unit_kinds.includes(k)}
                            onChange={() =>
                              update(i, {
                                applies_to: {
                                  ...r.applies_to,
                                  unit_kinds: toggleIn(r.applies_to.unit_kinds, k),
                                },
                              })
                            }
                          />
                        ))}
                        <small className="text-medium-emphasis">none ticked = everyone</small>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Applies to departure type</CFormLabel>
                        {(meta.termination_types || TERMINATION_TYPES).map((t) => (
                          <CFormCheck
                            key={t}
                            id={`at-${i}-${t}`}
                            label={t}
                            checked={r.applies_to.termination_types.includes(t)}
                            onChange={() =>
                              update(i, {
                                applies_to: {
                                  ...r.applies_to,
                                  termination_types: toggleIn(r.applies_to.termination_types, t),
                                },
                              })
                            }
                          />
                        ))}
                        <small className="text-medium-emphasis">none ticked = all types</small>
                      </CCol>
                      <CCol md={4}>
                        <CFormLabel>Opens only after</CFormLabel>
                        {codes
                          .filter((c) => c && c !== code)
                          .map((c) => (
                            <CFormCheck
                              key={c}
                              id={`dep-${i}-${c}`}
                              label={c}
                              checked={r.depends_on.includes(c)}
                              disabled={r.is_final}
                              onChange={() => update(i, { depends_on: toggleIn(r.depends_on, c) })}
                            />
                          ))}
                        <small className="text-medium-emphasis">
                          none ticked = opens with the form (parallel)
                        </small>
                        <CFormCheck
                          className="mt-2"
                          id={`final-${i}`}
                          label="This is the final approval row (waits for every other row)"
                          checked={!!r.is_final}
                          onChange={(e) =>
                            update(i, { is_final: e.target.checked, depends_on: [] })
                          }
                        />
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCollapse>
              </CCard>
            )
          })}

          {rows.filter((r) => r.is_final).length > 1 && (
            <CAlert color="danger">Only one row can be the final approval.</CAlert>
          )}
        </CCardBody>
      </CCard>

      <CCard>
        <CCardHeader>
          <strong>Versions</strong>
        </CCardHeader>
        <CCardBody>
          {versions.map((v) => (
            <div key={v._id}>
              <CBadge color={v.active ? 'success' : 'secondary'} className="me-2">
                v{v.version}
              </CBadge>
              {v.name} — {fmtDateTime(v.createdAt)} by {v.created_by}
            </div>
          ))}
        </CCardBody>
      </CCard>
    </>
  )
}

export default ClearanceTemplate
