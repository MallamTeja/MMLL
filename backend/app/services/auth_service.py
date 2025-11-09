from datetime import datetime, timedelta
from typing import Optional
import secrets
import string

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class AuthService:
    def __init__(self):
        self.SECRET_KEY = settings.SECRET_KEY
        self.ALGORITHM = settings.ALGORITHM
        self.ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against a hash"""
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        """Generate password hash"""
        return pwd_context.hash(password)

    def create_access_token(
        self, 
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create a new JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.SECRET_KEY, algorithm=self.ALGORITHM)
        return encoded_jwt

    async def get_current_user(
        self,
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db)
    ) -> models.User:
        """Get the current authenticated user from the token"""
        credentials_exception = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        try:
            payload = jwt.decode(
                token, self.SECRET_KEY, algorithms=[self.ALGORITHM]
            )
            username: str = payload.get("sub")
            if username is None:
                raise credentials_exception
            token_data = schemas.TokenData(username=username)
        except JWTError:
            raise credentials_exception
            
        user = db.query(models.User).filter(
            models.User.username == token_data.username
        ).first()
        
        if user is None:
            raise credentials_exception
        return user

    async def get_current_active_user(
        self,
        current_user: models.User = Depends(get_current_user)
    ) -> models.User:
        """Get the current active user"""
        if not current_user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")
        return current_user

    def authenticate_user(
        self, 
        db: Session, 
        username: str, 
        password: str
    ) -> Optional[models.User]:
        """Authenticate a user with username and password"""
        user = db.query(models.User).filter(
            models.User.username == username
        ).first()
        
        if not user or not self.verify_password(password, user.hashed_password):
            return None
            
        # Update last login time
        user.last_login = datetime.utcnow()
        db.commit()
        
        return user

    def create_user(self, db: Session, user: schemas.UserCreate) -> models.User:
        """Create a new user"""
        hashed_password = self.get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            hashed_password=hashed_password,
            role=user.role,
            is_active=user.is_active
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    def generate_password_reset_token(self, email: str) -> str:
        """Generate a password reset token"""
        delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
        now = datetime.utcnow()
        expires = now + delta
        exp = expires.timestamp()
        encoded_jwt = jwt.encode(
            {"exp": exp, "nbf": now, "sub": email},
            self.SECRET_KEY,
            algorithm=self.ALGORITHM,
        )
        return encoded_jwt

    def verify_password_reset_token(self, token: str) -> Optional[str]:
        """Verify a password reset token"""
        try:
            decoded_token = jwt.decode(
                token, self.SECRET_KEY, algorithms=[self.ALGORITHM]
            )
            return decoded_token["sub"]
        except JWTError:
            return None

    def generate_password(self, length: int = 12) -> str:
        """Generate a random password"""
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        while True:
            password = ''.join(secrets.choice(alphabet) for _ in range(length))
            if (any(c.islower() for c in password)
                    and any(c.isupper() for c in password)
                    and any(c.isdigit() for c in password)
                    and any(c in "!@#$%^&*" for c in password)):
                return password

# Create an instance of AuthService
auth_service = AuthService()

# These functions are kept at module level for compatibility with FastAPI Depends
def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    """
    Get the current user from the token.
    This is a compatibility wrapper around the AuthService method.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user)
):
    """
    Check if the current user is active.
    This is a compatibility wrapper around the AuthService method.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
