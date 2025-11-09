from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..database import Base

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    machine_id = Column(Integer, ForeignKey("machines.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    temperature = Column(Float, nullable=True)  # in Celsius
    vibration = Column(Float, nullable=True)    # in mm/s²
    pressure = Column(Float, nullable=True)     # in bar
    rpm = Column(Float, nullable=True)          # rotations per minute
    current = Column(Float, nullable=True)      # in Amperes
    voltage = Column(Float, nullable=True)      # in Volts
    
    # Relationships
    machine = relationship("Machine", back_populates="sensor_readings")
    predictions = relationship("Prediction", back_populates="sensor_data")

    def __repr__(self):
        return f"<SensorData {self.id} - Machine {self.machine_id} - {self.timestamp}>"
