from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
import logging

from .. import models, schemas
from .base_service import BaseService
from .auth_service import auth_service

logger = logging.getLogger(__name__)

class UserService:
    """Service class for user-related operations"""
    
    def __init__(self):
        self.base_service = BaseService[models.User, schemas.UserCreate, schemas.UserUpdate](models.User)
    
    def get_user(self, db: Session, user_id: int) -> Optional[models.User]:
        """Get a user by ID"""
        return self.base_service.get(db, user_id)
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[models.User]:
        """Get a user by email"""
        return db.query(models.User).filter(models.User.email == email).first()
    
    def get_user_by_username(self, db: Session, username: str) -> Optional[models.User]:
        """Get a user by username"""
        return db.query(models.User).filter(models.User.username == username).first()
    
    def get_users(
        self, 
        db: Session, 
        skip: int = 0, 
        limit: int = 100,
        **filters
    ) -> Tuple[List[models.User], int]:
        """Get paginated list of users with optional filtering"""
        return self.base_service.get_multi_paginated(
            db, skip=skip, limit=limit, **filters
        )
    
    def create_user(
        self, 
        db: Session, 
        user: schemas.UserCreate
    ) -> models.User:
        """Create a new user"""
        # Hash the password
        hashed_password = auth_service.get_password_hash(user.password)
        
        # Create user in database
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
    
    def update_user(
        self, 
        db: Session, 
        user_id: int, 
        user_in: schemas.UserUpdate
    ) -> Optional[models.User]:
        """Update a user"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None
            
        update_data = user_in.dict(exclude_unset=True)
        
        # Handle password update
        if "password" in update_data:
            hashed_password = auth_service.get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        
        # Update user data
        for field, value in update_data.items():
            setattr(db_user, field, value)
            
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        """Delete a user"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return False
            
        db.delete(db_user)
        db.commit()
        return True
    
    def update_user_role(
        self,
        db: Session,
        user_id: int,
        role: schemas.UserRole
    ) -> Optional[models.User]:
        """Update a user's role"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None
            
        db_user.role = role
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def update_user_status(
        self,
        db: Session,
        user_id: int,
        is_active: bool
    ) -> Optional[models.User]:
        """Update a user's active status"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None
            
        db_user.is_active = is_active
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def get_user_roles(self) -> List[Dict[str, str]]:
        """Get list of available user roles"""
        return [{"value": role.value, "label": role.value.capitalize()} 
                for role in schemas.UserRole]

# Create an instance of UserService
user_service = UserService()
