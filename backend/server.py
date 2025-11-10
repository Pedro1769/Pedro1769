from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get("SECRET_KEY", "pedro-math-pro-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 1 week

security = HTTPBearer()

# Emergent AI Integration
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")

# Create the main app
app = FastAPI(title="Pedro Math Pro API")
api_router = APIRouter(prefix="/api")

# Models
class UserRole(str):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

class Sede(str):
    SEDE_1 = "Sede 1"
    SEDE_2 = "Sede 2 Manuela Beltrán"
    SEDE_4 = "Sede 4 Robles"
    SEDE_GALAN = "Sede Galán"

class Nivel(str):
    SEMILLEROS = "Semilleros (Primaria)"
    NIVEL_1 = "Nivel 1 (6° y 7°)"
    NIVEL_2 = "Nivel 2 (8° y 9°)"
    NIVEL_3 = "Nivel 3 (10° y 11°)"

class TipoPensamiento(str):
    NUMERICO = "numérico"
    LOGICO = "lógico"
    ESPACIAL = "espacial"
    COTIDIANO = "cotidiano"

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: str = "student"
    sede: str
    nivel: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    role: str
    sede: str
    nivel: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class Question(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    texto: str
    opciones: List[str]  # 4 opciones
    respuesta_correcta: int  # índice de la respuesta correcta (0-3)
    nivel: str
    tipo_pensamiento: str
    categoria: str = "Matemáticas"
    imagen_base64: Optional[str] = None
    tiempo_sugerido: int = 30  # segundos
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuestionCreate(BaseModel):
    texto: str
    opciones: List[str]
    respuesta_correcta: int
    nivel: str
    tipo_pensamiento: str
    categoria: str = "Matemáticas"
    imagen_base64: Optional[str] = None
    tiempo_sugerido: int = 30

class QuestionUpdate(BaseModel):
    texto: Optional[str] = None
    opciones: Optional[List[str]] = None
    respuesta_correcta: Optional[int] = None
    nivel: Optional[str] = None
    tipo_pensamiento: Optional[str] = None
    categoria: Optional[str] = None
    imagen_base64: Optional[str] = None
    tiempo_sugerido: Optional[int] = None

class GenerateQuestionsRequest(BaseModel):
    nivel: str
    tipo_pensamiento: str
    cantidad: int = 10
    categoria: str = "Matemáticas"

# Utility functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"id": user_id})
    if user is None:
        raise credentials_exception
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

# Auth endpoints
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserRegister):
    # Check if user exists
    existing_user = await db.users.find_one({"$or": [
        {"username": user_data.username},
        {"email": user_data.email}
    ]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuario o email ya existe")
    
    # Create user
    user = User(
        username=user_data.username,
        email=user_data.email,
        role=user_data.role,
        sede=user_data.sede,
        nivel=user_data.nivel
    )
    user_dict = user.model_dump()
    user_dict["password_hash"] = get_password_hash(user_data.password)
    
    await db.users.insert_one(user_dict)
    
    # Create token
    access_token = create_access_token(data={"sub": user.id})
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"username": user_data.username})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    
    user_obj = User(**user)
    access_token = create_access_token(data={"sub": user_obj.id})
    return Token(access_token=access_token, token_type="bearer", user=user_obj)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Questions endpoints
@api_router.post("/questions", response_model=Question)
async def create_question(
    question_data: QuestionCreate,
    current_user: User = Depends(get_admin_user)
):
    question = Question(**question_data.model_dump())
    await db.questions.insert_one(question.model_dump())
    return question

@api_router.get("/questions", response_model=List[Question])
async def get_questions(
    nivel: Optional[str] = None,
    tipo_pensamiento: Optional[str] = None,
    categoria: Optional[str] = None,
    limit: int = 100,
    current_user: User = Depends(get_current_user)
):
    query = {}
    if nivel:
        query["nivel"] = nivel
    if tipo_pensamiento:
        query["tipo_pensamiento"] = tipo_pensamiento
    if categoria:
        query["categoria"] = categoria
    
    questions = await db.questions.find(query).limit(limit).to_list(limit)
    return [Question(**q) for q in questions]

@api_router.get("/questions/{question_id}", response_model=Question)
async def get_question(
    question_id: str,
    current_user: User = Depends(get_current_user)
):
    question = await db.questions.find_one({"id": question_id})
    if not question:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return Question(**question)

@api_router.put("/questions/{question_id}", response_model=Question)
async def update_question(
    question_id: str,
    question_data: QuestionUpdate,
    current_user: User = Depends(get_admin_user)
):
    update_data = {k: v for k, v in question_data.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    result = await db.questions.update_one(
        {"id": question_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    
    question = await db.questions.find_one({"id": question_id})
    return Question(**question)

@api_router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: User = Depends(get_admin_user)
):
    result = await db.questions.delete_one({"id": question_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pregunta no encontrada")
    return {"message": "Pregunta eliminada correctamente"}

@api_router.post("/questions/generate")
async def generate_questions(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_admin_user)
):
    """Genera preguntas usando IA"""
    try:
        prompt = f"""
Genera {request.cantidad} preguntas de matemáticas para estudiantes de nivel {request.nivel}.
Tipo de pensamiento: {request.tipo_pensamiento}
Categoría: {request.categoria}

Cada pregunta debe tener:
- Un enunciado claro y apropiado para el nivel
- Exactamente 4 opciones de respuesta
- Una respuesta correcta (indica cuál es con un número del 0 al 3)
- Ser desafiante pero apropiada para el nivel

Formato de respuesta JSON:
[
  {{
    "texto": "enunciado de la pregunta",
    "opciones": ["opción 1", "opción 2", "opción 3", "opción 4"],
    "respuesta_correcta": 0,
    "tiempo_sugerido": 30
  }}
]

Responde SOLO con el array JSON, sin texto adicional.
"""
        
        # Crear chat instance
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"gen-{uuid.uuid4()}",
            system_message="Eres un experto en crear preguntas educativas de matemáticas."
        ).with_model("openai", "gpt-4o-mini")
        
        # Enviar mensaje
        user_msg = UserMessage(text=prompt)
        response = await chat.send_message(user_msg)
        
        import json
        # Limpiar respuesta (a veces viene con markdown)
        content = response.strip()
        if content.startswith("```json"):
            content = content.replace("```json", "").replace("```", "").strip()
        elif content.startswith("```"):
            content = content.replace("```", "").strip()
        
        questions_data = json.loads(content)
        
        # Crear preguntas en la base de datos
        created_questions = []
        for q_data in questions_data:
            question = Question(
                texto=q_data["texto"],
                opciones=q_data["opciones"],
                respuesta_correcta=q_data["respuesta_correcta"],
                nivel=request.nivel,
                tipo_pensamiento=request.tipo_pensamiento,
                categoria=request.categoria,
                tiempo_sugerido=q_data.get("tiempo_sugerido", 30)
            )
            await db.questions.insert_one(question.model_dump())
            created_questions.append(question)
        
        return {
            "message": f"Se generaron {len(created_questions)} preguntas correctamente",
            "questions": created_questions
        }
    
    except Exception as e:
        logger.error(f"Error generando preguntas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generando preguntas: {str(e)}")

@api_router.get("/questions/count/by-level")
async def count_questions_by_level(current_user: User = Depends(get_current_user)):
    """Cuenta preguntas por nivel"""
    pipeline = [
        {"$group": {"_id": "$nivel", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    result = await db.questions.aggregate(pipeline).to_list(100)
    return {item["_id"]: item["count"] for item in result}

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
