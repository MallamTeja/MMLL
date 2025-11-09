import React from 'react';
import { Card, CardContent, Typography, Box, LinearProgress, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { SvgIconProps } from '@mui/material/SvgIcon';

interface StatusCardProps {
  title: string;
  status: 'operational' | 'warning' | 'error' | string;
  lastUpdated: string;
  uptime?: string;
  efficiency?: number;
  toolLifeRemaining?: number;
  toolChanges?: number;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'operational':
    case 'good':
      return 'success.main';
    case 'warning':
      return 'warning.main';
    case 'error':
    case 'critical':
      return 'error.main';
    default:
      return 'text.secondary';
  }
};

const StatusIndicator = styled('span')<{ status: string }>(({ theme, status }) => ({
  display: 'inline-block',
  width: 12,
  height: 12,
  borderRadius: '50%',
  backgroundColor: getStatusColor(status),
  marginRight: theme.spacing(1),
  boxShadow: `0 0 8px ${getStatusColor(status)}`,
}));

const StatItem: React.FC<{ label: string; value: React.ReactNode; icon?: React.ReactElement<SvgIconProps> }> = ({
  label,
  value,
  icon,
}) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Box display="flex" alignItems="center">
      {icon && React.cloneElement(icon, { sx: { mr: 1, color: 'text.secondary', fontSize: '1rem' } })}
      <Typography variant="body1">{value}</Typography>
    </Box>
  </Box>
);

const MachineStatusCard: React.FC<StatusCardProps> = ({
  title,
  status,
  lastUpdated,
  uptime,
  efficiency,
  toolLifeRemaining,
  toolChanges,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          <Box display="flex" alignItems="center">
            <StatusIndicator status={status} />
            <Typography 
              variant="body2" 
              sx={{ 
                textTransform: 'capitalize',
                color: getStatusColor(status),
                fontWeight: 'medium'
              }}
            >
              {status}
            </Typography>
          </Box>
        </Box>

        <Box>
          <StatItem 
            label="Last Updated" 
            value={lastUpdated} 
          />
          
          {uptime && (
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Uptime
                </Typography>
                <Typography variant="caption" fontWeight="medium">
                  {uptime}
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(uptime)} 
                color="primary"
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}

          {efficiency !== undefined && (
            <Box mb={2}>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">
                  Efficiency
                </Typography>
                <Typography variant="caption" fontWeight="medium">
                  {efficiency}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={efficiency} 
                color="secondary"
                sx={{
                  height: 8,
                  borderRadius: 4,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}

          {toolLifeRemaining !== undefined && (
            <StatItem 
              label="Tool Life Remaining"
              value={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: '100%', maxWidth: 100 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={toolLifeRemaining} 
                      color={toolLifeRemaining > 30 ? 'success' : toolLifeRemaining > 10 ? 'warning' : 'error'}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {toolLifeRemaining}%
                  </Typography>
                </Stack>
              }
            />
          )}

          {toolChanges !== undefined && (
            <StatItem 
              label="Tool Changes"
              value={toolChanges}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MachineStatusCard;
