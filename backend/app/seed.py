from .database import Base,engine,SessionLocal
from .models import User,Profile,Property
from pwdlib import PasswordHash
names=['Aanya','Arjun','Meera','Kabir','Nisha','Dev','Riya','Vikram','Ishita','Samar','Tara','Neil','Pooja','Aditya','Zoya']
areas=['Koramangala','HSR Layout','Indiranagar','Bellandur','Whitefield']
def run():
 Base.metadata.create_all(engine);db=SessionLocal();h=PasswordHash.recommended()
 if db.query(User).count(): return
 for i,name in enumerate(names):
  u=User(email=f'{name.lower()}@demo.homiego.local',password_hash=h.hash('DemoPass123!'));db.add(u);db.flush();db.add(Profile(user_id=u.id,first_name=name,age=23+i%8,occupation=['Designer','Engineer','Analyst'][i%3],neighbourhood=areas[i%len(areas)],budget=20000+i*1000,bio='Fictional HomieGo demo profile.',preferences={'food':['Vegetarian','Eggetarian','Non-vegetarian'][i%3],'cleanliness':['tidy','relaxed'][i%2],'sleeping':['early','late'][i%2]}))
 owner=db.query(User).first()
 for i in range(8):db.add(Property(owner_id=owner.id,title=f'Demo Bengaluru home {i+1}',description='Fictional demonstration listing for product exploration.',neighbourhood=areas[i%len(areas)],rent=15000+i*2000,bedrooms=2,is_demo=True))
 db.commit()
if __name__=='__main__':run()
