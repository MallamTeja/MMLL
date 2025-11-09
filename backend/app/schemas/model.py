from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from .base import ResponseBase
from ..models.model import ModelType, ModelStatus

class ModelBase(BaseModel):
    name: str
    version: str
    model_type: ModelType
    status: ModelStatus = ModelStatus.TRAINING
    file_path: str
    metrics: Optional[Dict[str, Any]] = None
    trained_on_data_until: Optional[datetime] = None
    training_parameters: Optional[Dict[str, Any]] = None
    description: Optional[str] = None
    is_active: bool = False
    previous_version_id: Optional[int] = None

class ModelCreate(ModelBase):
    pass

class ModelUpdate(BaseModel):
    status: Optional[ModelStatus] = None
    metrics: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None
    description: Optional[str] = None

class ModelInDBBase(ModelBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class Model(ModelInDBBase):
    pass

class ModelInDB(ModelInDBBase):
    pass

class ModelResponse(ResponseBase):
    data: Model

class ModelListResponse(ResponseBase):
    data: List[Model]

class ModelDeployRequest(BaseModel):
    model_id: int
    is_active: bool = True

class ModelMetrics(BaseModel):
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    loss: Optional[float] = None
    confusion_matrix: Optional[List[List[int]]] = None
    roc_auc: Optional[float] = None
    training_time_seconds: Optional[float] = None
    inference_time_ms: Optional[float] = None

class ModelTrainingRequest(BaseModel):
    name: str
    model_type: ModelType
    training_parameters: Dict[str, Any]
    dataset_path: str
    test_size: float = 0.2
    random_state: int = 42
    description: Optional[str] = None
