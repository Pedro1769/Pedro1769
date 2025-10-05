from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional, Dict, Any
from models import User, UserCreate, UserResponse, SystemSettings, UserRole
from database import get_database
from auth import get_current_user, require_admin, get_password_hash
from datetime import datetime

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    role: Optional[UserRole] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: User = Depends(require_admin)
):
    """Obtener todos los usuarios (solo admin)"""
    db = await get_database()
    
    # Construir filtro
    filter_query = {}
    if role:
        filter_query["role"] = role
    if is_active is not None:
        filter_query["is_active"] = is_active
    
    users_data = await db.users.find(filter_query).to_list(1000)
    
    return [
        UserResponse(
            id=user["_id"],
            username=user["username"],
            name=user["name"],
            role=user["role"],
            email=user["email"],
            phone=user.get("phone"),
            grade=user.get("grade"),
            grades=user.get("grades"),
            subjects=user.get("subjects"),
            is_active=user["is_active"],
            created_at=user["created_at"]
        ) for user in users_data
    ]

@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(require_admin)
):
    """Crear usuario (solo admin)"""
    db = await get_database()
    
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está en uso"
        )
    
    # Verificar email único
    existing_email = await db.users.find_one({"email": user_data.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Crear usuario
    user_dict = user_data.dict()
    user_dict["password"] = get_password_hash(user_dict["password"])
    user = User(**user_dict)
    
    result = await db.users.insert_one(user.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear usuario"
        )
    
    return UserResponse(
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

@router.put("/users/{user_id}/toggle-status")
async def toggle_user_status(
    user_id: str,
    current_user: User = Depends(require_admin)
):
    """Activar/desactivar usuario (solo admin)"""
    db = await get_database()
    
    # Verificar que el usuario existe
    user_data = await db.users.find_one({"_id": user_id})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # No permitir desactivar al admin actual
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede desactivar su propia cuenta"
        )
    
    # Cambiar estado
    new_status = not user_data["is_active"]
    
    result = await db.users.update_one(
        {"_id": user_id},
        {"$set": {"is_active": new_status, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    action = "activado" if new_status else "desactivado"
    return {
        "success": True,
        "message": f"Usuario {action} exitosamente",
        "user_id": user_id,
        "new_status": new_status
    }

@router.get("/statistics")
async def get_admin_statistics(
    current_user: User = Depends(require_admin)
):
    """Obtener estadísticas generales del sistema (solo admin)"""
    db = await get_database()
    
    # Estadísticas de usuarios
    total_users = await db.users.count_documents({"is_active": True})
    users_by_role = {}
    for role in UserRole:
        count = await db.users.count_documents({"role": role, "is_active": True})
        users_by_role[role] = count
    
    # Estadísticas de estudiantes
    total_students = await db.students.count_documents({"is_active": True})
    students_by_grade = {}
    grades = ["Transición", "1°", "2°", "3°", "4°", "5°", "6°", "7°", "8°", "9°", "10°", "11°"]
    for grade in grades:
        count = await db.students.count_documents({"grade": grade, "is_active": True})
        if count > 0:
            students_by_grade[grade] = count
    
    # Estadísticas de notas (período actual)
    current_period = "I"  # TODO: Obtener de configuración
    total_grades = await db.grades.count_documents({"period": current_period})
    
    # Promedio general del período
    pipeline = [
        {"$match": {"period": current_period}},
        {"$group": {"_id": None, "average_grade": {"$avg": "$grade"}}}
    ]
    avg_result = await db.grades.aggregate(pipeline).to_list(1)
    average_grade = avg_result[0]["average_grade"] if avg_result else 0.0
    
    # Estadísticas de convivencia
    total_observations = await db.convivencia_observations.count_documents({"period": current_period})
    positive_observations = await db.convivencia_observations.count_documents({
        "period": current_period,
        "is_positive": True
    })
    
    # Proyectos activos
    active_projects = await db.projects.count_documents({"status": "Activo"})
    
    return {
        "users": {
            "total": total_users,
            "by_role": users_by_role
        },
        "students": {
            "total": total_students,
            "by_grade": students_by_grade
        },
        "academic": {
            "total_grades": total_grades,
            "average_grade": round(average_grade, 2),
            "current_period": current_period
        },
        "convivencia": {
            "total_observations": total_observations,
            "positive_observations": positive_observations,
            "negative_observations": total_observations - positive_observations
        },
        "projects": {
            "active_projects": active_projects
        },
        "generated_at": datetime.utcnow()
    }

@router.get("/settings")
async def get_system_settings(
    current_user: User = Depends(require_admin)
):
    """Obtener configuraciones del sistema (solo admin)"""
    db = await get_database()
    
    settings_data = await db.system_settings.find({}).to_list(1000)
    
    settings_dict = {}
    for setting in settings_data:
        settings_dict[setting["setting_key"]] = {
            "value": setting["setting_value"],
            "description": setting.get("description"),
            "updated_by": setting["updated_by"],
            "updated_at": setting["updated_at"]
        }
    
    return settings_dict

@router.put("/settings/{setting_key}")
async def update_system_setting(
    setting_key: str,
    setting_value: Any,
    description: Optional[str] = None,
    current_user: User = Depends(require_admin)
):
    """Actualizar configuración del sistema (solo admin)"""
    db = await get_database()
    
    # Validar configuraciones específicas
    valid_settings = {
        "current_period": ["I", "II", "III", "IV"],
        "grades_visible_to_parents": [True, False],
        "grades_visible_to_students": [True, False],
        "bulletin_generation_enabled": [True, False]
    }
    
    if setting_key in valid_settings:
        if setting_value not in valid_settings[setting_key]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Valor inválido para {setting_key}. Valores permitidos: {valid_settings[setting_key]}"
            )
    
    # Actualizar o crear configuración
    update_data = {
        "setting_key": setting_key,
        "setting_value": setting_value,
        "updated_by": current_user.id,
        "updated_at": datetime.utcnow()
    }
    
    if description:
        update_data["description"] = description
    
    result = await db.system_settings.update_one(
        {"setting_key": setting_key},
        {"$set": update_data},
        upsert=True
    )
    
    return {
        "success": True,
        "message": f"Configuración {setting_key} actualizada exitosamente",
        "setting_key": setting_key,
        "new_value": setting_value
    }

@router.post("/bulk-operations/students/delete")
async def bulk_delete_students(
    student_ids: List[str],
    current_user: User = Depends(require_admin)
):
    """Eliminar estudiantes en lote (solo admin)"""
    db = await get_database()
    
    if len(student_ids) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden eliminar más de 100 estudiantes a la vez"
        )
    
    result = await db.students.update_many(
        {"_id": {"$in": student_ids}},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    return {
        "success": True,
        "message": f"Se eliminaron {result.modified_count} estudiantes",
        "deleted_count": result.modified_count,
        "requested_count": len(student_ids)
    }

@router.post("/backup/export")
async def export_system_data(
    current_user: User = Depends(require_admin)
):
    """Exportar datos del sistema (solo admin)"""
    db = await get_database()
    
    # Esta es una implementación básica
    # En producción se debería implementar exportación completa
    
    # Contar registros por colección
    collections_count = {}
    collections = ["users", "students", "grades", "convivencia_observations", "projects", "bulletin_codes"]
    
    for collection in collections:
        count = await db[collection].count_documents({})
        collections_count[collection] = count
    
    return {
        "success": True,
        "message": "Exportación completada",
        "collections": collections_count,
        "export_date": datetime.utcnow(),
        "exported_by": current_user.name
    }

@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(require_admin)
):
    """Eliminar usuario permanentemente (solo admin)"""
    db = await get_database()
    
    # Verificar que el usuario existe
    user_data = await db.users.find_one({"_id": user_id})
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    # No permitir eliminar al admin actual
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puede eliminar su propia cuenta"
        )
    
    # Verificar si el usuario tiene estudiantes asignados
    if user_data["role"] in [UserRole.DOCENTE_PRIMARIA, UserRole.DOCENTE_BACHILLERATO]:
        students_count = await db.students.count_documents({"teacher_id": user_id, "is_active": True})
        if students_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No se puede eliminar el usuario porque tiene {students_count} estudiantes asignados"
            )
    
    # Eliminar usuario
    result = await db.users.delete_one({"_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return {
        "success": True,
        "message": f"Usuario {user_data['name']} eliminado permanentemente"
    }