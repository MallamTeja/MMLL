import { get, post } from './api';
import { SensorData, SensorDataBatch, AggregatedSensorData } from '../types/sensor';

const SENSOR_DATA_API = '/sensor-data';

export const fetchSensorData = async (params?: {
  machineId?: number;
  sensorType?: string;
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: SensorData[]; total: number }> => {
  try {
    const response = await get<{ items: SensorData[]; total: number }>(SENSOR_DATA_API, { params });
    return response;
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    throw error;
  }
};

export const fetchSensorDataById = async (id: number): Promise<SensorData> => {
  try {
    return await get<SensorData>(`${SENSOR_DATA_API}/${id}`);
  } catch (error) {
    console.error(`Error fetching sensor data with ID ${id}:`, error);
    throw error;
  }
};

export const createSensorData = async (data: Omit<SensorData, 'id' | 'created_at' | 'updated_at'>): Promise<SensorData> => {
  try {
    return await post<SensorData>(SENSOR_DATA_API, data);
  } catch (error) {
    console.error('Error creating sensor data:', error);
    throw error;
  }
};

export const createSensorDataBatch = async (data: SensorDataBatch): Promise<SensorData[]> => {
  try {
    return await post<SensorData[]>(`${SENSOR_DATA_API}/batch`, data);
  } catch (error) {
    console.error('Error creating sensor data batch:', error);
    throw error;
  }
};

export const fetchAggregatedSensorData = async (params: {
  machineId: number;
  sensorType: string;
  startTime: string;
  endTime: string;
  interval: 'minute' | 'hour' | 'day' | 'week' | 'month';
  function: 'avg' | 'min' | 'max' | 'sum' | 'count';
  unit?: string;
}): Promise<AggregatedSensorData> => {
  try {
    return await get<AggregatedSensorData>(`${SENSOR_DATA_API}/aggregated`, { params });
  } catch (error) {
    console.error('Error fetching aggregated sensor data:', error);
    throw error;
  }
};

export const deleteSensorData = async (id: number): Promise<void> => {
  try {
    await get<void>(`${SENSOR_DATA_API}/${id}`, { method: 'DELETE' });
  } catch (error) {
    console.error(`Error deleting sensor data with ID ${id}:`, error);
    throw error;
  }
};
