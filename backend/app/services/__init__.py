# Import all services to make them available
from .base_service import BaseService
from .machine_service import MachineService

# Create service instances
machine_service = MachineService()
