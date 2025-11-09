from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum

# Common Enums
class Status(str, Enum):
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    WARNING = "warning"
    CRITICAL = "critical"

class Severity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class ModelType(str, Enum):
    IMAGE_CLASSIFICATION = "image_classification"
    TIME_SERIES = "time_series"
    HYBRID = "hybrid"

class ModelStatus(str, Enum):
    TRAINING = "training"
    ACTIVE = "active"
    ARCHIVED = "archived"
    FAILED = "failed"

# Base schemas
class ModelBase(BaseModel):
    """Base model with common configuration for all schemas"""
    class Config:
        orm_mode = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }

class ResponseBase(ModelBase):
    """Base response model with success flag and message"""
    success: bool = True
    message: Optional[str] = None

class PaginatedResponse(ResponseBase):
    """Base response model for paginated results"""
    total: int
    page: int
    page_size: int
    total_pages: int

class TokenData(ModelBase):
    """Token data model for JWT authentication"""
    username: Optional[str] = None
    user_id: Optional[int] = None
    scopes: List[str] = []

class Token(ModelBase):
    """JWT token response model"""
    access_token: str
    token_type: str = "bearer"

class HealthCheck(ResponseBase):
    """Health check response model"""
    status: str = "ok"
    version: str = "1.0.0"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
