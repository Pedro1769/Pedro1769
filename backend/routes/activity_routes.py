from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from typing import List, Optional
from datetime import datetime
from models import Activity, ActivityCreate, Submission, SubmissionCreate, SubmissionGrade, User, UserRole, ActivityType, SubmissionStatus
from database import get_database
from auth import get_current_user
import uuid
import os
import shutil

router = APIRouter(prefix="/activities", tags=["Activities"])

# Directorio para almacenar archivos subidos
UPLOAD_DIR = "/app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================================
# RUTAS PARA DOCENTES
# ============================================

@router.post("/", response_model=Activity)
async def create_activity(
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user)
):
    """Crear nueva actividad/tarea (solo docentes)"""
    # Verificar que sea docente
    if current_user.role not in [UserRole.DOCENTE_PRIMARIA, UserRole.DOCENTE_BACHILLERATO, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los docentes pueden crear actividades"
        )
    
    db = await get_database()
    
    # Crear actividad
    activity = Activity(
        **activity_data.dict(),
        teacher_id=current_user.id,
        teacher_name=current_user.name
    )
    
    result = await db.activities.insert_one(activity.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear actividad"
        )
    
    return activity

@router.get("/", response_model=List[Activity])
async def get_activities(
    grade: Optional[str] = None,
    subject: Optional[str] = None,
    period: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Obtener actividades (filtradas según el rol del usuario)"""
    db = await get_database()
    
    query = {"is_active": True}
    
    # Filtrar según rol
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        # Ver solo sus actividades o las de su grado
        query["$or"] = [
            {"teacher_id": current_user.id},
            {"grade": current_user.grade}
        ]
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Ver actividades de sus grados
        if current_user.grades:
            query["$or"] = [
                {"teacher_id": current_user.id},
                {"grade": {"$in": current_user.grades}}
            ]
    elif current_user.role == UserRole.ESTUDIANTE:
        # Ver solo actividades de su grado (necesitaría tener el grado del estudiante)
        # Por ahora permitimos ver todas
        pass
    
    # Aplicar filtros adicionales
    if grade:
        query["grade"] = grade
    if subject:
        query["subject"] = subject
    if period:
        query["period"] = period
    
    activities = await db.activities.find(query).sort("due_date", -1).to_list(1000)
    
    return [Activity(**activity) for activity in activities]

@router.get("/{activity_id}", response_model=Activity)
async def get_activity(
    activity_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener una actividad específica"""
    db = await get_database()
    
    activity = await db.activities.find_one({"_id": activity_id})
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )
    
    return Activity(**activity)

@router.put("/{activity_id}", response_model=Activity)
async def update_activity(
    activity_id: str,
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user)
):
    """Actualizar actividad (solo el docente creador)"""
    db = await get_database()
    
    activity = await db.activities.find_one({"_id": activity_id})
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )
    
    # Verificar que sea el creador o admin
    if activity["teacher_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar esta actividad"
        )
    
    update_data = activity_data.dict()
    update_data["updated_at"] = datetime.utcnow()
    
    await db.activities.update_one(
        {"_id": activity_id},
        {"$set": update_data}
    )
    
    updated_activity = await db.activities.find_one({"_id": activity_id})
    return Activity(**updated_activity)

@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: str,
    current_user: User = Depends(get_current_user)
):
    """Eliminar actividad (solo el docente creador o admin)"""
    db = await get_database()
    
    activity = await db.activities.find_one({"_id": activity_id})
    
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )
    
    # Verificar que sea el creador o admin
    if activity["teacher_id"] != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta actividad"
        )
    
    # Soft delete
    await db.activities.update_one(
        {"_id": activity_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    return {"success": True, "message": "Actividad eliminada exitosamente"}

# ============================================
# RUTAS PARA ENTREGAS (ESTUDIANTES)
# ============================================

@router.get("/{activity_id}/submissions", response_model=List[Submission])
async def get_activity_submissions(
    activity_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener todas las entregas de una actividad (solo docentes)"""
    if current_user.role not in [UserRole.DOCENTE_PRIMARIA, UserRole.DOCENTE_BACHILLERATO, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los docentes pueden ver las entregas"
        )
    
    db = await get_database()
    
    submissions = await db.submissions.find({"activity_id": activity_id}).to_list(1000)
    
    return [Submission(**submission) for submission in submissions]

@router.post("/{activity_id}/submit", response_model=Submission)
async def submit_activity(
    activity_id: str,
    submission_data: SubmissionCreate,
    current_user: User = Depends(get_current_user)
):
    """Entregar una actividad (solo estudiantes)"""
    if current_user.role != UserRole.ESTUDIANTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden entregar actividades"
        )
    
    db = await get_database()
    
    # Verificar que la actividad existe
    activity = await db.activities.find_one({"_id": activity_id})
    if not activity:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Actividad no encontrada"
        )
    
    # Verificar si ya existe una entrega
    existing = await db.submissions.find_one({
        "activity_id": activity_id,
        "student_id": current_user.id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya has entregado esta actividad"
        )
    
    # Verificar si está retrasada
    is_late = datetime.utcnow() > activity["due_date"]
    
    # Crear entrega
    submission = Submission(
        activity_id=activity_id,
        student_id=current_user.id,
        student_name=current_user.name,
        status=SubmissionStatus.ENVIADA,
        submitted_at=datetime.utcnow(),
        comments=submission_data.comments,
        is_late=is_late
    )
    
    result = await db.submissions.insert_one(submission.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear entrega"
        )
    
    return submission

@router.get("/my-submissions", response_model=List[Submission])
async def get_my_submissions(
    current_user: User = Depends(get_current_user)
):
    """Obtener mis entregas (solo estudiantes)"""
    if current_user.role != UserRole.ESTUDIANTE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los estudiantes pueden ver sus entregas"
        )
    
    db = await get_database()
    
    submissions = await db.submissions.find({"student_id": current_user.id}).to_list(1000)
    
    return [Submission(**submission) for submission in submissions]

@router.put("/submissions/{submission_id}/grade", response_model=Submission)
async def grade_submission(
    submission_id: str,
    grade_data: SubmissionGrade,
    current_user: User = Depends(get_current_user)
):
    """Calificar una entrega (solo docentes)"""
    if current_user.role not in [UserRole.DOCENTE_PRIMARIA, UserRole.DOCENTE_BACHILLERATO, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los docentes pueden calificar entregas"
        )
    
    db = await get_database()
    
    submission = await db.submissions.find_one({"_id": submission_id})
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Entrega no encontrada"
        )
    
    # Validar calificación
    if grade_data.grade < 0 or grade_data.grade > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La calificación debe estar entre 0 y 5"
        )
    
    # Actualizar entrega
    update_data = {
        "grade": grade_data.grade,
        "teacher_feedback": grade_data.teacher_feedback,
        "status": SubmissionStatus.CALIFICADA,
        "graded_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    await db.submissions.update_one(
        {"_id": submission_id},
        {"$set": update_data}
    )
    
    updated_submission = await db.submissions.find_one({"_id": submission_id})
    return Submission(**updated_submission)

# ============================================
# RUTAS PARA SUBIDA DE ARCHIVOS
# ============================================

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Subir archivo (docentes y estudiantes)"""
    try:
        # Generar nombre único para el archivo
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Guardar archivo
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Retornar URL del archivo
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "filename": file.filename,
            "url": file_url,
            "uploaded_at": datetime.utcnow()
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir archivo: {str(e)}"
        )
