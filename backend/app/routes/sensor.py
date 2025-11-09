from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
import pandas as pd
from datetime import datetime
import io

from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.post("/upload/{machine_id}", response_model=schemas.SensorDataResponse)
async def upload_sensor_data(
    machine_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload sensor data from a CSV file for a specific machine.
    CSV should contain columns: timestamp, temperature, vibration, pressure, rpm, current, voltage
    """
    # Check if machine exists
    db_machine = db.query(models.Machine).filter(models.Machine.id == machine_id).first()
    if not db_machine:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    try:
        # Read CSV file
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # Validate required columns
        required_columns = ['timestamp', 'temperature', 'vibration', 'pressure', 'rpm', 'current', 'voltage']
        if not all(col in df.columns for col in required_columns):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain these columns: {', '.join(required_columns)}"
            )
        
        # Convert timestamp to datetime if it's not already
        df['timestamp'] = pd.to_datetime(df['timestamp'])
        
        # Create sensor data records
        sensor_data_list = []
        for _, row in df.iterrows():
            sensor_data = models.SensorData(
                machine_id=machine_id,
                timestamp=row['timestamp'],
                temperature=row['temperature'],
                vibration=row['vibration'],
                pressure=row['pressure'],
                rpm=row['rpm'],
                current=row['current'],
                voltage=row['voltage']
            )
            sensor_data_list.append(sensor_data)
        
        # Bulk insert
        db.bulk_save_objects(sensor_data_list)
        db.commit()
        
        # Update machine's last_updated timestamp
        db_machine.last_updated = datetime.utcnow()
        db.commit()
        
        return {"message": f"Successfully uploaded {len(sensor_data_list)} sensor readings"}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")

@router.get("/machine/{machine_id}", response_model=List[schemas.SensorData])
def get_sensor_data(
    machine_id: int,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get sensor data for a specific machine with optional time range filtering
    """
    query = db.query(models.SensorData).filter(models.SensorData.machine_id == machine_id)
    
    if start_time:
        query = query.filter(models.SensorData.timestamp >= start_time)
    if end_time:
        query = query.filter(models.SensorData.timestamp <= end_time)
    
    # Order by most recent first
    query = query.order_by(models.SensorData.timestamp.desc())
    
    # Apply limit
    sensor_data = query.limit(limit).all()
    
    if not sensor_data:
        raise HTTPException(
            status_code=404,
            detail="No sensor data found for the specified criteria"
        )
    
    return sensor_data

@router.get("/latest/machine/{machine_id}", response_model=schemas.SensorData)
def get_latest_sensor_data(
    machine_id: int,
    db: Session = Depends(get_db)
):
    """
    Get the most recent sensor reading for a specific machine
    """
    latest = db.query(models.SensorData)\
        .filter(models.SensorData.machine_id == machine_id)\
        .order_by(models.SensorData.timestamp.desc())\
        .first()
    
    if not latest:
        raise HTTPException(
            status_code=404,
            detail="No sensor data found for the specified machine"
        )
    
    return latest
