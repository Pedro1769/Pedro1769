from fastapi import APIRouter, HTTPException, Depends, status, Query
from typing import List, Optional
from models import Student, StudentCreate, User, UserRole
from database import get_database
from auth import get_current_user, require_admin, require_teacher, require_admin_or_teacher, require_student_management_roles, can_view_student_data
from utils.grade_utils import sort_students_by_grade
from datetime import datetime
import uuid

router = APIRouter(prefix="/students", tags=["Students"])

@router.get("", response_model=List[Student])
async def get_students(
    grade: Optional[str] = Query(None),
    teacher_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Obtener lista de estudiantes"""
    db = await get_database()
    
    # Construir filtro según el rol
    filter_query = {"is_active": True}
    
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        # Docentes de primaria ven estudiantes de su grado asignado únicamente
        if current_user.grade:
            # Si se especifica un grado y NO es el suyo, retornar vacío
            if grade and grade != current_user.grade:
                filter_query["grade"] = "INVALID_GRADE_NO_ACCESS"  # Forzar resultado vacío
            else:
                filter_query["grade"] = current_user.grade
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Docentes de bachillerato ven estudiantes de los grados que manejan
        if current_user.grades:
            # Si se especifica un grado y está en sus grados asignados, filtrar por ese grado
            if grade and grade in current_user.grades:
                filter_query["grade"] = grade
            else:
                # Si no se especifica grado o no está asignado, mostrar todos sus grados
                filter_query["grade"] = {"$in": current_user.grades}
        elif current_user.grade:
            # Si no tiene grades pero sí grade, usar ese grado
            filter_query["grade"] = current_user.grade
    elif current_user.role == UserRole.PADRE:
        # Padres solo ven a sus hijos
        filter_query["parent_id"] = current_user.id
    else:
        # Admin y coordinador de convivencia ven todos
        # Solo para estos roles se permite el filtro por grado libre
        if grade:
            filter_query["grade"] = grade
    
    # Aplicar filtros adicionales solo para roles autorizados
    if teacher_id and current_user.role in [UserRole.ADMIN, UserRole.COORDINADOR_CONVIVENCIA]:
        filter_query["teacher_id"] = teacher_id
    
    # Obtener estudiantes y ordenar por grado correctamente
    students_data = await db.students.find(filter_query).to_list(1000)
    # Ordenar usando la función de utilidad que respeta el orden escolar correcto
    students_data = sort_students_by_grade(students_data)
    return [Student(**student) for student in students_data]

@router.get("/by-teacher/{teacher_id}", response_model=List[Student])
async def get_students_by_teacher(
    teacher_id: str,
    current_user: User = Depends(require_admin_or_teacher())
):
    """Obtener estudiantes por docente"""
    db = await get_database()
    
    # Verificar permisos
    if current_user.role != UserRole.ADMIN and current_user.id != teacher_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede ver estudiantes de otro docente"
        )
    
    students_data = await db.students.find({
        "teacher_id": teacher_id,
        "is_active": True
    }).sort("grade", 1).to_list(1000)
    
    return [Student(**student) for student in students_data]

@router.get("/by-grade/{grade}", response_model=List[Student])
async def get_students_by_grade(
    grade: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener estudiantes por grado"""
    db = await get_database()
    
    # Verificar permisos según rol
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        if current_user.grade != grade:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puede ver estudiantes de otro grado"
            )
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        if grade not in (current_user.grades or []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puede ver estudiantes de este grado"
            )
    
    students_data = await db.students.find({
        "grade": grade,
        "is_active": True
    }).sort("name", 1).to_list(1000)
    
    return [Student(**student) for student in students_data]

@router.get("/{student_id}", response_model=Student)
async def get_student(
    student_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener estudiante por ID"""
    db = await get_database()
    
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
            detail="No tiene permisos para ver este estudiante"
        )
    
    return student

@router.post("", response_model=Student)
async def create_student(
    student_data: StudentCreate,
    current_user: User = Depends(require_admin_or_teacher())
):
    """Crear nuevo estudiante"""
    db = await get_database()
    
    # Validar que el docente existe si se especifica
    if student_data.teacher_id:
        teacher = await db.users.find_one({"_id": student_data.teacher_id})
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Docente no encontrado"
            )
    
    # Validar que el padre existe si se especifica
    if student_data.parent_id:
        parent = await db.users.find_one({"_id": student_data.parent_id})
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Padre/acudiente no encontrado"
            )
    
    # Crear estudiante
    student = Student(**student_data.dict())
    result = await db.students.insert_one(student.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear estudiante"
        )
    
    return student

@router.post("/bulk", response_model=List[Student])
async def create_students_bulk(
    students_data: List[StudentCreate],
    current_user: User = Depends(require_admin())
):
    """Crear estudiantes en lote (solo admin)"""
    db = await get_database()
    
    created_students = []
    for student_data in students_data:
        student = Student(**student_data.dict())
        created_students.append(student.dict(by_alias=True))
    
    result = await db.students.insert_many(created_students)
    
    if not result.inserted_ids:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear estudiantes en lote"
        )
    
    return [Student(**student) for student in created_students]

@router.put("/{student_id}", response_model=Student)
async def update_student(
    student_id: str,
    student_data: StudentCreate,
    current_user: User = Depends(require_student_management_roles())
):
    """Actualizar estudiante"""
    db = await get_database()
    
    # Verificar que el estudiante existe
    existing_student = await db.students.find_one({"_id": student_id})
    if not existing_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # Verificar permisos mejorados
    can_edit = False
    
    if current_user.role == UserRole.ADMIN:
        can_edit = True
    elif current_user.role == UserRole.COORDINADOR_CONVIVENCIA:
        can_edit = True  # Coordinadora puede editar cualquier estudiante
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Docente bachillerato puede editar estudiantes de sus grados asignados
        if hasattr(current_user, 'grades') and current_user.grades:
            can_edit = existing_student["grade"] in current_user.grades
    elif current_user.role == UserRole.DOCENTE_PRIMARIA:
        # Docente primaria puede editar estudiantes de su grado específico
        if hasattr(current_user, 'grade') and current_user.grade:
            can_edit = existing_student["grade"] == current_user.grade
    
    if not can_edit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"No tiene permisos para editar estudiantes de grado {existing_student['grade']}"
        )
    
    # Actualizar
    update_data = student_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    result = await db.students.update_one(
        {"_id": student_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    updated_student = await db.students.find_one({"_id": student_id})
    return Student(**updated_student)

@router.delete("/{student_id}")
async def delete_student(
    student_id: str,
    current_user: User = Depends(require_student_management_roles())
):
    """Eliminar estudiante (marcar como inactivo)"""
    db = await get_database()
    
    # Verificar que el estudiante existe
    existing_student = await db.students.find_one({"_id": student_id})
    if not existing_student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # Verificar permisos mejorados  
    can_delete = False
    
    if current_user.role == UserRole.ADMIN:
        can_delete = True
    elif current_user.role == UserRole.COORDINADOR_CONVIVENCIA:
        can_delete = True  # Coordinadora puede eliminar cualquier estudiante
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Docente bachillerato puede eliminar estudiantes de sus grados asignados
        if hasattr(current_user, 'grades') and current_user.grades:
            can_delete = existing_student["grade"] in current_user.grades
    elif current_user.role == UserRole.DOCENTE_PRIMARIA:
        # Docente primaria puede eliminar estudiantes de su grado específico
        if hasattr(current_user, 'grade') and current_user.grade:
            can_delete = existing_student["grade"] == current_user.grade
    
    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"No tiene permisos para eliminar estudiantes de grado {existing_student['grade']}"
        )
    
    # Marcar como inactivo
    result = await db.students.update_one(
        {"_id": student_id},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    return {"success": True, "message": "Estudiante eliminado exitosamente"}

@router.delete("/bulk/delete")
async def delete_students_bulk(
    student_ids: List[str],
    current_user: User = Depends(require_admin())
):
    """Eliminar estudiantes en lote (solo admin)"""
    db = await get_database()
    
    result = await db.students.update_many(
        {"_id": {"$in": student_ids}},
        {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
    )
    
    return {
        "success": True,
        "message": f"Se eliminaron {result.modified_count} estudiantes",
        "count": result.modified_count
    }