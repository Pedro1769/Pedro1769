"""
Utilidades para ordenar y trabajar con grados escolares
"""

# Orden correcto de los grados
GRADE_ORDER = {
    'Transición': 0,
    '0°': 0,  # Preescolar/Transición
    '1°': 1,
    '2°': 2,
    '3°': 3,
    '4°': 4,
    '5°': 5,
    '6°': 6,
    '7°': 7,
    '8°': 8,
    '9°': 9,
    '10°': 10,
    '11°': 11
}

def get_grade_order(grade: str) -> int:
    """
    Obtiene el orden numérico de un grado
    
    Args:
        grade (str): Grado escolar
        
    Returns:
        int: Orden del grado (0-11, 999 para grados desconocidos)
    """
    return GRADE_ORDER.get(grade, 999)

def sort_students_by_grade(students: list) -> list:
    """
    Ordena una lista de estudiantes por grado escolar
    
    Args:
        students (list): Lista de estudiantes (dict o objetos con atributo 'grade')
        
    Returns:
        list: Lista de estudiantes ordenados por grado
    """
    if not students:
        return []
    
    def get_student_grade(student):
        if isinstance(student, dict):
            return student.get('grade', '')
        return getattr(student, 'grade', '')
    
    def get_student_name(student):
        if isinstance(student, dict):
            return student.get('name', '')
        return getattr(student, 'name', '')
    
    return sorted(students, key=lambda s: (
        get_grade_order(get_student_grade(s)),
        get_student_name(s).lower()
    ))

# Lista de todos los grados disponibles en orden
ALL_GRADES = [
    'Transición',
    '1°',
    '2°',
    '3°',
    '4°',
    '5°',
    '6°',
    '7°',
    '8°',
    '9°',
    '10°',
    '11°'
]