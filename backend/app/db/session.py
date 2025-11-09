from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Use SQLite for quick startup instead of PostgreSQL
SQLALCHEMY_DATABASE_URL = "sqlite:///./toolwear.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
