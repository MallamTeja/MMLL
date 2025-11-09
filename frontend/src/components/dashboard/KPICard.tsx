import React from 'react';
import { Card, CardContent, Typography, Box, SxProps, Theme } from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<SvgIconProps>;
  trend: string;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  sx?: SxProps<Theme>;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  sx = {},
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6,
        },
        ...sx,
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ textTransform: 'uppercase', fontWeight: 'medium' }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: `${color}.lighter`,
              color: `${color}.dark`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon, {
              color: 'inherit',
              fontSize: 'small',
            })}
          </Box>
        </Box>
        <Box>
          <Typography variant="h4" component="div" fontWeight="bold">
            {value}
          </Typography>
          <Typography
            variant="caption"
            color={trend.startsWith('+') ? 'success.main' : trend.startsWith('-') ? 'error.main' : 'text.secondary'}
            sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
          >
            {trend}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default KPICard;
