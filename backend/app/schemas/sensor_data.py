from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from enum import Enum
from .base import ModelBase, ResponseBase, PaginatedResponse

class SensorDataBase(ModelBase):
    """
    Base schema for sensor data with common fields.
    """
    timestamp: datetime = Field(..., description="Timestamp of the sensor reading")
    machine_id: int = Field(..., description="ID of the machine this reading belongs to")
    sensor_type: str = Field(..., description="Type of sensor (e.g., temperature, vibration)")
    value: float = Field(..., description="Numeric value of the sensor reading")
    unit: str = Field(..., description="Unit of measurement (e.g., °C, mm/s, RPM)")
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional metadata about the sensor reading"
    )

class SensorDataCreate(SensorDataBase):
    """
    Schema for creating a new sensor data record.
    """
    pass

class SensorDataUpdate(ModelBase):
    """
    Schema for updating an existing sensor data record.
    """
    value: Optional[float] = None
    metadata: Optional[Dict[str, Any]] = None

class SensorDataInDB(SensorDataBase):
    """
    Schema for sensor data as stored in the database.
    """
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class SensorDataResponse(ResponseBase):
    """
    Response schema for a single sensor data record.
    """
    data: SensorDataInDB

class SensorDataListResponse(PaginatedResponse):
    """
    Response schema for a list of sensor data records.
    """
    items: List[SensorDataInDB]

# Batch upload schemas
class SensorDataBatchCreate(ModelBase):
    """
    Schema for uploading multiple sensor data records at once.
    """
    machine_id: int
    sensor_type: str
    unit: str
    readings: List[Dict[datetime, float]] = Field(
        ...,
        description="List of timestamp-value pairs"
    )
    metadata: Optional[Dict[str, Any]] = None

# Query schemas
class SensorDataQuery(ModelBase):
    """
    Schema for querying sensor data.
    """
    machine_id: Optional[int] = None
    sensor_type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    limit: int = 1000
    offset: int = 0

# Aggregation schemas
class AggregationInterval(str, Enum):
    MINUTE = "minute"
    HOUR = "hour"
    DAY = "day"
    WEEK = "week"
    MONTH = "month"

class AggregationFunction(str, Enum):
    AVG = "avg"
    MIN = "min"
    MAX = "max"
    SUM = "sum"
    COUNT = "count"

class AggregatedSensorDataQuery(SensorDataQuery):
    """
    Schema for querying aggregated sensor data.
    """
    interval: AggregationInterval = AggregationInterval.HOUR
    function: AggregationFunction = AggregationFunction.AVG

class AggregatedSensorDataPoint(BaseModel):
    """
    Schema for a single aggregated data point.
    """
    timestamp: datetime
    value: float
    count: int

class AggregatedSensorDataResponse(ResponseBase):
    """
    Response schema for aggregated sensor data.
    """
    machine_id: int
    sensor_type: str
    unit: str
    interval: str
    function: str
    data: List[AggregatedSensorDataPoint]
