// Mock users for different roles
export const mockUsers = [
  // Administrators
  {
    id: 1,
    email: 'admin@cng.edu',
    password: 'admin123',
    name: 'Maria González',
    role: 'admin',
    position: 'Directora Académica'
  },
  
  // Teachers
  {
    id: 2,
    email: 'profesor1@cng.edu',
    password: 'teacher123',
    name: 'Carlos Mendoza',
    role: 'teacher',
    subjects: ['Matemáticas', 'Física'],
    grades: ['6°', '7°', '8°']
  },
  {
    id: 3,
    email: 'profesora2@cng.edu',
    password: 'teacher123',
    name: 'Ana Rodríguez',
    role: 'teacher',
    subjects: ['Español', 'Literatura'],
    grades: ['9°', '10°', '11°']
  },
  {
    id: 4,
    email: 'profesor3@cng.edu',
    password: 'teacher123',
    name: 'Luis García',
    role: 'teacher',
    subjects: ['Ciencias Naturales', 'Biología'],
    grades: ['1°', '2°', '3°', '4°', '5°']
  },
  
  // Parents
  {
    id: 5,
    email: 'padre1@gmail.com',
    password: 'parent123',
    name: 'Roberto Salas',
    role: 'parent',
    children: [1, 2] // student IDs
  },
  {
    id: 6,
    email: 'madre1@gmail.com',
    password: 'parent123',
    name: 'Patricia Muñoz',
    role: 'parent',
    children: [3] // student IDs
  },
  {
    id: 7,
    email: 'padre2@gmail.com',
    password: 'parent123',
    name: 'Gabriel Antón',
    role: 'parent',
    children: [4] // student IDs
  }
];

// Mock students data
export const mockStudents = [
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

// Mock subjects for different educational levels
export const mockSubjects = {
  'Básica Primaria': [
    'Humanidades - Español',
    'Humanidades - Inglés',
    'Matemáticas',
    'Ciencias Naturales',
    'Ciencias Sociales',
    'Educación Artística',
    'Educación Física',
    'Tecnología',
    'Ética',
    'Religión'
  ],
  'Básica Secundaria': [
    'Humanidades - Español',
    'Humanidades - Inglés',
    'Matemáticas',
    'Geometría',
    'Ciencias Naturales - Biología',
    'Ciencias Naturales - Física',
    'Ciencias Naturales - Química',
    'Ciencias Sociales',
    'Geografía',
    'Historia',
    'Educación Artística',
    'Educación Física',
    'Tecnología e Informática',
    'Ética y Valores',
    'Educación Religiosa',
    'Filosofía'
  ],
  'Media Vocacional': [
    'Español',
    'Inglés',
    'Matemáticas',
    'Física',
    'Química',
    'Biología',
    'Ciencias Sociales',
    'Filosofía',
    'Educación Física',
    'Informática',
    'Ética',
    'Religión',
    'Cátedra de la Paz',
    'Emprendimiento'
  ]
};

// Mock grades data
export const mockGrades = [
  // Geovanny Erick Salas Pérez - 11° grado
  {
    studentId: 1,
    period: 1,
    subject: 'Español',
    grade: 9.0,
    description: 'Excelente comprensión lectora'
  },
  {
    studentId: 1,
    period: 1,
    subject: 'Matemáticas',
    grade: 8.5,
    description: 'Buen dominio de álgebra'
  },
  {
    studentId: 1,
    period: 1,
    subject: 'Física',
    grade: 9.2,
    description: 'Sobresaliente en mecánica'
  },
  {
    studentId: 1,
    period: 1,
    subject: 'Química',
    grade: 8.8,
    description: 'Muy buen análisis de reacciones'
  },
  
  // Ashley Muñoz Rada - 2° grado
  {
    studentId: 3,
    period: 1,
    subject: 'Español',
    grade: 4.1,
    description: 'Muy buena lectoescritura'
  },
  {
    studentId: 3,
    period: 1,
    subject: 'Matemáticas',
    grade: 4.3,
    description: 'Excelente en operaciones básicas'
  },
  {
    studentId: 3,
    period: 1,
    subject: 'Ciencias Naturales',
    grade: 4.1,
    description: 'Curiosa por el entorno'
  },
  
  // Gabriel Antón Rosanía - 7° grado
  {
    studentId: 4,
    period: 1,
    subject: 'Español',
    grade: 3.5,
    description: 'Necesita mejorar la escritura'
  },
  {
    studentId: 4,
    period: 1,
    subject: 'Matemáticas',
    grade: 4.0,
    description: 'Buen razonamiento lógico'
  },
  {
    studentId: 4,
    period: 1,
    subject: 'Biología',
    grade: 4.0,
    description: 'Interés en ciencias naturales'
  }
];

// Academic periods
export const mockPeriods = [
  { id: 1, name: 'Primer Período', startDate: '2025-01-15', endDate: '2025-03-30' },
  { id: 2, name: 'Segundo Período', startDate: '2025-04-01', endDate: '2025-06-15' },
  { id: 3, name: 'Tercer Período', startDate: '2025-07-01', endDate: '2025-09-15' },
  { id: 4, name: 'Cuarto Período', startDate: '2025-09-16', endDate: '2025-11-30' }
];

// Performance scale
export const performanceScale = {
  'Básica Primaria': {
    'Superior': { min: 4.6, max: 5.0, code: 'S' },
    'Alto': { min: 4.0, max: 4.5, code: 'A' },
    'Básico': { min: 3.0, max: 3.9, code: 'Bs' },
    'Bajo': { min: 1.0, max: 2.9, code: 'Bj' }
  },
  'Básica Secundaria': {
    'Superior': { min: 9.0, max: 10.0, code: 'S' },
    'Alto': { min: 8.0, max: 8.9, code: 'A' },
    'Básico': { min: 6.0, max: 7.9, code: 'Bs' },
    'Bajo': { min: 1.0, max: 5.9, code: 'Bj' }
  }
};

// School information
export const schoolInfo = {
  name: 'GIMNASIO AMERICANO DEL ATLÁNTICO',
  levels: {
    preescolar: 'PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA',
    license: 'LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002',
    vocational: 'LICENCIA DE FUNCIONAMIENTO RES. 1257 DEL 7 DE SEPTIEMBRE DE 1.999',
    dane: 'REGISTRO DANE 308758-001703 NIT 830.503.934-4'
  },
  academicYear: 2025
};