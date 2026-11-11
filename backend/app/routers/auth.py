from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Profile
from ..schemas import RegisterIn, LoginIn, TokenOut
from ..core.security import (
    hash_password,
    verify_password,
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post(
    "/register",
    response_model=TokenOut,
    status_code=201
)
def register(
    data: RegisterIn,
    db: Session = Depends(get_db)
):

    existing_user = db.scalar(
        select(User).where(
            User.email == data.email.lower()
        )
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    user = User(
        email=data.email.lower(),
        password_hash=hash_password(data.password)
    )

    db.add(user)
    db.flush()

    profile = Profile(
        user_id=user.id,
        first_name=data.first_name,
        preferences={}
    )

    db.add(profile)
    db.commit()

    return {
        "access_token": create_access_token(user)
    }


@router.post(
    "/login",
    response_model=TokenOut
)
def login(
    data: LoginIn,
    db: Session = Depends(get_db)
):

    user = db.scalar(
        select(User).where(
            User.email == data.email.lower()
        )
    )

    if (
        not user
        or not verify_password(
            data.password,
            user.password_hash
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )

    return {
        "access_token": create_access_token(user)
    }