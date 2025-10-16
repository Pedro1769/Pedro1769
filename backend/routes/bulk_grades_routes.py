from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, status
from typing import List, Dict, Any
from models import User, UserRole
from database import get_database
from auth import get_current_user
import pandas as pd
import openpyxl
from io import BytesIO
import uuid
from datetime import datetime

router = APIRouter(prefix="/bulk-grades", tags=["Bulk Grades"])

# ============================================
# PROCESAMIENTO DE EXCEL - OPCIÓN 1
# Formato: Área | Asignatura | Periodo I | II | III | IV | Nombre | Grado
# ============================================

async def process_excel_format_1(file_content: bytes, academic_year: str, db):
    """
    Procesar Excel con formato consolidado (todos los estudiantes en una hoja)
    Columnas: Área, Asignatura, y períodos en vertical
    """
    try:
        # Leer Excel
        df = pd.read_excel(BytesIO(file_content), engine='openpyxl')
        
        results = {
            "success": 0,
            "errors": 0,
            "details": []
        }
        
        # Identificar columnas de períodos
        period_columns = []
        for col in df.columns:
            col_str = str(col).upper()
            if any(p in col_str for p in ['PERIODO I', 'PERIODO II', 'PERIODO III', 'PERIODO IV', 'PERÍODO I', 'PERÍODO II', 'PERÍODO III', 'PERÍODO IV']):
                period_columns.append(col)
        
        # Buscar columna de nombre y grado
        name_col = None
        grade_col = None
        
        for col in df.columns:
            col_str = str(col).upper()
            if 'NOMBRE' in col_str or 'ESTUDIANTE' in col_str:
                name_col = col
            if 'GRADO' in col_str:
                grade_col = col
        
        if not name_col or not grade_col:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se encontraron las columnas 'Nombre' y 'Grado' en el Excel"
            )
        
        # Procesar cada fila
        for idx, row in df.iterrows():
            try:
                student_name = str(row[name_col]).strip()
                student_grade = str(row[grade_col]).strip()
                area = str(row.get('Área', row.get('ÁREA', ''))).strip()
                subject = str(row.get('Asignatura', row.get('ASIGNATURA', ''))).strip()
                
                if not student_name or student_name == 'nan':
                    continue
                
                # Buscar estudiante en la base de datos
                student = await db.students.find_one({
                    "name": {"$regex": student_name, "$options": "i"},
                    "grade": student_grade
                })
                
                if not student:
                    results["errors"] += 1
                    results["details"].append(f"Estudiante no encontrado: {student_name} - Grado {student_grade}")
                    continue
                
                # Procesar cada período
                for period_col in period_columns:
                    grade_value = row.get(period_col)
                    
                    if pd.isna(grade_value) or str(grade_value).strip() == '':
                        continue
                    
                    # Convertir a float
                    try:
                        grade_float = float(grade_value)
                        if grade_float < 0 or grade_float > 5:
                            continue
                    except:
                        continue
                    
                    # Determinar el período (I, II, III, IV)
                    period = None
                    period_str = str(period_col).upper()
                    if 'I' in period_str and 'II' not in period_str and 'III' not in period_str and 'IV' not in period_str:
                        period = 'I'
                    elif 'II' in period_str and 'III' not in period_str:
                        period = 'II'
                    elif 'III' in period_str:
                        period = 'III'
                    elif 'IV' in period_str:
                        period = 'IV'
                    
                    if not period:
                        continue
                    
                    # Crear o actualizar la nota
                    grade_doc = {
                        "student_id": student.get("_id"),
                        "student_name": student.get("name"),
                        "grade": student.get("grade"),
                        "level": student.get("level"),
                        "subject": subject,
                        "area": area,
                        "period": period,
                        "numeric_grade": grade_float,
                        "academic_year": academic_year,
                        "created_at": datetime.utcnow(),
                        "updated_at": datetime.utcnow(),
                        "uploaded_via": "bulk_excel"
                    }
                    
                    # Verificar si ya existe
                    existing = await db.grades.find_one({
                        "student_id": student.get("_id"),
                        "subject": subject,
                        "period": period,
                        "academic_year": academic_year
                    })
                    
                    if existing:
                        # Actualizar
                        await db.grades.update_one(
                            {"_id": existing["_id"]},
                            {"$set": grade_doc}
                        )
                    else:
                        # Insertar nuevo
                        grade_doc["_id"] = str(uuid.uuid4())
                        await db.grades.insert_one(grade_doc)
                    
                    results["success"] += 1
                
            except Exception as e:
                results["errors"] += 1
                results["details"].append(f"Error en fila {idx + 2}: {str(e)}")
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al procesar Excel: {str(e)}"
        )

# ============================================
# PROCESAMIENTO DE EXCEL - OPCIÓN 2
# Formato: Cada hoja = boletín de un estudiante
# ============================================

async def process_excel_format_2(file_content: bytes, academic_year: str, db):
    """
    Procesar Excel con una hoja por estudiante
    Cada hoja contiene el boletín completo de un estudiante
    """
    try:
        # Leer todas las hojas del Excel
        excel_file = pd.ExcelFile(BytesIO(file_content), engine='openpyxl')
        
        results = {
            "success": 0,
            "errors": 0,
            "details": []
        }
        
        # Procesar cada hoja (cada estudiante)
        for sheet_name in excel_file.sheet_names:
            try:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                # Buscar información del estudiante en la hoja
                student_name = None
                student_grade = None
                
                # Buscar en las primeras filas
                for idx in range(min(10, len(df))):
                    for col in df.columns:
                        cell_value = str(df.iloc[idx][col])
                        if 'Nombre' in str(col) or 'ESTUDIANTE' in cell_value.upper():
                            # La siguiente celda debería tener el nombre
                            if idx + 1 < len(df):
                                student_name = str(df.iloc[idx + 1][col]).strip()
                        if 'Grado' in str(col) or 'GRADO' in cell_value.upper():
                            if idx + 1 < len(df):
                                student_grade = str(df.iloc[idx + 1][col]).strip()
                
                # Si no se encontró, usar el nombre de la hoja
                if not student_name:
                    student_name = sheet_name
                
                if not student_name or not student_grade:
                    results["errors"] += 1
                    results["details"].append(f"No se pudo identificar estudiante en hoja: {sheet_name}")
                    continue
                
                # Buscar estudiante en BD
                student = await db.students.find_one({
                    "name": {"$regex": student_name, "$options": "i"},
                    "grade": student_grade
                })
                
                if not student:
                    results["errors"] += 1
                    results["details"].append(f"Estudiante no encontrado: {student_name} - Grado {student_grade}")
                    continue
                
                # Buscar tabla de notas en la hoja
                # Buscar fila que contiene "Asignatura" o "Materia"
                header_row_idx = None
                for idx in range(len(df)):
                    for col in df.columns:
                        if 'ASIGNATURA' in str(df.iloc[idx][col]).upper() or 'MATERIA' in str(df.iloc[idx][col]).upper():
                            header_row_idx = idx
                            break
                    if header_row_idx is not None:
                        break
                
                if header_row_idx is None:
                    results["errors"] += 1
                    results["details"].append(f"No se encontró tabla de notas en hoja: {sheet_name}")
                    continue
                
                # Leer desde esa fila como encabezado
                df_grades = pd.read_excel(excel_file, sheet_name=sheet_name, header=header_row_idx)
                
                # Identificar columnas
                subject_col = None
                period_cols = {}
                
                for col in df_grades.columns:
                    col_str = str(col).upper()
                    if 'ASIGNATURA' in col_str or 'MATERIA' in col_str:
                        subject_col = col
                    elif 'PERIODO I' in col_str or 'PERÍODO I' in col_str or 'I' == col_str.strip():
                        period_cols['I'] = col
                    elif 'PERIODO II' in col_str or 'PERÍODO II' in col_str or 'II' == col_str.strip():
                        period_cols['II'] = col
                    elif 'PERIODO III' in col_str or 'PERÍODO III' in col_str or 'III' == col_str.strip():
                        period_cols['III'] = col
                    elif 'PERIODO IV' in col_str or 'PERÍODO IV' in col_str or 'IV' == col_str.strip():
                        period_cols['IV'] = col
                
                if not subject_col:
                    results["errors"] += 1
                    results["details"].append(f"No se encontró columna de asignatura en hoja: {sheet_name}")
                    continue
                
                # Procesar cada asignatura
                for idx, row in df_grades.iterrows():
                    try:
                        subject = str(row[subject_col]).strip()
                        if not subject or subject == 'nan' or len(subject) < 2:
                            continue
                        
                        # Procesar cada período
                        for period, period_col in period_cols.items():
                            grade_value = row.get(period_col)
                            
                            if pd.isna(grade_value) or str(grade_value).strip() == '':
                                continue
                            
                            try:
                                grade_float = float(grade_value)
                                if grade_float < 0 or grade_float > 5:
                                    continue
                            except:
                                continue
                            
                            # Crear o actualizar la nota
                            grade_doc = {
                                "student_id": student.get("_id"),
                                "student_name": student.get("name"),
                                "grade": student.get("grade"),
                                "level": student.get("level"),
                                "subject": subject,
                                "period": period,
                                "numeric_grade": grade_float,
                                "academic_year": academic_year,
                                "created_at": datetime.utcnow(),
                                "updated_at": datetime.utcnow(),
                                "uploaded_via": "bulk_excel_individual"
                            }
                            
                            # Verificar si ya existe
                            existing = await db.grades.find_one({
                                "student_id": student.get("_id"),
                                "subject": subject,
                                "period": period,
                                "academic_year": academic_year
                            })
                            
                            if existing:
                                await db.grades.update_one(
                                    {"_id": existing["_id"]},
                                    {"$set": grade_doc}
                                )
                            else:
                                grade_doc["_id"] = str(uuid.uuid4())
                                await db.grades.insert_one(grade_doc)
                            
                            results["success"] += 1
                    
                    except Exception as e:
                        results["errors"] += 1
                        results["details"].append(f"Error en asignatura {subject}: {str(e)}")
            
            except Exception as e:
                results["errors"] += 1
                results["details"].append(f"Error en hoja {sheet_name}: {str(e)}")
        
        return results
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error al procesar Excel: {str(e)}"
        )

# ============================================
# ENDPOINTS
# ============================================

@router.post("/upload-consolidated")
async def upload_consolidated_grades(
    file: UploadFile = File(...),
    academic_year: str = "2024",
    format_type: str = "format1",  # format1 o format2
    current_user: User = Depends(get_current_user)
):
    """
    Subir Excel con notas consolidadas (solo admin)
    format1: Todos los estudiantes en una hoja
    format2: Una hoja por estudiante
    """
    # Verificar que sea admin
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden cargar notas masivamente"
        )
    
    # Verificar que sea un archivo Excel
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser un Excel (.xlsx o .xls)"
        )
    
    try:
        # Leer contenido del archivo
        file_content = await file.read()
        
        # Obtener base de datos
        db = await get_database()
        
        # Procesar según el formato
        if format_type == "format1":
            results = await process_excel_format_1(file_content, academic_year, db)
        elif format_type == "format2":
            results = await process_excel_format_2(file_content, academic_year, db)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato no válido. Use 'format1' o 'format2'"
            )
        
        return {
            "success": True,
            "message": f"Proceso completado. {results['success']} notas cargadas, {results['errors']} errores",
            "results": results
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al procesar archivo: {str(e)}"
        )

@router.get("/template/format1")
async def download_template_format1(current_user: User = Depends(get_current_user)):
    """
    Descargar plantilla Excel para formato 1 (consolidado)
    """
    # Aquí podrías generar un Excel de ejemplo
    return {
        "message": "Plantilla formato 1",
        "columns": ["Área", "Asignatura", "Periodo I", "Periodo II", "Periodo III", "Periodo IV", "Nombre", "Grado"]
    }

@router.get("/template/format2")
async def download_template_format2(current_user: User = Depends(get_current_user)):
    """
    Descargar plantilla Excel para formato 2 (individual por estudiante)
    """
    return {
        "message": "Plantilla formato 2",
        "description": "Cada hoja debe contener el boletín de un estudiante"
    }

@router.get("/stats")
async def get_bulk_upload_stats(
    academic_year: str = "2024",
    current_user: User = Depends(get_current_user)
):
    """
    Obtener estadísticas de notas cargadas masivamente
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden ver estas estadísticas"
        )
    
    db = await get_database()
    
    # Contar notas cargadas vía Excel
    bulk_count = await db.grades.count_documents({
        "academic_year": academic_year,
        "uploaded_via": {"$in": ["bulk_excel", "bulk_excel_individual"]}
    })
    
    # Contar total de notas
    total_count = await db.grades.count_documents({
        "academic_year": academic_year
    })
    
    return {
        "academic_year": academic_year,
        "bulk_uploaded": bulk_count,
        "total_grades": total_count,
        "manual_grades": total_count - bulk_count
    }
