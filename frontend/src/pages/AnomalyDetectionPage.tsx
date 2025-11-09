import React from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

const AnomalyDetectionPage: React.FC = () => {
  // Mock data - replace with real data from your API
  const anomalies = [
    { id: 1, timestamp: '2023-10-17 14:30:22', machine: 'CNC-001', type: 'Vibration Spike', severity: 'High' },
    { id: 2, timestamp: '2023-10-17 13:45:10', machine: 'CNC-002', type: 'Temperature Rise', severity: 'Medium' },
    { id: 3, timestamp: '2023-10-17 12:15:45', machine: 'CNC-003', type: 'Current Fluctuation', severity: 'Low' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Anomaly Detection
      </Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recent Anomalies
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Timestamp</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anomalies.map((anomaly) => (
                <TableRow key={anomaly.id}>
                  <TableCell>{anomaly.timestamp}</TableCell>
                  <TableCell>{anomaly.machine}</TableCell>
                  <TableCell>{anomaly.type}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        color: 'white',
                        bgcolor: 
                          anomaly.severity === 'High' ? 'error.main' :
                          anomaly.severity === 'Medium' ? 'warning.main' : 'info.main',
                        px: 1,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      {anomaly.severity}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AnomalyDetectionPage;
