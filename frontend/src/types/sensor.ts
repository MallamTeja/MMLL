export interface SensorData {
  id: string;
  machineId: string;
  timestamp: string;
  
  // Sensor readings
  temperature?: number;
  vibration?: number;
  pressure?: number;
  powerConsumption?: number;
  runtime?: number;
  
  // Backward compatibility with snake_case properties
  power_consumption?: number;
  
  // Sensor type (type of sensor that generated this data)
  sensor_type?: string;
  type?: string; // Alias for sensor_type
  
  // Status and metadata
  status?: 'normal' | 'warning' | 'critical' | 'error' | 'offline';
  unit?: string;
  
  // Additional metadata
  sensorId?: string;
  sensorName?: string;
  sensorLocation?: string;
  
  // For time series data
  values?: {
    [key: string]: number | string | boolean | null;
  };
  
  // For batch processing
  batchId?: string;
  
  // For data quality
  qualityScore?: number;
  isAnomaly?: boolean;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface SensorReading {
  timestamp: string;
  value: number;
  unit: string;
}

export interface SensorStats {
  min: number;
  max: number;
  avg: number;
  current: number;
  unit: string;
}

export interface SensorThresholds {
  warning: number;
  critical: number;
}

export const SensorTypes = {
  TEMPERATURE: 'temperature',
  VIBRATION: 'vibration',
  PRESSURE: 'pressure',
  POWER_CONSUMPTION: 'powerConsumption',
  RUNTIME: 'runtime',
} as const;

export type SensorType = keyof typeof SensorTypes;

export interface SensorDataBatch {
  id: string;
  machineId: string;
  timestamp: string;
  data: SensorData[];
  batchSize: number;
}

export interface AggregatedSensorData {
  machineId: string;
  timestamp: string;
  aggregatedValues: {
    [key: string]: {
      min: number;
      max: number;
      avg: number;
      count: number;
    };
  };
}
