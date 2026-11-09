from decimal import Decimal
from pydantic import BaseModel, EmailStr, Field, ConfigDict
class RegisterIn(BaseModel): email: EmailStr; password: str = Field(min_length=10,max_length=128); first_name: str=Field(min_length=1,max_length=80)
class LoginIn(BaseModel): email: EmailStr; password: str
class TokenOut(BaseModel): access_token:str; token_type:str='bearer'
class ProfileIn(BaseModel): first_name:str=Field(min_length=1,max_length=80); age:int|None=Field(default=None,ge=18,le=100); occupation:str|None=None; neighbourhood:str|None=None; budget:Decimal|None=Field(default=None,ge=0); bio:str|None=Field(default=None,max_length=1000); preferences:dict={}
class ProfileOut(ProfileIn): model_config=ConfigDict(from_attributes=True); id:str; user_id:str
class PropertyIn(BaseModel): title:str=Field(min_length=3,max_length=180); description:str=Field(min_length=10,max_length=5000); neighbourhood:str; rent:Decimal=Field(gt=0); bedrooms:int=Field(default=1,ge=1,le=20)
class ExpenseIn(BaseModel): label:str=Field(min_length=1,max_length=120); amount:Decimal=Field(gt=0)
class MessageIn(BaseModel): body:str=Field(min_length=1,max_length=2000)
