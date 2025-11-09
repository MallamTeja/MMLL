from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services import prediction_service
from ..api.deps import get_current_active_user

router = APIRouter()

@router.post("/image/{machine_id}", response_model=schemas.PredictionInDB)
async def predict_from_image_endpoint(
    machine_id: int,
    image: UploadFile = File(...),
    model_version: str = "latest",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Make a prediction from an uploaded image.
    
    This endpoint accepts an image file and returns a prediction result.
    The image should be in JPEG or PNG format.
    """
    # Check if user has permission to access this machine
    # (Implementation depends on your permission system)
    
    try:
        prediction = await prediction_service.predict_from_image(
            db=db,
            machine_id=machine_id,
            image_file=image,
            model_version=model_version,
            user_id=current_user.id
        )
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing prediction: {str(e)}"
        )

@router.post("/sensor/{machine_id}", response_model=schemas.PredictionInDB)
async def predict_from_sensor_data_endpoint(
    machine_id: int,
    sensor_data: schemas.SensorDataCreate,
    model_version: str = "latest",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Make a prediction from sensor data.
    
    This endpoint accepts sensor readings in JSON format and returns a prediction result.
    """
    # Check if user has permission to access this machine
    # (Implementation depends on your permission system)
    
    try:
        # Convert sensor data to dict for processing
        sensor_dict = sensor_data.dict()
        
        prediction = await prediction_service.predict_from_sensor_data(
            db=db,
            machine_id=machine_id,
            sensor_data=sensor_dict,
            model_version=model_version,
            user_id=current_user.id
        )
        return prediction
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing prediction: {str(e)}"
        )

@router.get("/", response_model=schemas.PredictionListResponse)
def list_predictions(
    machine_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    List predictions with optional filtering.
    
    Returns a paginated list of predictions, optionally filtered by machine_id.
    """
    try:
        predictions, total = prediction_service.get_predictions(
            db=db,
            machine_id=machine_id,
            skip=skip,
            limit=limit
        )
        
        return {
            "items": predictions,
            "total": total,
            "page": (skip // limit) + 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 0
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving predictions: {str(e)}"
        )

@router.get("/{prediction_id}", response_model=schemas.PredictionInDB)
def get_prediction(
    prediction_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get a specific prediction by ID.
    """
    prediction = db.query(models.Prediction).filter(
        models.Prediction.id == prediction_id
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found"
        )
    
    # Check if user has permission to access this prediction
    # (Implementation depends on your permission system)
    
    return prediction

@router.get("/machine/{machine_id}/latest", response_model=schemas.PredictionInDB)
def get_latest_prediction(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get the latest prediction for a specific machine.
    """
    prediction = db.query(models.Prediction).filter(
        models.Prediction.machine_id == machine_id
    ).order_by(
        models.Prediction.created_at.desc()
    ).first()
    
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No predictions found for this machine"
        )
    
    # Check if user has permission to access this machine
    # (Implementation depends on your permission system)
    
    return prediction

@router.get("/machine/{machine_id}/history", response_model=schemas.PredictionListResponse)
def get_prediction_history(
    machine_id: int,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get prediction history for a specific machine.
    
    Returns the most recent predictions for the specified machine.
    """
    try:
        predictions, total = prediction_service.get_predictions(
            db=db,
            machine_id=machine_id,
            skip=0,
            limit=limit
        )
        
        return {
            "items": predictions,
            "total": total,
            "page": 1,
            "page_size": limit,
            "total_pages": 1  # Since we're not implementing pagination for history
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving prediction history: {str(e)}"
        )
