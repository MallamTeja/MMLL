from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
import logging

from sqlalchemy.orm import Session
from .. import models, schemas

logger = logging.getLogger(__name__)

# Configuration
ANOMALY_DETECTION_WINDOW = 100  # Number of samples to consider for anomaly detection
ANOMALY_CONTAMINATION = 0.1  # Expected proportion of anomalies in the data

# In-memory cache for models (in production, use a proper cache like Redis)
anomaly_models = {}

async def detect_anomalies(sensor_readings: List[dict]) -> List[dict]:
    """
    Detect anomalies in sensor readings using Isolation Forest algorithm.
    
    Args:
        sensor_readings: List of sensor readings to analyze
        
    Returns:
        List of detected anomalies with details
    """
    if not sensor_readings:
        return []
    
    try:
        # Convert to DataFrame for easier processing
        df = pd.DataFrame(sensor_readings)
        
        # Group by sensor type and machine
        anomalies = []
        
        for (machine_id, sensor_type), group in df.groupby(['machine_id', 'sensor_type']):
            # Get or create model for this sensor
            model_key = f"{machine_id}_{sensor_type}"
            
            if model_key not in anomaly_models:
                anomaly_models[model_key] = {
                    'model': IsolationForest(
                        contamination=ANOMALY_CONTAMINATION,
                        random_state=42
                    ),
                    'scaler': StandardScaler(),
                    'window': []
                }
            
            model_data = anomaly_models[model_key]
            model = model_data['model']
            scaler = model_data['scaler']
            window = model_data['window']
            
            # Add new readings to the window
            window.extend([{
                'value': row['value'],
                'timestamp': row['timestamp']
            } for _, row in group.iterrows()])
            
            # Keep only the most recent readings
            window = window[-ANOMALY_DETECTION_WINDOW:]
            model_data['window'] = window
            
            if len(window) < 10:  # Not enough data yet
                continue
                
            # Prepare data for the model
            values = np.array([item['value'] for item in window]).reshape(-1, 1)
            timestamps = [item['timestamp'] for item in window]
            
            # Scale the data
            if len(window) == ANOMALY_DETECTION_WINDOW:  # Only fit on full window
                scaled_values = scaler.fit_transform(values)
            else:
                scaled_values = scaler.transform(values)
            
            # Train or update the model
            if len(window) == ANOMALY_DETECTION_WINDOW:
                model.fit(scaled_values)
            
            # Predict anomalies (-1 for anomalies, 1 for normal)
            predictions = model.predict(scaled_values)
            
            # Get anomaly scores (the lower, the more anomalous)
            scores = model.decision_function(scaled_values)
            
            # Process predictions for the latest readings
            for i in range(len(group), 0, -1):
                idx = -i
                if predictions[idx] == -1:  # Anomaly detected
                    anomaly_score = scores[idx]
                    severity = (
                        'high' if anomaly_score < -0.5 else
                        'medium' if anomaly_score < -0.2 else 'low'
                    )
                    
                    # Get the actual reading that caused the anomaly
                    reading = window[idx]
                    
                    # Create anomaly record
                    anomaly = {
                        'id': f"anom_{machine_id}_{sensor_type}_{timestamps[idx].timestamp()}",
                        'machine_id': machine_id,
                        'sensor_type': sensor_type,
                        'value': float(reading['value']),
                        'expected_range': get_expected_range(sensor_type),
                        'severity': severity,
                        'timestamp': timestamps[idx],
                        'status': 'new',
                        'description': f"Abnormal {sensor_type} reading detected",
                        'suggested_action': get_suggested_action(severity, sensor_type)
                    }
                    
                    anomalies.append(anomaly)
                    
                    # Only report the most recent anomaly per sensor type to avoid flooding
                    break
        
        return anomalies
        
    except Exception as e:
        logger.error(f"Error in anomaly detection: {str(e)}", exc_info=True)
        return []

def get_expected_range(sensor_type: str) -> Dict[str, float]:
    """Get expected range for a sensor type."""
    # These would typically come from a configuration or historical data
    ranges = {
        'temperature': {'min': 20, 'max': 60},
        'vibration': {'min': 0.1, 'max': 0.5},
        'current': {'min': 5, 'max': 20},
        'voltage': {'min': 400, 'max': 420},
        'pressure': {'min': 1.5, 'max': 2.5},
    }
    return ranges.get(sensor_type.lower(), {'min': 0, 'max': 100})

def get_suggested_action(severity: str, sensor_type: str) -> str:
    """Get suggested action based on anomaly severity and sensor type."""
    if severity == 'high':
        return f"Immediate maintenance required for {sensor_type} sensor"
    elif severity == 'medium':
        return f"Schedule maintenance soon for {sensor_type} sensor"
    else:
        return f"Monitor {sensor_type} sensor closely"

def get_recent_sensor_readings(
    db: Session, 
    machine_id: str, 
    limit: int = 100,
    sensor_type: Optional[str] = None
) -> List[dict]:
    """
    Retrieve recent sensor readings from the database.
    
    Args:
        db: Database session
        machine_id: ID of the machine
        limit: Maximum number of readings to return
        sensor_type: Optional filter by sensor type
        
    Returns:
        List of sensor readings with timestamps
    """
    try:
        query = db.query(models.SensorReading).filter(
            models.SensorReading.machine_id == machine_id
        ).order_by(
            models.SensorReading.timestamp.desc()
        ).limit(limit)
        
        if sensor_type:
            query = query.filter(models.SensorReading.sensor_type == sensor_type)
        
        readings = query.all()
        
        return [{
            'id': str(reading.id),
            'machine_id': reading.machine_id,
            'sensor_type': reading.sensor_type,
            'value': reading.value,
            'timestamp': reading.timestamp,
            'unit': reading.unit
        } for reading in readings]
        
    except Exception as e:
        logger.error(f"Error retrieving sensor readings: {str(e)}")
        return []

async def process_real_time_reading(reading: dict) -> Optional[dict]:
    """
    Process a single real-time sensor reading for anomalies.
    
    This is a simplified version that can be called from a message queue consumer.
    """
    try:
        # In a real implementation, this would add the reading to a window
        # and check for anomalies using the same logic as detect_anomalies
        # For now, we'll just pass it through the detect_anomalies function
        anomalies = await detect_anomalies([reading])
        return anomalies[0] if anomalies else None
    except Exception as e:
        logger.error(f"Error processing real-time reading: {str(e)}")
        return None
