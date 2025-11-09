from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict, Any

class FileUploadResponse(BaseModel):
    """Response model for file upload operations."""
    success: bool
    message: str
    file_path: Optional[str] = None
    id: Optional[int] = None
    next_steps: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        schema_extra = {
            "example": {
                "success": True,
                "message": "File uploaded successfully",
                "file_path": "images/550e8400-e29b-41d4-a716-446655440000.jpg",
                "id": 42,
                "next_steps": ["Process image", "Run prediction"],
                "metadata": {"size": 12345, "type": "image/jpeg"}
            }
        }
