from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    status
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, engine, get_db

from .models import (
    User,
    Profile,
    Property,
    Connection,
    Conversation,
    Message,
    Household,
    Expense
)

from .schemas import (
    ProfileIn,
    ProfileOut,
    PropertyIn,
    ExpenseIn,
    MessageIn
)

from .compatibility import score_preferences

from .core.config import CORS_ORIGINS

from .core.security import get_current_user

from .routers import auth


# ==================================================
# APPLICATION
# ==================================================

app = FastAPI(
    title="HomieGo API",
    version="1.0.0"
)


# ==================================================
# MIDDLEWARE
# ==================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ==================================================
# ROUTERS
# ==================================================

app.include_router(auth.router)


# ==================================================
# DATABASE INITIALIZATION
# ==================================================

@app.on_event("startup")
def startup():
    Base.metadata.create_all(engine)


# ==================================================
# HELPER FUNCTIONS
# ==================================================

def profile_out(profile):
    return ProfileOut.model_validate(profile)


# ==================================================
# HEALTH
# ==================================================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }


# ==================================================
# PROFILES
# ==================================================

@app.get(
    "/profiles/me",
    response_model=ProfileOut
)
def me(
    user: User = Depends(get_current_user)
):
    return profile_out(user.profile)


@app.put(
    "/profiles/me",
    response_model=ProfileOut
)
def update_profile(
    data: ProfileIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    for key, value in data.model_dump().items():
        setattr(user.profile, key, value)

    db.commit()
    db.refresh(user.profile)

    return profile_out(user.profile)


# ==================================================
# DISCOVERY
# ==================================================

@app.get(
    "/discover",
    response_model=list[ProfileOut]
)
def discover(
    neighbourhood: str | None = None,
    max_budget: float | None = None,
    food: str | None = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    query = select(Profile).where(
        Profile.user_id != user.id
    )

    if neighbourhood:
        query = query.where(
            Profile.neighbourhood == neighbourhood
        )

    if max_budget:
        query = query.where(
            Profile.budget <= max_budget
        )

    rows = db.scalars(query).all()

    if food:
        rows = [
            profile
            for profile in rows
            if profile.preferences.get("food") == food
        ]

    return [
        profile_out(profile)
        for profile in rows
    ]


# ==================================================
# COMPATIBILITY
# ==================================================

@app.get("/compatibility/{other_user_id}")
def compatibility(
    other_user_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    other = db.get(
        User,
        other_user_id
    )

    if not other or not other.profile:
        raise HTTPException(
            status_code=404,
            detail="Profile not found"
        )

    return score_preferences(
        user.profile.preferences or {},
        other.profile.preferences or {}
    )


# ==================================================
# PROPERTIES
# ==================================================

@app.post(
    "/properties",
    status_code=201
)
def create_property(
    data: PropertyIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    prop = Property(
        owner_id=user.id,
        **data.model_dump()
    )

    db.add(prop)
    db.commit()
    db.refresh(prop)

    return {
        "id": prop.id
    }


@app.get("/properties")
def list_properties(
    neighbourhood: str | None = None,
    max_rent: float | None = None,
    db: Session = Depends(get_db)
):

    query = select(Property)

    if neighbourhood:
        query = query.where(
            Property.neighbourhood == neighbourhood
        )

    if max_rent:
        query = query.where(
            Property.rent <= max_rent
        )

    properties = db.scalars(query).all()

    return [
        {
            "id": prop.id,
            "title": prop.title,
            "neighbourhood": prop.neighbourhood,
            "rent": str(prop.rent),
            "bedrooms": prop.bedrooms,
            "is_demo": prop.is_demo
        }
        for prop in properties
    ]


# ==================================================
# CONNECTIONS
# ==================================================

@app.post(
    "/connections/{recipient_id}",
    status_code=201
)
def connect(
    recipient_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if recipient_id == user.id:
        raise HTTPException(
            status_code=400,
            detail="Cannot connect to yourself"
        )

    existing = db.scalar(
        select(Connection).where(
            Connection.sender_id == user.id,
            Connection.recipient_id == recipient_id
        )
    )

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Connection already exists"
        )

    connection = Connection(
        sender_id=user.id,
        recipient_id=recipient_id
    )

    db.add(connection)
    db.commit()

    return {
        "id": connection.id,
        "status": connection.status
    }


# ==================================================
# MESSAGES
# ==================================================

@app.post(
    "/conversations/{conversation_id}/messages",
    status_code=201
)
def send_message(
    conversation_id: str,
    data: MessageIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    conversation = db.get(
        Conversation,
        conversation_id
    )

    if (
        not conversation
        or user.id not in conversation.member_ids
    ):
        raise HTTPException(
            status_code=403,
            detail="Not a conversation member"
        )

    message = Message(
        conversation_id=conversation.id,
        sender_id=user.id,
        body=data.body
    )

    db.add(message)
    db.commit()

    return {
        "id": message.id,
        "created_at": message.created_at
    }


# ==================================================
# HOUSEHOLDS
# ==================================================

@app.post(
    "/households",
    status_code=201
)
def household(
    name: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_household = Household(
        name=name,
        owner_id=user.id
    )

    db.add(new_household)
    db.commit()

    return {
        "id": new_household.id
    }


# ==================================================
# EXPENSES
# ==================================================

@app.post(
    "/households/{household_id}/expenses",
    status_code=201
)
def expense(
    household_id: str,
    data: ExpenseIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    household_record = db.get(
        Household,
        household_id
    )

    if (
        not household_record
        or household_record.owner_id != user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Not permitted"
        )

    new_expense = Expense(
        household_id=household_record.id,
        label=data.label,
        amount=data.amount,
        paid_by=user.id
    )

    db.add(new_expense)
    db.commit()

    return {
        "id": new_expense.id,
        "equal_share": str(data.amount / 3)
    }