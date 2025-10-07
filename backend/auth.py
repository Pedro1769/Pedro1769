from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import os
import hashlib
from models import User, UserRole

# Configuración de seguridad
SECRET_KEY = os.getenv("SECRET_KEY", "gimnasio_americano_atlantico_secret_key_2025")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 480  # 8 horas

security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar contraseña usando SHA256"""
    return get_password_hash(plain_password) == hashed_password

def get_password_hash(password: str) -> str:
    """Hashear contraseña usando SHA256"""
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Crear token JWT"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verificar token JWT"""
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido"
        )

async def get_current_user(payload: dict = Depends(verify_token)) -> User:
    """Obtener usuario actual del token"""
    # Import here to avoid circular import
    from database import get_database
    
    user_id = payload.get("sub")
    db = await get_database()
    user_data = await db.users.find_one({"_id": user_id})
    
    if user_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return User(**user_data)

def require_roles(allowed_roles: List[UserRole]):
    """Decorator para requerir roles específicos"""
    def role_checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para esta acción"
            )
        return current_user
    return role_checker

# Funciones de autorización específicas
def require_admin():
    """Requiere rol de administrador"""
    return require_roles([UserRole.ADMIN])

def require_teacher():
    """Requiere cualquier rol de docente"""
    return require_roles([
        UserRole.DOCENTE_PRIMARIA, 
        UserRole.DOCENTE_BACHILLERATO
    ])

def require_convivencia():
    """Requiere rol de coordinador de convivencia"""
    return require_roles([UserRole.COORDINADOR_CONVIVENCIA])

def require_teacher_or_convivencia():
    """Requiere docente o coordinador de convivencia"""
    return require_roles([
        UserRole.DOCENTE_PRIMARIA,
        UserRole.DOCENTE_BACHILLERATO,
        UserRole.COORDINADOR_CONVIVENCIA
    ])

def require_admin_or_teacher():
    """Requiere administrador o docente"""
    return require_roles([
        UserRole.ADMIN,
        UserRole.DOCENTE_PRIMARIA,
        UserRole.DOCENTE_BACHILLERATO
    ])

def require_grade_assignment_roles():
    """Requiere roles que pueden asignar notas (admin, docentes, coordinadora)"""
    return require_roles([
        UserRole.ADMIN,
        UserRole.DOCENTE_PRIMARIA,
        UserRole.DOCENTE_BACHILLERATO,
        UserRole.COORDINADOR_CONVIVENCIA
    ])

def require_parent_or_student():
    """Requiere padre o estudiante"""
    return require_roles([UserRole.PADRE, UserRole.ESTUDIANTE])

def can_view_student_data(current_user: User, student_teacher_id: str = None, student_parent_id: str = None) -> bool:
    """Verificar si el usuario puede ver datos del estudiante"""
    if current_user.role == UserRole.ADMIN:
        return True
    elif current_user.role == UserRole.COORDINADOR_CONVIVENCIA:
        return True
    elif current_user.role in [UserRole.DOCENTE_PRIMARIA, UserRole.DOCENTE_BACHILLERATO]:
        return current_user.id == student_teacher_id
    elif current_user.role == UserRole.PADRE:
        return current_user.id == student_parent_id
    elif current_user.role == UserRole.ESTUDIANTE:
        # Los estudiantes solo ven sus propios datos (implementar lógica)
        return True
    
    return False

def can_assign_grades(current_user: User, subject: str = None) -> bool:
    """Verificar si el usuario puede asignar notas"""
    if current_user.role == UserRole.ADMIN:
        return True
    elif current_user.role == UserRole.DOCENTE_PRIMARIA:
        # Docentes de primaria pueden asignar notas en todas las materias de su grado
        return True
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Docentes de bachillerato solo en sus materias específicas
        return subject in current_user.subjects if current_user.subjects else False
    elif current_user.role == UserRole.COORDINADOR_CONVIVENCIA:
        # Coordinadora de convivencia puede asignar notas de convivencia y acompañamiento
        convivencia_subjects = ["CONVIVENCIA ESCOLAR", "ACOMPAÑAMIENTO DE ACUDIENTE", "ACOMPAÑAMIENTO DEL ACUDIENTE"]
        return subject in convivencia_subjects if subject else True
    
    return False