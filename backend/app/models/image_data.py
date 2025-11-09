from sqlalchemy import Boolean, Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class ImageData(Base):
    __tablename__ = "image_data"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String, nullable=False)
    label = Column(String, nullable=True)
    mask_path = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    processed = Column(Boolean, default=False)
    
    # Relationships
    machine = relationship("Machine", back_populates="images")
    predictions = relationship("Prediction", back_populates="image_data")

    def __repr__(self):
        return f"<ImageData {self.id} - {self.file_path}>"
