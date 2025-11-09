from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure the database URL is set up
if not settings.SQLALCHEMY_DATABASE_URI:
    raise ValueError("Database URL is not configured. Please check your settings.")
