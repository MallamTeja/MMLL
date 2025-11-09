import React, { useState } from 'react';
import { Box, Typography, Card, CardContent, Tabs, Tab, Paper } from '@mui/material';
import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import {
  Speed as SpeedIcon,
  Thermostat as TemperatureIcon,
  Vibration as VibrationIcon,
  ElectricBolt as CurrentIcon,
  BatteryChargingFull as VoltageIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import MachineStatusCard from '../components/monitoring/MachineStatusCard';
import SensorGauge from '../components/monitoring/SensorGauge';
import MachineList from '../components/monitoring/MachineList';
import { useAppSelector } from '../store/hooks';

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

interface Machine {
  id: string;
  name: string;
  status: 'operational' | 'warning' | 'error';
  lastUpdated: string;
  metrics: {
    temperature: number;
    vibration: number;
    pressure: number;
  };
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
  height: '100%',
  borderRadius: 12,
  boxShadow: theme.shadows[3],
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`machine-tabpanel-${index}`}
      aria-labelledby={`machine-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `machine-tab-${index}`,
    'aria-controls': `machine-tabpanel-${index}`,
  };
}

const MachineMonitoringPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const [selectedMachine, setSelectedMachine] = useState<string>('CNC-001');

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  // Mock data - in a real app, this would come from Redux store
  const machineData = {
    status: 'operational',
    temperature: 68.5,
    vibration: 2.3,
    current: 4.5,
    voltage: 220,
    rpm: 3450,
  };

  const [machines, setMachines] = useState<Machine[]>([
    { 
      id: '1', 
      name: 'Machine 1', 
      status: 'operational',
      lastUpdated: new Date().toISOString(),
      metrics: { temperature: 75, vibration: 2.5, pressure: 100 }
    },
    { 
      id: '2', 
      name: 'Machine 2', 
      status: 'warning',
      lastUpdated: new Date().toISOString(),
      metrics: { temperature: 85, vibration: 3.2, pressure: 110 }
    },
    { 
      id: '3', 
      name: 'Machine 3', 
      status: 'error',
      lastUpdated: new Date().toISOString(),
      metrics: { temperature: 95, vibration: 4.1, pressure: 120 }
    },
  ]);

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Machine Monitoring
      </Typography>
      
      <Grid container spacing={3}>
        {/* Machine List */}
        <Grid item xs={12} md={4}>
          <Item>
            <Typography variant="h6" gutterBottom>
              Machines
            </Typography>
            <MachineList 
              machines={machines}
              selectedMachine={selectedMachine}
              onSelectMachine={setSelectedMachine}
            />
          </Item>
        </Grid>
        
        {/* Machine Details */}
        <Grid item xs={12} md={8}>
          <Item>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="machine monitoring tabs"
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab label="Overview" {...a11yProps(0)} />
                <Tab label="Sensors" {...a11yProps(1)} />
                <Tab label="Maintenance" {...a11yProps(2)} />
              </Tabs>
            </Box>
            
            <TabPanel value={value} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <MachineStatusCard 
                    title="Machine Status"
                    status={machineData.status}
                    lastUpdated="2 minutes ago"
                    uptime="98.5%"
                    efficiency={92.3}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <MachineStatusCard 
                    title="Tool Status"
                    status="Good"
                    lastUpdated="5 minutes ago"
                    toolLifeRemaining={65}
                    toolChanges={3}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={value} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <SensorGauge 
                    label="Temperature"
                    value={machineData.temperature}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <SensorGauge 
                    label="Vibration"
                    value={machineData.vibration}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <SensorGauge 
                    label="Current"
                    value={machineData.current}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <SensorGauge 
                    label="Voltage"
                    value={machineData.voltage}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <SensorGauge 
                    label="RPM"
                    value={machineData.rpm}
                  />
                </Grid>
              </Grid>
            </TabPanel>
            
            <TabPanel value={value} index={2}>
              <Typography>Maintenance information will be displayed here.</Typography>
            </TabPanel>
          </Item>
        </Grid>
      </Grid>
    </Box>
  );
};

export default MachineMonitoringPage;
