from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app import models, schemas
from app.database import get_db
from app.core.security import get_current_active_user

router = APIRouter(prefix="/machines", tags=["machines"])

@router.get("/", response_model=List[schemas.Machine])
def read_machines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Retrieve all machines with pagination.
    """
    if not current_user.is_operator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    machines = db.query(models.Machine).offset(skip).limit(limit).all()
    return machines

@router.post("/", response_model=schemas.Machine, status_code=status.HTTP_201_CREATED)
def create_machine(
    machine: schemas.MachineCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Create a new machine.
    """
    if not current_user.is_engineer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_machine = models.Machine(**machine.dict())
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.get("/{machine_id}", response_model=schemas.Machine)
def read_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get a specific machine by ID.
    """
    if not current_user.is_operator:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    return db_machine

@router.put("/{machine_id}", response_model=schemas.Machine)
def update_machine(
    machine_id: int,
    machine: schemas.MachineUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update a machine's information.
    """
    if not current_user.is_engineer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    update_data = machine.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_machine, field, value)
    
    db.add(db_machine)
    db.commit()
    db.refresh(db_machine)
    return db_machine

@router.delete("/{machine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Delete a machine.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if db_machine is None:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    db.delete(db_machine)
    db.commit()
    return None
