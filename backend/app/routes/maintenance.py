from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app import models, schemas, crud
from app.api.deps import get_db, get_current_active_user
from app.models.maintenance import MaintenanceStatus, MaintenanceType
from app.models.user import UserRole

router = APIRouter()

# Maintenance Schedules
@router.post("/schedules/", response_model=schemas.MaintenanceScheduleInDB)
def create_maintenance_schedule(
    schedule: schemas.MaintenanceScheduleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Create a new maintenance schedule.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.ENGINEER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return crud.create_maintenance_schedule(db=db, schedule=schedule, user_id=current_user.id)

@router.get("/schedules/", response_model=List[schemas.MaintenanceScheduleInDB])
def read_maintenance_schedules(
    skip: int = 0,
    limit: int = 100,
    machine_id: Optional[int] = None,
    status: Optional[MaintenanceStatus] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Retrieve maintenance schedules with optional filtering.
    """
    schedules = crud.get_maintenance_schedules(
        db, 
        skip=skip, 
        limit=limit,
        machine_id=machine_id,
        status=status
    )
    return schedules

@router.get("/schedules/upcoming", response_model=List[schemas.MaintenanceScheduleInDB])
def read_upcoming_maintenance(
    days_ahead: int = 7,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get upcoming maintenance schedules within the next X days.
    """
    return crud.get_upcoming_maintenance(db, days_ahead=days_ahead, limit=limit)

@router.get("/schedules/{schedule_id}", response_model=schemas.MaintenanceScheduleInDB)
def read_maintenance_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get a specific maintenance schedule by ID.
    """
    db_schedule = crud.get_maintenance_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    return db_schedule

@router.put("/schedules/{schedule_id}", response_model=schemas.MaintenanceScheduleInDB)
def update_maintenance_schedule(
    schedule_id: int,
    schedule_update: schemas.MaintenanceScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update a maintenance schedule.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.ENGINEER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    db_schedule = crud.get_maintenance_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    
    return crud.update_maintenance_schedule(
        db=db,
        db_schedule=db_schedule,
        schedule_update=schedule_update.dict(exclude_unset=True),
        user_id=current_user.id
    )

@router.delete("/schedules/{schedule_id}", response_model=schemas.MaintenanceScheduleInDB)
def delete_maintenance_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Delete a maintenance schedule.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin users can delete maintenance schedules"
        )
        
    db_schedule = crud.get_maintenance_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    
    return crud.delete_maintenance_schedule(db, schedule_id=schedule_id, user_id=current_user.id)

# Maintenance Tasks
@router.post("/schedules/{schedule_id}/tasks/", response_model=schemas.MaintenanceTaskInDB)
def create_maintenance_task(
    schedule_id: int,
    task: schemas.MaintenanceTaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Create a new maintenance task for a schedule.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.ENGINEER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    db_schedule = crud.get_maintenance_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    
    return crud.create_maintenance_task(
        db=db,
        task=task,
        schedule_id=schedule_id,
        user_id=current_user.id
    )

@router.put("/tasks/{task_id}", response_model=schemas.MaintenanceTaskInDB)
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
    if db_task is None:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    # Only allow task assignee or admin/engineer to update
    if (current_user.role not in [UserRole.ADMIN, UserRole.ENGINEER] and 
        db_task.technician_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this task"
        )
    
    return crud.update_maintenance_task(
        db=db,
        db_task=db_task,
        task_update=task_update.dict(exclude_unset=True),
        user_id=current_user.id
    )

# Maintenance Logs
@router.get("/schedules/{schedule_id}/logs", response_model=List[schemas.MaintenanceLogInDB])
def read_maintenance_logs(
    schedule_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get logs for a maintenance schedule.
    """
    db_schedule = crud.get_maintenance_schedule(db, schedule_id=schedule_id)
    if db_schedule is None:
        raise HTTPException(status_code=404, detail="Maintenance schedule not found")
    
    return crud.get_maintenance_logs(db, schedule_id=schedule_id, skip=skip, limit=limit)

# Maintenance Parts
@router.post("/tasks/{task_id}/parts/", response_model=schemas.MaintenancePartInDB)
def add_maintenance_part(
    task_id: int,
    part: schemas.MaintenancePartCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Add a part to a maintenance task.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.ENGINEER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
        
    db_task = db.query(models.MaintenanceTask).filter(models.MaintenanceTask.id == task_id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Maintenance task not found")
    
    return crud.add_maintenance_part(
        db=db,
        part=part,
        task_id=task_id
    )
