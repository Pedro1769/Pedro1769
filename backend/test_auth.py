from fastapi import APIRouter, HTTPException, status, Request
from jose import jwt, JWTError
import os
from database import get_database

router = APIRouter(prefix="/test-auth", tags=["Test Auth"])

@router.get("/profile-test")
async def profile_test(request: Request):
    """Test profile endpoint"""
    SECRET_KEY = os.getenv("SECRET_KEY", "gimnasio_americano_atlantico_secret_key_2025")
    ALGORITHM = "HS256"
    
    # Get Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not provided"
        )
    
    token = auth_header.replace("Bearer ", "")
    
    # Verify token
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    # Get user from database
    db = await get_database()
    user_data = await db.users.find_one({"_id": user_id})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return {
        "id": user_data["_id"],
        "username": user_data["username"],
        "name": user_data["name"],
        "role": user_data["role"],
        "email": user_data["email"]
    }