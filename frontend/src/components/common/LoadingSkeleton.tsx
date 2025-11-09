import React from 'react';
import { Skeleton, Box } from '@mui/material';

type SkeletonVariant = 'text' | 'rectangular' | 'circular' | 'rounded';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  animation?: 'pulse' | 'wave' | false;
  count?: number;
  spacing?: number;
  fullWidth?: boolean;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width = '100%',
  height = '1.5rem',
  animation = 'wave',
  count = 1,
  spacing = 1,
  fullWidth = true,
}) => {
  const skeletons = Array(count).fill(0).map((_, index) => (
    <Box 
      key={index} 
      sx={{ 
        width: fullWidth ? '100%' : 'auto',
        mb: index < count - 1 ? spacing : 0,
      }}
    >
      <Skeleton
        variant={variant}
        width={width}
        height={height}
        animation={animation}
        sx={{
          transform: 'none', // Disable scale transform for better performance
        }}
      />
    </Box>
  ));

  return <>{skeletons}</>;
};

// Predefined skeleton components
export const TextSkeleton: React.FC<{ lines?: number; width?: string | number }> = ({ 
  lines = 3, 
  width = '100%' 
}) => (
  <Box sx={{ width }}>
    <LoadingSkeleton variant="text" count={lines} spacing={1} />
  </Box>
);

export const CardSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    <Skeleton variant="rectangular" width="100%" height={140} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="text" width="60%" />
    <Skeleton variant="text" width="80%" />
    <Skeleton variant="text" width="40%" />
  </Box>
);

export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => (
  <Box sx={{ width: '100%' }}>
    {/* Header */}
    <Box sx={{ display: 'flex', mb: 2, gap: 2 }}>
      {Array(columns).fill(0).map((_, i) => (
        <Skeleton 
          key={`header-${i}`} 
          variant="text" 
          width={`${100 / columns}%`} 
          height={40} 
        />
      ))}
    </Box>
    
    {/* Rows */}
    {Array(rows).fill(0).map((_, rowIndex) => (
      <Box key={`row-${rowIndex}`} sx={{ display: 'flex', mb: 2, gap: 2 }}>
        {Array(columns).fill(0).map((_, colIndex) => (
          <Skeleton 
            key={`cell-${rowIndex}-${colIndex}`} 
            variant="rectangular" 
            width={`${100 / columns}%`} 
            height={60} 
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    ))}
  </Box>
);

export const ChartSkeleton: React.FC = () => (
  <Box sx={{ p: 2, height: 300 }}>
    <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
  </Box>
);

export const DashboardSkeleton: React.FC = () => (
  <Box sx={{ p: 2 }}>
    {/* Header */}
    <Box sx={{ mb: 4 }}>
      <Skeleton variant="text" width={200} height={40} />
      <Skeleton variant="text" width={300} height={24} />
    </Box>
    
    {/* KPI Cards */}
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 2, mb: 4 }}>
      {[1, 2, 3, 4].map((item) => (
        <Box key={item} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={32} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="80%" />
        </Box>
      ))}
    </Box>
    
    {/* Charts */}
    <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, mb: 4 }}>
      <Box sx={{ height: 300 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
      </Box>
      <Box sx={{ height: 300 }}>
        <Skeleton variant="rectangular" width="100%" height="100%" sx={{ borderRadius: 2 }} />
      </Box>
    </Box>
    
    {/* Table */}
    <TableSkeleton rows={5} columns={5} />
  </Box>
);

export default LoadingSkeleton;
