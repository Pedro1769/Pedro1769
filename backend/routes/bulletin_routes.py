from fastapi import APIRouter, HTTPException, Depends, status, Response
from typing import List, Optional
from models import BulletinCode, Student, User, UserRole
from database import get_database
from auth import get_current_user, require_admin, can_view_student_data
from datetime import datetime, timedelta
import secrets
import string
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

router = APIRouter(prefix="/bulletins", tags=["Bulletins"])

def generate_unique_code() -> str:
    """Generar código único de 8 caracteres"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(8))

@router.post("/generate-code/{student_id}/{period}")
async def generate_bulletin_code(
    student_id: str,
    period: str,
    current_user: User = Depends(require_admin)
):
    """Generar código único para descarga de boletín (solo admin)"""
    db = await get_database()
    
    # Verificar que el estudiante existe
    student_data = await db.students.find_one({"_id": student_id})
    if not student_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    # Verificar si ya existe un código activo para este estudiante y período
    existing_code = await db.bulletin_codes.find_one({
        "student_id": student_id,
        "period": period,
        "expires_at": {"$gt": datetime.utcnow()},
        "is_used": False
    })
    
    if existing_code:
        return {
            "success": True,
            "code": existing_code["code"],
            "expires_at": existing_code["expires_at"],
            "message": "Código existente válido"
        }
    
    # Generar nuevo código
    code = generate_unique_code()
    
    # Verificar que el código es único
    while await db.bulletin_codes.find_one({"code": code}):
        code = generate_unique_code()
    
    # Crear código con expiración de 30 días
    bulletin_code = BulletinCode(
        student_id=student_id,
        period=period,
        code=code,
        expires_at=datetime.utcnow() + timedelta(days=30)
    )
    
    result = await db.bulletin_codes.insert_one(bulletin_code.dict(by_alias=True))
    
    if not result.inserted_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al generar código"
        )
    
    return {
        "success": True,
        "code": code,
        "student_name": student_data["name"],
        "period": period,
        "expires_at": bulletin_code.expires_at,
        "message": "Código generado exitosamente"
    }

@router.get("/download/{code}")
async def download_bulletin_with_code(code: str):
    """Descargar boletín usando código único"""
    db = await get_database()
    
    # Verificar código
    code_data = await db.bulletin_codes.find_one({
        "code": code,
        "expires_at": {"$gt": datetime.utcnow()},
        "is_used": False
    })
    
    if not code_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Código inválido o expirado"
        )
    
    # Obtener datos del estudiante
    student_data = await db.students.find_one({"_id": code_data["student_id"]})
    if not student_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Estudiante no encontrado"
        )
    
    student = Student(**student_data)
    
    # Obtener notas del período
    grades_data = await db.grades.find({
        "student_id": student.id,
        "period": code_data["period"]
    }).to_list(1000)
    
    # Generar PDF del boletín
    pdf_buffer = generate_bulletin_pdf(student, grades_data, code_data["period"])
    
    # Marcar código como usado e incrementar contador
    await db.bulletin_codes.update_one(
        {"_id": code_data["_id"]},
        {
            "$set": {"is_used": True},
            "$inc": {"download_count": 1}
        }
    )
    
    # Retornar PDF
    filename = f"boletin_{student.name.replace(' ', '_')}_{code_data['period']}.pdf"
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )

@router.get("/student/{student_id}/{period}")
async def get_student_bulletin(
    student_id: str,
    period: str,
    current_user: User = Depends(get_current_user)
):
    """Obtener boletín de estudiante (para docentes y admin)"""
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
            detail="No tiene permisos para ver el boletín de este estudiante"
        )
    
    # Obtener notas del período
    grades_data = await db.grades.find({
        "student_id": student_id,
        "period": period
    }).to_list(1000)
    
    # Obtener observaciones de convivencia del período
    observations_data = await db.convivencia_observations.find({
        "student_id": student_id,
        "period": period
    }).to_list(1000)
    
    # Calcular estadísticas
    if grades_data:
        grades_values = [grade["grade"] for grade in grades_data]
        average = sum(grades_values) / len(grades_values)
        performance_level = calculate_performance_level(average)
    else:
        average = 0.0
        performance_level = "SIN NOTAS"
    
    return {
        "student": student,
        "period": period,
        "grades": grades_data,
        "observations": observations_data,
        "statistics": {
            "average": round(average, 1),
            "performance_level": performance_level,
            "subjects_count": len(grades_data)
        }
    }

def generate_bulletin_pdf(student: Student, grades_data: List[dict], period: str) -> BytesIO:
    """Generar PDF del boletín"""
    buffer = BytesIO()
    
    # Crear documento PDF
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    subtitle_style = styles['Heading2']
    normal_style = styles['Normal']
    
    # Contenido del PDF
    story = []
    
    # Encabezado institucional
    story.append(Paragraph("GIMNASIO AMERICANO DEL ATLÁNTICO", title_style))
    story.append(Paragraph("PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA", normal_style))
    story.append(Paragraph("MEDIA VOCACIONAL COMERCIAL", normal_style))
    story.append(Spacer(1, 12))
    
    # Información del estudiante
    story.append(Paragraph(f"ESTUDIANTE: {student.name}", subtitle_style))
    story.append(Paragraph(f"GRADO: {student.grade} - {student.level}", normal_style))
    story.append(Paragraph(f"PERÍODO: {period}", normal_style))
    story.append(Spacer(1, 12))
    
    # Tabla de notas
    if grades_data:
        # Encabezados de la tabla
        table_data = [["ÁREA/ASIGNATURA", "NOTA", "DESEMPEÑO"]]
        
        total_grade = 0
        for grade_data in grades_data:
            table_data.append([
                grade_data["subject"],
                str(grade_data["grade"]),
                grade_data.get("performance_level", "")
            ])
            total_grade += grade_data["grade"]
        
        # Promedio
        average = total_grade / len(grades_data)
        table_data.append(["PROMEDIO GENERAL", str(round(average, 1)), ""])
        
        # Crear tabla
        table = Table(table_data, colWidths=[3*inch, 1*inch, 2*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
            ('BACKGROUND', (0, -1), (-1, -1), colors.lightgrey),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(table)
    else:
        story.append(Paragraph("No hay notas registradas para este período", normal_style))
    
    story.append(Spacer(1, 24))
    
    # Observaciones generales
    story.append(Paragraph("OBSERVACIONES:", subtitle_style))
    story.append(Paragraph("El estudiante debe continuar fortaleciendo sus procesos académicos.", normal_style))
    
    # Firmas
    story.append(Spacer(1, 48))
    story.append(Paragraph("_________________________", normal_style))
    story.append(Paragraph("DIRECTOR DE GRUPO", normal_style))
    
    # Generar PDF
    doc.build(story)
    buffer.seek(0)
    
    return buffer

@router.get("/codes/student/{student_id}")
async def get_student_codes(
    student_id: str,
    current_user: User = Depends(require_admin)
):
    """Obtener códigos generados para un estudiante (solo admin)"""
    db = await get_database()
    
    codes_data = await db.bulletin_codes.find({
        "student_id": student_id
    }).sort("created_at", -1).to_list(1000)
    
    return [BulletinCode(**code) for code in codes_data]

from models import calculate_performance_level