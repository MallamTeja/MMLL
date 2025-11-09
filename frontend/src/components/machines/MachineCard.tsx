import React from 'react';
import { Card, CardContent, Typography, Box, Chip, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Machine } from '../../types/machine';

type MachineCardProps = {
  machine: Machine;
  onClick: () => void;
};

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    cursor: 'pointer',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  fontWeight: 'bold',
}));

const MachineCard: React.FC<MachineCardProps> = ({ machine, onClick }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      case 'maintenance':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <StyledCard onClick={onClick}>
      <Box position="relative">
        <Box
          sx={{
            height: 140,
            backgroundColor: 'grey.200',
            backgroundImage: machine.imageUrl 
              ? `url(${machine.imageUrl})` 
              : 'linear-gradient(45deg, #f5f5f5 25%, #e0e0e0 25%, #e0e0e0 50%, #f5f5f5 50%, #f5f5f5 75%, #e0e0e0 75%, #e0e0e0 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <StatusChip 
          label={machine.status} 
          color={getStatusColor(machine.status)} 
          size="small"
          variant="outlined"
        />
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {machine.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {machine.model} • {machine.manufacturer}
        </Typography>
        
        {machine.rulHours !== undefined && (
          <Box mt={2}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                RUL: {machine.rulHours.toFixed(1)} hours
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {machine.rulPercentage !== undefined ? `${machine.rulPercentage}%` : 'N/A'}
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={machine.rulPercentage || 0} 
              color={
                (machine.rulPercentage || 0) > 50 ? 'success' : 
                (machine.rulPercentage || 0) > 20 ? 'warning' : 'error'
              }
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}
        
        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="caption" color="text.secondary">
            Last updated: {machine.lastUpdated ? new Date(machine.lastUpdated).toLocaleString() : 'N/A'}
          </Typography>
          {machine.operatingHours !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {machine.operatingHours.toFixed(1)} hrs
            </Typography>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
};

export default MachineCard;
