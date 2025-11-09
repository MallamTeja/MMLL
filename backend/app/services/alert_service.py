import logging
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from .. import models, schemas
from .base_service import BaseService
from ..config import settings

logger = logging.getLogger(__name__)

class AlertService:
    """Service class for alert-related operations"""
    
    def __init__(self):
        self.base_service = BaseService[
            models.Alert, 
            schemas.AlertCreate, 
            schemas.AlertUpdate
        ](models.Alert)
    
    def get_alert(self, db: Session, alert_id: int) -> Optional[models.Alert]:
        """Get an alert by ID"""
        return self.base_service.get(db, alert_id)
    
    def get_alerts(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        machine_id: Optional[int] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        resolved: Optional[bool] = None,
        time_range_hours: Optional[int] = None,
        search: Optional[str] = None,
    ) -> Tuple[List[models.Alert], int]:
        """Get alerts with filtering and pagination"""
        query = db.query(models.Alert)
        
        # Apply filters
        if machine_id is not None:
            query = query.filter(models.Alert.machine_id == machine_id)
            
        if status is not None:
            query = query.filter(models.Alert.status == status)
            
        if severity is not None:
            query = query.filter(models.Alert.severity == severity)
            
        if resolved is not None:
            if resolved:
                query = query.filter(models.Alert.resolved_at.isnot(None))
            else:
                query = query.filter(models.Alert.resolved_at.is_(None))
                
        if time_range_hours is not None:
            time_threshold = datetime.utcnow() - timedelta(hours=time_range_hours)
            query = query.filter(models.Alert.created_at >= time_threshold)
            
        if search:
            search_filter = or_(
                models.Alert.title.ilike(f"%{search}%"),
                models.Alert.message.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination
        alerts = query.order_by(
            models.Alert.created_at.desc()
        ).offset(skip).limit(limit).all()
        
        return alerts, total
    
    def create_alert(
        self,
        db: Session,
        alert_in: schemas.AlertCreate,
        created_by: Optional[int] = None
    ) -> models.Alert:
        """Create a new alert"""
        db_alert = models.Alert(
            **alert_in.dict(exclude_unset=True),
            created_by=created_by
        )
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        # Send real-time notification
        self._send_real_time_notification(db_alert)
        
        return db_alert
    
    def update_alert(
        self,
        db: Session,
        alert_id: int,
        alert_in: schemas.AlertUpdate,
        updated_by: Optional[int] = None
    ) -> Optional[models.Alert]:
        """Update an existing alert"""
        db_alert = self.get_alert(db, alert_id)
        if not db_alert:
            return None
            
        update_data = alert_in.dict(exclude_unset=True)
        
        # Handle status changes
        if "status" in update_data:
            if update_data["status"] == "resolved" and not db_alert.resolved_at:
                update_data["resolved_at"] = datetime.utcnow()
                update_data["resolved_by"] = updated_by
            elif update_data["status"] != "resolved":
                update_data["resolved_at"] = None
                update_data["resolved_by"] = None
        
        # Update fields
        for field, value in update_data.items():
            setattr(db_alert, field, value)
            
        db_alert.updated_at = datetime.utcnow()
        db_alert.updated_by = updated_by
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        # Send update notification if status changed
        if "status" in update_data:
            self._send_real_time_notification(db_alert)
        
        return db_alert
    
    def acknowledge_alert(
        self,
        db: Session,
        alert_id: int,
        user_id: int
    ) -> Optional[models.Alert]:
        """Mark an alert as acknowledged"""
        db_alert = self.get_alert(db, alert_id)
        if not db_alert:
            return None
            
        if db_alert.status != "open":
            return db_alert
            
        db_alert.status = "acknowledged"
        db_alert.acknowledged_at = datetime.utcnow()
        db_alert.acknowledged_by = user_id
        db_alert.updated_at = datetime.utcnow()
        db_alert.updated_by = user_id
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        # Send update notification
        self._send_real_time_notification(db_alert)
        
        return db_alert
    
    def resolve_alert(
        self,
        db: Session,
        alert_id: int,
        user_id: int,
        resolution_notes: Optional[str] = None
    ) -> Optional[models.Alert]:
        """Mark an alert as resolved"""
        db_alert = self.get_alert(db, alert_id)
        if not db_alert:
            return None
            
        db_alert.status = "resolved"
        db_alert.resolved_at = datetime.utcnow()
        db_alert.resolved_by = user_id
        db_alert.resolution_notes = resolution_notes
        db_alert.updated_at = datetime.utcnow()
        db_alert.updated_by = user_id
        
        db.add(db_alert)
        db.commit()
        db.refresh(db_alert)
        
        # Send update notification
        self._send_real_time_notification(db_alert)
        
        return db_alert
    
    def get_alert_stats(
        self,
        db: Session,
        time_range_hours: int = 24,
        machine_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Get alert statistics"""
        time_threshold = datetime.utcnow() - timedelta(hours=time_range_hours)
        
        # Base query
        query = db.query(models.Alert).filter(
            models.Alert.created_at >= time_threshold
        )
        
        if machine_id is not None:
            query = query.filter(models.Alert.machine_id == machine_id)
        
        # Total alerts
        total_alerts = query.count()
        
        # Alerts by status
        status_counts = {
            status[0]: query.filter(models.Alert.status == status[0]).count()
            for status in db.query(models.Alert.status).distinct().all()
        }
        
        # Alerts by severity
        severity_counts = {
            severity[0]: query.filter(models.Alert.severity == severity[0]).count()
            for severity in db.query(models.Alert.severity).distinct().all()
        }
        
        # Alerts over time (last 24 hours in 1-hour buckets)
        alerts_over_time = []
        for i in range(time_range_hours):
            start_time = time_threshold + timedelta(hours=i)
            end_time = start_time + timedelta(hours=1)
            
            count = query.filter(
                models.Alert.created_at >= start_time,
                models.Alert.created_at < end_time
            ).count()
            
            alerts_over_time.append({
                "time": start_time.isoformat(),
                "count": count
            })
        
        return {
            "total_alerts": total_alerts,
            "status_counts": status_counts,
            "severity_counts": severity_counts,
            "alerts_over_time": alerts_over_time,
            "time_range_hours": time_range_hours,
            "machine_id": machine_id
        }
    
    def _send_real_time_notification(self, alert: models.Alert) -> None:
        """Send real-time notification for alert updates"""
        try:
            # TODO: Implement WebSocket or other real-time notification
            # This is a placeholder for the actual implementation
            
            # Example: Send via WebSocket
            # from ..ws.manager import manager
            # await manager.broadcast_alert(alert)
            
            # Log the notification
            logger.info(
                f"Alert notification: {alert.severity.upper()} - {alert.title} "
                f"(Status: {alert.status})"
            )
            
        except Exception as e:
            logger.error(f"Error sending real-time notification: {str(e)}", exc_info=True)

# Create an instance of AlertService
alert_service = AlertService()
