from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

class SensorDataBase(BaseModel):
    """Base schema for sensor data"""
    machine_id: int
    timestamp: datetime
    temperature: Optional[float] = None
    vibration: Optional[float] = None
    pressure: Optional[float] = None
    rpm: Optional[float] = None
    current: Optional[float] = None
    voltage: Optional[float] = None

class SensorDataCreate(SensorDataBase):
    """Schema for creating new sensor data"""
    pass

class SensorDataUpdate(BaseModel):
    """Schema for updating sensor data"""
    temperature: Optional[float] = None
    vibration: Optional[float] = None
    pressure: Optional[float] = None
    rpm: Optional[float] = None
    current: Optional[float] = None
    voltage: Optional[float] = None

class SensorDataInDBBase(SensorDataBase):
    """Base schema for sensor data in database"""
    id: int
    
    class Config:
        orm_mode = True

class SensorData(SensorDataInDBBase):
    """Schema for returning sensor data"""
    pass

class SensorDataResponse(BaseModel):
    """Response schema for sensor data operations"""
    message: str
    data: Optional[SensorData] = None

class SensorDataBulkCreate(BaseModel):
    """Schema for creating multiple sensor data records at once"""
    sensor_data: List[SensorDataCreate]

class SensorDataStats(BaseModel):
    """Schema for sensor data statistics"""
    parameter: str
    min: Optional[float] = None
    max: Optional[float] = None
    avg: Optional[float] = None
    last_value: Optional[float] = None
    last_updated: Optional[datetime] = None

class SensorDataStatsResponse(BaseModel):
    """Response schema for sensor data statistics"""
    machine_id: int
    stats: List[SensorDataStats]
