from pydantic import BaseModel, Field, HttpUrl, validator
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum
from .base import ModelBase, ResponseBase, PaginatedResponse

# Enums for prediction-related types
class WearCategory(str, Enum):
    NORMAL = "normal"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"
    FAILED = "failed"

class PredictionSourceType(str, Enum):
    IMAGE = "image"
    SENSOR = "sensor"
    HYBRID = "hybrid"

# Base schemas
class PredictionBase(ModelBase):
    """Base schema for prediction data"""
    machine_id: int = Field(..., description="ID of the machine this prediction is for")
    model_id: int = Field(..., description="ID of the model used for this prediction")
    source_type: PredictionSourceType = Field(..., description="Type of input data used for prediction")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Model's confidence in the prediction")
    
    # Prediction results
    rul_hours: float = Field(..., ge=0.0, description="Predicted remaining useful life in hours")
    wear_category: WearCategory = Field(..., description="Predicted wear category")
    
    # Additional metadata
    metadata: Optional[Dict[str, Any]] = Field(
        None,
        description="Additional prediction metadata including feature importance, model parameters, etc."
    )
    notes: Optional[str] = Field(None, description="Optional notes about the prediction")

class PredictionCreate(PredictionBase):
    """Schema for creating a new prediction"""
    image_id: Optional[int] = Field(
        None, 
        description="ID of the image data used for prediction (if source_type is IMAGE or HYBRID)"
    )
    sensor_data_id: Optional[int] = Field(
        None,
        description="ID of the sensor data used for prediction (if source_type is SENSOR or HYBRID)"
    )

class PredictionUpdate(ModelBase):
    """Schema for updating a prediction"""
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0)
    rul_hours: Optional[float] = Field(None, ge=0.0)
    wear_category: Optional[WearCategory] = None
    notes: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class PredictionInDB(PredictionBase):
    """Schema for prediction data as stored in the database"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Response schemas
class PredictionResponse(ResponseBase):
    """Response schema for a single prediction"""
    data: PredictionInDB

class PredictionListResponse(PaginatedResponse):
    """Response schema for a list of predictions with pagination"""
    items: List[PredictionInDB]

# Detailed prediction result with explanations
class FeatureImportance(ModelBase):
    """Schema for feature importance scores"""
    feature_name: str
    importance_score: float
    description: Optional[str] = None

class PredictionExplanation(ModelBase):
    """Schema for prediction explanations and feature importance"""
    prediction_id: int
    feature_importances: List[FeatureImportance]
    decision_path: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Decision path or explanation for the prediction"
    )
    confidence_interval: Optional[Dict[str, float]] = Field(
        None,
        description="Confidence interval for the RUL prediction"
    )

class DetailedPredictionResponse(PredictionResponse):
    """Response with detailed prediction information including explanations"""
    explanation: Optional[PredictionExplanation] = None

# Batch prediction schemas
class BatchPredictionRequest(ModelBase):
    """Schema for batch prediction requests"""
    machine_ids: List[int] = Field(
        ...,
        description="List of machine IDs to generate predictions for"
    )
    model_id: Optional[int] = Field(
        None,
        description="ID of the model to use. If not provided, the latest active model will be used."
    )
    use_latest_data: bool = Field(
        True,
        description="Whether to use the most recent data for each machine"
    )

class BatchPredictionResponse(ResponseBase):
    """Response schema for batch predictions"""
    predictions: List[PredictionInDB]
    total_processed: int
    success_count: int
    failed_count: int
    errors: Optional[Dict[int, str]] = Field(
        None,
        description="Mapping of machine IDs to error messages for failed predictions"
    )

# Prediction statistics
class PredictionStats(ModelBase):
    """Schema for prediction statistics"""
    total_predictions: int = 0
    avg_confidence: Optional[float] = None
    avg_rul: Optional[float] = None
    category_distribution: Dict[str, int] = Field(
        default_factory=lambda: {cat.value: 0 for cat in WearCategory}
    )
    prediction_trend: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Trend of predictions over time"
    )

class PredictionStatsResponse(ResponseBase):
    """Response schema for prediction statistics"""
    data: PredictionStats
