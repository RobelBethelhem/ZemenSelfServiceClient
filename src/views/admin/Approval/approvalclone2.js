import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import * as XLSX from 'xlsx';

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
  Paper,
  Tabs,
  Tab,
  Chip,
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
import  { useApproveRequest, useRejectRequest } from './ApprovalEndpoint'
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate } from 'react-router-dom';



const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return '';
    
    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',    // "Sat"
      month: 'short',      // "Oct"
      day: 'numeric',      // "12"
      year: 'numeric',     // "2024"
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',     // "04"
      minute: '2-digit',   // "45"
      hour12: true         // PM
    });

    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    return '';
  }
};

// Add these utility functions at the top of your file
const getRequestTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'experiance': return '#3498db';
    case 'guranty': return '#e74c3c';
    case 'supportive': return '#2ecc71';
    case 'embassy': return '#f39c12';
    default: return '#95a5a6';
  }
};

const getRequestTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'experiance': return '🏢';
    case 'guranty': return '🔐';
    case 'supportive': return '🤝';
    case 'embassy': return '🏛️';
    default: return '❓';
  }
};

const StatusCell = ({ value }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
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
      {value}
    </motion.div>
  );
};

const bounceAnimation = {
  y: [0, -10, 0],
  transition: {
    y: {
      repeat: Infinity,
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

const RequestTypeCell = ({ value, row, setSelectedDetail }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const typeColor = getRequestTypeColor(value);
  const typeIcon = getRequestTypeIcon(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      transition={{ duration: 3, ease: "easeOut" }}
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
      whileHover={{ 
        scale: 1.05,
        boxShadow: `0 0 20px ${typeColor}`,
      }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setSelectedDetail(row.original)}
    >
      <span>{typeIcon}</span>
      <span>{value}</span>
    </motion.div>
  );
};

const DetailPanel = ({ isOpen, onClose, data, entranceDirection }) => {
  const typeColor = getRequestTypeColor(data?.request_type);

  const getAnimationVariants = () => {
    switch (entranceDirection) {
      case 1: // From left
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: { 
            x: 0, 
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 20
            }
          },
          exit: { 
            x: '-100%', 
            opacity: 0,
            transition: { 
              duration: 0.3,
              ease: "easeInOut"
            }
          },
          style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '75%',
            height: '100%',
            backgroundColor: 'white',
            boxShadow: '10px 0 40px rgba(0,0,0,0.2)',
            zIndex: 9999,
            overflow: 'hidden'
          }
        };
      
      case 2: // From right
        return {
          initial: { x: '100%', opacity: 0 },
          animate: { 
            x: 0, 
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 100,
              damping: 20
            }
          },
          exit: { 
            x: '100%', 
            opacity: 0,
            transition: { 
              duration: 0.3,
              ease: "easeInOut"
            }
          },
          style: {
            position: 'fixed',
            top: '0',
            right: '0',
            width: '75%',
            height: '100%',
            backgroundColor: 'white',
            boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
            zIndex: 9999,
            overflow: 'hidden'
          }
        };
      
      default:
        return null;
    }
  };

  const variants = getAnimationVariants();

  const formatDetailDateTime = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      
      const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',    // "Sat"
        month: 'short',      // "Oct"
        day: 'numeric',      // "12"
        year: 'numeric',     // "2024"
      });

      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',     // "04"
        minute: '2-digit',   // "45"
        hour12: true         // PM
      });

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '-';

    // Handle date fields
    if (['TimeStamp', 'viewed_date', 'created_at', 'updated_at', 'approved_date', 'rejected_date'].includes(key) && value) {
      return formatDetailDateTime(value);
    }

    // Special handling for experiences array
    if (key === 'experiences' && Array.isArray(value)) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {value.map((exp, index) => (
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ 
                      fontWeight: 'bold',
                      color: typeColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    {exp.position}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{ 
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  }}
                >
                  {exp.period}
                </Typography>
              </Paper>
            </motion.div>
          ))}
        </Box>
      );
    }

    // Handle other array types
    if (Array.isArray(value)) {
      return value.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');
    }

    // Handle regular objects
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  // Helper function to determine if a field should be displayed
  const shouldDisplayField = (key, value) => {
    const excludedKeys = ['_id', '__v'];
    return !excludedKeys.includes(key) && value !== undefined && value !== null;
  };

  return (
    <AnimatePresence>
      {isOpen && variants && (
        <motion.div
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          style={variants.style}
        >
          <motion.div
            className="panel-content"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.2 }
            }}
            style={{
              padding: '32px',
              height: '100%',
              overflow: 'auto'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '32px',
              borderBottom: `3px solid ${typeColor}`,
              paddingBottom: '16px'
            }}>
              <Box>
                <Typography variant="overline" sx={{ color: typeColor }}>
                  Request Details
                </Typography>
                <Typography variant="h4" sx={{ 
                  fontWeight: 'bold',
                  color: typeColor
                }}>
                  {data?.request_type || 'Request'} Information
                </Typography>
              </Box>
              <motion.div
                whileHover={{ rotate: 90 }}
                transition={{ duration: 0.3 }}
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

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Box sx={{ 
                display: 'grid', 
                gap: '24px',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
              }}>
                {Object.entries(data || {}).map(([key, value]) => (
                  shouldDisplayField(key, value) && (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: '16px',
                          border: `1px solid ${typeColor}22`,
                          background: `${typeColor}05`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            background: `${typeColor}10`,
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
                          variant="body1" 
                          sx={{ 
                            fontWeight: 'medium',
                            marginTop: '4px',
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
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              style={{
                position: 'sticky',
                bottom: 32,
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: '24px',
                marginTop: '24px',
                borderTop: `1px solid ${typeColor}22`
              }}
            >
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
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor,
  icon: Icon
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '16px',
          minWidth: '400px'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {Icon && (
            <Icon
              size={24}
              style={{ color: confirmColor }}
            />
          )}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 24px'
            }}
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={onConfirm}
            variant="contained"
            sx={{
              backgroundColor: confirmColor,
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: confirmColor,
                opacity: 0.9
              }
            }}
          >
            {confirmText}
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

const Example = () => {
  const navigate = useNavigate();
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState([]);
  const [openApproveModal, setOpenApproveModal] = useState(false);
  const [openRejectModal, setOpenRejectModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [entranceDirection, setEntranceDirection] = useState(1);
  const [activeTab, setActiveTab] = useState(0);

  const accessToken = useSelector((state) => state.user.accessToken);
  
  const {
    data: fetchData = { data: [], meta: {} },
    isError,
    isRefetching,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['table-data', columnFilters, globalFilter, sorting],
    queryFn: async () => {
      const fetchURL = new URL('https://aps2.zemenbank.com/zbss/api/rms/admin/landing/get_candidate');

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
        navigate('/admin/supportive', { state: { rowData: row.original } });
        break;
      case 'guranty':
        navigate('/admin/guaranty', { state: { rowData: row.original } });
        break;
      case 'embassy':
        navigate('/admin/embassy', { state: { rowData: row.original } });
        break;
      default:
        console.error('Invalid request type');
        // Optionally, you can show an error toast here
        // toast.error('Invalid request type');
    }
  };

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const worksheet = XLSX.utils.json_to_sheet(rowData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
    XLSX.writeFile(workbook, "RequestsExport.xlsx");
  };

  const handleExportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
    XLSX.writeFile(workbook, "AllRequestsExport.xlsx");
  };

  const handleOpenDetail = useCallback((data) => {
    const randomDirection = Math.floor(Math.random() * 2) + 1;
    setEntranceDirection(randomDirection);
    setSelectedDetail(data);
  }, []);

  const AnimatedRequestTypeColumn = useCallback(() => ({
    accessorKey: 'request_type',
    header: 'Request Type',
    size: 180,
    Cell: ({ cell, row }) => (
      <RequestTypeCell 
        value={cell.getValue()} 
        row={row} 
        setSelectedDetail={handleOpenDetail}
      />
    ),
  }), [handleOpenDetail]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'status',
        header: 'Request Status',
        enableEditing: false,
        size: 150,
        Cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
      },
      AnimatedRequestTypeColumn(),
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
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        enableEditing: false,
        minSize: 200,
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
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        enableEditing: false,
        minSize: 200,
      },

      
    ],
    [AnimatedRequestTypeColumn]
  );

  const { mutateAsync: approveRequest, isPending: isApprovingRequest } = useApproveRequest(refetch);
  const { mutateAsync: rejectRequest, isPending: isRejectingRequest } = useRejectRequest(refetch);

  const handleApproveConfirm = async () => {
    if (selectedRow) {
      await approveRequest({
        id: selectedRow.original.id,
        request_type: selectedRow.original.request_type
      });
      setOpenApproveModal(false);
      setSelectedRow(null);
    }
  };

  const handleRejectConfirm = async () => {
    if (selectedRow) {
      await rejectRequest({
        id: selectedRow.original.id,
        request_type: selectedRow.original.request_type
      });
      setOpenRejectModal(false);
      setSelectedRow(null);
    }
  };

  const viewedData = useMemo(() => 
    data.filter(item => item.status === 'Viewed'),
    [data]
  );

  const pendingData = useMemo(() => 
    data.filter(item => item.status === 'Pending'),
    [data]
  );

  const rejectedData = useMemo(() => 
    data.filter(item => item.status === 'Rejected'),
    [data]
  );

  const createTableInstance = (filteredData, showActions = true) => useMaterialReactTable({
    columns: columns.filter(col => col.accessorKey !== 'status'),
    data: filteredData,
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
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    renderRowActions: showActions ? ({ row }) => {
      if (activeTab === 1) {
        return (
          <Box sx={{ display: 'flex', gap: '1rem' }}>
            <Tooltip title="Approve">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
              >
                <Button
                  variant="contained"
                  color="success"
                  onClick={() => {
                    setOpenApproveModal(true);
                    setSelectedRow(row);
                  }}
                >
                  Approve
                </Button>
              </motion.div>
            </Tooltip>
            <Tooltip title="Reject">
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100, damping: 10 }}
              >
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => {
                    setOpenRejectModal(true);
                    setSelectedRow(row);
                  }}
                >
                  Reject
                </Button>
              </motion.div>
            </Tooltip>
          </Box>
        );
      } else if (activeTab === 0) {
        return (
          <Tooltip title="Preview">
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100, damping: 10 }}
            >
              <motion.div animate={bounceAnimation}>
                <Button
                  variant="contained"
                  style={{ 
                    backgroundColor: '#FFA500', 
                    color: 'white',
                    padding: '6px 16px',
                  }}
                  startIcon={<PreviewIcon />}
                  onClick={() => handlePrintClick(row)}
                >
                  Preview
                </Button>
              </motion.div>
            </motion.div>
          </Tooltip>
        );
      }
      return null;
    } : undefined,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      rowSelection,
    },
  });

  const viewedTable = createTableInstance(viewedData);
  const pendingTable = createTableInstance(pendingData);
  const rejectedTable = createTableInstance(rejectedData, false);

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 'bold',
              textTransform: 'none',
              minWidth: 120,
            },
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Viewed</span>
                <Chip 
                  label={viewedData.length} 
                  size="small" 
                  sx={{ bgcolor: '#4CAF50', color: 'white' }}
                />
              </Box>
            } 
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Pending</span>
                <Chip 
                  label={pendingData.length} 
                  size="small" 
                  sx={{ bgcolor: '#FFA500', color: 'white' }}
                />
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Rejected</span>
                <Chip 
                  label={rejectedData.length} 
                  size="small" 
                  sx={{ bgcolor: '#F44336', color: 'white' }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <MaterialReactTable table={viewedTable} />
      </Box>
      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <MaterialReactTable table={pendingTable} />
      </Box>
      <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
        <MaterialReactTable table={rejectedTable} />
      </Box>

      <DetailPanel 
        isOpen={!!selectedDetail}
        onClose={() => setSelectedDetail(null)}
        data={selectedDetail || {}}
        entranceDirection={entranceDirection}
      />

      <ConfirmationModal
        open={openApproveModal}
        onClose={() => setOpenApproveModal(false)}
        onConfirm={handleApproveConfirm}
        title="Approve Request"
        message="Are you sure you want to approve this request?"
        confirmText={isApprovingRequest ? 'Approving...' : 'Approve'}
        confirmColor="#4CAF50"
        icon={CheckCircle}
      />

      <ConfirmationModal
        open={openRejectModal}
        onClose={() => setOpenRejectModal(false)}
        onConfirm={handleRejectConfirm}
        title="Reject Request"
        message="Are you sure you want to reject this request?"
        confirmText={isRejectingRequest ? 'Rejecting...' : 'Reject'}
        confirmColor="#F44336"
        icon={XCircle}
      />

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
