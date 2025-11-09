import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler
from ..config import settings

# Create logs directory if it doesn't exist
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

# Log format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
LOG_LEVEL = settings.LOG_LEVEL

class RequestIdFilter(logging.Filter):
    """Add request_id to log records if available"""
    def filter(self, record):
        record.request_id = getattr(record, 'request_id', 'no-request')
        return True

def setup_logging():
    """Configure logging with file and console handlers"""
    # Root logger
    logger = logging.getLogger()
    logger.setLevel(LOG_LEVEL)
    
    # Formatter
    formatter = logging.Formatter(LOG_FORMAT)
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # File handler with rotation (10MB per file, keep 5 files)
    file_handler = RotatingFileHandler(
        log_dir / 'app.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    
    # Add filters and handlers
    request_filter = RequestIdFilter()
    console_handler.addFilter(request_filter)
    file_handler.addFilter(request_filter)
    
    # Clear any existing handlers
    logger.handlers.clear()
    
    # Add handlers
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    # Set log levels for specific loggers
    logging.getLogger('uvicorn').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.error').setLevel(logging.WARNING)
    logging.getLogger('sqlalchemy.engine').setLevel(logging.WARNING)
    
    return logger
