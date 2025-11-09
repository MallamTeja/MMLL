from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.models.maintenance import (
    MaintenanceSchedule, 
    MaintenanceTask, 
    MaintenanceLog,
    MaintenancePart,
    MaintenanceStatus,
    MaintenanceType
)
from app.schemas.maintenance import (
    MaintenanceScheduleCreate, 
    MaintenanceTaskCreate,
    MaintenanceLogCreate,
    MaintenancePartCreate
)

def get_maintenance_schedule(db: Session, schedule_id: int):
    return db.query(MaintenanceSchedule).filter(MaintenanceSchedule.id == schedule_id).first()

def get_maintenance_schedules(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    machine_id: Optional[int] = None,
    status: Optional[MaintenanceStatus] = None
):
    query = db.query(MaintenanceSchedule)
    
    if machine_id is not None:
        query = query.filter(MaintenanceSchedule.machine_id == machine_id)
    if status is not None:
        query = query.filter(MaintenanceSchedule.status == status)
        
    return query.offset(skip).limit(limit).all()

def create_maintenance_schedule(
    db: Session, 
    schedule: MaintenanceScheduleCreate,
    user_id: int
):
    db_schedule = MaintenanceSchedule(
        **schedule.dict(exclude={"tasks"}),
        created_by=user_id
    )
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    
    # Log the creation
    log = MaintenanceLog(
        schedule_id=db_schedule.id,
        user_id=user_id,
        action="schedule_created",
        details=f"Maintenance schedule created for machine {db_schedule.machine_id}"
    )
    db.add(log)
    db.commit()
    
    return db_schedule

def update_maintenance_schedule(
    db: Session,
    db_schedule: MaintenanceSchedule,
    schedule_update: dict,
    user_id: int
):
    for field, value in schedule_update.items():
        setattr(db_schedule, field, value)
    
    db_schedule.updated_at = datetime.utcnow()
    db.add(db_schedule)
    
    # Log the update
    log = MaintenanceLog(
        schedule_id=db_schedule.id,
        user_id=user_id,
        action="schedule_updated",
        details="Maintenance schedule updated"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def delete_maintenance_schedule(db: Session, schedule_id: int, user_id: int):
    db_schedule = get_maintenance_schedule(db, schedule_id)
    if db_schedule:
        # Log the deletion before actually deleting
        log = MaintenanceLog(
            schedule_id=schedule_id,
            user_id=user_id,
            action="schedule_deleted",
            details="Maintenance schedule deleted"
        )
        db.add(log)
        db.delete(db_schedule)
        db.commit()
    return db_schedule

def create_maintenance_task(
    db: Session,
    task: MaintenanceTaskCreate,
    schedule_id: int,
    user_id: int
):
    db_task = MaintenanceTask(
        **task.dict(),
        schedule_id=schedule_id
    )
    db.add(db_task)
    
    # Log the task creation
    log = MaintenanceLog(
        schedule_id=schedule_id,
        user_id=user_id,
        action="task_created",
        details=f"Task created: {task.title}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def update_maintenance_task(
    db: Session,
    db_task: MaintenanceTask,
    task_update: dict,
    user_id: int
):
    for field, value in task_update.items():
        setattr(db_task, field, value)
    
    if 'completed' in task_update and task_update['completed']:
        db_task.completed_at = datetime.utcnow()
    
    db.add(db_task)
    
    # Log the task update
    log = MaintenanceLog(
        schedule_id=db_task.schedule_id,
        user_id=user_id,
        action="task_updated",
        details=f"Task updated: {db_task.title}"
    )
    db.add(log)
    
    db.commit()
    db.refresh(db_task)
    return db_task

def add_maintenance_part(
    db: Session,
    part: MaintenancePartCreate,
    task_id: int
):
    db_part = MaintenancePart(
        **part.dict(),
        task_id=task_id
    )
    db.add(db_part)
    db.commit()
    db.refresh(db_part)
    return db_part

def get_maintenance_logs(
    db: Session,
    schedule_id: int,
    skip: int = 0,
    limit: int = 100
):
    return db.query(MaintenanceLog)\
        .filter(MaintenanceLog.schedule_id == schedule_id)\
        .order_by(MaintenanceLog.created_at.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()

def get_upcoming_maintenance(
    db: Session,
    days_ahead: int = 7,
    limit: int = 10
):
    from datetime import datetime, timedelta
    
    end_date = datetime.utcnow() + timedelta(days=days_ahead)
    
    return db.query(MaintenanceSchedule)\
        .filter(
            MaintenanceSchedule.scheduled_time.between(
                datetime.utcnow(),
                end_date
            ),
            MaintenanceSchedule.status == MaintenanceStatus.SCHEDULED
        )\
        .order_by(MaintenanceSchedule.scheduled_time.asc())\
        .limit(limit)\
        .all()
