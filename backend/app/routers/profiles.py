from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import ProfileIn, ProfileOut
from ..core.security import get_current_user


router = APIRouter(
    prefix="/profiles",
    tags=["Profiles"]
)


@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    user: User = Depends(get_current_user)
):
    """
    Retrieve the authenticated user's profile.
    """

    if not user.profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return ProfileOut.model_validate(user.profile)


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    data: ProfileIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update the authenticated user's profile.
    """

    if not user.profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    for key, value in data.model_dump().items():
        setattr(user.profile, key, value)

    db.commit()
    db.refresh(user.profile)

    return ProfileOut.model_validate(user.profile)