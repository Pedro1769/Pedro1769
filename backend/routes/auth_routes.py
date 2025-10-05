from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from datetime import timedelta
from auth import verify_password, create_access_token, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
from models import User, UserCreate, UserResponse, UserRole
from database import get_database
from auth import get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: UserResponse = None
    token: str = None

class RegisterRequest(BaseModel):
    username: str
    password: str
    name: str
    email: str
    phone: str = None
    role: UserRole = UserRole.PADRE  # Por defecto padre
    grade: str = None
    grades: list = None
    subjects: list = None

@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest):
    """Iniciar sesión"""
    try:
        db = await get_database()
        
        # Buscar usuario
        user_data = await db.users.find_one({"username": login_data.username})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario no encontrado"
            )
        
        # Verificar contraseña
        if not verify_password(login_data.password, user_data["password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Contraseña incorrecta"
            )
        
        # Verificar si el usuario está activo
        if not user_data.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario desactivado"
            )
        
        # Crear token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user_data["_id"], "role": user_data["role"]},
            expires_delta=access_token_expires
        )
        
        # Preparar respuesta del usuario
        user_response = UserResponse(
            id=user_data["_id"],
            username=user_data["username"],
            name=user_data["name"],
            role=user_data["role"],
            email=user_data["email"],
            phone=user_data.get("phone"),
            grade=user_data.get("grade"),
            grades=user_data.get("grades"),
            subjects=user_data.get("subjects"),
            is_active=user_data["is_active"],
            created_at=user_data["created_at"]
        )
        
        return LoginResponse(
            success=True,
            message=f"Bienvenido, {user_data['name']}",
            user=user_response,
            token=access_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error interno del servidor: {str(e)}"
        )

@router.post("/register", response_model=LoginResponse)
async def register(register_data: RegisterRequest):
    """Registrar nuevo usuario"""
    try:
        db = await get_database()
        
        # Verificar si el usuario ya existe
        existing_user = await db.users.find_one({"username": register_data.username})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está en uso"
            )
        
        # Verificar email único
        existing_email = await db.users.find_one({"email": register_data.email})
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )
        
        # Crear nuevo usuario
        user_create = UserCreate(
            username=register_data.username,
            password=register_data.password,
            name=register_data.name,
            email=register_data.email,
            phone=register_data.phone,
            role=register_data.role,
            grade=register_data.grade,
            grades=register_data.grades,
            subjects=register_data.subjects
        )
        
        # Crear objeto User con password hasheada
        user_dict = user_create.dict()
        user_dict["password"] = get_password_hash(user_dict["password"])
        user = User(**user_dict)
        
        # Insertar en base de datos
        result = await db.users.insert_one(user.dict(by_alias=True))
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al crear usuario"
            )
        
        # Crear token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role},
            expires_delta=access_token_expires
        )
        
        # Preparar respuesta
        user_response = UserResponse(
            id=user.id,
            username=user.username,
            name=user.name,
            role=user.role,
            email=user.email,
            phone=user.phone,
            grade=user.grade,
            grades=user.grades,
            subjects=user.subjects,
            is_active=user.is_active,
            created_at=user.created_at
        )
        
        return LoginResponse(
            success=True,
            message=f"Usuario {user.name} registrado exitosamente",
            user=user_response,
            token=access_token
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al registrar usuario: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """Cerrar sesión"""
    return {"success": True, "message": "Sesión cerrada exitosamente"}

async def get_current_user_direct(credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer())):
    """Función directa para obtener usuario sin dependencias complejas"""
    from database import get_database
    from jose import jwt, JWTError
    import os
    
    SECRET_KEY = os.getenv("SECRET_KEY", "gimnasio_americano_atlantico_secret_key_2025")
    ALGORITHM = "HS256"
    
    # Verificar token directamente
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )
    
    # Obtener usuario
    db = await get_database()
    user_data = await db.users.find_one({"_id": user_id})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return User(**user_data)

@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user_direct)):
    """Obtener perfil del usuario actual"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        name=current_user.name,
        role=current_user.role,
        email=current_user.email,
        phone=current_user.phone,
        grade=current_user.grade,
        grades=current_user.grades,
        subjects=current_user.subjects,
        is_active=current_user.is_active,
        created_at=current_user.created_at
    )