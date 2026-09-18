import React from 'react'
import PropTypes from 'prop-types'
import { CBadge } from '@coreui/react'
import ClearanceStatusBadge from './ClearanceStatusBadge'
import { fmtLongDate, daysBetween } from './clearanceApi'
import {
  FORM_TITLE,
  FORM_PREAMBLE,
  FINAL_LABEL,
  ITEM_OUTCOME_COLOR,
  signatureLine,
} from './clearanceContent'

// The Exit Clearance form itself, laid out like the paper original: an
// Employee Information block, then one row per department with its
// sub-items, then the President/CEO line.
//
// Two modes from one component so the screen and the printout can never
// disagree about what is on the form:
//   - screen: status pills, item outcomes as chips, notes, and whatever
//     `renderActions(task)` returns (sign / verify / reopen buttons);
//   - print: black-and-white, fixed type, the signature column as text.

const cell = (print, extra = {}) => ({
  border: print ? '1px solid #000' : '1px solid rgba(0,0,0,.15)',
  padding: print ? '3px 6px' : '6px 8px',
  verticalAlign: 'top',
  ...extra,
})

const headCell = (print) => ({
  ...cell(print),
  background: print ? '#666' : '#e9ecef',
  color: print ? '#fff' : '#000',
  fontWeight: 'bold',
  textAlign: 'center',
})

const ClearanceFormView = ({ clearance, names = {}, print = false, renderActions, slaDays }) => {
  const c = clearance
  const tasks = [...(c.tasks || [])].sort((a, b) => (a.order || 0) - (b.order || 0))
  const rows = tasks.filter((t) => !t.is_final)
  const finalTask = tasks.find((t) => t.is_final)
  const isResignation = c.termination_type === 'Resignation'
  const gaps = new Set(c.hris_gaps || [])
  const fontSize = print ? 10.5 : 13

  const gapFlag = (field) =>
    !print && gaps.has(field) ? (
      <CBadge
        color="warning"
        className="ms-2"
        title="HRIS had no value; this was entered or defaulted by the portal"
      >
        entered manually
      </CBadge>
    ) : null

  const dueInfo = (t) => {
    if (print || !slaDays || t.status !== 'Pending' || !t.notified_at) return null
    const age = daysBetween(t.notified_at, new Date())
    const left = slaDays - age
    if (left > 0) return <small className="text-medium-emphasis ms-2">due in {left}d</small>
    return (
      <small className="text-danger ms-2">{left === 0 ? 'due today' : `overdue ${-left}d`}</small>
    )
  }

  return (
    <div
      style={{ fontFamily: 'Calibri, "Times New Roman", Times, serif', fontSize, color: '#000' }}
    >
      <div
        style={{
          textAlign: 'center',
          fontWeight: 'bold',
          textDecoration: 'underline',
          fontSize: print ? 14 : 18,
          marginBottom: 6,
        }}
      >
        {FORM_TITLE}
      </div>
      <p style={{ textAlign: 'justify', fontSize: print ? 9.5 : 12, marginBottom: 8 }}>
        {FORM_PREAMBLE}
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 8 }}>
        <thead>
          <tr>
            <th colSpan={2} style={headCell(print)}>
              Employee Information
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={cell(print, { width: '42%', fontWeight: 'bold' })}>Employee Full Name</td>
            <td style={cell(print)}>
              {c.employee_name || '—'}{' '}
              <span className="text-medium-emphasis">({c.domain_user})</span>
              {gapFlag('employee_name')}
            </td>
          </tr>
          <tr>
            <td style={cell(print, { fontWeight: 'bold' })}>Current Job Title</td>
            <td style={cell(print)}>
              {c.job_title || '—'}
              {gapFlag('job_title')}
            </td>
          </tr>
          <tr>
            <td style={cell(print, { fontWeight: 'bold' })}>Current Department</td>
            <td style={cell(print)}>
              {c.department || c.unit_name || '—'}
              {gapFlag('department')}
            </td>
          </tr>
          <tr>
            <td style={cell(print, { fontWeight: 'bold' })}>Date of Employment</td>
            <td style={cell(print)}>
              {fmtLongDate(c.date_of_employment)}
              {gapFlag('date_of_employment')}
            </td>
          </tr>
          <tr>
            <td style={cell(print, { fontWeight: 'bold' })}>
              {isResignation ? 'Date of Resignation' : 'Release Date'}
            </td>
            <td style={cell(print)}>
              {fmtLongDate(c.release_date)}
              {c.immediate ? ' (immediate)' : ''}
            </td>
          </tr>
          {!isResignation && (
            <tr>
              <td style={cell(print, { fontWeight: 'bold' })}>Nature of Departure</td>
              <td style={cell(print)}>{c.termination_type}</td>
            </tr>
          )}
          {c.employee_id && (
            <tr>
              <td style={cell(print, { fontWeight: 'bold' })}>Employee ID</td>
              <td style={cell(print)}>{c.employee_id}</td>
            </tr>
          )}
        </tbody>
      </table>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={headCell(print)}>Department / Unit</th>
            <th style={headCell(print)}>Name &amp; Signature</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={2} style={cell(print, { fontStyle: 'italic' })}>
                The clearance form has not opened yet. Rows appear on the release date.
              </td>
            </tr>
          )}
          {rows.map((t) => (
            <tr
              key={t.code}
              style={t.status === 'Not Applicable' && !print ? { opacity: 0.6 } : undefined}
            >
              <td style={cell(print, { width: '46%' })}>
                <div style={{ fontWeight: 'bold' }}>{t.label}</div>
                {(t.items || []).map((it) => (
                  <div key={it.code} style={{ paddingLeft: 10, fontSize: print ? 9.5 : 12 }}>
                    - {it.label}
                    {print ? (
                      <span>
                        {' '}
                        {it.outcome !== 'Pending' ? `— ${it.outcome}` : '________________'}
                        {it.amount ? ` (ETB ${Number(it.amount).toLocaleString()})` : ''}
                        {it.note ? ` — ${it.note}` : ''}
                      </span>
                    ) : (
                      <>
                        {' '}
                        <CBadge
                          color={ITEM_OUTCOME_COLOR[it.outcome] || 'secondary'}
                          style={it.outcome === 'Not Applicable' ? { color: '#444' } : undefined}
                        >
                          {it.outcome}
                        </CBadge>
                        {it.amount ? (
                          <small className="ms-1 text-danger">
                            ETB {Number(it.amount).toLocaleString()}
                          </small>
                        ) : null}
                        {it.note ? (
                          <small className="ms-1 text-medium-emphasis">— {it.note}</small>
                        ) : null}
                      </>
                    )}
                  </div>
                ))}
              </td>
              <td style={cell(print)}>
                {print ? (
                  <>
                    <div>{signatureLine(t, names) || ' '}</div>
                    {t.note ? <div style={{ fontSize: 9.5 }}>{t.note}</div> : null}
                  </>
                ) : (
                  <>
                    <div className="d-flex align-items-center flex-wrap" style={{ gap: 6 }}>
                      <ClearanceStatusBadge task status={t.status} />
                      {t.signature_mode === 'manual' && (
                        <CBadge
                          color="dark"
                          title="Signed by hand on the printed form; HR records it"
                        >
                          hand-signed
                        </CBadge>
                      )}
                      {dueInfo(t)}
                    </div>
                    {signatureLine(t, names) ? (
                      <div style={{ fontSize: 12, marginTop: 2 }}>{signatureLine(t, names)}</div>
                    ) : t.status === 'Pending' || t.status === 'Waiting' ? (
                      <div style={{ fontSize: 12, marginTop: 2 }} className="text-medium-emphasis">
                        Signatories:{' '}
                        {(t.signers_snapshot || []).length
                          ? t.signers_snapshot.map((s) => names[s] || s).join(', ')
                          : 'none mapped — HR must reassign'}
                      </div>
                    ) : null}
                    {t.note ? (
                      <div style={{ fontSize: 12, marginTop: 2, whiteSpace: 'pre-wrap' }}>
                        {t.note}
                      </div>
                    ) : null}
                    {renderActions ? <div style={{ marginTop: 6 }}>{renderActions(t)}</div> : null}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div
        style={{
          marginTop: print ? 14 : 16,
          display: 'flex',
          alignItems: 'baseline',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        <strong>{FINAL_LABEL}</strong>
        {finalTask ? (
          print ? (
            <span>
              {finalTask.status === 'Cleared'
                ? signatureLine(finalTask, names)
                : '______________________________   Date: ______________'}
            </span>
          ) : (
            <>
              <ClearanceStatusBadge task status={finalTask.status} />
              {finalTask.signature_mode === 'manual' && <CBadge color="dark">hand-signed</CBadge>}
              {signatureLine(finalTask, names) ? (
                <span style={{ fontSize: 12 }}>{signatureLine(finalTask, names)}</span>
              ) : (finalTask.status === 'Pending' || finalTask.status === 'Waiting') &&
                (finalTask.signers_snapshot || []).length ? (
                <small className="text-medium-emphasis">
                  {finalTask.signers_snapshot.map((s) => names[s] || s).join(', ')}
                </small>
              ) : null}
              {renderActions ? renderActions(finalTask) : null}
            </>
          )
        ) : (
          <span style={{ fontStyle: 'italic' }}>
            {print ? '______________________________' : 'not configured'}
          </span>
        )}
      </div>
    </div>
  )
}

ClearanceFormView.propTypes = {
  clearance: PropTypes.object.isRequired,
  names: PropTypes.object,
  print: PropTypes.bool,
  renderActions: PropTypes.func,
  slaDays: PropTypes.number,
}

export default ClearanceFormView
