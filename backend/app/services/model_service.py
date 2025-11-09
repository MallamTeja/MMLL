import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ModelCheckpoint

from app.db.session import SessionLocal
from app.models.model import Model as ModelDB
from app.models.sensor_data import SensorData
from app.models.image_data import ImageData
from app.core.config import settings

logger = logging.getLogger(__name__)

class ModelService:
    def __init__(self):
        self.models_dir = os.path.join(settings.BASE_DIR, "models")
        os.makedirs(self.models_dir, exist_ok=True)

    async def prepare_sensor_data(self, machine_id: Optional[int] = None) -> tuple:
        """Prepare sensor data for training"""
        db = SessionLocal()
        try:
            query = db.query(SensorData)
            if machine_id:
                query = query.filter(SensorData.machine_id == machine_id)
            
            df = pd.read_sql(query.statement, db.bind)
            
            if df.empty:
                raise ValueError("No sensor data available for training")
            
            # Feature engineering
            features = ['temperature', 'vibration', 'pressure', 'rpm', 'current', 'voltage']
            target = 'remaining_life'  # This should be calculated based on your data
            
            # Normalize features
            scaler = StandardScaler()
            X = scaler.fit_transform(df[features])
            y = df[target].values
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Reshape for LSTM [samples, time_steps, features]
            X_train = X_train.reshape((X_train.shape[0], 1, X_train.shape[1]))
            X_test = X_test.reshape((X_test.shape[0], 1, X_test.shape[1]))
            
            return (X_train, y_train), (X_test, y_test), scaler
            
        except Exception as e:
            logger.error(f"Error preparing sensor data: {str(e)}")
            raise
        finally:
            db.close()

    def build_lstm_model(self, input_shape: tuple) -> Sequential:
        """Build LSTM model for time series prediction"""
        model = Sequential([
            LSTM(100, return_sequences=True, input_shape=input_shape),
            Dropout(0.2),
            LSTM(50, return_sequences=False),
            Dropout(0.2),
            Dense(25, activation='relu'),
            Dense(1)  # Predict remaining useful life
        ])
        
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        return model

    async def train_model(
        self, 
        model_type: str = "lstm",
        machine_id: Optional[int] = None,
        epochs: int = 50,
        batch_size: int = 32
    ) -> Dict[str, Any]:
        """Train a new model"""
        try:
            # Prepare data
            (X_train, y_train), (X_test, y_test), scaler = await self.prepare_sensor_data(machine_id)
            
            # Build and train model
            if model_type == "lstm":
                model = self.build_lstm_model((X_train.shape[1], X_train.shape[2]))
            else:
                raise ValueError(f"Unsupported model type: {model_type}")
            
            # Callbacks
            model_name = f"{model_type}_model_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            model_path = os.path.join(self.models_dir, f"{model_name}.h5")
            
            callbacks = [
                EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
                ModelCheckpoint(model_path, save_best_only=True, save_weights_only=False)
            ]
            
            # Train model
            history = model.fit(
                X_train, y_train,
                validation_data=(X_test, y_test),
                epochs=epochs,
                batch_size=batch_size,
                callbacks=callbacks,
                verbose=1
            )
            
            # Evaluate model
            test_loss, test_mae = model.evaluate(X_test, y_test, verbose=0)
            
            # Save model metadata to database
            db = SessionLocal()
            try:
                model_record = ModelDB(
                    name=model_name,
                    model_type=model_type,
                    file_path=model_path,
                    metrics=json.dumps({
                        'test_loss': float(test_loss),
                        'test_mae': float(test_mae),
                        'training_history': {
                            'loss': [float(x) for x in history.history['loss']],
                            'val_loss': [float(x) for x in history.history['val_loss']],
                            'mae': [float(x) for x in history.history['mae']],
                            'val_mae': [float(x) for x in history.history['val_mae']]
                        }
                    })
                )
                db.add(model_record)
                db.commit()
                db.refresh(model_record)
                
                return {
                    "model_id": model_record.id,
                    "name": model_record.name,
                    "metrics": {
                        "test_loss": test_loss,
                        "test_mae": test_mae
                    },
                    "model_path": model_path
                }
                
            finally:
                db.close()
                
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise

    async def get_models(self, skip: int = 0, limit: int = 100) -> list:
        """Get list of trained models"""
        db = SessionLocal()
        try:
            models = db.query(ModelDB).offset(skip).limit(limit).all()
            return [
                {
                    "id": model.id,
                    "name": model.name,
                    "model_type": model.model_type,
                    "created_at": model.created_at.isoformat(),
                    "metrics": json.loads(model.metrics) if model.metrics else {}
                }
                for model in models
            ]
        finally:
            db.close()

    async def get_model(self, model_id: int) -> Optional[Dict]:
        """Get model details by ID"""
        db = SessionLocal()
        try:
            model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
            if not model:
                return None
                
            return {
                "id": model.id,
                "name": model.name,
                "model_type": model.model_type,
                "created_at": model.created_at.isoformat(),
                "file_path": model.file_path,
                "metrics": json.loads(model.metrics) if model.metrics else {}
            }
        finally:
            db.close()

    async def delete_model(self, model_id: int) -> bool:
        """Delete a trained model"""
        db = SessionLocal()
        try:
            model = db.query(ModelDB).filter(ModelDB.id == model_id).first()
            if not model:
                return False
                
            # Delete model file if exists
            if model.file_path and os.path.exists(model.file_path):
                os.remove(model.file_path)
                
            # Delete database record
            db.delete(model)
            db.commit()
            return True
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error deleting model {model_id}: {str(e)}")
            return False
            
        finally:
            db.close()
