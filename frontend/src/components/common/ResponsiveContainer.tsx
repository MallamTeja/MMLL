import React, { ReactNode } from 'react';
import { Box, SxProps, Theme, useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type AppResponsiveProps = {
  children: ReactNode | ((isMobile: boolean) => ReactNode);
  breakpoint?: Breakpoint;
  sx?: SxProps<Theme>;
  mobileSx?: SxProps<Theme>;
  desktopSx?: SxProps<Theme>;
  className?: string;
};

const breakpoints = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

const AppResponsiveContainer: React.FC<AppResponsiveProps> = ({
  children,
  breakpoint = 'md',
  sx = {},
  mobileSx = {},
  desktopSx = {},
  className = '',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));

  const combinedSx = {
    ...sx,
    ...(isMobile ? mobileSx : desktopSx),
  };

  const content = typeof children === 'function' 
    ? children(isMobile) 
    : children;

  return (
    <Box className={className} sx={combinedSx}>
      {content}
    </Box>
  );
};

// Responsive Grid Component
type ResponsiveGridProps = {
  children: ReactNode;
  itemMinWidth?: number | string;
  gap?: number | string;
  sx?: SxProps<Theme>;
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  itemMinWidth = 280,
  gap = 2,
  sx = {},
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${typeof itemMinWidth === 'number' ? `${itemMinWidth}px` : itemMinWidth}, 1fr))`,
        gap: typeof gap === 'number' ? theme.spacing(gap) : gap,
        width: '100%',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

// Responsive Spacer Component
type ResponsiveSpacerProps = {
  height?: number | string;
  mobileHeight?: number | string;
  desktopHeight?: number | string;
};

export const ResponsiveSpacer: React.FC<ResponsiveSpacerProps> = ({
  height = 2,
  mobileHeight,
  desktopHeight,
}) => {
  return (
    <AppResponsiveContainer
      mobileSx={{
        height: mobileHeight || height,
      }}
      desktopSx={{
        height: desktopHeight || height,
      }}
    >
      <div />
    </AppResponsiveContainer>
  );
};

// Responsive Text Component
type ResponsiveTextProps = {
  children: ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body1' | 'body2' | 'caption' | 'button' | 'overline';
  mobileVariant?: string;
  desktopVariant?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  sx?: SxProps<Theme>;
};

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body1',
  mobileVariant,
  desktopVariant,
  align = 'left',
  color = 'text.primary',
  sx = {},
}) => {
  return (
    <AppResponsiveContainer
      mobileSx={{
        typography: mobileVariant || variant,
        textAlign: align,
        color,
        ...sx,
      }}
      desktopSx={{
        typography: desktopVariant || variant,
        textAlign: align,
        color,
        ...sx,
      }}
    >
      {children}
    </AppResponsiveContainer>
  );
};

export default AppResponsiveContainer;
