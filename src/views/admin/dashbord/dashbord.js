import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
         BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useSelector } from 'react-redux';
import { Select, MenuItem, TextField, Box, Card, Typography, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs'; // Add this import at the top
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = {
  Pending: '#FFA500',
  Rejected: '#FF4444',
  Viewed: '#00C851',
  Experience: '#2196F3',
  Personal: '#673AB7',
  default: '#8884d8'
};

const ANIMATIONS = {
  initial: { opacity: 0, y: 20, scale: 0.9 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const CARD_ANIMATIONS = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    requestTypeStats: [],
    timelineData: []
  });
  // Update the dateRange state to use dayjs
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  const [loading, setLoading] = useState(true);
  const accessToken = useSelector((state) => state.user.accessToken);
  const [viewerStats, setViewerStats] = useState([]);
  const [approvedByType, setApprovedByType] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch("https://aps2.zemenbank.com/zbss/api/rms/admin/landing/get_candidate", {
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': accessToken,
        },
      });
      
      const { data } = await response.json();
      
      // Apply date filter if both dates are selected
      if (dateRange.startDate && dateRange.endDate) {
        const startDate = dayjs(dateRange.startDate).toDate();
        const endDate = dayjs(dateRange.endDate).toDate();
        processData(data, startDate, endDate);
      } else {
        processData(data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processData = (data, startDate = null, endDate = null) => {
    if (!Array.isArray(data) || data.length === 0) return;
  
    // Filter data by date range if provided
    const filteredData = startDate && endDate 
      ? data.filter(item => {
          const itemDate = new Date(item.TimeStamp);
          return itemDate >= startDate && itemDate <= endDate;
        })
      : data;
  
    // Process request types with status breakdown (add Revoked)
    const requestTypeStats = filteredData.reduce((acc, item) => {
      const type = item.request_type || 'Other';
      const status = item.status || 'Pending';
  
      if (!acc[type]) {
        acc[type] = { total: 0, Pending: 0, Rejected: 0, Viewed: 0, Revoked: 0 };
      }
      acc[type].total += 1;
      if (acc[type][status] !== undefined) {
        acc[type][status] += 1;
      }
      return acc;
    }, {});
  
    // Process timeline data with status (add Revoked)
    const timeline = filteredData.reduce((acc, item) => {
      const date = new Date(item.TimeStamp).toLocaleDateString();
      const status = item.status || 'Pending';
  
      if (!acc[date]) {
        acc[date] = { Pending: 0, Rejected: 0, Viewed: 0, Revoked: 0 };
      }
      if (acc[date][status] !== undefined) {
        acc[date][status] += 1;
      }
      return acc;
    }, {});
  
    // --- New: Per "viewed_by" analytics ---
    const viewerMap = {};
    filteredData.forEach(item => {
      if (item.status === "Viewed" && item.viewed_by && item.TimeStamp && item.viewed_date) {
        const viewer = item.viewed_by;
        const responseTime = (new Date(item.viewed_date) - new Date(item.TimeStamp)) / 1000; // seconds
        if (!viewerMap[viewer]) {
          viewerMap[viewer] = {
            count: 0,
            responseTimes: [],
          };
        }
        viewerMap[viewer].count += 1;
        viewerMap[viewer].responseTimes.push(responseTime);
      }
    });
    // Calculate stats for each viewer
    const viewerStatsArr = Object.entries(viewerMap).map(([viewer, stats]) => {
      const avg = stats.responseTimes.reduce((a, b) => a + b, 0) / stats.responseTimes.length;
      const fastest = Math.min(...stats.responseTimes);
      const slowest = Math.max(...stats.responseTimes);
      return {
        viewer,
        viewedCount: stats.count,
        avgResponse: avg,
        fastest,
        slowest,
      };
    });

    // --- New: Approved (Viewed) requests by request type ---
    const approvedTypeMap = {};
    filteredData.forEach(item => {
      if (item.status === "Viewed") {
        const type = item.request_type || "Other";
        if (!approvedTypeMap[type]) approvedTypeMap[type] = 0;
        approvedTypeMap[type] += 1;
      }
    });
    const approvedByTypeArr = Object.entries(approvedTypeMap).map(([type, count]) => ({
      type,
      count,
    }));

    setDashboardData({
      requestTypeStats: Object.entries(requestTypeStats).map(([type, stats]) => ({
        type,
        ...stats,
        percentage: ((stats.total / filteredData.length) * 100).toFixed(1)
      })),
      timelineData: Object.entries(timeline).map(([date, stats]) => ({
        date,
        ...stats
      })).sort((a, b) => new Date(a.date) - new Date(b.date))
    });

    // Set new analytics state
    setViewerStats(viewerStatsArr);
    setApprovedByType(approvedByTypeArr);
  };

  // Update handleDateChange to properly handle dayjs objects
  const handleDateChange = (type, newValue) => {
    setDateRange(prev => ({
      ...prev,
      [type]: newValue // newValue is already a dayjs object
    }));
  };

  const applyDateFilter = () => {
    fetchData();
  };

  // Add date filter UI below the title
  return (
    <Box sx={{ p: 4, bgcolor: 'background.default' }}>
      <motion.div {...ANIMATIONS}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: 'center', background: 'linear-gradient(45deg, #2196F3, #673AB7)', 
          backgroundClip: 'text', color: 'transparent', fontWeight: 'bold' }}>
          HR Analytics Dashboard
        </Typography>

        {/* Date Range Filter */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ p: 2, mb: 3, background: 'linear-gradient(to right, #ffffff, #f8f9fa)' }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(newValue) => handleDateChange('startDate', newValue)}
                  sx={{ flex: 1, minWidth: 200 }}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      size: 'small'
                    }
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(newValue) => handleDateChange('endDate', newValue)}
                  sx={{ flex: 1, minWidth: 200 }}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      size: 'small'
                    }
                  }}
                />
              </LocalizationProvider>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card 
                  onClick={applyDateFilter}
                  sx={{ 
                    p: 1, 
                    px: 3, 
                    cursor: 'pointer',
                    background: 'linear-gradient(45deg, #2196F3, #673AB7)',
                    color: 'white'
                  }}
                >
                  <Typography>Apply Filter</Typography>
                </Card>
              </motion.div>
            </Box>
          </Card>
        </motion.div>

        {/* Status Summary Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr 1fr' }, gap: 2, mb: 3 }}>
          {['Pending', 'Rejected', 'Viewed', 'Revoked'].map((status) => (
            <motion.div key={status} whileHover={CARD_ANIMATIONS.hover} whileTap={CARD_ANIMATIONS.tap}>
              <Card sx={{ 
                p: 2, 
                background: `linear-gradient(135deg, ${COLORS[status] || COLORS.default}22, ${COLORS[status] || COLORS.default}11)`,
                border: `1px solid ${(COLORS[status] || COLORS.default)}33`
              }}>
                <Typography variant="h6" sx={{ color: COLORS[status] || COLORS.default }}>{status} Requests</Typography>
                <Typography variant="h4">
                  {dashboardData.requestTypeStats.reduce((acc, curr) => acc + (curr[status] || 0), 0)}
                </Typography>
              </Card>
            </motion.div>
          ))}
        </Box>

      
      
        {/* --- End Export PDF for Charts --- */}

        {/* Charts */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          {/* Timeline Chart */}
          <motion.div {...ANIMATIONS} sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
            <Card id="timeline-chart-section" sx={{ p: 3, background: 'linear-gradient(to right, #ffffff, #f8f9fa)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <button
                  onClick={() => exportSectionToPDF('timeline-chart-section', 'request_timeline.pdf')}
                  style={{
                    background: 'linear-gradient(90deg, #2196F3 0%, #673AB7 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Export Request Timeline PDF
                </button>
              </Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Request Timeline</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dashboardData.timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {['Pending', 'Rejected', 'Viewed', 'Revoked'].map((status, index) => (
                    <Area
                      key={status}
                      type="monotone"
                      dataKey={status}
                      stackId="1"
                      stroke={COLORS[status] || COLORS.default}
                      fill={COLORS[status] || COLORS.default}
                      fillOpacity={0.6}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* Request Types Breakdown */}
          <motion.div {...ANIMATIONS}>
            <Card id="request-types-breakdown-section" sx={{ p: 3, background: 'linear-gradient(to right, #ffffff, #f8f9fa)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <button
                  onClick={() => exportSectionToPDF('request-types-breakdown-section', 'request_types_breakdown.pdf')}
                  style={{
                    background: 'linear-gradient(90deg, #673AB7 0%, #2196F3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '6px 16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Export Request Types Breakdown PDF
                </button>
              </Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Request Types Breakdown</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.requestTypeStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="type" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {['Pending', 'Rejected', 'Viewed', 'Revoked'].map((status) => (
                    <Bar 
                      key={status} 
                      dataKey={status} 
                      stackId="a" 
                      fill={COLORS[status] || COLORS.default}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </Box>

        {/* --- Comprehensive Analytics Section --- */}
        <Card
          sx={{
            mt: 4,
            p: 4,
            background: 'linear-gradient(120deg, #f3e7e9 0%, #e3eeff 100%)',
            boxShadow: 6,
            borderRadius: 4,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                letterSpacing: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexGrow: 1,
              }}
            >
              <span role="img" aria-label="analytics">📊</span>
              Per-Viewer Analytics
            </Typography>
            <Box>
              <button
                onClick={() => exportViewerStatsCSV(viewerStats)}
                style={{
                  background: 'linear-gradient(90deg, #2196F3 0%, #673AB7 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 8
                }}
                disabled={viewerStats.length === 0}
              >
                Export CSV
              </button>
              <button
                onClick={() => exportSectionToPDF('per-viewer-analytics-section', 'per_viewer_analytics.pdf')}
                style={{
                  background: 'linear-gradient(90deg, #673AB7 0%, #2196F3 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: 8
                }}
                disabled={viewerStats.length === 0}
              >
                Export PDF
              </button>
            </Box>
          </Box>
          <Box
            id="per-viewer-analytics-section"
            sx={{
              overflowX: 'auto',
              mb: 4,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.8)',
              boxShadow: 2,
              p: 2,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #2196F3 0%, #673AB7 100%)', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: 12, borderTopLeftRadius: 8 }}>👤 Viewed By</th>
                  <th style={{ textAlign: 'right', padding: 12 }}>Viewed Count</th>
                  <th style={{ textAlign: 'right', padding: 12 }}>Avg Response</th>
                  <th style={{ textAlign: 'right', padding: 12 }}>Fastest</th>
                  <th style={{ textAlign: 'right', padding: 12, borderTopRightRadius: 8 }}>Slowest</th>
                </tr>
              </thead>
              <tbody>
                {viewerStats.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 16, color: '#888' }}>
                      No data available.
                    </td>
                  </tr>
                ) : (
                  viewerStats.map((stat, idx) => (
                    <tr
                      key={stat.viewer}
                      style={{
                        background: idx % 2 === 0 ? '#f5f6fa' : '#e3eeff',
                        fontWeight: 500,
                      }}
                    >
                      <td style={{ padding: 12 }}>{stat.viewer}</td>
                      <td style={{ textAlign: 'right', padding: 12 }}>{stat.viewedCount}</td>
                      <td style={{ textAlign: 'right', padding: 12 }}>{formatDuration(stat.avgResponse)}</td>
                      <td style={{ textAlign: 'right', padding: 12, color: '#43a047' }}>{formatDuration(stat.fastest)}</td>
                      <td style={{ textAlign: 'right', padding: 12, color: '#e53935' }}>{formatDuration(stat.slowest)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 'bold',
              color: 'secondary.main',
              letterSpacing: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <span role="img" aria-label="approved">✅</span>
            Approved Requests by Type
          </Typography>
          <Box
            sx={{
              overflowX: 'auto',
              borderRadius: 2,
              background: 'rgba(255,255,255,0.8)',
              boxShadow: 2,
              p: 2,
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: 'linear-gradient(90deg, #00C851 0%, #2196F3 100%)', color: '#fff' }}>
                  <th style={{ textAlign: 'left', padding: 12, borderTopLeftRadius: 8 }}>📄 Request Type</th>
                  <th style={{ textAlign: 'right', padding: 12, borderTopRightRadius: 8 }}>Approved Count</th>
                </tr>
              </thead>
              <tbody>
                {approvedByType.length === 0 ? (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', padding: 16, color: '#888' }}>
                      No data available.
                    </td>
                  </tr>
                ) : (
                  approvedByType.map((row, idx) => (
                    <tr
                      key={row.type}
                      style={{
                        background: idx % 2 === 0 ? '#f5f6fa' : '#e3eeff',
                        fontWeight: 500,
                      }}
                    >
                      <td style={{ padding: 12 }}>{row.type}</td>
                      <td style={{ textAlign: 'right', padding: 12 }}>{row.count}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Card>
        {/* --- End Comprehensive Analytics Section --- */}

      </motion.div>
    </Box>
  );
};

export default Dashboard;

const formatDuration = (seconds) => {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins} min ${secs.toFixed(1)} s`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours} hr ${remMins} min ${secs.toFixed(1)} s`;
};

// --- Add CSV export helpers ---
const exportViewerStatsCSV = (viewerStats) => {
  const header = [
    "Viewed By",
    "Viewed Count",
    "Avg Response",
    "Fastest",
    "Slowest"
  ];
  const rows = viewerStats.map(stat => [
    stat.viewer,
    stat.viewedCount,
    formatDuration(stat.avgResponse),
    formatDuration(stat.fastest),
    formatDuration(stat.slowest)
  ]);
  const csvContent = [header, ...rows]
    .map(row => row.map(val => `"${val}"`).join(","))
    .join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "per_viewer_analytics.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const exportApprovedByTypeCSV = (approvedByType) => {
  const header = [
    "Request Type",
    "Approved Count"
  ];
  const rows = approvedByType.map(row => [
    row.type,
    row.count
  ]);
  const csvContent = [header, ...rows]
    .map(row => row.map(val => `"${val}"`).join(","))
    .join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "approved_requests_by_type.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// PDF Export Helper
const exportSectionToPDF = async (elementId, fileName) => {
  const input = document.getElementById(elementId);
  if (!input) return;
  const canvas = await html2canvas(input, { scale: 2 });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [canvas.width, canvas.height]
  });
  pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save(fileName);
};