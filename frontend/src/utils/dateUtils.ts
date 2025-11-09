/**
 * Format a date string or Date object into a human-readable format
 * @param date - Date string or Date object
 * @param formatString - Format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, formatString = 'MMM d, yyyy'): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Calculate time difference from now in a human-readable format
 * @param date - Date string or Date object
 * @returns Relative time string (e.g., "2 days ago")
 */
export const timeAgo = (date: string | Date): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `${interval} ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'Just now';
  } catch (error) {
    console.error('Error calculating time ago:', error);
    return 'Invalid date';
  }
};

/**
 * Format duration in milliseconds to a human-readable format
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string (e.g., "2h 30m")
 */
export const formatDuration = (ms: number): string => {
  if (!ms && ms !== 0) return 'N/A';
  
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Check if a date is within a date range
 * @param date - Date to check
 * @param startDate - Start of the range
 * @param endDate - End of the range
 * @returns boolean indicating if the date is within the range
 */
export const isDateInRange = (
  date: Date | string,
  startDate: Date | string,
  endDate: Date | string
): boolean => {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    return d >= start && d <= end;
  } catch (error) {
    console.error('Error checking date range:', error);
    return false;
  }
};
