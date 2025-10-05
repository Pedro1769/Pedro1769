from fastapi import APIRouter, HTTPException, Depends, status, Query, UploadFile, File
from typing import List, Optional
from models import Project, ProjectCreate, User, UserRole, ProjectStatus
from database import get_database
from auth import get_current_user, require_teacher_or_convivencia
from datetime import datetime
import os
import uuid

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[Project])
async def get_projects(
    status_filter: Optional[ProjectStatus] = Query(None),
    grade: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user)
):
    """Obtener proyectos institucionales"""
    db = await get_database()
    
    # Construir filtro
    filter_query = {}
    
    if status_filter:
        filter_query["status"] = status_filter
    
    if grade:
        filter_query["target_grades"] = {"$in": [grade]}
    
    # Filtrar por permisos según rol
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        # Solo proyectos de primaria o todos los grados
        filter_query["$or"] = [
            {"target_grades": {"$in": ["1°", "2°", "3°", "4°", "5°", "Todos"]}},
            {"uploaded_by": current_user.id}
        ]
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        # Solo proyectos de bachillerato o todos los grados
        filter_query["$or"] = [
            {"target_grades": {"$in": ["6°", "7°", "8°", "9°", "10°", "11°", "Todos"]}},
            {"uploaded_by": current_user.id}
        ]
    # Admin y coordinador de convivencia ven todos
    
    projects_data = await db.projects.find(filter_query).sort("created_at", -1).to_list(1000)
    
    # Enriquecer con información del docente que subió el proyecto
    enriched_projects = []
    for project_data in projects_data:
        teacher_data = await db.users.find_one({"_id": project_data["uploaded_by"]})
        project_data["uploaded_by_name"] = teacher_data["name"] if teacher_data else "Desconocido"
        enriched_projects.append(Project(**project_data))
    
    return enriched_projects

@router.get("/my-projects", response_model=List[Project])
async def get_my_projects(
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Obtener proyectos del usuario actual"""
    db = await get_database()
    
    projects_data = await db.projects.find({
        "uploaded_by": current_user.id
    }).sort("created_at", -1).to_list(1000)
    
    return [Project(**project) for project in projects_data]

@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener proyecto por ID"""
    db = await get_database()
    
    project_data = await db.projects.find_one({"_id": project_id})
    if not project_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    # Enriquecer con información del docente
    teacher_data = await db.users.find_one({"_id": project_data["uploaded_by"]})
    project_data["uploaded_by_name"] = teacher_data["name"] if teacher_data else "Desconocido"
    
    return Project(**project_data)

@router.post("", response_model=Project)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Crear nuevo proyecto institucional"""
    db = await get_database()
    
    # Validar grados objetivo según el rol del usuario
    if current_user.role == UserRole.DOCENTE_PRIMARIA:
        valid_grades = ["Transición", "1°", "2°", "3°", "4°", "5°", "Todos"]
        if not all(grade in valid_grades for grade in project_data.target_grades):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Como docente de primaria solo puede crear proyectos para grados de primaria"
            )
    elif current_user.role == UserRole.DOCENTE_BACHILLERATO:
        valid_grades = ["6°", "7°", "8°", "9°", "10°", "11°", "Todos"]
        if not all(grade in valid_grades for grade in project_data.target_grades):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Como docente de bachillerato solo puede crear proyectos para grados de bachillerato"
            )
    
    # Crear proyecto
    project = Project(
        title=project_data.title,
        description=project_data.description,
        uploaded_by=current_user.id,
        target_grades=project_data.target_grades,
        status=project_data.status,
        file_url=project_data.file_url
    )
    
    result = await db.projects.insert_one(project.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear proyecto"
        )
    
    return project

@router.put("/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: ProjectCreate,
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Actualizar proyecto"""
    db = await get_database()
    
    # Verificar que el proyecto existe
    existing_project = await db.projects.find_one({"_id": project_id})
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    # Verificar permisos
    if (current_user.role != UserRole.COORDINADOR_CONVIVENCIA and 
        existing_project["uploaded_by"] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede editar este proyecto"
        )
    
    # Actualizar
    update_data = {
        "title": project_data.title,
        "description": project_data.description,
        "target_grades": project_data.target_grades,
        "status": project_data.status,
        "file_url": project_data.file_url,
        "updated_at": datetime.utcnow()
    }
    
    result = await db.projects.update_one(
        {"_id": project_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    updated_project = await db.projects.find_one({"_id": project_id})
    return Project(**updated_project)

@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Eliminar proyecto"""
    db = await get_database()
    
    # Verificar que el proyecto existe
    existing_project = await db.projects.find_one({"_id": project_id})
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    # Verificar permisos
    if (current_user.role != UserRole.COORDINADOR_CONVIVENCIA and 
        existing_project["uploaded_by"] != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede eliminar este proyecto"
        )
    
    # Eliminar archivo si existe
    if existing_project.get("file_url"):
        # TODO: Implementar eliminación de archivo del storage
        pass
    
    # Eliminar proyecto
    result = await db.projects.delete_one({"_id": project_id})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    return {"success": True, "message": "Proyecto eliminado exitosamente"}

@router.post("/{project_id}/upload-file")
async def upload_project_file(
    project_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_teacher_or_convivencia)
):
    """Subir archivo para proyecto"""
    db = await get_database()
    
    # Verificar que el proyecto existe
    existing_project = await db.projects.find_one({"_id": project_id})
    if not existing_project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proyecto no encontrado"
        )
    
    # Verificar permisos
    if existing_project["uploaded_by"] != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puede subir archivos a este proyecto"
        )
    
    # Validar tipo de archivo
    allowed_extensions = {".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"}
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo no permitido"
        )
    
    # Validar tamaño (máximo 10MB)
    if file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo es demasiado grande (máximo 10MB)"
        )
    
    try:
        # Crear directorio si no existe
        upload_dir = "/app/uploads/projects"
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generar nombre único para el archivo
        file_id = str(uuid.uuid4())
        filename = f"{file_id}_{file.filename}"
        file_path = os.path.join(upload_dir, filename)
        
        # Guardar archivo
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
        
        # Actualizar proyecto con la URL del archivo
        file_url = f"/uploads/projects/{filename}"
        
        result = await db.projects.update_one(
            {"_id": project_id},
            {"$set": {"file_url": file_url, "updated_at": datetime.utcnow()}}
        )
        
        return {
            "success": True,
            "message": "Archivo subido exitosamente",
            "file_url": file_url,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al subir archivo: {str(e)}"
        )