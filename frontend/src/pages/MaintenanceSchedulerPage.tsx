import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MuiGrid, { GridProps as MuiGridProps } from '@mui/material/Grid';
import { styled } from '@mui/material/styles';

// Create a properly typed Grid component with all necessary props
const Grid = styled(MuiGrid)<{
  item?: boolean;
  container?: boolean;
  spacing?: number | string;
  xs?: number | 'auto' | boolean;
  sm?: number | 'auto' | boolean;
  md?: number | 'auto' | boolean;
  lg?: number | 'auto' | boolean;
  xl?: number | 'auto' | boolean;
}>({});

const MaintenanceSchedulerPage: React.FC = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [description, setDescription] = useState('');
  const [maintenanceTasks, setMaintenanceTasks] = useState([
    { id: 1, date: '2023-10-20', machine: 'CNC-001', description: 'Routine maintenance', status: 'Scheduled' },
    { id: 2, date: '2023-10-18', machine: 'CNC-002', description: 'Tool replacement', status: 'In Progress' },
    { id: 3, date: '2023-10-15', machine: 'CNC-003', description: 'Lubrication', status: 'Completed' },
  ]);

  const handleSchedule = () => {
    // In a real app, this would call your API
    const newTask = {
      id: maintenanceTasks.length + 1,
      date: date?.toISOString().split('T')[0] || '',
      machine: 'CNC-00' + (maintenanceTasks.length + 1),
      description,
      status: 'Scheduled'
    };
    setMaintenanceTasks([...maintenanceTasks, newTask]);
    setDescription('');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Maintenance Scheduler
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Schedule New Maintenance
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Maintenance Date"
                value={date}
                onChange={(newValue) => setDate(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined'
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter maintenance description..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSchedule}
              disabled={!date || !description}
              sx={{ height: '56px' }}
            >
              Schedule Maintenance
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upcoming Maintenance Tasks
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {maintenanceTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.date}</TableCell>
                  <TableCell>{task.machine}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        color: 'white',
                        bgcolor: 
                          task.status === 'Completed' ? 'success.main' :
                          task.status === 'In Progress' ? 'warning.main' : 'info.main',
                        px: 1,
                        borderRadius: 1,
                        display: 'inline-block'
                      }}
                    >
                      {task.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {task.status !== 'Completed' && (
                      <Button
                        variant="outlined"
                        size="small"
                        color="success"
                        onClick={() => {
                          // Update task status
                          const updatedTasks = maintenanceTasks.map(t => 
                            t.id === task.id ? { ...t, status: 'Completed' } : t
                          );
                          setMaintenanceTasks(updatedTasks);
                        }}
                      >
                        Mark Complete
                      </Button>
                    )}
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

export default MaintenanceSchedulerPage;
