import React from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Divider, 
  Chip,
  IconButton,
  Tooltip,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as SuccessIcon, 
  Error as ErrorIcon, 
  Warning as WarningIcon,
  Info as InfoIcon,
  History as HistoryIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
// Using local Prediction interface instead of imported one to avoid conflicts

const StyledList = styled(List)({
  width: '100%',
  maxHeight: 500,
  overflow: 'auto',
  '& .MuiListItem-root': {
    borderRadius: 8,
    marginBottom: 8,
    transition: 'all 0.2s',
    '&:hover': {
      backgroundColor: 'action.hover',
      transform: 'translateX(4px)',
    },
  },
  '& .MuiDivider-root': {
    margin: '8px 0',
  },
});

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'healthy':
      return <SuccessIcon color="success" fontSize="small" />;
    case 'warning':
      return <WarningIcon color="warning" fontSize="small" />;
    case 'critical':
      return <ErrorIcon color="error" fontSize="small" />;
    default:
      return <InfoIcon color="info" fontSize="small" />;
  }
};

const getWearColor = (wear: string) => {
  switch (wear.toLowerCase()) {
    case 'severe':
      return 'error';
    case 'moderate':
      return 'warning';
    case 'mild':
      return 'info';
    default:
      return 'success';
  }
};

// Local Prediction interface with snake_case properties to match backend
interface Prediction {
  id: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
  confidence: number;
  machine_id: string;
  machine_name?: string;
  wear_category?: string;
  remaining_useful_life?: number;
  recommendations?: string[];
  // Add any other properties that might be needed
}

interface PredictionHistoryProps {
  predictions: Prediction[];
  onViewPrediction?: (prediction: Prediction) => void;
}

const PredictionHistory: React.FC<PredictionHistoryProps> = ({ 
  predictions, 
  onViewPrediction 
}) => {
  if (predictions.length === 0) {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        py={4}
        textAlign="center"
      >
        <HistoryIcon color="action" fontSize="large" />
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          No prediction history yet
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Your predictions will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        Recent Predictions
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <StyledList>
        {predictions.map((prediction, index) => (
          <React.Fragment key={prediction.id}>
            <ListItem 
              secondaryAction={
                <Tooltip title="View details">
                  <IconButton 
                    edge="end" 
                    onClick={() => onViewPrediction?.(prediction)}
                    size="small"
                  >
                    <ViewIcon />
                  </IconButton>
                </Tooltip>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'background.default' }}>
                  {getStatusIcon(prediction.status)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                    <Typography component="span" variant="subtitle2">
                      {prediction.machine_name || 'Unknown Machine'}
                    </Typography>
                    {prediction.wear_category && (
                      <Chip 
                        label={prediction.wear_category} 
                        color={getWearColor(prediction.wear_category) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      display="block"
                      mb={0.5}
                    >
                      {prediction.remaining_useful_life?.toFixed(1)} hours remaining
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      {formatDistanceToNow(new Date(prediction.timestamp), { addSuffix: true })}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            {index < predictions.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </StyledList>
    </Paper>
  );
};

export default PredictionHistory;
