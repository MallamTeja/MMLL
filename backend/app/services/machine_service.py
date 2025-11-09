from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging

from .. import models, schemas
from .base_service import BaseService

logger = logging.getLogger(__name__)

class MachineService:
    """Service class for machine-related operations"""
    
    def __init__(self):
        self.machine_service = BaseService[models.Machine, schemas.MachineCreate, schemas.MachineUpdate](models.Machine)
        self.maintenance_service = BaseService[models.MaintenanceTask, schemas.MaintenanceTaskCreate, schemas.MaintenanceTaskUpdate](models.MaintenanceTask)
    
    # Machine CRUD operations
    def get_machine(self, db: Session, machine_id: int) -> Optional[models.Machine]:
        """Get a machine by ID"""
        return self.machine_service.get(db, machine_id)
    
    def get_machine_by_name(self, db: Session, name: str) -> Optional[models.Machine]:
        """Get a machine by name"""
        return db.query(models.Machine).filter(models.Machine.name == name).first()
    
    def get_machines(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> Tuple[List[models.Machine], int]:
        """Get paginated list of machines with optional filtering"""
        return self.machine_service.get_multi_paginated(
            db, skip=skip, limit=limit, **filters
        )
    
    def create_machine(
        self, 
        db: Session, 
        machine: schemas.MachineCreate
    ) -> models.Machine:
        """Create a new machine"""
        db_machine = models.Machine(**machine.dict())
        db.add(db_machine)
        db.commit()
        db.refresh(db_machine)
        return db_machine
    
    def update_machine(
        self, 
        db: Session, 
        machine_id: int, 
        machine_update: schemas.MachineUpdate
    ) -> models.Machine:
        """Update a machine"""
        db_machine = self.get_machine(db, machine_id)
        if not db_machine:
            return None
            
        update_data = machine_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_machine, field, value)
            
        db_machine.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_machine)
        return db_machine
    
    def delete_machine(self, db: Session, machine_id: int) -> bool:
        """Delete a machine"""
        db_machine = self.get_machine(db, machine_id)
        if not db_machine:
            return False
            
        db.delete(db_machine)
        db.commit()
        return True
    
    # Maintenance Task operations
    def create_maintenance_task(
        self,
        db: Session,
        machine_id: int,
        task: schemas.MaintenanceTaskCreate
    ) -> models.MaintenanceTask:
        """Create a new maintenance task for a machine"""
        db_task = models.MaintenanceTask(
            machine_id=machine_id,
            **task.dict(exclude_unset=True)
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        # Update machine status if needed
        if task.type == schemas.MaintenanceType.EMERGENCY:
            machine = self.get_machine(db, machine_id)
            if machine:
                machine.status = schemas.Status.MAINTENANCE.value
                db.commit()
        
        return db_task
    
    def get_maintenance_tasks(
        self,
        db: Session,
        machine_id: int,
        skip: int = 0,
        limit: int = 100,
        completed: bool = None
    ) -> Tuple[List[models.MaintenanceTask], int]:
        """Get maintenance tasks for a machine"""
        query = db.query(models.MaintenanceTask).filter(
            models.MaintenanceTask.machine_id == machine_id
        )
        
        if completed is not None:
            query = query.filter(models.MaintenanceTask.completed == completed)
        
        total = query.count()
        items = query.offset(skip).limit(limit).all()
        
        return items, total
    
    # Machine Health and Statistics
    def get_machine_health(
        self, 
        db: Session, 
        machine_id: int
    ) -> Optional[schemas.MachineHealthStats]:
        """Get health statistics for a machine"""
        machine = self.get_machine(db, machine_id)
        if not machine:
            return None
        
        # Calculate uptime percentage (simplified example)
        # In a real application, this would query actual uptime data
        uptime_percentage = 95.0  # Placeholder
        
        # Get the latest prediction if available
        latest_prediction = (
            db.query(models.Prediction)
            .filter(models.Prediction.machine_id == machine_id)
            .order_by(models.Prediction.prediction_time.desc())
            .first()
        )
        
        # Get alert counts
        alert_counts = {
            severity: db.query(models.Alert).filter(
                models.Alert.machine_id == machine_id,
                models.Alert.severity == severity
            ).count()
            for severity in ["critical", "warning", "info"]
        }
        
        # Get sensor statistics (simplified example)
        sensor_stats = {}
        sensor_readings = (
            db.query(models.SensorData)
            .filter(models.SensorData.machine_id == machine_id)
            .order_by(models.SensorData.timestamp.desc())
            .limit(1000)  # Last 1000 readings
            .all()
        )
        
        if sensor_readings:
            sensor_fields = ["temperature", "vibration", "pressure", "rpm", "current", "voltage"]
            for field in sensor_fields:
                values = [getattr(r, field) for r in sensor_readings if getattr(r, field) is not None]
                if values:
                    sensor_stats[field] = {
                        "min": min(values),
                        "max": max(values),
                        "avg": sum(values) / len(values),
                        "latest": values[0] if values else None
                    }
        
        return schemas.MachineHealthStats(
            machine_id=machine_id,
            status=machine.status,
            uptime_percentage=uptime_percentage,
            avg_rul=latest_prediction.rul_hours if latest_prediction else None,
            last_prediction_time=latest_prediction.prediction_time if latest_prediction else None,
            alert_count=alert_counts,
            sensor_stats=sensor_stats
        )
    
    def get_machines_health_status(
        self,
        db: Session,
        machine_ids: List[int] = None
    ) -> Dict[int, schemas.MachineHealthStats]:
        """Get health status for multiple machines"""
        query = db.query(models.Machine)
        if machine_ids:
            query = query.filter(models.Machine.id.in_(machine_ids))
        
        machines = query.all()
        return {
            machine.id: self.get_machine_health(db, machine.id)
            for machine in machines
        }

# Create a single instance of MachineService
machine_service = MachineService()
