import React from 'react';
import { 
  Box, 
  Typography, 
  Chip, 
  Stack, 
  Divider,
  Paper
} from '@mui/material';

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

interface MachineListProps {
  machines: Machine[];
  selectedMachine?: string;
  onSelectMachine?: (id: string) => void;
}

export const MachineList = ({ machines, selectedMachine, onSelectMachine }: MachineListProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Status color mapping for the Chip component
  const statusColorMap = {
    operational: 'success',
    warning: 'warning',
    error: 'error'
  };

  return (
    <Paper elevation={2}>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Machines
        </Typography>
        <Stack spacing={2}>
          {machines.map((machine) => {
            const isSelected = machine.id === selectedMachine;
            return (
              <React.Fragment key={machine.id}>
                <Box 
                  onClick={() => onSelectMachine?.(machine.id)}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    borderRadius: 1,
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <Box>
                    <Typography variant="subtitle1">{machine.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Last updated: {new Date(machine.lastUpdated).toLocaleString()}
                    </Typography>
                  </Box>
                  <Chip 
                    label={machine.status} 
                    color={
                      machine.status === 'operational' ? 'success' : 
                      machine.status === 'warning' ? 'warning' : 'error'
                    } 
                    size="small"
                    variant={isSelected ? 'filled' : 'outlined'}
                  />
                </Box>
                <Divider />
              </React.Fragment>
            );
          })}
        </Stack>
      </Box>
    </Paper>
  );
};

export default MachineList;
