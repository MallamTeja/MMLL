from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services import alert_service
from ..api.deps import get_current_active_user

router = APIRouter()

@router.get("/", response_model=schemas.AlertListResponse)
def list_alerts(
    skip: int = 0,
    limit: int = 100,
    machine_id: Optional[int] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    resolved: Optional[bool] = None,
    time_range_hours: Optional[int] = Query(
        None, 
        description="Filter alerts created in the last X hours"
    ),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    List alerts with optional filtering and pagination.
    
    - **machine_id**: Filter by machine ID
    - **status**: Filter by status (open, acknowledged, resolved)
    - **severity**: Filter by severity (info, warning, critical)
    - **resolved**: Filter by resolved status
    - **time_range_hours**: Filter by creation time (last X hours)
    - **search**: Search in title and message
    """
    try:
        alerts, total = alert_service.get_alerts(
            db=db,
            skip=skip,
            limit=limit,
            machine_id=machine_id,
            status=status,
            severity=severity,
            resolved=resolved,
            time_range_hours=time_range_hours,
            search=search
        )
        
        return {
            "items": alerts,
            "total": total,
            "page": (skip // limit) + 1 if limit > 0 else 1,
            "page_size": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving alerts: {str(e)}"
        )

@router.get("/stats", response_model=schemas.AlertStatsResponse)
def get_alert_stats(
    time_range_hours: int = Query(24, le=168, description="Time range in hours (max 168)"),
    machine_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get alert statistics.
    
    Returns counts of alerts by status and severity, and alerts over time.
    """
    try:
        stats = alert_service.get_alert_stats(
            db=db,
            time_range_hours=time_range_hours,
            machine_id=machine_id
        )
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving alert statistics: {str(e)}"
        )

@router.get("/{alert_id}", response_model=schemas.AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get a specific alert by ID.
    """
    alert = alert_service.get_alert(db, alert_id)
    if not alert:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alert not found"
        )
    
    # TODO: Add permission check if needed
    
    return {"data": alert}

@router.post("/", response_model=schemas.AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: schemas.AlertCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Create a new alert.
    
    Only users with appropriate permissions can create alerts.
    """
    try:
        # TODO: Add permission check if needed
        
        alert = alert_service.create_alert(
            db=db,
            alert_in=alert_in,
            created_by=current_user.id
        )
        
        return {"data": alert}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating alert: {str(e)}"
        )

@router.put("/{alert_id}", response_model=schemas.AlertResponse)
def update_alert(
    alert_id: int,
    alert_in: schemas.AlertUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Update an existing alert.
    
    Only users with appropriate permissions can update alerts.
    """
    try:
        # TODO: Add permission check if needed
        
        alert = alert_service.update_alert(
            db=db,
            alert_id=alert_id,
            alert_in=alert_in,
            updated_by=current_user.id
        )
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
            
        return {"data": alert}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating alert: {str(e)}"
        )

@router.post("/{alert_id}/acknowledge", response_model=schemas.AlertResponse)
def acknowledge_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Acknowledge an alert.
    
    Marks the alert as acknowledged by the current user.
    """
    try:
        alert = alert_service.acknowledge_alert(
            db=db,
            alert_id=alert_id,
            user_id=current_user.id
        )
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
            
        return {"data": alert}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error acknowledging alert: {str(e)}"
        )

@router.post("/{alert_id}/resolve", response_model=schemas.AlertResponse)
def resolve_alert(
    alert_id: int,
    resolution_notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Resolve an alert.
    
    Marks the alert as resolved by the current user with optional resolution notes.
    """
    try:
        alert = alert_service.resolve_alert(
            db=db,
            alert_id=alert_id,
            user_id=current_user.id,
            resolution_notes=resolution_notes
        )
        
        if not alert:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Alert not found"
            )
            
        return {"data": alert}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error resolving alert: {str(e)}"
        )

@router.get("/machine/{machine_id}/active", response_model=List[schemas.Alert])
def get_active_alerts_for_machine(
    machine_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get all active alerts for a specific machine.
    
    Returns all non-resolved alerts for the specified machine.
    """
    try:
        alerts, _ = alert_service.get_alerts(
            db=db,
            machine_id=machine_id,
            status="open",
            limit=1000  # High limit to get all active alerts
        )
        
        return alerts
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving active alerts: {str(e)}"
        )
