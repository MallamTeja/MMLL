from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services import machine_service

router = APIRouter(
    prefix="/machines",
    tags=["machines"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=schemas.MachineListResponse)
async def list_machines(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all machines with pagination"""
    machines, total = machine_service.get_machines(db, skip=skip, limit=limit)
    return {
        "items": machines,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit
    }

@router.post("/", response_model=schemas.MachineResponse, status_code=status.HTTP_201_CREATED)
async def create_machine(
    machine: schemas.MachineCreate, 
    db: Session = Depends(get_db)
):
    """Create a new machine"""
    db_machine = machine_service.get_machine_by_name(db, name=machine.name)
    if db_machine:
        raise HTTPException(
            status_code=400, 
            detail="Machine with this name already exists"
        )
    return {"data": machine_service.create_machine(db=db, machine=machine)}

@router.get("/{machine_id}", response_model=schemas.MachineResponse)
async def read_machine(
    machine_id: int, 
    db: Session = Depends(get_db)
):
    """Get a specific machine by ID"""
    db_machine = machine_service.get_machine(db, machine_id=machine_id)
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return {"data": db_machine}

@router.put("/{machine_id}", response_model=schemas.MachineResponse)
async def update_machine(
    machine_id: int, 
    machine_update: schemas.MachineUpdate, 
    db: Session = Depends(get_db)
):
    """Update a machine"""
    db_machine = machine_service.get_machine(db, machine_id=machine_id)
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    return {
        "data": machine_service.update_machine(
            db=db, 
            machine_id=machine_id, 
            machine_update=machine_update
        )
    }

@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_machine(
    machine_id: int, 
    db: Session = Depends(get_db)
):
    """Delete a machine"""
    db_machine = machine_service.get_machine(db, machine_id=machine_id)
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    machine_service.delete_machine(db=db, machine_id=machine_id)
    return None

@router.get("/{machine_id}/health", response_model=schemas.MachineHealthResponse)
async def get_machine_health(
    machine_id: int,
    db: Session = Depends(get_db)
):
    """Get health statistics for a machine"""
    health_stats = machine_service.get_machine_health(db, machine_id=machine_id)
    if not health_stats:
        raise HTTPException(status_code=404, detail="Machine not found")
    return {"data": health_stats}

# Maintenance tasks endpoints
@router.post("/{machine_id}/maintenance-tasks", response_model=schemas.MaintenanceTaskResponse, status_code=201)
async def create_maintenance_task(
    machine_id: int,
    task: schemas.MaintenanceTaskCreate,
    db: Session = Depends(get_db)
):
    """Create a new maintenance task for a machine"""
    # Verify machine exists
    db_machine = machine_service.get_machine(db, machine_id=machine_id)
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    # Create the task
    return {
        "data": machine_service.create_maintenance_task(
            db=db, 
            machine_id=machine_id, 
            task=task
        )
    }

@router.get("/{machine_id}/maintenance-tasks", response_model=schemas.MaintenanceTaskListResponse)
async def list_maintenance_tasks(
    machine_id: int,
    skip: int = 0,
    limit: int = 100,
    completed: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """List maintenance tasks for a machine"""
    tasks, total = machine_service.get_maintenance_tasks(
        db=db,
        machine_id=machine_id,
        skip=skip,
        limit=limit,
        completed=completed
    )
    
    return {
        "items": tasks,
        "total": total,
        "page": skip // limit + 1,
        "page_size": limit,
        "total_pages": (total + limit - 1) // limit
    }
