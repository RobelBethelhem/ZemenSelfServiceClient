/* global __VERIFY_URL_BASE__ */
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { CAlert, CCard, CCardBody, CContainer, CFormSwitch, CSpinner } from '@coreui/react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import logoImage from './logo.png'
import watermarkImage from './watermark.png'
import stampImage from './stamp.png'
import boolImage from './bool.png'
import social from './social.png'
import nuruSignature from './nuru_signature.png'
import QRCodeWithLogo from './QRCodeWithLogo'
import { API_BASE } from '../../../api/base'
import { api } from '../Clearance/clearanceApi'

// The release notice HR posts to a company the leaving employee stood
// guarantor for — laid out exactly like the guaranty letter it follows up
// (letterhead, ቀን/ቁጥር, addressee, subject, three paragraphs, the Director's
// signature, stamp, QR). The wording comes with the notice, fixed on the day
// it was written; this page only prints it.
const GuarantyRelease = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const accessToken = useSelector((state) => state.user?.accessToken)

  const [notice, setNotice] = useState(location.state?.notice || null)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [withoutLetterhead, setWithoutLetterhead] = useState(false)
  const printRef = useRef()

  useEffect(() => {
    if (notice || !id || !accessToken) return
    api(accessToken, `/notice/${id}`)
      .then((r) => setNotice(r.notice))
      .catch((e) => setError(e.message))
  }, [notice, id, accessToken])

  const verifyTokenBeforeAction = async () => {
    if (!accessToken) {
      toast.error('Session expired. Please login again.')
      dispatch({ type: 'clearUser' })
      navigate('/login')
      return false
    }
    setIsVerifying(true)
    try {
      const response = await fetch(`${API_BASE}/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-token': accessToken },
      })
      if (response.ok) return true
      toast.error('Invalid or Expired Token')
      dispatch({ type: 'clearUser' })
      navigate('/login')
      return false
    } catch (e) {
      toast.error('Unknown Error. Try Again Later')
      return false
    } finally {
      setIsVerifying(false)
    }
  }

  const snapshot = (scale) =>
    html2canvas(printRef.current, {
      scale,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      width: printRef.current.offsetWidth,
      height: printRef.current.offsetHeight,
      windowWidth: printRef.current.scrollWidth,
      windowHeight: printRef.current.scrollHeight,
      backgroundColor: '#ffffff',
    })

  const handlePrint = async () => {
    if (!(await verifyTokenBeforeAction())) return
    const canvas = await snapshot(2)
    const imgData = canvas.toDataURL('image/png')
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print</title>
          <style>
            @page { size: A4; margin: 0mm; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; }
            body { width: 210mm; height: 297mm; display: block; position: relative; }
            img { width: 210mm; height: 297mm; object-fit: fill; display: block; position: absolute; top: 0; left: 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0 !important; padding: 0 !important; }
              @page { margin: 0mm !important; }
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Print content">
          <script>window.onload = function () { window.print(); }</script>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }

  const handleDownload = async () => {
    if (!(await verifyTokenBeforeAction())) return
    const canvas = await snapshot(3)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297)
    const safeRef = String(notice.reference_number || 'notice').replace(/[^\w]+/g, '_')
    pdf.save(`Guaranty_Release_Notice_${safeRef}.pdf`)
  }

  if (error) {
    return (
      <div className="p-4">
        <CAlert color="danger">{error}</CAlert>
      </div>
    )
  }
  if (!notice) {
    return (
      <div className="py-5 text-center">
        <CSpinner /> <span className="ms-2">Loading the notice…</span>
      </div>
    )
  }

  const verifyBase =
    typeof __VERIFY_URL_BASE__ !== 'undefined'
      ? __VERIFY_URL_BASE__
      : 'https://zhr.zemenbank.com/zbss/#/verify'
  const paragraphs = Array.isArray(notice.paragraphs) ? notice.paragraphs : []
  const paragraphStyle = {
    textAlign: 'justify',
    marginBottom: '1rem',
    marginLeft: '20px',
    marginRight: '20px',
  }

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div
        className="position-relative"
        style={{
          width: '210mm',
          minHeight: '297mm',
          maxWidth: '100%',
          margin: '0 auto',
          backgroundColor: 'white',
        }}
      >
        <div className="top-0 start-0 m-3 z-index-1">
          <button onClick={handlePrint} className="btn btn-primary me-2" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Print'}
          </button>
          <button onClick={handleDownload} className="btn btn-success me-2" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Download as PDF'}
          </button>
          <div className="d-inline-flex align-items-center ms-3">
            <CFormSwitch
              label="Without Letterhead"
              id="letterheadToggle"
              checked={withoutLetterhead}
              onChange={(e) => setWithoutLetterhead(e.target.checked)}
              style={{ fontSize: '14px' }}
            />
          </div>
          {notice.status === 'Cancelled' && (
            <CAlert color="danger" className="mt-2 mb-0 py-2">
              This notice was cancelled with the clearance — do not send it.
            </CAlert>
          )}
        </div>

        <div
          style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)', borderRadius: '0.25rem' }}
        >
          <CCard
            style={{
              width: '210mm',
              minHeight: '297mm',
              height: '297mm',
              maxWidth: '100%',
              position: 'relative',
              overflow: 'hidden',
              margin: 0,
              padding: 0,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: 'none',
              borderRadius: 0,
              backgroundColor: 'white',
            }}
            ref={printRef}
          >
            {!withoutLetterhead && (
              <div
                style={{
                  position: 'absolute',
                  top: '30px',
                  left: '30px',
                  bottom: '30px',
                  width: '4px',
                  backgroundColor: 'red',
                }}
              />
            )}
            {!withoutLetterhead && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${watermarkImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '30% 40%',
                  backgroundSize: '150%',
                  opacity: 0.08,
                  pointerEvents: 'none',
                  transform: 'rotate(-1deg)',
                }}
              />
            )}
            {!withoutLetterhead && (
              <img
                src={logoImage}
                alt="Logo"
                style={{
                  position: 'absolute',
                  top: '60px',
                  left: '50px',
                  width: '180px',
                  height: 'auto',
                }}
              />
            )}

            <CCardBody
              className="ps-5 pe-4"
              style={{
                paddingTop: withoutLetterhead ? '80px' : '20px',
                paddingBottom: '40mm',
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <CContainer
                fluid
                className="p-0"
                style={{
                  height: '100%',
                  fontFamily: 'Calibri, sans-serif',
                  minHeight: 'calc(297mm - 140px)',
                  position: 'relative',
                }}
              >
                {/* Date and reference number */}
                <div
                  className="d-flex flex-column align-items-end mb-4"
                  style={{ marginLeft: '20px', marginRight: '20px' }}
                >
                  <div className="d-flex justify-content-end w-100">
                    <div className="d-flex align-items-center">
                      <span className="me-2 text-nowrap fw-bold">ቀን:</span>
                      <span className="fw-bold">{notice.letter_date_am}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-end w-100">
                    <div className="d-flex align-items-center">
                      <span className="me-2 text-nowrap fw-bold">ቁጥር:</span>
                      <span className="fw-bold">{notice.reference_number}</span>
                    </div>
                  </div>
                </div>

                {/* Addressee */}
                <div
                  className="d-flex flex-column mb-4"
                  style={{ marginTop: '10rem', marginLeft: '20px', marginRight: '20px' }}
                >
                  <div className="d-flex w-100">
                    <div className="d-flex align-items-center">
                      <span className="me-1 text-nowrap fw-bold">ለ</span>
                      <span className="fw-bold">{notice.organization}</span>
                    </div>
                  </div>
                  <div className="d-flex w-100">
                    <div className="d-flex align-items-center">
                      <span className="me-2 text-nowrap"></span>
                      <span className="me-2 text-nowrap fw-bold">አድራሻ፡- </span>
                      <span className="fw-bold "> {notice.organization_location}</span>
                    </div>
                  </div>
                  <div className="d-flex w-100">
                    <div className="d-flex align-items-center">
                      <span className="me-2 text-nowrap"></span>
                      <span className="fw-bold text-decoration-underline">
                        {' '}
                        {notice.organization_city}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="text-center fw-bold mb-4"
                  style={{ marginLeft: '20px', marginRight: '20px' }}
                >
                  ጉዳዩ:- <span className="text-decoration-underline">{notice.subject}</span>
                </div>

                {paragraphs.map((runs, i) => (
                  <div key={i} style={paragraphStyle}>
                    {(Array.isArray(runs) ? runs : []).map((r, j) =>
                      r.b ? (
                        <strong key={j}>{r.t}</strong>
                      ) : (
                        <React.Fragment key={j}>{r.t}</React.Fragment>
                      ),
                    )}
                  </div>
                ))}

                <div
                  className="mt-4 mb-5 fw-bold"
                  style={{ marginLeft: '20px', marginRight: '20px' }}
                >
                  ከሠላምታ ጋር
                </div>

                <img
                  src={nuruSignature}
                  alt="Signature"
                  style={{
                    position: 'absolute',
                    left: '-45px',
                    width: '200px',
                    height: 'auto',
                    marginTop: '-95px',
                  }}
                />

                <div
                  className="d-flex flex-wrap align-items-baseline mb-2"
                  style={{
                    alignItems: 'flex-start',
                    marginTop: '10px',
                    marginLeft: '20px',
                    marginRight: '20px',
                  }}
                >
                  <div className="fw-bold">
                    ኑሩ ሙስጠፋ
                    <br />
                    ዳይሬክተር- የስራ አፈፃፀም እና የሰራተኞች አገልግሎት መምሪያ
                  </div>
                  {!withoutLetterhead && (
                    <img
                      src={stampImage}
                      alt="Stamp"
                      style={{
                        position: 'absolute',
                        left: '75px',
                        width: '140px',
                        height: 'auto',
                        marginTop: '-80px',
                        zIndex: 6,
                      }}
                    />
                  )}
                </div>

                <div
                  data-qr-code
                  style={{
                    position: 'absolute',
                    width: 100,
                    height: 100,
                    left: '300px',
                    bottom: '80px',
                    zIndex: 10,
                  }}
                >
                  <QRCodeWithLogo
                    url={`${verifyBase}/${encodeURIComponent(notice.reference_number || '')}`}
                    size={80}
                    logoUrl={watermarkImage}
                  />
                </div>

                <div
                  className="fst-italic mt-3 position-absolute bottom-0 start-0"
                  style={{ paddingLeft: '5px', marginLeft: '20px', marginRight: '20px' }}
                >
                  {!withoutLetterhead && (
                    <>
                      <br />
                      <small style={{ fontWeight: 'bold', lineHeight: '0' }}>
                        ዘመን ባንክ አ.ማ. / Zemen bank S.C.
                        <br />
                        Ras Abebe Aregay St.
                        <br />
                        P.O.Box 1212 Addis Ababa, Ethiopia
                        <br />
                        SWIFT Code: ZEMEETAA
                        <br />
                        Call Center 6500
                        <br />
                        info@zemenbank.com
                        <br />
                        <span style={{ color: 'red', fontWeight: 'bold' }}>www.zemenbank.com</span>
                        <div style={{ marginTop: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img
                              src={social}
                              alt="social media icons"
                              style={{ width: '120px', height: 'auto' }}
                            />
                            <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '20px' }}>
                              DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE
                            </span>
                          </div>
                        </div>
                      </small>
                    </>
                  )}
                </div>

                {!withoutLetterhead && (
                  <img
                    src={boolImage}
                    alt="Bool"
                    style={{
                      position: 'absolute',
                      bottom: '1px',
                      right: '1px',
                      width: '150px',
                      height: 'auto',
                    }}
                  />
                )}
              </CContainer>
            </CCardBody>
          </CCard>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  )
}

export default GuarantyRelease
