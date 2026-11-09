import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy import String, Text, DateTime, Boolean, ForeignKey, Numeric, UniqueConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base
def uid(): return str(uuid.uuid4())
class Timestamped:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
class User(Timestamped, Base):
    __tablename__='users'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=uid)
    email: Mapped[str]=mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str]=mapped_column(String(255))
    role: Mapped[str]=mapped_column(String(20), default='user', index=True)
    is_active: Mapped[bool]=mapped_column(Boolean, default=True)
    profile: Mapped['Profile']=relationship(back_populates='user', uselist=False, cascade='all, delete-orphan')
class Profile(Timestamped, Base):
    __tablename__='profiles'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=uid)
    user_id: Mapped[str]=mapped_column(ForeignKey('users.id', ondelete='CASCADE'), unique=True, index=True)
    first_name: Mapped[str]=mapped_column(String(80), index=True)
    age: Mapped[int|None]=mapped_column()
    occupation: Mapped[str|None]=mapped_column(String(120))
    neighbourhood: Mapped[str|None]=mapped_column(String(100), index=True)
    budget: Mapped[Decimal|None]=mapped_column(Numeric(12,2))
    bio: Mapped[str|None]=mapped_column(Text)
    preferences: Mapped[dict]=mapped_column(JSON, default=dict)
    user: Mapped[User]=relationship(back_populates='profile')
class Property(Timestamped, Base):
    __tablename__='properties'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=uid)
    owner_id: Mapped[str]=mapped_column(ForeignKey('users.id', ondelete='CASCADE'), index=True)
    title: Mapped[str]=mapped_column(String(180), index=True)
    description: Mapped[str]=mapped_column(Text)
    neighbourhood: Mapped[str]=mapped_column(String(100), index=True)
    rent: Mapped[Decimal]=mapped_column(Numeric(12,2), index=True)
    bedrooms: Mapped[int]=mapped_column(default=1)
    is_demo: Mapped[bool]=mapped_column(Boolean, default=False)
class Connection(Timestamped, Base):
    __tablename__='connections'; __table_args__=(UniqueConstraint('sender_id','recipient_id',name='uq_connection_pair'),)
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=uid)
    sender_id: Mapped[str]=mapped_column(ForeignKey('users.id',ondelete='CASCADE'), index=True)
    recipient_id: Mapped[str]=mapped_column(ForeignKey('users.id',ondelete='CASCADE'), index=True)
    status: Mapped[str]=mapped_column(String(20), default='pending', index=True)
class Conversation(Timestamped, Base):
    __tablename__='conversations'
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    member_ids: Mapped[list]=mapped_column(JSON, default=list)
class Message(Timestamped, Base):
    __tablename__='messages'
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    conversation_id: Mapped[str]=mapped_column(ForeignKey('conversations.id',ondelete='CASCADE'),index=True)
    sender_id: Mapped[str]=mapped_column(ForeignKey('users.id',ondelete='CASCADE'),index=True)
    body: Mapped[str]=mapped_column(Text)
    read_at: Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
class Household(Timestamped, Base):
    __tablename__='households'
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    name: Mapped[str]=mapped_column(String(120))
    owner_id: Mapped[str]=mapped_column(ForeignKey('users.id'))
class Expense(Timestamped, Base):
    __tablename__='expenses'
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    household_id: Mapped[str]=mapped_column(ForeignKey('households.id',ondelete='CASCADE'),index=True)
    label: Mapped[str]=mapped_column(String(120))
    amount: Mapped[Decimal]=mapped_column(Numeric(12,2))
    paid_by: Mapped[str]=mapped_column(ForeignKey('users.id'))
class AuditLog(Base):
    __tablename__='audit_logs'
    id: Mapped[str]=mapped_column(String(36),primary_key=True,default=uid)
    actor_id: Mapped[str|None]=mapped_column(String(36),index=True)
    action: Mapped[str]=mapped_column(String(120)); metadata_: Mapped[dict]=mapped_column('metadata',JSON,default=dict)
    created_at: Mapped[datetime]=mapped_column(DateTime,default=datetime.utcnow)
