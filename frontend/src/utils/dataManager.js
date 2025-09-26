// Gestor de datos con persistencia local y backend
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Claves para localStorage
const STORAGE_KEYS = {
  STUDENTS: 'gada_students',
  PERIODS: 'gada_periods',
  GRADES: 'gada_grades',
  USERS: 'gada_users'
};

// Funciones de localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromStorage = (key, defaultValue = []) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Gestores específicos para cada tipo de dato
export const StudentsManager = {
  getAll: () => loadFromStorage(STORAGE_KEYS.STUDENTS, []),
  
  save: (students) => saveToStorage(STORAGE_KEYS.STUDENTS, students),
  
  add: (student) => {
    const students = StudentsManager.getAll();
    const newStudent = {
      ...student,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    students.push(newStudent);
    StudentsManager.save(students);
    return newStudent;
  },
  
  addBulk: (newStudents) => {
    const existingStudents = StudentsManager.getAll();
    const studentsWithIds = newStudents.map(student => ({
      ...student,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
    const allStudents = [...existingStudents, ...studentsWithIds];
    StudentsManager.save(allStudents);
    return studentsWithIds;
  },
  
  update: (id, updatedData) => {
    const students = StudentsManager.getAll();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = {
        ...students[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      StudentsManager.save(students);
      return students[index];
    }
    return null;
  },
  
  delete: (id) => {
    const students = StudentsManager.getAll();
    const filtered = students.filter(s => s.id !== id);
    StudentsManager.save(filtered);
    return filtered;
  },
  
  deleteBulk: (ids) => {
    const students = StudentsManager.getAll();
    const filtered = students.filter(s => !ids.includes(s.id));
    StudentsManager.save(filtered);
    return filtered;
  }
};

export const PeriodsManager = {
  getAll: () => loadFromStorage(STORAGE_KEYS.PERIODS, []),
  
  save: (periods) => saveToStorage(STORAGE_KEYS.PERIODS, periods),
  
  update: (id, updatedData) => {
    const periods = PeriodsManager.getAll();
    const index = periods.findIndex(p => p.id === id);
    if (index !== -1) {
      periods[index] = {
        ...periods[index],
        ...updatedData,
        updatedAt: new Date().toISOString()
      };
      PeriodsManager.save(periods);
      return periods[index];
    }
    return null;
  }
};

export const GradesManager = {
  getAll: () => loadFromStorage(STORAGE_KEYS.GRADES, []),
  
  save: (grades) => saveToStorage(STORAGE_KEYS.GRADES, grades),
  
  add: (grade) => {
    const grades = GradesManager.getAll();
    const newGrade = {
      ...grade,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    grades.push(newGrade);
    GradesManager.save(grades);
    return newGrade;
  },
  
  update: (studentId, subject, period, gradeData) => {
    const grades = GradesManager.getAll();
    const index = grades.findIndex(g => 
      g.studentId === studentId && 
      g.subject === subject && 
      g.period === period
    );
    
    if (index !== -1) {
      grades[index] = {
        ...grades[index],
        ...gradeData,
        updatedAt: new Date().toISOString()
      };
    } else {
      grades.push({
        studentId,
        subject,
        period,
        ...gradeData,
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    GradesManager.save(grades);
    return grades;
  },
  
  getByStudent: (studentId) => {
    const grades = GradesManager.getAll();
    return grades.filter(g => g.studentId === studentId);
  },
  
  getByStudentAndPeriod: (studentId, period) => {
    const grades = GradesManager.getAll();
    return grades.filter(g => g.studentId === studentId && g.period === period);
  }
};

// Inicializar datos por defecto si no existen
export const initializeDefaultData = () => {
  // Solo inicializar si no hay datos existentes
  if (StudentsManager.getAll().length === 0) {
    const defaultStudents = [
      {
        id: 1,
        name: 'Geovanny Erick Salas Pérez',
        grade: '11°',
        level: 'Básica Secundaria',
        academicYear: 2025,
        parentId: 5,
        document: '1087585001426',
        birthDate: '2008-05-15'
      },
      {
        id: 2,
        name: 'María Isabel Salas Pérez',
        grade: '3°',
        level: 'Básica Primaria',
        academicYear: 2025,
        parentId: 5,
        document: '1087585001427',
        birthDate: '2014-03-20'
      },
      {
        id: 3,
        name: 'Ashley Muñoz Rada',
        grade: '2°',
        level: 'Básica Primaria',
        academicYear: 2025,
        parentId: 6,
        document: '1087585001428',
        birthDate: '2015-07-10'
      },
      {
        id: 4,
        name: 'Gabriel Antón Rosanía',
        grade: '7°',
        level: 'Básica Secundaria',
        academicYear: 2025,
        parentId: 7,
        document: '1087585001429',
        birthDate: '2010-11-25'
      }
    ];
    
    StudentsManager.save(defaultStudents);
  }
  
  if (PeriodsManager.getAll().length === 0) {
    const defaultPeriods = [
      { 
        id: 1, 
        name: 'Primer Período', 
        startDate: '2025-01-15', 
        endDate: '2025-03-30',
        gradeEntryStart: '2025-01-15T08:00',
        gradeEntryEnd: '2025-12-31T23:59', // Extendido hasta fin de año
        isActive: true,
        isGradeEntryOpen: true,
        alwaysEnabled: true // Nueva propiedad para forzar habilitación
      },
      { 
        id: 2, 
        name: 'Segundo Período', 
        startDate: '2025-04-01', 
        endDate: '2025-06-15',
        gradeEntryStart: '2025-01-15T08:00', // Habilitado desde inicio de año
        gradeEntryEnd: '2025-12-31T23:59', // Hasta fin de año
        isActive: true,
        isGradeEntryOpen: true,
        alwaysEnabled: true
      },
      { 
        id: 3, 
        name: 'Tercer Período', 
        startDate: '2025-07-01', 
        endDate: '2025-09-15',
        gradeEntryStart: '2025-01-15T08:00', // Habilitado desde inicio de año
        gradeEntryEnd: '2025-12-31T23:59', // Hasta fin de año
        isActive: true,
        isGradeEntryOpen: true,
        alwaysEnabled: true
      },
      { 
        id: 4, 
        name: 'Cuarto Período', 
        startDate: '2025-09-16', 
        endDate: '2025-11-30',
        gradeEntryStart: '2025-01-15T08:00', // Habilitado desde inicio de año
        gradeEntryEnd: '2025-12-31T23:59', // Hasta fin de año
        isActive: true,
        isGradeEntryOpen: true,
        alwaysEnabled: true
      }
    ];
    
    PeriodsManager.save(defaultPeriods);
  }
};