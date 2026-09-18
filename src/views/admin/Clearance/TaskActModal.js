import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CModalTitle,
  CButton,
  CSpinner,
  CFormCheck,
  CFormSelect,
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import { toast } from 'react-toastify'
import { api } from './clearanceApi'

// A signatory records the outcome of their row: Cleared (nothing outstanding),
// Outstanding (with what, and how much), or Not Applicable. Rows with
// sub-items make the signatory answer each one — that is where "list
// commitments fulfilled or unfulfilled" on the paper form is enforced.
const TaskActModal = ({ visible, onClose, token, clearanceId, task, employeeName, onDone }) => {
  const [outcome, setOutcome] = useState('Cleared')
  const [items, setItems] = useState([])
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!visible || !task) return
    setOutcome(task.status === 'Outstanding' ? 'Outstanding' : 'Cleared')
    setItems(
      (task.items || []).map((it) => ({
        code: it.code,
        label: it.label,
        outcome: it.outcome === 'Pending' ? 'Fulfilled' : it.outcome,
        note: it.note || '',
        amount: it.amount !== undefined && it.amount !== null ? String(it.amount) : '',
      })),
    )
    setNote(task.note || '')
  }, [visible, task])

  if (!task) return null

  const anyOutstanding = items.some((it) => it.outcome === 'Outstanding')
  const setItem = (code, patch) =>
    setItems((prev) => prev.map((it) => (it.code === code ? { ...it, ...patch } : it)))

  const submit = async () => {
    if (outcome === 'Cleared' && anyOutstanding) {
      toast.warn('An item is marked Outstanding — the row cannot be Cleared.')
      return
    }
    if (outcome === 'Outstanding' && !note.trim() && !anyOutstanding) {
      toast.warn('Say what is outstanding: a note, or mark at least one item Outstanding.')
      return
    }
    setBusy(true)
    try {
      await api(token, '/task/act', {
        method: 'POST',
        body: {
          id: clearanceId,
          task_code: task.code,
          outcome,
          note: note.trim(),
          items: items.map((it) => ({
            code: it.code,
            outcome: outcome === 'Not Applicable' ? 'Not Applicable' : it.outcome,
            note: it.note,
            amount: it.amount === '' ? undefined : Number(it.amount),
          })),
        },
      })
      toast.success(outcome === 'Cleared' ? 'Row signed.' : `Row recorded as ${outcome}.`)
      onDone()
      onClose()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <CModal
      visible={visible}
      onClose={() => !busy && onClose()}
      backdrop="static"
      size="lg"
      alignment="center"
    >
      <CModalHeader closeButton={!busy}>
        <CModalTitle>
          {task.label} — <span className="text-medium-emphasis">{employeeName}</span>
        </CModalTitle>
      </CModalHeader>
      <CModalBody>
        <p className="mb-2">
          Signing this row is your attestation that the employee has{' '}
          <strong>no outstanding commitment</strong> to your department. If something is
          outstanding, record it instead — the employee and HR are told exactly what to settle, and
          you can sign once it is.
        </p>

        <div className="mb-3 d-flex flex-wrap" style={{ gap: 18 }}>
          <CFormCheck
            type="radio"
            name="outcome"
            id="oc-cleared"
            label="Cleared — nothing outstanding"
            checked={outcome === 'Cleared'}
            onChange={() => setOutcome('Cleared')}
          />
          <CFormCheck
            type="radio"
            name="outcome"
            id="oc-outstanding"
            label="Outstanding — commitment unfulfilled"
            checked={outcome === 'Outstanding'}
            onChange={() => setOutcome('Outstanding')}
          />
          <CFormCheck
            type="radio"
            name="outcome"
            id="oc-na"
            label="Not applicable to this employee"
            checked={outcome === 'Not Applicable'}
            onChange={() => setOutcome('Not Applicable')}
          />
        </div>

        {items.length > 0 && outcome !== 'Not Applicable' && (
          <CTable small bordered className="mb-3">
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Item</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 160 }}>Outcome</CTableHeaderCell>
                <CTableHeaderCell style={{ width: 130 }}>Amount (ETB)</CTableHeaderCell>
                <CTableHeaderCell>Note</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {items.map((it) => (
                <CTableRow key={it.code}>
                  <CTableDataCell>{it.label}</CTableDataCell>
                  <CTableDataCell>
                    <CFormSelect
                      size="sm"
                      value={it.outcome}
                      onChange={(e) => setItem(it.code, { outcome: e.target.value })}
                    >
                      <option value="Fulfilled">Fulfilled</option>
                      <option value="Not Applicable">Not Applicable</option>
                      <option value="Outstanding">Outstanding</option>
                    </CFormSelect>
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      size="sm"
                      type="number"
                      min={0}
                      step="0.01"
                      value={it.amount}
                      disabled={it.outcome !== 'Outstanding'}
                      placeholder={it.outcome === 'Outstanding' ? 'owed' : ''}
                      onChange={(e) => setItem(it.code, { amount: e.target.value })}
                    />
                  </CTableDataCell>
                  <CTableDataCell>
                    <CFormInput
                      size="sm"
                      value={it.note}
                      placeholder="optional"
                      onChange={(e) => setItem(it.code, { note: e.target.value })}
                    />
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}

        {anyOutstanding && outcome === 'Cleared' && (
          <CAlert color="warning" className="py-2">
            An item is Outstanding, so this row cannot be Cleared. Choose Outstanding, or resolve
            the item.
          </CAlert>
        )}

        <CFormLabel>
          {outcome === 'Outstanding' ? 'What is outstanding (required)' : 'Note (optional)'}
        </CFormLabel>
        <CFormTextarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={
            outcome === 'Outstanding'
              ? 'e.g. Laptop ZB-4471 not yet returned; personal loan balance ETB 42,500…'
              : 'e.g. Laptop and access card returned 18 Sep 2026'
          }
        />
        <small className="text-medium-emphasis">
          Your name, the time and your network address are recorded with this action.
        </small>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" variant="outline" disabled={busy} onClick={onClose}>
          Cancel
        </CButton>
        <CButton
          color={
            outcome === 'Cleared' ? 'success' : outcome === 'Outstanding' ? 'danger' : 'secondary'
          }
          disabled={busy}
          onClick={submit}
        >
          {busy ? (
            <>
              <CSpinner size="sm" className="me-2" /> Saving…
            </>
          ) : outcome === 'Cleared' ? (
            'Sign — Cleared'
          ) : outcome === 'Outstanding' ? (
            'Record Outstanding'
          ) : (
            'Mark Not Applicable'
          )}
        </CButton>
      </CModalFooter>
    </CModal>
  )
}

TaskActModal.propTypes = {
  visible: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  token: PropTypes.string,
  clearanceId: PropTypes.string,
  task: PropTypes.object,
  employeeName: PropTypes.string,
  onDone: PropTypes.func.isRequired,
}

export default TaskActModal
