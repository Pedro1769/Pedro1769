"""Script para crear un usuario administrador"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Check if admin exists
    existing = await db.users.find_one({"username": "admin"})
    if existing:
        print("Admin user already exists!")
        return
    
    # Create admin user
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "email": "admin@pedromathpro.com",
        "password_hash": pwd_context.hash("admin123"),
        "role": "admin",
        "sede": "Sede 1",
        "nivel": None,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(admin_user)
    print("Admin user created successfully!")
    print("Username: admin")
    print("Password: admin123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(create_admin())
