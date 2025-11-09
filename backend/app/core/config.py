from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, BaseSettings, EmailStr, validator, HttpUrl

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    
    # Backend server settings
    SERVER_NAME: str = "localhost"
    SERVER_HOST: str = "http://localhost:8001"
    
    # Project settings
    PROJECT_NAME: str = "MechAware"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Database settings
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "mechaware"
    SQLALCHEMY_DATABASE_URI: Optional[str] = None
    
    # Email settings
    SMTP_TLS: bool = True
    SMTP_PORT: int = 587
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_USER: str = "your-email@gmail.com"
    SMTP_PASSWORD: str = "your-email-password"
    EMAILS_FROM_EMAIL: str = "noreply@mechaware.com"
    EMAILS_FROM_NAME: str = "MechAware System"
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 24
    EMAILS_ENABLED: bool = False
    
    # First superuser
    FIRST_SUPERUSER: EmailStr = "admin@mechaware.com"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # File Uploads
    UPLOAD_DIR: str = "uploads"  # Relative to project root
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/tiff"]
    ALLOWED_CSV_TYPES = ["text/csv", "application/vnd.ms-excel"]
    
    @validator("UPLOAD_DIR", pre=True)
    def create_upload_dir(cls, v: str) -> str:
        """Ensure upload directory exists."""
        path = Path(v)
        if not path.exists():
            path.mkdir(parents=True, exist_ok=True)
        return str(path.absolute())

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return f"postgresql+psycopg2://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}/{values.get('POSTGRES_DB')}"

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Security settings
    ALGORITHM: str = "HS256"
    
    class Config:
        case_sensitive = True

# Create settings instance
settings = Settings()
