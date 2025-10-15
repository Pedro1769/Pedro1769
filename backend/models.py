from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

# Enums para el sistema
class UserRole(str, Enum):
    ADMIN = "admin"
    DOCENTE_PRIMARIA = "docente_primaria"
    DOCENTE_BACHILLERATO = "docente_bachillerato"
    COORDINADOR_CONVIVENCIA = "coordinador_convivencia"
    PADRE = "padre"
    ESTUDIANTE = "estudiante"

class PerformanceLevel(str, Enum):
    SUPERIOR = "SUPERIOR"
    ALTO = "ALTO"
    BASICO = "BASICO"
    BAJO = "BAJO"

class ProjectStatus(str, Enum):
    ACTIVO = "Activo"
    EN_DESARROLLO = "En desarrollo"
    FINALIZADO = "Finalizado"

class ObservationType(str, Enum):
    CONVIVENCIA_POSITIVA = "Convivencia Positiva"
    LLAMADO_ATENCION = "Llamado de Atención"
    COMPROMISO_ACADEMICO = "Compromiso Académico"
    SEGUIMIENTO_COMPORTAMENTAL = "Seguimiento Comportamental"
    REUNION_ACUDIENTE = "Reunión con Acudiente"

# Modelos Pydantic
class User(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    username: str
    password: str  # Será hasheada
    name: str
    role: UserRole
    email: EmailStr
    phone: Optional[str] = None
    grade: Optional[str] = None  # Solo docentes primaria
    grades: Optional[List[str]] = None  # Solo docentes bachillerato
    subjects: Optional[List[str]] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class UserCreate(BaseModel):
    username: str
    password: str
    name: str
    role: UserRole
    email: EmailStr
    phone: Optional[str] = None
    grade: Optional[str] = None
    grades: Optional[List[str]] = None
    subjects: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    role: UserRole
    email: str
    phone: Optional[str] = None
    grade: Optional[str] = None
    grades: Optional[List[str]] = None
    subjects: Optional[List[str]] = None
    is_active: bool
    created_at: datetime

class Student(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    name: str
    grade: str
    level: str  # PREESCOLAR, BÁSICA PRIMARIA, BÁSICA SECUNDARIA, MEDIA VOCACIONAL
    teacher_id: Optional[str] = None  # Docente a cargo (primaria) o tutor (bachillerato)
    parent_id: Optional[str] = None
    document_number: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class StudentCreate(BaseModel):
    name: str
    grade: str
    level: str
    teacher_id: Optional[str] = None
    parent_id: Optional[str] = None
    document_number: Optional[str] = None

class Grade(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    student_id: str
    teacher_id: str
    subject: str
    period: str  # I, II, III, IV
    grade: float
    teacher_notes: Optional[str] = None
    performance_level: Optional[PerformanceLevel] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class GradeCreate(BaseModel):
    student_id: str
    subject: str
    period: str
    grade: float
    teacher_notes: Optional[str] = None

class ConvivenciaObservation(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    student_id: str
    teacher_id: str
    type: ObservationType
    observation: str
    period: str
    follow_up: Optional[str] = None
    is_positive: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class ConvivenciaCreate(BaseModel):
    student_id: str
    type: ObservationType
    observation: str
    period: str
    follow_up: Optional[str] = None
    is_positive: bool = True

class Project(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    title: str
    description: str
    uploaded_by: str  # teacher_id
    target_grades: List[str]
    status: ProjectStatus
    file_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class ProjectCreate(BaseModel):
    title: str
    description: str
    target_grades: List[str]
    status: ProjectStatus = ProjectStatus.ACTIVO
    file_url: Optional[str] = None

class BulletinCode(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    student_id: str
    period: str
    code: str
    expires_at: datetime
    is_used: bool = False
    download_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class SystemSettings(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    setting_key: str
    setting_value: Any
    description: Optional[str] = None
    updated_by: str
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

# Modelos de respuesta consolidada
class StudentGrades(BaseModel):
    student: Student
    grades: Dict[str, Dict[str, float]]  # {period: {subject: grade}}
    average_by_period: Dict[str, float]
    total_average: float
    performance_level: PerformanceLevel
    status: str  # GANA, PIERDE, REQUIERE AYUDA

class ConsolidatedReport(BaseModel):
    students: List[StudentGrades]
    periods: List[str]
    statistics: Dict[str, Any]
    generated_by: str
    generated_at: datetime = Field(default_factory=datetime.utcnow)

# Funciones helper para determinar niveles de desempeño
def calculate_performance_level(grade: float) -> PerformanceLevel:
    if grade >= 4.6:
        return PerformanceLevel.SUPERIOR
    elif grade >= 4.0:
        return PerformanceLevel.ALTO
    elif grade >= 3.0:
        return PerformanceLevel.BASICO
    else:
        return PerformanceLevel.BAJO

def calculate_student_status(average: float) -> str:
    if average >= 3.0:
        return "GANA"
    elif average >= 2.5:
        return "REQUIERE AYUDA"
    else:
        return "PIERDE"

# Constantes del sistema
SUBJECTS_PRIMARIA = [
    "HUMANIDADES", "INGLÉS", "MATEMÁTICA", "GEOMETRÍA", "ESTADÍSTICA",
    "CIENCIAS NATURALES", "CIENCIAS SOCIALES", "CÁTEDRA DE LA PAZ",
    "ÉTICA Y RELIGIÓN", "TECNOLOGÍA", "INFORMÁTICA",
    "EDUCACIÓN FÍSICA", "CONVIVENCIA ESCOLAR", "ACOMPAÑAMIENTO DEL ACUDIENTE"
]

SUBJECTS_BACHILLERATO = [
    "HUMANIDADES", "LENGUA CASTELLANA", "INGLÉS", "MATEMÁTICA", "GEOMETRÍA", "ESTADÍSTICA",
    "BIOLOGÍA", "QUÍMICA", "FÍSICA", "CIENCIAS SOCIALES", "FILOSOFÍA",
    "ÉTICA Y RELIGIÓN", "TECNOLOGÍA", "INFORMÁTICA", "EDUCACIÓN FÍSICA", "EMPRENDIMIENTO",
    "PROYECTO DE VIDA", "SERVICIO SOCIAL"
]

GRADES_PREESCOLAR = ["Transición"]
GRADES_PRIMARIA = ["1°", "2°", "3°", "4°", "5°"]
GRADES_BACHILLERATO = ["6°", "7°", "8°", "9°", "10°", "11°"]
PERIODS = ["I", "II", "III", "IV"]