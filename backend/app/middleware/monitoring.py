import time
import logging
from fastapi import Request, Response
from typing import Callable, Awaitable
from prometheus_client import Counter, Histogram, Gauge

logger = logging.getLogger(__name__)

# Prometheus metrics
REQUEST_COUNT = Counter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'endpoint', 'http_status']
)

REQUEST_LATENCY = Histogram(
    'http_request_duration_seconds',
    'HTTP request latency in seconds',
    ['method', 'endpoint']
)

REQUESTS_IN_PROGRESS = Gauge(
    'http_requests_in_progress',
    'Number of HTTP requests currently in progress',
    ['method', 'endpoint']
)

class MonitoringMiddleware:
    """Middleware for monitoring request metrics"""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
            
        request = Request(scope, receive=receive)
        method = request.method
        endpoint = request.url.path
        
        # Skip metrics endpoint to avoid polluting metrics
        if endpoint == '/metrics':
            return await self.app(scope, receive, send)
        
        # Track request in progress
        REQUESTS_IN_PROGRESS.labels(method=method, endpoint=endpoint).inc()
        start_time = time.time()
        
        async def send_wrapper(message):
            if message['type'] == 'http.response.start':
                status_code = message['status']
                # Record request count and latency
                REQUEST_COUNT.labels(
                    method=method,
                    endpoint=endpoint,
                    http_status=status_code
                ).inc()
                
                request_time = time.time() - start_time
                REQUEST_LATENCY.labels(
                    method=method,
                    endpoint=endpoint
                ).observe(request_time)
                
                # Log slow requests
                if request_time > 1.0:  # Log requests slower than 1 second
                    logger.warning(
                        f"Slow request: {method} {endpoint} took {request_time:.2f}s"
                    )
            
            return await send(message)
        
        try:
            response = await self.app(scope, receive, send_wrapper)
            return response
        except Exception as e:
            # Record error in metrics
            REQUEST_COUNT.labels(
                method=method,
                endpoint=endpoint,
                http_status=500
            ).inc()
            raise
        finally:
            # Decrement in-progress counter
            REQUESTS_IN_PROGRESS.labels(method=method, endpoint=endpoint).dec()
