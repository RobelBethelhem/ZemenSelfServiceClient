// import React, { useState, useRef, useEffect } from 'react';
// import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
// import {
//   CCard,
//   CCardBody,
//   CCardHeader,
//   CCol,
//   CRow,
//   CForm,
//   CFormLabel,
//   CFormInput,
//   CFormTextarea,
//   CButton,
//   CAlert,
//   CProgress,
//   CFormCheck,
//   CSpinner,
// } from '@coreui/react';
// import { cilCheckCircle, cilX, cilUser, cilMedicalCross, cilPencil, cilHeart } from '@coreui/icons';
// import CIcon from '@coreui/icons-react';
// import { useDispatch, useSelector } from 'react-redux';
// import { AlertTriangle, Info, Heart, Users, Baby, Search, Building2, MapPin, Phone } from 'lucide-react';

// const InfiniteScrollText = ({ text }) => {
//   const controls = useAnimationControls();
//   const containerRef = useRef(null);
//   const [containerWidth, setContainerWidth] = useState(0);
//   const [textWidth, setTextWidth] = useState(0);

//   useEffect(() => {
//     if (containerRef.current) {
//       setContainerWidth(containerRef.current.offsetWidth);
//     }
//   }, []);

//   useEffect(() => {
//     const textElement = document.createElement('span');
//     textElement.style.visibility = 'hidden';
//     textElement.style.position = 'absolute';
//     textElement.style.whiteSpace = 'nowrap';
//     textElement.style.fontSize = '1.2rem';
//     textElement.innerText = text;
//     document.body.appendChild(textElement);
//     setTextWidth(textElement.offsetWidth);
//     document.body.removeChild(textElement);
//   }, [text]);

//   useEffect(() => {
//     if (containerWidth > 0 && textWidth > 0) {
//       controls.start({
//         x: [-textWidth, containerWidth],
//         transition: {
//           duration: 20,
//           ease: "linear",
//           repeat: Infinity,
//         },
//       });
//     }
//   }, [controls, containerWidth, textWidth]);

//   return (
//     <div ref={containerRef} className="scroll-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>
//       <motion.div
//         animate={controls}
//         style={{ display: 'inline-block', fontSize: '1.2rem' }}
//       >
//         <span>{text}</span>
//       </motion.div>
//     </div>
//   );
// };

// const AnimatedFormGroup = ({ children, delay }) => {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{
//         type: "spring",
//         stiffness: 100,
//         damping: 12,
//         delay: delay
//       }}
//     >
//       {children}
//     </motion.div>
//   );
// };

// // Searchable Dropdown Component for Medical Providers
// const SearchableDropdown = ({ providers, value, onChange, isLoading, error }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef(null);

//   // Get display text for selected value
//   const getDisplayText = () => {
//     if (!value) return '';
//     const selected = providers.find(p => p.medical_institution === value);
//     return selected ? selected.medical_institution : value;
//   };

//   // Filter providers based on search term across all fields
//   const filteredProviders = providers.filter(provider => {
//     const search = searchTerm.toLowerCase();
//     return (
//       provider.medical_institution.toLowerCase().includes(search) ||
//       provider.location.toLowerCase().includes(search) ||
//       provider.telephone_no.toLowerCase().includes(search) ||
//       provider.short_code.toLowerCase().includes(search)
//     );
//   });

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleSelect = (provider) => {
//     onChange(provider.medical_institution);
//     setIsOpen(false);
//     setSearchTerm('');
//   };

//   return (
//     <div ref={dropdownRef} className="position-relative">
//       <div 
//         className={`form-control d-flex align-items-center justify-content-between shadow-sm ${error ? 'is-invalid' : ''}`}
//         style={{ 
//           fontSize: '1.05rem', 
//           padding: '0.6rem',
//           cursor: 'pointer',
//           minHeight: '45px'
//         }}
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <span className={value ? 'text-dark' : 'text-muted'}>
//           {value ? getDisplayText() : 'Select or search medical provider...'}
//         </span>
//         <motion.div
//           animate={{ rotate: isOpen ? 180 : 0 }}
//           transition={{ duration: 0.2 }}
//         >
//           <Search size={18} className="text-muted" />
//         </motion.div>
//       </div>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: -10, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: -10, scale: 0.95 }}
//             transition={{ duration: 0.2 }}
//             className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-lg"
//             style={{ 
//               zIndex: 1000, 
//               maxHeight: '400px',
//               overflow: 'hidden'
//             }}
//           >
//             {/* Search Input */}
//             <div className="p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>
//               <div className="position-relative">
//                 <Search 
//                   size={18} 
//                   className="position-absolute text-muted" 
//                   style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}
//                 />
//                 <input
//                   type="text"
//                   className="form-control ps-5"
//                   placeholder="Search by name, location, phone, or code..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onClick={(e) => e.stopPropagation()}
//                   autoFocus
//                   style={{ fontSize: '0.95rem' }}
//                 />
//               </div>
//             </div>

//             {/* Providers List */}
//             <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
//               {isLoading ? (
//                 <div className="text-center py-4">
//                   <CSpinner size="sm" color="primary" />
//                   <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>Loading providers...</p>
//                 </div>
//               ) : filteredProviders.length === 0 ? (
//                 <div className="text-center py-4">
//                   <AlertTriangle size={32} className="text-muted mb-2" />
//                   <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
//                     {searchTerm ? 'No providers match your search' : 'No providers available'}
//                   </p>
//                 </div>
//               ) : (
//                 filteredProviders.map((provider, index) => (
//                   <motion.div
//                     key={provider._id}
//                     initial={{ opacity: 0, x: -10 }}
//                     animate={{ opacity: 1, x: 0 }}
//                     transition={{ delay: index * 0.02 }}
//                     className="p-3 border-bottom"
//                     style={{ 
//                       cursor: 'pointer',
//                       transition: 'background-color 0.2s'
//                     }}
//                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
//                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
//                     onClick={() => handleSelect(provider)}
//                   >
//                     <div className="d-flex align-items-start justify-content-between">
//                       <div className="flex-grow-1">
//                         <div className="d-flex align-items-center mb-1">
//                           <Building2 size={16} className="text-primary me-2" />
//                           <strong style={{ fontSize: '1rem' }}>{provider.medical_institution}</strong>
//                           <span 
//                             className="badge bg-primary ms-2" 
//                             style={{ fontSize: '0.75rem' }}
//                           >
//                             {provider.short_code}
//                           </span>
//                         </div>
//                         <div className="d-flex align-items-center text-muted mb-1" style={{ fontSize: '0.9rem' }}>
//                           <MapPin size={14} className="me-2" />
//                           <span>{provider.location}</span>
//                         </div>
//                         <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>
//                           <Phone size={14} className="me-2" />
//                           <span>{provider.telephone_no}</span>
//                         </div>
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {error && (
//         <motion.div 
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="invalid-feedback d-flex align-items-center"
//           style={{ fontSize: '0.95rem', display: 'block' }}
//         >
//           <AlertTriangle size={14} className="me-1" />
//           {error}
//         </motion.div>
//       )}
//     </div>
//   );
// };

// // Info Banner Component for Medical
// const MedicalInfoBanner = () => {
//   const [isExpanded, setIsExpanded] = useState(false);
  
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: -20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ delay: 0.5, type: "spring" }}
//       className="mb-4"
//     >
//       <div 
//         className="rounded-3 p-4 position-relative overflow-hidden shadow-sm"
//         style={{
//           background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//           cursor: 'pointer',
//           border: '1px solid rgba(255,255,255,0.3)'
//         }}
//         onClick={() => setIsExpanded(!isExpanded)}
//       >
//         <motion.div
//           className="position-absolute"
//           style={{
//             width: '150px',
//             height: '150px',
//             background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 70%)',
//             borderRadius: '50%',
//             top: '-75px',
//             left: '-75px',
//             filter: 'blur(20px)'
//           }}
//           animate={{
//             rotate: [0, 360],
//           }}
//           transition={{
//             duration: 20,
//             repeat: Infinity,
//             ease: "linear"
//           }}
//         />
        
//         <div className="d-flex align-items-center text-white position-relative">
//           <motion.div
//             animate={{ 
//               rotate: [0, 360],
//               scale: [1, 1.2, 1]
//             }}
//             transition={{ 
//               rotate: { duration: 3, repeat: Infinity, ease: "linear" },
//               scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
//             }}
//             className="me-3"
//           >
//             <Heart size={32} />
//           </motion.div>
          
//           <div className="flex-grow-1">
//             <h5 className="mb-2 fw-bold d-flex align-items-center">
//               <span className="me-2">🏥</span>
//               Medical Letter Request Form
//               <motion.span 
//                 className="ms-2"
//                 animate={{ scale: [1, 1.3, 1] }}
//                 transition={{ duration: 1, repeat: Infinity }}
//               >
//                 ❤️
//               </motion.span>
//             </h5>
            
//             <AnimatePresence>
//               {isExpanded && (
//                 <motion.div
//                   initial={{ opacity: 0, height: 0 }}
//                   animate={{ opacity: 1, height: 'auto' }}
//                   exit={{ opacity: 0, height: 0 }}
//                   transition={{ duration: 0.4, type: "spring" }}
//                   className="mt-3"
//                 >
//                   <div className="bg-white bg-opacity-10 rounded-2 p-3">
//                     <p className="mb-2">
//                       ✅ Check the box if this letter is for your spouse
//                     </p>
//                     <p className="mb-2">
//                       👶 Child information is always available (optional)
//                     </p>
//                     <p className="mb-2">
//                       🏥 Select medical provider from searchable dropdown
//                     </p>
//                     <p className="mb-0">
//                       💡 Employee ID and assignment details are auto-fetched
//                     </p>
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>
//           </div>
          
//           <motion.div
//             animate={{ rotate: isExpanded ? 180 : 0 }}
//             transition={{ duration: 0.3 }}
//             className="ms-2"
//           >
//             <span style={{ fontSize: '28px' }}>
//               {isExpanded ? '⬆️' : '⬇️'}
//             </span>
//           </motion.div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// const MedicalLetter = () => {
//   const user = useSelector(state => state.user);
//   const accessToken = user.accessToken;

//   const [formData, setFormData] = useState({
//     is_Spouse: false,
//     medical_place: '',
//     spouse_first_name: '',
//     spouse_middle_name: '',
//     spouse_last_name: '',
//     child_first_name: '',
//     chid_middle_name: '',
//     child_last_name: '',
//     employee_description: '',
//   });
  
//   const [providers, setProviders] = useState([]);
//   const [isLoadingProviders, setIsLoadingProviders] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [status, setStatus] = useState(null);
//   const [progress, setProgress] = useState(0);
//   const [validationErrors, setValidationErrors] = useState({});

//   const formRef = useRef(null);

//   let delayIncrement = 0.1;

//   // Fetch medical providers on component mount
//   useEffect(() => {
//     fetchProviders();
//   }, []);

//   const fetchProviders = async () => {
//     setIsLoadingProviders(true);
//     try {
//       const response = await fetch('https://aps2.zemenbank.com/zbss/api/medical-provider/get_all_medical_providers', {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-token': accessToken
//         },
//       });

//       if (!response.ok) {
//         throw new Error('Failed to fetch providers');
//       }

//       const data = await response.json();
//       setProviders(data.data || []);
//     } catch (error) {
//       console.error('Error fetching providers:', error);
//     } finally {
//       setIsLoadingProviders(false);
//     }
//   };

//   useEffect(() => {
//     if (isLoading) {
//       const timer = setInterval(() => {
//         setProgress((oldProgress) => {
//           if (oldProgress === 100) {
//             clearInterval(timer);
//             return 100;
//           }
//           const diff = Math.random() * 10;
//           return Math.min(oldProgress + diff, 100);
//         });
//       }, 200);

//       return () => {
//         clearInterval(timer);
//       };
//     }
//   }, [isLoading]);

//   const handleInputChange = (e) => {
//     const { id, value, type, checked } = e.target;
    
//     setFormData((prevData) => ({
//       ...prevData,
//       [id]: type === 'checkbox' ? checked : value,
//     }));
//   };

//   const handleMedicalPlaceChange = (value) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       medical_place: value,
//     }));
//     // Clear validation error
//     if (validationErrors.medical_place) {
//       setValidationErrors(prev => ({ ...prev, medical_place: null }));
//     }
//   };

//   const validateForm = () => {
//     const errors = {};
    
//     // Medical place is required
//     if (!formData.medical_place || formData.medical_place.trim() === '') {
//       errors.medical_place = 'Medical provider is required';
//     }
    
//     // If spouse is selected, spouse names are required
//     if (formData.is_Spouse) {
//       if (!formData.spouse_first_name || formData.spouse_first_name.trim() === '') {
//         errors.spouse_first_name = 'Spouse first name is required when requesting for spouse';
//       }
//       if (!formData.spouse_middle_name || formData.spouse_middle_name.trim() === '') {
//         errors.spouse_middle_name = 'Spouse middle name is required when requesting for spouse';
//       }
//       if (!formData.spouse_last_name || formData.spouse_last_name.trim() === '') {
//         errors.spouse_last_name = 'Spouse last name is required when requesting for spouse';
//       }
//     }
    
//     setValidationErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       setStatus({
//         type: 'danger',
//         message: 'Please fill all required fields!'
//       });
//       return;
//     }
    
//     setIsLoading(true);
//     setStatus(null);
//     setProgress(0);
  
//     try {
//       const response = await fetch('https://aps2.zemenbank.com/zbss/api/medical/register_request_medical', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-token': accessToken
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'Something went wrong');
//       }

//       const data = await response.json();
//       setStatus({ 
//         type: 'success', 
//         message: data.message || 'Medical Letter Request submitted successfully!'
//       });
//       resetForm();
//     } catch (error) {
//       console.error('Error submitting request:', error);
//       setStatus({ 
//         type: 'danger', 
//         message: error.message || 'Failed to submit request. Please try again.' 
//       });
//     } finally {
//       setIsLoading(false);
//       setProgress(100);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       is_Spouse: false,
//       medical_place: '',
//       spouse_first_name: '',
//       spouse_middle_name: '',
//       spouse_last_name: '',
//       child_first_name: '',
//       chid_middle_name: '',
//       child_last_name: '',
//       employee_description: '',
//     });
//     setValidationErrors({});
//     if (formRef.current) {
//       formRef.current.reset();
//     }
//   };

//   const formVariants = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
//   };

//   const inputVariants = {
//     focus: { scale: 1.02, transition: { duration: 0.2 } },
//     blur: { scale: 1, transition: { duration: 0.2 } },
//   };

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//     >
//       {/* Medical Badge */}
//       <motion.div 
//         className="text-center mb-3"
//         initial={{ opacity: 0, scale: 0.8 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ delay: 0.2, type: "spring" }}
//       >
//         <motion.span 
//           className="badge bg-danger px-5 py-3 shadow" 
//           style={{ fontSize: '1.3rem' }}
//           animate={{
//             boxShadow: [
//               '0 4px 6px rgba(0,0,0,0.1)',
//               '0 8px 12px rgba(0,0,0,0.2)',
//               '0 4px 6px rgba(0,0,0,0.1)'
//             ]
//           }}
//           transition={{
//             duration: 2,
//             repeat: Infinity,
//             ease: "easeInOut"
//           }}
//         >
//           🏥 Medical Letter Request
//         </motion.span>
//       </motion.div>

//       {/* Info Banner */}
//       <MedicalInfoBanner />

//       <CCard className="mb-4 shadow-lg">
//         <CCardHeader className="bg-danger text-white">
//           <InfiniteScrollText text="Medical Letter Request Form" />
//         </CCardHeader>
//         <CCardBody className="p-4">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={status ? 'alert' : 'no-alert'}
//               initial={{ opacity: 0, y: -20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.3 }}
//             >
//               {status && (
//                 <CAlert color={status.type === 'success' ? 'success' : 'danger'} className="d-flex align-items-center" style={{ fontSize: '1.1rem' }}>
//                   <CIcon icon={status.type === 'success' ? cilCheckCircle : cilX} className="flex-shrink-0 me-2" width={28} height={28} />
//                   <div>{status.message}</div>
//                 </CAlert>
//               )}
//             </motion.div>
//           </AnimatePresence>
          
//           <motion.div
//             variants={formVariants}
//             initial="hidden"
//             animate="visible"
//           >
//             <CForm onSubmit={handleSubmit} ref={formRef}>
//               {/* Spouse Checkbox */}
//               <AnimatedFormGroup delay={delayIncrement}>
//                 <div className="mb-4 p-4 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 50%)', border: '2px solid #feca57' }}>
//                   <CFormCheck
//                     type="checkbox"
//                     id="is_Spouse"
//                     checked={formData.is_Spouse}
//                     onChange={handleInputChange}
//                     label={
//                       <span className="d-flex align-items-center" style={{ fontSize: '1.2rem', fontWeight: '600' }}>
//                         <Users size={24} className="me-2" />
//                         <strong>Is this medical letter for your spouse?</strong>
//                       </span>
//                     }
//                     style={{ fontSize: '1.2rem' }}
//                   />
//                   {formData.is_Spouse && (
//                     <motion.div
//                       initial={{ opacity: 0, height: 0 }}
//                       animate={{ opacity: 1, height: 'auto' }}
//                       exit={{ opacity: 0, height: 0 }}
//                       className="mt-3 p-3 bg-white rounded-2"
//                     >
//                       <small className="text-dark d-flex align-items-center" style={{ fontSize: '1rem' }}>
//                         <Info size={16} className="me-2" />
//                         Please provide your spouse's information below
//                       </small>
//                     </motion.div>
//                   )}
//                 </div>
//               </AnimatedFormGroup>

//               {/* Spouse Information - Only show when checked */}
//               <AnimatePresence>
//                 {formData.is_Spouse && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.4 }}
//                   >
//                     <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                       <h4 className="mb-4" style={{ fontSize: '1.4rem' }}>
//                         <CIcon icon={cilUser} className="me-2" />
//                         Spouse Information
//                       </h4>
//                     </AnimatedFormGroup>
                    
//                     <CRow>
//                       <CCol md={4}>
//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                           <CFormLabel htmlFor="spouse_first_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                             Spouse First Name <span className="text-danger">*</span>
//                           </CFormLabel>
//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                             <CFormInput
//                               type="text"
//                               id="spouse_first_name"
//                               value={formData.spouse_first_name}
//                               onChange={handleInputChange}
//                               placeholder="Enter spouse first name"
//                               className={`shadow-sm ${validationErrors.spouse_first_name ? 'is-invalid' : ''}`}
//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                             />
//                             {validationErrors.spouse_first_name && (
//                               <motion.div 
//                                 initial={{ opacity: 0, y: -10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="invalid-feedback d-flex align-items-center"
//                                 style={{ fontSize: '0.95rem' }}
//                               >
//                                 <AlertTriangle size={14} className="me-1" />
//                                 {validationErrors.spouse_first_name}
//                               </motion.div>
//                             )}
//                           </motion.div>
//                         </AnimatedFormGroup>
//                       </CCol>
//                       <CCol md={4}>
//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                           <CFormLabel htmlFor="spouse_middle_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                             Spouse Middle Name <span className="text-danger">*</span>
//                           </CFormLabel>
//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                             <CFormInput
//                               type="text"
//                               id="spouse_middle_name"
//                               value={formData.spouse_middle_name}
//                               onChange={handleInputChange}
//                               placeholder="Enter spouse middle name"
//                               className={`shadow-sm ${validationErrors.spouse_middle_name ? 'is-invalid' : ''}`}
//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                             />
//                             {validationErrors.spouse_middle_name && (
//                               <motion.div 
//                                 initial={{ opacity: 0, y: -10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="invalid-feedback d-flex align-items-center"
//                                 style={{ fontSize: '0.95rem' }}
//                               >
//                                 <AlertTriangle size={14} className="me-1" />
//                                 {validationErrors.spouse_middle_name}
//                               </motion.div>
//                             )}
//                           </motion.div>
//                         </AnimatedFormGroup>
//                       </CCol>
//                       <CCol md={4}>
//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                           <CFormLabel htmlFor="spouse_last_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                             Spouse Last Name <span className="text-danger">*</span>
//                           </CFormLabel>
//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                             <CFormInput
//                               type="text"
//                               id="spouse_last_name"
//                               value={formData.spouse_last_name}
//                               onChange={handleInputChange}
//                               placeholder="Enter spouse last name"
//                               className={`shadow-sm ${validationErrors.spouse_last_name ? 'is-invalid' : ''}`}
//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                             />
//                             {validationErrors.spouse_last_name && (
//                               <motion.div 
//                                 initial={{ opacity: 0, y: -10 }}
//                                 animate={{ opacity: 1, y: 0 }}
//                                 className="invalid-feedback d-flex align-items-center"
//                                 style={{ fontSize: '0.95rem' }}
//                               >
//                                 <AlertTriangle size={14} className="me-1" />
//                                 {validationErrors.spouse_last_name}
//                               </motion.div>
//                             )}
//                           </motion.div>
//                         </AnimatedFormGroup>
//                       </CCol>
//                     </CRow>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Child Information - Always show when NOT checked for spouse */}
//               <AnimatePresence>
//                 {!formData.is_Spouse && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: 'auto' }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.4 }}
//                   >
//                     <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                       <h4 className="mb-4 mt-3" style={{ fontSize: '1.4rem' }}>
//                         <Baby size={24} className="me-2" />
//                         Child Information (Optional)
//                       </h4>
//                     </AnimatedFormGroup>
                    
//                     <CRow>
//                       <CCol md={4}>
//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                           <CFormLabel htmlFor="child_first_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                             Child First Name
//                           </CFormLabel>
//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                             <CFormInput
//                               type="text"
//                               id="child_first_name"
//                               value={formData.child_first_name}
//                               onChange={handleInputChange}
//                               placeholder="Enter child first name"
//                               className="shadow-sm"
//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                             />
//                           </motion.div>
//                         </AnimatedFormGroup>
//                       </CCol>
//                       <CCol md={4}>
//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                           <CFormLabel htmlFor="chid_middle_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                             Child Middle Name
//                           </CFormLabel>
//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                             <CFormInput
//                               type="text"
//                               id="chid_middle_name"
//                               value={formData.chid_middle_name}
//                               onChange={handleInputChange}
//                               placeholder="Enter child middle name"
//                               className="shadow-sm"
//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                             />
//                           </motion.div>
//                         </AnimatedFormGroup>
//                       </CCol>
//                       <CCol md={4}>
//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                           <CFormLabel htmlFor="child_last_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                             Child Last Name
//                           </CFormLabel>
//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                             <CFormInput
//                               type="text"
//                               id="child_last_name"
//                               value={formData.child_last_name}
//                               onChange={handleInputChange}
//                               placeholder="Enter child last name"
//                               className="shadow-sm"
//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                             />
//                           </motion.div>
//                         </AnimatedFormGroup>
//                       </CCol>
//                     </CRow>
//                   </motion.div>
//                 )}
//               </AnimatePresence>

//               {/* Medical Information */}
//               <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                 <h4 className="mb-4 mt-4" style={{ fontSize: '1.4rem' }}>
//                   <CIcon icon={cilMedicalCross} className="me-2" />
//                   Medical Information
//                 </h4>
//               </AnimatedFormGroup>
              
//               <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                 <CFormLabel htmlFor="medical_place" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                   <Building2 size={18} className="me-1" />
//                   Medical Provider <span className="text-danger">*</span>
//                 </CFormLabel>
//                 <SearchableDropdown
//                   providers={providers}
//                   value={formData.medical_place}
//                   onChange={handleMedicalPlaceChange}
//                   isLoading={isLoadingProviders}
//                   error={validationErrors.medical_place}
//                 />
//               </AnimatedFormGroup>

//               {/* Additional Information */}
//               <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                 <h4 className="mb-4 mt-4" style={{ fontSize: '1.4rem' }}>
//                   <CIcon icon={cilPencil} className="me-2" />
//                   Additional Information
//                 </h4>
//               </AnimatedFormGroup>
              
//               <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                 <CFormLabel htmlFor="employee_description" style={{ fontSize: '1.1rem', fontWeight: '500' }}>
//                   Description <span className="text-danger">*</span>
//                 </CFormLabel>
//                 <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">
//                   <CFormTextarea
//                     id="employee_description"
//                     rows="4"
//                     value={formData.employee_description}
//                     onChange={handleInputChange}
//                     placeholder="Provide details about the medical request"
//                     required
//                     className="shadow-sm"
//                     style={{ fontSize: '1.05rem', padding: '0.6rem' }}
//                   />
//                 </motion.div>
//               </AnimatedFormGroup>

//               <AnimatedFormGroup delay={delayIncrement += 0.1}>
//                 <div className="d-flex justify-content-between align-items-center mt-4">
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     transition={{ delay: 0.5 }}
//                     className="text-muted"
//                     style={{ fontSize: '1rem' }}
//                   >
//                     <Info size={18} className="me-2" />
//                     All fields marked with <span className="text-danger">*</span> are required
//                   </motion.div>
                  
//                   <motion.div
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                   >
//                     <CButton 
//                       type="submit" 
//                       color="danger" 
//                       disabled={isLoading}
//                       className={`px-5 py-2 ${isLoading ? 'position-relative' : ''}`}
//                       style={{
//                         background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
//                         border: 'none',
//                         fontSize: '1.1rem',
//                         fontWeight: '600'
//                       }}
//                     >
//                       {isLoading ? (
//                         <>
//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                           Submitting...
//                         </>
//                       ) : (
//                         'Submit Request'
//                       )}
//                     </CButton>
//                   </motion.div>
//                 </div>
//               </AnimatedFormGroup>
//             </CForm>
//           </motion.div>
          
//           {isLoading && (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.3 }}
//             >
//               <CProgress 
//                 className="mt-3" 
//                 animated 
//                 value={progress}
//                 style={{
//                   background: 'linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%)',
//                   height: '8px'
//                 }}
//               />
//             </motion.div>
//           )}
//         </CCardBody>
//       </CCard>
//     </motion.div>
//   );
// };

// export default MedicalLetter;





















































// import React, { useState, useRef, useEffect } from 'react';

// import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';

// import {

//   CCard,

//   CCardBody,

//   CCardHeader,

//   CCol,

//   CRow,

//   CForm,

//   CFormLabel,

//   CFormInput,

//   CFormTextarea,

//   CButton,

//   CAlert,

//   CProgress,

//   CFormCheck,

//   CSpinner,

// } from '@coreui/react';

// import { cilCheckCircle, cilX, cilUser, cilMedicalCross, cilPencil, cilHeart } from '@coreui/icons';

// import CIcon from '@coreui/icons-react';

// import { useDispatch, useSelector } from 'react-redux';

// import { AlertTriangle, Info, Heart, Users, Baby, Search, Building2, MapPin, Phone } from 'lucide-react';



// const InfiniteScrollText = ({ text }) => {

//   const controls = useAnimationControls();

//   const containerRef = useRef(null);

//   const [containerWidth, setContainerWidth] = useState(0);

//   const [textWidth, setTextWidth] = useState(0);



//   useEffect(() => {

//     if (containerRef.current) {

//       setContainerWidth(containerRef.current.offsetWidth);

//     }

//   }, []);



//   useEffect(() => {

//     const textElement = document.createElement('span');

//     textElement.style.visibility = 'hidden';

//     textElement.style.position = 'absolute';

//     textElement.style.whiteSpace = 'nowrap';

//     textElement.style.fontSize = '1.2rem';

//     textElement.innerText = text;

//     document.body.appendChild(textElement);

//     setTextWidth(textElement.offsetWidth);

//     document.body.removeChild(textElement);

//   }, [text]);



//   useEffect(() => {

//     if (containerWidth > 0 && textWidth > 0) {

//       controls.start({

//         x: [-textWidth, containerWidth],

//         transition: {

//           duration: 20,

//           ease: "linear",

//           repeat: Infinity,

//         },

//       });

//     }

//   }, [controls, containerWidth, textWidth]);



//   return (

//     <div ref={containerRef} className="scroll-container" style={{ overflow: 'hidden', whiteSpace: 'nowrap', width: '100%' }}>

//       <motion.div

//         animate={controls}

//         style={{ display: 'inline-block', fontSize: '1.2rem' }}

//       >

//         <span>{text}</span>

//       </motion.div>

//     </div>

//   );

// };



// const AnimatedFormGroup = ({ children, delay }) => {

//   return (

//     <motion.div

//       initial={{ opacity: 0, y: 50 }}

//       animate={{ opacity: 1, y: 0 }}

//       transition={{

//         type: "spring",

//         stiffness: 100,

//         damping: 12,

//         delay: delay

//       }}

//     >

//       {children}

//     </motion.div>

//   );

// };



// // Searchable Dropdown Component for Medical Providers

// const SearchableDropdown = ({ providers, value, onChange, isLoading, error }) => {

//   const [isOpen, setIsOpen] = useState(false);

//   const [searchTerm, setSearchTerm] = useState('');

//   const dropdownRef = useRef(null);



//   // Get display text for selected value

//   const getDisplayText = () => {

//     if (!value) return '';

//     const selected = providers.find(p => p.medical_institution === value);

//     return selected ? selected.medical_institution : value;

//   };




//   // Sort providers by short_code (convert to number for proper sorting)

//   const sortedProviders = [...providers].sort((a, b) => {

//     const aNum = parseInt(a.short_code) || 9999; // Non-numeric codes get high value

//     const bNum = parseInt(b.short_code) || 9999;

//     return aNum - bNum;

//   });



//   // Split providers into two groups

//   const addisAbabaProviders = sortedProviders.filter(provider => {

//     const codeNum = parseInt(provider.short_code);

//     return !isNaN(codeNum) && codeNum >= 1 && codeNum <= 37;

//   });



//   const outsideAddisProviders = sortedProviders.filter(provider => {

//     const codeNum = parseInt(provider.short_code);

//     return isNaN(codeNum) || codeNum < 1 || codeNum > 37;

//   });



//   // Filter providers based on search term across all fields

//   const filterProvider = (provider) => {

//     const search = searchTerm.toLowerCase();

//     return (

//       provider.medical_institution.toLowerCase().includes(search) ||

//       provider.location.toLowerCase().includes(search) ||

//       provider.telephone_no.toLowerCase().includes(search) ||

//       provider.short_code.toLowerCase().includes(search)

//     );

//   };



//   const filteredAddisAbaba = addisAbabaProviders.filter(filterProvider);

//   const filteredOutsideAddis = outsideAddisProviders.filter(filterProvider);


//   // Close dropdown when clicking outside

//   useEffect(() => {

//     const handleClickOutside = (event) => {

//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {

//         setIsOpen(false);

//       }

//     };



//     document.addEventListener('mousedown', handleClickOutside);

//     return () => document.removeEventListener('mousedown', handleClickOutside);

//   }, []);



//   const handleSelect = (provider) => {

//     onChange(provider.medical_institution);

//     setIsOpen(false);

//     setSearchTerm('');

//   };



//   return (

//     <div ref={dropdownRef} className="position-relative">

//       <div 

//         className={`form-control d-flex align-items-center justify-content-between shadow-sm ${error ? 'is-invalid' : ''}`}

//         style={{ 

//           fontSize: '1.05rem', 

//           padding: '0.6rem',

//           cursor: 'pointer',

//           minHeight: '45px'

//         }}

//         onClick={() => setIsOpen(!isOpen)}

//       >

//         <span className={value ? 'text-dark' : 'text-muted'}>

//           {value ? getDisplayText() : 'Select or search medical provider...'}

//         </span>

//         <motion.div

//           animate={{ rotate: isOpen ? 180 : 0 }}

//           transition={{ duration: 0.2 }}

//         >

//           <Search size={18} className="text-muted" />

//         </motion.div>

//       </div>



//       <AnimatePresence>

//         {isOpen && (

//           <motion.div

//             initial={{ opacity: 0, y: -10, scale: 0.95 }}

//             animate={{ opacity: 1, y: 0, scale: 1 }}

//             exit={{ opacity: 0, y: -10, scale: 0.95 }}

//             transition={{ duration: 0.2 }}

//             className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-lg"

//             style={{ 

//               zIndex: 1000, 

//               maxHeight: '400px',

//               overflow: 'hidden'

//             }}

//           >

//             {/* Search Input */}

//             <div className="p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>

//               <div className="position-relative">

//                 <Search 

//                   size={18} 

//                   className="position-absolute text-muted" 

//                   style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}

//                 />

//                 <input

//                   type="text"

//                   className="form-control ps-5"

//                   placeholder="Search by name, location, phone, or code..."

//                   value={searchTerm}

//                   onChange={(e) => setSearchTerm(e.target.value)}

//                   onClick={(e) => e.stopPropagation()}

//                   autoFocus

//                   style={{ fontSize: '0.95rem' }}

//                 />

//               </div>

//             </div>



//             {/* Providers List */}


//             {/* Providers List */}

//             <div style={{ maxHeight: '300px', overflowY: 'auto' }}>

//               {isLoading ? (

//                 <div className="text-center py-4">

//                   <CSpinner size="sm" color="primary" />

//                   <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>Loading providers...</p>

//                 </div>

//               ) : filteredAddisAbaba.length === 0 && filteredOutsideAddis.length === 0 ? (

//                 <div className="text-center py-4">

//                   <AlertTriangle size={32} className="text-muted mb-2" />

//                   <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>

//                     {searchTerm ? 'No providers match your search' : 'No providers available'}

//                   </p>

//                 </div>

//               ) : (

//                 <>

//                   {/* In Bracket Addis Ababa Section */}

//                   {filteredAddisAbaba.length > 0 && (

//                     <>

//                       <div 

//                         className="px-3 py-2 border-bottom" 

//                         style={{ 

//                           backgroundColor: '#e3f2fd',

//                           fontWeight: '600',

//                           fontSize: '0.95rem',

//                           color: '#1976d2',

//                           position: 'sticky',

//                           top: 0,

//                           zIndex: 1

//                         }}

//                       >

//                         📍 In Bracket Addis Ababa (01-037)

//                       </div>

//                       {filteredAddisAbaba.map((provider, index) => (

//                         <motion.div

//                           key={provider._id}

//                           initial={{ opacity: 0, x: -10 }}

//                           animate={{ opacity: 1, x: 0 }}

//                           transition={{ delay: index * 0.02 }}

//                           className="p-3 border-bottom"

//                           style={{ 

//                             cursor: 'pointer',

//                             transition: 'background-color 0.2s'

//                           }}

//                           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}

//                           onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}

//                           onClick={() => handleSelect(provider)}

//                         >

//                           <div className="d-flex align-items-start justify-content-between">

//                             <div className="flex-grow-1">

//                               <div className="d-flex align-items-center mb-1">

//                                 <Building2 size={16} className="text-primary me-2" />

//                                 <strong style={{ fontSize: '1rem' }}>{provider.medical_institution}</strong>

//                                 <span 

//                                   className="badge bg-primary ms-2" 

//                                   style={{ fontSize: '0.75rem' }}

//                                 >

//                                   {provider.short_code}

//                                 </span>

//                               </div>

//                               <div className="d-flex align-items-center text-muted mb-1" style={{ fontSize: '0.9rem' }}>

//                                 <MapPin size={14} className="me-2" />

//                                 <span>{provider.location}</span>

//                               </div>

//                               <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>

//                                 <Phone size={14} className="me-2" />

//                                 <span>{provider.telephone_no}</span>

//                               </div>

//                             </div>

//                           </div>

//                         </motion.div>

//                       ))}

//                     </>

//                   )}



//                   {/* Outside Addis Ababa Section */}

//                   {filteredOutsideAddis.length > 0 && (

//                     <>

//                       <div 

//                         className="px-3 py-2 border-bottom" 

//                         style={{ 

//                           backgroundColor: '#fff3e0',

//                           fontWeight: '600',

//                           fontSize: '0.95rem',

//                           color: '#f57c00',

//                           position: 'sticky',

//                           top: 0,

//                           zIndex: 1

//                         }}

//                       >

//                         🌍 Outside Addis Ababa

//                       </div>

//                       {filteredOutsideAddis.map((provider, index) => (

//                         <motion.div

//                           key={provider._id}

//                           initial={{ opacity: 0, x: -10 }}

//                           animate={{ opacity: 1, x: 0 }}

//                           transition={{ delay: (filteredAddisAbaba.length + index) * 0.02 }}

//                           className="p-3 border-bottom"

//                           style={{ 

//                             cursor: 'pointer',

//                             transition: 'background-color 0.2s'

//                           }}

//                           onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}

//                           onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}

//                           onClick={() => handleSelect(provider)}

//                         >

//                           <div className="d-flex align-items-start justify-content-between">

//                             <div className="flex-grow-1">

//                               <div className="d-flex align-items-center mb-1">

//                                 <Building2 size={16} className="text-warning me-2" />

//                                 <strong style={{ fontSize: '1rem' }}>{provider.medical_institution}</strong>

//                                 <span 

//                                   className="badge bg-warning text-dark ms-2" 

//                                   style={{ fontSize: '0.75rem' }}

//                                 >

//                                   {provider.short_code}

//                                 </span>

//                               </div>

//                               <div className="d-flex align-items-center text-muted mb-1" style={{ fontSize: '0.9rem' }}>

//                                 <MapPin size={14} className="me-2" />

//                                 <span>{provider.location}</span>

//                               </div>

//                               <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>

//                                 <Phone size={14} className="me-2" />

//                                 <span>{provider.telephone_no}</span>

//                               </div>

//                             </div>

//                           </div>

//                         </motion.div>

//                       ))}

//                     </>

//                   )}

//                 </>

//               )}

//             </div>

//           </motion.div>

//         )}

//       </AnimatePresence>


//       {error && (

//         <motion.div 

//           initial={{ opacity: 0, y: -10 }}

//           animate={{ opacity: 1, y: 0 }}

//           className="invalid-feedback d-flex align-items-center"

//           style={{ fontSize: '0.95rem', display: 'block' }}

//         >

//           <AlertTriangle size={14} className="me-1" />

//           {error}

//         </motion.div>

//       )}

//     </div>

//   );

// };



// // Info Banner Component for Medical

// const MedicalInfoBanner = () => {

//   const [isExpanded, setIsExpanded] = useState(false);

  

//   return (

//     <motion.div

//       initial={{ opacity: 0, y: -20 }}

//       animate={{ opacity: 1, y: 0 }}

//       transition={{ delay: 0.5, type: "spring" }}

//       className="mb-4"

//     >

//       <div 

//         className="rounded-3 p-4 position-relative overflow-hidden shadow-sm"

//         style={{

//           background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

//           cursor: 'pointer',

//           border: '1px solid rgba(255,255,255,0.3)'

//         }}

//         onClick={() => setIsExpanded(!isExpanded)}

//       >

//         <motion.div

//           className="position-absolute"

//           style={{

//             width: '150px',

//             height: '150px',

//             background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 70%)',

//             borderRadius: '50%',

//             top: '-75px',

//             left: '-75px',

//             filter: 'blur(20px)'

//           }}

//           animate={{

//             rotate: [0, 360],

//           }}

//           transition={{

//             duration: 20,

//             repeat: Infinity,

//             ease: "linear"

//           }}

//         />

        

//         <div className="d-flex align-items-center text-white position-relative">

//           <motion.div

//             animate={{ 

//               rotate: [0, 360],

//               scale: [1, 1.2, 1]

//             }}

//             transition={{ 

//               rotate: { duration: 3, repeat: Infinity, ease: "linear" },

//               scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }

//             }}

//             className="me-3"

//           >

//             <Heart size={32} />

//           </motion.div>

          

//           <div className="flex-grow-1">

//             <h5 className="mb-2 fw-bold d-flex align-items-center">

//               <span className="me-2">🏥</span>

//               Medical Letter Request Form

//               <motion.span 

//                 className="ms-2"

//                 animate={{ scale: [1, 1.3, 1] }}

//                 transition={{ duration: 1, repeat: Infinity }}

//               >

//                 ❤️

//               </motion.span>

//             </h5>

            

//             <AnimatePresence>

//               {isExpanded && (

//                 <motion.div

//                   initial={{ opacity: 0, height: 0 }}

//                   animate={{ opacity: 1, height: 'auto' }}

//                   exit={{ opacity: 0, height: 0 }}

//                   transition={{ duration: 0.4, type: "spring" }}

//                   className="mt-3"

//                 >

//                   <div className="bg-white bg-opacity-10 rounded-2 p-3">

//                     <p className="mb-2">

//                       ✅ Check the box if this letter is for your spouse

//                     </p>

//                     <p className="mb-2">

//                       👶 Child information is always available (optional)

//                     </p>

//                     <p className="mb-2">

//                       🏥 Select medical provider from searchable dropdown

//                     </p>

//                     <p className="mb-0">

//                       💡 Employee ID and assignment details are auto-fetched

//                     </p>

//                   </div>

//                 </motion.div>

//               )}

//             </AnimatePresence>

//           </div>

          

//           <motion.div

//             animate={{ rotate: isExpanded ? 180 : 0 }}

//             transition={{ duration: 0.3 }}

//             className="ms-2"

//           >

//             <span style={{ fontSize: '28px' }}>

//               {isExpanded ? '⬆️' : '⬇️'}

//             </span>

//           </motion.div>

//         </div>

//       </div>

//     </motion.div>

//   );

// };



// const MedicalLetter = () => {

//   const user = useSelector(state => state.user);

//   const accessToken = user.accessToken;



//   const [formData, setFormData] = useState({

//     is_Spouse: false,

//     medical_place: '',

//     spouse_first_name: '',

//     spouse_middle_name: '',

//     spouse_last_name: '',

//     child_first_name: '',

//     chid_middle_name: '',

//     child_last_name: '',

//     employee_description: '',

//   });

  

//   const [providers, setProviders] = useState([]);

//   const [isLoadingProviders, setIsLoadingProviders] = useState(false);

//   const [isLoading, setIsLoading] = useState(false);

//   const [status, setStatus] = useState(null);

//   const [progress, setProgress] = useState(0);

//   const [validationErrors, setValidationErrors] = useState({});



//   const formRef = useRef(null);



//   let delayIncrement = 0.1;



//   // Fetch medical providers on component mount

//   useEffect(() => {

//     fetchProviders();

//   }, []);



//   const fetchProviders = async () => {

//     setIsLoadingProviders(true);

//     try {

//       const response = await fetch('https://aps2.zemenbank.com/zbss/api/medical-provider/get_all_medical_providers', {

//         method: 'GET',

//         headers: {

//           'Content-Type': 'application/json',

//           'x-access-token': accessToken

//         },

//       });



//       if (!response.ok) {

//         throw new Error('Failed to fetch providers');

//       }



//       const data = await response.json();

//       setProviders(data.data || []);

//     } catch (error) {

//       console.error('Error fetching providers:', error);

//     } finally {

//       setIsLoadingProviders(false);

//     }

//   };



//   useEffect(() => {

//     if (isLoading) {

//       const timer = setInterval(() => {

//         setProgress((oldProgress) => {

//           if (oldProgress === 100) {

//             clearInterval(timer);

//             return 100;

//           }

//           const diff = Math.random() * 10;

//           return Math.min(oldProgress + diff, 100);

//         });

//       }, 200);



//       return () => {

//         clearInterval(timer);

//       };

//     }

//   }, [isLoading]);



//   const handleInputChange = (e) => {

//     const { id, value, type, checked } = e.target;

    

//     setFormData((prevData) => ({

//       ...prevData,

//       [id]: type === 'checkbox' ? checked : value,

//     }));

//   };



//   const handleMedicalPlaceChange = (value) => {

//     setFormData((prevData) => ({

//       ...prevData,

//       medical_place: value,

//     }));

//     // Clear validation error

//     if (validationErrors.medical_place) {

//       setValidationErrors(prev => ({ ...prev, medical_place: null }));

//     }

//   };



//   const validateForm = () => {

//     const errors = {};

    

//     // Medical place is required

//     if (!formData.medical_place || formData.medical_place.trim() === '') {

//       errors.medical_place = 'Medical provider is required';

//     }

    

//     // If spouse is selected, spouse names are required

//     if (formData.is_Spouse) {

//       if (!formData.spouse_first_name || formData.spouse_first_name.trim() === '') {

//         errors.spouse_first_name = 'Spouse first name is required when requesting for spouse';

//       }

//       if (!formData.spouse_middle_name || formData.spouse_middle_name.trim() === '') {

//         errors.spouse_middle_name = 'Spouse middle name is required when requesting for spouse';

//       }

//       if (!formData.spouse_last_name || formData.spouse_last_name.trim() === '') {

//         errors.spouse_last_name = 'Spouse last name is required when requesting for spouse';

//       }

//     }

    

//     setValidationErrors(errors);

//     return Object.keys(errors).length === 0;

//   };



//   const handleSubmit = async (e) => {

//     e.preventDefault();

    

//     if (!validateForm()) {

//       setStatus({

//         type: 'danger',

//         message: 'Please fill all required fields!'

//       });

//       return;

//     }

    

//     setIsLoading(true);

//     setStatus(null);

//     setProgress(0);

  

//     try {

//       const response = await fetch('https://aps2.zemenbank.com/zbss/api/medical/register_request_medical', {

//         method: 'POST',

//         headers: {

//           'Content-Type': 'application/json',

//           'x-access-token': accessToken

//         },

//         body: JSON.stringify(formData),

//       });



//       if (!response.ok) {

//         const errorData = await response.json();

//         throw new Error(errorData.message || 'Something went wrong');

//       }



//       const data = await response.json();

//       setStatus({ 

//         type: 'success', 

//         message: data.message || 'Medical Letter Request submitted successfully!'

//       });

//       resetForm();

//     } catch (error) {

//       console.error('Error submitting request:', error);

//       setStatus({ 

//         type: 'danger', 

//         message: error.message || 'Failed to submit request. Please try again.' 

//       });

//     } finally {

//       setIsLoading(false);

//       setProgress(100);

//     }

//   };



//   const resetForm = () => {

//     setFormData({

//       is_Spouse: false,

//       medical_place: '',

//       spouse_first_name: '',

//       spouse_middle_name: '',

//       spouse_last_name: '',

//       child_first_name: '',

//       chid_middle_name: '',

//       child_last_name: '',

//       employee_description: '',

//     });

//     setValidationErrors({});

//     if (formRef.current) {

//       formRef.current.reset();

//     }

//   };



//   const formVariants = {

//     hidden: { opacity: 0, y: 20 },

//     visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },

//   };



//   const inputVariants = {

//     focus: { scale: 1.02, transition: { duration: 0.2 } },

//     blur: { scale: 1, transition: { duration: 0.2 } },

//   };



//   return (

//     <motion.div

//       initial={{ opacity: 0, y: 20 }}

//       animate={{ opacity: 1, y: 0 }}

//       transition={{ duration: 0.5 }}

//     >

//       {/* Medical Badge */}

//       <motion.div 

//         className="text-center mb-3"

//         initial={{ opacity: 0, scale: 0.8 }}

//         animate={{ opacity: 1, scale: 1 }}

//         transition={{ delay: 0.2, type: "spring" }}

//       >

//         <motion.span 

//           className="badge bg-danger px-5 py-3 shadow" 

//           style={{ fontSize: '1.3rem' }}

//           animate={{

//             boxShadow: [

//               '0 4px 6px rgba(0,0,0,0.1)',

//               '0 8px 12px rgba(0,0,0,0.2)',

//               '0 4px 6px rgba(0,0,0,0.1)'

//             ]

//           }}

//           transition={{

//             duration: 2,

//             repeat: Infinity,

//             ease: "easeInOut"

//           }}

//         >

//           🏥 Medical Letter Request

//         </motion.span>

//       </motion.div>



//       {/* Info Banner */}

//       <MedicalInfoBanner />



//       <CCard className="mb-4 shadow-lg">

//         <CCardHeader className="bg-danger text-white">

//           <InfiniteScrollText text="Medical Letter Request Form" />

//         </CCardHeader>

//         <CCardBody className="p-4">

//           <AnimatePresence mode="wait">

//             <motion.div

//               key={status ? 'alert' : 'no-alert'}

//               initial={{ opacity: 0, y: -20 }}

//               animate={{ opacity: 1, y: 0 }}

//               exit={{ opacity: 0, y: -20 }}

//               transition={{ duration: 0.3 }}

//             >

//               {status && (

//                 <CAlert color={status.type === 'success' ? 'success' : 'danger'} className="d-flex align-items-center" style={{ fontSize: '1.1rem' }}>

//                   <CIcon icon={status.type === 'success' ? cilCheckCircle : cilX} className="flex-shrink-0 me-2" width={28} height={28} />

//                   <div>{status.message}</div>

//                 </CAlert>

//               )}

//             </motion.div>

//           </AnimatePresence>

          

//           <motion.div

//             variants={formVariants}

//             initial="hidden"

//             animate="visible"

//           >

//             <CForm onSubmit={handleSubmit} ref={formRef}>

//               {/* Spouse Checkbox */}

//               <AnimatedFormGroup delay={delayIncrement}>

//                 <div className="mb-4 p-4 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 50%)', border: '2px solid #feca57' }}>

//                   <CFormCheck

//                     type="checkbox"

//                     id="is_Spouse"

//                     checked={formData.is_Spouse}

//                     onChange={handleInputChange}

//                     label={

//                       <span className="d-flex align-items-center" style={{ fontSize: '1.2rem', fontWeight: '600' }}>

//                         <Users size={24} className="me-2" />

//                         <strong>Is this medical letter for your spouse?</strong>

//                       </span>

//                     }

//                     style={{ fontSize: '1.2rem' }}

//                   />

//                   {formData.is_Spouse && (

//                     <motion.div

//                       initial={{ opacity: 0, height: 0 }}

//                       animate={{ opacity: 1, height: 'auto' }}

//                       exit={{ opacity: 0, height: 0 }}

//                       className="mt-3 p-3 bg-white rounded-2"

//                     >

//                       <small className="text-dark d-flex align-items-center" style={{ fontSize: '1rem' }}>

//                         <Info size={16} className="me-2" />

//                         Please provide your spouse's information below

//                       </small>

//                     </motion.div>

//                   )}

//                 </div>

//               </AnimatedFormGroup>



//               {/* Spouse Information - Only show when checked */}

//               <AnimatePresence>

//                 {formData.is_Spouse && (

//                   <motion.div

//                     initial={{ opacity: 0, height: 0 }}

//                     animate={{ opacity: 1, height: 'auto' }}

//                     exit={{ opacity: 0, height: 0 }}

//                     transition={{ duration: 0.4 }}

//                   >

//                     <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                       <h4 className="mb-4" style={{ fontSize: '1.4rem' }}>

//                         <CIcon icon={cilUser} className="me-2" />

//                         Spouse Information

//                       </h4>

//                     </AnimatedFormGroup>

                    

//                     <CRow>

//                       <CCol md={4}>

//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                           <CFormLabel htmlFor="spouse_first_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                             Spouse First Name <span className="text-danger">*</span>

//                           </CFormLabel>

//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                             <CFormInput

//                               type="text"

//                               id="spouse_first_name"

//                               value={formData.spouse_first_name}

//                               onChange={handleInputChange}

//                               placeholder="Enter spouse first name"

//                               className={`shadow-sm ${validationErrors.spouse_first_name ? 'is-invalid' : ''}`}

//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                             />

//                             {validationErrors.spouse_first_name && (

//                               <motion.div 

//                                 initial={{ opacity: 0, y: -10 }}

//                                 animate={{ opacity: 1, y: 0 }}

//                                 className="invalid-feedback d-flex align-items-center"

//                                 style={{ fontSize: '0.95rem' }}

//                               >

//                                 <AlertTriangle size={14} className="me-1" />

//                                 {validationErrors.spouse_first_name}

//                               </motion.div>

//                             )}

//                           </motion.div>

//                         </AnimatedFormGroup>

//                       </CCol>

//                       <CCol md={4}>

//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                           <CFormLabel htmlFor="spouse_middle_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                             Spouse Middle Name <span className="text-danger">*</span>

//                           </CFormLabel>

//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                             <CFormInput

//                               type="text"

//                               id="spouse_middle_name"

//                               value={formData.spouse_middle_name}

//                               onChange={handleInputChange}

//                               placeholder="Enter spouse middle name"

//                               className={`shadow-sm ${validationErrors.spouse_middle_name ? 'is-invalid' : ''}`}

//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                             />

//                             {validationErrors.spouse_middle_name && (

//                               <motion.div 

//                                 initial={{ opacity: 0, y: -10 }}

//                                 animate={{ opacity: 1, y: 0 }}

//                                 className="invalid-feedback d-flex align-items-center"

//                                 style={{ fontSize: '0.95rem' }}

//                               >

//                                 <AlertTriangle size={14} className="me-1" />

//                                 {validationErrors.spouse_middle_name}

//                               </motion.div>

//                             )}

//                           </motion.div>

//                         </AnimatedFormGroup>

//                       </CCol>

//                       <CCol md={4}>

//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                           <CFormLabel htmlFor="spouse_last_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                             Spouse Last Name <span className="text-danger">*</span>

//                           </CFormLabel>

//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                             <CFormInput

//                               type="text"

//                               id="spouse_last_name"

//                               value={formData.spouse_last_name}

//                               onChange={handleInputChange}

//                               placeholder="Enter spouse last name"

//                               className={`shadow-sm ${validationErrors.spouse_last_name ? 'is-invalid' : ''}`}

//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                             />

//                             {validationErrors.spouse_last_name && (

//                               <motion.div 

//                                 initial={{ opacity: 0, y: -10 }}

//                                 animate={{ opacity: 1, y: 0 }}

//                                 className="invalid-feedback d-flex align-items-center"

//                                 style={{ fontSize: '0.95rem' }}

//                               >

//                                 <AlertTriangle size={14} className="me-1" />

//                                 {validationErrors.spouse_last_name}

//                               </motion.div>

//                             )}

//                           </motion.div>

//                         </AnimatedFormGroup>

//                       </CCol>

//                     </CRow>

//                   </motion.div>

//                 )}

//               </AnimatePresence>



//               {/* Child Information - Always show when NOT checked for spouse */}

//               <AnimatePresence>

//                 {!formData.is_Spouse && (

//                   <motion.div

//                     initial={{ opacity: 0, height: 0 }}

//                     animate={{ opacity: 1, height: 'auto' }}

//                     exit={{ opacity: 0, height: 0 }}

//                     transition={{ duration: 0.4 }}

//                   >

//                     <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                       <h4 className="mb-4 mt-3" style={{ fontSize: '1.4rem' }}>

//                         <Baby size={24} className="me-2" />

//                         Child Information (Optional)

//                       </h4>

//                     </AnimatedFormGroup>

                    

//                     <CRow>

//                       <CCol md={4}>

//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                           <CFormLabel htmlFor="child_first_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                             Child First Name

//                           </CFormLabel>

//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                             <CFormInput

//                               type="text"

//                               id="child_first_name"

//                               value={formData.child_first_name}

//                               onChange={handleInputChange}

//                               placeholder="Enter child first name"

//                               className="shadow-sm"

//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                             />

//                           </motion.div>

//                         </AnimatedFormGroup>

//                       </CCol>

//                       <CCol md={4}>

//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                           <CFormLabel htmlFor="chid_middle_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                             Child Middle Name

//                           </CFormLabel>

//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                             <CFormInput

//                               type="text"

//                               id="chid_middle_name"

//                               value={formData.chid_middle_name}

//                               onChange={handleInputChange}

//                               placeholder="Enter child middle name"

//                               className="shadow-sm"

//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                             />

//                           </motion.div>

//                         </AnimatedFormGroup>

//                       </CCol>

//                       <CCol md={4}>

//                         <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                           <CFormLabel htmlFor="child_last_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                             Child Last Name

//                           </CFormLabel>

//                           <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                             <CFormInput

//                               type="text"

//                               id="child_last_name"

//                               value={formData.child_last_name}

//                               onChange={handleInputChange}

//                               placeholder="Enter child last name"

//                               className="shadow-sm"

//                               style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                             />

//                           </motion.div>

//                         </AnimatedFormGroup>

//                       </CCol>

//                     </CRow>

//                   </motion.div>

//                 )}

//               </AnimatePresence>



//               {/* Medical Information */}

//               <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                 <h4 className="mb-4 mt-4" style={{ fontSize: '1.4rem' }}>

//                   <CIcon icon={cilMedicalCross} className="me-2" />

//                   Medical Information

//                 </h4>

//               </AnimatedFormGroup>

              

//               <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                 <CFormLabel htmlFor="medical_place" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                   <Building2 size={18} className="me-1" />

//                   Medical Provider <span className="text-danger">*</span>

//                 </CFormLabel>

//                 <SearchableDropdown

//                   providers={providers}

//                   value={formData.medical_place}

//                   onChange={handleMedicalPlaceChange}

//                   isLoading={isLoadingProviders}

//                   error={validationErrors.medical_place}

//                 />

//               </AnimatedFormGroup>



//               {/* Additional Information */}

//               <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                 <h4 className="mb-4 mt-4" style={{ fontSize: '1.4rem' }}>

//                   <CIcon icon={cilPencil} className="me-2" />

//                   Additional Information

//                 </h4>

//               </AnimatedFormGroup>

              

//               <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                 <CFormLabel htmlFor="employee_description" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

//                   Description <span className="text-danger">*</span>

//                 </CFormLabel>

//                 <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

//                   <CFormTextarea

//                     id="employee_description"

//                     rows="4"

//                     value={formData.employee_description}

//                     onChange={handleInputChange}

//                     placeholder="Provide details about the medical request"

//                     required

//                     className="shadow-sm"

//                     style={{ fontSize: '1.05rem', padding: '0.6rem' }}

//                   />

//                 </motion.div>

//               </AnimatedFormGroup>



//               <AnimatedFormGroup delay={delayIncrement += 0.1}>

//                 <div className="d-flex justify-content-between align-items-center mt-4">

//                   <motion.div

//                     initial={{ opacity: 0 }}

//                     animate={{ opacity: 1 }}

//                     transition={{ delay: 0.5 }}

//                     className="text-muted"

//                     style={{ fontSize: '1rem' }}

//                   >

//                     <Info size={18} className="me-2" />

//                     All fields marked with <span className="text-danger">*</span> are required

//                   </motion.div>

                  

//                   <motion.div

//                     whileHover={{ scale: 1.05 }}

//                     whileTap={{ scale: 0.95 }}

//                   >

//                     <CButton 

//                       type="submit" 

//                       color="danger" 

//                       disabled={isLoading}

//                       className={`px-5 py-2 ${isLoading ? 'position-relative' : ''}`}

//                       style={{

//                         background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

//                         border: 'none',

//                         fontSize: '1.1rem',

//                         fontWeight: '600'

//                       }}

//                     >

//                       {isLoading ? (

//                         <>

//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>

//                           Submitting...

//                         </>

//                       ) : (

//                         'Submit Request'

//                       )}

//                     </CButton>

//                   </motion.div>

//                 </div>

//               </AnimatedFormGroup>

//             </CForm>

//           </motion.div>

          

//           {isLoading && (

//             <motion.div

//               initial={{ opacity: 0, y: 20 }}

//               animate={{ opacity: 1, y: 0 }}

//               transition={{ duration: 0.3 }}

//             >

//               <CProgress 

//                 className="mt-3" 

//                 animated 

//                 value={progress}

//                 style={{

//                   background: 'linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%)',

//                   height: '8px'

//                 }}

//               />

//             </motion.div>

//           )}

//         </CCardBody>

//       </CCard>

//     </motion.div>

//   );

// };



// export default MedicalLetter;














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

  CFormCheck,

  CSpinner,

} from '@coreui/react';

import { cilCheckCircle, cilX, cilUser, cilMedicalCross, cilPencil, cilHeart } from '@coreui/icons';

import CIcon from '@coreui/icons-react';

import { useDispatch, useSelector } from 'react-redux';

import { AlertTriangle, Info, Heart, Users, Baby, Search, Building2, MapPin, Phone } from 'lucide-react';



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

    textElement.style.fontSize = '1.2rem';

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

        style={{ display: 'inline-block', fontSize: '1.2rem' }}

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



// Searchable Dropdown Component for Medical Providers

const SearchableDropdown = ({ providers, value, onChange, isLoading, error, filterType = 'all' }) => {

  const [isOpen, setIsOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const dropdownRef = useRef(null);



  // Get display text for selected value

  const getDisplayText = () => {

    if (!value) return '';

    const selected = providers.find(p => p.medical_institution === value);

    return selected ? selected.medical_institution : value;

  };




  // Sort providers by short_code (convert to number for proper sorting)

  const sortedProviders = [...providers].sort((a, b) => {

    const aNum = parseInt(a.short_code) || 9999; // Non-numeric codes get high value

    const bNum = parseInt(b.short_code) || 9999;

    return aNum - bNum;

  });



  // Split providers into two groups

  const addisAbabaProviders = sortedProviders.filter(provider => {

    const codeNum = parseInt(provider.short_code);

    return !isNaN(codeNum) && (codeNum >= 1 && codeNum <= 36) || codeNum == 49 || codeNum == 50 || codeNum == 51;
  });



  const outsideAddisProviders = sortedProviders.filter(provider => {

    const codeNum = parseInt(provider.short_code);

    return isNaN(codeNum) || codeNum < 1 || (codeNum > 36 && codeNum !== 49 && codeNum !== 50 && codeNum !== 51);

  });



  // Apply filter based on filterType

  let displayProviders = [];

  if (filterType === 'addis') {

    displayProviders = addisAbabaProviders;

  } else if (filterType === 'outside') {

    displayProviders = outsideAddisProviders;

  } else {

    displayProviders = [...addisAbabaProviders, ...outsideAddisProviders];

  }



  // Filter providers based on search term across all fields

  const filterProvider = (provider) => {

    const search = searchTerm.toLowerCase();

    return (

      provider.medical_institution.toLowerCase().includes(search) ||

      provider.location.toLowerCase().includes(search) ||

      provider.telephone_no.toLowerCase().includes(search) ||

      provider.short_code.toLowerCase().includes(search)

    );

  };



  const filteredProviders = displayProviders.filter(filterProvider);


  // Close dropdown when clicking outside

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {

        setIsOpen(false);

      }

    };



    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);

  }, []);



  const handleSelect = (provider) => {

    onChange(provider.medical_institution);

    setIsOpen(false);

    setSearchTerm('');

  };



  return (

    <div ref={dropdownRef} className="position-relative">

      <div 

        className={`form-control d-flex align-items-center justify-content-between shadow-sm ${error ? 'is-invalid' : ''}`}

        style={{ 

          fontSize: '1.05rem', 

          padding: '0.6rem',

          cursor: 'pointer',

          minHeight: '45px'

        }}

        onClick={() => setIsOpen(!isOpen)}

      >

        <span className={value ? 'text-dark' : 'text-muted'}>

          {value ? getDisplayText() : 'Select or search medical provider...'}

        </span>

        <motion.div

          animate={{ rotate: isOpen ? 180 : 0 }}

          transition={{ duration: 0.2 }}

        >

          <Search size={18} className="text-muted" />

        </motion.div>

      </div>



      <AnimatePresence>

        {isOpen && (

          <motion.div

            initial={{ opacity: 0, y: -10, scale: 0.95 }}

            animate={{ opacity: 1, y: 0, scale: 1 }}

            exit={{ opacity: 0, y: -10, scale: 0.95 }}

            transition={{ duration: 0.2 }}

            className="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-lg"

            style={{ 

              zIndex: 1000, 

              maxHeight: '400px',

              overflow: 'hidden'

            }}

          >

            {/* Search Input */}

            <div className="p-3 border-bottom" style={{ backgroundColor: '#f8f9fa' }}>

              <div className="position-relative">

                <Search 

                  size={18} 

                  className="position-absolute text-muted" 

                  style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }}

                />

                <input

                  type="text"

                  className="form-control ps-5"

                  placeholder="Search by name, location, phone, or code..."

                  value={searchTerm}

                  onChange={(e) => setSearchTerm(e.target.value)}

                  onClick={(e) => e.stopPropagation()}

                  autoFocus

                  style={{ fontSize: '0.95rem' }}

                />

              </div>

            </div>



            {/* Providers List */}

            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>

              {isLoading ? (

                <div className="text-center py-4">

                  <CSpinner size="sm" color="primary" />

                  <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.9rem' }}>Loading providers...</p>

                </div>

              ) : filteredProviders.length === 0 ? (

                <div className="text-center py-4">

                  <AlertTriangle size={32} className="text-muted mb-2" />

                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>

                    {searchTerm ? 'No providers match your search' : 'No providers available'}

                  </p>

                </div>

              ) : (

                <>

                  {filteredProviders.map((provider, index) => (

                    <motion.div

                      key={provider._id}

                      initial={{ opacity: 0, x: -10 }}

                      animate={{ opacity: 1, x: 0 }}

                      transition={{ delay: index * 0.02 }}

                      className="p-3 border-bottom"

                      style={{

                        cursor: 'pointer',

                        transition: 'background-color 0.2s'

                      }}

                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}

                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}

                      onClick={() => handleSelect(provider)}

                    >

                      <div className="d-flex align-items-start justify-content-between">

                        <div className="flex-grow-1">

                          <div className="d-flex align-items-center mb-1">

                            <Building2 size={16} className={`me-2 ${filterType === 'addis' ? 'text-primary' : 'text-warning'}`} />

                            <strong style={{ fontSize: '1rem' }}>{provider.medical_institution}</strong>

                          </div>

                          <div className="d-flex align-items-center text-muted mb-1" style={{ fontSize: '0.9rem' }}>

                            <MapPin size={14} className="me-2" />

                            <span>{provider.location}</span>

                          </div>

                          <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>

                            <Phone size={14} className="me-2" />

                            <span>{provider.telephone_no}</span>

                          </div>

                        </div>

                      </div>

                    </motion.div>

                  ))}

                </>

              )}

            </div>

          </motion.div>

        )}

      </AnimatePresence>


      {error && (

        <motion.div 

          initial={{ opacity: 0, y: -10 }}

          animate={{ opacity: 1, y: 0 }}

          className="invalid-feedback d-flex align-items-center"

          style={{ fontSize: '0.95rem', display: 'block' }}

        >

          <AlertTriangle size={14} className="me-1" />

          {error}

        </motion.div>

      )}

    </div>

  );

};



// Info Banner Component for Medical

const MedicalInfoBanner = () => {

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

          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

          cursor: 'pointer',

          border: '1px solid rgba(255,255,255,0.3)'

        }}

        onClick={() => setIsExpanded(!isExpanded)}

      >

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

            <Heart size={32} />

          </motion.div>

          

          <div className="flex-grow-1">

            <h5 className="mb-2 fw-bold d-flex align-items-center">

              <span className="me-2">🏥</span>

              Medical Letter Request Form

              <motion.span 

                className="ms-2"

                animate={{ scale: [1, 1.3, 1] }}

                transition={{ duration: 1, repeat: Infinity }}

              >

                ❤️

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

                      ✅ Check the box if this letter is for your spouse

                    </p>

                    <p className="mb-2">

                      👶 Child information is always available (optional)

                    </p>

                    <p className="mb-2">

                      🏥 Select medical provider from searchable dropdown

                    </p>

                    <p className="mb-0">

                      💡 Employee ID and assignment details are auto-fetched

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



const MedicalLetter = () => {

  const user = useSelector(state => state.user);

  const accessToken = user.accessToken;



  const [formData, setFormData] = useState({

    is_Spouse: false,

    medical_place: '',

    spouse_first_name: '',

    spouse_middle_name: '',

    spouse_last_name: '',

    child_first_name: '',

    chid_middle_name: '',

    child_last_name: '',

    employee_description: '',

  });



  const [providers, setProviders] = useState([]);

  const [isLoadingProviders, setIsLoadingProviders] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [status, setStatus] = useState(null);

  const [progress, setProgress] = useState(0);

  const [validationErrors, setValidationErrors] = useState({});



  // Helper function to check if a provider belongs to Addis Ababa

  const isAddisAbabaProvider = (providerName) => {

    const provider = providers.find(p => p.medical_institution === providerName);

    if (!provider) return false;

    const codeNum = parseInt(provider.short_code);

    return !isNaN(codeNum) && codeNum >= 1 && codeNum <= 36;

  };



  const formRef = useRef(null);



  let delayIncrement = 0.1;



  // Fetch medical providers on component mount

  useEffect(() => {

    fetchProviders();

  }, []);



  const fetchProviders = async () => {

    setIsLoadingProviders(true);

    try {

      const response = await fetch('https://aps2.zemenbank.com/zbss/api/medical-provider/get_all_medical_providers', {

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

    } finally {

      setIsLoadingProviders(false);

    }

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

    const { id, value, type, checked } = e.target;

    

    setFormData((prevData) => ({

      ...prevData,

      [id]: type === 'checkbox' ? checked : value,

    }));

  };



  const handleMedicalPlaceChange = (value) => {

    setFormData((prevData) => ({

      ...prevData,

      medical_place: value,

    }));

    // Clear validation error

    if (validationErrors.medical_place) {

      setValidationErrors(prev => ({ ...prev, medical_place: null }));

    }

  };



  const validateForm = () => {

    const errors = {};

    

    // Medical place is required

    if (!formData.medical_place || formData.medical_place.trim() === '') {

      errors.medical_place = 'Medical provider is required';

    }

    

    // If spouse is selected, spouse names are required

    if (formData.is_Spouse) {

      if (!formData.spouse_first_name || formData.spouse_first_name.trim() === '') {

        errors.spouse_first_name = 'Spouse first name is required when requesting for spouse';

      }

      if (!formData.spouse_middle_name || formData.spouse_middle_name.trim() === '') {

        errors.spouse_middle_name = 'Spouse middle name is required when requesting for spouse';

      }

      if (!formData.spouse_last_name || formData.spouse_last_name.trim() === '') {

        errors.spouse_last_name = 'Spouse last name is required when requesting for spouse';

      }

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

    setProgress(0);

  

    try {

      const response = await fetch('https://aps2.zemenbank.com/zbss/api/medical/register_request_medical', {

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

        message: data.message || 'Medical Letter Request submitted successfully!'

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

      is_Spouse: false,

      medical_place: '',

      spouse_first_name: '',

      spouse_middle_name: '',

      spouse_last_name: '',

      child_first_name: '',

      chid_middle_name: '',

      child_last_name: '',

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

      {/* Medical Badge */}

      <motion.div 

        className="text-center mb-3"

        initial={{ opacity: 0, scale: 0.8 }}

        animate={{ opacity: 1, scale: 1 }}

        transition={{ delay: 0.2, type: "spring" }}

      >

        <motion.span 

          className="badge bg-danger px-5 py-3 shadow" 

          style={{ fontSize: '1.3rem' }}

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

          🏥 Medical Letter Request

        </motion.span>

      </motion.div>



      {/* Info Banner */}

      <MedicalInfoBanner />



      <CCard className="mb-4 shadow-lg">

        <CCardHeader className="bg-danger text-white">

          <InfiniteScrollText text="Medical Letter Request Form" />

        </CCardHeader>

        <CCardBody className="p-4">

          <AnimatePresence mode="wait">

            <motion.div

              key={status ? 'alert' : 'no-alert'}

              initial={{ opacity: 0, y: -20 }}

              animate={{ opacity: 1, y: 0 }}

              exit={{ opacity: 0, y: -20 }}

              transition={{ duration: 0.3 }}

            >

              {status && (

                <CAlert color={status.type === 'success' ? 'success' : 'danger'} className="d-flex align-items-center" style={{ fontSize: '1.1rem' }}>

                  <CIcon icon={status.type === 'success' ? cilCheckCircle : cilX} className="flex-shrink-0 me-2" width={28} height={28} />

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

              {/* Spouse Checkbox */}

              <AnimatedFormGroup delay={delayIncrement}>

                <div className="mb-4 p-4 rounded-3 shadow-sm" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 50%)', border: '2px solid #feca57' }}>

                  <CFormCheck

                    type="checkbox"

                    id="is_Spouse"

                    checked={formData.is_Spouse}

                    onChange={handleInputChange}

                    label={

                      <span className="d-flex align-items-center" style={{ fontSize: '1.2rem', fontWeight: '600' }}>

                        <Users size={24} className="me-2" />

                        <strong>Is this medical letter for your spouse?</strong>

                      </span>

                    }

                    style={{ fontSize: '1.2rem' }}

                  />

                  {formData.is_Spouse && (

                    <motion.div

                      initial={{ opacity: 0, height: 0 }}

                      animate={{ opacity: 1, height: 'auto' }}

                      exit={{ opacity: 0, height: 0 }}

                      className="mt-3 p-3 bg-white rounded-2"

                    >

                      <small className="text-dark d-flex align-items-center" style={{ fontSize: '1rem' }}>

                        <Info size={16} className="me-2" />

                        Please provide your spouse's information below

                      </small>

                    </motion.div>

                  )}

                </div>

              </AnimatedFormGroup>



              {/* Spouse Information - Only show when checked */}

              <AnimatePresence>

                {formData.is_Spouse && (

                  <motion.div

                    initial={{ opacity: 0, height: 0 }}

                    animate={{ opacity: 1, height: 'auto' }}

                    exit={{ opacity: 0, height: 0 }}

                    transition={{ duration: 0.4 }}

                  >

                    <AnimatedFormGroup delay={delayIncrement += 0.1}>

                      <h4 className="mb-4" style={{ fontSize: '1.4rem' }}>

                        <CIcon icon={cilUser} className="me-2" />

                        Spouse Information

                      </h4>

                    </AnimatedFormGroup>

                    

                    <CRow>

                      <CCol md={4}>

                        <AnimatedFormGroup delay={delayIncrement += 0.1}>

                          <CFormLabel htmlFor="spouse_first_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                            Spouse First Name <span className="text-danger">*</span>

                          </CFormLabel>

                          <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                            <CFormInput

                              type="text"

                              id="spouse_first_name"

                              value={formData.spouse_first_name}

                              onChange={handleInputChange}

                              placeholder="Enter spouse first name"

                              className={`shadow-sm ${validationErrors.spouse_first_name ? 'is-invalid' : ''}`}

                              style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                            />

                            {validationErrors.spouse_first_name && (

                              <motion.div 

                                initial={{ opacity: 0, y: -10 }}

                                animate={{ opacity: 1, y: 0 }}

                                className="invalid-feedback d-flex align-items-center"

                                style={{ fontSize: '0.95rem' }}

                              >

                                <AlertTriangle size={14} className="me-1" />

                                {validationErrors.spouse_first_name}

                              </motion.div>

                            )}

                          </motion.div>

                        </AnimatedFormGroup>

                      </CCol>

                      <CCol md={4}>

                        <AnimatedFormGroup delay={delayIncrement += 0.1}>

                          <CFormLabel htmlFor="spouse_middle_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                            Spouse Middle Name <span className="text-danger">*</span>

                          </CFormLabel>

                          <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                            <CFormInput

                              type="text"

                              id="spouse_middle_name"

                              value={formData.spouse_middle_name}

                              onChange={handleInputChange}

                              placeholder="Enter spouse middle name"

                              className={`shadow-sm ${validationErrors.spouse_middle_name ? 'is-invalid' : ''}`}

                              style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                            />

                            {validationErrors.spouse_middle_name && (

                              <motion.div 

                                initial={{ opacity: 0, y: -10 }}

                                animate={{ opacity: 1, y: 0 }}

                                className="invalid-feedback d-flex align-items-center"

                                style={{ fontSize: '0.95rem' }}

                              >

                                <AlertTriangle size={14} className="me-1" />

                                {validationErrors.spouse_middle_name}

                              </motion.div>

                            )}

                          </motion.div>

                        </AnimatedFormGroup>

                      </CCol>

                      <CCol md={4}>

                        <AnimatedFormGroup delay={delayIncrement += 0.1}>

                          <CFormLabel htmlFor="spouse_last_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                            Spouse Last Name <span className="text-danger">*</span>

                          </CFormLabel>

                          <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                            <CFormInput

                              type="text"

                              id="spouse_last_name"

                              value={formData.spouse_last_name}

                              onChange={handleInputChange}

                              placeholder="Enter spouse last name"

                              className={`shadow-sm ${validationErrors.spouse_last_name ? 'is-invalid' : ''}`}

                              style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                            />

                            {validationErrors.spouse_last_name && (

                              <motion.div 

                                initial={{ opacity: 0, y: -10 }}

                                animate={{ opacity: 1, y: 0 }}

                                className="invalid-feedback d-flex align-items-center"

                                style={{ fontSize: '0.95rem' }}

                              >

                                <AlertTriangle size={14} className="me-1" />

                                {validationErrors.spouse_last_name}

                              </motion.div>

                            )}

                          </motion.div>

                        </AnimatedFormGroup>

                      </CCol>

                    </CRow>

                  </motion.div>

                )}

              </AnimatePresence>



              {/* Child Information - Always show when NOT checked for spouse */}

              <AnimatePresence>

                {!formData.is_Spouse && (

                  <motion.div

                    initial={{ opacity: 0, height: 0 }}

                    animate={{ opacity: 1, height: 'auto' }}

                    exit={{ opacity: 0, height: 0 }}

                    transition={{ duration: 0.4 }}

                  >

                    <AnimatedFormGroup delay={delayIncrement += 0.1}>

                      <h4 className="mb-4 mt-3" style={{ fontSize: '1.4rem' }}>

                        <Baby size={24} className="me-2" />

                        Child Information (Optional)

                      </h4>

                    </AnimatedFormGroup>

                    

                    <CRow>

                      <CCol md={4}>

                        <AnimatedFormGroup delay={delayIncrement += 0.1}>

                          <CFormLabel htmlFor="child_first_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                            Child First Name

                          </CFormLabel>

                          <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                            <CFormInput

                              type="text"

                              id="child_first_name"

                              value={formData.child_first_name}

                              onChange={handleInputChange}

                              placeholder="Enter child first name"

                              className="shadow-sm"

                              style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                            />

                          </motion.div>

                        </AnimatedFormGroup>

                      </CCol>

                      <CCol md={4}>

                        <AnimatedFormGroup delay={delayIncrement += 0.1}>

                          <CFormLabel htmlFor="chid_middle_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                            Child Middle Name

                          </CFormLabel>

                          <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                            <CFormInput

                              type="text"

                              id="chid_middle_name"

                              value={formData.chid_middle_name}

                              onChange={handleInputChange}

                              placeholder="Enter child middle name"

                              className="shadow-sm"

                              style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                            />

                          </motion.div>

                        </AnimatedFormGroup>

                      </CCol>

                      <CCol md={4}>

                        <AnimatedFormGroup delay={delayIncrement += 0.1}>

                          <CFormLabel htmlFor="child_last_name" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                            Child Last Name

                          </CFormLabel>

                          <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                            <CFormInput

                              type="text"

                              id="child_last_name"

                              value={formData.child_last_name}

                              onChange={handleInputChange}

                              placeholder="Enter child last name"

                              className="shadow-sm"

                              style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                            />

                          </motion.div>

                        </AnimatedFormGroup>

                      </CCol>

                    </CRow>

                  </motion.div>

                )}

              </AnimatePresence>



              {/* Medical Information */}

              <AnimatedFormGroup delay={delayIncrement += 0.1}>

                <h4 className="mb-4 mt-4" style={{ fontSize: '1.4rem' }}>

                  <CIcon icon={cilMedicalCross} className="me-2" />

                  Medical Information

                </h4>

              </AnimatedFormGroup>



              <CRow>

                <CCol md={6}>

                  <AnimatedFormGroup delay={delayIncrement += 0.1}>

                    <CFormLabel htmlFor="medical_place_addis" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                      <Building2 size={18} className="me-1" />

                      Medical Provider (Addis Ababa) <span className="text-danger">*</span>

                    </CFormLabel>

                    <SearchableDropdown

                      providers={providers}

                      value={formData.medical_place && isAddisAbabaProvider(formData.medical_place) ? formData.medical_place : ''}

                      onChange={handleMedicalPlaceChange}

                      isLoading={isLoadingProviders}

                      error={validationErrors.medical_place}

                      filterType="addis"

                    />

                  </AnimatedFormGroup>

                </CCol>

                <CCol md={6}>

                  <AnimatedFormGroup delay={delayIncrement += 0.1}>

                    <CFormLabel htmlFor="medical_place_outside" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                      <Building2 size={18} className="me-1" />

                      Medical Provider (Outside Addis Ababa) <span className="text-danger">*</span>

                    </CFormLabel>

                    <SearchableDropdown

                      providers={providers}

                      value={formData.medical_place && !isAddisAbabaProvider(formData.medical_place) ? formData.medical_place : ''}

                      onChange={handleMedicalPlaceChange}

                      isLoading={isLoadingProviders}

                      error={validationErrors.medical_place}

                      filterType="outside"

                    />

                  </AnimatedFormGroup>

                </CCol>

              </CRow>



              {/* Additional Information */}

              <AnimatedFormGroup delay={delayIncrement += 0.1}>

                <h4 className="mb-4 mt-4" style={{ fontSize: '1.4rem' }}>

                  <CIcon icon={cilPencil} className="me-2" />

                  Additional Information

                </h4>

              </AnimatedFormGroup>

              

              <AnimatedFormGroup delay={delayIncrement += 0.1}>

                <CFormLabel htmlFor="employee_description" style={{ fontSize: '1.1rem', fontWeight: '500' }}>

                  Description <span className="text-danger">*</span>

                </CFormLabel>

                <motion.div variants={inputVariants} whileFocus="focus" whileBlur="blur">

                  <CFormTextarea

                    id="employee_description"

                    rows="4"

                    value={formData.employee_description}

                    onChange={handleInputChange}

                    placeholder="Provide details about the medical request"

                    required

                    className="shadow-sm"

                    style={{ fontSize: '1.05rem', padding: '0.6rem' }}

                  />

                </motion.div>

              </AnimatedFormGroup>



              <AnimatedFormGroup delay={delayIncrement += 0.1}>

                <div className="d-flex justify-content-between align-items-center mt-4">

                  <motion.div

                    initial={{ opacity: 0 }}

                    animate={{ opacity: 1 }}

                    transition={{ delay: 0.5 }}

                    className="text-muted"

                    style={{ fontSize: '1rem' }}

                  >

                    <Info size={18} className="me-2" />

                    All fields marked with <span className="text-danger">*</span> are required

                  </motion.div>

                  

                  <motion.div

                    whileHover={{ scale: 1.05 }}

                    whileTap={{ scale: 0.95 }}

                  >

                    <CButton 

                      type="submit" 

                      color="danger" 

                      disabled={isLoading}

                      className={`px-5 py-2 ${isLoading ? 'position-relative' : ''}`}

                      style={{

                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

                        border: 'none',

                        fontSize: '1.1rem',

                        fontWeight: '600'

                      }}

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

                  background: 'linear-gradient(90deg, #e9ecef 0%, #f8f9fa 100%)',

                  height: '8px'

                }}

              />

            </motion.div>

          )}

        </CCardBody>

      </CCard>

    </motion.div>

  );

};



export default MedicalLetter;