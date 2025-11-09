import logging
import os
import time
from pathlib import Path
from typing import Dict, List, Optional
import uuid
from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, Response
import uvicorn
from prometheus_fastapi_instrumentator import Instrumentator

from .database import engine, Base, get_db
from . import models
from .middleware.rate_limiter import RateLimiter
from .middleware.monitoring import MonitoringMiddleware
from .core.logging_config import setup_logging

# Initialize logging
logger = setup_logging()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CNC Tool Wear Predictive Maintenance API",
    description="API for monitoring and predicting CNC tool wear",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Add monitoring middleware
app.add_middleware(MonitoringMiddleware)

# Add rate limiting middleware (100 requests per minute per IP)
app.add_middleware(RateLimiter, requests=100, window=60)

# CORS middleware with more restrictive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # In production, specify exact headers needed
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# Add security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    # Add request ID for tracing
    request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url}",
        extra={
            'request_id': request_id,
            'method': request.method,
            'url': str(request.url),
            'client': request.client.host if request.client else None
        }
    )
    
    # Process request
    start_time = time.time()
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Add security headers
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.url} - {response.status_code} ({process_time:.2f}s)",
            extra={
                'request_id': request_id,
                'status_code': response.status_code,
                'process_time': process_time
            }
        )
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"Error processing request: {str(e)}",
            extra={
                'request_id': request_id,
                'error': str(e),
                'process_time': process_time
            },
            exc_info=True
        )
        raise

# Mount static files directory
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Import and include routers
from .routes import (
    auth, machine, sensor,
    prediction, alert,
    maintenance, metrics,
    models
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(machine.router, prefix="/api/machines", tags=["Machines"])
app.include_router(sensor.router, prefix="/api/sensors", tags=["Sensors"])
app.include_router(prediction.router, prefix="/api/predictions", tags=["Predictions"])
app.include_router(alert.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(maintenance.router, prefix="/api/maintenance", tags=["Maintenance"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["Metrics"])
app.include_router(models.router, prefix="/api/models", tags=["Models"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to CNC Tool Wear Predictive Maintenance API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
