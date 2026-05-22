import React, { useMemo, useState, useEffect } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import RefreshIcon from '@mui/icons-material/Refresh';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { Paper } from '@mui/material';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  keepPreviousData,
  useQueryClient,
} from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X as CloseIcon } from 'lucide-react';
import ExperienceLetterPreview from './ExperienceLetterPreview ';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../../api/base';

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short', // "Sat"
      month: 'short',   // "Oct"
      day: 'numeric',   // "12"
      year: 'numeric',  // "2022"
    });
  } catch (error) {
    return '';
  }
};

const StatusCell = ({ value }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    if (!status) return '#9E9E9E'; // Default color for null/undefined
    
    switch (status.toLowerCase()) {
      case 'pending': return '#FFA500';
      case 'viewed': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const statusColor = getStatusColor(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        background: statusColor,
        padding: '6px 12px',
        borderRadius: '20px',
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        boxShadow: `0 0 10px ${statusColor}`,
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {value || 'N/A'}
    </motion.div>
  );
};



const RequestTypeCell = ({ value, row, setSelectedDetail }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getRequestTypeColor = (type) => {
    if (!type) return '#95a5a6'; // Default color for null/undefined
    
    switch (type.toLowerCase()) {
      case 'experience': return '#3498db';
      case 'guranty': return '#e74c3c';
      case 'supportive': return '#2ecc71';
      case 'embassy': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getRequestTypeIcon = (type) => {
    if (!type) return '❓'; // Default icon for null/undefined
    
    switch (type.toLowerCase()) {
      case 'experience': return '🏢';
      case 'guranty': return '🔐';
      case 'supportive': return '🤝';
      case 'embassy': return '🏛️';
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
      onClick={() => setSelectedDetail(row.original)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span>{typeIcon}</span>
      <span>{value || 'Unknown'}</span>
    </motion.div>
  );
};

const AnimatedRequestTypeColumn = (setSelectedDetail) => ({
  accessorKey: 'request_type',
  header: 'Request Type',
  size: 180,
  Cell: ({ cell }) => (
    <RequestTypeCell 
      value={cell.getValue()} 
      row={cell.row}
      setSelectedDetail={setSelectedDetail}
    />
  ),
});




const Example = () => {
  const navigate = useNavigate();
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);

  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(null);


  const accessToken = useSelector((state) => state.user.accessToken);
  console.log("accessTokenaccessTokenaccessTokenaccessToken", accessToken)
  
  const {
    data: fetchData = { data: [], meta: {} },
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['table-data', columnFilters, globalFilter, sorting],
    queryFn: async () => {
      const fetchURL = new URL(`${API_BASE}/rms/admin/landing/get_candidate`, window.location.origin);

      fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
      fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
      fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

      const response = await fetch(fetchURL.href, {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken,
        },
      });
      
      const json = await response.json();
      return json;
    },
    placeholderData: keepPreviousData,
  });

  const { data = [], meta } = fetchData;

  const handlePrintClick = (row) => {
    const requestType = row.original.request_type.toLowerCase();
    switch(requestType) {
      case 'experience':
        navigate('/admin/experiance', { state: { rowData: row.original } });
        break;
      case 'supportive':
        if(row.original.language === "english"){
          navigate('/admin/supportive', { state: { rowData: row.original } });
        }
        else{
          navigate('/admin/supportive-am', { state: { rowData: row.original } })
        }
        break;
      case 'guranty':
        navigate('/admin/guaranty', { state: { rowData: row.original } });
        break;
      case 'embassy':
        navigate('/admin/embassy', { state: { rowData: row.original } });
        break;

      case 'medical':
        navigate('/admin/medical', { state: { rowData: row.original } });
        break;

      default:
        console.error('Invalid request type');
        // Optionally, you can show an error toast here
        // toast.error('Invalid request type');
    }
  };


  const columns = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: 'Request Status',
        enableEditing: false,
        size: 150,
        Cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
      },
      AnimatedRequestTypeColumn(setSelectedDetail),
      {
        accessorKey: 'employee_first_name',
        header: 'First Name',
      },
      {
        accessorKey: 'employee_middle_name',
        header: 'Middle Name',
      },
      {
        accessorKey: 'employee_last_name',
        header: 'Last Name',
      },
      {
        accessorKey: 'employee_description',
        header: 'Employee Description',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'domain_user',
        header: 'Domain User',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'TimeStamp',
        header: 'Created At',
        filterVariant: 'date',
        filterFn: 'between',
        sortingFn: 'datetime',
        Cell: ({ cell }) => formatDate(cell.getValue()),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'viewed_by',
        header: 'Viewed by',
        enableEditing: false,
        size: 80,
      },

      {
        accessorKey: 'viewed_date',
        header: 'Viewed Date',
        filterVariant: 'date',
        filterFn: 'between',
        sortingFn: 'datetime',
        Cell: ({ cell }) => formatDate(cell.getValue()),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        enableEditing: false,
        size: 80,
      },

      
    ],
    
    []
  );


  const table = useMaterialReactTable({
    columns,
    data, 
    paginationDisplayMode: 'pages',
    enableColumnOrdering: true,
    enableGrouping: true,
    enableStickyHeader: true,
    enableRowActions: true,
    enableRowPinning: true,
    enableFacetedValues: true,
    enableColumnPinning: true,
    rowPinningDisplayMode: 'top-and-bottom',
    muiToolbarAlertBannerProps: isError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    createDisplayMode: 'modal',
    editDisplayMode: 'modal',
    enableEditing: false,
    getRowId: (row) => row.id,
    muiTableContainerProps: {
      sx: { minHeight: '500px' },
    },
    renderRowActions: ({ row }) => {
      if (row.original.status === 'Pending' || row.original.status === 'Rejected') {
        return null; 
      }
      return (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Tooltip title="Preview">
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              <Button
                variant="contained"
                color="success"
                onClick={() => handlePrintClick(row)}
              >
                Preview
              </Button>
            </motion.div>
          </Tooltip>
        </Box>
      );
    },
    renderTopToolbarCustomActions: () => (
      <Tooltip title="Refresh Data">
        <IconButton onClick={() => refetch()}>
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    ),
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
  });

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: { 
        duration: 0.2
      }
    }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        delay: 0.2,
        duration: 0.5
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  const ConfirmationModal = ({ open, onClose, onConfirm, title, message, confirmText, confirmColor, icon: Icon }) => (
    <AnimatePresence>
      {open && (
        <Dialog 
          open={open} 
          onClose={onClose}
          PaperProps={{
            style: {
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            }
          }}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Box
              sx={{
                background: `linear-gradient(135deg, ${confirmColor}22, ${confirmColor}44)`,
                padding: '24px',
              }}
            >
              <DialogTitle sx={{ padding: 0, marginBottom: '16px' }}>
                <Typography variant="h5" component="div" sx={{ fontWeight: 'bold', color: confirmColor }}>
                  {title}
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ padding: 0 }}>
                <motion.div variants={contentVariants}>
                  <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                    <Icon size={40} color={confirmColor} style={{ marginRight: '16px' }} />
                    <Typography variant="body1">{message}</Typography>
                  </Box>
                </motion.div>
              </DialogContent>
              <DialogActions sx={{ padding: 0, justifyContent: 'flex-end' }}>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button onClick={onClose} variant="outlined" sx={{ marginRight: '8px' }}>
                    Cancel
                  </Button>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button 
                    onClick={onConfirm} 
                    variant="contained" 
                    sx={{ 
                      bgcolor: confirmColor,
                      '&:hover': {
                        bgcolor: `${confirmColor}dd`,
                      }
                    }}
                  >
                    {confirmText}
                  </Button>
                </motion.div>
              </DialogActions>
            </Box>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  );

  // Add this component before the Example component
  const DetailPanel = ({ isOpen, onClose, data }) => {
    const getRequestTypeColor = (type) => {
      switch (type?.toLowerCase()) {
        case 'experience': return '#3498db';
        case 'guranty': return '#e74c3c';
        case 'supportive': return '#2ecc71';
        case 'embassy': return '#f39c12';
        default: return '#95a5a6';
      }
    };

    const getRequestTypeIcon = (type) => {
      switch (type?.toLowerCase()) {
        case 'experience': return '🏢';
        case 'guranty': return '🔐';
        case 'supportive': return '🤝';
        case 'embassy': return '🏛️';
        default: return '❓';
      }
    };

    const typeColor = getRequestTypeColor(data?.request_type);

    const formatDetailDateTime = (dateString) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'short', // "Sat"
          month: 'short',   // "Oct"
          day: 'numeric',   // "12"
          year: 'numeric',  // "2024"
        });

        const formattedTime = date.toLocaleTimeString('en-US', {
          hour: '2-digit',    // "04"
          minute: '2-digit',  // "45"
          hour12: true        // PM
        });

        return `${formattedDate} at ${formattedTime}`;
      } catch (error) {
        return dateString;
      }
    };

    const formatValue = (value, key) => {
      if (value === null || value === undefined) return '-';

      // Handle date fields
      if (['TimeStamp', 'viewed_date', 'created_at', 'updated_at'].includes(key) && value) {
        return formatDetailDateTime(value);
      }

      // Special handling for experiences array
      if (key === 'experiences' && Array.isArray(value)) {
        try {
          const experiences = typeof value === 'string' ? JSON.parse(value) : value;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderLeft: `4px solid ${typeColor}`,
                      backgroundColor: `${typeColor}08`,
                      '&:hover': {
                        backgroundColor: `${typeColor}12`,
                        transform: 'translateX(8px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: typeColor }}>
                      {exp.position}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {exp.period}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          );
        } catch (error) {
          console.error('Error parsing experiences:', error);
          return String(value);
        }
      }

      // Handle other array types
      if (Array.isArray(value)) {
        return value.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');
      }

      // Handle date objects
      if (value instanceof Date) {
        return formatDetailDateTime(value);
      }

      // Handle regular objects
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }

      return String(value);
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 100,
                damping: 20
              }
            }}
            exit={{ 
              x: '100%', 
              opacity: 0,
              transition: { 
                duration: 0.3,
                ease: "easeInOut"
              }
            }}
            style={{
              position: 'fixed',
              top: '0',
              right: '0',
              width: '75%',
              height: '100%',
              backgroundColor: 'white',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
              zIndex: 1000,
              overflow: 'auto',
            }}
          >
            <Box sx={{ 
              p: 4, 
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 4
              }}>
                <Typography variant="h4" sx={{ 
                  color: typeColor, 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {getRequestTypeIcon(data?.request_type)}
                  {data?.request_type} Details
                </Typography>
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <IconButton 
                    onClick={onClose}
                    sx={{
                      backgroundColor: `${typeColor}22`,
                      '&:hover': { 
                        backgroundColor: `${typeColor}33`,
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </motion.div>
              </Box>

              {/* Content */}
              <Box sx={{ 
                flex: 1,
                display: 'grid', 
                gap: 3,
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                overflow: 'auto',
                pb: 10 // Add padding bottom for the cancel button
              }}>
                {Object.entries(data || {}).map(([key, value]) => (
                  key !== '_id' && key !== '__v' && (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          border: `1px solid ${typeColor}22`,
                          backgroundColor: `${typeColor}05`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: `${typeColor}10`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 8px 24px ${typeColor}15`
                          }
                        }}
                      >
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: typeColor,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {key.replace(/_/g, ' ')}
                        </Typography>
                        <Typography 
                          component="div"
                          sx={{ 
                            mt: 1,
                            color: 'text.primary',
                            wordBreak: 'break-word'
                          }}
                        >
                          {formatValue(value, key)}
                        </Typography>
                      </Paper>
                    </motion.div>
                  )
                ))}
              </Box>

              {/* Cancel Button */}
              <Box sx={{ 
                position: 'fixed',
                bottom: 0,
                right: 0,
                width: '75%',
                p: 3,
                background: 'linear-gradient(transparent, white 20%)',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    onClick={onClose}
                    variant="contained"
                    startIcon={<CloseIcon />}
                    sx={{
                      backgroundColor: typeColor,
                      color: 'white',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      boxShadow: `0 4px 15px ${typeColor}44`,
                      '&:hover': {
                        backgroundColor: typeColor,
                        opacity: 0.9,
                        boxShadow: `0 6px 20px ${typeColor}66`,
                      }
                    }}
                  >
                    Close Details
                  </Button>
                </motion.div>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <>
      <MaterialReactTable table={table} />
      <DetailPanel 
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        data={selectedDetail}
      />
      <Dialog
        open={openPreviewModal}
        onClose={() => setOpenPreviewModal(false)}
        fullWidth
        maxWidth="md"
      >
        <ExperienceLetterPreview onClose={() => setOpenPreviewModal(false)} />
      </Dialog>
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
    </>
  );
};

const queryClient = new QueryClient();

const ExampleWithProviders = () => (
  <QueryClientProvider client={queryClient}>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Example />
    </LocalizationProvider>
  </QueryClientProvider>
);

export default ExampleWithProviders;