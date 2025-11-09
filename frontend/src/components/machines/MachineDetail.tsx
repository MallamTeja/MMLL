import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography,
  Paper, 
  Tabs, 
  Tab, 
  Divider, 
  Chip, 
  IconButton,
  Tooltip,
  LinearProgress,
  Grid
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import useApi from '../../hooks/useApi';
import { Machine, SensorData } from '../../types';
import { Alert } from '../../types/alert';
import SensorChart from '../charts/SensorChart';
import MaintenanceHistory from '../maintenance/MaintenanceHistory';
import AlertsList from '../alerts/AlertsList';
import { formatDate } from '../../utils/dateUtils';
import { API_BASE_URL } from '../../config';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  '& svg': {
    marginRight: theme.spacing(1),
  },
}));

const MachineDetail: React.FC = () => {
  const { machineId } = useParams<{ machineId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [machine, setMachine] = useState<Machine & { metadata?: { description?: string } } | null>(null);
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { fetchData } = useApi();

  const fetchMachineData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch machine details
      const machineResponse = await fetchData<Machine>(`/api/machines/${machineId}`);
      if (machineResponse?.data) setMachine(machineResponse.data);
      
      // Fetch recent sensor data
      const sensorResponse = await fetchData<SensorData[]>(
        `/api/sensor-data/?machine_id=${machineId}&limit=1000`
      );
      if (sensorResponse?.data) setSensorData(sensorResponse.data);
      
      // Fetch recent alerts
      const alertsResponse = await fetchData<Alert[]>(`/api/alerts/?machine_id=${machineId}&limit=5`);
      if (alertsResponse?.data) setAlerts(alertsResponse.data);
      
    } catch (err) {
      console.error('Error fetching machine data:', err);
      setError('Failed to load machine data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (machineId) {
      fetchMachineData();
    }
  }, [machineId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleRefresh = () => {
    fetchMachineData();
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <ErrorIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  if (loading && !machine) {
    return (
      <Box p={3}>
        <LinearProgress />
        <Typography>Loading machine data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <MuiAlert severity="error">{error}</MuiAlert>
      </Box>
    );
  }

  if (!machine) {
    return (
      <Box p={3}>
        <MuiAlert severity="warning">Machine not found</MuiAlert>
      </Box>
    );
  }

  // Group sensor data by type
  const sensorDataByType = sensorData.reduce<Record<string, SensorData[]>>((acc, data) => {
    const sensorType = data.sensor_type || 'unknown';
    if (!acc[sensorType]) {
      acc[sensorType] = [];
    }
    acc[sensorType].push(data);
    return acc;
  }, {});

  return (
    <Box p={3}>
      <Box mb={3} display="flex" alignItems="center">
        <Tooltip title="Back to machines">
          <IconButton onClick={() => navigate('/machines')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
        </Tooltip>
        <Typography variant="h4" component="h1">
          {machine.name}
        </Typography>
        <Box ml="auto" display="flex" alignItems="center">
          <Chip
            label={machine.status}
            color={
              machine.status.toLowerCase() === 'operational' ? 'success' :
              machine.status.toLowerCase() === 'warning' ? 'warning' : 'error'
            }
            variant="outlined"
            icon={getStatusIcon(machine.status)}
            sx={{ mr: 2 }}
          />
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Sensors" />
        <Tab label="Maintenance" />
        <Tab label="Alerts" />
        <Tab label="Details" />
      </Tabs>

      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid sx={{ width: { xs: '100%', md: '33.33%' }, px: 2 }}>
            <StyledPaper>
              <SectionTitle variant="h6">
                <InfoIcon /> Machine Information
              </SectionTitle>
              <Grid container spacing={2}>
                <Grid sx={{ width: { xs: '50%' }, px: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Manufacturer
                  </Typography>
                  <Typography>{machine.manufacturer || 'N/A'}</Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' }, px: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Model
                  </Typography>
                  <Typography>{machine.model || 'N/A'}</Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' }, px: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Serial Number
                  </Typography>
                  <Typography>{machine.serial_number || 'N/A'}</Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' }, px: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Location
                  </Typography>
                  <Typography>{machine.location || 'N/A'}</Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' }, px: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Installation Date
                  </Typography>
                  <Typography>
                    {machine.installation_date 
                      ? formatDate(machine.installation_date) 
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid sx={{ width: { xs: '50%' }, px: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Operating Hours
                  </Typography>
                  <Typography>
                    {machine.operating_hours?.toLocaleString() || '0'} hours
                  </Typography>
                </Grid>
              </Grid>
            </StyledPaper>

            <StyledPaper>
              <SectionTitle variant="h6">
                <WarningIcon /> Alerts
              </SectionTitle>
              <AlertsList 
                alerts={alerts.slice(0, 5)} 
              />
            </StyledPaper>
          </Grid>

          <Grid sx={{ width: { xs: '100%', md: '66.66%' }, px: 2 }}>
            <StyledPaper>
              <SectionTitle variant="h6">
                <InfoIcon /> Sensor Overview
              </SectionTitle>
              <Grid container spacing={2}>
                {Object.entries(sensorDataByType).map(([sensorType, data]) => {
                  const latest = [...data].sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                  )[0];
                  
                  return (
                    <Grid sx={{ width: { xs: '100%', sm: '50%' }, px: 1, mb: 2 }} key={sensorType}>
                      <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {sensorType}
                        </Typography>
                        <Box display="flex" alignItems="baseline" mt={1} mb={1}>
                          <Typography variant="h5" component="div">
                            {latest?.values ? Number(latest.values[0]).toFixed(2) : 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary" ml={1}>
                            {data[0]?.unit || ''}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          Last updated: {latest ? formatDate(latest.timestamp) : 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </StyledPaper>

            <StyledPaper>
              <SectionTitle variant="h6">
                <InfoIcon /> Recent Maintenance
              </SectionTitle>
              <MaintenanceHistory 
                machineId={machine.id}
                records={[]}
              />
            </StyledPaper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <StyledPaper>
          <SectionTitle variant="h6">
            <InfoIcon /> Sensor Data
          </SectionTitle>
          <Grid container spacing={3}>
            {Object.entries(sensorDataByType).map(([sensorType, data]) => (
              <Grid sx={{ width: '100%', mb: 3 }} key={sensorType}>
                <SensorChart 
                  title={`${sensorType} (${data[0]?.unit || ''})`}
                  data={data}
                  xField="timestamp"
                  yField="value"
                  height={300}
                />
              </Grid>
            ))}
          </Grid>
        </StyledPaper>
      )}

      {activeTab === 2 && (
        <StyledPaper>
          <SectionTitle variant="h6">
            <InfoIcon /> Maintenance History
          </SectionTitle>
          <MaintenanceHistory 
            machineId={machine.id}
            records={[]} // Provide empty array as default for now
          />
        </StyledPaper>
      )}

      {activeTab === 3 && (
        <StyledPaper>
          <SectionTitle variant="h6">
            <WarningIcon /> Alerts
          </SectionTitle>
          <AlertsList 
            alerts={alerts}
          />
        </StyledPaper>
      )}

      {activeTab === 4 && (
        <StyledPaper>
          <SectionTitle variant="h6">
            <InfoIcon /> Detailed Information
          </SectionTitle>
          <Typography paragraph>
            {machine.metadata?.description || 'No additional information available.'}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary">
            Last Updated: {machine.lastUpdated ? formatDate(machine.lastUpdated) : 'N/A'}
          </Typography>
        </StyledPaper>
      )}
    </Box>
  );
};

export default MachineDetail;
