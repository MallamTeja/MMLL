from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from .base import ResponseBase

class ImageBase(BaseModel):
    machine_id: int
    file_path: str
    label: Optional[str] = None
    mask_path: Optional[str] = None
    confidence: Optional[float] = None
    processed: bool = False

class ImageCreate(ImageBase):
    pass

class ImageUpdate(BaseModel):
    label: Optional[str] = None
    mask_path: Optional[str] = None
    confidence: Optional[float] = None
    processed: Optional[bool] = None

class ImageInDBBase(ImageBase):
    id: int
    uploaded_at: datetime

    class Config:
        orm_mode = True

class Image(ImageInDBBase):
    pass

class ImageInDB(ImageInDBBase):
    pass

class ImageResponse(ResponseBase):
    data: Image

class ImageListResponse(ResponseBase):
    data: List[Image]
