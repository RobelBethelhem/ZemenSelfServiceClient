import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { toast } from 'react-toastify'
import { CButton, CSpinner } from '@coreui/react'

import logoImage from '../Letters/logo.png'
import { fmtLongDate } from './clearanceApi'

// An inter-departmental memo, laid out exactly as the bank's memo paper:
// logo top-left, the Amharic/English memo title top-right, then Date / To /
// From / Subject in a labelled column, the body, the List of Benefits when
// there is one, "Regards", the CC list, and the letterhead footer.
//
// The same A4 block is what the screen shows, what prints, and what the
// PDF download is made from, so the three cannot differ.

const MEMO_TITLE_AM = 'የውስጥ ለውስጥ ማስታወሻ'
const MEMO_TITLE_EN = 'INTER-DEPARTMENTAL MEMO'
const FOOTER_LEFT = [
  'Headquarter - Sengatera, Ras Abebe Aregay St.',
  'P.O.Box 1212',
  'Addis Ababa, Ethiopia',
  'www.zemenbank.com',
]
const FOOTER_RIGHT = ['Driving the Future', 'Financial Services Experience']

const Runs = ({ runs }) => (
  <>
    {(runs || []).map((r, i) =>
      r.b ? <strong key={i}>{r.t}</strong> : <React.Fragment key={i}>{r.t}</React.Fragment>,
    )}
  </>
)
Runs.propTypes = { runs: PropTypes.array }

// The A4 page. `scale` lets the composer show a live preview at reduced size.
export const MemoPage = React.forwardRef(({ memo, scale = 1 }, ref) => {
  const font = { fontFamily: 'Calibri, "Segoe UI", Arial, sans-serif', color: '#000' }
  const label = { width: 80, fontWeight: 'bold', verticalAlign: 'top', paddingBottom: 4 }
  const value = { fontWeight: 'bold', verticalAlign: 'top', paddingBottom: 4 }
  const rows = memo.benefits_rows || []
  return (
    <div
      style={{
        width: `${210 * scale}mm`,
        height: scale < 1 ? `${297 * scale}mm` : undefined,
        overflow: 'hidden',
      }}
    >
      <div
        ref={ref}
        style={{
          ...font,
          width: '210mm',
          minHeight: '297mm',
          position: 'relative',
          background: '#fff',
          boxSizing: 'border-box',
          padding: '16mm 20mm 26mm',
          fontSize: 13,
          lineHeight: 1.5,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top left',
        }}
      >
        {/* letterhead */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <img src={logoImage} alt="Zemen Bank" style={{ width: 170, height: 'auto' }} />
          <div style={{ textAlign: 'right', paddingTop: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 'bold' }}>{MEMO_TITLE_AM}</div>
            <div style={{ fontSize: 13, letterSpacing: 0.5 }}>{MEMO_TITLE_EN}</div>
          </div>
        </div>

        {/* header block */}
        <table style={{ borderCollapse: 'collapse', marginTop: 34, marginBottom: 18 }}>
          <tbody>
            <tr>
              <td style={label}>Date:</td>
              <td style={value}>{fmtLongDate(memo.memo_date)}</td>
            </tr>
            <tr>
              <td style={label}>To:</td>
              <td style={value}>
                {(memo.to || []).map((e, i) => (
                  <div key={i}>{e.label}</div>
                ))}
              </td>
            </tr>
            <tr>
              <td style={label}>From:</td>
              <td style={value}>{memo.from_line}</td>
            </tr>
            <tr>
              <td style={label}>Subject:</td>
              <td style={{ ...value, textDecoration: 'underline' }}>{memo.subject}</td>
            </tr>
          </tbody>
        </table>

        {/* body */}
        {(memo.body_runs || []).map((runs, i) => (
          <p key={i} style={{ textAlign: 'justify', marginBottom: 12 }}>
            <Runs runs={runs} />
          </p>
        ))}

        {rows.length > 0 && (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '4px 0 16px',
              fontSize: 12.5,
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: '1px solid #888',
                    padding: '3px 8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  List of Benefits
                </th>
                <th
                  style={{
                    border: '1px solid #888',
                    padding: '3px 8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  Amount/Details
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td
                    style={{
                      border: '1px solid #888',
                      padding: '2px 8px',
                      fontWeight: 'bold',
                      width: '52%',
                    }}
                  >
                    {r.label}
                  </td>
                  <td style={{ border: '1px solid #888', padding: '2px 8px', color: '#333' }}>
                    {r.value || ' '}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ fontWeight: 'bold', marginTop: 6 }}>Regards,</div>

        {(memo.cc || []).length > 0 && (
          <div style={{ marginTop: 10, fontStyle: 'italic', fontSize: 12 }}>
            <div>CC:</div>
            <ul style={{ margin: '2px 0 0 26px', padding: 0 }}>
              {memo.cc.map((e, i) => (
                <li key={i}>{e.label}</li>
              ))}
            </ul>
          </div>
        )}

        {/* footer */}
        <div
          style={{
            position: 'absolute',
            left: '20mm',
            right: '20mm',
            bottom: '10mm',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: 10,
            color: '#333',
            borderLeft: '3px solid #d0d0d0',
            paddingLeft: 10,
          }}
        >
          <div>
            {FOOTER_LEFT.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
          <div style={{ textAlign: 'right' }}>
            {FOOTER_RIGHT.map((l) => (
              <div key={l}>{l}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})
MemoPage.displayName = 'MemoPage'
MemoPage.propTypes = {
  memo: PropTypes.object.isRequired,
  scale: PropTypes.number,
}

// Capture the page as a bitmap, as every letter in the portal is printed.
const capture = async (el) => {
  await new Promise((r) => setTimeout(r, 80))
  return html2canvas(el, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    scrollY: -window.scrollY,
    width: el.offsetWidth,
    height: el.offsetHeight,
    windowWidth: el.scrollWidth,
    windowHeight: el.scrollHeight,
    logging: false,
  })
}

const fileName = (memo) =>
  `${memo.kind === 'outstanding' ? 'Outstanding-Commitments' : 'Resignation'}-Memo_${String(
    memo.employee_name || 'employee',
  ).replace(/[^A-Za-z0-9]+/g, '_')}.pdf`

// The memo with a Print and a Download PDF button.
const MemoDocument = ({ memo }) => {
  const ref = useRef(null)
  const [busy, setBusy] = useState('')

  const print = async () => {
    setBusy('print')
    try {
      const canvas = await capture(ref.current)
      const img = canvas.toDataURL('image/png')
      const w = window.open('', '_blank')
      if (!w)
        return toast.error('Pop-up blocked. Please allow pop-ups for this site and try again.')
      w.document.write(`<!DOCTYPE html><html><head><title>${memo.subject}</title>
<style>
  @page { size: A4; margin: 0mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; height: 297mm; overflow: hidden; }
  img { width: 210mm; height: 297mm; object-fit: contain; object-position: top; display: block; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body><img src="${img}" alt="memo" />
<script>window.onload = function () { setTimeout(function () { window.print(); }, 150); }</script>
</body></html>`)
      w.document.close()
      w.focus()
    } catch (e) {
      console.error('memo print', e)
      toast.error('Could not print the memo.')
    } finally {
      setBusy('')
    }
    return null
  }

  const download = async () => {
    setBusy('pdf')
    try {
      const canvas = await capture(ref.current)
      // Page height follows the capture so a long distribution list is never cut.
      const heightMm = Math.max(297, (canvas.height / canvas.width) * 210)
      const pdf = new jsPDF({
        unit: 'mm',
        format: [210, heightMm],
        orientation: 'portrait',
        compress: true,
      })
      pdf.setProperties({
        title: memo.subject,
        author: 'Zemen Bank S.C.',
        creator: 'Zemen Bank Self Service Portal',
      })
      pdf.addImage(
        canvas.toDataURL('image/jpeg', 0.92),
        'JPEG',
        0,
        0,
        210,
        (canvas.height / canvas.width) * 210,
      )
      pdf.save(fileName(memo))
    } catch (e) {
      console.error('memo pdf', e)
      toast.error('Could not build the PDF.')
    } finally {
      setBusy('')
    }
  }

  return (
    <>
      <div className="mb-3 d-flex align-items-center flex-wrap" style={{ gap: 10 }}>
        <CButton color="primary" disabled={!!busy} onClick={print}>
          {busy === 'print' ? <CSpinner size="sm" /> : 'Print'}
        </CButton>
        <CButton color="dark" variant="outline" disabled={!!busy} onClick={download}>
          {busy === 'pdf' ? <CSpinner size="sm" /> : 'Download PDF'}
        </CButton>
        {memo.status === 'draft' && <small className="text-warning">Draft — not yet sent.</small>}
        {memo.status === 'sent' && (
          <small className="text-medium-emphasis">
            Sent {memo.sent_at ? new Date(memo.sent_at).toLocaleString('en-GB') : ''} to{' '}
            {(memo.recipients || []).length} recipient
            {(memo.recipients || []).length === 1 ? '' : 's'}.
          </small>
        )}
      </div>
      <div style={{ overflowX: 'auto' }}>
        <MemoPage ref={ref} memo={memo} />
      </div>
    </>
  )
}

MemoDocument.propTypes = {
  memo: PropTypes.object.isRequired,
}

export default MemoDocument
