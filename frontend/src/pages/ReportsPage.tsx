import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import { Download, PictureAsPdf, GridOn } from '@mui/icons-material';

// Mock data for reports
const machineHealthData = [
  { id: 1, machine: 'CNC-001', status: 'Healthy', lastMaintenance: '2023-10-10', nextMaintenance: '2023-11-10' },
  { id: 2, machine: 'CNC-002', status: 'Warning', lastMaintenance: '2023-10-05', nextMaintenance: '2023-10-25' },
  { id: 3, machine: 'CNC-003', status: 'Critical', lastMaintenance: '2023-09-20', nextMaintenance: '2023-10-20' },
];

const anomalyData = [
  { id: 1, date: '2023-10-17', machine: 'CNC-001', type: 'Vibration Spike', severity: 'High' },
  { id: 2, date: '2023-10-16', machine: 'CNC-002', type: 'Temperature Rise', severity: 'Medium' },
  { id: 3, date: '2023-10-15', machine: 'CNC-003', type: 'Current Fluctuation', severity: 'Low' },
];

const maintenanceData = [
  { id: 1, date: '2023-10-15', machine: 'CNC-003', type: 'Lubrication', status: 'Completed' },
  { id: 2, date: '2023-10-10', machine: 'CNC-001', type: 'Tool Replacement', status: 'Completed' },
  { id: 3, date: '2023-10-05', machine: 'CNC-002', type: 'Calibration', status: 'Completed' },
];

const ReportsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExport = (type: 'pdf' | 'excel') => {
    // In a real app, this would trigger a download of the report
    alert(`Exporting ${type.toUpperCase()} report...`);
  };

  const renderReportCard = (title: string, value: string | number, description: string) => (
    <Card>
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div">
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid component="div" sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
          {renderReportCard('Total Machines', '24', '3 require attention')}
        </Grid>
        <Grid component="div" sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
          {renderReportCard('Uptime (30d)', '98.7%', '+0.5% from last month')}
        </Grid>
        <Grid component="div" sx={{ width: { xs: '100%', md: '33.33%' }, p: 1.5 }}>
          {renderReportCard('Maintenance Cost', '$2,450', '15% lower than last quarter')}
        </Grid>
      </Grid>

      <Paper sx={{ width: '100%', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Machine Health" />
          <Tab label="Anomaly Reports" />
          <Tab label="Maintenance History" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<PictureAsPdf />} 
              onClick={() => handleExport('pdf')}
              sx={{ mr: 1 }}
            >
              Export PDF
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<GridOn />}
              onClick={() => handleExport('excel')}
            >
              Export Excel
            </Button>
          </Box>

          {tabValue === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Machine</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Last Maintenance</TableCell>
                    <TableCell>Next Maintenance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {machineHealthData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.machine}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            color: 'white',
                            bgcolor: 
                              row.status === 'Healthy' ? 'success.main' :
                              row.status === 'Warning' ? 'warning.main' : 'error.main',
                            px: 1,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                      <TableCell>{row.lastMaintenance}</TableCell>
                      <TableCell>{row.nextMaintenance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Machine</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Severity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {anomalyData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.machine}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            color: 'white',
                            bgcolor: 
                              row.severity === 'High' ? 'error.main' :
                              row.severity === 'Medium' ? 'warning.main' : 'info.main',
                            px: 1,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {row.severity}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tabValue === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Machine</TableCell>
                    <TableCell>Maintenance Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {maintenanceData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.machine}</TableCell>
                      <TableCell>{row.type}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            color: 'white',
                            bgcolor: 'success.main',
                            px: 1,
                            borderRadius: 1,
                            display: 'inline-block'
                          }}
                        >
                          {row.status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ReportsPage;
