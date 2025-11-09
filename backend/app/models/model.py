import enum
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import json
from ..database import Base

class ModelType(str, enum.Enum):
    IMAGE_CLASSIFICATION = "image_classification"
    TIME_SERIES = "time_series"
    HYBRID = "hybrid"

class ModelStatus(str, enum.Enum):
    TRAINING = "training"
    ACTIVE = "active"
    ARCHIVED = "archived"
    FAILED = "failed"

class Model(Base):
    __tablename__ = "models"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    version = Column(String, nullable=False)
    model_type = Column(Enum(ModelType), nullable=False)
    status = Column(Enum(ModelStatus), default=ModelStatus.TRAINING)
    
    # Model files and metadata
    file_path = Column(String, nullable=False)
    metrics = Column(Text, nullable=True)  # JSON string of model metrics
    
    # Training info
    trained_at = Column(DateTime(timezone=True), server_default=func.now())
    trained_on_data_until = Column(DateTime(timezone=True), nullable=True)
    training_parameters = Column(Text, nullable=True)  # JSON string of training parameters
    
    # Relationships
    predictions = relationship("Prediction", back_populates="model")
    
    # Model metadata
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False, index=True)
    
    # For model rollback
    previous_version_id = Column(Integer, ForeignKey("models.id"), nullable=True)
    
    __table_args__ = (
        # Ensure only one active model per type
        # This is a partial index that only includes rows where is_active is True
        # SQLite doesn't support partial indexes with the syntax we need, so we'll handle this in the application logic
        # {'sqlite_where': is_active == True}
    )
    
    def get_metrics(self):
        """Deserialize metrics JSON string to Python dict"""
        return json.loads(self.metrics) if self.metrics else {}
    
    def set_metrics(self, metrics_dict):
        """Serialize metrics dict to JSON string"""
        self.metrics = json.dumps(metrics_dict, indent=2)
    
    def get_training_parameters(self):
        """Deserialize training parameters JSON string to Python dict"""
        return json.loads(self.training_parameters) if self.training_parameters else {}
    
    def set_training_parameters(self, params_dict):
        """Serialize training parameters dict to JSON string"""
        self.training_parameters = json.dumps(params_dict, indent=2)
    
    def __repr__(self):
        return f"<Model {self.name} v{self.version} ({self.model_type})>"
