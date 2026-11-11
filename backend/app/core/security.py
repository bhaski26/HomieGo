from datetime import datetime, timedelta, timezone

import jwt

from fastapi import Depends, HTTPException
from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer
)

from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User

from .config import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_MINUTES
)


bearer_scheme = HTTPBearer()

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    return password_hasher.verify(
        password,
        hashed_password
    )


def create_access_token(user: User) -> str:

    payload = {
        "sub": user.id,
        "role": user.role,
        "exp": datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        bearer_scheme
    ),
    db: Session = Depends(get_db)
) -> User:

    try:
        payload = jwt.decode(
            credentials.credentials,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user = db.get(User, payload["sub"])

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired session"
        )

    if not user or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Account unavailable"
        )

    return user