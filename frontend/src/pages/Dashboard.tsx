import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
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
import {
  Assessment as ReportIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Mock data - replace with real data from your API
const kpiData = [
  { title: 'Machines Monitored', value: '24', icon: <ReportIcon fontSize="large" />, color: '#4B0082' },
  { title: 'At-Risk Machines', value: '3', icon: <WarningIcon fontSize="large" />, color: '#FF6B6B' },
  { title: 'Avg. RUL (Hours)', value: '48.5', icon: <ScheduleIcon fontSize="large" />, color: '#4ECDC4' },
  { title: 'Estimated Cost Saved', value: '$12,450', icon: <MoneyIcon fontSize="large" />, color: '#45B7D1' },
];

const machineHealthData = [
  { name: 'Healthy', value: 18 },
  { name: 'Warning', value: 3 },
  { name: 'Critical', value: 2 },
  { name: 'Maintenance', value: 1 },
];

const failureProbabilityData = [
  { name: 'Jan', probability: 0.15 },
  { name: 'Feb', probability: 0.22 },
  { name: 'Mar', probability: 0.18 },
  { name: 'Apr', probability: 0.25 },
  { name: 'May', probability: 0.3 },
  { name: 'Jun', probability: 0.35 },
];

const COLORS = ['#4CAF50', '#FFC107', '#F44336', '#2196F3'];

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      height: '100%',
      borderRadius: 2,
      transition: 'transform 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-5px)',
      },
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: `${color}20`,
        color: color,
        mb: 2,
      }}
    >
      {icon}
    </Box>
    <Typography variant="h5" component="div" fontWeight="bold">
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {title}
    </Typography>
  </Paper>
);

const Dashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard Overview
      </Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiData.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <KPICard
              title={kpi.title}
              value={kpi.value}
              icon={kpi.icon}
              color={kpi.color}
            />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Machine Health Distribution
            </Typography>
            <Box sx={{ flex: 1, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={machineHealthData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  >
                    {machineHealthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} machines`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              Failure Probability Trend
            </Typography>
            <Box sx={{ flex: 1, mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={failureProbabilityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => [`${(value * 100).toFixed(0)}%`, 'Failure Probability']} />
                  <Legend />
                  <Bar dataKey="probability" name="Failure Probability" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Alerts Section */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Alerts
        </Typography>
        <Box>
          {[
            { id: 1, machine: 'CNC-001', issue: 'High vibration detected', time: '2 hours ago', severity: 'high' },
            { id: 2, machine: 'CNC-015', issue: 'Temperature above threshold', time: '5 hours ago', severity: 'medium' },
            { id: 3, machine: 'CNC-008', issue: 'Irregular tool wear pattern', time: '1 day ago', severity: 'high' },
          ].map((alert) => (
            <Box
              key={alert.id}
              sx={{
                p: 2,
                mb: 1,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor:
                  alert.severity === 'high' ? '#FFEBEE' : alert.severity === 'medium' ? '#FFF8E1' : '#E8F5E9',
                borderLeft: `4px solid ${
                  alert.severity === 'high' ? '#F44336' : alert.severity === 'medium' ? '#FFC107' : '#4CAF50'
                }`,
              }}
            >
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">
                  <strong>{alert.machine}</strong>: {alert.issue}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {alert.time}
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    color: 'white',
                    bgcolor:
                      alert.severity === 'high' ? '#F44336' : alert.severity === 'medium' ? '#FFC107' : '#4CAF50',
                  }}
                >
                  {alert.severity.toUpperCase()}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default Dashboard;
