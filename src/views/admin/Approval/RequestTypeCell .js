import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const RequestTypeCell = ({ value }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getRequestTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case 'experience': return '#3498db'; 
      case 'guranty': return '#e74c3c';  
      case 'supportive': return '#2ecc71'; 
      case 'embassy': return '#f39c12';  
      case 'medical': return '#9b59b6';
      default: return '#95a5a6';       
    }
  };

  const getRequestTypeIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'experience': return '🏢'; 
      case 'guranty': return '🔐';   
      case 'supportive': return '🤝'; 
      case 'embassy': return '🏛️'; 
      case 'medical':  return'🏥';
      default: return '❓';    
    }
  };

  const typeColor = getRequestTypeColor(value);
  const typeIcon = getRequestTypeIcon(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: typeColor,
        padding: '6px 12px',
        borderRadius: '20px',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: `0 0 10px ${typeColor}`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{typeIcon}</span>
      <span>{value}</span>
    </motion.div>
  );
};

export default function AnimatedRequestTypeColumn({ validationErrors, setValidationErrors }) {
  return {
    accessorKey: 'request_type',
    header: 'Request Type',
    size: 180,
    Cell: ({ cell }) => <RequestTypeCell value={cell.getValue()} />,
    muiEditTextFieldProps: {
      required: true,
      error: !!validationErrors?.request_type,
      helperText: validationErrors?.request_type,
      onFocus: () =>
        setValidationErrors({
          ...validationErrors,
          request_type: undefined,
        }),
    },
  };
}