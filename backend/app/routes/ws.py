import uuid
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from fastapi.responses import HTMLResponse

from ..ws.manager import manager as ws_manager
from ..services.auth_service import get_current_user_from_token
from ..models import User

router = APIRouter()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>WebSocket Test</title>
    </head>
    <body>
        <h1>WebSocket Test</h1>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            const clientId = Math.random().toString(36).substring(7);
            const ws = new WebSocket(`ws://localhost:8000/ws/${clientId}`);
            ws.onmessage = function(event) {
                const messages = document.getElementById('messages')
                const message = document.createElement('li')
                const content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                const input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""

@router.get("/test")
async def get():
    return HTMLResponse(html)

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint for real-time communication"""
    # Authenticate the user (optional, depending on your requirements)
    # token = websocket.query_params.get("token")
    # if not token:
    #     await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    #     return
        
    # try:
    #     # Validate token and get user
    #     user = await get_current_user_from_token(token)
    # except Exception as e:
    #     await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    #     return
    
    # For now, we'll use a simple client_id without authentication
    user_id = None  # Replace with actual user ID if authenticated
    
    # Register the connection
    await ws_manager.connect(websocket, client_id, user_id)
    
    try:
        while True:
            # Keep the connection alive
            data = await websocket.receive_text()
            
            # Handle incoming messages (if needed)
            # For now, just echo the message back
            await ws_manager.send_personal_message(f"Echo: {data}", client_id)
            
    except WebSocketDisconnect:
        ws_manager.disconnect(client_id)
        logger.info(f"Client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        ws_manager.disconnect(client_id)
        await websocket.close()

# WebSocket endpoint for alert notifications
@router.websocket("/ws/alerts/{client_id}")
async def alert_websocket_endpoint(websocket: WebSocket, client_id: str):
    """WebSocket endpoint specifically for alert notifications"""
    # Similar to the general WebSocket endpoint but specifically for alerts
    # Add authentication and authorization as needed
    
    # For now, we'll use a simple client_id without authentication
    user_id = None  # Replace with actual user ID if authenticated
    
    # Register the connection
    await ws_manager.connect(websocket, f"alerts_{client_id}", user_id)
    
    try:
        while True:
            # Keep the connection alive
            # We don't expect to receive messages from the client for alerts
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        ws_manager.disconnect(f"alerts_{client_id}")
        logger.info(f"Alert client disconnected: {client_id}")
    except Exception as e:
        logger.error(f"Alert WebSocket error: {str(e)}")
        ws_manager.disconnect(f"alerts_{client_id}")
        await websocket.close()
