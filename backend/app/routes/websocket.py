from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from fastapi.responses import HTMLResponse
from typing import Optional
import json
import uuid
import asyncio
from datetime import datetime
import logging

from ..ws.manager import manager as ws_manager
from ..services.anomaly_service import detect_anomalies, get_recent_sensor_readings
from ..models.anomaly import AnomalyCreate, AnomalySeverity
from ..database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

# HTML page for testing WebSocket
html = """
<!DOCTYPE html>
<html>
    <head>
        <title>WebSocket Test</title>
    </head>
    <body>
        <h1>WebSocket Test</h1>
        <div id="messages"></div>
        <script>
            const ws = new WebSocket('ws://localhost:8000/ws/anomaly-detection');
            ws.onmessage = function(event) {
                const messages = document.getElementById('messages');
                const message = document.createElement('div');
                message.textContent = event.data;
                messages.appendChild(message);
            };
        </script>
    </body>
</html>
"""

@router.get("/ws-test")
async def websocket_test_page():
    return HTMLResponse(html)

@router.websocket("/ws/anomaly-detection")
async def websocket_anomaly_detection(
    websocket: WebSocket,
    machine_id: str = Query(..., description="Machine ID to monitor"),
    token: Optional[str] = Query(None, description="Authentication token"),
):
    """
    WebSocket endpoint for real-time anomaly detection.
    
    This endpoint maintains a persistent WebSocket connection to send real-time
    anomaly detection updates for the specified machine.
    """
    client_id = str(uuid.uuid4())
    
    # Authenticate the user (simplified example)
    user_id = None
    if token:
        # In a real app, validate the token and get user ID
        try:
            # user = verify_token(token)
            # user_id = user.id
            user_id = 1  # Placeholder for demo
        except Exception as e:
            await websocket.close(code=1008, reason="Invalid token")
            return
    
    # Accept the WebSocket connection
    await ws_manager.connect(websocket, client_id, user_id)
    
    try:
        # Send a welcome message
        await ws_manager.send_personal_message(
            json.dumps({
                "type": "connection_established",
                "message": "Connected to anomaly detection service",
                "machine_id": machine_id,
                "timestamp": datetime.utcnow().isoformat()
            }),
            client_id
        )
        
        # Main loop to send real-time updates
        while True:
            # Get the latest sensor data (in a real app, this would be from a message queue or database)
            db = next(get_db())
            sensor_data = get_recent_sensor_readings(db, machine_id, limit=10)
            
            # Detect anomalies in the sensor data
            anomalies = await detect_anomalies(sensor_data)
            
            # Send the anomalies to the client
            if anomalies:
                await ws_manager.send_personal_message(
                    json.dumps({
                        "type": "anomaly_detected",
                        "machine_id": machine_id,
                        "anomalies": [
                            {
                                "id": str(anomaly.id),
                                "sensor_type": anomaly.sensor_type,
                                "value": anomaly.value,
                                "severity": anomaly.severity,
                                "timestamp": anomaly.timestamp.isoformat(),
                                "suggested_action": anomaly.suggested_action
                            }
                            for anomaly in anomalies
                        ],
                        "timestamp": datetime.utcnow().isoformat()
                    }),
                    client_id
                )
            
            # Wait before the next update (e.g., every 5 seconds)
            await asyncio.sleep(5)
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {client_id}")
        ws_manager.disconnect(client_id)
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.close()
        except:
            pass
        ws_manager.disconnect(client_id)

# Add broadcast endpoint for server-initiated messages
@router.post("/ws/broadcast/{user_id}")
async def broadcast_message(
    user_id: int,
    message: dict,
):
    """
    Broadcast a message to all connections for a specific user.
    
    This endpoint allows the server to push notifications to specific users.
    """
    await ws_manager.broadcast_to_user(user_id, json.dumps(message))
    return {"status": "message_sent", "user_id": user_id, "message": message}

# Add this router to your main FastAPI app
# app.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])
