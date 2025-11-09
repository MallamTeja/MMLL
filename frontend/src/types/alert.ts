export interface Alert {
  id: string;
  machineId: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
  severity?: 'low' | 'medium' | 'high';
  source?: string;
  metadata?: {
    [key: string]: any;
  };
}

export interface AlertStats {
  total: number;
  resolved: number;
  critical: number;
  warning: number;
  info: number;
  byMachine: {
    [machineId: string]: number;
  };
  byType: {
    [type: string]: number;
  };
}

export interface AlertFilter {
  machineId?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  resolved?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
