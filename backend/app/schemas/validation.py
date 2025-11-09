from pydantic import BaseModel, HttpUrl, Field, validator, constr
from typing import Optional, List, Union
from datetime import datetime
from enum import Enum

class MachineStatus(str, Enum):
    NORMAL = "normal"
    WARNING = "warning"
    CRITICAL = "critical"
    MAINTENANCE = "maintenance"

class SensorDataCreate(BaseModel):
    machine_id: int
    timestamp: datetime
    temperature: float = Field(..., ge=-50, le=200, description="Temperature in Celsius")
    vibration: float = Field(..., ge=0, description="Vibration in mm/s²")
    pressure: float = Field(..., ge=0, description="Pressure in bar")
    rpm: float = Field(..., ge=0, description="Rotations per minute")
    current: float = Field(..., ge=0, description="Current in Amperes")
    voltage: float = Field(..., ge=0, description="Voltage in Volts")

class ImageUpload(BaseModel):
    machine_id: int
    label: str
    notes: Optional[str] = None

    @validator('label')
    def validate_label(cls, v):
        allowed_labels = ['normal', 'wear', 'breakage', 'other']
        if v.lower() not in allowed_labels:
            raise ValueError(f'Label must be one of {allowed_labels}')
        return v.lower()

class PredictionRequest(BaseModel):
    model_version: str = "latest"
    confidence_threshold: float = Field(0.7, ge=0.5, le=1.0)

class AlertCreate(BaseModel):
    machine_id: int
    message: str
    severity: str
    component: Optional[str] = None

    @validator('severity')
    def validate_severity(cls, v):
        if v.lower() not in ['info', 'warning', 'critical']:
            raise ValueError('Severity must be one of: info, warning, critical')
        return v.lower()

class ReportRequest(BaseModel):
    start_date: datetime
    end_date: datetime
    machine_ids: List[int] = []
    report_type: str

    @validator('report_type')
    def validate_report_type(cls, v):
        allowed_types = ['health_summary', 'anomaly_logs', 'downtime_analysis', 'cost_savings']
        if v not in allowed_types:
            raise ValueError(f'Report type must be one of {allowed_types}')
        return v
