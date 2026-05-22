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
import { cilCheckCircle, cilX, cilUser, cilBriefcase, cilLocationPin } from '@coreui/icons';
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

const GuarantyLetterRequestForm = () => {

    const user = useSelector(state => state.user);
    const accessToken = user.accessToken;


  const [formData, setFormData] = useState({
    employee_first_name: '',
    employee_middle_name: '',
    employee_last_name: '',
    employee_description: '',
    guaranty_first_name: '',
    guaranty_middle_name: '',
    guaranty_last_name: '',
    guaranty_organazation: '',
    employee_organization_location: '',
    guaranty_organazation_cities: '',
  });

  const [errors, setErrors] = useState({
    employee_first_name: '',
    employee_middle_name: '',
    employee_last_name: '',
    employee_description: '',
    guaranty_first_name: '',
    guaranty_middle_name: '',
    guaranty_last_name: '',
    guaranty_organazation: '',
    guaranty_organazation_cities: '',
    employee_organization_location: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);

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


  const validateStep1 = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.employee_first_name.trim()) {
      newErrors.employee_first_name = 'First name is required';
      isValid = false;
    }

    if (!formData.employee_last_name.trim()) {
      newErrors.employee_last_name = 'Last name is required';
      isValid = false;
    }
    if (!formData.employee_middle_name.trim()) {
        newErrors.employee_middle_name = 'Middle name is required';
        isValid = false;
      }

    setErrors(newErrors);
    return isValid;
  };


  const validateStep2 = () => {
    const newErrors = {};
    let isValid = true;

    const requiredFields = [
      'guaranty_first_name',
      'guaranty_middle_name',
      'guaranty_last_name',
      'guaranty_organazation',
      'employee_organization_location',
      'guaranty_organazation_cities'
    ];

    requiredFields.forEach(field => {
      if (!formData[field].trim()) {
        newErrors[field] = `${field.split('_').join(' ')} is required`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    if (errors[id]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [id]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Keep this to prevent default form submission behavior if needed, though it shouldn't be necessary now.
    setIsLoading(true);
    setStatus(null);
    setProgress(0);

    try {
      const response = await fetch(`${API_BASE}/guaranty/register_request_guaranty`, {
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
        message: data.message || 'Guaranty Letter Request submitted successfully!'
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
        guaranty_first_name: '',
        guaranty_middle_name: '',
        guaranty_last_name: '',
        guaranty_organazation: '',
        employee_organization_location: '',
        guaranty_organazation_cities: ''
    });
    setErrors({});
    setCurrentStep(1);
    if (formRef.current) {
      formRef.current.reset();
    }
  };


  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;

    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const prevStep = () => {
    setDirection(-1);
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };


  const formVariants = {
    hidden: (direction) => {
      const rotateDirection = direction > 0 ? -90 : 90;
      return {
        opacity: 0,
        rotateY: rotateDirection,
        x: direction > 0 ? 200 : -200,
        transformOrigin: "center",
        transition: { duration: 0.4, ease: "easeInOut" },
      };
    },
    visible: {
      opacity: 1,
      rotateY: 0,
      x: 0,
      transition: {
        duration: 0.6,
        type: "spring",
        stiffness: 50,
        damping: 12,
      },
    },
    exit: (direction) => {
      const rotateDirection = direction > 0 ? 90 : -90;
      return {
        opacity: 0,
        rotateY: rotateDirection,
        x: direction > 0 ? -200 : 200,
        transformOrigin: "center",
        transition: { duration: 1, ease: "easeInOut" },
      };
    },
  };


  const renderFormInput = (id, label, required = false) => (
    <div className="mb-3">
      <CFormLabel htmlFor={id}>{label}{required && <span className="text-danger">*</span>}</CFormLabel>
      <CFormInput
        type="text"
        id={id}
        value={formData[id]}
        onChange={handleInputChange}
        invalid={!!errors[id]}
        className="shadow-sm"
      />
      {errors[id] && <div className="invalid-feedback">{errors[id]}</div>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <CCard className="shadow-lg border-0">
        <CCardHeader className="bg-primary text-white">
          <h4 className="mb-0">Guaranty Letter Request</h4>
          <InfiniteScrollText text="Fill out the form below to request a guaranty letter. All fields marked with * are required." />
        </CCardHeader>
        <CCardBody>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <CAlert color={status.type} className="d-flex align-items-center">
                <CIcon icon={status.type === 'success' ? cilCheckCircle : cilX} className="me-2" />
                {status.message}
              </CAlert>
            </motion.div>
          )}

          <CForm ref={formRef}> {/* Removed onSubmit={handleSubmit} from here */}
            <AnimatePresence mode="wait" custom={direction}>
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={direction}
                  style={{ perspective: 600 }}
                >
                  <CRow className="mb-4">
                    <CCol xs={12}>
                      <h5 className="mb-3">
                        <CIcon icon={cilUser} className="me-2" />
                        Employee Information
                      </h5>
                    </CCol>
                    <CCol md={4}>
                      {renderFormInput('employee_first_name', 'First Name', true)}
                    </CCol>
                    <CCol md={4}>
                      {renderFormInput('employee_middle_name', 'Middle Name', true)}
                    </CCol>
                    <CCol md={4}>
                      {renderFormInput('employee_last_name', 'Last Name', true)}
                    </CCol>
                    <CCol xs={12} className="mt-3">
                      <CFormLabel htmlFor="employee_description">Short Description</CFormLabel>
                      <CFormTextarea
                        id="employee_description"
                        rows="3"
                        value={formData.employee_description}
                        onChange={handleInputChange}
                        placeholder="Short description (Optional)"
                        className="shadow-sm"
                      />
                    </CCol>
                  </CRow>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  custom={direction}
                  style={{ perspective: 600 }}
                >
                  <CRow className="mb-4">
                    <CCol xs={12}>
                      <h5 className="mb-3">
                        <CIcon icon={cilBriefcase} className="me-2" />
                        Guaranty Information
                      </h5>
                    </CCol>
                    <CCol md={3}>
                      {renderFormInput('guaranty_first_name', 'First Name', true)}
                    </CCol>
                    <CCol md={3}>
                      {renderFormInput('guaranty_middle_name', 'Middle Name', true)}
                    </CCol>
                    <CCol md={3}>
                      {renderFormInput('guaranty_last_name', 'Last Name', true)}
                    </CCol>
                    <CCol md={3}>
                      {renderFormInput('guaranty_organazation', 'Organization', true)}
                    </CCol>
                  </CRow>

                  <CRow className="mb-4">
                    <CCol xs={12}>
                      <h5 className="mb-3">
                        <CIcon icon={cilLocationPin} className="me-2" />
                        Organization Address
                      </h5>
                    </CCol>
                    <CCol md={6}>
                      {renderFormInput('employee_organization_location', 'Organization Address', true)}
                    </CCol>
                    <CCol md={6}>
                      {renderFormInput('guaranty_organazation_cities', 'Organization Cities', true)}
                    </CCol>
                  </CRow>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="d-flex justify-content-between mt-4">
              {currentStep > 1 && (
                <CButton
                  onClick={prevStep}
                  color="secondary"
                  className="px-4"
                  type="button" // Added type="button" to prevent form submission
                >
                  Previous
                </CButton>
              )}
              <div className="ms-auto">
                {currentStep < 2 ? (
                  <CButton
                    onClick={nextStep}
                    color="primary"
                    className="px-4"
                    type="button" // Added type="button" to prevent form submission
                  >
                    Next
                  </CButton>
                ) : (
                  <CButton
                    type="submit" // Keep type="submit" for the submit button
                    color="success"
                    disabled={isLoading}
                    className={`px-4 ${isLoading ? 'position-relative' : ''}`}
                    onClick={handleSubmit} // Call handleSubmit on click for the submit button
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
                )}
              </div>
            </div>
          </CForm>

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

export default GuarantyLetterRequestForm;