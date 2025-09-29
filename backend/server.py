from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Modelos para el sistema académico
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    role: str  # 'admin', 'teacher', 'coordinadora_convivencia', 'student', 'parent'
    document: str = ""
    phone: str = ""
    subjects: List[str] = []
    grades: List[str] = []
    teaching_level: str = ""
    is_approved: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    name: str
    email: str
    role: str
    document: str = ""
    phone: str = ""
    subjects: List[str] = []
    grades: List[str] = []
    teaching_level: str = ""

class Student(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    grade: str
    document: str
    age: int = 0
    parent_email: str = ""
    parent_phone: str = ""
    created_by: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class StudentCreate(BaseModel):
    name: str
    grade: str
    document: str
    age: int = 0
    parent_email: str = ""
    parent_phone: str = ""
    created_by: str = ""

# Modelos adicionales para el sistema académico
class Grade(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    subject: str
    grade: str  # grado del estudiante 
    period: str
    score: float
    teacher_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class GradeCreate(BaseModel):
    student_id: str
    subject: str
    grade: str
    period: str
    score: float
    teacher_id: str

class Observation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    teacher_id: str
    grade: str  # grado del estudiante
    period: str
    type: str  # 'behavioral', 'academic', 'positive', etc.
    description: str
    date: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ObservationCreate(BaseModel):
    student_id: str
    teacher_id: str
    grade: str
    period: str
    type: str
    description: str

class ConvivenciaNote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_id: str
    coordinator_id: str
    grade: str
    period: str
    behavior_note: str = ""
    accompaniment_note: str = ""
    parent_note: str = ""
    recommendations: str = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ConvivenciaNoteCreate(BaseModel):
    student_id: str
    coordinator_id: str
    grade: str
    period: str
    behavior_note: str = ""
    accompaniment_note: str = ""
    parent_note: str = ""
    recommendations: str = ""

# Modelo para configuraciones administrativas
class AdminConfig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    config_key: str  # 'student_grades_enabled', 'student_bulletin_download_enabled', etc.
    config_value: bool
    enabled_periods: List[str] = []  # períodos específicos habilitados
    admin_id: str
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AdminConfigCreate(BaseModel):
    config_key: str
    config_value: bool
    enabled_periods: List[str] = []
    admin_id: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Endpoints para usuarios
@api_router.post("/users", response_model=User)
async def create_user(user_data: UserCreate):
    user_dict = user_data.dict()
    user_obj = User(**user_dict)
    _ = await db.users.insert_one(user_obj.dict())
    return user_obj

@api_router.get("/users", response_model=List[User])
async def get_users():
    users = await db.users.find().to_list(1000)
    return [User(**user) for user in users]

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return User(**user)

# Endpoints para estudiantes
@api_router.post("/students", response_model=Student)
async def create_student(student_data: StudentCreate):
    student_dict = student_data.dict()
    student_obj = Student(**student_dict)
    _ = await db.students.insert_one(student_obj.dict())
    return student_obj

@api_router.get("/students", response_model=List[Student])
async def get_students():
    students = await db.students.find().to_list(1000)
    return [Student(**student) for student in students]

@api_router.get("/students/{student_id}", response_model=Student)
async def get_student(student_id: str):
    student = await db.students.find_one({"id": student_id})
    if not student:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return Student(**student)

# Endpoints para calificaciones
@api_router.post("/grades", response_model=Grade)
async def create_grade(grade_data: GradeCreate):
    grade_dict = grade_data.dict()
    grade_obj = Grade(**grade_dict)
    _ = await db.grades.insert_one(grade_obj.dict())
    return grade_obj

@api_router.get("/grades", response_model=List[Grade])
async def get_grades(student_id: str = None, teacher_id: str = None, period: str = None, grade: str = None):
    query = {}
    if student_id:
        query["student_id"] = student_id
    if teacher_id:
        query["teacher_id"] = teacher_id  
    if period:
        query["period"] = period
    if grade:
        query["grade"] = grade
    
    grades = await db.grades.find(query).to_list(1000)
    return [Grade(**grade) for grade in grades]

# Endpoints para observaciones
@api_router.post("/observations", response_model=Observation)
async def create_observation(observation_data: ObservationCreate):
    observation_dict = observation_data.dict()
    observation_obj = Observation(**observation_dict)
    _ = await db.observations.insert_one(observation_obj.dict())
    return observation_obj

@api_router.get("/observations", response_model=List[Observation])
async def get_observations(student_id: str = None, teacher_id: str = None, period: str = None, grade: str = None):
    query = {}
    if student_id:
        query["student_id"] = student_id
    if teacher_id:
        query["teacher_id"] = teacher_id
    if period:
        query["period"] = period
    if grade:
        query["grade"] = grade
    
    observations = await db.observations.find(query).to_list(1000)
    return [Observation(**obs) for obs in observations]

# Endpoints para notas de convivencia
@api_router.post("/convivencia-notes", response_model=ConvivenciaNote)
async def create_convivencia_note(note_data: ConvivenciaNoteCreate):
    note_dict = note_data.dict()
    note_obj = ConvivenciaNote(**note_dict)
    _ = await db.convivencia_notes.insert_one(note_obj.dict())
    return note_obj

@api_router.get("/convivencia-notes", response_model=List[ConvivenciaNote])
async def get_convivencia_notes(student_id: str = None, coordinator_id: str = None, period: str = None, grade: str = None):
    query = {}
    if student_id:
        query["student_id"] = student_id
    if coordinator_id:
        query["coordinator_id"] = coordinator_id
    if period:
        query["period"] = period
    if grade:
        query["grade"] = grade
    
    notes = await db.convivencia_notes.find(query).to_list(1000)
    return [ConvivenciaNote(**note) for note in notes]

# Endpoint para autenticación (simple)
@api_router.post("/auth/login")
async def login(email: str, password: str):
    # Por ahora, solo validamos que el usuario existe
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return {"user": User(**user), "token": "dummy_token"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
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
