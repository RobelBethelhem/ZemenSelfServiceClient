// Labels, colours and fixed wording for the exit-clearance screens and the
// printed form. Status strings here must match the backend enums in
// models/rms/Clearance.js exactly — they are compared, not translated.

export const TERMINATION_TYPES = [
  'Resignation',
  'Termination',
  'Retirement',
  'Contract End',
  'Death',
  'Other',
]

// Overall clearance status.
export const STATUS_META = {
  'Pending Supervisor': {
    color: 'warning',
    short: 'Supervisor',
    text: 'Waiting for the immediate supervisor to approve the resignation.',
  },
  'Pending HR': {
    color: 'warning',
    short: 'HR',
    text: 'Waiting for HR to approve the resignation.',
  },
  Rejected: {
    color: 'danger',
    short: 'Rejected',
    text: 'The resignation was not approved. It can be amended and resubmitted.',
  },
  Approved: {
    color: 'info',
    short: 'Approved',
    text: 'The departure is approved. The clearance form opens on the release date.',
  },
  Open: {
    color: 'primary',
    short: 'Open',
    text: 'The clearance form is open and departments are signing.',
  },
  'Awaiting Final Approval': {
    color: 'primary',
    short: 'Final',
    text: 'Every department has signed. Waiting for the President/CEO.',
  },
  Cleared: {
    color: 'success',
    short: 'Cleared',
    text: 'The clearance is complete.',
  },
  Cancelled: {
    color: 'secondary',
    short: 'Cancelled',
    text: 'This clearance was cancelled.',
  },
}

// A row on the form.
export const TASK_STATUS_META = {
  Waiting: { color: 'secondary', text: 'Opens after the rows it depends on are signed.' },
  Pending: { color: 'warning', text: 'Waiting for the signatory.' },
  Cleared: { color: 'success', text: 'Signed — nothing outstanding.' },
  Outstanding: { color: 'danger', text: 'Unfulfilled commitment recorded. Not signed.' },
  'Not Applicable': { color: 'light', text: 'Does not apply to this employee.' },
}

export const ITEM_OUTCOMES = ['Pending', 'Fulfilled', 'Not Applicable', 'Outstanding']
export const ITEM_OUTCOME_COLOR = {
  Pending: 'secondary',
  Fulfilled: 'success',
  'Not Applicable': 'light',
  Outstanding: 'danger',
}

export const SIGNER_MODES = [
  { value: 'supervisor', label: "The employee's immediate supervisor" },
  { value: 'unit_head', label: 'Head of a unit (and anyone the head delegated)' },
  { value: 'users', label: 'Named people' },
  { value: 'ceo', label: 'President/CEO (or active delegate)' },
]

export const SIGNATURE_MODES = [
  { value: 'electronic', label: 'Electronic — signed in the system' },
  { value: 'manual', label: 'By hand on the printed form — HR records it' },
]

// The paper form's preamble, verbatim.
export const FORM_TITLE = 'EXIT CLEARANCE FORM'
export const FORM_PREAMBLE =
  'This form is to be used in the event of employee termination. Each Department must ensure that ' +
  'the employee has no outstanding commitment to the Department. An employee will not receive their ' +
  'final compensation from Zemen Bank until all outstanding debts; loans, and/or commitments, equipment, ' +
  'supplies have been fulfilled or returned to the appropriate department. In the space provided, list ' +
  'commitments fulfilled or unfulfilled. Sign only when commitment is fulfilled.'

export const FINAL_LABEL = 'Final Approval by the President/CEO:'

// How a signed row reads in the "Name & Signature" column.
export const signatureLine = (task, names = {}) => {
  const who = (u) => (u && names[u]) || u || ''
  if (task.status === 'Not Applicable') return task.auto ? 'N/A (template rule)' : 'N/A'
  if (task.status === 'Cleared') {
    if (task.signature_mode === 'manual' && task.manual && task.manual.signed_by_name) {
      return `Signed by ${task.manual.signed_by_name}${
        task.manual.signed_on
          ? ` on ${new Date(task.manual.signed_on).toLocaleDateString('en-GB')}`
          : ''
      } — verified by ${who(task.manual.verified_by)}`
    }
    return `${who(task.acted_by) || task.acted_by_name || ''}${
      task.acted_at ? ` — ${new Date(task.acted_at).toLocaleString('en-GB')}` : ''
    } (electronic)`
  }
  if (task.status === 'Outstanding') return `OUTSTANDING — ${who(task.acted_by)}`
  return ''
}
