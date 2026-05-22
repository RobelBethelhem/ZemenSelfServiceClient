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
import { cilCheckCircle, cilX, cilUser, cilBuilding, cilPencil, cilWarning } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, Info, Globe2, Keyboard } from 'lucide-react';
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

// Language Warning Component
const LanguageWarning = ({ show, fieldName, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="position-fixed"
          style={{
            top: '20px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '400px'
          }}
        >
          <div 
            className="rounded-4 shadow-lg overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8787 100%)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <motion.div
              className="position-absolute w-100 h-100"
              style={{
                background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                transform: 'translateX(-100%)'
              }}
              animate={{
                transform: ['translateX(-100%)', 'translateX(100%)']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            
            <div className="p-4 text-white position-relative">
              <div className="d-flex align-items-start">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                  className="me-3"
                >
                  <AlertCircle size={32} />
                </motion.div>
                
                <div className="flex-grow-1">
                  <h6 className="mb-2 fw-bold">እባክዎ የአማርኛ ፊደላት ብቻ ይጠቀሙ!</h6>
                  <p className="mb-2 small opacity-90">
                    በ<strong>{fieldName}</strong> መስክ ውስጥ የእንግሊዝኛ ፊደላት አግኝተናል።
                  </p>
                  <p className="mb-0 small">
                    ይህ ቅጽ የአማርኛ ቋንቋ ብቻ ይቀበላል። የእንግሊዝኛ ስሪት ከፈለጉ እባክዎ ተመለሱ።
                  </p>


                   <div className="d-flex gap-2 mt-3">
                                      <motion.button
                                        className="btn btn-sm btn-light mt-3"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                      >
                                        ገባኝ
                                      </motion.button>
                                      <motion.button
                                        className="btn btn-sm btn-outline-dark"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => window.history.back()}
                                      >
                                        ወደ ኋላ ተመለስ!
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

// Info Banner Component
const AmharicInfoBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-4"
    >
      <div 
        className="rounded-3 p-3 position-relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <motion.div
          className="position-absolute"
          style={{
            width: '100px',
            height: '100px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            top: '-50px',
            right: '-50px'
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="d-flex align-items-center text-white position-relative">
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="me-3"
          >
            <Info size={24} />
          </motion.div>
          
          <div className="flex-grow-1">
            <h6 className="mb-1 fw-bold">
              ⚠️ ይህ ቅጽ የአማርኛ ቋንቋ ብቻ ይቀበላል
            </h6>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="mb-2 mt-2 small opacity-90">
                    📝 ሁሉም መስኮች በአማርኛ ፊደላት መሞላት አለባቸው
                  </p>
                  <p className="mb-2 small opacity-90">
                    🌍 የእንግሊዝኛ ቅጹን ከፈለጉ፣ ተመልሰው የቋንቋ አማራጭን ይቀይሩ
                  </p>
                  <p className="mb-0 small opacity-90">
                    ⌨️ የአማርኛ ኪቦርድ ከሌለዎት፣ የኦንላይን አማርኛ ኪቦርድ መጠቀም ይችላሉ
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="ms-2"
          >
            <span style={{ fontSize: '20px' }}>
              {isExpanded ? '⬆️' : '⬇️'}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const SupportiveLetterAmharic = () => {
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

  // Validation function to check if text is in Amharic
  const isAmharicText = (text) => {
    // Allow empty strings
    if (!text || text.trim() === '') return true;
    
    // Amharic Unicode range: U+1200 to U+137F
    // Also allow spaces, numbers, and common punctuation
    const amharicRegex = /^[\u1200-\u137F\s\d።፤፥፦፧፨፩፪፫፬፭፮፯፰፱፲፳፴፵፶፷፸፹፺፻፼\-_.,!?()]+$/;
    return amharicRegex.test(text);
  };

  // Get field label in Amharic
  const getFieldLabel = (fieldId) => {
    const labels = {
      employee_first_name: 'ስም',
      employee_middle_name: 'የአባት ስም',
      employee_last_name: 'የአያት ስም',
      employee_organazation: 'የድርጅት ስም',
      employee_organization_location: 'የድርጅት አድራሻ',
      employee_description: 'አጭር መግለጫ'
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
    
    // Check if the input is in Amharic
    if (!isAmharicText(value)) {
      setValidationErrors(prev => ({
        ...prev,
        [id]: `እባክዎ በ${getFieldLabel(id)} መስክ የአማርኛ ፊደላት ብቻ ይጠቀሙ`
      }));
      setWarningField(getFieldLabel(id));
      setShowWarning(true);
      
      // Auto-hide warning after 5 seconds
      setTimeout(() => setShowWarning(false), 5000);
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
      if (formData[key] && !isAmharicText(formData[key])) {
        errors[key] = `እባክዎ በ${getFieldLabel(key)} መስክ የአማርኛ ፊደላት ብቻ ይጠቀሙ`;
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
        message: 'እባክዎ ሁሉንም መስኮች በአማርኛ ይሙሉ!'
      });
      setShowWarning(true);
      return;
    }
    
    setIsLoading(true);
    setStatus(null);
    setProgress(0);
  
    try {
      const response = await fetch(`${API_BASE}/supportive/register_request_supportive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
        body: JSON.stringify({
          ...formData,
          language: 'amharic'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'የሆነ ችግር ተፈጥሯል');
      }

      const data = await response.json();
      setStatus({ 
        type: 'success', 
        message: data.message || 'የደጋፊ ደብዳቤ ጥያቄ በተሳካ ሁኔታ ቀርቧል!' 
      });
      resetForm();
    } catch (error) {
      console.error('Error submitting request:', error);
      setStatus({ 
        type: 'danger', 
        message: error.message || 'ጥያቄ ማስገባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።' 
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
        <span className="badge bg-success px-3 py-2" style={{ fontSize: '1rem' }}>
          🇪🇹 አማርኛ ስሪት
        </span>
      </motion.div>

      {/* Info Banner */}
      <AmharicInfoBanner />

      <CCard className="mb-4 shadow-lg">
        <CCardHeader className="bg-primary text-white">
          <InfiniteScrollText text="የደጋፊ ደብዳቤ ጥያቄ ቅጽ" />
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
                  የግል መረጃ
                </h5>
              </AnimatedFormGroup>
              
              <CRow>
                <CCol md={4}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_first_name">ስም</CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_first_name"
                        value={formData.employee_first_name}
                        onChange={handleInputChange}
                        placeholder="ስም ያስገቡ"
                        required
                        className={`shadow-sm ${validationErrors.employee_first_name ? 'is-invalid' : ''}`}
                      />
                      {validationErrors.employee_first_name && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback"
                        >
                          {validationErrors.employee_first_name}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
                <CCol md={4}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_middle_name">የአባት ስም</CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_middle_name"
                        value={formData.employee_middle_name}
                        onChange={handleInputChange}
                        placeholder="የአባት ስም ያስገቡ"
                        className={`shadow-sm ${validationErrors.employee_middle_name ? 'is-invalid' : ''}`}
                      />
                      {validationErrors.employee_middle_name && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback"
                        >
                          {validationErrors.employee_middle_name}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
                <CCol md={4}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_last_name">የአያት ስም</CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_last_name"
                        value={formData.employee_last_name}
                        onChange={handleInputChange}
                        placeholder="የአያት ስም ያስገቡ"
                        required
                        className={`shadow-sm ${validationErrors.employee_last_name ? 'is-invalid' : ''}`}
                      />
                      {validationErrors.employee_last_name && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback"
                        >
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
                  የድርጅት መረጃ
                </h5>
              </AnimatedFormGroup>
              
              <CRow>
                <CCol md={6}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_organazation">የድርጅት ስም</CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_organazation"
                        value={formData.employee_organazation}
                        onChange={handleInputChange}
                        placeholder="የድርጅት ስም ያስገቡ"
                        required
                        className={`shadow-sm ${validationErrors.employee_organazation ? 'is-invalid' : ''}`}
                      />
                      {validationErrors.employee_organazation && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback"
                        >
                          {validationErrors.employee_organazation}
                        </motion.div>
                      )}
                    </motion.div>
                  </AnimatedFormGroup>
                </CCol>
                <CCol md={6}>
                  <AnimatedFormGroup delay={delayIncrement += 0.1}>
                    <CFormLabel htmlFor="employee_organization_location">የድርጅት አድራሻ</CFormLabel>
                    <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                      <CFormInput
                        type="text"
                        id="employee_organization_location"
                        value={formData.employee_organization_location}
                        onChange={handleInputChange}
                        placeholder="የድርጅት አድራሻ ያስገቡ"
                        required
                        className={`shadow-sm ${validationErrors.employee_organization_location ? 'is-invalid' : ''}`}
                      />
                      {validationErrors.employee_organization_location && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="invalid-feedback"
                        >
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
                  ተጨማሪ መረጃ
                </h5>
              </AnimatedFormGroup>
              
              <AnimatedFormGroup delay={delayIncrement += 0.1}>
                <CFormLabel htmlFor="employee_description">አጭር መግለጫ</CFormLabel>
                <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                  <CFormTextarea
                    id="employee_description"
                    rows="4"
                    value={formData.employee_description}
                    onChange={handleInputChange}
                    placeholder="ለምን የደጋፊ ደብዳቤ እንደሚፈልጉ አጭር መግለጫ ይስጡ"
                    required
                    className={`shadow-sm ${validationErrors.employee_description ? 'is-invalid' : ''}`}
                  />
                  {validationErrors.employee_description && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="invalid-feedback"
                    >
                      {validationErrors.employee_description}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatedFormGroup>

              <AnimatedFormGroup delay={delayIncrement += 0.1}>
                <div className="d-flex justify-content-end mt-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CButton 
                      type="submit" 
                      color="primary" 
                      disabled={isLoading || Object.keys(validationErrors).length > 0}
                      className={`px-4 ${isLoading ? 'position-relative' : ''}`}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          እየተላከ ነው...
                        </>
                      ) : (
                        'ጥያቄ ላክ'
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
              <CProgress className="mt-3" animated value={progress} />
            </motion.div>
          )}
        </CCardBody>
      </CCard>
    </motion.div>
  );
};

export default SupportiveLetterAmharic;