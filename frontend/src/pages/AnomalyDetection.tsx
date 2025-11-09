import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';

// Create a properly typed Grid component with all necessary props
type GridProps = MuiGridProps & {
  item?: boolean;
  container?: boolean;
  spacing?: number | string;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
};

const Grid: React.FC<GridProps> = (props) => <MuiGrid {...props} />;

// Use MuiGrid directly with proper props
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, subDays } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import Tooltip from '@mui/material/Tooltip';

// Types
type Severity = 'low' | 'medium' | 'high';

interface Anomaly {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  sensorType: string;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  severity: Severity;
  status: 'new' | 'acknowledged' | 'resolved';
  description: string;
  suggestedAction: string;
}

// Mock data
const generateMockAnomalies = (count: number): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  const sensorTypes = ['Temperature', 'Vibration', 'Current', 'Voltage', 'Pressure'];
  const statuses: ('new' | 'acknowledged' | 'resolved')[] = ['new', 'acknowledged', 'resolved'];
  const severities: Severity[] = ['low', 'medium', 'high'];
  const machines = [
    { id: 'CNC-001', name: 'CNC Milling #1' },
    { id: 'CNC-002', name: 'CNC Lathe #2' },
    { id: 'CNC-003', name: 'CNC Router #1' },
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72));
    timestamp.setMinutes(Math.floor(Math.random() * 60));
    
    const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const machine = machines[Math.floor(Math.random() * machines.length)];
    
    let value, min, max;
    
    // Set realistic ranges based on sensor type
    switch (sensorType) {
      case 'Temperature':
        min = 20;
        max = 60;
        value = Math.floor(Math.random() * 30) + (severity === 'high' ? 65 : severity === 'medium' ? 60 : 20);
        break;
      case 'Vibration':
        min = 0.1;
        max = 0.5;
        value = parseFloat((Math.random() * 1.5 + (severity === 'high' ? 0.8 : severity === 'medium' ? 0.6 : 0.1)).toFixed(2));
        break;
      case 'Current':
        min = 5;
        max = 20;
        value = Math.floor(Math.random() * 20) + (severity === 'high' ? 25 : severity === 'medium' ? 22 : 5);
        break;
      case 'Voltage':
        min = 400;
        max = 420;
        value = Math.floor(Math.random() * 30) + (severity === 'high' ? 430 : severity === 'medium' ? 425 : 400);
        break;
      case 'Pressure':
        min = 1.5;
        max = 2.5;
        value = parseFloat((Math.random() * 2 + (severity === 'high' ? 3.5 : severity === 'medium' ? 3 : 1.5)).toFixed(2));
        break;
      default:
        min = 0;
        max = 100;
        value = Math.floor(Math.random() * 100);
    }

    anomalies.push({
      id: `ANOM-${1000 + i}`,
      timestamp: timestamp.toISOString(),
      machineId: machine.id,
      machineName: machine.name,
      sensorType,
      value,
      expectedRange: { min, max },
      severity,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Abnormal ${sensorType.toLowerCase()} reading detected`,
      suggestedAction: severity === 'high' ? 'Immediate maintenance required' : 
                      severity === 'medium' ? 'Schedule maintenance soon' : 'Monitor closely',
    });
  }

  return anomalies;
};

// Mock historical data for charts
const generateHistoricalData = (days: number = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    data.push({
      date: format(date, 'MMM dd'),
      anomalies: Math.floor(Math.random() * 10) + (i % 3 === 0 ? 5 : 0),
      high: Math.floor(Math.random() * 5) + (i % 4 === 0 ? 3 : 0),
      medium: Math.floor(Math.random() * 5) + (i % 5 === 0 ? 2 : 0),
      low: Math.floor(Math.random() * 5) + (i % 6 === 0 ? 1 : 0),
    });
  }
  
  return data;
};

const AnomalyDetection: React.FC = () => {
  const theme = useTheme();
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [orderBy, setOrderBy] = useState<keyof Anomaly>('timestamp');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState({
    search: '',
    severity: 'all' as 'all' | Severity,
    status: 'all' as 'all' | Anomaly['status'],
    sensorType: 'all',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  // Load mock data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = generateMockAnomalies(50);
        setAnomalies(mockData);
      } catch (error) {
        console.error('Error loading anomalies:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load anomalies',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle sort
  const handleRequestSort = (property: keyof Anomaly) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Handle filter change
  const handleFilterChange = (field: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0); // Reset to first page when filters change
  };

  // Handle status update
  const handleUpdateStatus = (id: string, newStatus: Anomaly['status']) => {
    setAnomalies(prev =>
      prev.map(anomaly =>
        anomaly.id === id ? { ...anomaly, status: newStatus } : anomaly
      )
    );
    
    setSnackbar({
      open: true,
      message: `Anomaly ${newStatus} successfully`,
      severity: 'success',
    });
  };

  // Apply filters and sorting
  const filteredAnomalies = React.useMemo(() => {
    let result = [...anomalies];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        anomaly =>
          anomaly.machineId.toLowerCase().includes(searchLower) ||
          anomaly.machineName.toLowerCase().includes(searchLower) ||
          anomaly.sensorType.toLowerCase().includes(searchLower) ||
          anomaly.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.severity !== 'all') {
      result = result.filter(anomaly => anomaly.severity === filters.severity);
    }

    if (filters.status !== 'all') {
      result = result.filter(anomaly => anomaly.status === filters.status);
    }

    if (filters.sensorType !== 'all') {
      result = result.filter(anomaly => anomaly.sensorType === filters.sensorType);
    }

    if (filters.startDate) {
      result = result.filter(
        anomaly => new Date(anomaly.timestamp) >= filters.startDate!
      );
    }

    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(anomaly => new Date(anomaly.timestamp) <= endOfDay);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      const aValue = a[orderBy];
      const bValue = b[orderBy];

      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [anomalies, filters, orderBy, order]);

  // Pagination
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get severity color
  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Get status color
  const getStatusColor = (status: Anomaly['status']) => {
    switch (status) {
      case 'resolved':
        return theme.palette.success.main;
      case 'acknowledged':
        return theme.palette.info.main;
      case 'new':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const historicalData = generateHistoricalData(7);
  const sensorTypes = Array.from(new Set(anomalies.map(a => a.sensorType)));
  const paginatedAnomalies = filteredAnomalies.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Anomaly Detection
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Anomalies
              </Typography>
              <Typography variant="h4">{anomalies.length}</Typography>
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Last 7 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                High Severity
              </Typography>
              <Typography variant="h4" color="error">
                {anomalies.filter(a => a.severity === 'high').length}
              </Typography>
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Requires immediate attention
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                New Anomalies
              </Typography>
              <Typography variant="h4" color="warning">
                {anomalies.filter(a => a.status === 'new').length}
              </Typography>
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Not yet reviewed
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h4" color="success">
                {anomalies.filter(a => a.status === 'resolved').length}
              </Typography>
              <Box mt={1}>
                <Typography variant="caption" color="textSecondary">
                  Successfully resolved
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Anomaly Trends
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="anomalies"
                  name="Total Anomalies"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="high"
                  name="High Severity"
                  stroke={theme.palette.error.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Anomaly Distribution
            </Typography>
            <Box height={300} display="flex" flexDirection="column" justifyContent="center">
              <Box mb={2}>
                <Typography variant="subtitle2" gutterBottom>
                  By Severity
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box width={100}>
                    <Typography variant="body2">High</Typography>
                  </Box>
                  <Box flexGrow={1} mr={2}>
                    <LinearProgress
                      variant="determinate"
                      value={(anomalies.filter(a => a.severity === 'high').length / anomalies.length) * 100 || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.error.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((anomalies.filter(a => a.severity === 'high').length / anomalies.length) * 100) || 0}%
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" mb={1}>
                  <Box width={100}>
                    <Typography variant="body2">Medium</Typography>
                  </Box>
                  <Box flexGrow={1} mr={2}>
                    <LinearProgress
                      variant="determinate"
                      value={(anomalies.filter(a => a.severity === 'medium').length / anomalies.length) * 100 || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.warning.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((anomalies.filter(a => a.severity === 'medium').length / anomalies.length) * 100) || 0}%
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <Box width={100}>
                    <Typography variant="body2">Low</Typography>
                  </Box>
                  <Box flexGrow={1} mr={2}>
                    <LinearProgress
                      variant="determinate"
                      value={(anomalies.filter(a => a.severity === 'low').length / anomalies.length) * 100 || 0}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.info.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {Math.round((anomalies.filter(a => a.severity === 'low').length / anomalies.length) * 100) || 0}%
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  By Status
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Chip
                    label={`New (${anomalies.filter(a => a.status === 'new').length})`}
                    color="warning"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Acknowledged (${anomalies.filter(a => a.status === 'acknowledged').length})`}
                    color="info"
                    variant="outlined"
                    size="small"
                  />
                  <Chip
                    label={`Resolved (${anomalies.filter(a => a.status === 'resolved').length})`}
                    color="success"
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search anomalies..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity}
                onChange={(e) => handleFilterChange('severity', e.target.value)}
                label="Severity"
              >
                <MenuItem value="all">All Severities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="acknowledged">Acknowledged</MenuItem>
                <MenuItem value="resolved">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Sensor Type</InputLabel>
              <Select
                value={filters.sensorType}
                onChange={(e) => handleFilterChange('sensorType', e.target.value)}
                label="Sensor Type"
              >
                <MenuItem value="all">All Types</MenuItem>
                {sensorTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(date) => handleFilterChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(date) => handleFilterChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
                minDate={filters.startDate || undefined}
              />
            </LocalizationProvider>
          </Grid>
        </Grid>
      </Paper>

      {/* Anomalies Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        {loading ? (
          <Box p={3}>
            <LinearProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'timestamp'}
                        direction={orderBy === 'timestamp' ? order : 'desc'}
                        onClick={() => handleRequestSort('timestamp')}
                      >
                        Timestamp
                        {orderBy === 'timestamp' && (
                          <span className="visuallyHidden">
                            {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                          </span>
                        )}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Machine</TableCell>
                    <TableCell>Sensor</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Severity</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedAnomalies.length > 0 ? (
                    paginatedAnomalies.map((anomaly) => (
                      <TableRow hover key={anomaly.id}>
                        <TableCell>
                          {new Date(anomaly.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {anomaly.machineName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {anomaly.machineId}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{anomaly.sensorType}</TableCell>
                        <TableCell align="right">
                          <Box display="flex" alignItems="center" justifyContent="flex-end">
                            <Typography
                              variant="body2"
                              color={
                                anomaly.value > anomaly.expectedRange.max * 1.2 ||
                                anomaly.value < anomaly.expectedRange.min * 0.8
                                  ? 'error'
                                  : 'inherit'
                              }
                              fontWeight="medium"
                            >
                              {anomaly.value}
                              {anomaly.sensorType === 'Temperature' ? '°C' : 
                               anomaly.sensorType === 'Voltage' ? 'V' :
                               anomaly.sensorType === 'Current' ? 'A' :
                               anomaly.sensorType === 'Vibration' ? ' mm/s²' :
                               anomaly.sensorType === 'Pressure' ? ' bar' : ''}
                            </Typography>
                            <Tooltip 
                              title={
                                <>
                                  <div>Expected: {anomaly.expectedRange.min} - {anomaly.expectedRange.max}</div>
                                  <div>Deviation: {(
                                    Math.abs(anomaly.value - (anomaly.expectedRange.min + anomaly.expectedRange.max) / 2) / 
                                    ((anomaly.expectedRange.min + anomaly.expectedRange.max) / 2) * 100
                                  ).toFixed(1)}%</div>
                                </>
                              }
                              arrow
                            >
                              <InfoIcon fontSize="small" color="action" sx={{ ml: 0.5 }} />
                            </Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={anomaly.severity.charAt(0).toUpperCase() + anomaly.severity.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: `${getSeverityColor(anomaly.severity)}20`,
                              color: getSeverityColor(anomaly.severity),
                              fontWeight: 'medium',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={anomaly.status.charAt(0).toUpperCase() + anomaly.status.slice(1)}
                            size="small"
                            variant="outlined"
                            sx={{
                              borderColor: getStatusColor(anomaly.status),
                              color: getStatusColor(anomaly.status),
                              fontWeight: 'medium',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2">{anomaly.description}</Typography>
                            <Typography variant="caption" color="textSecondary">
                              {anomaly.suggestedAction}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {anomaly.status !== 'acknowledged' && (
                            <Tooltip title="Acknowledge">
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(anomaly.id, 'acknowledged')}
                                color="info"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {anomaly.status !== 'resolved' && (
                            <Tooltip title="Mark as Resolved">
                              <IconButton
                                size="small"
                                onClick={() => handleUpdateStatus(anomaly.id, 'resolved')}
                                color="success"
                              >
                                <CheckCircleIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton size="small" color="primary">
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                        <Typography variant="body1" color="textSecondary">
                          No anomalies found matching your criteria
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredAnomalies.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnomalyDetection;
