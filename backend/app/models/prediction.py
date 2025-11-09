from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False)
    image_data_id = Column(Integer, ForeignKey("image_data.id", ondelete="CASCADE"), nullable=True)
    sensor_data_id = Column(Integer, ForeignKey("sensor_data.id", ondelete="CASCADE"), nullable=True)
    
    # Prediction results
    rul_hours = Column(Float, nullable=False)  # Remaining Useful Life in hours
    wear_category = Column(String, nullable=False)  # e.g., 'normal', 'moderate', 'severe'
    confidence = Column(Float, nullable=False)  # Model confidence score (0-1)
    summary = Column(Text, nullable=True)  # Human-readable prediction summary
    
    # Model info
    model_version = Column(String, nullable=False)
    prediction_time = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    machine = relationship("Machine", back_populates="predictions")
    image_data = relationship("ImageData", back_populates="predictions")
    sensor_data = relationship("SensorData", back_populates="predictions")

    def __repr__(self):
        return f"<Prediction {self.id} - Machine {self.machine_id} - RUL: {self.rul_hours} hours>"
