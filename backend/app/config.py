from pydantic import BaseSettings, PostgresDsn, validator
from typing import Any, Dict, List, Optional, Union

class Settings(BaseSettings):
    # Application settings
    PROJECT_NAME: str = "CNC Tool Wear Predictive Maintenance"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Database
    DATABASE_URL: str = "sqlite:///./toolwear.db"
    TEST_DATABASE_URL: str = "sqlite:///./test_toolwear.db"
    
    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = 587
    SMTP_HOST: Optional[str] = "smtp.gmail.com"
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Email templates
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 24
    EMAIL_TEMPLATES_DIR: str = "/app/email-templates/build"
    EMAILS_ENABLED: bool = False
    
    # Model paths
    MODEL_DIR: str = "/app/models"
    
    # File upload settings
    MAX_UPLOAD_SIZE_MB: int = 50  # 50MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png"]
    UPLOAD_DIR: str = "/app/uploads"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # API keys (for external services)
    # Example: TENSORFLOW_SERVING_URL: Optional[HttpUrl] = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"
        
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    @validator("EMAILS_ENABLED", pre=True)
    def get_emails_enabled(cls, v: bool, values: Dict[str, Any]) -> bool:
        return bool(
            values.get("SMTP_HOST")
            and values.get("SMTP_PORT")
            and values.get("EMAILS_FROM_EMAIL")
        )

# Create settings instance
settings = Settings()
