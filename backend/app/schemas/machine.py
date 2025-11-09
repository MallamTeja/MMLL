from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
from .base import ModelBase, ResponseBase, PaginatedResponse

# Machine schemas
class MachineBase(ModelBase):
    name: str = Field(..., description="Unique name of the machine")
    status: str = Field("operational", description="Current status of the machine")
    description: Optional[str] = Field(None, description="Optional description of the machine")
    location: Optional[str] = Field(None, description="Physical location of the machine")
    manufacturer: Optional[str] = Field(None, description="Manufacturer of the machine")
    model: Optional[str] = Field(None, description="Model number/name of the machine")
    serial_number: Optional[str] = Field(None, description="Serial number of the machine")
    installation_date: Optional[datetime] = Field(None, description="Date when the machine was installed")
    last_maintenance_date: Optional[datetime] = Field(None, description="Date of last maintenance")
    next_maintenance_date: Optional[datetime] = Field(None, description="Scheduled date for next maintenance")
    operating_hours: Optional[float] = Field(0.0, description="Total recorded operating hours")
    image_url: Optional[HttpUrl] = Field(None, description="URL to an image of the machine")
    metadata: Optional[Dict[str, Any]] = Field(
        None, 
        description="Additional metadata about the machine in key-value format"
    )

class MachineCreate(MachineBase):
    pass

class MachineUpdate(MachineBase):
    name: Optional[str] = None
    status: Optional[str] = None

class MachineInDB(MachineBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MachineResponse(ResponseBase):
    data: MachineInDB

class MachineListResponse(PaginatedResponse):
    items: List[MachineInDB]

# Machine statistics and health
class MachineHealthStats(ModelBase):
    machine_id: int
    status: str
    uptime_percentage: float = Field(..., ge=0, le=100, description="Uptime percentage in the last 30 days")
    avg_rul: Optional[float] = Field(None, description="Average remaining useful life in hours")
    last_prediction_time: Optional[datetime] = None
    alert_count: Dict[str, int] = Field(
        default_factory=lambda: {"critical": 0, "warning": 0, "info": 0},
        description="Count of alerts by severity"
    )
    sensor_stats: Optional[Dict[str, Dict[str, float]]] = Field(
        None,
        description="Statistics for sensor readings (min, max, avg, std)"
    )

class MachineHealthResponse(ResponseBase):
    data: MachineHealthStats

# Maintenance schemas
class MaintenanceType(str, Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    PREDICTIVE = "predictive"
    SCHEDULED = "scheduled"
    EMERGENCY = "emergency"

class MaintenanceTaskBase(ModelBase):
    machine_id: int
    type: MaintenanceType
    title: str
    description: str
    scheduled_date: datetime
    completed: bool = False
    completed_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    estimated_duration: Optional[float] = Field(
        None, 
        description="Estimated duration in hours"
    )
    actual_duration: Optional[float] = Field(
        None, 
        description="Actual duration in hours"
    )
    notes: Optional[str] = None

class MaintenanceTaskCreate(MaintenanceTaskBase):
    pass

class MaintenanceTaskUpdate(MaintenanceTaskBase):
    type: Optional[MaintenanceType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    completed: Optional[bool] = None

class MaintenanceTaskInDB(MaintenanceTaskBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MaintenanceTaskResponse(ResponseBase):
    data: MaintenanceTaskInDB

class MaintenanceTaskListResponse(PaginatedResponse):
    items: List[MaintenanceTaskInDB]
