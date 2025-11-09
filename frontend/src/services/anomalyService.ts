import client from '../api/client';

// Types
export type Severity = 'low' | 'medium' | 'high';

export interface Anomaly {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  sensorType: string;
  value: number;
  expectedRange: {
    min: number;
    max: number;
  };
  severity: Severity;
  status: 'new' | 'acknowledged' | 'resolved';
  description: string;
  suggestedAction: string;
}

// Mock data generator for development
const generateMockAnomalies = (count: number): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  const sensorTypes = ['Temperature', 'Vibration', 'Current', 'Voltage', 'Pressure'];
  const statuses: ('new' | 'acknowledged' | 'resolved')[] = ['new', 'acknowledged', 'resolved'];
  const severities: Severity[] = ['low', 'medium', 'high'];
  const machines = [
    { id: 'CNC-001', name: 'CNC Milling #1' },
    { id: 'CNC-002', name: 'CNC Lathe #2' },
    { id: 'CNC-003', name: 'CNC Router #1' },
  ];

  for (let i = 0; i < count; i++) {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72));
    timestamp.setMinutes(Math.floor(Math.random() * 60));
    
    const sensorType = sensorTypes[Math.floor(Math.random() * sensorTypes.length)];
    const severity = severities[Math.floor(Math.random() * severities.length)];
    const machine = machines[Math.floor(Math.random() * machines.length)];
    
    let value, min, max;
    
    // Set realistic ranges based on sensor type
    switch (sensorType) {
      case 'Temperature':
        min = 20;
        max = 60;
        value = Math.floor(Math.random() * 30) + (severity === 'high' ? 65 : severity === 'medium' ? 60 : 20);
        break;
      case 'Vibration':
        min = 0.1;
        max = 0.5;
        value = parseFloat((Math.random() * 1.5 + (severity === 'high' ? 0.8 : severity === 'medium' ? 0.6 : 0.1)).toFixed(2));
        break;
      case 'Current':
        min = 5;
        max = 20;
        value = Math.floor(Math.random() * 20) + (severity === 'high' ? 25 : severity === 'medium' ? 22 : 5);
        break;
      case 'Voltage':
        min = 400;
        max = 420;
        value = Math.floor(Math.random() * 30) + (severity === 'high' ? 430 : severity === 'medium' ? 425 : 400);
        break;
      case 'Pressure':
        min = 1.5;
        max = 2.5;
        value = parseFloat((Math.random() * 2 + (severity === 'high' ? 3.5 : severity === 'medium' ? 3 : 1.5)).toFixed(2));
        break;
      default:
        min = 0;
        max = 100;
        value = Math.floor(Math.random() * 100);
    }

    anomalies.push({
      id: `ANOM-${1000 + i}`,
      timestamp: timestamp.toISOString(),
      machineId: machine.id,
      machineName: machine.name,
      sensorType,
      value,
      expectedRange: { min, max },
      severity,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      description: `Abnormal ${sensorType.toLowerCase()} reading detected`,
      suggestedAction: severity === 'high' ? 'Immediate maintenance required' : 
                      severity === 'medium' ? 'Schedule maintenance soon' : 'Monitor closely',
    });
  }

  return anomalies;
};

// Mock data
let mockAnomalies = generateMockAnomalies(50);

// API Functions
export const fetchAnomalies = async (params?: {
  severity?: Severity;
  status?: 'new' | 'acknowledged' | 'resolved';
  sensorType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Anomaly[]> => {
  try {
    // In a real app, this would be an API call:
    // const response = await client.get('/api/anomalies', { params });
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Apply filters to mock data
    let result = [...mockAnomalies];
    
    if (params) {
      if (params.severity) {
        result = result.filter(a => a.severity === params.severity);
      }
      if (params.status) {
        result = result.filter(a => a.status === params.status);
      }
      if (params.sensorType) {
        result = result.filter(a => a.sensorType === params.sensorType);
      }
      if (params.startDate) {
        const start = new Date(params.startDate);
        result = result.filter(a => new Date(a.timestamp) >= start);
      }
      if (params.endDate) {
        const end = new Date(params.endDate);
        end.setHours(23, 59, 59, 999);
        result = result.filter(a => new Date(a.timestamp) <= end);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        result = result.filter(
          a =>
            a.machineId.toLowerCase().includes(searchLower) ||
            a.machineName.toLowerCase().includes(searchLower) ||
            a.sensorType.toLowerCase().includes(searchLower) ||
            a.description.toLowerCase().includes(searchLower)
        );
      }
    }
    
    // Sort by timestamp descending by default
    return result.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error fetching anomalies:', error);
    throw error;
  }
};

export const updateAnomalyStatus = async (
  id: string, 
  status: 'new' | 'acknowledged' | 'resolved'
): Promise<Anomaly> => {
  try {
    // In a real app, this would be an API call:
    // const response = await client.patch(`/api/anomalies/${id}/status`, { status });
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = mockAnomalies.findIndex(a => a.id === id);
    if (index === -1) {
      throw new Error('Anomaly not found');
    }
    
    const updatedAnomaly = { ...mockAnomalies[index], status };
    mockAnomalies[index] = updatedAnomaly;
    
    return updatedAnomaly;
  } catch (error) {
    console.error(`Error updating anomaly ${id} status:`, error);
    throw error;
  }
};

export const getAnomalyStats = async () => {
  try {
    // In a real app, this would be an API call:
    // const response = await client.get('/api/anomalies/stats');
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const total = mockAnomalies.length;
    const bySeverity = {
      high: mockAnomalies.filter(a => a.severity === 'high').length,
      medium: mockAnomalies.filter(a => a.severity === 'medium').length,
      low: mockAnomalies.filter(a => a.severity === 'low').length,
    };
    
    const byStatus = {
      new: mockAnomalies.filter(a => a.status === 'new').length,
      acknowledged: mockAnomalies.filter(a => a.status === 'acknowledged').length,
      resolved: mockAnomalies.filter(a => a.status === 'resolved').length,
    };
    
    // Generate historical data for the last 7 days
    const historicalData = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayAnomalies = mockAnomalies.filter(a => {
        const anomalyDate = new Date(a.timestamp).toISOString().split('T')[0];
        return anomalyDate === dateStr;
      });
      
      historicalData.push({
        date: dateStr,
        total: dayAnomalies.length,
        high: dayAnomalies.filter(a => a.severity === 'high').length,
        medium: dayAnomalies.filter(a => a.severity === 'medium').length,
        low: dayAnomalies.filter(a => a.severity === 'low').length,
      });
    }
    
    return {
      total,
      bySeverity,
      byStatus,
      historicalData,
    };
  } catch (error) {
    console.error('Error fetching anomaly stats:', error);
    throw error;
  }
};

export const getSensorTypes = async (): Promise<string[]> => {
  try {
    // In a real app, this would be an API call:
    // const response = await client.get('/api/sensors/types');
    // return response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return ['Temperature', 'Vibration', 'Current', 'Voltage', 'Pressure'];
  } catch (error) {
    console.error('Error fetching sensor types:', error);
    throw error;
  }
};
