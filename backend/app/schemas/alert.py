from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from .base import ResponseBase
from ..models.alert import AlertSeverity, AlertStatus

class AlertBase(BaseModel):
    machine_id: int
    sensor_id: Optional[int] = None
    title: str
    description: str
    severity: AlertSeverity
    status: AlertStatus = AlertStatus.OPEN
    acknowledged_by: Optional[int] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    status: Optional[AlertStatus] = None
    acknowledged_by: Optional[int] = None
    resolved_at: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None

class AlertInDBBase(AlertBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Alert(AlertInDBBase):
    pass

class AlertInDB(AlertInDBBase):
    pass

class AlertResponse(ResponseBase):
    data: Alert

class AlertListResponse(ResponseBase):
    data: List[Alert]

class AlertStats(BaseModel):
    total: int
    active: int
    acknowledged: int
    resolved: int
    critical: int
    warning: int
    info: int

class AlertStatsResponse(ResponseBase):
    data: AlertStats
