import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import html2canvas from 'html2canvas'
import { toast } from 'react-toastify'
import { CButton, CSpinner, CFormSwitch, CAlert } from '@coreui/react'

import logoImage from '../Letters/logo.png'
import { API_BASE as API_ROOT } from '../../../api/base'
import ClearanceFormView from './ClearanceFormView'
import { fmtLongDate, fmtDateTime } from './clearanceApi'

/* global __VERIFY_URL_BASE__ */
const VERIFY_URL_BASE =
  typeof __VERIFY_URL_BASE__ !== 'undefined'
    ? __VERIFY_URL_BASE__
    : 'https://zhr.zemenbank.com/zbss/#/verify'

// Prints the clearance the same way every other letter in the portal prints:
// re-verify the session, photograph the A4 block with html2canvas, and hand
// the image to a print window.
//
// Two artefacts come out of the same form:
//   form        — for the President/CEO's hand signature. Available once every
//                 departmental row is done; the final line is blank.
//   certificate — the completed clearance, numbered, with a QR that resolves
//                 to the public verify page. Available only once Cleared.
const ClearanceFormPrint = ({ clearance, names, artifact }) => {
  const accessToken = useSelector((s) => s.user?.accessToken)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [printing, setPrinting] = useState(false)
  const [withoutLetterhead, setWithoutLetterhead] = useState(false)
  const ref = useRef(null)

  const isCertificate = artifact === 'certificate'
  const verifyUrl = `${VERIFY_URL_BASE}/${encodeURIComponent(clearance._id)}`

  const verifyToken = async () => {
    if (!accessToken) return false
    try {
      const resp = await fetch(`${API_ROOT}/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
      })
      return resp.ok
    } catch {
      return false
    }
  }

  const handlePrint = async () => {
    if (printing) return
    setPrinting(true)
    try {
      if (!(await verifyToken())) {
        toast.error('Session expired. Please log in again.')
        dispatch({ type: 'clearUser' })
        navigate('/')
        return
      }
      const el = ref.current
      if (!el) return
      await new Promise((r) => setTimeout(r, 100))
      const canvas = await html2canvas(el, {
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
      const img = canvas.toDataURL('image/png')
      const w = window.open('', '_blank')
      if (!w) {
        toast.error('Pop-up blocked. Please allow pop-ups for this site and try again.')
        return
      }
      w.document.write(`<!DOCTYPE html><html><head><title>${
        isCertificate ? 'Exit Clearance Certificate' : 'Exit Clearance Form'
      }</title>
<style>
  @page { size: A4; margin: 0mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; height: 297mm; overflow: hidden; }
  img { width: 210mm; height: 297mm; object-fit: contain; object-position: top; display: block; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body><img src="${img}" alt="Exit Clearance" />
<script>window.onload = function () { setTimeout(function () { window.print(); }, 150); }</script>
</body></html>`)
      w.document.close()
      w.focus()
    } catch (e) {
      console.error('Clearance print error:', e)
      toast.error('Could not print. Please try again.')
    } finally {
      setPrinting(false)
    }
  }

  return (
    <>
      <div className="mb-3 d-flex align-items-center flex-wrap" style={{ gap: 16 }}>
        <CButton color="primary" onClick={handlePrint} disabled={printing}>
          {printing ? (
            <>
              <CSpinner size="sm" className="me-2" /> Preparing…
            </>
          ) : isCertificate ? (
            'Print Certificate'
          ) : (
            'Print Form for Signature'
          )}
        </CButton>
        <CFormSwitch
          id="clearanceLetterheadToggle"
          label="Without Letterhead"
          checked={withoutLetterhead}
          onChange={(e) => setWithoutLetterhead(e.target.checked)}
          style={{ fontSize: 14 }}
        />
      </div>

      {!isCertificate && (
        <CAlert color="info" className="py-2">
          This printout is for the President/CEO&apos;s hand signature. Once signed, HR records the
          signature in the system and the numbered certificate becomes available.
        </CAlert>
      )}

      <div
        ref={ref}
        style={{
          width: '210mm',
          minHeight: '297mm',
          position: 'relative',
          background: '#ffffff',
          color: '#000',
          boxSizing: 'border-box',
          margin: '0 auto',
          padding: withoutLetterhead ? '18mm 16mm 20mm' : '34mm 16mm 20mm',
        }}
      >
        {!withoutLetterhead && (
          <>
            <div
              style={{
                position: 'absolute',
                top: 30,
                left: 30,
                bottom: 30,
                width: 4,
                background: 'red',
              }}
            />
            <img
              src={logoImage}
              alt="Logo"
              style={{ position: 'absolute', top: 36, left: 50, width: 150 }}
            />
          </>
        )}

        {isCertificate && (
          <div
            style={{
              border: '2px solid #000',
              padding: '6px 10px',
              marginBottom: 10,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontFamily: 'Calibri, "Times New Roman", Times, serif',
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>CERTIFICATE OF EXIT CLEARANCE</div>
              <div style={{ fontSize: 10.5 }}>
                Certificate No.: <strong>{clearance.certificate_number || '—'}</strong>
                {' · '}Cleared on {fmtLongDate(clearance.cleared_at)}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <QRCodeSVG value={verifyUrl} size={64} level="M" includeMargin={false} />
              <div style={{ fontSize: 8, color: '#444' }}>Scan to verify</div>
            </div>
          </div>
        )}

        <ClearanceFormView clearance={clearance} names={names} print />

        {isCertificate && (
          <div
            style={{
              marginTop: 10,
              fontSize: 9,
              color: '#444',
              fontFamily: 'Calibri, Arial, sans-serif',
            }}
          >
            Every electronic signature above was recorded by the Zemen Bank Self Service Portal with
            the signatory&apos;s identity, time and network address. Generated{' '}
            {fmtDateTime(new Date())}.
          </div>
        )}
      </div>
    </>
  )
}

ClearanceFormPrint.propTypes = {
  clearance: PropTypes.object.isRequired,
  names: PropTypes.object,
  artifact: PropTypes.oneOf(['form', 'certificate']).isRequired,
}

export default ClearanceFormPrint
