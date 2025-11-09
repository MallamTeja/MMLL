from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
import logging

from app.models.sensor_data import SensorData
from app.schemas.sensor_data import (
    SensorDataCreate, 
    SensorDataUpdate, 
    AggregationInterval,
    AggregationFunction
)

logger = logging.getLogger(__name__)

def get_sensor_data(
    db: Session, 
    data_id: int
) -> Optional[SensorData]:
    """
    Get a single sensor data record by ID.
    """
    return db.query(SensorData).filter(SensorData.id == data_id).first()

def get_sensor_data_by_machine(
    db: Session, 
    machine_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[SensorData]:
    """
    Get sensor data for a specific machine with pagination.
    """
    return (
        db.query(SensorData)
        .filter(SensorData.machine_id == machine_id)
        .order_by(SensorData.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_sensor_data_by_type(
    db: Session, 
    sensor_type: str, 
    skip: int = 0, 
    limit: int = 100
) -> List[SensorData]:
    """
    Get sensor data by sensor type with pagination.
    """
    return (
        db.query(SensorData)
        .filter(SensorData.sensor_type == sensor_type)
        .order_by(SensorData.timestamp.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def query_sensor_data(
    db: Session,
    machine_id: Optional[int] = None,
    sensor_type: Optional[str] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 1000,
    offset: int = 0
) -> Tuple[List[SensorData], int]:
    """
    Query sensor data with multiple filters.
    Returns a tuple of (results, total_count).
    """
    query = db.query(SensorData)
    
    # Apply filters
    if machine_id is not None:
        query = query.filter(SensorData.machine_id == machine_id)
    if sensor_type is not None:
        query = query.filter(SensorData.sensor_type == sensor_type)
    if start_time is not None:
        query = query.filter(SensorData.timestamp >= start_time)
    if end_time is not None:
        query = query.filter(SensorData.timestamp <= end_time)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply ordering and pagination
    results = (
        query.order_by(SensorData.timestamp.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    return results, total

def create_sensor_data(
    db: Session, 
    data_in: SensorDataCreate
) -> SensorData:
    """
    Create a new sensor data record.
    """
    db_data = SensorData(**data_in.dict())
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

def create_sensor_data_batch(
    db: Session, 
    data_in: List[SensorDataCreate]
) -> List[SensorData]:
    """
    Create multiple sensor data records in a single transaction.
    """
    db_data_list = [SensorData(**data.dict()) for data in data_in]
    db.bulk_save_objects(db_data_list)
    db.commit()
    
    # Refresh all objects to get their IDs
    for data in db_data_list:
        db.refresh(data)
        
    return db_data_list

def update_sensor_data(
    db: Session, 
    db_data: SensorData, 
    data_in: SensorDataUpdate
) -> SensorData:
    """
    Update a sensor data record.
    """
    update_data = data_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_data, field, value)
    
    db.add(db_data)
    db.commit()
    db.refresh(db_data)
    return db_data

def delete_sensor_data(
    db: Session, 
    data_id: int
) -> Optional[SensorData]:
    """
    Delete a sensor data record.
    """
    db_data = get_sensor_data(db, data_id=data_id)
    if db_data:
        db.delete(db_data)
        db.commit()
    return db_data

def get_aggregated_sensor_data(
    db: Session,
    machine_id: int,
    sensor_type: str,
    start_time: datetime,
    end_time: datetime,
    interval: AggregationInterval = AggregationInterval.HOUR,
    agg_function: AggregationFunction = AggregationFunction.AVG,
    unit: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Get aggregated sensor data for a specific machine and sensor type.
    """
    # Define the truncation function based on interval
    if interval == AggregationInterval.MINUTE:
        trunc_func = func.date_trunc('minute', SensorData.timestamp)
    elif interval == AggregationInterval.HOUR:
        trunc_func = func.date_trunc('hour', SensorData.timestamp)
    elif interval == AggregationInterval.DAY:
        trunc_func = func.date_trunc('day', SensorData.timestamp)
    elif interval == AggregationInterval.WEEK:
        trunc_func = func.date_trunc('week', SensorData.timestamp)
    elif interval == AggregationInterval.MONTH:
        trunc_func = func.date_trunc('month', SensorData.timestamp)
    else:
        trunc_func = func.date_trunc('hour', SensorData.timestamp)
    
    # Define the aggregation function
    if agg_function == AggregationFunction.AVG:
        value_func = func.avg(SensorData.value)
    elif agg_function == AggregationFunction.MIN:
        value_func = func.min(SensorData.value)
    elif agg_function == AggregationFunction.MAX:
        value_func = func.max(SensorData.value)
    elif agg_function == AggregationFunction.SUM:
        value_func = func.sum(SensorData.value)
    elif agg_function == AggregationFunction.COUNT:
        value_func = func.count(SensorData.value)
    else:
        value_func = func.avg(SensorData.value)
    
    # Build the query
    query = db.query(
        trunc_func.label("timestamp"),
        value_func.label("value"),
        func.count(SensorData.id).label("count")
    ).filter(
        SensorData.machine_id == machine_id,
        SensorData.sensor_type == sensor_type,
        SensorData.timestamp >= start_time,
        SensorData.timestamp <= end_time
    )
    
    if unit is not None:
        query = query.filter(SensorData.unit == unit)
    
    # Group by the truncated timestamp
    query = query.group_by(trunc_func).order_by(trunc_func)
    
    # Execute the query
    results = query.all()
    
    # Convert to list of dicts
    return [
        {
            "timestamp": row.timestamp,
            "value": float(row.value) if row.value is not None else None,
            "count": row.count
        }
        for row in results
    ]
