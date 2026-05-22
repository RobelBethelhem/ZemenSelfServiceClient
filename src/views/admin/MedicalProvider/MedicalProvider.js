import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormLabel,
  CFormInput,
  CButton,
  CAlert,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CBadge,
} from '@coreui/react';
import { cilCheckCircle, cilX, cilPencil, cilTrash, cilPlus, cilBuilding } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
import { useSelector } from 'react-redux';
import { Building2, MapPin, Phone, Hash, AlertTriangle, Info } from 'lucide-react';
import { API_BASE } from '../../../api/base';

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

const MedicalProviderInfoBanner = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: "spring" }}
      className="mb-4"
    >
      <div 
        className="rounded-3 p-4 position-relative overflow-hidden shadow-sm"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.3)'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
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
            <Building2 size={32} />
          </motion.div>
          
          <div className="flex-grow-1">
            <h5 className="mb-2 fw-bold d-flex align-items-center">
              <span className="me-2">🏥</span>
              Medical Provider Management
              <motion.span 
                className="ms-2"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ⚕️
              </motion.span>
            </h5>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="mt-3"
                >
                  <div className="bg-white bg-opacity-10 rounded-2 p-3">
                    <p className="mb-2">
                      ✅ Manage medical institutions and providers
                    </p>
                    <p className="mb-2">
                      🏥 Each provider has a unique short code
                    </p>
                    <p className="mb-2">
                      📍 Location and contact information required
                    </p>
                    <p className="mb-0">
                      💡 All fields are mandatory for registration
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
            <span style={{ fontSize: '28px' }}>
              {isExpanded ? '⬆️' : '⬇️'}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const MedicalProvider = () => {
  const user = useSelector(state => state.user);
  const accessToken = user.accessToken;
  const userRole = user.role;

  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [status, setStatus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentProvider, setCurrentProvider] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    short_code: '',
    medical_institution: '',
    location: '',
    telephone_no: '',
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setIsFetching(true);
    try {
      const response = await fetch(`${API_BASE}/medical-provider/get_all_medical_providers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch providers');
      }

      const data = await response.json();
      setProviders(data.data || []);
    } catch (error) {
      console.error('Error fetching providers:', error);
      setStatus({ 
        type: 'danger', 
        message: 'Failed to fetch medical providers. Please try again.' 
      });
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
    // Clear validation error for this field
    if (validationErrors[id]) {
      setValidationErrors(prev => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.short_code || formData.short_code.trim() === '') {
      errors.short_code = 'Short code is required';
    }
    if (!formData.medical_institution || formData.medical_institution.trim() === '') {
      errors.medical_institution = 'Medical institution name is required';
    }
    if (!formData.location || formData.location.trim() === '') {
      errors.location = 'Location is required';
    }
    if (!formData.telephone_no || formData.telephone_no.trim() === '') {
      errors.telephone_no = 'Telephone number is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus({
        type: 'danger',
        message: 'Please fill all required fields!'
      });
      return;
    }
    
    setIsLoading(true);
    setStatus(null);

    try {
      const url = isEditMode 
        ? `${API_BASE}/medical-provider/update_medical_provider`
        : `${API_BASE}/medical-provider/register_medical_provider`;
      
      const body = isEditMode 
        ? { ...formData, id: currentProvider._id }
        : formData;

      const response = await fetch(url, {
        method: isEditMode ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const data = await response.json();
      setStatus({ 
        type: 'success', 
        message: data.message || `Medical Provider ${isEditMode ? 'updated' : 'created'} successfully!`
      });
      
      resetForm();
      setShowModal(false);
      fetchProviders();
    } catch (error) {
      console.error('Error submitting provider:', error);
      setStatus({ 
        type: 'danger', 
        message: error.message || 'Failed to submit. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (provider) => {
    setIsEditMode(true);
    setCurrentProvider(provider);
    setFormData({
      short_code: provider.short_code,
      medical_institution: provider.medical_institution,
      location: provider.location,
      telephone_no: provider.telephone_no,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this provider?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/medical-provider/delete_medical_provider/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete provider');
      }

      setStatus({ 
        type: 'success', 
        message: 'Medical Provider deleted successfully!'
      });
      fetchProviders();
    } catch (error) {
      console.error('Error deleting provider:', error);
      setStatus({ 
        type: 'danger', 
        message: 'Failed to delete provider. Please try again.' 
      });
    }
  };

  const resetForm = () => {
    setFormData({
      short_code: '',
      medical_institution: '',
      location: '',
      telephone_no: '',
    });
    setValidationErrors({});
    setIsEditMode(false);
    setCurrentProvider(null);
  };

  const handleAddNew = () => {
    resetForm();
    setShowModal(true);
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
      {/* Badge */}
      <motion.div 
        className="text-center mb-3"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <motion.span 
          className="badge px-5 py-3 shadow" 
          style={{ 
            fontSize: '1.3rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
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
          🏥 Medical Provider Management
        </motion.span>
      </motion.div>

      {/* Info Banner */}
      <MedicalProviderInfoBanner />

      {/* Alert */}
      <AnimatePresence mode="wait">
        {status && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CAlert 
              color={status.type === 'success' ? 'success' : 'danger'} 
              className="d-flex align-items-center mb-4" 
              style={{ fontSize: '1.1rem' }}
              dismissible
              onClose={() => setStatus(null)}
            >
              <CIcon icon={status.type === 'success' ? cilCheckCircle : cilX} className="flex-shrink-0 me-2" width={28} height={28} />
              <div>{status.message}</div>
            </CAlert>
          </motion.div>
        )}
      </AnimatePresence>

      <CCard className="mb-4 shadow-lg">
        <CCardHeader 
          className="text-white d-flex justify-content-between align-items-center"
          style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
        >
          <h4 className="mb-0">
            <CIcon icon={cilBuilding} className="me-2" />
            Medical Providers List
          </h4>
          {userRole === 'admin' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <CButton 
                color="light" 
                onClick={handleAddNew}
                className="d-flex align-items-center"
              >
                <CIcon icon={cilPlus} className="me-2" />
                Add New Provider
              </CButton>
            </motion.div>
          )}
        </CCardHeader>
        <CCardBody className="p-4">
          {isFetching ? (
            <div className="text-center py-5">
              <CSpinner color="primary" />
              <p className="mt-3 text-muted">Loading providers...</p>
            </div>
          ) : providers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-5"
            >
              <Building2 size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No medical providers found</h5>
              <p className="text-muted">Click "Add New Provider" to get started</p>
            </motion.div>
          ) : (
            <div className="table-responsive">
              <CTable hover striped bordered>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell style={{ fontSize: '1rem' }}>
                      <Hash size={16} className="me-1" />
                      Short Code
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ fontSize: '1rem' }}>
                      <Building2 size={16} className="me-1" />
                      Medical Institution
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ fontSize: '1rem' }}>
                      <MapPin size={16} className="me-1" />
                      Location
                    </CTableHeaderCell>
                    <CTableHeaderCell style={{ fontSize: '1rem' }}>
                      <Phone size={16} className="me-1" />
                      Telephone
                    </CTableHeaderCell>
                    {userRole === 'admin' && (
                      <CTableHeaderCell className="text-center" style={{ fontSize: '1rem' }}>
                        Actions
                      </CTableHeaderCell>
                    )}
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {providers.map((provider, index) => (
                    <motion.tr
                      key={provider._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CTableDataCell>
                        <CBadge 
                          color="primary" 
                          className="px-3 py-2"
                          style={{ fontSize: '0.95rem' }}
                        >
                          {provider.short_code}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '1rem' }}>
                        {provider.medical_institution}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '1rem' }}>
                        {provider.location}
                      </CTableDataCell>
                      <CTableDataCell style={{ fontSize: '1rem' }}>
                        {provider.telephone_no}
                      </CTableDataCell>
                      {userRole === 'admin' && (
                        <CTableDataCell className="text-center">
                          <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <CButton 
                              color="info" 
                              size="sm" 
                              className="me-2"
                              onClick={() => handleEdit(provider)}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                          </motion.span>
                          <motion.span whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <CButton 
                              color="danger" 
                              size="sm"
                              onClick={() => handleDelete(provider._id)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </motion.span>
                        </CTableDataCell>
                      )}
                    </motion.tr>
                  ))}
                </CTableBody>
              </CTable>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Modal for Add/Edit */}
      <CModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        size="lg"
        backdrop="static"
      >
        <CModalHeader>
          <CModalTitle>
            <CIcon icon={cilBuilding} className="me-2" />
            {isEditMode ? 'Edit Medical Provider' : 'Add New Medical Provider'}
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm onSubmit={handleSubmit}>
            <CRow>
              <CCol md={6}>
                <AnimatedFormGroup delay={0.1}>
                  <CFormLabel htmlFor="short_code" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    <Hash size={18} className="me-1" />
                    Short Code <span className="text-danger">*</span>
                  </CFormLabel>
                  <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                    <CFormInput
                      type="text"
                      id="short_code"
                      value={formData.short_code}
                      onChange={handleInputChange}
                      placeholder="e.g., ST01, BLH"
                      className={`shadow-sm ${validationErrors.short_code ? 'is-invalid' : ''}`}
                      style={{ fontSize: '1.05rem', padding: '0.6rem' }}
                    />
                    {validationErrors.short_code && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="invalid-feedback d-flex align-items-center"
                      >
                        <AlertTriangle size={14} className="me-1" />
                        {validationErrors.short_code}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatedFormGroup>
              </CCol>

              <CCol md={6}>
                <AnimatedFormGroup delay={0.2}>
                  <CFormLabel htmlFor="telephone_no" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    <Phone size={18} className="me-1" />
                    Telephone Number <span className="text-danger">*</span>
                  </CFormLabel>
                  <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                    <CFormInput
                      type="text"
                      id="telephone_no"
                      value={formData.telephone_no}
                      onChange={handleInputChange}
                      placeholder="e.g., 011-618 7345/8819"
                      className={`shadow-sm ${validationErrors.telephone_no ? 'is-invalid' : ''}`}
                      style={{ fontSize: '1.05rem', padding: '0.6rem' }}
                    />
                    {validationErrors.telephone_no && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="invalid-feedback d-flex align-items-center"
                      >
                        <AlertTriangle size={14} className="me-1" />
                        {validationErrors.telephone_no}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatedFormGroup>
              </CCol>
            </CRow>

            <AnimatedFormGroup delay={0.3}>
              <CFormLabel htmlFor="medical_institution" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                <Building2 size={18} className="me-1" />
                Medical Institution <span className="text-danger">*</span>
              </CFormLabel>
              <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                <CFormInput
                  type="text"
                  id="medical_institution"
                  value={formData.medical_institution}
                  onChange={handleInputChange}
                  placeholder="Enter medical institution name"
                  className={`shadow-sm ${validationErrors.medical_institution ? 'is-invalid' : ''}`}
                  style={{ fontSize: '1.05rem', padding: '0.6rem' }}
                />
                {validationErrors.medical_institution && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="invalid-feedback d-flex align-items-center"
                  >
                    <AlertTriangle size={14} className="me-1" />
                    {validationErrors.medical_institution}
                  </motion.div>
                )}
              </motion.div>
            </AnimatedFormGroup>

            <AnimatedFormGroup delay={0.4}>
              <CFormLabel htmlFor="location" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                <MapPin size={18} className="me-1" />
                Location <span className="text-danger">*</span>
              </CFormLabel>
              <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
                <CFormInput
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Around 22 Mazoria in front of Awraris Hotel"
                  className={`shadow-sm ${validationErrors.location ? 'is-invalid' : ''}`}
                  style={{ fontSize: '1.05rem', padding: '0.6rem' }}
                />
                {validationErrors.location && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="invalid-feedback d-flex align-items-center"
                  >
                    <AlertTriangle size={14} className="me-1" />
                    {validationErrors.location}
                  </motion.div>
                )}
              </motion.div>
            </AnimatedFormGroup>

            <div className="mt-3 p-3 bg-light rounded">
              <small className="text-muted d-flex align-items-center">
                <Info size={16} className="me-2" />
                All fields marked with <span className="text-danger ms-1">*</span> are required
              </small>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => {
              setShowModal(false);
              resetForm();
            }}
            disabled={isLoading}
          >
            Cancel
          </CButton>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <CButton 
              onClick={handleSubmit}
              disabled={isLoading}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              {isLoading ? (
                <>
                  <CSpinner size="sm" className="me-2" />
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <CIcon icon={cilCheckCircle} className="me-2" />
                  {isEditMode ? 'Update Provider' : 'Create Provider'}
                </>
              )}
            </CButton>
          </motion.div>
        </CModalFooter>
      </CModal>
    </motion.div>
  );
};

export default MedicalProvider;