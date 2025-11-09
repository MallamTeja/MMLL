from sqlalchemy import Boolean, Column, Integer, String, DateTime, Enum
from sqlalchemy.orm import relationship  # Add this import
from sqlalchemy.sql import func
from datetime import datetime
from ..database import Base
import enum

# Rest of your file remains the same
class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ENGINEER = "engineer"
    OPERATOR = "operator"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean(), default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    alerts = relationship("Alert", back_populates="assigned_to_user")
    maintenance_tasks = relationship("MaintenanceTask", back_populates="assigned_to_user")

    def __repr__(self):
        return f"<User {self.username} ({self.role})>"
    
    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.ADMIN
    
    @property
    def is_engineer(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.ENGINEER]
    
    @property
    def is_operator(self) -> bool:
        return self.role in [UserRole.ADMIN, UserRole.ENGINEER, UserRole.OPERATOR]