import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from fastapi import WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi import APIRouter
from sqlalchemy.orm import Session

from app import models, schemas, crud
from app.api import deps
from app.services.websocket_service import websocket_manager
from app.core.security import get_current_user_ws

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.machine_subscriptions: Dict[int, set] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            # Remove from all machine subscriptions
            for machine_id, clients in list(self.machine_subscriptions.items()):
                if client_id in clients:
                    clients.remove(client_id)
                if not clients:
                    del self.machine_subscriptions[machine_id]
            # Remove the connection
            del self.active_connections[client_id]

    async def subscribe_to_machine(self, client_id: str, machine_id: int):
        if machine_id not in self.machine_subscriptions:
            self.machine_subscriptions[machine_id] = set()
        self.machine_subscriptions[machine_id].add(client_id)

    async def unsubscribe_from_machine(self, client_id: str, machine_id: int):
        if machine_id in self.machine_subscriptions:
            self.machine_subscriptions[machine_id].discard(client_id)
            if not self.machine_subscriptions[machine_id]:
                del self.machine_subscriptions[machine_id]

    async def broadcast_to_machine(self, machine_id: int, message: Dict[str, Any]):
        if machine_id in self.machine_subscriptions:
            for client_id in list(self.machine_subscriptions[machine_id]):
                if client_id in self.active_connections:
                    try:
                        await self.active_connections[client_id].send_json(message)
                    except Exception as e:
                        print(f"Error sending to client {client_id}: {e}")
                        self.disconnect(client_id)

# Global WebSocket manager instance
manager = ConnectionManager()

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str, db: Session = Depends(deps.get_db)):
    """
    WebSocket endpoint for real-time communication.
    
    Expected message format:
    {
        "type": "subscribe|unsubscribe|command",
        "machine_id": int,  # Required for subscribe/unsubscribe
        "command": str,     # For command type
        "data": any         # Optional data
    }
    """
    # Accept the WebSocket connection
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Wait for any message from the client
            data = await websocket.receive_text()
            
            try:
                message = json.loads(data)
                message_type = message.get("type")
                
                if message_type == "subscribe" and "machine_id" in message:
                    # Subscribe to machine updates
                    machine_id = message["machine_id"]
                    await manager.subscribe_to_machine(client_id, machine_id)
                    await websocket.send_json({
                        "type": "subscription_update",
                        "status": "subscribed",
                        "machine_id": machine_id,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                elif message_type == "unsubscribe" and "machine_id" in message:
                    # Unsubscribe from machine updates
                    machine_id = message["machine_id"]
                    await manager.unsubscribe_from_machine(client_id, machine_id)
                    await websocket.send_json({
                        "type": "subscription_update",
                        "status": "unsubscribed",
                        "machine_id": machine_id,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    
                elif message_type == "command":
                    # Handle different commands
                    command = message.get("command")
                    if command == "ping":
                        await websocket.send_json({
                            "type": "pong",
                            "timestamp": datetime.utcnow().isoformat()
                        })
                    
            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format"
                })
            except Exception as e:
                await websocket.send_json({
                    "type": "error",
                    "message": str(e)
                })
                
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(client_id)

# Helper function to broadcast machine updates
async def broadcast_machine_update(machine_id: int, update_type: str, data: dict):
    """Broadcast a machine update to all subscribed clients."""
    message = {
        "type": f"machine_{update_type}",
        "machine_id": machine_id,
        "timestamp": datetime.utcnow().isoformat(),
        "data": data
    }
    await manager.broadcast_to_machine(machine_id, message)

# Helper function to broadcast alerts
async def broadcast_alert(alert: schemas.Alert):
    """Broadcast an alert to relevant clients."""
    message = {
        "type": "alert",
        "alert_id": alert.id,
        "machine_id": alert.machine_id,
        "severity": alert.severity,
        "message": alert.message,
        "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
        "data": alert.dict()
    }
    await manager.broadcast_to_machine(alert.machine_id, message)
