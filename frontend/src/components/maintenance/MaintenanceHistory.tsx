import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import { format } from 'date-fns';

interface MaintenanceRecord {
  id: string;
  machineId: string;
  type: string;
  description: string;
  date: string;
  technician: string;
  status: 'completed' | 'pending' | 'scheduled';
}

interface MaintenanceHistoryProps {
  records: MaintenanceRecord[];
  machineId?: string;
}

const MaintenanceHistory: React.FC<MaintenanceHistoryProps> = ({ 
  records = [],
  machineId 
}) => {
  if (records.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Maintenance History
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No maintenance records found.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Maintenance History
      </Typography>
      <List>
        {records.map((record, index) => (
          <React.Fragment key={record.id}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={record.type}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {format(new Date(record.date), 'PPpp')}
                    </Typography>
                    {` — ${record.description}`}
                  </>
                }
              />
            </ListItem>
            {index < records.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default MaintenanceHistory;
