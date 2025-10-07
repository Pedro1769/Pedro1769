from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional, Dict, Any
from models import Grade, GradeCreate, Student, User, UserRole, calculate_performance_level, calculate_student_status
from database import get_database
from auth import get_current_user, require_admin_or_teacher, can_assign_grades, can_view_student_data, require_admin
from datetime import datetime

router = APIRouter(prefix="/grades", tags=["Grades"])

@router.get("/student/{student_id}", response_model=List[Grade])
async def get_student_grades(
    student_id: str,
    period: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Obtener notas de un estudiante"""
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
            detail="No tiene permisos para ver las notas de este estudiante"
        )
    
    # Construir filtro
    filter_query = {"student_id": student_id}
    if period:
        filter_query["period"] = period
    
    grades_data = await db.grades.find(filter_query).to_list(1000)
    return [Grade(**grade) for grade in grades_data]

@router.post("", response_model=Grade)
async def assign_grade(
    grade_data: GradeCreate,
    current_user: User = Depends(require_admin_or_teacher())
):
    """Asignar nota a estudiante"""
    db = await get_database()
    
    # Verificar que el estudiante existe
    student_data = await db.students.find_one({"_id": grade_data.student_id})
    if not student_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # Verificar permisos para asignar notas
    if not can_assign_grades(current_user, grade_data.subject):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para asignar notas en esta materia"
        )
    
    # Verificar si ya existe una nota para este estudiante, materia y período
    existing_grade = await db.grades.find_one({
        "student_id": grade_data.student_id,
        "subject": grade_data.subject,
        "period": grade_data.period
    })
    
    if existing_grade:
        # Actualizar nota existente
        performance_level = calculate_performance_level(grade_data.grade)
        
        update_data = {
            "grade": grade_data.grade,
            "performance_level": performance_level,
            "teacher_notes": grade_data.teacher_notes,
            "updated_at": datetime.utcnow()
        }
        
        result = await db.grades.update_one(
            {"_id": existing_grade["_id"]},
            {"$set": update_data}
        )
        
        updated_grade = await db.grades.find_one({"_id": existing_grade["_id"]})
        return Grade(**updated_grade)
    
    else:
        # Crear nueva nota
        performance_level = calculate_performance_level(grade_data.grade)
        
        grade = Grade(
            student_id=grade_data.student_id,
            teacher_id=current_user.id,
            subject=grade_data.subject,
            period=grade_data.period,
            grade=grade_data.grade,
            performance_level=performance_level,
            teacher_notes=grade_data.teacher_notes
        )
        
        result = await db.grades.insert_one(grade.dict(by_alias=True))
        
        if not result.inserted_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error al asignar nota"
            )
        
        return grade

@router.put("/{grade_id}", response_model=Grade)
async def update_grade(
    grade_id: str,
    grade_data: GradeCreate,
    current_user: User = Depends(require_admin_or_teacher())
):
    """Actualizar nota existente"""
    db = await get_database()
    
    # Verificar que la nota existe
    existing_grade = await db.grades.find_one({"_id": grade_id})
    if not existing_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )
    
    # Verificar permisos
    if (current_user.role != UserRole.ADMIN and 
        existing_grade["teacher_id"] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede editar esta nota"
        )
    
    # Actualizar
    performance_level = calculate_performance_level(grade_data.grade)
    
    update_data = {
        "grade": grade_data.grade,
        "performance_level": performance_level,
        "teacher_notes": grade_data.teacher_notes,
        "updated_at": datetime.utcnow()
    }
    
    result = await db.grades.update_one(
        {"_id": grade_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )
    
    updated_grade = await db.grades.find_one({"_id": grade_id})
    return Grade(**updated_grade)

@router.get("/consolidated")
async def get_consolidated_grades(
    periods: List[str] = Query(...),
    grade: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Obtener consolidado de notas por períodos"""
    db = await get_database()
    
    # Construir filtro de estudiantes según rol
    students_filter = {"is_active": True}
    
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        students_filter["teacher_id"] = current_user.id
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        if current_user.grades:
            students_filter["grade"] = {"$in": current_user.grades}
    elif current_user.role == UserRole.PADRE:
        students_filter["parent_id"] = current_user.id
    
    if grade:
        students_filter["grade"] = grade
    
    # Obtener estudiantes
    students_data = await db.students.find(students_filter).to_list(1000)
    
    consolidated_data = []
    statistics = {"total": 0, "ganan": 0, "pierden": 0, "requieren_ayuda": 0}
    
    for student_data in students_data:
        student = Student(**student_data)
        
        # Obtener notas del estudiante para los períodos seleccionados
        grades_data = await db.grades.find({
            "student_id": student.id,
            "period": {"$in": periods}
        }).to_list(1000)
        
        # Organizar notas por período y materia
        grades_by_period = {}
        for grade_data in grades_data:
            period = grade_data["period"]
            subject = grade_data["subject"]
            
            if period not in grades_by_period:
                grades_by_period[period] = {}
            
            grades_by_period[period][subject] = grade_data["grade"]
        
        # Calcular promedios por período
        period_averages = {}
        for period in periods:
            if period in grades_by_period and grades_by_period[period]:
                period_grades = list(grades_by_period[period].values())
                period_averages[period] = round(sum(period_grades) / len(period_grades), 1)
            else:
                period_averages[period] = 0.0
        
        # Calcular promedio total
        valid_averages = [avg for avg in period_averages.values() if avg > 0]
        total_average = round(sum(valid_averages) / len(valid_averages), 1) if valid_averages else 0.0
        
        # Determinar estado y nivel de desempeño
        performance_level = calculate_performance_level(total_average)
        status = calculate_student_status(total_average)
        
        consolidated_data.append({
            "student": {
                "id": student.id,
                "name": student.name,
                "grade": student.grade,
                "level": student.level
            },
            "grades_by_period": grades_by_period,
            "period_averages": period_averages,
            "total_average": total_average,
            "performance_level": performance_level,
            "status": status
        })
        
        # Actualizar estadísticas
        statistics["total"] += 1
        if status == "GANA":
            statistics["ganan"] += 1
        elif status == "PIERDE":
            statistics["pierden"] += 1
        else:
            statistics["requieren_ayuda"] += 1
    
    return {
        "students": consolidated_data,
        "periods": periods,
        "statistics": statistics,
        "generated_by": current_user.name,
        "generated_at": datetime.utcnow()
    }

@router.delete("/{grade_id}")
async def delete_grade(
    grade_id: str,
    current_user: User = Depends(require_admin_or_teacher())
):
    """Eliminar nota"""
    db = await get_database()
    
    # Verificar que la nota existe
    existing_grade = await db.grades.find_one({"_id": grade_id})
    if not existing_grade:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )
    
    # Verificar permisos
    if (current_user.role != UserRole.ADMIN and 
        existing_grade["teacher_id"] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede eliminar esta nota"
        )
    
    # Eliminar
    result = await db.grades.delete_one({"_id": grade_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )
    
    return {"success": True, "message": "Nota eliminada exitosamente"}

@router.get("/all")
async def get_all_grades(current_user: dict = Depends(require_admin)):
    """
    Obtener todas las notas del sistema (solo admin)
    """
    try:
        # Obtener todas las notas
        grades_cursor = grades_collection.find({})
        grades = []
        
        async for grade_doc in grades_cursor:
            grade_data = dict(grade_doc)
            grade_data["_id"] = str(grade_data["_id"])
            
            # Buscar información del estudiante
            try:
                student = await students_collection.find_one({"_id": grade_data["student_id"]})
                if student:
                    grade_data["student_name"] = student.get("name", "Nombre no encontrado")
                    grade_data["student_grade"] = student.get("grade", "N/A")
                    grade_data["student_level"] = student.get("level", "N/A")
                else:
                    grade_data["student_name"] = "Estudiante no encontrado"
                    grade_data["student_grade"] = "N/A"
                    grade_data["student_level"] = "N/A"
            except Exception:
                grade_data["student_name"] = "Error al cargar estudiante"
                grade_data["student_grade"] = "N/A"
                grade_data["student_level"] = "N/A"
            
            # Buscar información del docente
            try:
                teacher = await users_collection.find_one({"_id": grade_data["teacher_id"]})
                if teacher:
                    grade_data["teacher_name"] = teacher.get("name", "Docente no encontrado")
                else:
                    grade_data["teacher_name"] = "Docente no encontrado"
            except Exception:
                grade_data["teacher_name"] = "Error al cargar docente"
            
            grades.append(grade_data)
        
        return grades
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener las notas: {str(e)}"
        )