export interface Machine {
  id: string;
  name: string;
  status: 'operational' | 'maintenance' | 'error' | 'offline';
  imageUrl?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  location?: string;
  type?: string;
  model?: string;
  serialNumber?: string;
  manufacturer?: string;
  lastUpdated?: string;
  operatingHours?: number;
  rulHours?: number;
  rulPercentage?: number;
  // Backward compatibility with snake_case properties
  serial_number?: string;
  operating_hours?: number;
  installation_date?: string;
  
  metrics?: {
    temperature?: number;
    vibration?: number;
    pressure?: number;
    powerConsumption?: number;
    runtime?: number;
    lastUpdated?: string;
    // Backward compatibility with snake_case properties
    power_consumption?: number;
    last_updated?: string;
  };
  
  alerts?: Array<{
    id: string;
    type: 'warning' | 'error' | 'info' | 'success';
    title: string;
    message: string;
    timestamp: string;
    resolved?: boolean;
    severity?: 'low' | 'medium' | 'high';
    source?: string;
    metadata?: {
      [key: string]: any;
    };
  }>;
  
  maintenanceHistory?: Array<{
    id: string;
    machineId: string;
    date: string;
    type: 'scheduled' | 'emergency' | 'inspection' | 'repair' | 'upgrade';
    description: string;
    technician?: string;
    duration?: number;
    status: 'completed' | 'pending' | 'in-progress' | 'cancelled';
    cost?: number;
    partsReplaced?: Array<{
      id: string;
      name: string;
      partNumber: string;
      quantity: number;
      unitCost: number;
    }>;
  }>;
  
  specifications?: {
    manufacturer?: string;
    modelNumber?: string;
    installationDate?: string;
    warrantyExpiration?: string;
    maximumCapacity?: string;
    powerRequirements?: string;
    dimensions?: string;
    weight?: string;
    // Backward compatibility with snake_case properties
    model_number?: string;
    installation_date?: string;
    warranty_expiration?: string;
    maximum_capacity?: string;
    power_requirements?: string;
  };
  
  notes?: string;
  
  // Additional properties for UI state
  isSelected?: boolean;
  isExpanded?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default Machine;
