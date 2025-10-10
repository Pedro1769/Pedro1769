/**
 * Utilidades para ordenar y trabajar con grados escolares
 */

// Orden correcto de los grados
const GRADE_ORDER = {
  'Transición': 0,
  '0°': 0,  // Preescolar/Transición
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
};

/**
 * Ordena una lista de estudiantes por grado
 * @param {Array} students - Lista de estudiantes
 * @returns {Array} - Lista de estudiantes ordenados por grado
 */
export const sortStudentsByGrade = (students) => {
  if (!students || !Array.isArray(students)) {
    return [];
  }

  return [...students].sort((a, b) => {
    const gradeA = GRADE_ORDER[a.grade] ?? 999;
    const gradeB = GRADE_ORDER[b.grade] ?? 999;
    
    // Si los grados son iguales, ordenar por nombre
    if (gradeA === gradeB) {
      return (a.name || '').localeCompare(b.name || '');
    }
    
    return gradeA - gradeB;
  });
};

/**
 * Agrupa estudiantes por grado
 * @param {Array} students - Lista de estudiantes
 * @returns {Object} - Objeto con estudiantes agrupados por grado
 */
export const groupStudentsByGrade = (students) => {
  if (!students || !Array.isArray(students)) {
    return {};
  }

  const grouped = {};
  
  students.forEach(student => {
    const grade = student.grade || 'Sin Grado';
    if (!grouped[grade]) {
      grouped[grade] = [];
    }
    grouped[grade].push(student);
  });
  
  // Ordenar cada grupo por nombre
  Object.keys(grouped).forEach(grade => {
    grouped[grade].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  });
  
  return grouped;
};

/**
 * Obtiene el orden numérico de un grado
 * @param {string} grade - Grado
 * @returns {number} - Orden del grado
 */
export const getGradeOrder = (grade) => {
  return GRADE_ORDER[grade] ?? 999;
};

/**
 * Lista de todos los grados disponibles en orden
 */
export const ALL_GRADES = [
  'Transición',
  '0°',
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
];
