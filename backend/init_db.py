import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, get_db
from app.models.machine import Machine
from app.models.sensor_data import SensorData
from app.models.prediction import Prediction
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.image_data import ImageData
from app.models.model import Model
from app.models.user import User

def init_db():
    # Create database engine
    SQLALCHEMY_DATABASE_URL = "sqlite:///./toolwear.db"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    
    # Create all tables
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create a test machine if none exists
        if not db.query(Machine).first():
            print("Creating test machine...")
            test_machine = Machine(
                name="CNC-001",
                status="operational",
                location="Production Line 1",
                manufacturer="Haas",
                model="VF-2SS",
                serial_number="H12345678",
                current_rul_hours=500.0
            )
            db.add(test_machine)
            db.commit()
            db.refresh(test_machine)
            
            # Create a test alert
            test_alert = Alert(
                machine_id=test_machine.id,
                title="High Vibration Detected",
                message="Vibration levels exceeded threshold at 0.5g",
                severity=AlertSeverity.WARNING,
                status=AlertStatus.OPEN
            )
            db.add(test_alert)
            db.commit()
            
            print(f"Created test machine with ID: {test_machine.id}")
        
        print("Database initialization complete!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
