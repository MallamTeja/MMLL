"""Initialize all SQLAlchemy models to ensure they are registered with the Base metadata."""

# Import all models to ensure they are registered with SQLAlchemy
from .models.machine import Machine  # noqa: F401
from .models.image_data import ImageData  # noqa: F401
from .models.sensor_data import SensorData  # noqa: F401
from .models.prediction import Prediction  # noqa: F401
from .models.model import Model  # noqa: F401
from .models.alert import Alert  # noqa: F401
from .models.user import User, UserRole  # noqa: F401
from .models.maintenance import (  # noqa: F401
    MaintenanceTask,
    MaintenanceSchedule,
    MaintenanceLog,
    MaintenancePart,
    MaintenanceStatus,
    MaintenanceType
)
