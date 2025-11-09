import client from '../api/client';

export interface Machine {
  id: number;
  name: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  health: number;
  lastMaintenance: string;
  nextMaintenance: string;
  uptime: string;
  temperature: number;
  vibration: number;
  rpm: number;
  pressure?: number;
  current?: number;
  voltage?: number;
}

export interface MachinePrediction {
  id: number;
  machineId: string;
  machineName: string;
  predictionDate: string;
  rulHours: number;
  confidence: number;
  status: 'good' | 'warning' | 'critical';
  features: {
    temperature: number;
    vibration: number;
    pressure: number;
    current: number;
    voltage: number;
  };
  historicalData: Array<{
    date: string;
    rul: number;
  }>;
}

// Get all machines
export const getMachines = async (): Promise<Array<{ id: number; name: string }>> => {
  try {
    const response = await client.get('/machines/');
    return response.data.map((machine: Machine) => ({
      id: machine.id,
      name: machine.name
    }));
  } catch (error) {
    console.error('Error fetching machines:', error);
    return [];
  }
};

// Mock data - replace with actual API calls
const mockMachines: Machine[] = [
  {
    id: 1,
    name: 'CNC-001',
    status: 'operational',
    health: 92,
    lastMaintenance: '2023-05-15',
    nextMaintenance: '2023-07-15',
    uptime: '98.5%',
    temperature: 42,
    vibration: 0.25,
    rpm: 2850,
    pressure: 2.1,
    current: 15.7,
    voltage: 415,
  },
  // Add more mock machines as needed
];

const mockPredictions: MachinePrediction[] = [
  {
    id: 1,
    machineId: 'CNC-001',
    machineName: 'CNC Milling #1',
    predictionDate: '2023-06-15T10:30:00',
    rulHours: 48.5,
    confidence: 0.92,
    status: 'good',
    features: {
      temperature: 42,
      vibration: 0.25,
      pressure: 2.1,
      current: 15.7,
      voltage: 415,
    },
    historicalData: [
      { date: '2023-05-01', rul: 120 },
      { date: '2023-05-15', rul: 100 },
      { date: '2023-06-01', rul: 75 },
      { date: '2023-06-15', rul: 48.5 },
    ],
  },
  // Add more mock predictions as needed
];

export const fetchMachines = async (): Promise<Machine[]> => {
  try {
    // Replace with actual API call
    // const response = await client.get('/api/machines');
    // return response.data;
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockMachines), 500);
    });
  } catch (error) {
    console.error('Error fetching machines:', error);
    throw error;
  }
};

export const fetchMachineById = async (id: number): Promise<Machine> => {
  try {
    // Replace with actual API call
    // const response = await client.get(`/api/machines/${id}`);
    // return response.data;
    return new Promise((resolve, reject) => {
      const machine = mockMachines.find((m) => m.id === id);
      if (machine) {
        setTimeout(() => resolve(machine), 500);
      } else {
        reject(new Error('Machine not found'));
      }
    });
  } catch (error) {
    console.error(`Error fetching machine ${id}:`, error);
    throw error;
  }
};

export const fetchMachinePredictions = async (): Promise<MachinePrediction[]> => {
  try {
    // Replace with actual API call
    // const response = await client.get('/api/predictions');
    // return response.data;
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPredictions), 500);
    });
  } catch (error) {
    console.error('Error fetching machine predictions:', error);
    throw error;
  }
};

export const fetchMachinePredictionById = async (id: number): Promise<MachinePrediction> => {
  try {
    // Replace with actual API call
    // const response = await client.get(`/api/predictions/${id}`);
    // return response.data;
    return new Promise((resolve, reject) => {
      const prediction = mockPredictions.find((p) => p.id === id);
      if (prediction) {
        setTimeout(() => resolve(prediction), 500);
      } else {
        reject(new Error('Prediction not found'));
      }
    });
  } catch (error) {
    console.error(`Error fetching prediction ${id}:`, error);
    throw error;
  }
};

export const updateMachineStatus = async (id: number, status: string): Promise<void> => {
  try {
    // Replace with actual API call
    // await client.patch(`/api/machines/${id}/status`, { status });
    return new Promise((resolve) => {
      console.log(`Updating machine ${id} status to ${status}`);
      setTimeout(resolve, 500);
    });
  } catch (error) {
    console.error(`Error updating machine ${id} status:`, error);
    throw error;
  }
};

export const triggerMaintenance = async (id: number): Promise<void> => {
  try {
    // Replace with actual API call
    // await client.post(`/api/machines/${id}/maintenance`);
    return new Promise((resolve) => {
      console.log(`Triggering maintenance for machine ${id}`);
      setTimeout(resolve, 500);
    });
  } catch (error) {
    console.error(`Error triggering maintenance for machine ${id}:`, error);
    throw error;
  }
};
