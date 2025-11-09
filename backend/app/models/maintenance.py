from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from ..database import Base
import enum

class MaintenanceStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class MaintenanceType(str, enum.Enum):
    PREVENTIVE = "preventive"
    CORRECTIVE = "corrective"
    PREDICTIVE = "predictive"

class MaintenanceSchedule(Base):
    __tablename__ = "maintenance_schedule"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id"), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    completed_time = Column(DateTime, nullable=True)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.SCHEDULED)
    maintenance_type = Column(Enum(MaintenanceType), default=MaintenanceType.PREVENTIVE)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    machine = relationship("Machine", back_populates="maintenance_schedules")
    tasks = relationship("MaintenanceTask", back_populates="schedule")

class MaintenanceTask(Base):
    __tablename__ = "maintenance_tasks"

    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("maintenance_schedule.id"), nullable=False)
    technician_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.SCHEDULED)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    schedule = relationship("MaintenanceSchedule", back_populates="tasks")
    technician = relationship("User", back_populates="assigned_tasks")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("maintenance_schedule.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    schedule = relationship("MaintenanceSchedule")
    user = relationship("User")

class MaintenancePart(Base):
    __tablename__ = "maintenance_parts"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("maintenance_tasks.id"), nullable=False)
    part_name = Column(String(200), nullable=False)
    part_number = Column(String(100), nullable=True)
    quantity = Column(Integer, default=1)
    replaced = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    
    # Relationships
    task = relationship("MaintenanceTask")
