from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app import models, schemas
from app.database import get_db
from app.core.security import get_current_active_user

router = APIRouter(prefix="/maintenance", tags=["maintenance"])

@router.get("/tasks", response_model=schemas.MaintenanceTaskListResponse)
def list_maintenance_tasks(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    machine_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    List all maintenance tasks with optional filtering.
    """
    query = db.query(models.MaintenanceTask)
    
    if status:
        query = query.filter(models.MaintenanceTask.status == status)
    if machine_id:
        query = query.filter(models.MaintenanceTask.machine_id == machine_id)
    
    tasks = query.offset(skip).limit(limit).all()
    return {"items": tasks}

@router.post("/tasks", response_model=schemas.MaintenanceTaskResponse, status_code=status.HTTP_201_CREATED)
def create_maintenance_task(
    task: schemas.MaintenanceTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Create a new maintenance task.
    """
    if not current_user.is_engineer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_task = models.MaintenanceTask(**task.dict(), created_by=current_user.id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {"data": db_task}

@router.get("/tasks/upcoming", response_model=schemas.MaintenanceTaskListResponse)
def get_upcoming_maintenance(
    days: int = Query(7, description="Number of days to look ahead"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get upcoming maintenance tasks within the specified number of days.
    """
    end_date = datetime.utcnow() + timedelta(days=days)
    tasks = db.query(models.MaintenanceTask).filter(
        models.MaintenanceTask.scheduled_date <= end_date,
        models.MaintenanceTask.completed == False
    ).all()
    
    return {"items": tasks}

@router.put("/tasks/{task_id}", response_model=schemas.MaintenanceTaskResponse)
def update_maintenance_task(
    task_id: int,
    task_update: schemas.MaintenanceTaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update a maintenance task.
    """
    db_task = db.query(models.MaintenanceTask).filter(models.MaintenanceTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    if not current_user.is_engineer and db_task.assigned_to != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    update_data = task_update.dict(exclude_unset=True)
    if 'completed' in update_data and update_data['completed']:
        update_data['completed_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(db_task, field, value)
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return {"data": db_task}

@router.delete("/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_maintenance_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Delete a maintenance task.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_task = db.query(models.MaintenanceTask).filter(models.MaintenanceTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    db.delete(db_task)
    db.commit()
    return None
