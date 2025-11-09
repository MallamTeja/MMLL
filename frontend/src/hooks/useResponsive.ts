import { useTheme, Breakpoint } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

type BreakpointOrNull = Breakpoint | null;

/**
 * Hook that returns the current breakpoint and helper functions for responsive design
 */
function useResponsive() {
  const theme = useTheme();
  
  // Check if screen size is within a breakpoint range
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  
  // Get current breakpoint
  const currentBreakpoint = (() => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    let result: Breakpoint = 'xs';
    
    for (let i = 0; i < breakpoints.length; i++) {
      const breakpoint = breakpoints[i];
      const matches = useMediaQuery(theme.breakpoints.up(breakpoint));
      
      if (matches) {
        result = breakpoint;
      } else {
        break;
      }
    }
    
    return result;
  })();
  
  /**
   * Returns true if the current screen size is within the specified breakpoint range
   * @param start Start breakpoint (inclusive)
   * @param end End breakpoint (exclusive)
   */
  const between = (start: Breakpoint, end: Breakpoint): boolean => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const startIndex = breakpoints.indexOf(start);
    const endIndex = breakpoints.indexOf(end);
    const currentIndex = breakpoints.indexOf(currentBreakpoint);
    
    return currentIndex >= startIndex && currentIndex < endIndex;
  };
  
  /**
   * Returns true if the current screen size is greater than the specified breakpoint
   * @param breakpoint Breakpoint to check against
   */
  const up = (breakpoint: Breakpoint): boolean => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const breakpointIndex = breakpoints.indexOf(breakpoint);
    const currentIndex = breakpoints.indexOf(currentBreakpoint);
    
    return currentIndex >= breakpointIndex;
  };
  
  /**
   * Returns true if the current screen size is less than the specified breakpoint
   * @param breakpoint Breakpoint to check against
   */
  const down = (breakpoint: Breakpoint): boolean => {
    const breakpoints = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
    const breakpointIndex = breakpoints.indexOf(breakpoint);
    const currentIndex = breakpoints.indexOf(currentBreakpoint);
    
    return currentIndex <= breakpointIndex;
  };
  
  /**
   * Returns true if the current screen size matches exactly the specified breakpoint
   * @param breakpoint Breakpoint to check against
   */
  const only = (breakpoint: Breakpoint): boolean => {
    return currentBreakpoint === breakpoint;
  };
  
  /**
   * Returns a value based on the current screen size
   * @param values Object with breakpoint keys and corresponding values
   * @param defaultValue Default value if no breakpoint matches
   */
  const responsiveValue = <T,>(
    values: Partial<Record<Breakpoint, T>>,
    defaultValue?: T
  ): T | undefined => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl'];
    for (let i = breakpoints.length - 1; i >= 0; i--) {
      const breakpoint = breakpoints[i];
      if (up(breakpoint) && values[breakpoint] !== undefined) {
        return values[breakpoint];
      }
    }
    return defaultValue;
  };
  
  return {
    // Current breakpoint information
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: currentBreakpoint,
    
    // Breakpoint checkers
    between,
    up,
    down,
    only,
    
    // Responsive value helper
    value: responsiveValue,
  };
}

export default useResponsive;
