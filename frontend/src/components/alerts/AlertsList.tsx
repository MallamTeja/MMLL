import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Chip, 
  Divider,
  ListItemButton
} from '@mui/material';
import { 
  Error as ErrorIcon, 
  Warning as WarningIcon, 
  Info as InfoIcon, 
  CheckCircle as CheckCircleIcon 
} from '@mui/icons-material';
import { Alert } from '../../types/alert';

interface AlertsListProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  maxItems?: number;
}

const AlertsList: React.FC<AlertsListProps> = ({ 
  alerts = [], 
  onAlertClick,
  maxItems = 5
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      case 'success':
        return <CheckCircleIcon color="success" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  const displayedAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

  if (alerts.length === 0) {
    return (
      <Paper sx={{ p: 2, height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          Alerts
        </Typography>
        <Typography variant="body2" color="textSecondary">
          No active alerts.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Alerts
      </Typography>
      <List>
        {displayedAlerts.map((alert, index) => (
          <React.Fragment key={alert.id}>
            <ListItem 
              component={onAlertClick ? ListItemButton : 'div'}
              onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
              alignItems="flex-start"
              disablePadding
            >
              <ListItemIcon>
                {getAlertIcon(alert.type)}
              </ListItemIcon>
              <ListItemText
                primary={alert.title}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      display="block"
                    >
                      {new Date(alert.timestamp).toLocaleString()}
                    </Typography>
                    {alert.message}
                  </>
                }
              />
              <Chip 
                label={alert.severity || 'medium'} 
                size="small"
                color={
                  alert.severity === 'high' ? 'error' :
                  alert.severity === 'medium' ? 'warning' :
                  'info'
                }
                sx={{ ml: 1 }}
              />
            </ListItem>
            {index < displayedAlerts.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default AlertsList;
