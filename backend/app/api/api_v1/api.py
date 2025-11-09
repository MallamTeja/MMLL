from fastapi import APIRouter

from app.api.api_v1.endpoints import auth, machines, maintenance, predictions, sensor_data, images, alerts

api_router = APIRouter()

# Include all API endpoints
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(machines.router, prefix="/machines", tags=["machines"])
api_router.include_router(maintenance.router, prefix="/maintenance", tags=["maintenance"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["predictions"])
api_router.include_router(sensor_data.router, prefix="/sensor-data", tags=["sensor-data"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
