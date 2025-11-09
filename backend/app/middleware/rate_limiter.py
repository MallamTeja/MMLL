from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from typing import Dict, List
import time

class RateLimiter:
    def __init__(self, requests: int = 100, window: int = 60):
        self.requests = requests
        self.window = window
        self.access_records: Dict[str, List[float]] = {}

    async def __call__(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()
        
        # Clean up old records
        if client_ip in self.access_records:
            self.access_records[client_ip] = [t for t in self.access_records[client_ip] 
                                           if current_time - t < self.window]
        else:
            self.access_records[client_ip] = []
        
        # Check rate limit
        if len(self.access_records[client_ip]) >= self.requests:
            retry_after = int(self.window - (current_time - self.access_records[client_ip][0]))
            headers = {
                "Retry-After": str(retry_after),
                "X-RateLimit-Limit": str(self.requests),
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(int(current_time + retry_after))
            }
            return JSONResponse(
                status_code=429,
                content={"detail": f"Too many requests. Please try again in {retry_after} seconds."},
                headers=headers
            )
        
        # Add current request timestamp
        self.access_records[client_ip].append(current_time)
        
        # Add rate limit headers to response
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.requests)
        response.headers["X-RateLimit-Remaining"] = str(self.requests - len(self.access_records[client_ip]))
        
        return response
