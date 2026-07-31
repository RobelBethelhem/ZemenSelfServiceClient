// import React, { useMemo, useState, useEffect, useCallback } from 'react';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
// } from 'material-react-table';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import BlockIcon from '@mui/icons-material/Block';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import * as XLSX from 'xlsx';

// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   Tooltip,
//   Typography,
//   Paper,
//   Tabs,
//   Tab,
//   Chip,
// } from '@mui/material';
// import {
//   QueryClient,
//   QueryClientProvider,
//   useMutation,
//   useQuery,
//   keepPreviousData,
//   useQueryClient,
// } from '@tanstack/react-query';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CheckCircle, XCircle, X as CloseIcon } from 'lucide-react';
// import  { useApproveRequest, useRejectRequest } from './ApprovalEndpoint'
// import PreviewIcon from '@mui/icons-material/Preview';
// import { useNavigate } from 'react-router-dom';



// const formatDateTime = (dateString) => {
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date)) return '';
    
//     const formattedDate = date.toLocaleDateString('en-US', {
//       weekday: 'short',    // "Sat"
//       month: 'short',      // "Oct"
//       day: 'numeric',      // "12"
//       year: 'numeric',     // "2024"
//     });

//     const formattedTime = date.toLocaleTimeString('en-US', {
//       hour: '2-digit',     // "04"
//       minute: '2-digit',   // "45"
//       hour12: true         // PM
//     });

//     return `${formattedDate} at ${formattedTime}`;
//   } catch (error) {
//     return '';
//   }
// };

// // Add these utility functions at the top of your file
// const getRequestTypeColor = (type) => {
//   switch (type?.toLowerCase()) {
//     case 'experience': return '#3498db';
//     case 'guranty': return '#e74c3c';
//     case 'supportive': return '#2ecc71';
//     case 'embassy': return '#f39c12';
//     default: return '#95a5a6';
//   }
// };

// const getRequestTypeIcon = (type) => {
//   switch (type?.toLowerCase()) {
//     case 'experience': return '🏢';
//     case 'guranty': return '🔐';
//     case 'supportive': return '🤝';
//     case 'embassy': return '🏛️';
//     default: return '❓';
//   }
// };

// const StatusCell = ({ value }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 300);
//     return () => clearTimeout(timer);
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'pending': return '#FFA500';
//       case 'viewed': return '#4CAF50';
//       default: return '#9E9E9E';
//     }
//   };

//   const statusColor = getStatusColor(value);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.5 }}
//       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
//       transition={{ duration: 0.5, ease: "easeOut" }}
//       style={{
//         background: statusColor,
//         padding: '6px 12px',
//         borderRadius: '20px',
//         color: 'white',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         boxShadow: `0 0 10px ${statusColor}`,
//         cursor: 'pointer',
//       }}
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       {value}
//     </motion.div>
//   );
// };

// const bounceAnimation = {
//   y: [0, -10, 0],
//   transition: {
//     y: {
//       repeat: Infinity,
//       duration: 1.5,
//       ease: "easeInOut"
//     }
//   }
// };

// const RequestTypeCell = ({ value, row, setSelectedDetail }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 300);
//     return () => clearTimeout(timer);
//   }, []);

//   const typeColor = getRequestTypeColor(value);
//   const typeIcon = getRequestTypeIcon(value);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.5 }}
//       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
//       transition={{ duration: 3, ease: "easeOut" }}
//       style={{
//         background: typeColor,
//         padding: '6px 12px',
//         borderRadius: '20px',
//         color: 'white',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         boxShadow: `0 0 10px ${typeColor}`,
//         cursor: 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: '8px',
//       }}
//       whileHover={{ 
//         scale: 1.05,
//         boxShadow: `0 0 20px ${typeColor}`,
//       }}
//       whileTap={{ scale: 0.95 }}
//       onClick={() => setSelectedDetail(row.original)}
//     >
//       <span>{typeIcon}</span>
//       <span>{value}</span>
//     </motion.div>
//   );
// };

// const DetailPanel = ({ isOpen, onClose, data, entranceDirection }) => {
//   const typeColor = getRequestTypeColor(data?.request_type);

//   const getAnimationVariants = () => {
//     switch (entranceDirection) {
//       case 1: // From left
//         return {
//           initial: { x: '-100%', opacity: 0 },
//           animate: { 
//             x: 0, 
//             opacity: 1,
//             transition: {
//               type: "spring",
//               stiffness: 100,
//               damping: 20
//             }
//           },
//           exit: { 
//             x: '-100%', 
//             opacity: 0,
//             transition: { 
//               duration: 0.3,
//               ease: "easeInOut"
//             }
//           },
//           style: {
//             position: 'fixed',
//             top: '0',
//             left: '0',
//             width: '75%',
//             height: '100%',
//             backgroundColor: 'white',
//             boxShadow: '10px 0 40px rgba(0,0,0,0.2)',
//             zIndex: 9999,
//             overflow: 'hidden'
//           }
//         };
      
//       case 2: // From right
//         return {
//           initial: { x: '100%', opacity: 0 },
//           animate: { 
//             x: 0, 
//             opacity: 1,
//             transition: {
//               type: "spring",
//               stiffness: 100,
//               damping: 20
//             }
//           },
//           exit: { 
//             x: '100%', 
//             opacity: 0,
//             transition: { 
//               duration: 0.3,
//               ease: "easeInOut"
//             }
//           },
//           style: {
//             position: 'fixed',
//             top: '0',
//             right: '0',
//             width: '75%',
//             height: '100%',
//             backgroundColor: 'white',
//             boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
//             zIndex: 9999,
//             overflow: 'hidden'
//           }
//         };
      
//       default:
//         return null;
//     }
//   };

//   const variants = getAnimationVariants();

//   const formatDetailDateTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date)) return dateString;
      
//       const formattedDate = date.toLocaleDateString('en-US', {
//         weekday: 'short',    // "Sat"
//         month: 'short',      // "Oct"
//         day: 'numeric',      // "12"
//         year: 'numeric',     // "2024"
//       });

//       const formattedTime = date.toLocaleTimeString('en-US', {
//         hour: '2-digit',     // "04"
//         minute: '2-digit',   // "45"
//         hour12: true         // PM
//       });

//       return `${formattedDate} at ${formattedTime}`;
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const formatValue = (value, key) => {
//     if (value === null || value === undefined) return '-';

//     // Handle date fields
//     if (['TimeStamp', 'viewed_date', 'created_at', 'updated_at', 'approved_date', 'rejected_date'].includes(key) && value) {
//       return formatDetailDateTime(value);
//     }

//     // Special handling for experiences array
//     if (key === 'experiences' && Array.isArray(value)) {
//       return (
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           {value.map((exp, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2,
//                   borderLeft: `4px solid ${typeColor}`,
//                   backgroundColor: `${typeColor}08`,
//                   '&:hover': {
//                     backgroundColor: `${typeColor}12`,
//                     transform: 'translateX(8px)',
//                     transition: 'all 0.3s ease'
//                   }
//                 }}
//               >
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//                   <Typography
//                     variant="subtitle1"
//                     sx={{ 
//                       fontWeight: 'bold',
//                       color: typeColor,
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 1
//                     }}
//                   >
//                     {exp.position}
//                   </Typography>
//                 </Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ 
//                     color: 'text.secondary',
//                     fontStyle: 'italic'
//                   }}
//                 >
//                   {exp.period}
//                 </Typography>
//               </Paper>
//             </motion.div>
//           ))}
//         </Box>
//       );
//     }

//     // Handle other array types
//     if (Array.isArray(value)) {
//       return value.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');
//     }

//     // Handle regular objects
//     if (typeof value === 'object' && value !== null) {
//       return JSON.stringify(value);
//     }

//     return String(value);
//   };

//   // Helper function to determine if a field should be displayed
//   const shouldDisplayField = (key, value) => {
//     const excludedKeys = ['_id', '__v'];
//     return !excludedKeys.includes(key) && value !== undefined && value !== null;
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && variants && (
//         <motion.div
//           initial={variants.initial}
//           animate={variants.animate}
//           exit={variants.exit}
//           style={variants.style}
//         >
//           <motion.div
//             className="panel-content"
//             initial={{ opacity: 0 }}
//             animate={{ 
//               opacity: 1,
//               transition: { delay: 0.2 }
//             }}
//             style={{
//               padding: '32px',
//               height: '100%',
//               overflow: 'auto'
//             }}
//           >
//             <Box sx={{ 
//               display: 'flex', 
//               justifyContent: 'space-between', 
//               alignItems: 'center',
//               marginBottom: '32px',
//               borderBottom: `3px solid ${typeColor}`,
//               paddingBottom: '16px'
//             }}>
//               <Box>
//                 <Typography variant="overline" sx={{ color: typeColor }}>
//                   Request Details
//                 </Typography>
//                 <Typography variant="h4" sx={{ 
//                   fontWeight: 'bold',
//                   color: typeColor
//                 }}>
//                   {data?.request_type || 'Request'} Information
//                 </Typography>
//               </Box>
//               <motion.div
//                 whileHover={{ rotate: 90 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <IconButton 
//                   onClick={onClose}
//                   sx={{
//                     backgroundColor: `${typeColor}22`,
//                     '&:hover': { 
//                       backgroundColor: `${typeColor}33`,
//                     }
//                   }}
//                 >
//                   <CloseIcon />
//                 </IconButton>
//               </motion.div>
//             </Box>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <Box sx={{ 
//                 display: 'grid', 
//                 gap: '24px',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
//               }}>
//                 {Object.entries(data || {}).map(([key, value]) => (
//                   shouldDisplayField(key, value) && (
//                     <motion.div
//                       key={key}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.4 }}
//                     >
//                       <Paper
//                         elevation={0}
//                         sx={{
//                           p: 3,
//                           borderRadius: '16px',
//                           border: `1px solid ${typeColor}22`,
//                           background: `${typeColor}05`,
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             background: `${typeColor}10`,
//                             transform: 'translateY(-2px)',
//                             boxShadow: `0 8px 24px ${typeColor}15`
//                           }
//                         }}
//                       >
//                         <Typography 
//                           variant="caption" 
//                           sx={{ 
//                             color: typeColor,
//                             fontWeight: 'bold',
//                             textTransform: 'uppercase',
//                             letterSpacing: '0.5px'
//                           }}
//                         >
//                           {key.replace(/_/g, ' ')}
//                         </Typography>
//                         <Typography 
//                           variant="body1" 
//                           sx={{ 
//                             fontWeight: 'medium',
//                             marginTop: '4px',
//                             wordBreak: 'break-word'
//                           }}
//                         >
//                           {formatValue(value, key)}
//                         </Typography>
//                       </Paper>
//                     </motion.div>
//                   )
//                 ))}
//               </Box>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               style={{
//                 position: 'sticky',
//                 bottom: 32,
//                 display: 'flex',
//                 justifyContent: 'flex-end',
//                 paddingTop: '24px',
//                 marginTop: '24px',
//                 borderTop: `1px solid ${typeColor}22`
//               }}
//             >
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button
//                   onClick={onClose}
//                   variant="contained"
//                   startIcon={<CloseIcon />}
//                   sx={{
//                     backgroundColor: typeColor,
//                     color: 'white',
//                     padding: '12px 24px',
//                     borderRadius: '12px',
//                     boxShadow: `0 4px 15px ${typeColor}44`,
//                     '&:hover': {
//                       backgroundColor: typeColor,
//                       opacity: 0.9,
//                       boxShadow: `0 6px 20px ${typeColor}66`,
//                     }
//                   }}
//                 >
//                   Close Details
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// const ConfirmationModal = ({
//   open,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   confirmText,
//   confirmColor,
//   icon: Icon
// }) => {
//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       PaperProps={{
//         sx: {
//           borderRadius: '16px',
//           padding: '16px',
//           minWidth: '400px'
//         }
//       }}
//     >
//       <DialogTitle>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           {Icon && (
//             <Icon
//               size={24}
//               style={{ color: confirmColor }}
//             />
//           )}
//           <Typography variant="h6" component="span">
//             {title}
//           </Typography>
//         </Box>
//       </DialogTitle>
//       <DialogContent>
//         <Typography variant="body1">
//           {message}
//         </Typography>
//       </DialogContent>
//       <DialogActions sx={{ padding: '16px' }}>
//         <motion.div
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//         >
//           <Button
//             onClick={onClose}
//             variant="outlined"
//             sx={{
//               borderRadius: '8px',
//               textTransform: 'none',
//               padding: '8px 24px'
//             }}
//           >
//             Cancel
//           </Button>
//         </motion.div>
//         <motion.div
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//         >
//           <Button
//             onClick={onConfirm}
//             variant="contained"
//             sx={{
//               backgroundColor: confirmColor,
//               color: 'white',
//               borderRadius: '8px',
//               textTransform: 'none',
//               padding: '8px 24px',
//               '&:hover': {
//                 backgroundColor: confirmColor,
//                 opacity: 0.9
//               }
//             }}
//           >
//             {confirmText}
//           </Button>
//         </motion.div>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const Example = () => {
//   const navigate = useNavigate();
//   const [columnFilters, setColumnFilters] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [sorting, setSorting] = useState([]);
//   const [openApproveModal, setOpenApproveModal] = useState(false);
//   const [openRejectModal, setOpenRejectModal] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [rowSelection, setRowSelection] = useState({});
//   const [selectedDetail, setSelectedDetail] = useState(null);
//   const [entranceDirection, setEntranceDirection] = useState(1);
//   const [activeTab, setActiveTab] = useState(0);

//   const [openRevokeModal, setOpenRevokeModal] = useState(false);
// const [selectedGuarantyRows, setSelectedGuarantyRows] = useState([]);

//   const accessToken = useSelector((state) => state.user.accessToken);
  
//   const {
//     data: fetchData = { data: [], meta: {} },
//     isError,
//     isRefetching,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ['table-data', columnFilters, globalFilter, sorting],
//     queryFn: async () => {
//       const fetchURL = new URL('https://aps2.zemenbank.com/zbss/api/rms/admin/landing/get_candidate');

//       fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
//       fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
//       fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

//       const response = await fetch(fetchURL.href, {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-token': accessToken,
//         },
//       });
      
//       const json = await response.json();
//       return json;
//     },
//     placeholderData: keepPreviousData,
//   });

//   const { data = [], meta } = fetchData;

//   const handlePrintClick = (row) => {
//     const requestType = row.original.request_type.toLowerCase();
//     switch(requestType) {
//       case 'experience':
//         navigate('/admin/experiance', { state: { rowData: row.original } });
//         break;
//       case 'supportive':
//         if(row.original.language === "english"){
//           navigate('/admin/supportive', { state: { rowData: row.original } });
//         }
//         else{
//           navigate('/admin/supportive-am', { state: { rowData: row.original } })
//         }
        
//         break;
//       case 'guranty':
//         navigate('/admin/guaranty', { state: { rowData: row.original } });
//         break;
//       case 'embassy':
//         navigate('/admin/embassy', { state: { rowData: row.original } });
//         break;
//       default:
//         console.error('Invalid request type');
//         // Optionally, you can show an error toast here
//         // toast.error('Invalid request type');
//     }
//   };

//   const handleExportRows = (rows) => {
//     const exportData = rows.map(row => ({
//        Status: row.original.status,
//       'Request Type': row.original.request_type,
//       'First Name': row.original.employee_first_name,
//       'Middle Name': row.original.employee_middle_name,
//       'Last Name': row.original.employee_last_name,
//       'Employee Description': row.original.employee_description,
//       'Domain User': row.original.domain_user,
//       'Created At': formatDateTime(row.original.TimeStamp),
//       'Viewed By': row.original.viewed_by,
//       'Viewed Date': formatDateTime(row.original.viewed_date),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Selected_Requests");
//     XLSX.writeFile(workbook, "SelectedRequestsExport.xlsx");
//   };

//   const handleExportData = (dataToExport) => {
//     const exportData = dataToExport.map(item => ({
//       Status: item.status,
//       'Request Type': item.request_type,
//       'First Name': item.employee_first_name,
//       'Middle Name': item.employee_middle_name,
//       'Last Name': item.employee_last_name,
//       'Employee Description': item.employee_description,
//       'Domain User': item.domain_user,
//       'Created At': formatDateTime(item.TimeStamp),
//       'Viewed By': item.viewed_by,
//       'Viewed Date': formatDateTime(item.viewed_date),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
//     XLSX.writeFile(workbook, "RequestsExport.xlsx");
//   };

//   const handleOpenDetail = useCallback((data) => {
//     const randomDirection = Math.floor(Math.random() * 2) + 1;
//     setEntranceDirection(randomDirection);
//     setSelectedDetail(data);
//   }, []);

//   const AnimatedRequestTypeColumn = useCallback(() => ({
//     accessorKey: 'request_type',
//     header: 'Request Type',
//     size: 180,
//     Cell: ({ cell, row }) => (
//       <RequestTypeCell 
//         value={cell.getValue()} 
//         row={row} 
//         setSelectedDetail={handleOpenDetail}
//       />
//     ),
//   }), [handleOpenDetail]);

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'status',
//         header: 'Request Status',
//         enableEditing: false,
//         size: 150,
//         Cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
//       },
//       AnimatedRequestTypeColumn(),
//       {
//         accessorKey: 'employee_first_name',
//         header: 'First Name',
//       },
//       {
//         accessorKey: 'employee_middle_name',
//         header: 'Middle Name',
//       },
//       {
//         accessorKey: 'employee_last_name',
//         header: 'Last Name',
//       },
//       {
//         accessorKey: 'employee_description',
//         header: 'Employee Description',
//         enableEditing: false,
//         size: 80,
//       },
//       {
//         accessorKey: 'domain_user',
//         header: 'Domain User',
//         enableEditing: false,
//         size: 80,
//       },
//       {
//         accessorKey: 'TimeStamp',
//         header: 'Created At',
//         filterVariant: 'date-range',
//         filterFn: (row, id, filterValue) => {
//           const date = new Date(row.getValue(id));
//           const [start, end] = filterValue;
          
//           if (!start && !end) return true;
//           if (start && !end) return date >= new Date(start);
//           if (!start && end) return date <= new Date(end);
          
//           return date >= new Date(start) && date <= new Date(end);
//         },
        
//         Cell: ({ cell }) => formatDateTime(cell.getValue()),
//         Header: ({ column }) => <em>{column.columnDef.header}</em>,
//         enableEditing: false,
//         minSize: 200,
//         sortDescFirst: true,
//         enableSorting: true,
//       },
//       {
//         accessorKey: 'viewed_by',
//         header: 'Viewed by',
//         enableEditing: false,
//         size: 80,
//       },

//       {
//         accessorKey: 'viewed_date',
//         header: 'Viewed Date',
//         filterVariant: 'date-range',
//         filterFn: (row, id, filterValue) => {
//           const date = new Date(row.getValue(id));
//           const [start, end] = filterValue;
          
//           if (!start && !end) return true;
//           if (start && !end) return date >= new Date(start);
//           if (!start && end) return date <= new Date(end);
          
//           return date >= new Date(start) && date <= new Date(end);
//         },
//         sortingFn: 'datetime',
//         Cell: ({ cell }) => formatDateTime(cell.getValue()),
//         Header: ({ column }) => <em>{column.columnDef.header}</em>,
//         enableEditing: false,
//         minSize: 200,
//       },

      
//     ],
//     [AnimatedRequestTypeColumn]
//   );

//   const { mutateAsync: approveRequest, isPending: isApprovingRequest } = useApproveRequest(refetch);
//   const { mutateAsync: rejectRequest, isPending: isRejectingRequest } = useRejectRequest(refetch);



//   // Add this new function to handle the revoke action
// const handleRevokeGuaranty = async () => {
//   try {
//     // Replace with your actual API endpoint
//     const response = await fetch("https://aps2.zemenbank.com/zbss/api/guaranty/revoke_guaranties", {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-token': accessToken,
//       },
//       body: JSON.stringify({
//         ids: selectedGuarantyRows.map(row => row.original.id)
//       })
//     });

//     if (response.ok) {
//       toast.success(`Successfully revoked ${selectedGuarantyRows.length} guaranty requests`);
//       refetch();
//     } else {
//       toast.error('Failed to revoke guaranty requests');
//     }
//   } catch (error) {
//     toast.error('Error processing revoke request');
//   }
//   setOpenRevokeModal(false);
//   setSelectedGuarantyRows([]);
// };



//   const handleApproveConfirm = async () => {
//     if (selectedRow) {
//       await approveRequest({
//         id: selectedRow.original.id,
//         request_type: selectedRow.original.request_type
//       });
//       setOpenApproveModal(false);
//       setSelectedRow(null);
//     }
//   };

//   const handleRejectConfirm = async () => {
//     if (selectedRow) {
//       await rejectRequest({
//         id: selectedRow.original.id,
//         request_type: selectedRow.original.request_type
//       });
//       setOpenRejectModal(false);
//       setSelectedRow(null);
//     }
//   };

//   const viewedData = useMemo(() => 
//     data.filter(item => item.status === 'Viewed'),
//     [data]
//   );

//   const pendingData = useMemo(() => 
//     data.filter(item => item.status === 'Pending'),
//     [data]
//   );

//   const rejectedData = useMemo(() => 
//     data.filter(item => item.status === 'Rejected'),
//     [data]
//   );

//   const revokedData = useMemo(() => 
//     data.filter(item => item.status === 'Revoked'),
//     [data]
//   );

//   const createTableInstance = (filteredData, showActions = true) => useMaterialReactTable({
//     columns: columns.filter(col => col.accessorKey !== 'status'),
//     data: filteredData,
//     paginationDisplayMode: 'pages',
//     enableColumnOrdering: true,
//     enableGrouping: true,
//     enableStickyHeader: true,
//     enableRowActions: true,
//     enableRowPinning: true,
//     enableFacetedValues: true,
//     enableColumnPinning: true,
//     rowPinningDisplayMode: 'top-and-bottom',
//     muiToolbarAlertBannerProps: isError
//       ? {
//           color: 'error',
//           children: 'Error loading data',
//         }
//       : undefined,
//     onColumnFiltersChange: setColumnFilters,
//     onGlobalFilterChange: setGlobalFilter,
//     onSortingChange: setSorting,
//     createDisplayMode: 'modal',
//     editDisplayMode: 'modal',
//     enableEditing: false,
//     getRowId: (row) => row.id,
//     muiTableContainerProps: {
//       sx: { minHeight: '500px' },
//     },
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     renderRowActions: showActions ? ({ row }) => {
//       if (activeTab === 1) {
//         return (
//           <Box sx={{ display: 'flex', gap: '1rem' }}>
//             <Tooltip title="Approve">
//               <motion.div
//                 initial={{ x: -100, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 100, damping: 10 }}
//               >
//                 <Button
//                   variant="contained"
//                   color="success"
//                   onClick={() => {
//                     setOpenApproveModal(true);
//                     setSelectedRow(row);
//                   }}
//                 >
//                   Approve
//                 </Button>
//               </motion.div>
//             </Tooltip>
//             <Tooltip title="Reject">
//               <motion.div
//                 initial={{ x: 100, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 100, damping: 10 }}
//               >
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => {
//                     setOpenRejectModal(true);
//                     setSelectedRow(row);
//                   }}
//                 >
//                   Reject
//                 </Button>
//               </motion.div>
//             </Tooltip>
//           </Box>
//         );
//       } else if (activeTab === 0) {
//         return (
//           <Tooltip title="Preview">
//             <motion.div
//               initial={{ x: 100, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               transition={{ type: "spring", stiffness: 100, damping: 10 }}
//             >
//               <motion.div animate={bounceAnimation}>
//                 <Button
//                   variant="contained"
//                   style={{ 
//                     backgroundColor: '#FFA500', 
//                     color: 'white',
//                     padding: '6px 16px',
//                   }}
//                   startIcon={<PreviewIcon />}
//                   onClick={() => handlePrintClick(row)}
//                 >
//                   Preview
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </Tooltip>
//         );
//       }
//       return null;
//     } : undefined,
//     state: {
//       columnFilters,
//       globalFilter,
//       isLoading,
//       showAlertBanner: isError,
//       showProgressBars: isRefetching,
//       sorting,
//       rowSelection,
//     },
//     renderTopToolbarCustomActions: ({ table }) => (
//       <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>
//         <Button
//           color="primary"
//           onClick={() => handleExportData(filteredData)}
//           startIcon={<FileDownloadIcon />}
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: '#4CAF50',
//             '&:hover': { backgroundColor: '#45a049' }
//           }}
//         >
//           Export All Data
//         </Button>
//         <Button
//           disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
//           onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: '#2196F3',
//             '&:hover': { backgroundColor: '#1976D2' }
//           }}
//         >
//           Export Selected Rows
//         </Button>


//         <Button
//            disabled={!table.getSelectedRowModel().rows.some(row => 
//             row.original.request_type.toLowerCase() === 'guranty'
//           )}
//           onClick={() => {
//             const guarantyRows = table.getSelectedRowModel().rows.filter(
//               row => row.original.request_type.toLowerCase() === 'guranty'
//             );
//             setSelectedGuarantyRows(guarantyRows);
//             setOpenRevokeModal(true);
//           }}
//            startIcon={<BlockIcon  />}
//            variant="contained"
//            size="small"
//            sx={{
//             backgroundColor: '#FF5722',
//             '&:hover': { backgroundColor: '#F4511E' }
//           }}
//         >
//           Mark Revoked ({table.getSelectedRowModel().rows.filter(
//             row => row.original.request_type.toLowerCase() === 'guranty'
//           ).length})
//         </Button>

//         <ConfirmationModal
//           open={openRevokeModal}
//           onClose={() => setOpenRevokeModal(false)}
//           onConfirm={handleRevokeGuaranty}
//           title="Revoke Guaranty Requests"
//           message={
//             <Box>
//               <Typography variant="body1" sx={{ mb: 2 }}>
//                 Are you sure you want to revoke {selectedGuarantyRows.length} guaranty request(s)?
//               </Typography>
//               <Paper sx={{ p: 2, bgcolor: '#FFF3E0' }}>
//                 <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
//                   Selected requests to be revoked:
//                 </Typography>
//                 {selectedGuarantyRows.map((row, index) => (
//   <Paper
//     key={index}
//     elevation={0}
//     sx={{
//       p: 2,
//       mb: 1,
//       borderLeft: '4px solid #FF5722',
//       backgroundColor: 'rgba(255, 87, 34, 0.05)',
//       '&:hover': {
//         backgroundColor: 'rgba(255, 87, 34, 0.1)',
//         transform: 'translateX(8px)',
//         transition: 'all 0.3s ease'
//       }
//     }}
//   >
//     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//       <Box>
//         <Typography variant="subtitle2" color="primary.main" sx={{ mb: 0.5 }}>
//           Employee
//         </Typography>
//         <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//           {row.original.employee_first_name} {row.original.employee_middle_name} {row.original.employee_last_name}
//         </Typography>
//       </Box>
//       <Box sx={{ textAlign: 'right' }}>
//         <Typography variant="subtitle2" color="warning.main" sx={{ mb: 0.5 }}>
//           Guaranty For
//         </Typography>
//         <Typography variant="body1" sx={{ color: '#FF5722' }}>
//           {row.original.guaranty_first_name} {row.original.guaranty_middle_name} {row.original.guaranty_last_name}
//         </Typography>
//       </Box>
//     </Box>
//     {row.original.guaranty_organazation && (
//       <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
//         Organazation: {row.original.guaranty_organazation}
//       </Typography>
//     )}
//   </Paper>
// ))}
//               </Paper>
//             </Box>
//           }
//           confirmText="Revoke Guaranty"
//           confirmColor="#FF5722"
//           icon={BlockIcon}
//         />



//         <Button
//           onClick={() => refetch()}
//           startIcon={<RefreshIcon />}
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: '#FF9800',
//             '&:hover': { backgroundColor: '#F57C00' }
//           }}
//         >
//           Refresh
//         </Button>
//       </Box>
//     ),
//   });

//   const viewedTable = createTableInstance(viewedData);
//   const pendingTable = createTableInstance(pendingData);
//   const rejectedTable = createTableInstance(rejectedData, false);
//   const revokedTable = createTableInstance(revokedData, false);

//   return (
//     <>
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//         <Tabs 
//           value={activeTab} 
//           onChange={(_, newValue) => setActiveTab(newValue)}
//           sx={{
//             '& .MuiTab-root': {
//               fontSize: '1rem',
//               fontWeight: 'bold',
//               textTransform: 'none',
//               minWidth: 120,
//             },
//           }}
//         >
//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Viewed</span>
//                 <Chip 
//                   label={viewedData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#4CAF50', color: 'white' }}
//                 />
//               </Box>
//             } 
//           />
//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Pending</span>
//                 <Chip 
//                   label={pendingData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#FFA500', color: 'white' }}
//                 />
//               </Box>
//             }
//           />


//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Rejected</span>
//                 <Chip 
//                   label={rejectedData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#F44336', color: 'white' }}
//                 />
//               </Box>
//             }
//           />


//         <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Revoked</span>
//                 <Chip 
//                   label={revokedData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#F44336', color: 'white' }}
//                 />
//               </Box>
//             }
//           />

//         </Tabs>

   

      

//       </Box>

//       <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
//         <MaterialReactTable table={viewedTable} />
//       </Box>
//       <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
//         <MaterialReactTable table={pendingTable} />
//       </Box>
//       <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
//         <MaterialReactTable table={rejectedTable} />
//       </Box>

//       <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
//         <MaterialReactTable table={revokedTable} />
//       </Box>

//       <DetailPanel 
//         isOpen={!!selectedDetail}
//         onClose={() => setSelectedDetail(null)}
//         data={selectedDetail || {}}
//         entranceDirection={entranceDirection}
//       />

//       <ConfirmationModal
//         open={openApproveModal}
//         onClose={() => setOpenApproveModal(false)}
//         onConfirm={handleApproveConfirm}
//         title="Approve Request"
//         message="Are you sure you want to approve this request?"
//         confirmText={isApprovingRequest ? 'Approving...' : 'Approve'}
//         confirmColor="#4CAF50"
//         icon={CheckCircle}
//       />

//       <ConfirmationModal
//         open={openRejectModal}
//         onClose={() => setOpenRejectModal(false)}
//         onConfirm={handleRejectConfirm}
//         title="Reject Request"
//         message="Are you sure you want to reject this request?"
//         confirmText={isRejectingRequest ? 'Rejecting...' : 'Reject'}
//         confirmColor="#F44336"
//         icon={XCircle}
//       />

//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//     </>
//   );
// };

// const queryClient = new QueryClient();

// const ExampleWithProviders = () => (
//   <QueryClientProvider client={queryClient}>
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Example />
//     </LocalizationProvider>
//   </QueryClientProvider>
// );

// export default ExampleWithProviders;






































// import React, { useMemo, useState, useEffect, useCallback } from 'react';
// import {
//   MaterialReactTable,
//   useMaterialReactTable,
// } from 'material-react-table';
// import RefreshIcon from '@mui/icons-material/Refresh';
// import FileDownloadIcon from '@mui/icons-material/FileDownload';
// import BlockIcon from '@mui/icons-material/Block';
// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// import * as XLSX from 'xlsx';

// import {
//   Box,
//   Button,
//   Dialog,
//   DialogActions,
//   DialogContent,
//   DialogTitle,
//   IconButton,
//   Tooltip,
//   Typography,
//   Paper,
//   Tabs,
//   Tab,
//   Chip,
// } from '@mui/material';
// import {
//   QueryClient,
//   QueryClientProvider,
//   useMutation,
//   useQuery,
//   keepPreviousData,
//   useQueryClient,
// } from '@tanstack/react-query';

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import { useSelector } from 'react-redux';
// import { motion, AnimatePresence } from 'framer-motion';
// import { CheckCircle, XCircle, X as CloseIcon } from 'lucide-react';
// import  { useApproveRequest, useRejectRequest } from './ApprovalEndpoint'
// import PreviewIcon from '@mui/icons-material/Preview';
// import { useNavigate } from 'react-router-dom';



// const formatDateTime = (dateString) => {
//   try {
//     const date = new Date(dateString);
//     if (isNaN(date)) return '';
    
//     const formattedDate = date.toLocaleDateString('en-US', {
//       weekday: 'short',    // "Sat"
//       month: 'short',      // "Oct"
//       day: 'numeric',      // "12"
//       year: 'numeric',     // "2024"
//     });

//     const formattedTime = date.toLocaleTimeString('en-US', {
//       hour: '2-digit',     // "04"
//       minute: '2-digit',   // "45"
//       hour12: true         // PM
//     });

//     return `${formattedDate} at ${formattedTime}`;
//   } catch (error) {
//     return '';
//   }
// };

// // Add these utility functions at the top of your file
// const getRequestTypeColor = (type) => {
//   switch (type?.toLowerCase()) {
//     case 'experience': return '#3498db';
//     case 'guranty': return '#e74c3c';
//     case 'supportive': return '#2ecc71';
//     case 'embassy': return '#f39c12';
//     case 'medical': return '#9b59b6';
//     default: return '#95a5a6';
//   }
// };

// const getRequestTypeIcon = (type) => {
//   switch (type?.toLowerCase()) {
//     case 'experience': return '🏢';
//     case 'guranty': return '🔐';
//     case 'supportive': return '🤝';
//     case 'embassy': return '🏛️';
//     case 'medical':  return'🏥';
//     default: return '❓';
//   }
// };

// const StatusCell = ({ value }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 300);
//     return () => clearTimeout(timer);
//   }, []);

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'pending': return '#FFA500';
//       case 'viewed': return '#4CAF50';
//       default: return '#9E9E9E';
//     }
//   };

//   const statusColor = getStatusColor(value);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.5 }}
//       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
//       transition={{ duration: 0.5, ease: "easeOut" }}
//       style={{
//         background: statusColor,
//         padding: '6px 12px',
//         borderRadius: '20px',
//         color: 'white',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         boxShadow: `0 0 10px ${statusColor}`,
//         cursor: 'pointer',
//       }}
//       whileHover={{ scale: 1.05 }}
//       whileTap={{ scale: 0.95 }}
//     >
//       {value}
//     </motion.div>
//   );
// };

// const bounceAnimation = {
//   y: [0, -10, 0],
//   transition: {
//     y: {
//       repeat: Infinity,
//       duration: 1.5,
//       ease: "easeInOut"
//     }
//   }
// };

// const RequestTypeCell = ({ value, row, setSelectedDetail }) => {
//   const [isVisible, setIsVisible] = useState(false);

//   useEffect(() => {
//     const timer = setTimeout(() => setIsVisible(true), 300);
//     return () => clearTimeout(timer);
//   }, []);

//   const typeColor = getRequestTypeColor(value);
//   const typeIcon = getRequestTypeIcon(value);

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.5 }}
//       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
//       transition={{ duration: 3, ease: "easeOut" }}
//       style={{
//         background: typeColor,
//         padding: '6px 12px',
//         borderRadius: '20px',
//         color: 'white',
//         fontWeight: 'bold',
//         textAlign: 'center',
//         boxShadow: `0 0 10px ${typeColor}`,
//         cursor: 'pointer',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         gap: '8px',
//       }}
//       whileHover={{ 
//         scale: 1.05,
//         boxShadow: `0 0 20px ${typeColor}`,
//       }}
//       whileTap={{ scale: 0.95 }}
//       onClick={() => setSelectedDetail(row.original)}
//     >
//       <span>{typeIcon}</span>
//       <span>{value}</span>
//     </motion.div>
//   );
// };

// const DetailPanel = ({ isOpen, onClose, data, entranceDirection }) => {
//   const typeColor = getRequestTypeColor(data?.request_type);

//   const getAnimationVariants = () => {
//     switch (entranceDirection) {
//       case 1: // From left
//         return {
//           initial: { x: '-100%', opacity: 0 },
//           animate: { 
//             x: 0, 
//             opacity: 1,
//             transition: {
//               type: "spring",
//               stiffness: 100,
//               damping: 20
//             }
//           },
//           exit: { 
//             x: '-100%', 
//             opacity: 0,
//             transition: { 
//               duration: 0.3,
//               ease: "easeInOut"
//             }
//           },
//           style: {
//             position: 'fixed',
//             top: '0',
//             left: '0',
//             width: '75%',
//             height: '100%',
//             backgroundColor: 'white',
//             boxShadow: '10px 0 40px rgba(0,0,0,0.2)',
//             zIndex: 9999,
//             overflow: 'hidden'
//           }
//         };
      
//       case 2: // From right
//         return {
//           initial: { x: '100%', opacity: 0 },
//           animate: { 
//             x: 0, 
//             opacity: 1,
//             transition: {
//               type: "spring",
//               stiffness: 100,
//               damping: 20
//             }
//           },
//           exit: { 
//             x: '100%', 
//             opacity: 0,
//             transition: { 
//               duration: 0.3,
//               ease: "easeInOut"
//             }
//           },
//           style: {
//             position: 'fixed',
//             top: '0',
//             right: '0',
//             width: '75%',
//             height: '100%',
//             backgroundColor: 'white',
//             boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
//             zIndex: 9999,
//             overflow: 'hidden'
//           }
//         };
      
//       default:
//         return null;
//     }
//   };

//   const variants = getAnimationVariants();

//   const formatDetailDateTime = (dateString) => {
//     try {
//       const date = new Date(dateString);
//       if (isNaN(date)) return dateString;
      
//       const formattedDate = date.toLocaleDateString('en-US', {
//         weekday: 'short',    // "Sat"
//         month: 'short',      // "Oct"
//         day: 'numeric',      // "12"
//         year: 'numeric',     // "2024"
//       });

//       const formattedTime = date.toLocaleTimeString('en-US', {
//         hour: '2-digit',     // "04"
//         minute: '2-digit',   // "45"
//         hour12: true         // PM
//       });

//       return `${formattedDate} at ${formattedTime}`;
//     } catch (error) {
//       return dateString;
//     }
//   };

//   const formatValue = (value, key) => {
//     if (value === null || value === undefined) return '-';

//     // Handle date fields
//     if (['TimeStamp', 'viewed_date', 'created_at', 'updated_at', 'approved_date', 'rejected_date'].includes(key) && value) {
//       return formatDetailDateTime(value);
//     }

//     // Special handling for experiences array
//     if (key === 'experiences' && Array.isArray(value)) {
//       return (
//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//           {value.map((exp, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               transition={{ delay: index * 0.1 }}
//             >
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2,
//                   borderLeft: `4px solid ${typeColor}`,
//                   backgroundColor: `${typeColor}08`,
//                   '&:hover': {
//                     backgroundColor: `${typeColor}12`,
//                     transform: 'translateX(8px)',
//                     transition: 'all 0.3s ease'
//                   }
//                 }}
//               >
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
//                   <Typography
//                     variant="subtitle1"
//                     sx={{ 
//                       fontWeight: 'bold',
//                       color: typeColor,
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: 1
//                     }}
//                   >
//                     {exp.position}
//                   </Typography>
//                 </Box>
//                 <Typography
//                   variant="body2"
//                   sx={{ 
//                     color: 'text.secondary',
//                     fontStyle: 'italic'
//                   }}
//                 >
//                   {exp.period}
//                 </Typography>
//               </Paper>
//             </motion.div>
//           ))}
//         </Box>
//       );
//     }

//     // Handle other array types
//     if (Array.isArray(value)) {
//       return value.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');
//     }

//     // Handle regular objects
//     if (typeof value === 'object' && value !== null) {
//       return JSON.stringify(value);
//     }

//     return String(value);
//   };

//   // Helper function to determine if a field should be displayed
//   const shouldDisplayField = (key, value) => {
//     const excludedKeys = ['_id', '__v'];
//     return !excludedKeys.includes(key) && value !== undefined && value !== null;
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && variants && (
//         <motion.div
//           initial={variants.initial}
//           animate={variants.animate}
//           exit={variants.exit}
//           style={variants.style}
//         >
//           <motion.div
//             className="panel-content"
//             initial={{ opacity: 0 }}
//             animate={{ 
//               opacity: 1,
//               transition: { delay: 0.2 }
//             }}
//             style={{
//               padding: '32px',
//               height: '100%',
//               overflow: 'auto'
//             }}
//           >
//             <Box sx={{ 
//               display: 'flex', 
//               justifyContent: 'space-between', 
//               alignItems: 'center',
//               marginBottom: '32px',
//               borderBottom: `3px solid ${typeColor}`,
//               paddingBottom: '16px'
//             }}>
//               <Box>
//                 <Typography variant="overline" sx={{ color: typeColor }}>
//                   Request Details
//                 </Typography>
//                 <Typography variant="h4" sx={{ 
//                   fontWeight: 'bold',
//                   color: typeColor
//                 }}>
//                   {data?.request_type || 'Request'} Information
//                 </Typography>
//               </Box>
//               <motion.div
//                 whileHover={{ rotate: 90 }}
//                 transition={{ duration: 0.3 }}
//               >
//                 <IconButton 
//                   onClick={onClose}
//                   sx={{
//                     backgroundColor: `${typeColor}22`,
//                     '&:hover': { 
//                       backgroundColor: `${typeColor}33`,
//                     }
//                   }}
//                 >
//                   <CloseIcon />
//                 </IconButton>
//               </motion.div>
//             </Box>

//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               transition={{ delay: 0.3 }}
//             >
//               <Box sx={{ 
//                 display: 'grid', 
//                 gap: '24px',
//                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
//               }}>
//                 {Object.entries(data || {}).map(([key, value]) => (
//                   shouldDisplayField(key, value) && (
//                     <motion.div
//                       key={key}
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.4 }}
//                     >
//                       <Paper
//                         elevation={0}
//                         sx={{
//                           p: 3,
//                           borderRadius: '16px',
//                           border: `1px solid ${typeColor}22`,
//                           background: `${typeColor}05`,
//                           transition: 'all 0.3s ease',
//                           '&:hover': {
//                             background: `${typeColor}10`,
//                             transform: 'translateY(-2px)',
//                             boxShadow: `0 8px 24px ${typeColor}15`
//                           }
//                         }}
//                       >
//                         <Typography 
//                           variant="caption" 
//                           sx={{ 
//                             color: typeColor,
//                             fontWeight: 'bold',
//                             textTransform: 'uppercase',
//                             letterSpacing: '0.5px'
//                           }}
//                         >
//                           {key.replace(/_/g, ' ')}
//                         </Typography>
//                         <Typography 
//                           variant="body1" 
//                           sx={{ 
//                             fontWeight: 'medium',
//                             marginTop: '4px',
//                             wordBreak: 'break-word'
//                           }}
//                         >
//                           {formatValue(value, key)}
//                         </Typography>
//                       </Paper>
//                     </motion.div>
//                   )
//                 ))}
//               </Box>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: 0.5 }}
//               style={{
//                 position: 'sticky',
//                 bottom: 32,
//                 display: 'flex',
//                 justifyContent: 'flex-end',
//                 paddingTop: '24px',
//                 marginTop: '24px',
//                 borderTop: `1px solid ${typeColor}22`
//               }}
//             >
//               <motion.div
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 <Button
//                   onClick={onClose}
//                   variant="contained"
//                   startIcon={<CloseIcon />}
//                   sx={{
//                     backgroundColor: typeColor,
//                     color: 'white',
//                     padding: '12px 24px',
//                     borderRadius: '12px',
//                     boxShadow: `0 4px 15px ${typeColor}44`,
//                     '&:hover': {
//                       backgroundColor: typeColor,
//                       opacity: 0.9,
//                       boxShadow: `0 6px 20px ${typeColor}66`,
//                     }
//                   }}
//                 >
//                   Close Details
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// const ConfirmationModal = ({
//   open,
//   onClose,
//   onConfirm,
//   title,
//   message,
//   confirmText,
//   confirmColor,
//   icon: Icon
// }) => {
//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       PaperProps={{
//         sx: {
//           borderRadius: '16px',
//           padding: '16px',
//           minWidth: '400px'
//         }
//       }}
//     >
//       <DialogTitle>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//           {Icon && (
//             <Icon
//               size={24}
//               style={{ color: confirmColor }}
//             />
//           )}
//           <Typography variant="h6" component="span">
//             {title}
//           </Typography>
//         </Box>
//       </DialogTitle>
//       <DialogContent>
//         <Typography variant="body1">
//           {message}
//         </Typography>
//       </DialogContent>
//       <DialogActions sx={{ padding: '16px' }}>
//         <motion.div
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//         >
//           <Button
//             onClick={onClose}
//             variant="outlined"
//             sx={{
//               borderRadius: '8px',
//               textTransform: 'none',
//               padding: '8px 24px'
//             }}
//           >
//             Cancel
//           </Button>
//         </motion.div>
//         <motion.div
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//         >
//           <Button
//             onClick={onConfirm}
//             variant="contained"
//             sx={{
//               backgroundColor: confirmColor,
//               color: 'white',
//               borderRadius: '8px',
//               textTransform: 'none',
//               padding: '8px 24px',
//               '&:hover': {
//                 backgroundColor: confirmColor,
//                 opacity: 0.9
//               }
//             }}
//           >
//             {confirmText}
//           </Button>
//         </motion.div>
//       </DialogActions>
//     </Dialog>
//   );
// };

// const Example = () => {
//   const navigate = useNavigate();
//   const [columnFilters, setColumnFilters] = useState([]);
//   const [globalFilter, setGlobalFilter] = useState('');
//   const [sorting, setSorting] = useState([]);
//   const [openApproveModal, setOpenApproveModal] = useState(false);
//   const [openRejectModal, setOpenRejectModal] = useState(false);
//   const [selectedRow, setSelectedRow] = useState(null);
//   const [rowSelection, setRowSelection] = useState({});
//   const [selectedDetail, setSelectedDetail] = useState(null);
//   const [entranceDirection, setEntranceDirection] = useState(1);
//   const [activeTab, setActiveTab] = useState(0);

//   const [openRevokeModal, setOpenRevokeModal] = useState(false);
// const [selectedGuarantyRows, setSelectedGuarantyRows] = useState([]);

//   const accessToken = useSelector((state) => state.user.accessToken);
  
//   const {
//     data: fetchData = { data: [], meta: {} },
//     isError,
//     isRefetching,
//     isLoading,
//     refetch,
//   } = useQuery({
//     queryKey: ['table-data', columnFilters, globalFilter, sorting],
//     queryFn: async () => {
//       const fetchURL = new URL('https://aps2.zemenbank.com/zbss/api/rms/admin/landing/get_candidate');

//       fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
//       fetchURL.searchParams.set('globalFilter', globalFilter ?? '');
//       fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));

//       const response = await fetch(fetchURL.href, {
//         headers: {
//           'Content-Type': 'application/json',
//           'x-access-token': accessToken,
//         },
//       });
      
//       const json = await response.json();
//       return json;
//     },
//     placeholderData: keepPreviousData,
//   });

//   const { data = [], meta } = fetchData;

//   const handlePrintClick = (row) => {
//     const requestType = row.original.request_type.toLowerCase();
//     switch(requestType) {
//       case 'experience':
//         navigate('/admin/experiance', { state: { rowData: row.original } });
//         break;
//       case 'supportive':
//         if(row.original.language === "english"){
//           navigate('/admin/supportive', { state: { rowData: row.original } });
//         }
//         else{
//           navigate('/admin/supportive-am', { state: { rowData: row.original } })
//         }
        
//         break;
//       case 'guranty':
//         navigate('/admin/guaranty', { state: { rowData: row.original } });
//         break;
//       case 'embassy':
//         navigate('/admin/embassy', { state: { rowData: row.original } });
//         break;

//       case 'medical':
//         navigate('/admin/medical', { state: { rowData: row.original } });
//         break;

//       default:
//         console.error('Invalid request type');
//         // Optionally, you can show an error toast here
//         // toast.error('Invalid request type');
//     }
//   };

//   const handleExportRows = (rows) => {
//     const exportData = rows.map(row => ({
//        Status: row.original.status,
//       'Request Type': row.original.request_type,
//       'First Name': row.original.employee_first_name,
//       'Middle Name': row.original.employee_middle_name,
//       'Last Name': row.original.employee_last_name,
//       'Employee Description': row.original.employee_description,
//       'Domain User': row.original.domain_user,
//       'Created At': formatDateTime(row.original.TimeStamp),
//       'Viewed By': row.original.viewed_by,
//       'Viewed Date': formatDateTime(row.original.viewed_date),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Selected_Requests");
//     XLSX.writeFile(workbook, "SelectedRequestsExport.xlsx");
//   };

//   const handleExportData = (dataToExport) => {
//     const exportData = dataToExport.map(item => ({
//       Status: item.status,
//       'Request Type': item.request_type,
//       'First Name': item.employee_first_name,
//       'Middle Name': item.employee_middle_name,
//       'Last Name': item.employee_last_name,
//       'Employee Description': item.employee_description,
//       'Domain User': item.domain_user,
//       'Created At': formatDateTime(item.TimeStamp),
//       'Viewed By': item.viewed_by,
//       'Viewed Date': formatDateTime(item.viewed_date),
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
//     XLSX.writeFile(workbook, "RequestsExport.xlsx");
//   };

//   const handleOpenDetail = useCallback((data) => {
//     const randomDirection = Math.floor(Math.random() * 2) + 1;
//     setEntranceDirection(randomDirection);
//     setSelectedDetail(data);
//   }, []);

//   const AnimatedRequestTypeColumn = useCallback(() => ({
//     accessorKey: 'request_type',
//     header: 'Request Type',
//     size: 180,
//     Cell: ({ cell, row }) => (
//       <RequestTypeCell 
//         value={cell.getValue()} 
//         row={row} 
//         setSelectedDetail={handleOpenDetail}
//       />
//     ),
//   }), [handleOpenDetail]);

//   const columns = useMemo(
//     () => [
//       {
//         accessorKey: 'status',
//         header: 'Request Status',
//         enableEditing: false,
//         size: 150,
//         Cell: ({ cell }) => <StatusCell value={cell.getValue()} />,
//       },
//       AnimatedRequestTypeColumn(),
//       {
//         accessorKey: 'employee_first_name',
//         header: 'First Name',
//       },
//       {
//         accessorKey: 'employee_middle_name',
//         header: 'Middle Name',
//       },
//       {
//         accessorKey: 'employee_last_name',
//         header: 'Last Name',
//       },
//       {
//         accessorKey: 'employee_description',
//         header: 'Employee Description',
//         enableEditing: false,
//         size: 80,
//       },
//       {
//         accessorKey: 'domain_user',
//         header: 'Domain User',
//         enableEditing: false,
//         size: 80,
//       },
//       {
//         accessorKey: 'TimeStamp',
//         header: 'Created At',
//         filterVariant: 'date-range',
//         filterFn: (row, id, filterValue) => {
//           const date = new Date(row.getValue(id));
//           const [start, end] = filterValue;
          
//           if (!start && !end) return true;
//           if (start && !end) return date >= new Date(start);
//           if (!start && end) return date <= new Date(end);
          
//           return date >= new Date(start) && date <= new Date(end);
//         },
        
//         Cell: ({ cell }) => formatDateTime(cell.getValue()),
//         Header: ({ column }) => <em>{column.columnDef.header}</em>,
//         enableEditing: false,
//         minSize: 200,
//         sortDescFirst: true,
//         enableSorting: true,
//       },
//       {
//         accessorKey: 'viewed_by',
//         header: 'Viewed by',
//         enableEditing: false,
//         size: 80,
//       },

//       {
//         accessorKey: 'viewed_date',
//         header: 'Viewed Date',
//         filterVariant: 'date-range',
//         filterFn: (row, id, filterValue) => {
//           const date = new Date(row.getValue(id));
//           const [start, end] = filterValue;
          
//           if (!start && !end) return true;
//           if (start && !end) return date >= new Date(start);
//           if (!start && end) return date <= new Date(end);
          
//           return date >= new Date(start) && date <= new Date(end);
//         },
//         sortingFn: 'datetime',
//         Cell: ({ cell }) => formatDateTime(cell.getValue()),
//         Header: ({ column }) => <em>{column.columnDef.header}</em>,
//         enableEditing: false,
//         minSize: 200,
//       },

      
//     ],
//     [AnimatedRequestTypeColumn]
//   );

//   const { mutateAsync: approveRequest, isPending: isApprovingRequest } = useApproveRequest(refetch);
//   const { mutateAsync: rejectRequest, isPending: isRejectingRequest } = useRejectRequest(refetch);



//   // Add this new function to handle the revoke action
// const handleRevokeGuaranty = async () => {
//   try {
//     // Replace with your actual API endpoint
//     const response = await fetch("https://aps2.zemenbank.com/zbss/api/guaranty/revoke_guaranties", {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//         'x-access-token': accessToken,
//       },
//       body: JSON.stringify({
//         ids: selectedGuarantyRows.map(row => row.original.id)
//       })
//     });

//     if (response.ok) {
//       toast.success(`Successfully revoked ${selectedGuarantyRows.length} guaranty requests`);
//       refetch();
//     } else {
//       toast.error('Failed to revoke guaranty requests');
//     }
//   } catch (error) {
//     toast.error('Error processing revoke request');
//   }
//   setOpenRevokeModal(false);
//   setSelectedGuarantyRows([]);
// };



//   const handleApproveConfirm = async () => {
//     if (selectedRow) {
//       await approveRequest({
//         id: selectedRow.original.id,
//         request_type: selectedRow.original.request_type
//       });
//       setOpenApproveModal(false);
//       setSelectedRow(null);
//     }
//   };

//   const handleRejectConfirm = async () => {
//     if (selectedRow) {
//       await rejectRequest({
//         id: selectedRow.original.id,
//         request_type: selectedRow.original.request_type
//       });
//       setOpenRejectModal(false);
//       setSelectedRow(null);
//     }
//   };

//   const viewedData = useMemo(() => 
//     data.filter(item => item.status === 'Viewed'),
//     [data]
//   );

//   const pendingData = useMemo(() => 
//     data.filter(item => item.status === 'Pending'),
//     [data]
//   );

//   const rejectedData = useMemo(() => 
//     data.filter(item => item.status === 'Rejected'),
//     [data]
//   );

//   const revokedData = useMemo(() => 
//     data.filter(item => item.status === 'Revoked'),
//     [data]
//   );

//   const createTableInstance = (filteredData, showActions = true) => useMaterialReactTable({
//     columns: columns.filter(col => col.accessorKey !== 'status'),
//     data: filteredData,
//     paginationDisplayMode: 'pages',
//     enableColumnOrdering: true,
//     enableGrouping: true,
//     enableStickyHeader: true,
//     enableRowActions: true,
//     enableRowPinning: true,
//     enableFacetedValues: true,
//     enableColumnPinning: true,
//     rowPinningDisplayMode: 'top-and-bottom',
//     muiToolbarAlertBannerProps: isError
//       ? {
//           color: 'error',
//           children: 'Error loading data',
//         }
//       : undefined,
//     onColumnFiltersChange: setColumnFilters,
//     onGlobalFilterChange: setGlobalFilter,
//     onSortingChange: setSorting,
//     createDisplayMode: 'modal',
//     editDisplayMode: 'modal',
//     enableEditing: false,
//     getRowId: (row) => row.id,
//     muiTableContainerProps: {
//       sx: { minHeight: '500px' },
//     },
//     enableRowSelection: true,
//     onRowSelectionChange: setRowSelection,
//     renderRowActions: showActions ? ({ row }) => {
//       if (activeTab === 1) {
//         return (
//           <Box sx={{ display: 'flex', gap: '1rem' }}>
//             <Tooltip title="Approve">
//               <motion.div
//                 initial={{ x: -100, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 100, damping: 10 }}
//               >
//                 <Button
//                   variant="contained"
//                   color="success"
//                   onClick={() => {
//                     setOpenApproveModal(true);
//                     setSelectedRow(row);
//                   }}
//                 >
//                   Approve
//                 </Button>
//               </motion.div>
//             </Tooltip>
//             <Tooltip title="Reject">
//               <motion.div
//                 initial={{ x: 100, opacity: 0 }}
//                 animate={{ x: 0, opacity: 1 }}
//                 transition={{ type: "spring", stiffness: 100, damping: 10 }}
//               >
//                 <Button
//                   variant="contained"
//                   color="error"
//                   onClick={() => {
//                     setOpenRejectModal(true);
//                     setSelectedRow(row);
//                   }}
//                 >
//                   Reject
//                 </Button>
//               </motion.div>
//             </Tooltip>
//           </Box>
//         );
//       } else if (activeTab === 0) {
//         return (
//           <Tooltip title="Preview">
//             <motion.div
//               initial={{ x: 100, opacity: 0 }}
//               animate={{ x: 0, opacity: 1 }}
//               transition={{ type: "spring", stiffness: 100, damping: 10 }}
//             >
//               <motion.div animate={bounceAnimation}>
//                 <Button
//                   variant="contained"
//                   style={{ 
//                     backgroundColor: '#FFA500', 
//                     color: 'white',
//                     padding: '6px 16px',
//                   }}
//                   startIcon={<PreviewIcon />}
//                   onClick={() => handlePrintClick(row)}
//                 >
//                   Preview
//                 </Button>
//               </motion.div>
//             </motion.div>
//           </Tooltip>
//         );
//       }
//       return null;
//     } : undefined,
//     state: {
//       columnFilters,
//       globalFilter,
//       isLoading,
//       showAlertBanner: isError,
//       showProgressBars: isRefetching,
//       sorting,
//       rowSelection,
//     },
//     renderTopToolbarCustomActions: ({ table }) => (
//       <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>
//         <Button
//           color="primary"
//           onClick={() => handleExportData(filteredData)}
//           startIcon={<FileDownloadIcon />}
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: '#4CAF50',
//             '&:hover': { backgroundColor: '#45a049' }
//           }}
//         >
//           Export All Data
//         </Button>
//         <Button
//           disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}
//           onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
//           startIcon={<FileDownloadIcon />}
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: '#2196F3',
//             '&:hover': { backgroundColor: '#1976D2' }
//           }}
//         >
//           Export Selected Rows
//         </Button>


//         <Button
//            disabled={!table.getSelectedRowModel().rows.some(row => 
//             row.original.request_type.toLowerCase() === 'guranty'
//           )}
//           onClick={() => {
//             const guarantyRows = table.getSelectedRowModel().rows.filter(
//               row => row.original.request_type.toLowerCase() === 'guranty'
//             );
//             setSelectedGuarantyRows(guarantyRows);
//             setOpenRevokeModal(true);
//           }}
//            startIcon={<BlockIcon  />}
//            variant="contained"
//            size="small"
//            sx={{
//             backgroundColor: '#FF5722',
//             '&:hover': { backgroundColor: '#F4511E' }
//           }}
//         >
//           Mark Revoked ({table.getSelectedRowModel().rows.filter(
//             row => row.original.request_type.toLowerCase() === 'guranty'
//           ).length})
//         </Button>

//         <ConfirmationModal
//           open={openRevokeModal}
//           onClose={() => setOpenRevokeModal(false)}
//           onConfirm={handleRevokeGuaranty}
//           title="Revoke Guaranty Requests"
//           message={
//             <Box>
//               <Typography variant="body1" sx={{ mb: 2 }}>
//                 Are you sure you want to revoke {selectedGuarantyRows.length} guaranty request(s)?
//               </Typography>
//               <Paper sx={{ p: 2, bgcolor: '#FFF3E0' }}>
//                 <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>
//                   Selected requests to be revoked:
//                 </Typography>
//                 {selectedGuarantyRows.map((row, index) => (
//   <Paper
//     key={index}
//     elevation={0}
//     sx={{
//       p: 2,
//       mb: 1,
//       borderLeft: '4px solid #FF5722',
//       backgroundColor: 'rgba(255, 87, 34, 0.05)',
//       '&:hover': {
//         backgroundColor: 'rgba(255, 87, 34, 0.1)',
//         transform: 'translateX(8px)',
//         transition: 'all 0.3s ease'
//       }
//     }}
//   >
//     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//       <Box>
//         <Typography variant="subtitle2" color="primary.main" sx={{ mb: 0.5 }}>
//           Employee
//         </Typography>
//         <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
//           {row.original.employee_first_name} {row.original.employee_middle_name} {row.original.employee_last_name}
//         </Typography>
//       </Box>
//       <Box sx={{ textAlign: 'right' }}>
//         <Typography variant="subtitle2" color="warning.main" sx={{ mb: 0.5 }}>
//           Guaranty For
//         </Typography>
//         <Typography variant="body1" sx={{ color: '#FF5722' }}>
//           {row.original.guaranty_first_name} {row.original.guaranty_middle_name} {row.original.guaranty_last_name}
//         </Typography>
//       </Box>
//     </Box>
//     {row.original.guaranty_organazation && (
//       <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
//         Organazation: {row.original.guaranty_organazation}
//       </Typography>
//     )}
//   </Paper>
// ))}
//               </Paper>
//             </Box>
//           }
//           confirmText="Revoke Guaranty"
//           confirmColor="#FF5722"
//           icon={BlockIcon}
//         />



//         <Button
//           onClick={() => refetch()}
//           startIcon={<RefreshIcon />}
//           variant="contained"
//           size="small"
//           sx={{
//             backgroundColor: '#FF9800',
//             '&:hover': { backgroundColor: '#F57C00' }
//           }}
//         >
//           Refresh
//         </Button>
//       </Box>
//     ),
//   });

//   const viewedTable = createTableInstance(viewedData);
//   const pendingTable = createTableInstance(pendingData);
//   const rejectedTable = createTableInstance(rejectedData, false);
//   const revokedTable = createTableInstance(revokedData, false);

//   return (
//     <>
//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//         <Tabs 
//           value={activeTab} 
//           onChange={(_, newValue) => setActiveTab(newValue)}
//           sx={{
//             '& .MuiTab-root': {
//               fontSize: '1rem',
//               fontWeight: 'bold',
//               textTransform: 'none',
//               minWidth: 120,
//             },
//           }}
//         >
//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Viewed</span>
//                 <Chip 
//                   label={viewedData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#4CAF50', color: 'white' }}
//                 />
//               </Box>
//             } 
//           />
//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Pending</span>
//                 <Chip 
//                   label={pendingData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#FFA500', color: 'white' }}
//                 />
//               </Box>
//             }
//           />


//           <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Rejected</span>
//                 <Chip 
//                   label={rejectedData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#F44336', color: 'white' }}
//                 />
//               </Box>
//             }
//           />


//         <Tab 
//             label={
//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <span>Revoked</span>
//                 <Chip 
//                   label={revokedData.length} 
//                   size="small" 
//                   sx={{ bgcolor: '#F44336', color: 'white' }}
//                 />
//               </Box>
//             }
//           />

//         </Tabs>

   

      

//       </Box>

//       <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
//         <MaterialReactTable table={viewedTable} />
//       </Box>
//       <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
//         <MaterialReactTable table={pendingTable} />
//       </Box>
//       <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
//         <MaterialReactTable table={rejectedTable} />
//       </Box>

//       <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
//         <MaterialReactTable table={revokedTable} />
//       </Box>

//       <DetailPanel 
//         isOpen={!!selectedDetail}
//         onClose={() => setSelectedDetail(null)}
//         data={selectedDetail || {}}
//         entranceDirection={entranceDirection}
//       />

//       <ConfirmationModal
//         open={openApproveModal}
//         onClose={() => setOpenApproveModal(false)}
//         onConfirm={handleApproveConfirm}
//         title="Approve Request"
//         message="Are you sure you want to approve this request?"
//         confirmText={isApprovingRequest ? 'Approving...' : 'Approve'}
//         confirmColor="#4CAF50"
//         icon={CheckCircle}
//       />

//       <ConfirmationModal
//         open={openRejectModal}
//         onClose={() => setOpenRejectModal(false)}
//         onConfirm={handleRejectConfirm}
//         title="Reject Request"
//         message="Are you sure you want to reject this request?"
//         confirmText={isRejectingRequest ? 'Rejecting...' : 'Reject'}
//         confirmColor="#F44336"
//         icon={XCircle}
//       />

//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//         theme="colored"
//       />
//     </>
//   );
// };

// const queryClient = new QueryClient();

// const ExampleWithProviders = () => (
//   <QueryClientProvider client={queryClient}>
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Example />
//     </LocalizationProvider>
//   </QueryClientProvider>
// );

// export default ExampleWithProviders;















































































































































































































































































// import React, { useMemo, useState, useEffect, useCallback } from 'react';

// import {

//   MaterialReactTable,

//   useMaterialReactTable,

// } from 'material-react-table';

// import RefreshIcon from '@mui/icons-material/Refresh';

// import FileDownloadIcon from '@mui/icons-material/FileDownload';

// import BlockIcon from '@mui/icons-material/Block';

// import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

// import * as XLSX from 'xlsx';



// import {

//   Box,

//   Button,

//   Dialog,

//   DialogActions,

//   DialogContent,

//   DialogTitle,

//   IconButton,

//   Tooltip,

//   Typography,

//   Paper,

//   Tabs,

//   Tab,

//   Chip,

// } from '@mui/material';

// import {

//   QueryClient,

//   QueryClientProvider,

//   useMutation,

//   useQuery,

//   keepPreviousData,

//   useQueryClient,

// } from '@tanstack/react-query';



// import { ToastContainer, toast } from 'react-toastify';

// import 'react-toastify/dist/ReactToastify.css';

// import { useSelector } from 'react-redux';

// import { motion, AnimatePresence } from 'framer-motion';

// import { CheckCircle, XCircle, X as CloseIcon } from 'lucide-react';

// import  { useApproveRequest, useRejectRequest } from './ApprovalEndpoint'

// import PreviewIcon from '@mui/icons-material/Preview';

// import { useNavigate } from 'react-router-dom';







// const formatDateTime = (dateString) => {

//   try {

//     const date = new Date(dateString);

//     if (isNaN(date)) return '';

    

//     const formattedDate = date.toLocaleDateString('en-US', {

//       weekday: 'short',    // "Sat"

//       month: 'short',      // "Oct"

//       day: 'numeric',      // "12"

//       year: 'numeric',     // "2024"

//     });



//     const formattedTime = date.toLocaleTimeString('en-US', {

//       hour: '2-digit',     // "04"

//       minute: '2-digit',   // "45"

//       hour12: true         // PM

//     });



//     return `${formattedDate} at ${formattedTime}`;

//   } catch (error) {

//     return '';

//   }

// };



// // Add these utility functions at the top of your file

// const getRequestTypeColor = (type) => {

//   switch (type?.toLowerCase()) {

//     case 'experience': return '#3498db';

//     case 'guranty': return '#e74c3c';

//     case 'supportive': return '#2ecc71';

//     case 'embassy': return '#f39c12';

//     case 'medical': return '#9b59b6';

//     default: return '#95a5a6';

//   }

// };



// const getRequestTypeIcon = (type) => {

//   switch (type?.toLowerCase()) {

//     case 'experience': return '🏢';

//     case 'guranty': return '🔐';

//     case 'supportive': return '🤝';

//     case 'embassy': return '🏛️';

//     case 'medical':  return'🏥';

//     default: return '❓';

//   }

// };



// const StatusCell = ({ value }) => {

//   const [isVisible, setIsVisible] = useState(false);



//   useEffect(() => {

//     const timer = setTimeout(() => setIsVisible(true), 300);

//     return () => clearTimeout(timer);

//   }, []);



//   const getStatusColor = (status) => {

//     switch (status.toLowerCase()) {

//       case 'pending': return '#FFA500';

//       case 'viewed': return '#4CAF50';

//       default: return '#9E9E9E';

//     }

//   };



//   const statusColor = getStatusColor(value);



//   return (

//     <motion.div

//       initial={{ opacity: 0, scale: 0.5 }}

//       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}

//       transition={{ duration: 0.5, ease: "easeOut" }}

//       style={{

//         background: statusColor,

//         padding: '6px 12px',

//         borderRadius: '20px',

//         color: 'white',

//         fontWeight: 'bold',

//         textAlign: 'center',

//         boxShadow: `0 0 10px ${statusColor}`,

//         cursor: 'pointer',

//       }}

//       whileHover={{ scale: 1.05 }}

//       whileTap={{ scale: 0.95 }}

//     >

//       {value}

//     </motion.div>

//   );

// };



// const bounceAnimation = {

//   y: [0, -10, 0],

//   transition: {

//     y: {

//       repeat: Infinity,

//       duration: 1.5,

//       ease: "easeInOut"

//     }

//   }

// };



// const RequestTypeCell = ({ value, row, setSelectedDetail }) => {

//   const [isVisible, setIsVisible] = useState(false);



//   useEffect(() => {

//     const timer = setTimeout(() => setIsVisible(true), 300);

//     return () => clearTimeout(timer);

//   }, []);



//   const typeColor = getRequestTypeColor(value);

//   const typeIcon = getRequestTypeIcon(value);



//   return (

//     <motion.div

//       initial={{ opacity: 0, scale: 0.5 }}

//       animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}

//       transition={{ duration: 3, ease: "easeOut" }}

//       style={{

//         background: typeColor,

//         padding: '6px 12px',

//         borderRadius: '20px',

//         color: 'white',

//         fontWeight: 'bold',

//         textAlign: 'center',

//         boxShadow: `0 0 10px ${typeColor}`,

//         cursor: 'pointer',

//         display: 'flex',

//         alignItems: 'center',

//         justifyContent: 'center',

//         gap: '8px',

//       }}

//       whileHover={{ 

//         scale: 1.05,

//         boxShadow: `0 0 20px ${typeColor}`,

//       }}

//       whileTap={{ scale: 0.95 }}

//       onClick={() => setSelectedDetail(row.original)}

//     >

//       <span>{typeIcon}</span>

//       <span>{value}</span>

//     </motion.div>

//   );

// };



// const DetailPanel = ({ isOpen, onClose, data, entranceDirection }) => {

//   const typeColor = getRequestTypeColor(data?.request_type);



//   const getAnimationVariants = () => {

//     switch (entranceDirection) {

//       case 1: // From left

//         return {

//           initial: { x: '-100%', opacity: 0 },

//           animate: { 

//             x: 0, 

//             opacity: 1,

//             transition: {

//               type: "spring",

//               stiffness: 100,

//               damping: 20

//             }

//           },

//           exit: { 

//             x: '-100%', 

//             opacity: 0,

//             transition: { 

//               duration: 0.3,

//               ease: "easeInOut"

//             }

//           },

//           style: {

//             position: 'fixed',

//             top: '0',

//             left: '0',

//             width: '75%',

//             height: '100%',

//             backgroundColor: 'white',

//             boxShadow: '10px 0 40px rgba(0,0,0,0.2)',

//             zIndex: 9999,

//             overflow: 'hidden'

//           }

//         };

      

//       case 2: // From right

//         return {

//           initial: { x: '100%', opacity: 0 },

//           animate: { 

//             x: 0, 

//             opacity: 1,

//             transition: {

//               type: "spring",

//               stiffness: 100,

//               damping: 20

//             }

//           },

//           exit: { 

//             x: '100%', 

//             opacity: 0,

//             transition: { 

//               duration: 0.3,

//               ease: "easeInOut"

//             }

//           },

//           style: {

//             position: 'fixed',

//             top: '0',

//             right: '0',

//             width: '75%',

//             height: '100%',

//             backgroundColor: 'white',

//             boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',

//             zIndex: 9999,

//             overflow: 'hidden'

//           }

//         };

      

//       default:

//         return null;

//     }

//   };



//   const variants = getAnimationVariants();



//   const formatDetailDateTime = (dateString) => {

//     try {

//       const date = new Date(dateString);

//       if (isNaN(date)) return dateString;

      

//       const formattedDate = date.toLocaleDateString('en-US', {

//         weekday: 'short',    // "Sat"

//         month: 'short',      // "Oct"

//         day: 'numeric',      // "12"

//         year: 'numeric',     // "2024"

//       });



//       const formattedTime = date.toLocaleTimeString('en-US', {

//         hour: '2-digit',     // "04"

//         minute: '2-digit',   // "45"

//         hour12: true         // PM

//       });



//       return `${formattedDate} at ${formattedTime}`;

//     } catch (error) {

//       return dateString;

//     }

//   };



//   const formatValue = (value, key) => {

//     if (value === null || value === undefined) return '-';



//     // Handle date fields

//     if (['TimeStamp', 'viewed_date', 'created_at', 'updated_at', 'approved_date', 'rejected_date'].includes(key) && value) {

//       return formatDetailDateTime(value);

//     }



//     // Special handling for experiences array

//     if (key === 'experiences' && Array.isArray(value)) {

//       return (

//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

//           {value.map((exp, index) => (

//             <motion.div

//               key={index}

//               initial={{ opacity: 0, x: -20 }}

//               animate={{ opacity: 1, x: 0 }}

//               transition={{ delay: index * 0.1 }}

//             >

//               <Paper

//                 elevation={0}

//                 sx={{

//                   p: 2,

//                   borderLeft: `4px solid ${typeColor}`,

//                   backgroundColor: `${typeColor}08`,

//                   '&:hover': {

//                     backgroundColor: `${typeColor}12`,

//                     transform: 'translateX(8px)',

//                     transition: 'all 0.3s ease'

//                   }

//                 }}

//               >

//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>

//                   <Typography

//                     variant="subtitle1"

//                     sx={{ 

//                       fontWeight: 'bold',

//                       color: typeColor,

//                       display: 'flex',

//                       alignItems: 'center',

//                       gap: 1

//                     }}

//                   >

//                     {exp.position}

//                   </Typography>

//                 </Box>

//                 <Typography

//                   variant="body2"

//                   sx={{ 

//                     color: 'text.secondary',

//                     fontStyle: 'italic'

//                   }}

//                 >

//                   {exp.period}

//                 </Typography>

//               </Paper>

//             </motion.div>

//           ))}

//         </Box>

//       );

//     }



//     // Handle other array types

//     if (Array.isArray(value)) {

//       return value.map(item => typeof item === 'object' ? JSON.stringify(item) : item).join(', ');

//     }



//     // Handle regular objects

//     if (typeof value === 'object' && value !== null) {

//       return JSON.stringify(value);

//     }



//     return String(value);

//   };



//   // Helper function to determine if a field should be displayed

//   const shouldDisplayField = (key, value) => {

//     const excludedKeys = ['_id', '__v'];

    

//     // If request type is medical, also exclude employee name fields

//     if (data?.request_type?.toLowerCase() === 'medical') {

//       const medicalExcludedKeys = ['employee_first_name', 'employee_middle_name', 'employee_last_name'];

//       return !excludedKeys.includes(key) && !medicalExcludedKeys.includes(key) && value !== undefined && value !== null;

//     }

    

//     return !excludedKeys.includes(key) && value !== undefined && value !== null;

//   };



//   return (

//     <AnimatePresence>

//       {isOpen && variants && (

//         <motion.div

//           initial={variants.initial}

//           animate={variants.animate}

//           exit={variants.exit}

//           style={variants.style}

//         >

//           <motion.div

//             className="panel-content"

//             initial={{ opacity: 0 }}

//             animate={{ 

//               opacity: 1,

//               transition: { delay: 0.2 }

//             }}

//             style={{

//               padding: '32px',

//               height: '100%',

//               overflow: 'auto'

//             }}

//           >

//             <Box sx={{ 

//               display: 'flex', 

//               justifyContent: 'space-between', 

//               alignItems: 'center',

//               marginBottom: '32px',

//               borderBottom: `3px solid ${typeColor}`,

//               paddingBottom: '16px'

//             }}>

//               <Box>

//                 <Typography variant="overline" sx={{ color: typeColor }}>

//                   Request Details

//                 </Typography>

//                 <Typography variant="h4" sx={{ 

//                   fontWeight: 'bold',

//                   color: typeColor

//                 }}>

//                   {data?.request_type || 'Request'} Information

//                 </Typography>

//               </Box>

//               <motion.div

//                 whileHover={{ rotate: 90 }}

//                 transition={{ duration: 0.3 }}

//               >

//                 <IconButton 

//                   onClick={onClose}

//                   sx={{

//                     backgroundColor: `${typeColor}22`,

//                     '&:hover': { 

//                       backgroundColor: `${typeColor}33`,

//                     }

//                   }}

//                 >

//                   <CloseIcon />

//                 </IconButton>

//               </motion.div>

//             </Box>



//             <motion.div

//               initial={{ opacity: 0 }}

//               animate={{ opacity: 1 }}

//               transition={{ delay: 0.3 }}

//             >

//               <Box sx={{ 

//                 display: 'grid', 

//                 gap: '24px',

//                 gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'

//               }}>

//                 {Object.entries(data || {}).map(([key, value]) => (

//                   shouldDisplayField(key, value) && (

//                     <motion.div

//                       key={key}

//                       initial={{ opacity: 0, y: 20 }}

//                       animate={{ opacity: 1, y: 0 }}

//                       transition={{ delay: 0.4 }}

//                     >

//                       <Paper

//                         elevation={0}

//                         sx={{

//                           p: 3,

//                           borderRadius: '16px',

//                           border: `1px solid ${typeColor}22`,

//                           background: `${typeColor}05`,

//                           transition: 'all 0.3s ease',

//                           '&:hover': {

//                             background: `${typeColor}10`,

//                             transform: 'translateY(-2px)',

//                             boxShadow: `0 8px 24px ${typeColor}15`

//                           }

//                         }}

//                       >

//                         <Typography 

//                           variant="caption" 

//                           sx={{ 

//                             color: typeColor,

//                             fontWeight: 'bold',

//                             textTransform: 'uppercase',

//                             letterSpacing: '0.5px'

//                           }}

//                         >

//                           {key.replace(/_/g, ' ')}

//                         </Typography>

//                         <Typography 

//                           variant="body1" 

//                           sx={{ 

//                             fontWeight: 'medium',

//                             marginTop: '4px',

//                             wordBreak: 'break-word'

//                           }}

//                         >

//                           {formatValue(value, key)}

//                         </Typography>

//                       </Paper>

//                     </motion.div>

//                   )

//                 ))}

//               </Box>

//             </motion.div>



//             <motion.div

//               initial={{ opacity: 0, y: 20 }}

//               animate={{ opacity: 1, y: 0 }}

//               transition={{ delay: 0.5 }}

//               style={{

//                 position: 'sticky',

//                 bottom: 32,

//                 display: 'flex',

//                 justifyContent: 'flex-end',

//                 paddingTop: '24px',

//                 marginTop: '24px',

//                 borderTop: `1px solid ${typeColor}22`

//               }}

//             >

//               <motion.div

//                 whileHover={{ scale: 1.05 }}

//                 whileTap={{ scale: 0.95 }}

//               >

//                 <Button

//                   onClick={onClose}

//                   variant="contained"

//                   startIcon={<CloseIcon />}

//                   sx={{

//                     backgroundColor: typeColor,

//                     color: 'white',

//                     padding: '12px 24px',

//                     borderRadius: '12px',

//                     boxShadow: `0 4px 15px ${typeColor}44`,

//                     '&:hover': {

//                       backgroundColor: typeColor,

//                       opacity: 0.9,

//                       boxShadow: `0 6px 20px ${typeColor}66`,

//                     }

//                   }}

//                 >

//                   Close Details

//                 </Button>

//               </motion.div>

//             </motion.div>

//           </motion.div>

//         </motion.div>

//       )}

//     </AnimatePresence>

//   );

// };



// const ConfirmationModal = ({

//   open,

//   onClose,

//   onConfirm,

//   title,

//   message,

//   confirmText,

//   confirmColor,

//   icon: Icon

// }) => {

//   return (

//     <Dialog

//       open={open}

//       onClose={onClose}

//       PaperProps={{

//         sx: {

//           borderRadius: '16px',

//           padding: '16px',

//           minWidth: '400px'

//         }

//       }}

//     >

//       <DialogTitle>

//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

//           {Icon && (

//             <Icon

//               size={24}

//               style={{ color: confirmColor }}

//             />

//           )}

//           <Typography variant="h6" component="span">

//             {title}

//           </Typography>

//         </Box>

//       </DialogTitle>

//       <DialogContent>

//         <Typography variant="body1">

//           {message}

//         </Typography>

//       </DialogContent>

//       <DialogActions sx={{ padding: '16px' }}>

//         <motion.div

//           whileHover={{ scale: 1.02 }}

//           whileTap={{ scale: 0.98 }}

//         >

//           <Button

//             onClick={onClose}

//             variant="outlined"

//             sx={{

//               borderRadius: '8px',

//               textTransform: 'none',

//               padding: '8px 24px'

//             }}

//           >

//             Cancel

//           </Button>

//         </motion.div>

//         <motion.div

//           whileHover={{ scale: 1.02 }}

//           whileTap={{ scale: 0.98 }}

//         >

//           <Button

//             onClick={onConfirm}

//             variant="contained"

//             sx={{

//               backgroundColor: confirmColor,

//               color: 'white',

//               borderRadius: '8px',

//               textTransform: 'none',

//               padding: '8px 24px',

//               '&:hover': {

//                 backgroundColor: confirmColor,

//                 opacity: 0.9

//               }

//             }}

//           >

//             {confirmText}

//           </Button>

//         </motion.div>

//       </DialogActions>

//     </Dialog>

//   );

// };



// const Example = () => {

//   const navigate = useNavigate();

//   const [columnFilters, setColumnFilters] = useState([]);

//   const [globalFilter, setGlobalFilter] = useState('');

//   const [sorting, setSorting] = useState([]);

//   const [openApproveModal, setOpenApproveModal] = useState(false);

//   const [openRejectModal, setOpenRejectModal] = useState(false);

//   const [selectedRow, setSelectedRow] = useState(null);

//   const [rowSelection, setRowSelection] = useState({});

//   const [selectedDetail, setSelectedDetail] = useState(null);

//   const [entranceDirection, setEntranceDirection] = useState(1);

//   const [activeTab, setActiveTab] = useState(0);



//   const [openRevokeModal, setOpenRevokeModal] = useState(false);

// const [selectedGuarantyRows, setSelectedGuarantyRows] = useState([]);



//   const accessToken = useSelector((state) => state.user.accessToken);

  

//   const {

//     data: fetchData = { data: [], meta: {} },

//     isError,

//     isRefetching,

//     isLoading,

//     refetch,

//   } = useQuery({

//     queryKey: ['table-data', columnFilters, globalFilter, sorting],

//     queryFn: async () => {

//       const fetchURL = new URL('https://aps2.zemenbank.com/zbss/api/rms/admin/landing/get_candidate');



//       fetchURL.searchParams.set('filters', JSON.stringify(columnFilters ?? []));

//       fetchURL.searchParams.set('globalFilter', globalFilter ?? '');

//       fetchURL.searchParams.set('sorting', JSON.stringify(sorting ?? []));



//       const response = await fetch(fetchURL.href, {

//         headers: {

//           'Content-Type': 'application/json',

//           'x-access-token': accessToken,

//         },

//       });

      

//       const json = await response.json();

//       return json;

//     },

//     placeholderData: keepPreviousData,

//   });



//   const { data = [], meta } = fetchData;



//   const handlePrintClick = (row) => {

//     const requestType = row.original.request_type.toLowerCase();

//     switch(requestType) {

//       case 'experience':

//         navigate('/admin/experiance', { state: { rowData: row.original } });

//         break;

//       case 'supportive':

//         if(row.original.language === "english"){

//           navigate('/admin/supportive', { state: { rowData: row.original } });

//         }

//         else{

//           navigate('/admin/supportive-am', { state: { rowData: row.original } })

//         }

        

//         break;

//       case 'guranty':

//         navigate('/admin/guaranty', { state: { rowData: row.original } });

//         break;

//       case 'embassy':

//         navigate('/admin/embassy', { state: { rowData: row.original } });

//         break;



//       case 'medical':

//         navigate('/admin/medical', { state: { rowData: row.original } });

//         break;



//       default:

//         console.error('Invalid request type');

//         // Optionally, you can show an error toast here

//         // toast.error('Invalid request type');

//     }

//   };



//   const handleExportRows = (rows) => {

//     const exportData = rows.map(row => ({

//        Status: row.original.status,

//       'Request Type': row.original.request_type,

//       'First Name': row.original.employee_first_name,

//       'Middle Name': row.original.employee_middle_name,

//       'Last Name': row.original.employee_last_name,

//       'Employee Description': row.original.employee_description,

//       'Domain User': row.original.domain_user,

//       'Created At': formatDateTime(row.original.TimeStamp),

//       'Viewed By': row.original.viewed_by,

//       'Viewed Date': formatDateTime(row.original.viewed_date),

//     }));



//     const worksheet = XLSX.utils.json_to_sheet(exportData);

//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Selected_Requests");

//     XLSX.writeFile(workbook, "SelectedRequestsExport.xlsx");

//   };



//   const handleExportData = (dataToExport) => {

//     const exportData = dataToExport.map(item => ({

//       Status: item.status,

//       'Request Type': item.request_type,

//       'First Name': item.employee_first_name,

//       'Middle Name': item.employee_middle_name,

//       'Last Name': item.employee_last_name,

//       'Employee Description': item.employee_description,

//       'Domain User': item.domain_user,

//       'Created At': formatDateTime(item.TimeStamp),

//       'Viewed By': item.viewed_by,

//       'Viewed Date': formatDateTime(item.viewed_date),

//     }));



//     const worksheet = XLSX.utils.json_to_sheet(exportData);

//     const workbook = XLSX.utils.book_new();

//     XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");

//     XLSX.writeFile(workbook, "RequestsExport.xlsx");

//   };



//   const handleOpenDetail = useCallback((data) => {

//     const randomDirection = Math.floor(Math.random() * 2) + 1;

//     setEntranceDirection(randomDirection);

//     setSelectedDetail(data);

//   }, []);



//   const AnimatedRequestTypeColumn = useCallback(() => ({

//     accessorKey: 'request_type',

//     header: 'Request Type',

//     size: 180,

//     Cell: ({ cell, row }) => (

//       <RequestTypeCell 

//         value={cell.getValue()} 

//         row={row} 

//         setSelectedDetail={handleOpenDetail}

//       />

//     ),

//   }), [handleOpenDetail]);



//   const columns = useMemo(

//     () => [

//       {

//         accessorKey: 'status',

//         header: 'Request Status',

//         enableEditing: false,

//         size: 150,

//         Cell: ({ cell }) => <StatusCell value={cell.getValue()} />,

//       },

//       AnimatedRequestTypeColumn(),

//       {

//         accessorKey: 'employee_first_name',

//         header: 'First Name',

//       },

//       {

//         accessorKey: 'employee_middle_name',

//         header: 'Middle Name',

//       },

//       {

//         accessorKey: 'employee_last_name',

//         header: 'Last Name',

//       },

//       {

//         accessorKey: 'employee_description',

//         header: 'Employee Description',

//         enableEditing: false,

//         size: 80,

//       },

//       {

//         accessorKey: 'domain_user',

//         header: 'Domain User',

//         enableEditing: false,

//         size: 80,

//       },

//       {

//         accessorKey: 'TimeStamp',

//         header: 'Created At',

//         filterVariant: 'date-range',

//         filterFn: (row, id, filterValue) => {

//           const date = new Date(row.getValue(id));

//           const [start, end] = filterValue;

          

//           if (!start && !end) return true;

//           if (start && !end) return date >= new Date(start);

//           if (!start && end) return date <= new Date(end);

          

//           return date >= new Date(start) && date <= new Date(end);

//         },

        

//         Cell: ({ cell }) => formatDateTime(cell.getValue()),

//         Header: ({ column }) => <em>{column.columnDef.header}</em>,

//         enableEditing: false,

//         minSize: 200,

//         sortDescFirst: true,

//         enableSorting: true,

//       },

//       {

//         accessorKey: 'viewed_by',

//         header: 'Viewed by',

//         enableEditing: false,

//         size: 80,

//       },



//       {

//         accessorKey: 'viewed_date',

//         header: 'Viewed Date',

//         filterVariant: 'date-range',

//         filterFn: (row, id, filterValue) => {

//           const date = new Date(row.getValue(id));

//           const [start, end] = filterValue;

          

//           if (!start && !end) return true;

//           if (start && !end) return date >= new Date(start);

//           if (!start && end) return date <= new Date(end);

          

//           return date >= new Date(start) && date <= new Date(end);

//         },

//         sortingFn: 'datetime',

//         Cell: ({ cell }) => formatDateTime(cell.getValue()),

//         Header: ({ column }) => <em>{column.columnDef.header}</em>,

//         enableEditing: false,

//         minSize: 200,

//       },



      

//     ],

//     [AnimatedRequestTypeColumn]

//   );



//   const { mutateAsync: approveRequest, isPending: isApprovingRequest } = useApproveRequest(refetch);

//   const { mutateAsync: rejectRequest, isPending: isRejectingRequest } = useRejectRequest(refetch);







//   // Add this new function to handle the revoke action

// const handleRevokeGuaranty = async () => {

//   try {

//     // Replace with your actual API endpoint

//     const response = await fetch("https://aps2.zemenbank.com/zbss/api/guaranty/revoke_guaranties", {

//       method: 'PATCH',

//       headers: {

//         'Content-Type': 'application/json',

//         'x-access-token': accessToken,

//       },

//       body: JSON.stringify({

//         ids: selectedGuarantyRows.map(row => row.original.id)

//       })

//     });



//     if (response.ok) {

//       toast.success(`Successfully revoked ${selectedGuarantyRows.length} guaranty requests`);

//       refetch();

//     } else {

//       toast.error('Failed to revoke guaranty requests');

//     }

//   } catch (error) {

//     toast.error('Error processing revoke request');

//   }

//   setOpenRevokeModal(false);

//   setSelectedGuarantyRows([]);

// };







//   const handleApproveConfirm = async () => {

//     if (selectedRow) {

//       await approveRequest({

//         id: selectedRow.original.id,

//         request_type: selectedRow.original.request_type

//       });

//       setOpenApproveModal(false);

//       setSelectedRow(null);

//     }

//   };



//   const handleRejectConfirm = async () => {

//     if (selectedRow) {

//       await rejectRequest({

//         id: selectedRow.original.id,

//         request_type: selectedRow.original.request_type

//       });

//       setOpenRejectModal(false);

//       setSelectedRow(null);

//     }

//   };



//   const viewedData = useMemo(() => 

//     data.filter(item => item.status === 'Viewed'),

//     [data]

//   );



//   const pendingData = useMemo(() => 

//     data.filter(item => item.status === 'Pending'),

//     [data]

//   );



//   const rejectedData = useMemo(() => 

//     data.filter(item => item.status === 'Rejected'),

//     [data]

//   );



//   const revokedData = useMemo(() => 

//     data.filter(item => item.status === 'Revoked'),

//     [data]

//   );



//   const createTableInstance = (filteredData, showActions = true) => useMaterialReactTable({

//     columns: columns.filter(col => col.accessorKey !== 'status'),

//     data: filteredData,

//     paginationDisplayMode: 'pages',

//     enableColumnOrdering: true,

//     enableGrouping: true,

//     enableStickyHeader: true,

//     enableRowActions: true,

//     enableRowPinning: true,

//     enableFacetedValues: true,

//     enableColumnPinning: true,

//     rowPinningDisplayMode: 'top-and-bottom',

//     muiToolbarAlertBannerProps: isError

//       ? {

//           color: 'error',

//           children: 'Error loading data',

//         }

//       : undefined,

//     onColumnFiltersChange: setColumnFilters,

//     onGlobalFilterChange: setGlobalFilter,

//     onSortingChange: setSorting,

//     createDisplayMode: 'modal',

//     editDisplayMode: 'modal',

//     enableEditing: false,

//     getRowId: (row) => row.id,

//     muiTableContainerProps: {

//       sx: { minHeight: '500px' },

//     },

//     enableRowSelection: true,

//     onRowSelectionChange: setRowSelection,

//     renderRowActions: showActions ? ({ row }) => {

//       if (activeTab === 1) {

//         return (

//           <Box sx={{ display: 'flex', gap: '1rem' }}>

//             <Tooltip title="Approve">

//               <motion.div

//                 initial={{ x: -100, opacity: 0 }}

//                 animate={{ x: 0, opacity: 1 }}

//                 transition={{ type: "spring", stiffness: 100, damping: 10 }}

//               >

//                 <Button

//                   variant="contained"

//                   color="success"

//                   onClick={() => {

//                     setOpenApproveModal(true);

//                     setSelectedRow(row);

//                   }}

//                 >

//                   Approve

//                 </Button>

//               </motion.div>

//             </Tooltip>

//             <Tooltip title="Reject">

//               <motion.div

//                 initial={{ x: 100, opacity: 0 }}

//                 animate={{ x: 0, opacity: 1 }}

//                 transition={{ type: "spring", stiffness: 100, damping: 10 }}

//               >

//                 <Button

//                   variant="contained"

//                   color="error"

//                   onClick={() => {

//                     setOpenRejectModal(true);

//                     setSelectedRow(row);

//                   }}

//                 >

//                   Reject

//                 </Button>

//               </motion.div>

//             </Tooltip>

//           </Box>

//         );

//       } else if (activeTab === 0) {

//         return (

//           <Tooltip title="Preview">

//             <motion.div

//               initial={{ x: 100, opacity: 0 }}

//               animate={{ x: 0, opacity: 1 }}

//               transition={{ type: "spring", stiffness: 100, damping: 10 }}

//             >

//               <motion.div animate={bounceAnimation}>

//                 <Button

//                   variant="contained"

//                   style={{ 

//                     backgroundColor: '#FFA500', 

//                     color: 'white',

//                     padding: '6px 16px',

//                   }}

//                   startIcon={<PreviewIcon />}

//                   onClick={() => handlePrintClick(row)}

//                 >

//                   Preview

//                 </Button>

//               </motion.div>

//             </motion.div>

//           </Tooltip>

//         );

//       }

//       return null;

//     } : undefined,

//     state: {

//       columnFilters,

//       globalFilter,

//       isLoading,

//       showAlertBanner: isError,

//       showProgressBars: isRefetching,

//       sorting,

//       rowSelection,

//     },

//     renderTopToolbarCustomActions: ({ table }) => (

//       <Box sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}>

//         <Button

//           color="primary"

//           onClick={() => handleExportData(filteredData)}

//           startIcon={<FileDownloadIcon />}

//           variant="contained"

//           size="small"

//           sx={{

//             backgroundColor: '#4CAF50',

//             '&:hover': { backgroundColor: '#45a049' }

//           }}

//         >

//           Export All Data

//         </Button>

//         <Button

//           disabled={!table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()}

//           onClick={() => handleExportRows(table.getSelectedRowModel().rows)}

//           startIcon={<FileDownloadIcon />}

//           variant="contained"

//           size="small"

//           sx={{

//             backgroundColor: '#2196F3',

//             '&:hover': { backgroundColor: '#1976D2' }

//           }}

//         >

//           Export Selected Rows

//         </Button>





//         <Button

//            disabled={!table.getSelectedRowModel().rows.some(row => 

//             row.original.request_type.toLowerCase() === 'guranty'

//           )}

//           onClick={() => {

//             const guarantyRows = table.getSelectedRowModel().rows.filter(

//               row => row.original.request_type.toLowerCase() === 'guranty'

//             );

//             setSelectedGuarantyRows(guarantyRows);

//             setOpenRevokeModal(true);

//           }}

//            startIcon={<BlockIcon  />}

//            variant="contained"

//            size="small"

//            sx={{

//             backgroundColor: '#FF5722',

//             '&:hover': { backgroundColor: '#F4511E' }

//           }}

//         >

//           Mark Revoked ({table.getSelectedRowModel().rows.filter(

//             row => row.original.request_type.toLowerCase() === 'guranty'

//           ).length})

//         </Button>



//         <ConfirmationModal

//           open={openRevokeModal}

//           onClose={() => setOpenRevokeModal(false)}

//           onConfirm={handleRevokeGuaranty}

//           title="Revoke Guaranty Requests"

//           message={

//             <Box>

//               <Typography variant="body1" sx={{ mb: 2 }}>

//                 Are you sure you want to revoke {selectedGuarantyRows.length} guaranty request(s)?

//               </Typography>

//               <Paper sx={{ p: 2, bgcolor: '#FFF3E0' }}>

//                 <Typography variant="subtitle2" color="warning.main" sx={{ mb: 1 }}>

//                   Selected requests to be revoked:

//                 </Typography>

//                 {selectedGuarantyRows.map((row, index) => (

//   <Paper

//     key={index}

//     elevation={0}

//     sx={{

//       p: 2,

//       mb: 1,

//       borderLeft: '4px solid #FF5722',

//       backgroundColor: 'rgba(255, 87, 34, 0.05)',

//       '&:hover': {

//         backgroundColor: 'rgba(255, 87, 34, 0.1)',

//         transform: 'translateX(8px)',

//         transition: 'all 0.3s ease'

//       }

//     }}

//   >

//     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

//       <Box>

//         <Typography variant="subtitle2" color="primary.main" sx={{ mb: 0.5 }}>

//           Employee

//         </Typography>

//         <Typography variant="body1" sx={{ fontWeight: 'bold' }}>

//           {row.original.employee_first_name} {row.original.employee_middle_name} {row.original.employee_last_name}

//         </Typography>

//       </Box>

//       <Box sx={{ textAlign: 'right' }}>

//         <Typography variant="subtitle2" color="warning.main" sx={{ mb: 0.5 }}>

//           Guaranty For

//         </Typography>

//         <Typography variant="body1" sx={{ color: '#FF5722' }}>

//           {row.original.guaranty_first_name} {row.original.guaranty_middle_name} {row.original.guaranty_last_name}

//         </Typography>

//       </Box>

//     </Box>

//     {row.original.guaranty_organazation && (

//       <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>

//         Organazation: {row.original.guaranty_organazation}

//       </Typography>

//     )}

//   </Paper>

// ))}

//               </Paper>

//             </Box>

//           }

//           confirmText="Revoke Guaranty"

//           confirmColor="#FF5722"

//           icon={BlockIcon}

//         />







//         <Button

//           onClick={() => refetch()}

//           startIcon={<RefreshIcon />}

//           variant="contained"

//           size="small"

//           sx={{

//             backgroundColor: '#FF9800',

//             '&:hover': { backgroundColor: '#F57C00' }

//           }}

//         >

//           Refresh

//         </Button>

//       </Box>

//     ),

//   });



//   const viewedTable = createTableInstance(viewedData);

//   const pendingTable = createTableInstance(pendingData);

//   const rejectedTable = createTableInstance(rejectedData, false);

//   const revokedTable = createTableInstance(revokedData, false);



//   return (

//     <>

//       <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>

//         <Tabs 

//           value={activeTab} 

//           onChange={(_, newValue) => setActiveTab(newValue)}

//           sx={{

//             '& .MuiTab-root': {

//               fontSize: '1rem',

//               fontWeight: 'bold',

//               textTransform: 'none',

//               minWidth: 120,

//             },

//           }}

//         >

//           <Tab 

//             label={

//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

//                 <span>Viewed</span>

//                 <Chip 

//                   label={viewedData.length} 

//                   size="small" 

//                   sx={{ bgcolor: '#4CAF50', color: 'white' }}

//                 />

//               </Box>

//             } 

//           />

//           <Tab 

//             label={

//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

//                 <span>Pending</span>

//                 <Chip 

//                   label={pendingData.length} 

//                   size="small" 

//                   sx={{ bgcolor: '#FFA500', color: 'white' }}

//                 />

//               </Box>

//             }

//           />





//           <Tab 

//             label={

//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

//                 <span>Rejected</span>

//                 <Chip 

//                   label={rejectedData.length} 

//                   size="small" 

//                   sx={{ bgcolor: '#F44336', color: 'white' }}

//                 />

//               </Box>

//             }

//           />





//         <Tab 

//             label={

//               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>

//                 <span>Revoked</span>

//                 <Chip 

//                   label={revokedData.length} 

//                   size="small" 

//                   sx={{ bgcolor: '#F44336', color: 'white' }}

//                 />

//               </Box>

//             }

//           />



//         </Tabs>



   



      



//       </Box>



//       <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>

//         <MaterialReactTable table={viewedTable} />

//       </Box>

//       <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>

//         <MaterialReactTable table={pendingTable} />

//       </Box>

//       <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>

//         <MaterialReactTable table={rejectedTable} />

//       </Box>



//       <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>

//         <MaterialReactTable table={revokedTable} />

//       </Box>



//       <DetailPanel 

//         isOpen={!!selectedDetail}

//         onClose={() => setSelectedDetail(null)}

//         data={selectedDetail || {}}

//         entranceDirection={entranceDirection}

//       />



//       <ConfirmationModal

//         open={openApproveModal}

//         onClose={() => setOpenApproveModal(false)}

//         onConfirm={handleApproveConfirm}

//         title="Approve Request"

//         message="Are you sure you want to approve this request?"

//         confirmText={isApprovingRequest ? 'Approving...' : 'Approve'}

//         confirmColor="#4CAF50"

//         icon={CheckCircle}

//       />



//       <ConfirmationModal

//         open={openRejectModal}

//         onClose={() => setOpenRejectModal(false)}

//         onConfirm={handleRejectConfirm}

//         title="Reject Request"

//         message="Are you sure you want to reject this request?"

//         confirmText={isRejectingRequest ? 'Rejecting...' : 'Reject'}

//         confirmColor="#F44336"

//         icon={XCircle}

//       />



//       <ToastContainer

//         position="top-right"

//         autoClose={5000}

//         hideProgressBar={false}

//         newestOnTop={false}

//         closeOnClick

//         rtl={false}

//         pauseOnFocusLoss

//         draggable

//         pauseOnHover

//         theme="colored"

//       />

//     </>

//   );

// };



// const queryClient = new QueryClient();



// const ExampleWithProviders = () => (

//   <QueryClientProvider client={queryClient}>

//     <LocalizationProvider dateAdapter={AdapterDayjs}>

//       <Example />

//     </LocalizationProvider>

//   </QueryClientProvider>

// );



// export default ExampleWithProviders;













import React, { useMemo, useState, useEffect, useCallback } from 'react';

import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import RefreshIcon from '@mui/icons-material/Refresh';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import BlockIcon from '@mui/icons-material/Block';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
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
  TextField,
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
import { CheckCircle, XCircle, X as CloseIcon, AlertTriangle } from 'lucide-react';
import { useApproveRequest, useRejectRequest } from './ApprovalEndpoint';
import PreviewIcon from '@mui/icons-material/Preview';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../../api/base';

const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date)) return '';

    const formattedDate = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    return `${formattedDate} at ${formattedTime}`;
  } catch (error) {
    return '';
  }
};

const getRequestTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'experience':
      return '#3498db';
    case 'guranty':
      return '#e74c3c';
    case 'supportive':
      return '#2ecc71';
    case 'embassy':
      return '#f39c12';
    case 'medical':
      return '#9b59b6';
    default:
      return '#95a5a6';
  }
};

const getRequestTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'experience':
      return '🏢';
    case 'guranty':
      return '🔐';
    case 'supportive':
      return '🤝';
    case 'embassy':
      return '🏛️';
    case 'medical':
      return '🏥';
    default:
      return '❓';
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
      case 'pending':
        return '#FFA500';
      case 'viewed':
        return '#4CAF50';
      default:
        return '#9E9E9E';
    }
  };

  const statusColor = getStatusColor(value);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
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
      ease: 'easeInOut',
    },
  },
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
      transition={{ duration: 3, ease: 'easeOut' }}
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
      case 1:
        return {
          initial: { x: '-100%', opacity: 0 },
          animate: {
            x: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
          },
          exit: {
            x: '-100%',
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: 'easeInOut',
            },
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
            overflow: 'hidden',
          },
        };

      case 2:
        return {
          initial: { x: '100%', opacity: 0 },
          animate: {
            x: 0,
            opacity: 1,
            transition: {
              type: 'spring',
              stiffness: 100,
              damping: 20,
            },
          },
          exit: {
            x: '100%',
            opacity: 0,
            transition: {
              duration: 0.3,
              ease: 'easeInOut',
            },
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
            overflow: 'hidden',
          },
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
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      const formattedTime = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      return `${formattedDate} at ${formattedTime}`;
    } catch (error) {
      return dateString;
    }
  };

  const formatValue = (value, key) => {
    if (value === null || value === undefined) return '-';

    if (
      [
        'TimeStamp',
        'viewed_date',
        'created_at',
        'updated_at',
        'approved_date',
        'rejected_date',
      ].includes(key) &&
      value
    ) {
      return formatDetailDateTime(value);
    }

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
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      color: typeColor,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {exp.position}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
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

    if (Array.isArray(value)) {
      return value
        .map((item) => (typeof item === 'object' ? JSON.stringify(item) : item))
        .join(', ');
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const shouldDisplayField = (key, value) => {
    const excludedKeys = ['_id', '__v'];

    if (data?.request_type?.toLowerCase() === 'medical') {
      const medicalExcludedKeys = [
        'employee_first_name',
        'employee_middle_name',
        'employee_last_name',
        // Rendered as the warning banner above the grid instead of a raw
        // "place of assignment source: manual" tile.
        'place_of_assignment_source',
      ];
      return (
        !excludedKeys.includes(key) &&
        !medicalExcludedKeys.includes(key) &&
        value !== undefined &&
        value !== null
      );
    }

    return (
      !excludedKeys.includes(key) && value !== undefined && value !== null
    );
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
              transition: { delay: 0.2 },
            }}
            style={{
              padding: '32px',
              height: '100%',
              overflow: 'auto',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '32px',
                borderBottom: `3px solid ${typeColor}`,
                paddingBottom: '16px',
              }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: typeColor }}>
                  Request Details
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 'bold',
                    color: typeColor,
                  }}
                >
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
                    },
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
              {/* HRIS data-gap flag. The employee was allowed to type their own
                  Place of Assignment because HRIS had none; the approver has to
                  see that before approving, and is the person who gets the HRIS
                  record fixed. */}
              {data?.request_type?.toLowerCase() === 'medical' &&
                data?.place_of_assignment_source === 'manual' && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      mb: 3,
                      borderRadius: '16px',
                      border: '1px solid rgba(240, 173, 78, 0.55)',
                      background: '#fff8e6',
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                    }}
                  >
                    <AlertTriangle
                      size={22}
                      style={{ color: '#b8860b', flexShrink: 0, marginTop: 2 }}
                    />
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: '#8a6100' }}
                      >
                        Place of Assignment was entered by the employee
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5, color: '#5f4708' }}>
                        HRIS has no Place of Assignment for{' '}
                        <strong>{data?.domain_user}</strong>, so they typed{' '}
                        <strong>&ldquo;{data?.place_of_assignment}&rdquo;</strong> rather than
                        being blocked from requesting. Please check it is correct before
                        approving, and fix the HRIS record — once HRIS has the value this flag
                        clears itself on the next approval.
                      </Typography>
                    </Box>
                  </Paper>
                )}

              <Box
                sx={{
                  display: 'grid',
                  gap: '24px',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                }}
              >
                {Object.entries(data || {}).map(
                  ([key, value]) =>
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
                              boxShadow: `0 8px 24px ${typeColor}15`,
                            },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: typeColor,
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {key.replace(/_/g, ' ')}
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 'medium',
                              marginTop: '4px',
                              wordBreak: 'break-word',
                            }}
                          >
                            {formatValue(value, key)}
                          </Typography>
                        </Paper>
                      </motion.div>
                    )
                )}
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
                borderTop: `1px solid ${typeColor}22`,
              }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
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
                    },
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
  icon: Icon,
  // Medical-only: when true, render a date picker for the approval date.
  // Back-dating is allowed; future dates are disabled. Default is today.
  showApprovalDate = false,
  approvalDate,
  setApprovalDate,
  // Medical-only: set when this request's Place of Assignment was typed in by
  // the employee because HRIS had none. The approver confirms or corrects it
  // here rather than having to reject and ask them to resubmit.
  showManualPlace = false,
  placeOfAssignment,
  setPlaceOfAssignment,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '16px',
          minWidth: '400px',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {Icon && <Icon size={24} style={{ color: confirmColor }} />}
          <Typography variant="h6" component="span">
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">{message}</Typography>
        {showApprovalDate && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Approval Date
            </Typography>
            <DatePicker
              value={approvalDate}
              onChange={(newValue) => setApprovalDate && setApprovalDate(newValue)}
              maxDate={dayjs()}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  helperText: 'Defaults to today. Back-dating is allowed; future dates are not.',
                },
              }}
            />
          </Box>
        )}
        {showManualPlace && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: '12px',
              background: '#fff8e6',
              border: '1px solid rgba(240, 173, 78, 0.55)',
            }}
          >
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              <AlertTriangle
                size={18}
                style={{ color: '#b8860b', flexShrink: 0, marginTop: 2 }}
              />
              <Typography variant="body2" sx={{ color: '#5f4708' }}>
                HRIS has no <strong>Place of Assignment</strong> for this employee, so they
                entered it themselves. Confirm or correct it before approving.
              </Typography>
            </Box>
            <TextField
              size="small"
              fullWidth
              sx={{ mt: 1.5 }}
              label="Place of Assignment"
              value={placeOfAssignment || ''}
              onChange={(e) => setPlaceOfAssignment && setPlaceOfAssignment(e.target.value)}
              inputProps={{ maxLength: 120 }}
              helperText="If the HRIS record has since been fixed, that value wins automatically and this is ignored."
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 24px',
            }}
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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
                opacity: 0.9,
              },
            }}
          >
            {confirmText}
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

// New Rejection Modal with Reason Field
const RejectionModal = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  rejectionReason,
  setRejectionReason,
  selectedRow,
}) => {
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setError('');
    onConfirm();
  };

  const handleClose = () => {
    setError('');
    setRejectionReason('');
    onClose();
  };

  const typeColor = getRequestTypeColor(selectedRow?.original?.request_type);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          padding: '16px',
          minWidth: '500px',
          maxWidth: '600px',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <XCircle size={24} style={{ color: '#F44336' }} />
          <Typography variant="h6" component="span">
            Reject Request
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedRow && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderLeft: `4px solid ${typeColor}`,
              backgroundColor: `${typeColor}10`,
              borderRadius: '8px',
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Request Details
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedRow.original.request_type}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {selectedRow.original.employee_first_name}{' '}
                  {selectedRow.original.employee_middle_name}{' '}
                  {selectedRow.original.employee_last_name}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to reject this request? Please provide a reason below.
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          id="rejection-reason"
          label="Rejection Reason"
          placeholder="Please provide the reason for rejecting this request..."
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={rejectionReason}
          onChange={(e) => {
            setRejectionReason(e.target.value);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error}
          sx={{
            mt: 1,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              '&.Mui-focused fieldset': {
                borderColor: '#F44336',
              },
            },
            '& .MuiInputLabel-root.Mui-focused': {
              color: '#F44336',
            },
          }}
        />

        <Typography
          variant="caption"
          sx={{ mt: 1, display: 'block', color: 'text.secondary' }}
        >
          * This reason will be recorded and the requester will be notified.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: '16px' }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 24px',
            }}
          >
            Cancel
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={isLoading}
            sx={{
              backgroundColor: '#F44336',
              color: 'white',
              borderRadius: '8px',
              textTransform: 'none',
              padding: '8px 24px',
              '&:hover': {
                backgroundColor: '#D32F2F',
              },
              '&:disabled': {
                backgroundColor: '#F4433680',
                color: 'white',
              },
            }}
          >
            {isLoading ? 'Rejecting...' : 'Reject Request'}
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

  // New state for rejection reason
  const [rejectionReason, setRejectionReason] = useState('');

  // Medical-only: admin-selected approval date (back-dating allowed, no future).
  const [approvalDate, setApprovalDate] = useState(dayjs());

  // Medical-only: the Place of Assignment shown in the approve dialog when the
  // employee had to type it in because HRIS had none. Seeded from the row when
  // the dialog opens so the approver confirms rather than retypes.
  const [approvalPlace, setApprovalPlace] = useState('');

  const [openRevokeModal, setOpenRevokeModal] = useState(false);
  const [selectedGuarantyRows, setSelectedGuarantyRows] = useState([]);

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
      const fetchURL = new URL(
        `${API_BASE}/rms/admin/landing/get_candidate`,
        window.location.origin,
      );

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
    switch (requestType) {
      case 'experience':
        navigate('/admin/experiance', { state: { rowData: row.original } });
        break;
      case 'supportive':
        if (row.original.language === 'english') {
          navigate('/admin/supportive', { state: { rowData: row.original } });
        } else {
          navigate('/admin/supportive-am', { state: { rowData: row.original } });
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
    }
  };

  const handleExportRows = (rows) => {
    const exportData = rows.map((row) => ({
      Status: row.original.status,
      'Request Type': row.original.request_type,
      'First Name': row.original.employee_first_name,
      'Middle Name': row.original.employee_middle_name,
      'Last Name': row.original.employee_last_name,
      'Employee Description': row.original.employee_description,
      'Domain User': row.original.domain_user,
      'Created At': formatDateTime(row.original.TimeStamp),
      'Viewed By': row.original.viewed_by,
      'Viewed Date': formatDateTime(row.original.viewed_date),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected_Requests');
    XLSX.writeFile(workbook, 'SelectedRequestsExport.xlsx');
  };

  const handleExportData = (dataToExport) => {
    const exportData = dataToExport.map((item) => ({
      Status: item.status,
      'Request Type': item.request_type,
      'First Name': item.employee_first_name,
      'Middle Name': item.employee_middle_name,
      'Last Name': item.employee_last_name,
      'Employee Description': item.employee_description,
      'Domain User': item.domain_user,
      'Created At': formatDateTime(item.TimeStamp),
      'Viewed By': item.viewed_by,
      'Viewed Date': formatDateTime(item.viewed_date),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requests');
    XLSX.writeFile(workbook, 'RequestsExport.xlsx');
  };

  const handleOpenDetail = useCallback((data) => {
    const randomDirection = Math.floor(Math.random() * 2) + 1;
    setEntranceDirection(randomDirection);
    setSelectedDetail(data);
  }, []);

  const AnimatedRequestTypeColumn = useCallback(
    () => ({
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
    }),
    [handleOpenDetail]
  );

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
        filterVariant: 'date-range',
        filterFn: (row, id, filterValue) => {
          const date = new Date(row.getValue(id));
          const [start, end] = filterValue;

          if (!start && !end) return true;
          if (start && !end) return date >= new Date(start);
          if (!start && end) return date <= new Date(end);

          return date >= new Date(start) && date <= new Date(end);
        },

        Cell: ({ cell }) => formatDateTime(cell.getValue()),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        enableEditing: false,
        minSize: 200,
        sortDescFirst: true,
        enableSorting: true,
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
        filterVariant: 'date-range',
        filterFn: (row, id, filterValue) => {
          const date = new Date(row.getValue(id));
          const [start, end] = filterValue;

          if (!start && !end) return true;
          if (start && !end) return date >= new Date(start);
          if (!start && end) return date <= new Date(end);

          return date >= new Date(start) && date <= new Date(end);
        },
        sortingFn: 'datetime',
        Cell: ({ cell }) => formatDateTime(cell.getValue()),
        Header: ({ column }) => <em>{column.columnDef.header}</em>,
        enableEditing: false,
        minSize: 200,
      },
    ],
    [AnimatedRequestTypeColumn]
  );

  const { mutateAsync: approveRequest, isPending: isApprovingRequest } =
    useApproveRequest(refetch);
  const { mutateAsync: rejectRequest, isPending: isRejectingRequest } =
    useRejectRequest(refetch);

  const handleRevokeGuaranty = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/guaranty/revoke_guaranties`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': accessToken,
          },
          body: JSON.stringify({
            ids: selectedGuarantyRows.map((row) => row.original.id),
          }),
        }
      );

      if (response.ok) {
        toast.success(
          `Successfully revoked ${selectedGuarantyRows.length} guaranty requests`
        );
        refetch();
      } else {
        toast.error('Failed to revoke guaranty requests');
      }
    } catch (error) {
      toast.error('Error processing revoke request');
    }
    setOpenRevokeModal(false);
    setSelectedGuarantyRows([]);
  };

  const handleApproveConfirm = async () => {
    if (selectedRow) {
      const requestType = selectedRow.original.request_type;
      const isMedical = (requestType || '').toLowerCase() === 'medical';
      // Only pass approval_date for medical; backend ignores otherwise.
      const approvalDateIso =
        isMedical && approvalDate && approvalDate.isValid && approvalDate.isValid()
          ? approvalDate.toISOString()
          : undefined;
      // Only sent for a medical request whose place of assignment was typed in
      // by the employee. The backend ignores it in every other case, and lets
      // HRIS win if the record has since been corrected.
      const isManualPlace =
        isMedical && selectedRow.original.place_of_assignment_source === 'manual';

      await approveRequest({
        id: selectedRow.original.id,
        request_type: requestType,
        approval_date: approvalDateIso,
        place_of_assignment:
          isManualPlace && approvalPlace.trim() ? approvalPlace.trim() : undefined,
      });
      setOpenApproveModal(false);
      setSelectedRow(null);
      // Reset back to today for the next approval.
      setApprovalDate(dayjs());
      setApprovalPlace('');
    }
  };

  // Updated to include rejection_reason
  const handleRejectConfirm = async () => {
    if (selectedRow) {
      await rejectRequest({
        id: selectedRow.original.id,
        request_type: selectedRow.original.request_type,
        rejection_reason: rejectionReason,
      });
      setOpenRejectModal(false);
      setSelectedRow(null);
      setRejectionReason(''); // Reset rejection reason after submission
    }
  };

  const viewedData = useMemo(
    () => data.filter((item) => item.status === 'Viewed'),
    [data]
  );

  const pendingData = useMemo(
    () => data.filter((item) => item.status === 'Pending'),
    [data]
  );

  const rejectedData = useMemo(
    () => data.filter((item) => item.status === 'Rejected'),
    [data]
  );

  const revokedData = useMemo(
    () => data.filter((item) => item.status === 'Revoked'),
    [data]
  );

  const createTableInstance = (filteredData, showActions = true) =>
    useMaterialReactTable({
      columns: columns.filter((col) => col.accessorKey !== 'status'),
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
      renderRowActions: showActions
        ? ({ row }) => {
            if (activeTab === 1) {
              return (
                <Box sx={{ display: 'flex', gap: '1rem' }}>
                  <Tooltip title="Approve">
                    <motion.div
                      initial={{ x: -100, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 10,
                      }}
                    >
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => {
                          setApprovalDate(dayjs());
                          setApprovalPlace(
                            row.original?.place_of_assignment_source === 'manual'
                              ? row.original?.place_of_assignment || ''
                              : ''
                          );
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
                      transition={{
                        type: 'spring',
                        stiffness: 100,
                        damping: 10,
                      }}
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
                    transition={{
                      type: 'spring',
                      stiffness: 100,
                      damping: 10,
                    }}
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
          }
        : undefined,
      state: {
        columnFilters,
        globalFilter,
        isLoading,
        showAlertBanner: isError,
        showProgressBars: isRefetching,
        sorting,
        rowSelection,
      },
      renderTopToolbarCustomActions: ({ table }) => (
        <Box
          sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}
        >
          <Button
            color="primary"
            onClick={() => handleExportData(filteredData)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#4CAF50',
              '&:hover': { backgroundColor: '#45a049' },
            }}
          >
            Export All Data
          </Button>
          <Button
            disabled={
              !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
            }
            onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
            startIcon={<FileDownloadIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#2196F3',
              '&:hover': { backgroundColor: '#1976D2' },
            }}
          >
            Export Selected Rows
          </Button>

          <Button
            disabled={
              !table
                .getSelectedRowModel()
                .rows.some(
                  (row) => row.original.request_type.toLowerCase() === 'guranty'
                )
            }
            onClick={() => {
              const guarantyRows = table
                .getSelectedRowModel()
                .rows.filter(
                  (row) => row.original.request_type.toLowerCase() === 'guranty'
                );
              setSelectedGuarantyRows(guarantyRows);
              setOpenRevokeModal(true);
            }}
            startIcon={<BlockIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#FF5722',
              '&:hover': { backgroundColor: '#F4511E' },
            }}
          >
            Mark Revoked (
            {
              table
                .getSelectedRowModel()
                .rows.filter(
                  (row) => row.original.request_type.toLowerCase() === 'guranty'
                ).length
            }
            )
          </Button>

          <ConfirmationModal
            open={openRevokeModal}
            onClose={() => setOpenRevokeModal(false)}
            onConfirm={handleRevokeGuaranty}
            title="Revoke Guaranty Requests"
            message={
              <Box>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Are you sure you want to revoke {selectedGuarantyRows.length}{' '}
                  guaranty request(s)?
                </Typography>
                <Paper sx={{ p: 2, bgcolor: '#FFF3E0' }}>
                  <Typography
                    variant="subtitle2"
                    color="warning.main"
                    sx={{ mb: 1 }}
                  >
                    Selected requests to be revoked:
                  </Typography>
                  {selectedGuarantyRows.map((row, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 1,
                        borderLeft: '4px solid #FF5722',
                        backgroundColor: 'rgba(255, 87, 34, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 87, 34, 0.1)',
                          transform: 'translateX(8px)',
                          transition: 'all 0.3s ease',
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="primary.main"
                            sx={{ mb: 0.5 }}
                          >
                            Employee
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {row.original.employee_first_name}{' '}
                            {row.original.employee_middle_name}{' '}
                            {row.original.employee_last_name}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography
                            variant="subtitle2"
                            color="warning.main"
                            sx={{ mb: 0.5 }}
                          >
                            Guaranty For
                          </Typography>
                          <Typography variant="body1" sx={{ color: '#FF5722' }}>
                            {row.original.guaranty_first_name}{' '}
                            {row.original.guaranty_middle_name}{' '}
                            {row.original.guaranty_last_name}
                          </Typography>
                        </Box>
                      </Box>
                      {row.original.guaranty_organazation && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: 'text.secondary' }}
                        >
                          Organazation: {row.original.guaranty_organazation}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Paper>
              </Box>
            }
            confirmText="Revoke Guaranty"
            confirmColor="#FF5722"
            icon={BlockIcon}
          />

          <Button
            onClick={() => refetch()}
            startIcon={<RefreshIcon />}
            variant="contained"
            size="small"
            sx={{
              backgroundColor: '#FF9800',
              '&:hover': { backgroundColor: '#F57C00' },
            }}
          >
            Refresh
          </Button>
        </Box>
      ),
    });

  const viewedTable = createTableInstance(viewedData);
  const pendingTable = createTableInstance(pendingData);
  const rejectedTable = createTableInstance(rejectedData, false);
  const revokedTable = createTableInstance(revokedData, false);

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
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>Revoked</span>
                <Chip
                  label={revokedData.length}
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
      <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
        <MaterialReactTable table={revokedTable} />
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
        showApprovalDate={
          (selectedRow?.original?.request_type || '').toLowerCase() === 'medical'
        }
        approvalDate={approvalDate}
        setApprovalDate={setApprovalDate}
        showManualPlace={
          (selectedRow?.original?.request_type || '').toLowerCase() === 'medical' &&
          selectedRow?.original?.place_of_assignment_source === 'manual'
        }
        placeOfAssignment={approvalPlace}
        setPlaceOfAssignment={setApprovalPlace}
      />

      {/* Updated Rejection Modal with Reason Field */}
      <RejectionModal
        open={openRejectModal}
        onClose={() => {
          setOpenRejectModal(false);
          setRejectionReason('');
        }}
        onConfirm={handleRejectConfirm}
        isLoading={isRejectingRequest}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        selectedRow={selectedRow}
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