import asyncio
import json
import logging
from typing import Dict, List, Set, Optional
from fastapi import WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from .. import schemas, crud
from .base_service import BaseService

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and message broadcasting."""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.machine_subscriptions: Dict[int, Set[str]] = {}
        self.user_connections: Dict[int, Set[str]] = {}
        self.connection_user_map: Dict[str, int] = {}
        self.connection_subscriptions: Dict[str, Set[int]] = {}
        
    async def connect(self, websocket: WebSocket, client_id: str, user_id: int):
        """Register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        self.connection_user_map[client_id] = user_id
        self.connection_subscriptions[client_id] = set()
        
        # Add to user's connections
        if user_id not in self.user_connections:
            self.user_connections[user_id] = set()
        self.user_connections[user_id].add(client_id)
        
        logger.info(f"Client {client_id} connected (User: {user_id})")
        
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection and clean up subscriptions."""
        if client_id in self.active_connections:
            # Remove from user connections
            user_id = self.connection_user_map.get(client_id)
            if user_id and user_id in self.user_connections:
                self.user_connections[user_id].discard(client_id)
                if not self.user_connections[user_id]:
                    del self.user_connections[user_id]
            
            # Remove from machine subscriptions
            if client_id in self.connection_subscriptions:
                for machine_id in self.connection_subscriptions[client_id]:
                    if machine_id in self.machine_subscriptions:
                        self.machine_subscriptions[machine_id].discard(client_id)
                        if not self.machine_subscriptions[machine_id]:
                            del self.machine_subscriptions[machine_id]
                del self.connection_subscriptions[client_id]
            
            # Remove from active connections
            del self.active_connections[client_id]
            if client_id in self.connection_user_map:
                del self.connection_user_map[client_id]
            
            logger.info(f"Client {client_id} disconnected")
    
    async def subscribe_to_machine(self, client_id: str, machine_id: int):
        """Subscribe a client to updates for a specific machine."""
        if client_id not in self.active_connections:
            raise ValueError("Unknown client ID")
            
        if machine_id not in self.machine_subscriptions:
            self.machine_subscriptions[machine_id] = set()
            
        self.machine_subscriptions[machine_id].add(client_id)
        self.connection_subscriptions[client_id].add(machine_id)
        
        logger.info(f"Client {client_id} subscribed to machine {machine_id}")
    
    async def unsubscribe_from_machine(self, client_id: str, machine_id: int):
        """Unsubscribe a client from updates for a specific machine."""
        if machine_id in self.machine_subscriptions and client_id in self.machine_subscriptions[machine_id]:
            self.machine_subscriptions[machine_id].discard(client_id)
            if client_id in self.connection_subscriptions:
                self.connection_subscriptions[client_id].discard(machine_id)
            
            if not self.machine_subscriptions[machine_id]:
                del self.machine_subscriptions[machine_id]
            
            logger.info(f"Client {client_id} unsubscribed from machine {machine_id}")
    
    async def broadcast_to_machine(self, machine_id: int, message: dict):
        """Send a message to all clients subscribed to a machine."""
        if machine_id not in self.machine_subscriptions:
            return
            
        message_json = json.dumps(message)
        disconnected = []
        
        for client_id in list(self.machine_subscriptions[machine_id]):
            try:
                await self.active_connections[client_id].send_text(message_json)
            except Exception as e:
                logger.error(f"Error sending to client {client_id}: {e}")
                disconnected.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected:
            self.disconnect(client_id)
    
    async def send_personal_message(self, client_id: str, message: dict):
        """Send a message to a specific client."""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except Exception as e:
                logger.error(f"Error sending to client {client_id}: {e}")
                self.disconnect(client_id)
    
    async def notify_machine_update(self, machine_id: int, update_type: str, data: dict):
        """Notify all clients about a machine update."""
        message = {
            "type": f"machine_{update_type}",
            "machine_id": machine_id,
            "timestamp": data.get("timestamp"),
            "data": data
        }
        await self.broadcast_to_machine(machine_id, message)
    
    async def notify_alert(self, alert: schemas.Alert):
        """Notify relevant users about a new alert."""
        message = {
            "type": "alert",
            "alert_id": alert.id,
            "machine_id": alert.machine_id,
            "severity": alert.severity,
            "message": alert.message,
            "timestamp": alert.timestamp.isoformat() if alert.timestamp else None,
            "data": alert.dict()
        }
        
        # Send to all users subscribed to this machine
        if alert.machine_id in self.machine_subscriptions:
            for client_id in list(self.machine_subscriptions[alert.machine_id]):
                await self.send_personal_message(client_id, message)
        
        # Send to admins/engineers if critical
        if alert.severity in ["critical", "high"]:
            # This would be enhanced to get actual admin/engineer user IDs
            admin_user_ids = [1]  # Placeholder - get from database
            for user_id in admin_user_ids:
                if user_id in self.user_connections:
                    for client_id in self.user_connections[user_id]:
                        await self.send_personal_message(client_id, message)

# Global WebSocket manager instance
websocket_manager = ConnectionManager()
