import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CButton,
  CAlert,
  CProgress,
} from '@coreui/react';
import { cilCheckCircle, cilX, cilUser, cilBuilding, cilPencil, cilLocationPin } from '@coreui/icons';
import CIcon from '@coreui/icons-react';

import { useDispatch, useSelector } from 'react-redux';
import { API_BASE } from '../../../api/base';

const InfiniteScrollText = ({ text }) => {
  const controls = useAnimationControls();
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);

  useEffect(() => {
    if (containerRef.current) {
      setContainerWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    const textElement = document.createElement('span');
    textElement.style.visibility = 'hidden';
    textElement.style.position = 'absolute';
    textElement.style.whiteSpace = 'nowrap';
    textElement.innerText = text;
    document.body.appendChild(textElement);
    setTextWidth(textElement.offsetWidth);
    document.body.removeChild(textElement);
  }, [text]);

  useEffect(() => {
    if (containerWidth > 0 && textWidth > 0) {
      controls.start({
        x: [-textWidth, containerWidth],
        transition: {
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        },
      });
    }
  }, [controls, containerWidth, textWidth]);

  return (
    <div ref={containerRef} className="scroll-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
      <motion.div
        animate={controls}
        style={{ display: 'inline-block' }}
      >
        <span>{text}</span>
      </motion.div>
    </div>
  );
};

const Experiance_Letter = () => {

  const user = useSelector(state => state.user);
  const accessToken = user.accessToken;


  const [formData, setFormData] = useState({
    employee_first_name: '',
    employee_middle_name: '',
    employee_last_name: '',
    employee_description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  const formRef = useRef(null);

  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress === 100) {
            clearInterval(timer);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 200);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isLoading]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus(null);
    setProgress(0);
  
    try {
      const response = await fetch(`${API_BASE}/experiance/register_request_experiance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();
      setStatus({ 
        type: 'success', 
        message: data.message || 'Employee Experience Request submitted successfully!' 
      });
      resetForm();
    } catch (error) {
      console.error('Error submitting request:', error);
      setStatus({ 
        type: 'danger', 
        message: error.message || 'Failed to submit request. Please try again.' 
      });
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };






  const resetForm = () => {
    setFormData({
      employee_first_name: '',
      employee_middle_name: '',
      employee_last_name: '',
      employee_description: '',
    });
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <CCard className="mb-4 shadow-lg">
        <CCardHeader className="bg-primary text-white">
          <InfiniteScrollText text="Zemen Bank Experience Letter Request Form" />
        </CCardHeader>
        <CCardBody>
          <AnimatePresence mode="wait">
            <motion.div
              key={status ? 'alert' : 'no-alert'}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {status && (
                <CAlert color={status.type === 'success' ? 'success' : 'danger'} className="d-flex align-items-center">
                  <CIcon icon={status.type === 'success' ? cilCheckCircle : cilX} className="flex-shrink-0 me-2" width={24} height={24} />
                  <div>{status.message}</div>
                </CAlert>
              )}
            </motion.div>
          </AnimatePresence>
          
          <motion.div
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <CForm onSubmit={handleSubmit} ref={formRef}>
              <CRow className="mb-4">
                <CCol xs={12}>
                  <h5 className="mb-3">
                    <CIcon icon={cilUser} className="me-2" />
                    Personal Information
                  </h5>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="employee_first_name">First Name</CFormLabel>
                  <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                    <CFormInput
                      type="text"
                      id="employee_first_name"
                      value={formData.employee_first_name}
                      onChange={handleInputChange}
                      placeholder="Enter first name"
                      required
                      className="shadow-sm"
                    />
                  </motion.div>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="employee_middle_name">Middle Name</CFormLabel>
                  <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                    <CFormInput
                      type="text"
                      id="employee_middle_name"
                      value={formData.employee_middle_name}
                      onChange={handleInputChange}
                      placeholder="Enter middle name"
                      className="shadow-sm"
                    />
                  </motion.div>
                </CCol>
                <CCol md={4}>
                  <CFormLabel htmlFor="employee_last_name">Last Name</CFormLabel>
                  <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                    <CFormInput
                      type="text"
                      id="employee_last_name"
                      value={formData.employee_last_name}
                      onChange={handleInputChange}
                      placeholder="Enter last name"
                      required
                      className="shadow-sm"
                    />
                  </motion.div>
                </CCol>
              </CRow>



              <CRow className="mb-4">
                <CCol xs={12}>
                  <h5 className="mb-3">
                    <CIcon icon={cilPencil} className="me-2" />
                    Additional Information
                  </h5>
                </CCol>
                <CCol xs={12}>
                  <CFormLabel htmlFor="employee_description">Short Description</CFormLabel>
                  <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                    <CFormTextarea
                      id="employee_description"
                      rows="4"
                      value={formData.employee_description}
                      onChange={handleInputChange}
                      placeholder="Provide a short description of why you're requesting a supportive letter"
                      required
                      className="shadow-sm"
                    />
                  </motion.div>
                </CCol>
              </CRow>

              <div className="d-flex justify-content-end mt-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CButton 
                    type="submit" 
                    color="primary" 
                    disabled={isLoading}
                    className={`px-4 ${isLoading ? 'position-relative' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </CButton>
                </motion.div>
              </div>
            </CForm>
          </motion.div>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CProgress className="mt-3" animated value={progress} />
            </motion.div>
          )}
        </CCardBody>
      </CCard>
    </motion.div>
  );
};

export default Experiance_Letter;
