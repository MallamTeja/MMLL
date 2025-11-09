from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.maintenance import MaintenanceStatus, MaintenanceType

class MaintenanceTaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: MaintenanceStatus = MaintenanceStatus.SCHEDULED
    technician_id: Optional[int] = None

class MaintenanceTaskCreate(MaintenanceTaskBase):
    pass

class MaintenanceTaskUpdate(BaseModel):
    status: Optional[MaintenanceStatus] = None
    completed: Optional[bool] = None
    technician_id: Optional[int] = None
    completed_at: Optional[datetime] = None

class MaintenanceTaskInDB(MaintenanceTaskBase):
    id: int
    schedule_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class MaintenanceScheduleBase(BaseModel):
    machine_id: int
    scheduled_time: datetime
    maintenance_type: MaintenanceType = MaintenanceType.PREVENTIVE
    description: Optional[str] = None

class MaintenanceScheduleCreate(MaintenanceScheduleBase):
    tasks: List[MaintenanceTaskCreate] = []

class MaintenanceScheduleUpdate(BaseModel):
    scheduled_time: Optional[datetime] = None
    status: Optional[MaintenanceStatus] = None
    description: Optional[str] = None

class MaintenanceScheduleInDB(MaintenanceScheduleBase):
    id: int
    status: MaintenanceStatus
    created_at: datetime
    updated_at: datetime
    tasks: List[MaintenanceTaskInDB] = []

    class Config:
        orm_mode = True

class MaintenanceLogCreate(BaseModel):
    action: str
    details: Optional[str] = None

class MaintenanceLogInDB(MaintenanceLogCreate):
    id: int
    schedule_id: int
    user_id: int
    created_at: datetime

    class Config:
        orm_mode = True

class MaintenancePartBase(BaseModel):
    part_name: str
    part_number: Optional[str] = None
    quantity: int = 1
    replaced: bool = False
    notes: Optional[str] = None

class MaintenancePartCreate(MaintenancePartBase):
    pass

class MaintenancePartInDB(MaintenancePartBase):
    id: int
    task_id: int

    class Config:
        orm_mode = True
