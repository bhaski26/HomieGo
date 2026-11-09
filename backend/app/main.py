import os
from datetime import datetime, timedelta, timezone
import jwt
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pwdlib import PasswordHash
from sqlalchemy import select, or_
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from .models import User, Profile, Property, Connection, Conversation, Message, Household, Expense
from .schemas import RegisterIn, LoginIn, TokenOut, ProfileIn, ProfileOut, PropertyIn, ExpenseIn, MessageIn
from .compatibility import score_preferences

SECRET=os.getenv('SECRET_KEY','development-only-change-me')
ALGO='HS256'; bearer=HTTPBearer(); pwd=PasswordHash.recommended()
app=FastAPI(title='HomieGo API',version='1.0.0')
app.add_middleware(CORSMiddleware,allow_origins=os.getenv('CORS_ORIGINS','http://localhost:5173').split(','),allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
@app.on_event('startup')
def startup(): Base.metadata.create_all(engine)
def token(user): return jwt.encode({'sub':user.id,'role':user.role,'exp':datetime.now(timezone.utc)+timedelta(minutes=int(os.getenv('ACCESS_TOKEN_MINUTES','1440')))},SECRET,algorithm=ALGO)
def current(creds:HTTPAuthorizationCredentials=Depends(bearer),db:Session=Depends(get_db)):
    try: data=jwt.decode(creds.credentials,SECRET,algorithms=[ALGO]); user=db.get(User,data['sub'])
    except Exception: raise HTTPException(401,'Invalid or expired session')
    if not user or not user.is_active: raise HTTPException(401,'Account unavailable')
    return user
def profile_out(p): return ProfileOut.model_validate(p)
@app.get('/health')
def health(): return {'status':'ok'}
@app.post('/auth/register',response_model=TokenOut,status_code=201)
def register(data:RegisterIn,db:Session=Depends(get_db)):
    if db.scalar(select(User).where(User.email==data.email.lower())): raise HTTPException(409,'Email already registered')
    user=User(email=data.email.lower(),password_hash=pwd.hash(data.password)); db.add(user); db.flush(); db.add(Profile(user_id=user.id,first_name=data.first_name,preferences={})); db.commit(); return {'access_token':token(user)}
@app.post('/auth/login',response_model=TokenOut)
def login(data:LoginIn,db:Session=Depends(get_db)):
    user=db.scalar(select(User).where(User.email==data.email.lower()))
    if not user or not pwd.verify(data.password,user.password_hash): raise HTTPException(status.HTTP_401_UNAUTHORIZED,'Incorrect email or password')
    return {'access_token':token(user)}
@app.get('/profiles/me',response_model=ProfileOut)
def me(user:User=Depends(current)): return profile_out(user.profile)
@app.put('/profiles/me',response_model=ProfileOut)
def update_profile(data:ProfileIn,user:User=Depends(current),db:Session=Depends(get_db)):
    for k,v in data.model_dump().items(): setattr(user.profile,k,v)
    db.commit();db.refresh(user.profile);return profile_out(user.profile)
@app.get('/discover',response_model=list[ProfileOut])
def discover(neighbourhood:str|None=None,max_budget:float|None=None,food:str|None=None,user:User=Depends(current),db:Session=Depends(get_db)):
    q=select(Profile).where(Profile.user_id!=user.id)
    if neighbourhood:q=q.where(Profile.neighbourhood==neighbourhood)
    if max_budget:q=q.where(Profile.budget<=max_budget)
    rows=db.scalars(q).all()
    if food: rows=[p for p in rows if p.preferences.get('food')==food]
    return [profile_out(p) for p in rows]
@app.get('/compatibility/{other_user_id}')
def compatibility(other_user_id:str,user:User=Depends(current),db:Session=Depends(get_db)):
    other=db.get(User,other_user_id)
    if not other or not other.profile:raise HTTPException(404,'Profile not found')
    return score_preferences(user.profile.preferences or {},other.profile.preferences or {})
@app.post('/properties',status_code=201)
def create_property(data:PropertyIn,user:User=Depends(current),db:Session=Depends(get_db)):
    prop=Property(owner_id=user.id,**data.model_dump());db.add(prop);db.commit();db.refresh(prop);return {'id':prop.id}
@app.get('/properties')
def list_properties(neighbourhood:str|None=None,max_rent:float|None=None,db:Session=Depends(get_db)):
    q=select(Property)
    if neighbourhood:q=q.where(Property.neighbourhood==neighbourhood)
    if max_rent:q=q.where(Property.rent<=max_rent)
    return [{'id':p.id,'title':p.title,'neighbourhood':p.neighbourhood,'rent':str(p.rent),'bedrooms':p.bedrooms,'is_demo':p.is_demo} for p in db.scalars(q).all()]
@app.post('/connections/{recipient_id}',status_code=201)
def connect(recipient_id:str,user:User=Depends(current),db:Session=Depends(get_db)):
    if recipient_id==user.id:raise HTTPException(400,'Cannot connect to yourself')
    if db.scalar(select(Connection).where(Connection.sender_id==user.id,Connection.recipient_id==recipient_id)):raise HTTPException(409,'Connection already exists')
    c=Connection(sender_id=user.id,recipient_id=recipient_id);db.add(c);db.commit();return {'id':c.id,'status':c.status}
@app.post('/conversations/{conversation_id}/messages',status_code=201)
def send_message(conversation_id:str,data:MessageIn,user:User=Depends(current),db:Session=Depends(get_db)):
    c=db.get(Conversation,conversation_id)
    if not c or user.id not in c.member_ids:raise HTTPException(403,'Not a conversation member')
    m=Message(conversation_id=c.id,sender_id=user.id,body=data.body);db.add(m);db.commit();return {'id':m.id,'created_at':m.created_at}
@app.post('/households',status_code=201)
def household(name:str,user:User=Depends(current),db:Session=Depends(get_db)):
    h=Household(name=name,owner_id=user.id);db.add(h);db.commit();return {'id':h.id}
@app.post('/households/{household_id}/expenses',status_code=201)
def expense(household_id:str,data:ExpenseIn,user:User=Depends(current),db:Session=Depends(get_db)):
    h=db.get(Household,household_id)
    if not h or h.owner_id!=user.id:raise HTTPException(403,'Not permitted')
    e=Expense(household_id=h.id,label=data.label,amount=data.amount,paid_by=user.id);db.add(e);db.commit();return {'id':e.id,'equal_share':str(data.amount/3)}
