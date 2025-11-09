import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  Alert, 
  Divider, 
  Chip,
  LinearProgress,
  Tooltip,
  Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as SuccessIcon, 
  Error as ErrorIcon, 
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { Prediction } from '../../types/prediction';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 12,
  boxShadow: theme.shadows[3],
  height: '100%',
}));

const StatusChip = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return {
          icon: <SuccessIcon />,
          label: 'Healthy',
          color: 'success' as const,
        };
      case 'warning':
        return {
          icon: <WarningIcon />,
          label: 'Warning',
          color: 'warning' as const,
        };
      case 'critical':
        return {
          icon: <ErrorIcon />,
          label: 'Critical',
          color: 'error' as const,
        };
      default:
        return {
          icon: <InfoIcon />,
          label: 'Unknown',
          color: 'default' as const,
        };
    }
  };

  const { icon, label, color } = getStatusProps();

  return (
    <Chip
      icon={icon}
      label={label}
      color={color}
      variant="outlined"
      sx={{ 
        fontWeight: 'bold',
        px: 1,
        '& .MuiChip-icon': {
          color: `${color}.main`,
        },
      }}
    />
  );
};

const PredictionResult: React.FC<{
  prediction: Prediction | null;
  loading: boolean;
  error: string | null;
}> = ({ prediction, loading, error }) => {
  if (loading) {
    return (
      <StyledPaper>
        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
          <CircularProgress size={48} />
          <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
            Analyzing tool condition...
          </Typography>
        </Box>
      </StyledPaper>
    );
  }

  if (error) {
    return (
      <StyledPaper>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to process prediction
        </Alert>
      </StyledPaper>
    );
  }

  if (!prediction) {
    return (
      <StyledPaper>
        <Box textAlign="center" py={4}>
          <InfoIcon color="action" fontSize="large" />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No prediction results
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Upload an image or sensor data to get started
          </Typography>
        </Box>
      </StyledPaper>
    );
  }

  const { 
    status, 
    confidence, 
    predictedRUL,
    timestamp, 
    recommendedActions = []
  } = prediction;

  const wearSeverity = status === 'critical' ? 'error' : status === 'warning' ? 'warning' : 'success';

  return (
    <StyledPaper>
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Prediction Results</Typography>
          <StatusChip status={status} />
        </Box>
        <Divider sx={{ my: 2 }} />
        
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Confidence
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {(confidence * 100).toFixed(1)}%
            </Typography>
          </Box>
          <Tooltip title={`Confidence score: ${(confidence * 100).toFixed(1)}%`}>
            <LinearProgress 
              variant="determinate" 
              value={confidence * 100} 
              color={confidence > 0.7 ? 'success' : confidence > 0.4 ? 'warning' : 'error'}
              sx={{
                height: 8,
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
          </Tooltip>
        </Box>

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }} gap={2} mb={3}>
          <Box>
            <Typography variant="caption" color="textSecondary" display="block">
              Remaining Useful Life
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {predictedRUL?.toFixed(1)} hours
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="textSecondary" display="block">
              Status
            </Typography>
            <Chip 
              label={status.toUpperCase()} 
              color={wearSeverity as any}
              size="small"
              sx={{ textTransform: 'capitalize', fontWeight: 'medium' }}
            />
          </Box>
        </Box>

        {recommendedActions && recommendedActions.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Recommendations
            </Typography>
            <Box component="ul" sx={{ pl: 2, m: 0 }}>
              {recommendedActions.map((rec: string, index: number) => (
                <Typography 
                  key={index} 
                  variant="body2" 
                  component="li" 
                  sx={{ mb: 1 }}
                >
                  {rec}
                </Typography>
              ))}
            </Box>
          </Box>
        )}
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box>
        <Typography variant="caption" color="textSecondary" display="block">
          Predicted on
        </Typography>
        <Typography variant="body2">
          {new Date(timestamp).toLocaleString()}
        </Typography>
      </Box>
    </StyledPaper>
  );
};

export default PredictionResult;
