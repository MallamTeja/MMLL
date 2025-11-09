from sqlalchemy import Column, Integer, String, DateTime, Float, func, ForeignKey
from sqlalchemy.orm import relationship

from ..database import Base

class Machine(Base):
    __tablename__ = "machines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="operational")  # operational, maintenance, warning, critical
    location = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    model = Column(String, nullable=True)
    serial_number = Column(String, unique=True, nullable=True)
    installation_date = Column(DateTime, nullable=True)
    last_maintenance_date = Column(DateTime, nullable=True)
    next_maintenance_date = Column(DateTime, nullable=True)
    current_rul_hours = Column(Float, default=0.0)  # Current Remaining Useful Life in hours
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    images = relationship("ImageData", back_populates="machine", cascade="all, delete-orphan")
    sensor_readings = relationship("SensorData", back_populates="machine", cascade="all, delete-orphan")
    predictions = relationship("Prediction", back_populates="machine", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="machine", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Machine {self.name} - {self.status}>"
