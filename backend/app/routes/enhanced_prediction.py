from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from datetime import datetime

from .. import models, schemas
from ..database import get_db
from ..schemas.validation import ImageUpload, SensorDataCreate, PredictionRequest
from ..services.prediction_service import predict_from_image, predict_from_sensor_data

router = APIRouter(
    prefix="/api/v2/predictions",
    tags=["Enhanced Predictions"],
    responses={
        400: {"description": "Bad Request"},
        401: {"description": "Unauthorized"},
        429: {"description": "Too Many Requests"},
        500: {"description": "Internal Server Error"},
    },
)

@router.post("/image/{machine_id}", response_model=schemas.PredictionInDB)
async def enhanced_predict_from_image(
    machine_id: int,
    image: UploadFile = File(...),
    request: PredictionRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Enhanced prediction endpoint for image-based tool wear analysis with validation.
    
    - **machine_id**: ID of the machine
    - **image**: Image file of the tool
    - **model_version**: Version of the model to use (default: latest)
    - **confidence_threshold**: Minimum confidence score (0.5-1.0)
    """
    try:
        # Validate file type
        file_ext = os.path.splitext(image.filename)[1].lower()
        if file_ext not in ['.jpg', '.jpeg', '.png']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only JPG and PNG images are supported"
            )
        
        # Save the uploaded file
        file_path = f"static/uploads/{uuid.uuid4()}{file_ext}"
        with open(file_path, "wb") as buffer:
            buffer.write(await image.read())
        
        # Make prediction
        prediction_result = await predict_from_image(
            image_path=file_path,
            model_version=request.model_version,
            confidence_threshold=request.confidence_threshold
        )
        
        # Save to database
        db_prediction = models.Prediction(
            machine_id=machine_id,
            input_type="image",
            input_file=file_path,
            rul_hours=prediction_result.rul_hours,
            wear_category=prediction_result.wear_category,
            summary=prediction_result.summary,
            confidence=prediction_result.confidence,
            created_by=current_user.id,
            created_on=datetime.utcnow()
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return db_prediction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing prediction: {str(e)}"
        )

@router.post("/sensor/{machine_id}", response_model=schemas.PredictionInDB)
async def enhanced_predict_from_sensor(
    machine_id: int,
    sensor_data: SensorDataCreate,
    request: PredictionRequest = Depends(),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Enhanced prediction endpoint for sensor data analysis with validation.
    """
    try:
        # Make prediction
        prediction_result = await predict_from_sensor_data(
            sensor_data=sensor_data,
            model_version=request.model_version,
            confidence_threshold=request.confidence_threshold
        )
        
        # Save to database
        db_prediction = models.Prediction(
            machine_id=machine_id,
            input_type="sensor",
            input_file=None,  # Or store sensor data path if needed
            rul_hours=prediction_result.rul_hours,
            wear_category=prediction_result.wear_category,
            summary=prediction_result.summary,
            confidence=prediction_result.confidence,
            created_by=current_user.id,
            created_on=datetime.utcnow()
        )
        db.add(db_prediction)
        db.commit()
        db.refresh(db_prediction)
        
        return db_prediction
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing sensor prediction: {str(e)}"
        )
