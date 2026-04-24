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
import { AlertTriangle, Info, Globe, Languages } from 'lucide-react';

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

const AnimatedFormGroup = ({ children, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 12,
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
};

// Language Warning Component for English
const LanguageWarning = ({ show, fieldName, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '420px'
          }}
        >
          <div 
            className="rounded-4 shadow-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
              padding: '2px'
            }}
          >
            <div 
              className="rounded-4 bg-white p-4"
              style={{
                background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)'
              }}
            >
              <motion.div
                className="position-absolute"
                style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255,255,255,0.3)',
                  borderRadius: '50%',
                  top: '-30px',
                  right: '-30px',
                  filter: 'blur(20px)'
                }}
                animate={{
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              <div className="d-flex align-items-start text-dark position-relative">
                <motion.div
                  animate={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 0.5, 
                    repeat: Infinity, 
                    repeatDelay: 3 
                  }}
                  className="me-3"
                >
                  <AlertTriangle size={32} className="text-warning" />
                </motion.div>
                
                <div className="flex-grow-1">
                  <h6 className="mb-2 fw-bold text-dark">
                    English Characters Only! 🇬🇧
                  </h6>
                  <p className="mb-2 small text-dark opacity-90">
                    We detected Amharic characters in the <strong>{fieldName}</strong> field.
                  </p>
                  <p className="mb-2 small text-dark opacity-75">
                    This form accepts English language only. If you need the Amharic version, please go back and select Amharic.
                  </p>
                  
                  <div className="d-flex gap-2 mt-3">
                    <motion.button
                      className="btn btn-sm btn-dark"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                    >
                      Got it!
                    </motion.button>
                    <motion.button
                      className="btn btn-sm btn-outline-dark"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.history.back()}
                    >
                      Switch to Amharic
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Info Banner Component for English
const EnglishInfoBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring" }}
      className="mb-4"
    >
      <div 
        className="rounded-3 p-3 position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.3)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Animated background elements */}
        <motion.div
          className="position-absolute"
          style={{
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 70%)',
            borderRadius: '50%',
            top: '-75px',
            left: '-75px',
            filter: 'blur(20px)'
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div
          className="position-absolute"
          style={{
            width: '80px',
            height: '80px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            bottom: '-40px',
            right: '30px'
          }}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="d-flex align-items-center text-white position-relative">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="me-3"
          >
            <Languages size={28} />
          </motion.div>
          
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold d-flex align-items-center">
              <span className="me-2">📝</span>
              This Form Accepts English Language Only
              <motion.span 
                className="ms-2"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                🇬🇧
              </motion.span>
            </h6>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="mt-3"
                >
                  <div className="bg-white bg-opacity-10 rounded-2 p-2">
                    <p className="mb-2 small">
                      ✅ All fields must be filled in English characters
                    </p>
                    <p className="mb-2 small">
                      🌍 For Amharic version, please go back and select አማርኛ
                    </p>
                    <p className="mb-2 small">
                      ⚠️ Amharic characters will be detected and rejected
                    </p>
                    <p className="mb-0 small">
                      💡 Use standard English alphabet (A-Z, a-z) and numbers
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="ms-2"
          >
            <span style={{ fontSize: '24px' }}>
              {isExpanded ? '⬆️' : '⬇️'}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const SupportiveLetterEnglish = () => {
  const user = useSelector(state => state.user);
  const accessToken = user.accessToken;

  const [formData, setFormData] = useState({
    employee_first_name: '',
    employee_middle_name: '',
    employee_last_name: '',
    employee_organazation: '',
    employee_organization_location: '',
    employee_description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const [showWarning, setShowWarning] = useState(false);
  const [warningField, setWarningField] = useState('');

  const formRef = useRef(null);

  let delayIncrement = 0.1;

  // Validation function to check if text is in English
  const isEnglishText = (text) => {
    // Allow empty strings
    if (!text || text.trim() === '') return true;
    
    // Check for Amharic characters (U+1200 to U+137F)
    const amharicRegex = /[\u1200-\u137F]/;
    
    // If contains Amharic, it's not valid
    if (amharicRegex.test(text)) {
      return false;
    }
    
    // Allow English letters, numbers, spaces, and common punctuation
    const englishRegex = /^[a-zA-Z0-9\s\-_.,!?()'"/@#$%&*+=;:]+$/;
    return englishRegex.test(text);
  };

  // Get field label
  const getFieldLabel = (fieldId) => {
    const labels = {
      employee_first_name: 'First Name',
      employee_middle_name: 'Middle Name',
      employee_last_name: 'Last Name',
      employee_organazation: 'Organization Name',
      employee_organization_location: 'Organization Location',
      employee_description: 'Description'
    };
    return labels[fieldId] || fieldId;
  };

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
    
    // Check if the input is in English
    if (!isEnglishText(value)) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: `Please use English characters only in the ${getFieldLabel(id)} field`
      }));
      setWarningField(getFieldLabel(id));
      setShowWarning(true);
      
      // Auto-hide warning after 6 seconds
      setTimeout(() => setShowWarning(false), 6000);
    } else {
      // Clear error for this field if valid
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
    
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    Object.keys(formData).forEach(key => {
      if (formData[key] && !isEnglishText(formData[key])) {
        errors[key] = `Please use English characters only in the ${getFieldLabel(key)} field`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateForm()) {
      setStatus({
        type: 'danger',
        message: 'Please fill all fields with English characters only!'
      });
      setShowWarning(true);
      return;
    }
    
    setIsLoading(true);
    setStatus(null);
    setProgress(0);
  
    try {
      const response = await fetch('https://aps2.zemenbank.com/zbss/api/supportive/register_request_supportive', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
        body: JSON.stringify({
          ...formData,
          language: 'english'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();
      setStatus({ 
        type: 'success', 
        message: data.message || 'Supportive Letter Request submitted successfully!' 
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
      employee_organazation: '',
      employee_organization_location: '',
      employee_description: '',
    });
    setValidationErrors({});
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
      {/* Language Warning Toast */}
      <LanguageWarning 
        show={showWarning} 
        fieldName={warningField}
        onClose={() => setShowWarning(false)}
      />

      {/* Language Badge */}
      <motion.div 
        className="text-center mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <motion.span 
          className="badge bg-primary px-4 py-2 shadow" 
          style={{ fontSize: '1rem' }}
          animate={{
            boxShadow: [
              '0 4px 6px rgba(0,0,0,0.1)',
              '0 8px 12px rgba(0,0,0,0.2)',
              '0 4px 6px rgba(0,0,0,0.1)'
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          🇬🇧 English Version
        </motion.span>
      </motion.div>

      {/* Info Banner */}
      <EnglishInfoBanner />

      <CCard className="mb-4 shadow-lg">
        <CCardHeader className="bg-primary text-white">
          <InfiniteScrollText text="Supportive Letter Request Form" />
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
              <AnimatedFormGroup delay={delayIncrement}>
                <h5 className="mb-3">
                  <CIcon icon={cilUser} className="me-2" />
                  Personal Information
                </h5>
              </AnimatedFormGroup>
              
              <CRow>
                <CCol md={4}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_first_name">
                      First Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_first_name"
                        value={formData.employee_first_name}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        required
                        className={`shadow-sm ${validationErrors.employee_first_name ? 'is-invalid' : ''}`}
                        style={{
                          borderColor: validationErrors.employee_first_name ? '#ff6b6b' : '',
                          backgroundColor: validationErrors.employee_first_name ? '#fff5f5' : ''
                        }}
                      />
                      {validationErrors.employee_first_name && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback d-flex align-items-center"
                        >
                          <AlertTriangle size={14} className="me-1" />
                          {validationErrors.employee_first_name}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
                <CCol md={4}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_middle_name">Middle Name</CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_middle_name"
                        value={formData.employee_middle_name}
                        onChange={handleInputChange}
                        placeholder="Enter middle name"
                        className={`shadow-sm ${validationErrors.employee_middle_name ? 'is-invalid' : ''}`}
                        style={{
                          borderColor: validationErrors.employee_middle_name ? '#ff6b6b' : '',
                          backgroundColor: validationErrors.employee_middle_name ? '#fff5f5' : ''
                        }}
                      />
                      {validationErrors.employee_middle_name && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback d-flex align-items-center"
                        >
                          <AlertTriangle size={14} className="me-1" />
                          {validationErrors.employee_middle_name}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
                <CCol md={4}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_last_name">
                      Last Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_last_name"
                        value={formData.employee_last_name}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        required
                        className={`shadow-sm ${validationErrors.employee_last_name ? 'is-invalid' : ''}`}
                        style={{
                          borderColor: validationErrors.employee_last_name ? '#ff6b6b' : '',
                          backgroundColor: validationErrors.employee_last_name ? '#fff5f5' : ''
                        }}
                      />
                      {validationErrors.employee_last_name && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback d-flex align-items-center"
                        >
                          <AlertTriangle size={14} className="me-1" />
                          {validationErrors.employee_last_name}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
              </CRow>

              <AnimatedFormGroup delay={delayIncrement += 0.1}>
                <h5 className="mb-3 mt-4">
                  <CIcon icon={cilBuilding} className="me-2" />
                  Organization Information
                </h5>
              </AnimatedFormGroup>
              
              <CRow>
                <CCol md={6}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_organazation">
                      Organization Name <span className="text-danger">*</span>
                    </CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_organazation"
                        value={formData.employee_organazation}
                        onChange={handleInputChange}
                        placeholder="Enter organization name"
                        required
                        className={`shadow-sm ${validationErrors.employee_organazation ? 'is-invalid' : ''}`}
                        style={{
                          borderColor: validationErrors.employee_organazation ? '#ff6b6b' : '',
                          backgroundColor: validationErrors.employee_organazation ? '#fff5f5' : ''
                        }}
                      />
                      {validationErrors.employee_organazation && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback d-flex align-items-center"
                        >
                          <AlertTriangle size={14} className="me-1" />
                          {validationErrors.employee_organazation}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
                <CCol md={6}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_organization_location">
                      Organization Location <span className="text-danger">*</span>
                    </CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_organization_location"
                        value={formData.employee_organization_location}
                        onChange={handleInputChange}
                        placeholder="Enter organization location"
                        required
                        className={`shadow-sm ${validationErrors.employee_organization_location ? 'is-invalid' : ''}`}
                        style={{
                          borderColor: validationErrors.employee_organization_location ? '#ff6b6b' : '',
                          backgroundColor: validationErrors.employee_organization_location ? '#fff5f5' : ''
                        }}
                      />
                      {validationErrors.employee_organization_location && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback d-flex align-items-center"
                        >
                          <AlertTriangle size={14} className="me-1" />
                          {validationErrors.employee_organization_location}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
              </CRow>

              <AnimatedFormGroup delay={delayIncrement += 0.1}>
                <h5 className="mb-3 mt-4">
                  <CIcon icon={cilPencil} className="me-2" />
                  Additional Information
                </h5>
              </AnimatedFormGroup>
              
              <AnimatedFormGroup delay={delayIncrement += 0.1}>
                <CFormLabel htmlFor="employee_description">
                  Short Description <span className="text-danger">*</span>
                </CFormLabel>
                <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                  <CFormTextarea
                    id="employee_description"
                    rows="4"
                    value={formData.employee_description}
                    onChange={handleInputChange}
                    placeholder="Provide a short description of why you're requesting a supportive letter"
                    required
                    className={`shadow-sm ${validationErrors.employee_description ? 'is-invalid' : ''}`}
                    style={{
                      borderColor: validationErrors.employee_description ? '#ff6b6b' : '',
                      backgroundColor: validationErrors.employee_description ? '#fff5f5' : ''
                    }}
                  />
                  {validationErrors.employee_description && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="invalid-feedback d-flex align-items-center"
                    >
                      <AlertTriangle size={14} className="me-1" />
                      {validationErrors.employee_description}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatedFormGroup>

              <AnimatedFormGroup delay={delayIncrement += 0.1}>
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted small"
                  >
                    <Info size={16} className="me-1" />
                    All fields marked with <span className="text-danger">*</span> are required
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CButton 
                      type="submit" 
                      color="primary" 
                      disabled={isLoading || Object.keys(validationErrors).length > 0}
                      className={`px-4 ${isLoading ? 'position-relative' : ''}`}
                      style={{
                        background: Object.keys(validationErrors).length > 0 
                          ? 'linear-gradient(135deg, #868e96 0%, #495057 100%)'
                          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                      }}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Request
                          {Object.keys(validationErrors).length > 0 && (
                            <motion.span
                              className="ms-2"
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ⚠️
                            </motion.span>
                          )}
                        </>
                      )}
                    </CButton>
                  </motion.div>
                </div>
              </AnimatedFormGroup>
            </CForm>
          </motion.div>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CProgress 
                className="mt-3" 
                animated 
                value={progress}
                style={{
                  background: 'linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%)'
                }}
              />
            </motion.div>
          )}
        </CCardBody>
      </CCard>
    </motion.div>
  );
};

export default SupportiveLetterEnglish;
