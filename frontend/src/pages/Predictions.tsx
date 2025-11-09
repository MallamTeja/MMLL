import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
  timelineOppositeContentClasses
} from '../components/common/Timeline';
import {
  GpsFixed as GpsFixedIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '@mui/material/styles';

// Mock data - replace with real data from your API
const mockPredictions = [
  {
    id: 1,
    machineId: 'CNC-001',
    machineName: 'CNC Milling #1',
    predictionDate: '2023-06-15T10:30:00',
    rulHours: 48.5,
    confidence: 0.92,
    status: 'good',
    features: {
      temperature: 42,
      vibration: 0.25,
      pressure: 2.1,
      current: 15.7,
      voltage: 415,
    },
    historicalData: [
      { date: '2023-05-01', rul: 120 },
      { date: '2023-05-15', rul: 100 },
      { date: '2023-06-01', rul: 75 },
      { date: '2023-06-15', rul: 48.5 },
    ],
  },
  {
    id: 2,
    machineId: 'CNC-002',
    machineName: 'CNC Lathe #2',
    predictionDate: '2023-06-15T11:15:00',
    rulHours: 12.2,
    confidence: 0.85,
    status: 'warning',
    features: {
      temperature: 58,
      vibration: 0.42,
      pressure: 2.8,
      current: 18.3,
      voltage: 412,
    },
    historicalData: [
      { date: '2023-05-01', rul: 200 },
      { date: '2023-05-15', rul: 150 },
      { date: '2023-06-01', rul: 75 },
      { date: '2023-06-15', rul: 12.2 },
    ],
  },
  {
    id: 3,
    machineId: 'CNC-003',
    machineName: 'CNC Router #1',
    predictionDate: '2023-06-15T09:45:00',
    rulHours: 6.5,
    confidence: 0.78,
    status: 'critical',
    features: {
      temperature: 65,
      vibration: 0.78,
      pressure: 3.2,
      current: 21.5,
      voltage: 408,
    },
    historicalData: [
      { date: '2023-05-01', rul: 180 },
      { date: '2023-05-15', rul: 120 },
      { date: '2023-06-01', rul: 45 },
      { date: '2023-06-15', rul: 6.5 },
    ],
  },
];

const RULGauge = ({ value, size = 200 }: { value: number; size?: number }) => {
  const theme = useTheme();
  
  return (
    <Gauge
      width={size}
      height={size}
      value={value}
      minValue={0}
      maxValue={200}
      startAngle={-110}
      endAngle={110}
      text={(params: any) => `${params.value} / ${params.maxValue ?? 200} hours`}
      sx={{
        [`& .${gaugeClasses.valueText}`]: {
          fontSize: 20,
          transform: 'translate(0px, 0px)',
        },
      }}
      {...(value < 50 ? {
        colors: ['#FF5252'],
      } : value < 100 ? {
        colors: ['#FFB74D'],
      } : {
        colors: ['#4CAF50'],
      })}
    />
  );
};

const FeatureChip = ({ label, value, unit = '' }: { label: string; value: number | string; unit?: string }) => {
  const theme = useTheme();
  
  const getColor = () => {
    if (typeof value === 'number') {
      if (label.toLowerCase().includes('temp') && value > 60) return 'error';
      if (label.toLowerCase().includes('vibration') && value > 0.5) return 'error';
      if (label.toLowerCase().includes('current') && value > 20) return 'error';
      if (label.toLowerCase().includes('voltage') && (value < 400 || value > 420)) return 'error';
    }
    return 'default';
  };

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 1, fontWeight: 'medium' }}>
          {value} {unit}
        </Typography>
        {getColor() === 'error' && (
          <Tooltip title="Value outside normal range">
            <WarningIcon color="error" fontSize="small" />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

const Predictions: React.FC = () => {
  const theme = useTheme();
  const [selectedMachine, setSelectedMachine] = useState<string>(mockPredictions[0].machineId);
  const [isLoading, setIsLoading] = useState(false);

  const handleMachineChange = (event: SelectChangeEvent) => {
    setSelectedMachine(event.target.value);
  };

  const selectedPrediction = mockPredictions.find(pred => pred.machineId === selectedMachine) || mockPredictions[0];

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    // TODO: Implement Excel export
    console.log('Exporting to Excel...');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Tool Wear Predictions
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPDF}
            sx={{ mr: 1 }}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportExcel}
            sx={{ mr: 1 }}
          >
            Excel
          </Button>
          <Tooltip title="Refresh predictions">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid component="div" sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="machine-select-label">Select Machine</InputLabel>
              <Select
                labelId="machine-select-label"
                value={selectedMachine}
                label="Select Machine"
                onChange={handleMachineChange}
              >
                {mockPredictions.map((pred) => (
                  <MenuItem key={pred.machineId} value={pred.machineId}>
                    {pred.machineName} ({pred.machineId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <RULGauge value={selectedPrediction.rulHours} />
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Prediction Confidence
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={selectedPrediction.confidence * 100} 
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: 
                            selectedPrediction.confidence > 0.8 ? theme.palette.success.main :
                            selectedPrediction.confidence > 0.6 ? theme.palette.warning.main :
                            theme.palette.error.main,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(selectedPrediction.confidence * 100)}%
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={
                  selectedPrediction.status === 'good' ? 'Good Condition' :
                  selectedPrediction.status === 'warning' ? 'Attention Needed' : 'Immediate Action Required'
                }
                color={
                  selectedPrediction.status === 'good' ? 'success' :
                  selectedPrediction.status === 'warning' ? 'warning' : 'error'
                }
                variant="outlined"
                sx={{ mt: 1, fontWeight: 'medium' }}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Key Features
              </Typography>
              <Grid container spacing={2}>
                <Grid component="div" sx={{ width: '50%', p: 0.5 }}>
                  <FeatureChip label="Temperature" value={selectedPrediction.features.temperature} unit="°C" />
                  <FeatureChip label="Vibration" value={selectedPrediction.features.vibration} unit="mm/s²" />
                </Grid>
                <Grid component="div" sx={{ width: '50%', p: 0.5 }}>
                  <FeatureChip label="Current" value={selectedPrediction.features.current} unit="A" />
                  <FeatureChip label="Voltage" value={selectedPrediction.features.voltage} unit="V" />
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid component="div" sx={{ width: { xs: '100%', md: '66.66%' }, p: 1.5 }}>
          <Paper sx={{ p: 3, height: '100%', borderRadius: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Remaining Useful Life (RUL) Trend
            </Typography>
            <Box sx={{ height: 300, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={selectedPrediction.historicalData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis label={{ value: 'RUL (hours)', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip 
                    labelFormatter={(value: any) => `Date: ${new Date(value).toLocaleDateString()}`}
                    formatter={(value: any) => [`${value} hours`, 'Remaining Useful Life']}
                  />
                  <Line
                    type="monotone"
                    dataKey="rul"
                    name="Remaining Useful Life"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2}
                    dot={true}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Prediction Timeline
            </Typography>
            <Timeline
              sx={{
                [`& .${timelineOppositeContentClasses.root}`]: {
                  flex: 0.2,
                },
              }}
            >
              <TimelineItem>
                <TimelineOppositeContent sx={{ color: 'text.secondary' }}>
                  {new Date(selectedPrediction.predictionDate).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="primary" />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle1" component="span">
                    Prediction Made
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    RUL: {selectedPrediction.rulHours.toFixed(1)} hours
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineOppositeContent sx={{ color: 'text.secondary' }}>
                  {new Date(new Date(selectedPrediction.predictionDate).getTime() + selectedPrediction.rulHours * 60 * 60 * 1000).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={selectedPrediction.status === 'critical' ? 'error' : 'warning'} />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle1" component="span">
                    Predicted Failure
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Estimated time until maintenance required
                  </Typography>
                </TimelineContent>
              </TimelineItem>
              
              <TimelineItem>
                <TimelineOppositeContent sx={{ color: 'text.secondary' }}>
                  {new Date(new Date(selectedPrediction.predictionDate).getTime() + (selectedPrediction.rulHours - 24) * 60 * 60 * 1000).toLocaleString()}
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color="success" />
                </TimelineSeparator>
                <TimelineContent>
                  <Typography variant="subtitle1" component="span">
                    Recommended Maintenance Window
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Schedule maintenance before this date to avoid downtime
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            </Timeline>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Predictions;
