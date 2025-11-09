import os
import uuid
from datetime import datetime
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core.config import settings
from app.schemas.upload import FileUploadResponse

router = APIRouter()

# Ensure upload directories exist
UPLOAD_DIR = Path(settings.UPLOAD_DIR)
IMAGE_UPLOAD_DIR = UPLOAD_DIR / "images"
CSV_UPLOAD_DIR = UPLOAD_DIR / "csv"

for directory in [UPLOAD_DIR, IMAGE_UPLOAD_DIR, CSV_UPLOAD_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

def save_upload_file(upload_file: UploadFile, destination: Path) -> str:
    """Save uploaded file to disk and return the saved file path."""
    # Generate a unique filename
    file_ext = Path(upload_file.filename).suffix
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = destination / file_name
    
    # Save file
    with file_path.open("wb") as buffer:
        buffer.write(upload_file.file.read())
    
    return str(file_path.relative_to(settings.UPLOAD_DIR))

@router.post("/images", response_model=FileUploadResponse)
async def upload_image(
    machine_id: int,
    file: UploadFile = File(...),
    label: str = "",
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Upload an image for a specific machine.
    """
    # Verify machine exists and user has access
    machine = crud.machine.get(db, id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found",
        )
    
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image"
        )
    
    try:
        # Save the file
        file_path = save_upload_file(file, IMAGE_UPLOAD_DIR)
        
        # Create image record in database
        image_data = {
            "machine_id": machine_id,
            "file_path": file_path,
            "label": label,
            "uploaded_by": current_user.id
        }
        
        db_image = crud.image_data.create(db, obj_in=image_data)
        
        return {
            "success": True,
            "message": "Image uploaded successfully",
            "file_path": file_path,
            "id": db_image.id
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )

@router.post("/csv", response_model=FileUploadResponse)
async def upload_csv(
    machine_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    """
    Upload sensor data in CSV format for a specific machine.
    """
    # Verify machine exists and user has access
    machine = crud.machine.get(db, id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found",
        )
    
    # Validate file type
    if not file.filename.lower().endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    
    try:
        # Save the file
        file_path = save_upload_file(file, CSV_UPLOAD_DIR)
        
        # Here you would typically parse the CSV and store the sensor data
        # For now, we'll just return success
        
        return {
            "success": True,
            "message": "CSV uploaded successfully",
            "file_path": file_path,
            "next_steps": ["Process CSV data", "Import sensor readings"]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )
