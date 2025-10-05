from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from models import ConvivenciaObservation, ConvivenciaCreate, Student, User, UserRole, ObservationType
from database import get_database
from auth import get_current_user, require_teacher_or_convivencia, can_view_student_data
from datetime import datetime

router = APIRouter(prefix="/convivencia", tags=["Convivencia"])

@router.get("/student/{student_id}", response_model=List[ConvivenciaObservation])
async def get_student_observations(
    student_id: str,
    period: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Obtener observaciones de convivencia de un estudiante"""
    db = await get_database()
    
    # Verificar que el estudiante existe
    student_data = await db.students.find_one({"_id": student_id})
    if not student_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    student = Student(**student_data)
    
    # Verificar permisos
    if not can_view_student_data(current_user, student.teacher_id, student.parent_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para ver las observaciones de este estudiante"
        )
    
    # Construir filtro
    filter_query = {"student_id": student_id}
    if period:
        filter_query["period"] = period
    
    observations_data = await db.convivencia_observations.find(filter_query).sort("created_at", -1).to_list(1000)
    return [ConvivenciaObservation(**obs) for obs in observations_data]

@router.post("", response_model=ConvivenciaObservation)
async def create_observation(
    observation_data: ConvivenciaCreate,
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Crear observación de convivencia"""
    db = await get_database()
    
    # Verificar que el estudiante existe
    student_data = await db.students.find_one({"_id": observation_data.student_id})
    if not student_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    student = Student(**student_data)
    
    # Verificar permisos para crear observaciones
    if (current_user.role == UserRole.DOCENTE_PRIMARIA and 
        current_user.id != student.teacher_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puede crear observaciones para sus estudiantes"
        )
    elif (current_user.role == UserRole.DOCENTE_BACHILLERATO and 
          student.grade not in (current_user.grades or [])):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede crear observaciones para estudiantes de este grado"
        )
    
    # Crear observación
    observation = ConvivenciaObservation(
        student_id=observation_data.student_id,
        teacher_id=current_user.id,
        type=observation_data.type,
        observation=observation_data.observation,
        period=observation_data.period,
        follow_up=observation_data.follow_up,
        is_positive=observation_data.is_positive
    )
    
    result = await db.convivencia_observations.insert_one(observation.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear observación"
        )
    
    return observation

@router.put("/{observation_id}", response_model=ConvivenciaObservation)
async def update_observation(
    observation_id: str,
    observation_data: ConvivenciaCreate,
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Actualizar observación de convivencia"""
    db = await get_database()
    
    # Verificar que la observación existe
    existing_observation = await db.convivencia_observations.find_one({"_id": observation_id})
    if not existing_observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observación no encontrada"
        )
    
    # Verificar permisos
    if (current_user.role != UserRole.COORDINADOR_CONVIVENCIA and 
        existing_observation["teacher_id"] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede editar esta observación"
        )
    
    # Actualizar
    update_data = {
        "type": observation_data.type,
        "observation": observation_data.observation,
        "period": observation_data.period,
        "follow_up": observation_data.follow_up,
        "is_positive": observation_data.is_positive,
        "updated_at": datetime.utcnow()
    }
    
    result = await db.convivencia_observations.update_one(
        {"_id": observation_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observación no encontrada"
        )
    
    updated_observation = await db.convivencia_observations.find_one({"_id": observation_id})
    return ConvivenciaObservation(**updated_observation)

@router.get("/reports/period/{period}")
async def get_convivencia_reports(
    period: str,
    grade: Optional[str] = Query(None),
    observation_type: Optional[ObservationType] = Query(None),
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Obtener reportes de convivencia por período"""
    db = await get_database()
    
    # Construir filtro
    filter_query = {"period": period}
    
    if grade:
        # Obtener estudiantes del grado
        students_data = await db.students.find({"grade": grade, "is_active": True}).to_list(1000)
        student_ids = [s["_id"] for s in students_data]
        filter_query["student_id"] = {"$in": student_ids}
    
    if observation_type:
        filter_query["type"] = observation_type
    
    # Filtrar por permisos del usuario
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        filter_query["teacher_id"] = current_user.id
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Obtener estudiantes de los grados que maneja
        if current_user.grades:
            students_data = await db.students.find({
                "grade": {"$in": current_user.grades},
                "is_active": True
            }).to_list(1000)
            student_ids = [s["_id"] for s in students_data]
            filter_query["student_id"] = {"$in": student_ids}
    
    # Obtener observaciones
    observations_data = await db.convivencia_observations.find(filter_query).sort("created_at", -1).to_list(1000)
    
    # Obtener información de estudiantes
    student_ids = list(set([obs["student_id"] for obs in observations_data]))
    students_data = await db.students.find({"_id": {"$in": student_ids}}).to_list(1000)
    students_dict = {s["_id"]: s for s in students_data}
    
    # Enriquecer observaciones con datos del estudiante
    enriched_observations = []
    for obs in observations_data:
        student_data = students_dict.get(obs["student_id"])
        if student_data:
            obs_with_student = {
                **obs,
                "student_name": student_data["name"],
                "student_grade": student_data["grade"]
            }
            enriched_observations.append(obs_with_student)
    
    # Generar estadísticas
    total_observations = len(enriched_observations)
    positive_observations = len([obs for obs in enriched_observations if obs.get("is_positive", True)])
    negative_observations = total_observations - positive_observations
    
    # Estadísticas por tipo
    type_stats = {}
    for obs in enriched_observations:
        obs_type = obs["type"]
        if obs_type not in type_stats:
            type_stats[obs_type] = 0
        type_stats[obs_type] += 1
    
    return {
        "period": period,
        "observations": enriched_observations,
        "statistics": {
            "total": total_observations,
            "positive": positive_observations,
            "negative": negative_observations,
            "by_type": type_stats
        },
        "filters_applied": {
            "grade": grade,
            "observation_type": observation_type
        },
        "generated_by": current_user.name,
        "generated_at": datetime.utcnow()
    }

@router.delete("/{observation_id}")
async def delete_observation(
    observation_id: str,
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Eliminar observación de convivencia"""
    db = await get_database()
    
    # Verificar que la observación existe
    existing_observation = await db.convivencia_observations.find_one({"_id": observation_id})
    if not existing_observation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observación no encontrada"
        )
    
    # Verificar permisos
    if (current_user.role != UserRole.COORDINADOR_CONVIVENCIA and 
        existing_observation["teacher_id"] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede eliminar esta observación"
        )
    
    # Eliminar
    result = await db.convivencia_observations.delete_one({"_id": observation_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Observación no encontrada"
        )
    
    return {"success": True, "message": "Observación eliminada exitosamente"}

@router.get("/students/special-cases")
async def get_special_cases(
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Obtener estudiantes con casos especiales de convivencia"""
    db = await get_database()
    
    # Buscar estudiantes con múltiples observaciones negativas
    pipeline = [
        {"$match": {"is_positive": False}},
        {"$group": {
            "_id": "$student_id",
            "negative_count": {"$sum": 1},
            "latest_observation": {"$max": "$created_at"}
        }},
        {"$match": {"negative_count": {"$gte": 2}}},  # 2 o más observaciones negativas
        {"$sort": {"negative_count": -1}}
    ]
    
    special_cases = await db.convivencia_observations.aggregate(pipeline).to_list(100)
    
    # Obtener información de los estudiantes
    student_ids = [case["_id"] for case in special_cases]
    students_data = await db.students.find({"_id": {"$in": student_ids}}).to_list(1000)
    students_dict = {s["_id"]: s for s in students_data}
    
    # Filtrar por permisos del usuario
    filtered_cases = []
    for case in special_cases:
        student_data = students_dict.get(case["_id"])
        if student_data:
            student = Student(**student_data)
            
            # Verificar permisos
            if can_view_student_data(current_user, student.teacher_id, student.parent_id):
                filtered_cases.append({
                    "student": {
                        "id": student.id,
                        "name": student.name,
                        "grade": student.grade,
                        "teacher_id": student.teacher_id
                    },
                    "negative_observations_count": case["negative_count"],
                    "latest_observation_date": case["latest_observation"]
                })
    
    return {
        "special_cases": filtered_cases,
        "total_cases": len(filtered_cases),
        "generated_by": current_user.name,
        "generated_at": datetime.utcnow()
    }