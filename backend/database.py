from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
from datetime import datetime
import os
from models import *
from models import calculate_performance_level
from auth import get_password_hash

class Database:
    client: Optional[AsyncIOMotorClient] = None

db = Database()

async def get_database():
    return db.client[os.environ['DB_NAME']]

async def connect_to_mongo():
    """Crear conexión a MongoDB"""
    db.client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    
async def close_mongo_connection():
    """Cerrar conexión a MongoDB"""
    db.client.close()

async def init_database():
    """Inicializar base de datos con datos de prueba"""
    database = await get_database()
    
    # Verificar si ya hay datos
    users_count = await database.users.count_documents({})
    if users_count > 0:
        return
    
    # Crear usuario administrador
    admin_user = {
        "_id": "admin001",
        "username": "pedro.hurtado",
        "password": get_password_hash("gim123"),
        "name": "Pedro Hurtado",
        "role": UserRole.ADMIN,
        "email": "pedro_12hurbe@hotmail.com",
        "phone": "3011968877",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Crear docentes de muestra
    teachers = [
        {
            "_id": "doc001",
            "username": "yocelyn.cabarcas",
            "password": get_password_hash("gim123"),
            "name": "Yocelyn Cabarcas Navarro",
            "role": UserRole.DOCENTE_PRIMARIA,
            "email": "yocelyn.cabarcas@gimamericano.edu.co",
            "grade": "1°",
            "subjects": SUBJECTS_PRIMARIA,
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "doc002",
            "username": "bifencia.orozco",
            "password": get_password_hash("gim123"),
            "name": "Bifencia Orozco Tordecilla",
            "role": UserRole.DOCENTE_BACHILLERATO,
            "email": "bifencia.orozco@gimamericano.edu.co",
            "grades": ["6°", "7°", "8°", "9°", "10°", "11°"],
            "subjects": ["MATEMÁTICA", "INGLÉS", "CIENCIAS NATURALES", "CIENCIAS SOCIALES", "EDUCACIÓN FÍSICA", "EDUCACIÓN ARTÍSTICA", "EDUCACIÓN RELIGIOSA", "ÉTICA Y VALORES", "TECNOLOGÍA E INFORMÁTICA", "FILOSOFÍA", "FÍSICA", "QUÍMICA", "BIOLOGÍA", "LENGUA CASTELLANA", "EMPRENDIMIENTO"],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "doc003",
            "username": "carolina.sierra",
            "password": get_password_hash("gim123"),
            "name": "Carolina Sierra",
            "role": UserRole.DOCENTE_BACHILLERATO,
            "email": "carolina.sierra@gimamericano.edu.co",
            "subjects": ["MATEMÁTICA", "GEOMETRÍA"],
            "grades": ["6°", "7°", "8°", "9°", "10°", "11°"],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "conv001",
            "username": "coord.convivencia",
            "password": get_password_hash("gim123"),
            "name": "Coordinadora de Convivencia",
            "role": UserRole.COORDINADOR_CONVIVENCIA,
            "email": "convivencia@gimamericano.edu.co",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Crear padres de muestra
    parents = [
        {
            "_id": "pad001",
            "username": "padre.anton",
            "password": get_password_hash("gim123"),
            "name": "Padre de Antón Rosanía",
            "role": UserRole.PADRE,
            "email": "padre.anton@gmail.com",
            "phone": "3001234567",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "pad002",
            "username": "padre.ashley",
            "password": get_password_hash("gim123"),
            "name": "Padre de Ashley Muñoz",
            "role": UserRole.PADRE,
            "email": "padre.ashley@gmail.com",
            "phone": "3009876543",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Crear estudiantes de muestra
    students = [
        {
            "_id": "est001",
            "name": "ANTÓN ROSANÍA GABRIEL ESTEBAN",
            "grade": "2°",
            "level": "BÁSICA PRIMARIA",
            "teacher_id": "doc001",
            "parent_id": "pad001",
            "document_number": "1234567890",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "est002",
            "name": "MUÑOZ RADA ASHLEY SALOME",
            "grade": "1°",
            "level": "BÁSICA PRIMARIA",
            "teacher_id": "doc002",
            "parent_id": "pad002",
            "document_number": "0987654321",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "est003",
            "name": "GEOVANNY ERICK SALAS PÁEZ",
            "grade": "11°",
            "level": "MEDIA VOCACIONAL",
            "teacher_id": "doc003",
            "document_number": "1122334455",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "est004",
            "name": "TALAIGUA PERIRAN DANNY MANUEL",
            "grade": "3°",
            "level": "BÁSICA PRIMARIA",
            "teacher_id": "doc001",
            "document_number": "5544332211",
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    # Insertar datos de muestra
    await database.users.insert_one(admin_user)
    await database.users.insert_many(teachers + parents)
    await database.students.insert_many(students)
    
    # Crear algunas notas de muestra
    sample_grades = [
        {
            "_id": "grade001",
            "student_id": "est001",
            "teacher_id": "doc001",
            "subject": "HUMANIDADES",
            "period": "I",
            "grade": 2.5,
            "performance_level": calculate_performance_level(2.5),
            "teacher_notes": "Necesita mejorar lectura comprensiva",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "grade002",
            "student_id": "est001",
            "teacher_id": "doc001",
            "subject": "MATEMÁTICA",
            "period": "I",
            "grade": 4.0,
            "performance_level": calculate_performance_level(4.0),
            "teacher_notes": "Buen desempeño en operaciones básicas",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "grade003",
            "student_id": "est002",
            "teacher_id": "doc002",
            "subject": "HUMANIDADES",
            "period": "I",
            "grade": 4.5,
            "performance_level": calculate_performance_level(4.5),
            "teacher_notes": "Excelente participación",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await database.grades.insert_many(sample_grades)
    
    # Crear configuraciones del sistema
    system_settings = [
        {
            "_id": "set001",
            "setting_key": "current_period",
            "setting_value": "I",
            "description": "Período académico actual",
            "updated_by": "admin001",
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "set002",
            "setting_key": "grades_visible_to_parents",
            "setting_value": True,
            "description": "Visibilidad de notas para padres",
            "updated_by": "admin001",
            "updated_at": datetime.utcnow()
        },
        {
            "_id": "set003",
            "setting_key": "grades_visible_to_students",
            "setting_value": False,
            "description": "Visibilidad de notas para estudiantes",
            "updated_by": "admin001",
            "updated_at": datetime.utcnow()
        }
    ]
    
    await database.system_settings.insert_many(system_settings)
    
    print("✅ Base de datos inicializada con datos de muestra")