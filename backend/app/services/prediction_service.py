import logging
import os
import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any, Tuple, Union
from pathlib import Path

import numpy as np
import cv2
import pandas as pd
from fastapi import UploadFile, HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from pydantic import ValidationError

from .. import models, schemas
from ..config import settings
from ..schemas.validation import (
    MachineStatus, 
    SensorDataCreate,
    PredictionRequest,
    ImageUpload
)
from .base_service import BaseService
from .machine_service import machine_service

logger = logging.getLogger(__name__)

class PredictionService:
    """Enhanced service class for prediction operations with improved error handling and validation"""
    
    def __init__(self):
        self.base_service = BaseService[
            models.Prediction, 
            schemas.PredictionCreate, 
            schemas.PredictionUpdate
        ](models.Prediction)
        
        # Ensure upload directory exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        # Model cache
        self._model_cache = {}
        self._model_versions = self._get_available_models()
    
    async def predict_from_image(
        self,
        db: Session,
        machine_id: int,
        image_file: UploadFile,
        model_version: str = "latest",
        confidence_threshold: float = 0.7,
        user_id: Optional[int] = None
    ) -> models.Prediction:
        """
        Make a prediction from an uploaded image with enhanced validation and error handling
        
        Args:
            db: Database session
            machine_id: ID of the machine
            image_file: Uploaded image file
            model_version: Version of the model to use
            confidence_threshold: Minimum confidence score (0.0-1.0)
            user_id: Optional user ID making the request
            
        Returns:
            Prediction model instance
            
        Raises:
            HTTPException: For validation or processing errors
        """
        try:
            # Validate input parameters
            if not 0 <= confidence_threshold <= 1.0:
                raise ValueError("Confidence threshold must be between 0 and 1")
                
            # Verify machine exists and is active
            machine = machine_service.get_machine(db, machine_id)
            if not machine:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Machine with ID {machine_id} not found"
                )
                
            if machine.status == MachineStatus.MAINTENANCE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot make predictions for machines in maintenance"
                )
            
            # Validate file type and content
            if not image_file.content_type or not image_file.content_type.startswith('image/'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid file type. Only image files are accepted."
                )
            
            file_ext = Path(image_file.filename).suffix.lower()
            if file_ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unsupported file format. Allowed formats: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
                )
            
            # Load and validate image
            try:
                image_data = await image_file.read()
                image = cv2.imdecode(
                    np.frombuffer(image_data, np.uint8), 
                    cv2.IMREAD_COLOR
                )
                if image is None:
                    raise ValueError("Could not decode image")
            except Exception as e:
                logger.error(f"Error processing image: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid image file"
                )
            
            # Save the uploaded file
            filename = f"{uuid.uuid4()}{file_ext}"
            file_path = os.path.join(settings.UPLOAD_DIR, filename)
            with open(file_path, "wb") as f:
                f.write(image_data)
            
            # Load model if not in cache
            model = await self._load_model(model_version)
            
            # Make prediction (placeholder - implement actual model inference)
            prediction_result = self._predict_image(model, image)
            
            # Create prediction record
            prediction = models.Prediction(
                machine_id=machine_id,
                model_version=model_version,
                input_type="image",
                input_file=filename,
                prediction_data=jsonable_encoder(prediction_result),
                confidence=prediction_result.get("confidence", 0.0),
                created_by=user_id,
                created_at=datetime.utcnow()
            )
            
            db.add(prediction)
            db.commit()
            db.refresh(prediction)
            
            return prediction
            
        except HTTPException:
            raise
        except ValidationError as e:
            db.rollback()
            logger.error(f"Validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=jsonable_encoder(e.errors())
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Prediction error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An error occurred while processing the prediction"
            )
    
    async def _load_model(self, model_version: str):
        """Load a model with caching"""
        if model_version == "latest":
            model_version = self._model_versions[0]  # Get most recent version
            
        if model_version not in self._model_cache:
            # Load model here (implement actual model loading)
            self._model_cache[model_version] = None  # Replace with actual model
            
        return self._model_cache[model_version]
    
    def _get_available_models(self) -> List[str]:
        """Get list of available model versions"""
        # Implement logic to discover available models
        return ["v1.0.0"]  # Example
    
    def _predict_image(self, model, image: np.ndarray) -> Dict[str, Any]:
        """Run prediction on an image"""
        # Implement actual model inference
        return {
            "class": "normal",
            "confidence": 0.95,
            "defects": [],
            "metadata": {}
        }

# Create a singleton instance
prediction_service = PredictionService()
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {image_file.content_type} not allowed. "
                       f"Allowed types: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
        
        try:
            # Save uploaded file
            file_ext = os.path.splitext(image_file.filename)[1]
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            filename = f"pred_{machine_id}_{timestamp}{file_ext}"
            filepath = os.path.join(settings.UPLOAD_DIR, filename)
            
            with open(filepath, "wb") as buffer:
                buffer.write(await image_file.read())
            
            # Preprocess image
            processed_image = self._preprocess_image(filepath)
            
            # Make prediction (placeholder - integrate with actual model)
            prediction_result = self._predict_image(processed_image)
            
            # Save prediction to database
            prediction = models.Prediction(
                machine_id=machine_id,
                model_version=model_version,
                input_type="image",
                input_file=filename,
                prediction_result=prediction_result,
                confidence=prediction_result.get("confidence", 0.0),
                created_by=user_id
            )
            
            db.add(prediction)
            db.commit()
            db.refresh(prediction)
            
            # Check if we need to create an alert
            self._check_for_alert(db, prediction, machine_id, user_id)
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error processing image prediction: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing image: {str(e)}"
            )
    
    async def predict_from_sensor_data(
        self,
        db: Session,
        machine_id: int,
        sensor_data: Dict[str, float],
        model_version: str = "latest",
        user_id: Optional[int] = None
    ) -> models.Prediction:
        """Make a prediction from sensor data"""
        # Verify machine exists
        machine = machine_service.get_machine(db, machine_id)
        if not machine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Machine with ID {machine_id} not found"
            )
        
        try:
            # Preprocess sensor data
            processed_data = self._preprocess_sensor_data(sensor_data)
            
            # Make prediction (placeholder - integrate with actual model)
            prediction_result = self._predict_sensor_data(processed_data)
            
            # Save sensor data
            sensor_reading = models.SensorData(
                machine_id=machine_id,
                **sensor_data
            )
            db.add(sensor_reading)
            db.flush()  # Get the ID for the prediction
            
            # Save prediction to database
            prediction = models.Prediction(
                machine_id=machine_id,
                model_version=model_version,
                input_type="sensor",
                sensor_data_id=sensor_reading.id,
                prediction_result=prediction_result,
                confidence=prediction_result.get("confidence", 0.0),
                created_by=user_id
            )
            
            db.add(prediction)
            db.commit()
            db.refresh(prediction)
            
            # Check if we need to create an alert
            self._check_for_alert(db, prediction, machine_id, user_id)
            
            return prediction
            
        except Exception as e:
            logger.error(f"Error processing sensor prediction: {str(e)}", exc_info=True)
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error processing sensor data: {str(e)}"
            )
    
    def get_predictions(
        self,
        db: Session,
        machine_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100,
        **filters
    ) -> Tuple[List[models.Prediction], int]:
        """Get predictions with optional filtering"""
        query = db.query(models.Prediction)
        
        if machine_id is not None:
            query = query.filter(models.Prediction.machine_id == machine_id)
        
        # Apply additional filters
        for key, value in filters.items():
            if hasattr(models.Prediction, key):
                query = query.filter(getattr(models.Prediction, key) == value)
        
        total = query.count()
        predictions = query.offset(skip).limit(limit).all()
        
        return predictions, total
    
    def _preprocess_image(self, image_path: str) -> np.ndarray:
        """Preprocess image for model input"""
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image file")
        
        # Convert to RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Resize to model input size (adjust as needed)
        img = cv2.resize(img, (224, 224))
        
        # Normalize pixel values
        img = img.astype(np.float32) / 255.0
        
        return img
    
    def _preprocess_sensor_data(self, sensor_data: Dict[str, float]) -> np.ndarray:
        """Preprocess sensor data for model input"""
        # Define expected sensor fields
        expected_fields = [
            'temperature', 'vibration_x', 'vibration_y', 'vibration_z',
            'current', 'voltage', 'pressure', 'rpm'
        ]
        
        # Fill missing values with defaults
        processed = {}
        for field in expected_fields:
            processed[field] = sensor_data.get(field, 0.0)
        
        # Convert to numpy array (adjust as needed for your model)
        return np.array([processed[field] for field in expected_fields])
    
    def _predict_image(self, image: np.ndarray) -> Dict[str, Any]:
        """Make prediction from image (placeholder implementation)"""
        # TODO: Replace with actual model inference
        return {
            "class": "normal",
            "confidence": 0.95,
            "metadata": {
                "model": "cnn_v1",
                "inference_time_ms": 120
            }
        }
    
    def _predict_sensor_data(self, sensor_data: np.ndarray) -> Dict[str, Any]:
        """Make prediction from sensor data (placeholder implementation)"""
        # TODO: Replace with actual model inference
        return {
            "rul_hours": 150.5,  # Remaining useful life in hours
            "anomaly_score": 0.15,
            "confidence": 0.92,
            "metadata": {
                "model": "lstm_v1",
                "inference_time_ms": 50
            }
        }
    
    def _check_for_alert(
        self,
        db: Session,
        prediction: models.Prediction,
        machine_id: int,
        user_id: Optional[int] = None
    ) -> None:
        """Check if prediction requires an alert to be created"""
        try:
            result = prediction.prediction_result
            
            # Example alert conditions (customize based on your requirements)
            if result.get("confidence", 0) < 0.7:
                self._create_alert(
                    db=db,
                    machine_id=machine_id,
                    title="Low Prediction Confidence",
                    message=f"Prediction ID {prediction.id} has low confidence: {result.get('confidence'):.2f}",
                    severity="warning",
                    created_by=user_id
                )
            
            if result.get("anomaly_score", 0) > 0.8:
                self._create_alert(
                    db=db,
                    machine_id=machine_id,
                    title="High Anomaly Detected",
                    message=f"High anomaly score detected in prediction {prediction.id}",
                    severity="critical",
                    created_by=user_id
                )
            
            if result.get("rul_hours", float('inf')) < 24:  # Less than 24 hours RUL
                self._create_alert(
                    db=db,
                    machine_id=machine_id,
                    title="Critical RUL Warning",
                    message=f"Machine {machine_id} has critical remaining useful life: {result.get('rul_hours'):.1f} hours",
                    severity="critical",
                    created_by=user_id
                )
                
        except Exception as e:
            logger.error(f"Error checking for alerts: {str(e)}", exc_info=True)
    
    def _create_alert(
        self,
        db: Session,
        machine_id: int,
        title: str,
        message: str,
        severity: str = "info",
        created_by: Optional[int] = None
    ) -> models.Alert:
        """Helper method to create an alert"""
        alert = models.Alert(
            machine_id=machine_id,
            title=title,
            message=message,
            severity=severity,
            status="open",
            created_by=created_by
        )
        
        db.add(alert)
        db.commit()
        db.refresh(alert)
        
        # TODO: Send real-time notification
        
        return alert

# Create an instance of PredictionService
prediction_service = PredictionService()
