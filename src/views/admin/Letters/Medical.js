import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CCard,
  CCardBody,
  CFormSwitch,
} from '@coreui/react';
import '@coreui/coreui/dist/css/coreui.min.css';
import { useLocation, useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoImage from './logo.png'; 
import nuru_signature from './nuru_signature1.png'; 
import stamp from './stamp.png';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MedicalSlip = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rowData = location.state?.rowData;

  // Token validation
  const accessToken = useSelector(state => state.user.accessToken);
  const [isVerifying, setIsVerifying] = useState(false);

  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [isLoaded, setIsLoaded] = useState(false);

  const printRef = useRef();

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
      const response = await fetch('https://aps2.zemenbank.com/zbss/api/verify-token', {
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
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="alert alert-warning">No medical request data available</div>
      </div>
    );
  }

  const {
    is_Spouse,
    medical_place,
    spouse_first_name,
    spouse_middle_name,
    spouse_last_name,
    child_first_name,
    chid_middle_name,
    child_last_name,
    employee_id_no,
    place_of_assignment,
    name_of_supervisor = 'Nuru Mustefa',
    employee_description,
    reference_number,
    viewed_date,
    TimeStamp,
    domain_user,
    viewed_by,
    // HRIS-sourced employee name parts (preferred over domain_user split).
    // Candidate_Landing copies the canonical names from the Medical doc
    // into actual_employee_* so they survive the spouse/child override
    // used by the admin table.
    actual_employee_first_name,
    actual_employee_middle_name,
    actual_employee_last_name,
    employee_first_name: rawEmployeeFirstName,
    employee_middle_name: rawEmployeeMiddleName,
    employee_last_name: rawEmployeeLastName,
  } = rowData;

  // Prefer HRIS-derived employee name parts; fall back to splitting
  // domain_user only if the new fields are not yet present (legacy rows
  // saved before this feature shipped).
  const employeeFullName = (() => {
    const first = actual_employee_first_name || rawEmployeeFirstName || '';
    const middle = actual_employee_middle_name || rawEmployeeMiddleName || '';
    const last = actual_employee_last_name || rawEmployeeLastName || '';
    const joined = `${first} ${middle} ${last}`.trim();
    if (joined) return joined;
    return (domain_user || '').split('.').join(' ');
  })();

  const patientName = is_Spouse
    ? `${spouse_first_name || ''} ${spouse_middle_name || ''} ${spouse_last_name || ''}`
    : `${child_first_name || ''} ${chid_middle_name || ''} ${child_last_name || ''}`;

  const spouseName = `${spouse_first_name || ''} ${spouse_middle_name || ''} ${spouse_last_name || ''}`;
  const childName = `${child_first_name || ''} ${chid_middle_name || ''} ${child_last_name || ''}`;

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

  useEffect(() => {
    setIsLoaded(true);
    const timer = setTimeout(() => {
      setShowConfetti(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = async () => {
    const isValid = await verifyTokenBeforeAction();
    if (!isValid) return;

    const content = printRef.current;
    
    setTimeout(() => {
      html2canvas(content, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        scrollX: 0,
        backgroundColor: '#ffffff',
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
        x: 0,
        y: 0,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Medical Slip</title>
              <style>
                @page { size: A4; margin-top: 8mm; margin-bottom: 0mm; margin-left: 0mm; margin-right: 0mm; }
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { width: 210mm; height: 148.5mm; display: flex; align-items: center; justify-content: center; }
                img { width: 210mm; height: 148.5mm; object-fit: contain; }
                @media print {
                  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" alt="Print content">
              <script>window.onload = function() { window.print(); }</script>
            </body>
          </html>
        `);
        printWindow.document.close();
      });
    }, 100);
  };

  const handleDownload = async () => {
    const isValid = await verifyTokenBeforeAction();
    if (!isValid) return;

    const input = printRef.current;
    
    setTimeout(() => {
      html2canvas(input, { 
        scale: 3,
        useCORS: true,
        allowTaint: true,
        scrollY: -window.scrollY,
        backgroundColor: '#ffffff',
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 148.5);
        pdf.save(`Medical_Slip_${patientName.replace(/\s+/g, '_')}.pdf`);
      });
    }, 100);
  };

  const cardVariants = {
    hidden: { opacity: 0, rotate: 360 },
    visible: { 
      opacity: 1, 
      rotate: 0,
      transition: { duration: 3, ease: "easeInOut" }
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
          colors={['#ff6b6b', '#4ecdc4', '#fff176', '#64b5f6', '#ba68c8']}
        />
      )}
      
      <div className="position-relative" style={{ width: '210mm', maxWidth: '100%', margin: '0 auto' }}>
        <div className="top-0 start-0 m-3 z-index-1">
          <button onClick={handlePrint} className="btn btn-danger me-2" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Print'}
          </button>
          <button onClick={handleDownload} className="btn btn-success me-2" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Download as PDF'}
          </button>
        </div>
        
        <motion.div
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          variants={cardVariants}
        >
          <CCard style={{
            width: '210mm',
            minHeight: '148.5mm',
            backgroundColor: 'white',
            position: 'relative',
            border: '2px solid #000',
          }} ref={printRef}>
            
            <CCardBody style={{ padding: '10mm' }}>
              {/* Header with Logo */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                marginBottom: '8px',
                position: 'relative'
              }}>
                <img
                  src={logoImage}
                  alt="Zemen Bank Logo"
                  style={{
                    width: '100px',
                    height: 'auto',
                    position: 'absolute',
                    left: 0,
                    top: 0
                  }}
                />
                <div style={{ 
                  flex: 1, 
                  textAlign: 'center',
                  paddingTop: '5px'
                }}>
                  <h4 style={{ 
                    fontFamily: 'Times New Roman, serif', 
                    fontSize: '18px',
                    fontWeight: 'bold',
                    marginBottom: '3px'
                  }}>
                    Zemen Bank S.C.
                  </h4>
                  <h5 style={{ 
                    fontFamily: 'Times New Roman, serif', 
                    fontSize: '16px',
                    textDecoration: 'underline',
                    marginTop: 0
                  }}>
                    Medical Slip
                  </h5>
                </div>
              </div>

              {/* Main Form */}
              <div style={{ fontFamily: 'Times New Roman, serif', fontSize: '13px', marginTop: '15px' }}>
                {/* To and Date Row */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '6px',
                  marginBottom: '10px' 
                }}>
                  <div>
                    <span style={{ fontWeight: 'bold' }}>REF:</span>
                    <span style={{
                      borderBottom: '1px solid #000',
                      display: 'inline-block',
                      minWidth: '120px',
                      marginLeft: '5px',
                      paddingBottom: '2px'
                    }}>
                      {reference_number}
                    </span>
                  </div>
                  
                  <div>
                    <span style={{ fontWeight: 'bold' }}>Date:</span>
                    <span style={{
                      borderBottom: '1px solid #000',
                      display: 'inline-block',
                      minWidth: '120px',
                      marginLeft: '5px',
                      paddingBottom: '2px'
                    }}>
                      {new Date(viewed_date || TimeStamp).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </div>

                {/* Employee's Name and Patient Checkboxes */}
                <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 'bold' }}>To:</span>
                    <span style={{ 
                      borderBottom: '1px solid #000', 
                      display: 'inline-block',
                      minWidth: '300px',
                      marginLeft: '10px',
                      paddingBottom: '2px'
                    }}>
                      {medical_place}
                    </span>

                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold' }}>Employee's Name:</span>
                      <span style={{
                        borderBottom: '1px solid #000',
                        display: 'inline-block',
                        minWidth: '250px',
                        marginLeft: '10px',
                        paddingBottom: '2px'
                      }}>
                        {employeeFullName}
                      </span>
                    </div>
                  </div>
                  
                  {/* Patient Checkboxes */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '4px', textDecoration: 'underline' }}>
                      Patient
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginBottom: '5px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ 
                          border: '2px solid #000', 
                          width: '18px', 
                          height: '18px',
                          display: 'inline-block',
                          position: 'relative'
                        }}></span>
                        Employee
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ 
                          border: '2px solid #000', 
                          width: '18px', 
                          height: '18px',
                          display: 'inline-block',
                          position: 'relative'
                        }}>
                          {is_Spouse && (
                            <span style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '22px',
                              fontWeight: 'bold'
                            }}>✓</span>
                          )}
                        </span>
                        Spouse
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ 
                          border: '2px solid #000', 
                          width: '18px', 
                          height: '18px',
                          display: 'inline-block',
                          position: 'relative'
                        }}>
                          {!is_Spouse && (child_first_name || chid_middle_name || child_last_name) && (
                            <span style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: '22px',
                              fontWeight: 'bold'
                            }}>✓</span>
                          )}
                        </span>
                        Child
                      </label>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '8px' }}>
                  {/* Left Side - Employee ID and Place of Assignment */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ fontWeight: 'bold' }}>Employee ID No.</span>
                      <span style={{
                        borderBottom: '1px solid #000',
                        display: 'inline-block',
                        minWidth: '100px',
                        marginLeft: '10px',
                        paddingBottom: '2px'
                      }}>
                        {employee_id_no}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontWeight: 'bold' }}>Place of Assignment:</span>
                      <span style={{
                        borderBottom: '1px solid #000',
                        display: 'inline-block',
                        minWidth: '100px',
                        marginLeft: '10px',
                        paddingBottom: '2px'
                      }}>
                        {place_of_assignment}
                      </span>
                    </div>
                  </div>

                  {/* Right Side - Spouse/Child Name Fields */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ marginBottom: '6px' }}>
                      <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Spouse Name:</span>
                      <span style={{
                        borderBottom: '1px solid #000',
                        display: 'inline-block',
                        minWidth: '100px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        fontWeight: 'bold'
                      }}>
                        {is_Spouse ? spouseName : ''}
                      </span>
                    </div>
                    <div>
                      <span style={{ marginRight: '10px', fontWeight: 'bold' }}>Child Name:</span>
                      <span style={{
                        borderBottom: '1px solid #000',
                        display: 'inline-block',
                        minWidth: '100px',
                        paddingBottom: '2px',
                        textAlign: 'left',
                        fontWeight: 'bold'
                      }}>
                        {!is_Spouse ? childName : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Letter Body */}
                <div style={{ marginTop: '12px', marginBottom: '12px' }}>
                  <p style={{ marginBottom: '10px' }}>Dear Sir/Madam,</p>
                  <p style={{ textAlign: 'justify', lineHeight: '1.5' }}>
                    We hereby confirm that the bearer of this medical slip is an employee of Zemen Bank S.C., 
                    Spouse or Child of the employee. We kindly request you to provide him/her all essential medical 
                    treatment as per our medical agreement there to.
                  </p>
                  <p style={{ marginTop: '10px' }}>Regards.</p>
                </div>

                {/* Signature Section */}
                <div style={{ marginTop: '15px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '10px' }}>
                    
                    {/* Checked By */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold' }}>Checked By:</span>
                      <span style={{
                        borderBottom: '1px solid #000',
                        display: 'inline-block',
                        minWidth: '250px',
                        marginLeft: '10px',
                        paddingBottom: '2px'
                      }}>
                        {viewed_by.replace('.', ' ')}
                      </span>
                    </div>

                    {/* Approved By, Signature and Stamp in Row */}
                    <div style={{ display: 'flex', gap: '25px' }}>
                      {/* Approved By */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Approved By:</span>
                        <span style={{
                          borderBottom: '1px solid #000',
                          display: 'inline-block',
                          minWidth: '120px',
                          marginLeft: '10px',
                          paddingBottom: '2px'
                        }}>
                          {name_of_supervisor}
                        </span>
                      </div>

                      {/* Signature */}
                      <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                        <span style={{ fontWeight: 'bold' }}>Signature:</span>
                        <span style={{
                          borderBottom: '1px solid #000',
                          display: 'inline-block',
                          minWidth: '120px',
                          marginLeft: '10px',
                          paddingBottom: '2px',
                          position: 'relative'
                        }}>
                          <img
                            src={nuru_signature}
                            alt="Signature"
                            style={{
                              position: 'absolute',
                              bottom: '0',
                              left: '0',
                              width: '120px',
                              height: 'auto',
                              maxHeight: '40px'
                            }}
                          />
                        </span>
                      </div>

                      {/* Stamp */}
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: 'bold' }}>Stamp:</span>
                        <span style={{
                          borderBottom: '1px solid #000',
                          display: 'inline-block',
                          minWidth: '90px',
                          marginLeft: '10px',
                          paddingBottom: '2px'
                        }}></span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Note */}
                <div style={{ marginTop: '12px', fontWeight: 'bold' }}>
                  N.B. The Bearer of this slip must present Zemen Bank's ID!
                </div>
              </div>

            </CCardBody>
          </CCard>
        </motion.div>
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

export default MedicalSlip;

 
