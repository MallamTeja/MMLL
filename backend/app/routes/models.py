from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from app.services.model_service import ModelService
from app.core.security import get_current_active_user
from app.schemas.user import User

router = APIRouter()
model_service = ModelService()

class ModelCreate(BaseModel):
    model_type: str = Field(..., description="Type of model to train (e.g., 'lstm')")
    machine_id: Optional[int] = Field(None, description="Optional machine ID to train on specific machine data")
    epochs: int = Field(50, description="Number of training epochs")
    batch_size: int = Field(32, description="Training batch size")

class ModelResponse(BaseModel):
    id: int
    name: str
    model_type: str
    created_at: datetime
    metrics: dict
    file_path: str

    class Config:
        orm_mode = True

@router.post("/train", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
asdef train_model(
    model_data: ModelCreate,
    current_user: User = Depends(get_current_active_user)
):
    """
    Train a new model with the specified parameters
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can train models"
        )
    
    try:
        result = await model_service.train_model(
            model_type=model_data.model_type,
            machine_id=model_data.machine_id,
            epochs=model_data.epochs,
            batch_size=model_data.batch_size
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error training model: {str(e)}"
        )

@router.get("/", response_model=List[ModelResponse])
async def list_models(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user)
):
    """
    List all trained models with pagination
    """
    models = await model_service.get_models(skip=skip, limit=limit)
    return models

@router.get("/{model_id}", response_model=ModelResponse)
async def get_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get details of a specific model by ID
    """
    model = await model_service.get_model(model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    return model

@router.delete("/{model_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a trained model
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can delete models"
        )
    
    success = await model_service.delete_model(model_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found or could not be deleted"
        )
    return None

@router.post("/{model_id}/rollback")
async def rollback_to_model(
    model_id: int,
    current_user: User = Depends(get_current_active_user)
):
    """
    Rollback to a previous model version
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only administrators can rollback models"
        )
    
    # Implementation would update the active model reference
    return {"status": "success", "message": f"Rolled back to model {model_id}"}

# Add model prediction endpoint
@router.post("/{model_id}/predict")
async def predict_with_model(
    model_id: int,
    data: dict,  # Should be replaced with proper Pydantic model
    current_user: User = Depends(get_current_active_user)
):
    """
    Make predictions using a trained model
    """
    # Get model details
    model = await model_service.get_model(model_id)
    if not model:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Model not found"
        )
    
    # Here you would add the prediction logic
    # For now, return a mock response
    return {
        "model_id": model_id,
        "model_name": model["name"],
        "prediction": 0.85,  # Mock prediction
        "confidence": 0.92   # Mock confidence
    }
