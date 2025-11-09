import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections and broadcasts messages to clients"""
    
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_connections: Dict[int, List[str]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str, user_id: Optional[int] = None):
        """Register a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        
        if user_id is not None:
            if user_id not in self.user_connections:
                self.user_connections[user_id] = []
            self.user_connections[user_id].append(client_id)
        
        logger.info(f"New WebSocket connection: {client_id} (User: {user_id})")
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            
            # Remove from user connections
            for user_id, connections in list(self.user_connections.items()):
                if client_id in connections:
                    connections.remove(client_id)
                    if not connections:
                        del self.user_connections[user_id]
                    break
        
        logger.info(f"WebSocket disconnected: {client_id}")
    
    async def send_personal_message(self, message: str, client_id: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_text(message)
            except Exception as e:
                logger.error(f"Error sending message to {client_id}: {str(e)}")
                self.disconnect(client_id)
    
    async def broadcast(self, message: str, exclude: Optional[List[str]] = None):
        """Send a message to all connected clients"""
        if exclude is None:
            exclude = []
            
        for client_id, connection in list(self.active_connections.items()):
            if client_id not in exclude:
                try:
                    await connection.send_text(message)
                except Exception as e:
                    logger.error(f"Error broadcasting to {client_id}: {str(e)}")
                    self.disconnect(client_id)
    
    async def send_to_user(self, user_id: int, message: str):
        """Send a message to all connections of a specific user"""
        if user_id in self.user_connections:
            for client_id in self.user_connections[user_id]:
                await self.send_personal_message(message, client_id)
    
    async def broadcast_alert(self, alert: dict):
        """Broadcast an alert to all connected clients"""
        message = json.dumps({
            "type": "alert",
            "data": alert
        })
        await self.broadcast(message)
    
    async def broadcast_system_message(self, message: str, level: str = "info"):
        """Broadcast a system message to all connected clients"""
        message = json.dumps({
            "type": "system",
            "level": level,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        })
        await self.broadcast(message)

# Create a singleton instance of the connection manager
manager = ConnectionManager()
