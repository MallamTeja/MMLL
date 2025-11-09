"""Base model definition for SQLAlchemy models."""
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models to ensure they are registered with SQLAlchemy
# This needs to be at the bottom to avoid circular imports
from .machine import Machine  # noqa: F401
from .image_data import ImageData  # noqa: F401
from .sensor_data import SensorData  # noqa: F401
from .prediction import Prediction  # noqa: F401
from .model import Model  # noqa: F401
from .alert import Alert  # noqa: F401
from .user import User, UserRole  # noqa: F401
from .maintenance import (  # noqa: F401
    MaintenanceTask,
    MaintenanceSchedule,
    MaintenanceLog,
    MaintenancePart,
    MaintenanceStatus,
    MaintenanceType
)
