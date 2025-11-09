import React from 'react';
import { Box, Paper, Typography, styled } from '@mui/material';
import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';
import {
  Assessment as ReportIcon,
  Warning as AlertIcon,
  CheckCircle as HealthyIcon,
  Build as MaintenanceIcon,
} from '@mui/icons-material';
import KPICard from '../components/dashboard/KPICard';
import MachineHealthChart from '../components/dashboard/MachineHealthChart';
import AlertsTable from '../components/dashboard/AlertsTable';
// import { useAppSelector } from '../store/hooks';

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

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  height: '100%',
  borderRadius: 12,
  boxShadow: theme.shadows[3],
}));

const DashboardPage: React.FC = () => {
  // Mock data - in a real app, this would come from Redux store
  const kpiData = {
    machinesMonitored: 12,
    atRiskMachines: 3,
    avgRUL: 45.5,
    downtimeCostSaved: 12500,
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Machines Monitored"
            value={kpiData.machinesMonitored}
            icon={<ReportIcon color="primary" />}
            trend="+2 this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="At-Risk Machines"
            value={kpiData.atRiskMachines}
            icon={<AlertIcon color="warning" />}
            trend="-1 this week"
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Avg. RUL (Hours)"
            value={kpiData.avgRUL}
            icon={<HealthyIcon color="success" />}
            trend="Stable"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            title="Cost Saved"
            value={`$${kpiData.downtimeCostSaved.toLocaleString()}`}
            icon={<MaintenanceIcon color="info" />}
            trend="+$2,500 this month"
            color="info"
          />
        </Grid>
      </Grid>

      {/* Charts and Alerts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Machine Health Overview
            </Typography>
            <MachineHealthChart />
          </Item>
        </Grid>
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Recent Alerts
            </Typography>
            <AlertsTable />
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
