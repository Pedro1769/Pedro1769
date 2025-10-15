from fastapi import FastAPI, APIRouter, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pathlib import Path
import os
import logging
from datetime import datetime

# Importar rutas
from routes.auth_routes import router as auth_router
from routes.student_routes import router as student_router
from routes.grade_routes import router as grade_router
from routes.convivencia_routes import router as convivencia_router
from routes.project_routes import router as project_router
from routes.bulletin_routes import router as bulletin_router
from routes.admin_routes import router as admin_router
from test_auth import router as test_auth_router

# Importar base de datos
from database import connect_to_mongo, close_mongo_connection, init_database

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Crear la aplicación FastAPI
app = FastAPI(
    title="Sistema de Gestión Escolar GADA",
    description="Gimnasio Americano del Atlántico - Sistema Integral de Gestión Académica",
    version="1.0.0"
)

# Crear router con prefijo /api
api_router = APIRouter(prefix="/api")

# Agregar las rutas al router
api_router.include_router(auth_router)
api_router.include_router(student_router)
api_router.include_router(grade_router)
api_router.include_router(convivencia_router)
api_router.include_router(project_router)
api_router.include_router(bulletin_router)
api_router.include_router(admin_router)
api_router.include_router(test_auth_router)

# Ruta de estado básica
@api_router.get("/")
async def root():
    return {
        "message": "Sistema de Gestión Escolar GADA API",
        "version": "1.0.0",
        "institution": "Gimnasio Americano del Atlántico",
        "coordinator": "Pedro Hurtado",
        "timestamp": datetime.utcnow()
    }

@api_router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "service": "GAA Academic Management System"
    }

# Incluir el router en la aplicación
app.include_router(api_router)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear directorio de uploads
uploads_dir = Path("/app/uploads")
uploads_dir.mkdir(exist_ok=True)
(uploads_dir / "projects").mkdir(exist_ok=True)

# Servir archivos estáticos
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    """Inicializar conexión a base de datos"""
    try:
        await connect_to_mongo()
        logger.info("✅ Conexión a MongoDB establecida")
        
        # Inicializar base de datos con datos de muestra
        await init_database()
        logger.info("✅ Base de datos inicializada")
        
    except Exception as e:
        logger.error(f"❌ Error al conectar a MongoDB: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_db_client():
    """Cerrar conexión a base de datos"""
    try:
        await close_mongo_connection()
        logger.info("✅ Conexión a MongoDB cerrada")
    except Exception as e:
        logger.error(f"❌ Error al cerrar conexión: {e}")

# Middleware para logging de requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.utcnow()
    
    response = await call_next(request)
    
    process_time = (datetime.utcnow() - start_time).total_seconds()
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.4f}s"
    )
    
    return response

# Manejo de errores personalizado
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error no manejado en {request.url.path}: {str(exc)}")
    return {
        "error": "Error interno del servidor",
        "detail": "Ha ocurrido un error inesperado. Por favor contacte al administrador.",
        "timestamp": datetime.utcnow()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)