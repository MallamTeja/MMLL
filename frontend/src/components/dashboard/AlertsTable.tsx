import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Chip,
  Typography,
  Avatar,
  Skeleton,
} from '@mui/material';
import { Warning, Error, Info } from '@mui/icons-material';

interface Alert {
  id: string;
  machine: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  time: string;
}

const AlertsTable: React.FC = () => {
  // Sample alerts data - in a real app, this would come from an API
  const alerts: Alert[] = [
    {
      id: '1',
      machine: 'CNC-001',
      type: 'error',
      message: 'Abnormal vibration detected',
      time: '2 min ago',
    },
    {
      id: '2',
      machine: 'CNC-003',
      type: 'warning',
      message: 'Tool wear above threshold',
      time: '15 min ago',
    },
    {
      id: '3',
      machine: 'CNC-002',
      type: 'info',
      message: 'Scheduled maintenance due',
      time: '1 hour ago',
    },
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <Error color="error" fontSize="small" />;
      case 'warning':
        return <Warning color="warning" fontSize="small" />;
      default:
        return <Info color="info" fontSize="small" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'error.light';
      case 'warning':
        return 'warning.light';
      default:
        return 'info.light';
    }
  };

  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
      <Table size="small" aria-label="alerts table">
        <TableHead>
          <TableRow>
            <TableCell>Alert</TableCell>
            <TableCell align="right">Time</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {alerts.map((alert) => (
            <TableRow
              key={alert.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                <Box display="flex" alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: getAlertColor(alert.type),
                      mr: 1,
                    }}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {alert.machine}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {alert.message}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Typography variant="caption" color="text.secondary">
                  {alert.time}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box textAlign="center" mt={1}>
        <Chip
          label="View All Alerts"
          size="small"
          variant="outlined"
          onClick={() => {}}
          sx={{ cursor: 'pointer' }}
        />
      </Box>
    </TableContainer>
  );
};

export default AlertsTable;
