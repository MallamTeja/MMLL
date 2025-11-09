# Import Base first
from ..database import Base

# Import models that don't have foreign key dependencies first
from .machine import Machine
from .image_data import ImageData
from .sensor_data import SensorData
from .prediction import Prediction
from .model import Model
from .alert import Alert

# Import User model after other models to prevent circular imports
from .user import User, UserRole

# Import maintenance-related models after User model
from .maintenance import (
    MaintenanceTask,
    MaintenanceSchedule,
    MaintenanceLog,
    MaintenancePart,
    MaintenanceStatus,
    MaintenanceType
)

__all__ = [
    'Base',
    'Machine',
    'ImageData',
    'SensorData',
    'Prediction',
    'Model',
    'Alert',
    'User',
    'UserRole',
    'MaintenanceTask',
    'MaintenanceSchedule',
    'MaintenanceLog',
    'MaintenancePart',
    'MaintenanceStatus',
    'MaintenanceType'
]
