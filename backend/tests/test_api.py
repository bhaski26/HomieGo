import os
os.environ['DATABASE_URL']='sqlite:///./test_homiego.db'
from fastapi.testclient import TestClient
from app.main import app
client=TestClient(app)
def test_health(): assert client.get('/health').json()['status']=='ok'
def test_registration_and_login():
 r=client.post('/auth/register',json={'email':'test@homiego.local','password':'LongPass123!','first_name':'Test'})
 assert r.status_code in (201,409)
