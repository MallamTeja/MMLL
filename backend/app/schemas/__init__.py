# Import all schemas to make them available when importing from schemas
from .base import *
from .machine import *
from .image import *
from .sensor import *
from .prediction import *
from .alert import *
from .model import *
from .user import *
from .auth import *
from .maintenance import *

# Re-export common types and enums
from .base import Status, Severity, ModelType, ModelStatus

# Re-export user-related schemas
from .user import (
    UserBase,
    UserCreate,
    UserUpdate,
    UserInDBBase,
    User,
    UserInDB,
    Msg
)

# Re-export auth schemas
from .auth import Token, TokenData

# For backward compatibility
TokenPayload = TokenData  # Alias TokenPayload to TokenData for compatibility