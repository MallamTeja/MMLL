from datetime import timedelta
from fastapi import APIRouter, Body, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Any

from .. import models, schemas
from ..database import get_db
from ..services.auth_service import auth_service, oauth2_scheme
from ..services.user_service import user_service

router = APIRouter()

@router.post("/login/access-token", response_model=schemas.Token)
async def login_access_token(
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """OAuth2 compatible token login, get an access token for future requests"""
    user = auth_service.authenticate_user(
        db, username=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect username or password"
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=auth_service.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": user.username}, 
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login/test-token", response_model=schemas.UserResponse)
def test_token(current_user: models.User = Depends(auth_service.get_current_user)):
    """Test access token"""
    return current_user

@router.post("/register", response_model=schemas.UserResponse)
def create_user(
    user_in: schemas.UserCreate,
    db: Session = Depends(get_db)
) -> Any:
    """Create new user"""
    # Check if username already exists
    user = user_service.get_user_by_username(db, username=user_in.username)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system."
        )
    
    # Check if email already exists
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system."
        )
    
    # Create new user
    user = user_service.create_user(db=db, user=user_in)
    return user

@router.post("/password-recovery/{email}", response_model=schemas.Msg)
def recover_password(email: str, db: Session = Depends(get_db)) -> Any:
    """Password Recovery"""
    user = user_service.get_user_by_email(db, email=email)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system."
        )
    
    # Generate password reset token
    password_reset_token = auth_service.generate_password_reset_token(email=email)
    
    # In a real application, send the email here
    # send_reset_password_email(
    #     email_to=user.email, 
    #     email=email, 
    #     token=password_reset_token
    # )
    
    return {"msg": "Password recovery email sent"}

@router.post("/reset-password/", response_model=schemas.Msg)
def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(get_db)
) -> Any:
    """Reset password"""
    email = auth_service.verify_password_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid token"
        )
    
    user = user_service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system."
        )
    
    # Update password
    hashed_password = auth_service.get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.commit()
    
    return {"msg": "Password updated successfully"}

@router.get("/me", response_model=schemas.UserResponse)
def read_user_me(
    current_user: models.User = Depends(auth_service.get_current_active_user)
) -> Any:
    """Get current user"""
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(auth_service.get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update current user"""
    # Prevent changing role and active status through this endpoint
    if user_in.role is not None and user_in.role != current_user.role:
        raise HTTPException(
            status_code=400,
            detail="Cannot change role through this endpoint"
        )
    
    if user_in.is_active is not None and user_in.is_active != current_user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Cannot change active status through this endpoint"
        )
    
    # Update user
    user = user_service.update_user(
        db=db, 
        user_id=current_user.id, 
        user_in=user_in
    )
    
    return user
