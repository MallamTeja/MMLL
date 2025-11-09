from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic import EmailStr
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.msg import Msg
from app.schemas.token import Token, TokenPayload

router = APIRouter()

# Email configuration
email_conf = ConnectionConfig(
    MAIL_USERNAME=settings.EMAILS_FROM_EMAIL,
    MAIL_PASSWORD=settings.EMAILS_FROM_PASSWORD,
    MAIL_FROM=settings.EMAILS_FROM_EMAIL,
    MAIL_PORT=settings.EMAILS_PORT,
    MAIL_SERVER=settings.EMAILS_SMTP_SERVER,
    MAIL_TLS=settings.EMAILS_USE_TLS,
    MAIL_SSL=settings.EMAILS_USE_SSL,
    USE_CREDENTIALS=True,
)

async def send_email_async(email_to: str, subject: str, html_content: str):
    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        html=html_content,
        subtype="html"
    )
    fm = FastMail(email_conf)
    await fm.send_message(message)

def send_reset_password_email(
    email_to: str, email: str, token: str
) -> None:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    server_host = settings.SERVER_HOST
    link = f"{server_host}/reset-password?token={token}"
    
    html_content = f"""
    <p>Hi {email},</p>
    <p>You requested a password reset. Please click the link below to set a new password:</p>
    <p><a href="{link}">Reset Password</a></p>
    <p>This link will expire in {settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS} hours.</p>
    <p>If you didn't request this, please ignore this email.</p>
    """
    
    # Run in background
    background_tasks = BackgroundTasks()
    background_tasks.add_task(
        send_email_async,
        email_to=email_to,
        subject=subject,
        html_content=html_content,
    )
    return background_tasks

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not crud.user.is_active(user):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.post("/login/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user

@router.post("/password-recovery/{email}", response_model=Msg)
async def recover_password(
    email: str, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Password Recovery
    """
    user = crud.user.get_by_email(db, email=email)
    
    if not user:
        # Don't reveal that the user doesn't exist
        return {"msg": "If this email is registered, you will receive a password reset link."}
    
    if not user.is_active:
        raise HTTPException(
            status_code=400,
            detail="Inactive user"
        )
    
    # Generate password reset token
    password_reset_token = deps.get_password_reset_token(email=email)
    
    # Send email with password reset link
    background_tasks += send_reset_password_email(
        email_to=user.email, email=email, token=password_reset_token
    )
    
    return {"msg": "Password recovery email sent"}

@router.post("/reset-password/", response_model=Msg)
async def reset_password(
    token: str = "",
    new_password: str = "",
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset password
    """
    if not token or not new_password:
        raise HTTPException(
            status_code=400,
            detail="Token and new password are required"
        )
    
    # Verify token
    email = await deps.verify_password_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=400,
            detail="Invalid token or expired token"
        )
    
    # Get user by email
    user = crud.user.get_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this email does not exist in the system.",
        )
    
    # Update password
    hashed_password = security.get_password_hash(new_password)
    user.hashed_password = hashed_password
    db.add(user)
    db.commit()
    
    return {"msg": "Password updated successfully"}

@router.post("/password-recovery/{email}", response_model=schemas.Msg)
def recover_password(email: str, db: Session = Depends(deps.get_db)) -> Any:
    """
    Password Recovery
    """
    user = crud.user.get_by_email(db, email=email)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this email does not exist in the system.",
        )
    
    # TODO: Implement password recovery logic
    # password_reset_token = generate_password_reset_token(email=email)
    # send_reset_password_email(
    #     email_to=user.email, email=email, token=password_reset_token
    # )
    
    return {"message": "Password recovery email sent"}

@router.post("/reset-password/", response_model=schemas.Msg)
def reset_password(
    token: str = Body(...),
    new_password: str = Body(...),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Reset password
    """
    # TODO: Implement password reset logic
    # email = verify_password_reset_token(token)
    # if not email:
    #     raise HTTPException(status_code=400, detail="Invalid token")
    # user = crud.user.get_by_email(db, email=email)
    # if not user:
    #     raise HTTPException(
    #         status_code=status.HTTP_404_NOT_FOUND,
    #         detail="The user with this username does not exist in the system.",
    #     )
    # elif not crud.user.is_active(user):
    #     raise HTTPException(status_code=400, detail="Inactive user")
    # hashed_password = get_password_hash(new_password)
    # user.hashed_password = hashed_password
    # db.add(user)
    # db.commit()
    return {"message": "Password updated successfully"}
