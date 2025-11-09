from fastapi import APIRouter, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LINUX
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/metrics", include_in_schema=False)
async def metrics():
    """Expose Prometheus metrics"""
    try:
        return Response(
            content=generate_latest(),
            media_type=CONTENT_TYPE_LINUX
        )
    except Exception as e:
        logger.error(f"Error generating metrics: {str(e)}")
        return Response(
            status_code=500,
            content="Error generating metrics"
        )
