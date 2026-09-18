import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CButton,
  CSpinner,
  CAlert,
  CBadge,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormCheck,
  CRow,
  CCol,
} from '@coreui/react'
import { toast } from 'react-toastify'

import { api, toInputDate } from './clearanceApi'
import { MemoPage } from './MemoDocument'

// HR composes an inter-departmental memo about a departure: picks who it
// goes To and who is CC'd — from the registered work units, or typed — sets
// From, Subject and Date, and sends. The body is generated; the preview on
// the right is the exact page that will print. A distribution list can be
// saved as a preset and reloaded, and every line stays editable regardless.

const AddresseeList = ({ title, items, onChange, unitLabels, hint }) => {
  const [pick, setPick] = useState('')
  const [custom, setCustom] = useState('')
  const all = [...(unitLabels.departments || []), ...(unitLabels.branches || [])]
  const add = (entry) => {
    if (!entry || !entry.label) return
    if (
      items.some(
        (x) =>
          (entry.unit_id && String(x.unit_id) === String(entry.unit_id)) || x.label === entry.label,
      )
    ) {
      toast.info('Already in the list.')
      return
    }
    onChange([...items, entry])
  }
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const copy = [...items]
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
    onChange(copy)
  }
  return (
    <div className="mb-3">
      <CFormLabel className="mb-1">
        <strong>{title}</strong>{' '}
        {hint ? <small className="text-medium-emphasis">— {hint}</small> : null}
      </CFormLabel>
      {items.length === 0 && (
        <div className="text-medium-emphasis mb-1" style={{ fontSize: 12 }}>
          none yet
        </div>
      )}
      {items.map((e, i) => (
        <div key={i} className="d-flex align-items-center mb-1" style={{ gap: 4 }}>
          <CFormInput
            size="sm"
            value={e.label}
            onChange={(ev) =>
              onChange(items.map((x, j) => (j === i ? { ...x, label: ev.target.value } : x)))
            }
          />
          {e.unit_id ? (
            <CBadge
              color="light"
              style={{ color: '#444', whiteSpace: 'nowrap' }}
              title="Linked to a registered unit; its head receives the memo"
            >
              unit
            </CBadge>
          ) : (
            <CBadge
              color="secondary"
              style={{ whiteSpace: 'nowrap' }}
              title="Typed line; nobody is notified for it"
            >
              text
            </CBadge>
          )}
          <CButton size="sm" color="light" onClick={() => move(i, -1)} disabled={i === 0}>
            ↑
          </CButton>
          <CButton
            size="sm"
            color="light"
            onClick={() => move(i, 1)}
            disabled={i === items.length - 1}
          >
            ↓
          </CButton>
          <CButton
            size="sm"
            color="danger"
            variant="ghost"
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            ×
          </CButton>
        </div>
      ))}
      <div className="d-flex align-items-center mt-1" style={{ gap: 4 }}>
        <CFormSelect
          size="sm"
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          style={{ maxWidth: 360 }}
        >
          <option value="">— add a registered unit —</option>
          <optgroup label="Departments">
            {(unitLabels.departments || []).map((u) => (
              <option key={u._id} value={u._id}>
                {u.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Branches">
            {(unitLabels.branches || []).map((u) => (
              <option key={u._id} value={u._id}>
                {u.label}
              </option>
            ))}
          </optgroup>
        </CFormSelect>
        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          disabled={!pick}
          onClick={() => {
            const u = all.find((x) => String(x._id) === pick)
            if (u) add({ unit_id: u._id, label: u.label })
            setPick('')
          }}
        >
          Add
        </CButton>
      </div>
      <div className="d-flex align-items-center mt-1" style={{ gap: 4 }}>
        <CFormInput
          size="sm"
          value={custom}
          placeholder="or type a line, e.g. Manager- Credit Workout Division"
          onChange={(e) => setCustom(e.target.value)}
          style={{ maxWidth: 360 }}
        />
        <CButton
          size="sm"
          color="secondary"
          variant="outline"
          disabled={!custom.trim()}
          onClick={() => {
            add({ label: custom.trim() })
            setCustom('')
          }}
        >
          Add line
        </CButton>
      </div>
    </div>
  )
}
AddresseeList.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  unitLabels: PropTypes.object.isRequired,
  hint: PropTypes.string,
}

const MemoComposer = ({ token, clearanceId, kind, draft, onClose, onDone }) => {
  const [meta, setMeta] = useState(null)
  const [form, setForm] = useState(null)
  const [busy, setBusy] = useState('')
  const [presetName, setPresetName] = useState('')
  const [presetDefault, setPresetDefault] = useState(false)

  const load = useCallback(async () => {
    try {
      const m = await api(token, `/memo/compose/${clearanceId}?kind=${kind}`)
      setMeta(m)
      setForm(
        draft
          ? {
              memo_date: toInputDate(draft.memo_date),
              subject: draft.subject,
              from_line: draft.from_line,
              to: draft.to || [],
              cc: draft.cc || [],
            }
          : {
              memo_date: toInputDate(m.defaults.memo_date),
              subject: m.defaults.subject,
              from_line: m.defaults.from_line,
              to: m.defaults.to || [],
              cc: m.defaults.cc || [],
            },
      )
    } catch (e) {
      toast.error(e.message)
      onClose()
    }
  }, [token, clearanceId, kind, draft, onClose])

  useEffect(() => {
    load()
  }, [load])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const applyPreset = (id) => {
    const p = (meta.presets || []).find((x) => String(x._id) === id)
    if (!p) return
    setForm((f) => ({
      ...f,
      to: p.to || [],
      cc: p.cc || [],
      from_line: p.from_line || f.from_line,
    }))
    toast.info(`Preset “${p.name}” applied — every line is still editable.`)
  }

  const savePreset = async () => {
    if (!presetName.trim()) return toast.warn('Give the preset a name.')
    setBusy('preset')
    try {
      await api(token, '/memo/presets', {
        method: 'POST',
        body: {
          kind,
          name: presetName.trim(),
          to: form.to,
          cc: form.cc,
          from_line: form.from_line,
          is_default: presetDefault,
        },
      })
      toast.success('Preset saved.')
      setPresetName('')
      const m = await api(token, `/memo/compose/${clearanceId}?kind=${kind}`)
      setMeta(m)
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy('')
    }
    return null
  }

  const deletePreset = async (id) => {
    setBusy('preset')
    try {
      await api(token, `/memo/presets/${id}`, { method: 'DELETE' })
      const m = await api(token, `/memo/compose/${clearanceId}?kind=${kind}`)
      setMeta(m)
      toast.success('Preset deleted.')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy('')
    }
  }

  const submit = async (send) => {
    if (!form.to.length) return toast.warn('Add at least one To line.')
    if (!form.subject.trim()) return toast.warn('The memo needs a subject.')
    setBusy(send ? 'send' : 'save')
    try {
      const body = { ...form, subject: form.subject.trim() }
      if (draft && draft._id) {
        await api(token, `/memo/${draft._id}`, { method: 'PATCH', body })
        if (send) await api(token, `/memo/${draft._id}/send`, { method: 'POST' })
      } else {
        await api(token, '/memo', {
          method: 'POST',
          body: { ...body, clearance_id: clearanceId, kind, send },
        })
      }
      toast.success(send ? 'Memo sent.' : 'Draft saved.')
      onDone()
      onClose()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy('')
    }
    return null
  }

  const preview =
    meta && form
      ? {
          kind,
          memo_date: form.memo_date,
          to: form.to,
          from_line: form.from_line,
          subject: form.subject,
          cc: form.cc,
          body_runs: meta.body_runs,
          benefits_rows: meta.benefits_rows,
          employee_name: meta.employee_name,
          status: draft ? draft.status : 'draft',
        }
      : null

  return (
    <CModal
      visible
      onClose={() => !busy && onClose()}
      size="xl"
      scrollable
      backdrop="static"
      alignment="top"
    >
      <CModalHeader closeButton={!busy}>
        <CModalTitle>
          {kind === 'outstanding' ? 'Outstanding Loan commitments memo' : 'Resignation memo'}
          {meta ? <small className="text-medium-emphasis ms-2">{meta.employee_name}</small> : null}
        </CModalTitle>
      </CModalHeader>
      <CModalBody style={{ background: '#f4f5f7' }}>
        {!meta || !form ? (
          <CSpinner />
        ) : (
          <CRow className="g-3">
            <CCol lg={5}>
              {kind === 'outstanding' && !meta.benefits_issued && (
                <CAlert color="warning" className="py-2">
                  The benefits statement has not been issued yet — the table below shows it as it
                  stands now. Issue it first if the branch or HR rows are still empty.
                </CAlert>
              )}

              <div
                className="mb-3 p-2"
                style={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: 4 }}
              >
                <CFormLabel className="mb-1">
                  <strong>Presets</strong>{' '}
                  <small className="text-medium-emphasis">— saved To / From / CC lists</small>
                </CFormLabel>
                <div className="d-flex align-items-center flex-wrap" style={{ gap: 6 }}>
                  <CFormSelect
                    size="sm"
                    onChange={(e) => e.target.value && applyPreset(e.target.value)}
                    defaultValue=""
                    style={{ maxWidth: 260 }}
                  >
                    <option value="">— load a preset —</option>
                    {(meta.presets || []).map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                        {p.is_default ? ' (default)' : ''}
                      </option>
                    ))}
                  </CFormSelect>
                  {(meta.presets || []).map((p) => (
                    <CBadge
                      key={p._id}
                      color="light"
                      style={{ color: '#444', cursor: 'pointer' }}
                      title="delete this preset"
                      onClick={() => deletePreset(p._id)}
                    >
                      {p.name} ×
                    </CBadge>
                  ))}
                </div>
                <div className="d-flex align-items-center flex-wrap mt-2" style={{ gap: 6 }}>
                  <CFormInput
                    size="sm"
                    value={presetName}
                    placeholder="save current lists as…"
                    onChange={(e) => setPresetName(e.target.value)}
                    style={{ maxWidth: 220 }}
                  />
                  <CFormCheck
                    id="preset-default"
                    label="default"
                    checked={presetDefault}
                    onChange={(e) => setPresetDefault(e.target.checked)}
                  />
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    disabled={busy === 'preset' || !presetName.trim()}
                    onClick={savePreset}
                  >
                    Save preset
                  </CButton>
                </div>
              </div>

              <CRow className="g-2 mb-3">
                <CCol md={5}>
                  <CFormLabel>Date</CFormLabel>
                  <CFormInput
                    size="sm"
                    type="date"
                    value={form.memo_date}
                    onChange={(e) => set('memo_date', e.target.value)}
                  />
                </CCol>
                <CCol md={7}>
                  <CFormLabel>Subject</CFormLabel>
                  <CFormInput
                    size="sm"
                    value={form.subject}
                    onChange={(e) => set('subject', e.target.value)}
                  />
                </CCol>
                <CCol md={12}>
                  <CFormLabel>From</CFormLabel>
                  <CFormInput
                    size="sm"
                    value={form.from_line}
                    onChange={(e) => set('from_line', e.target.value)}
                  />
                </CCol>
              </CRow>

              <AddresseeList
                title="To"
                items={form.to}
                onChange={(v) => set('to', v)}
                unitLabels={meta.unit_labels}
                hint="the heads of linked units receive it"
              />
              <AddresseeList
                title="CC"
                items={form.cc}
                onChange={(v) => set('cc', v)}
                unitLabels={meta.unit_labels}
                hint="optional"
              />
            </CCol>
            <CCol lg={7}>
              <div className="mb-1">
                <small className="text-medium-emphasis">
                  Preview — this is the page that prints.
                </small>
              </div>
              <div style={{ background: '#e9ecef', padding: 8, overflow: 'auto' }}>
                {preview && <MemoPage memo={preview} scale={0.72} />}
              </div>
            </CCol>
          </CRow>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" disabled={!!busy} onClick={onClose}>
          Cancel
        </CButton>
        <CButton color="secondary" disabled={!!busy || !form} onClick={() => submit(false)}>
          {busy === 'save' ? <CSpinner size="sm" /> : 'Save draft'}
        </CButton>
        <CButton color="success" disabled={!!busy || !form} onClick={() => submit(true)}>
          {busy === 'send' ? <CSpinner size="sm" /> : 'Send memo'}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

MemoComposer.propTypes = {
  token: PropTypes.string,
  clearanceId: PropTypes.string.isRequired,
  kind: PropTypes.oneOf(['resignation', 'outstanding']).isRequired,
  draft: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
}

export default MemoComposer
