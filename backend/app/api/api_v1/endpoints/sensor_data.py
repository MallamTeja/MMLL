from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.schemas.sensor_data import (
    SensorDataCreate,
    SensorDataUpdate,
    SensorDataResponse,
    SensorDataListResponse,
    SensorDataQuery,
    AggregatedSensorDataQuery,
    AggregatedSensorDataResponse,
    AggregationInterval,
    AggregationFunction
)

router = APIRouter()

@router.post("/", response_model=SensorDataResponse, status_code=status.HTTP_201_CREATED)
def create_sensor_data(
    *,
    db: Session = Depends(deps.get_db),
    data_in: SensorDataCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new sensor data.
    """
    # Verify machine exists and user has access
    machine = crud.machine.get(db, id=data_in.machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found",
        )
    
    # Check if user has access to this machine
    # (Implement your access control logic here)
    
    data = crud.sensor_data.create(db, data_in=data_in)
    return {"data": data}

@router.post("/batch", response_model=List[SensorDataResponse], status_code=status.HTTP_201_CREATED)
def create_sensor_data_batch(
    *,
    db: Session = Depends(deps.get_db),
    data_in: List[SensorDataCreate],
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create multiple sensor data records in a batch.
    """
    if not data_in:
        return []
    
    # Verify all machines exist and user has access
    machine_ids = {data.machine_id for data in data_in}
    machines = crud.machine.get_multi_by_ids(db, ids=list(machine_ids))
    if len(machines) != len(machine_ids):
        missing_ids = machine_ids - {m.id for m in machines}
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Machines not found: {', '.join(map(str, missing_ids))}",
        )
    
    # Check if user has access to all machines
    # (Implement your access control logic here)
    
    data_list = crud.sensor_data.create_sensor_data_batch(db, data_in=data_in)
    return [{"data": data} for data in data_list]

@router.get("/{data_id}", response_model=SensorDataResponse)
def read_sensor_data(
    data_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get sensor data by ID.
    """
    data = crud.sensor_data.get(db, id=data_id)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor data not found",
        )
    
    # Check if user has access to this machine
    # (Implement your access control logic here)
    
    return {"data": data}

@router.get("/", response_model=SensorDataListResponse)
def read_sensor_data_list(
    machine_id: Optional[int] = None,
    sensor_type: Optional[str] = None,
    start_time: Optional[datetime] = Query(
        None, 
        description="Start time for filtering (ISO 8601 format)"
    ),
    end_time: Optional[datetime] = Query(
        None, 
        description="End time for filtering (ISO 8601 format)"
    ),
    skip: int = 0,
    limit: int = Query(100, le=1000),
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve sensor data with filtering.
    """
    # If no machine_id is provided, only admins can query all machines
    if machine_id is None and not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to query all machines",
        )
    
    # If machine_id is provided, check access
    if machine_id is not None:
        machine = crud.machine.get(db, id=machine_id)
        if not machine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Machine not found",
            )
        # Check if user has access to this machine
        # (Implement your access control logic here)
    
    # Build query parameters
    query_params = {
        "machine_id": machine_id,
        "sensor_type": sensor_type,
        "start_time": start_time,
        "end_time": end_time,
        "limit": limit,
        "offset": skip
    }
    
    # Execute query
    items, total = crud.sensor_data.query_sensor_data(db, **query_params)
    
    return {
        "items": items,
        "total": total,
        "skip": skip,
        "limit": limit,
    }

@router.get("/aggregated/", response_model=AggregatedSensorDataResponse)
def read_aggregated_sensor_data(
    machine_id: int,
    sensor_type: str,
    start_time: datetime = Query(..., description="Start time (ISO 8601 format)"),
    end_time: datetime = Query(..., description="End time (ISO 8601 format)"),
    interval: AggregationInterval = Query(
        AggregationInterval.HOUR,
        description="Time interval for aggregation"
    ),
    function: AggregationFunction = Query(
        AggregationFunction.AVG,
        description="Aggregation function to apply"
    ),
    unit: Optional[str] = None,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get aggregated sensor data for visualization.
    """
    # Check if machine exists and user has access
    machine = crud.machine.get(db, id=machine_id)
    if not machine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Machine not found",
        )
    
    # Check if user has access to this machine
    # (Implement your access control logic here)
    
    # Validate time range
    if end_time <= start_time:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="End time must be after start time",
        )
    
    # Calculate max allowed time range based on interval
    max_days = {
        AggregationInterval.MINUTE: 7,     # 1 week for minute data
        AggregationInterval.HOUR: 30,      # 1 month for hourly data
        AggregationInterval.DAY: 365,      # 1 year for daily data
        AggregationInterval.WEEK: 365 * 3, # 3 years for weekly data
        AggregationInterval.MONTH: 365 * 10, # 10 years for monthly data
    }
    
    max_range = timedelta(days=max_days.get(interval, 30))
    if (end_time - start_time) > max_range:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Time range too large for {interval.value} interval. Maximum is {max_range.days} days.",
        )
    
    # Get aggregated data
    data = crud.sensor_data.get_aggregated_sensor_data(
        db=db,
        machine_id=machine_id,
        sensor_type=sensor_type,
        start_time=start_time,
        end_time=end_time,
        interval=interval,
        agg_function=function,
        unit=unit
    )
    
    return {
        "machine_id": machine_id,
        "sensor_type": sensor_type,
        "unit": unit or "",
        "interval": interval.value,
        "function": function.value,
        "data": data
    }

@router.delete("/{data_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sensor_data(
    data_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete sensor data.
    """
    if not crud.user.is_superuser(current_user):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to delete sensor data",
        )
    
    data = crud.sensor_data.get(db, id=data_id)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor data not found",
        )
    
    crud.sensor_data.remove(db, id=data_id)
    return None
