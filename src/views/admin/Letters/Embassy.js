import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CCard,
  CCardBody,
  CForm,
  CContainer,
  CFormSwitch,
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import logoImage from './logo.png';
import watermarkImage from './watermark.png';
import stampImage from './stamp.png';
import boolImage from './bool.png';
import social from './social.png';
import { QRCodeSVG } from 'qrcode.react';
import QRCodeWithLogo from './QRCodeWithLogo';
import './spaced.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import nuru_signature from './nuru_signature.png';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { API_BASE } from '../../../api/base';
import 'react-toastify/dist/ReactToastify.css';

const SocialIcon = ({ path, viewBox = "0 0 24 24" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} width="18" height="18" fill="currentColor">
    <path d={path} />
  </svg>
);

// Function to convert number to words (English)
const numberToEnglishWords = (num) => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';

  const convertLessThanThousand = (n) => {
    if (n >= 100) {
      return ones[Math.floor(n / 100)] + ' Hundred ' + convertLessThanThousand(n % 100);
    }
    if (n >= 20) {
      return tens[Math.floor(n / 10)] + ' ' + ones[n % 10];
    }
    if (n >= 10) {
      return teens[n - 10];
    }
    return ones[n];
  };

  const convert = (n) => {
    if (n >= 1000000) {
      return convert(Math.floor(n / 1000000)) + ' Million ' + convert(n % 1000000);
    }
    if (n >= 1000) {
      return convert(Math.floor(n / 1000)) + ' Thousand ' + convert(n % 1000);
    }
    return convertLessThanThousand(n);
  };

  return convert(num).trim();
};

// Function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const Embassy_Letter = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rowData = location.state?.rowData;

  // Token validation
  const accessToken = useSelector(state => state.user.accessToken);
  const [isVerifying, setIsVerifying] = useState(false);

  // Add state for letterhead toggle
  const [withoutLetterhead, setWithoutLetterhead] = useState(false);

  // Token verification function
  const verifyTokenBeforeAction = async () => {
    if (!accessToken) {
      toast.error('Session expired. Please login again.');
      dispatch({ type: 'clearUser' });
      navigate('/login');
      return false;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${API_BASE}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        }
      });

      if (response.ok) {
        return true;
      } else {
        toast.error('Invalid or Expired Token');
        dispatch({ type: 'clearUser' });
        navigate('/login');
        return false;
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      toast.error('Unknown Error. Try Again Later');
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  if (!rowData) {
    return <div>No data available</div>;
  }

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Extract data from rowData
  const employee_first_name = rowData.employee_first_name;
  const employee_last_name = rowData.employee_last_name;
  const employee_middle_name = rowData.employee_middle_name;
  const reference_number = rowData.reference_number;
  const full_name = `${employee_first_name} ${employee_middle_name} ${employee_last_name}`;
  const employee_embassy_name = rowData.employee_embassy_name;
  const embassy_location = rowData.embassy_location || "Addis Ababa";
  const annual_salary = rowData.annual_salary;
  const employee_position = rowData.employee_position;
  const date_of_employment = formatDate(rowData.date_of_employment);
  const approved_date = rowData.viewed_date ? formatDate(rowData.viewed_date) : formatDate(new Date());

  // Convert salary to words
  const salary_in_words = numberToEnglishWords(annual_salary);

  const data = "https://www.zemenbank.com";
  const size = 100;
  const qrSize = size;

  const printRef = React.useRef();

  // Add window resize handler
  useEffect(() => {
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Modify the existing useEffect
  useEffect(() => {
    setIsLoaded(true);
    // Add timer to show confetti after rotation animation
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handlePrint = async () => {
    const isValid = await verifyTokenBeforeAction();
    if (!isValid) return;

    const content = printRef.current;
   
    html2canvas(content, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      width: content.offsetWidth,
      height: content.offsetHeight,
      windowWidth: content.scrollWidth,
      windowHeight: content.scrollHeight,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
     
      const printWindow = window.open('', '_blank');
     
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print</title>
            <style>
              @page {
                size: A4;
                margin: 0mm;
                bleed: 0mm;
              }
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              body {
                width: 210mm;
                height: 297mm;
                display: block;
                position: relative;
              }
              img {
                width: 210mm;
                height: 297mm;
                object-fit: fill;
                display: block;
                position: absolute;
                top: 0;
                left: 0;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                  color-adjust: exact;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                @page {
                  margin: 0mm !important;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Print content">
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
     
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    });
  };

  const handleDownload = async () => {
    const isValid = await verifyTokenBeforeAction();
    if (!isValid) return;

    const input = printRef.current;
    html2canvas(input, {
      scale: 3,
      useCORS: true,
      allowTaint: true,
      scrollY: -window.scrollY,
      width: input.offsetWidth,
      height: input.offsetHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      backgroundColor: '#ffffff'
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pdfWidth = 210;
      const pdfHeight = 297;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${full_name}_Embassy_Letter.pdf`);
    });
  };

  const [isLoaded, setIsLoaded] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, rotate: 360 },
    visible: {
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 3,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={500}
          gravity={0.3}
          tweenDuration={5000}
          colors={['#ff6b6b', '#4ecdc4', '#fff176', '#64b5f6', '#ba68c8']}
        />
      )}
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="position-relative" style={{
          width: '210mm',
          minHeight: '297mm',
          maxWidth: '100%',
          margin: '0 auto',
          backgroundColor: 'white'
        }}>
          <div className="top-0 start-0 m-3 z-index-1">
            <button onClick={handlePrint} className="btn btn-primary me-2" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Print'}
            </button>
            <button onClick={handleDownload} className="btn btn-success me-2" disabled={isVerifying}>
              {isVerifying ? 'Verifying...' : 'Download as PDF'}
            </button>
           
            {/* Toggle Switch for Letterhead */}
            <div className="d-inline-flex align-items-center ms-3">
              <CFormSwitch
                label="Without Letterhead"
                id="letterheadToggle"
                checked={withoutLetterhead}
                onChange={(e) => setWithoutLetterhead(e.target.checked)}
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
         
          <motion.div
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
            variants={cardVariants}
            style={{
              boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)',
              borderRadius: '0.25rem'
            }}
          >
            <CCard style={{
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
              backgroundColor: 'white'
            }} ref={printRef}>
             
              {/* Red Line - Only show if NOT without letterhead */}
              {!withoutLetterhead && (
                <div style={{
                  position: 'absolute',
                  top: '30px',
                  left: '30px',
                  bottom: '30px',
                  width: '4px',
                  backgroundColor: 'red'
                }}></div>
              )}
             
              {/* Watermark - Only show if NOT without letterhead */}
              {!withoutLetterhead && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundImage: `url(${watermarkImage})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '33% 40%',
                  backgroundSize: '150%',
                  opacity: 0.08,
                  pointerEvents: 'none',
                  transform: 'rotate(-1deg)'
                }}></div>
              )}

              {/* Logo - Only show if NOT without letterhead */}
              {!withoutLetterhead && (
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{
                    position: 'absolute',
                    top: '60px',
                    left: '50px',
                    width: '180px',
                    height: 'auto'
                  }}
                />
              )}
             
              <CCardBody className="ps-5 pe-4" style={{
                marginTop: withoutLetterhead ? '80px' : '60px',
                paddingBottom: '40mm',
                height: '100%',
                boxSizing: 'border-box'
              }}>
                <CForm>
                  <CContainer fluid className="p-0" style={{
                    height: '100%',
                    fontFamily: 'Calibri, sans-serif',
                    minHeight: 'calc(297mm - 140px)',
                    position: 'relative'
                  }}>
                 
                    {/* Date and Reference Number */}
                    <div className="d-flex flex-column align-items-end mb-4" style={{marginLeft: '20px', marginRight: '20px'}}>
                      <div className="d-flex justify-content-end w-100">
                        <div className="d-flex align-items-center">
                          <span className="me-2 text-nowrap fw-bold">Date:</span>
                          <span className="fw-bold">{approved_date}</span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end w-100">
                        <div className="d-flex align-items-center">
                          <span className="me-2 text-nowrap fw-bold">Ref. No.:</span>
                          <span className="fw-bold">{reference_number}</span>
                        </div>
                      </div>
                    </div>

                    {/* Embassy Address */}
                    <div className="d-flex flex-column mb-4" style={{marginLeft: '20px', marginRight: '20px'}}>
                      <div className="fw-bold">
                        {employee_embassy_name}
                      </div>
                      <div className="text-decoration-underline fw-bold">
                        {embassy_location}
                      </div>
                    </div>

                    {/* Salutation */}
                    <div className="fw-bold mb-4" style={{marginLeft: '20px', marginRight: '20px'}}>
                      Dear Sir/Madam,
                    </div>

                    {/* Letter Body */}
                    <div style={{ textAlign: 'justify', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px', lineHeight: '1.8' }}>
                      Pursuant to the request of <strong>Mr./Ms. {full_name}</strong>, we would like to certify that he/she is working in Zemen Bank S.C. on a permanent basis commencing his/her date of employment <strong>{date_of_employment}</strong>.
                    </div>

                    <div style={{ textAlign: 'justify', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px', lineHeight: '1.8' }}>
                      Currently, <strong>Mr./Ms. {full_name.split(' ')[0]}</strong> is serving in the capacity of <strong>{employee_position}</strong> drawing an annual gross salary of ETB <strong>{Number(annual_salary).toLocaleString('en-US', { maximumFractionDigits: 2 })} ({salary_in_words})</strong>, and other standard benefits per the Bank's procedure.
                    </div>

                    <div style={{ textAlign: 'justify', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px', lineHeight: '1.8' }}>
                      Income tax is being deducted from his/her basic salary on monthly basis and paid to the concerned governmental authority.
                    </div>

                    <div style={{ textAlign: 'justify', marginBottom: '1rem', marginLeft: '20px', marginRight: '20px', lineHeight: '1.8' }}>
                      Any assistance given to him/her is highly appreciated.
                    </div>

                    {/* Sincerely */}
                    <div className="mt-4 mb-5 fw-bold" style={{marginLeft: '20px', marginRight: '20px'}}>
                      Sincerely,
                    </div>

                    {/* Signature Image */}
                    <img
                      src={nuru_signature}
                      alt="Signature"
                      style={{
                        position: 'absolute',
                        left: '-35px',
                        width: '150px',
                        height: 'auto',
                        marginTop: '-55px'
                      }}
                    />

                    {/* Signature and Stamp */}
                    <div style={{ alignItems: 'flex-start', marginTop: '10px', marginLeft: '20px', marginRight: '20px', position: 'relative' }}>
                      <div className="fw-bold">
                        Nuru Mustefa
                        <br />
                        Director, Performance Management & Employee Services Dep't
                      </div>
                      {/* Stamp Image - Only show if NOT without letterhead */}
                      {!withoutLetterhead && (
                        <img
                          src={stampImage}
                          alt="Stamp"
                          style={{
                            position: 'absolute',
                            left: '120px',
                            width: '150px',
                            height: 'auto',
                            top: '-80px'
                          }}
                        />
                      )}
                    </div>

                    {/* QR Code */}
                    <div
                      data-qr-code
                      style={{
                        position: 'absolute',
                        width: qrSize,
                        height: qrSize,
                        left: '300px',
                        bottom: '80px',
                        zIndex: 10
                      }}
                    >
                      <QRCodeWithLogo
                        url={`${typeof __VERIFY_URL_BASE__ !== 'undefined' ? __VERIFY_URL_BASE__ : 'https://zhr.zemenbank.com/zbss/#/verify'}/${encodeURIComponent(reference_number || '')}`}
                        size={80}
                        logoUrl={watermarkImage}
                      />
                    </div>

                    {/* Footer - Contact Info */}
                    <div
                      className="fst-italic mt-3 position-absolute bottom-0 start-0"
                      style={{ paddingLeft: '5px', marginLeft: '20px', marginRight: '20px' }}
                    >
                      {/* Contact info and social icons - Only show if NOT without letterhead */}
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
                            {/* <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
                                  <SocialIcon path="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                                </div>
                                <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
                                  <SocialIcon path="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                                </div>
                                <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
                                  <SocialIcon path="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 2a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
                                </div>
                                <div style={{ backgroundColor: 'red', color: 'white', padding: '4px', borderRadius: '50%' }}>
                                  <SocialIcon path="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                </div>
                                <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '60px' }}>
                                  DRIVING THE FUTURE FINANCIAL SERVICES EXPERIENCE
                                </span>
                              </div>
                            </div> */}

                            <div style={{ marginTop: '10px' }}>
                                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <img
                                                              src={social}
                                                              alt="social media icons"
                                                              style={{
                                                                width: '120px',
                                                                height: 'auto'
                                                              }}
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

                    {/* Bottom Image - Only show if NOT without letterhead */}
                    {!withoutLetterhead && (
                      <img
                        src={boolImage}
                        alt="Bool"
                        style={{
                          position: 'absolute',
                          bottom: '1px',
                          right: '1px',
                          width: '150px',
                          height: 'auto'
                        }}
                      />
                    )}

                  </CContainer>
                </CForm>
              </CCardBody>
            </CCard>
          </motion.div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default Embassy_Letter;
