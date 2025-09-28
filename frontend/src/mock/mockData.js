// Mock users for different roles
export const mockUsers = [
  // Administrators
  {
    id: 1,
    email: 'admin@gada.edu.co',
    password: 'admin123',
    name: 'Pedro Hurtado',
    role: 'admin',
    position: 'Coordinador Académico'
  },
  
  // Teachers
  {
    id: 2,
    email: 'profesor1@gada.edu.co',
    password: 'prof123',
    name: 'Ana María González',
    role: 'teacher',
    teachingLevel: 'primaria',
    grades: ['1°', '2°'],
    subjects: ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 'INGLÉS', 'EDUCACIÓN ARTÍSTICA', 'ÉTICA Y RELIGIÓN', 'INFORMÁTICA']
  },
  {
    id: 3,
    email: 'profesor2@gada.edu.co',
    password: 'prof123',
    name: 'Carlos Alberto Ruiz',
    role: 'teacher',
    teachingLevel: 'bachillerato',
    grades: ['6°', '7°', '8°'],
    subjects: ['MATEMÁTICAS', 'FÍSICA']
  },
  {
    id: 4,
    email: 'profesora3@gada.edu.co',
    password: 'prof123',
    name: 'Luz Marina Torres',
    role: 'teacher',
    teachingLevel: 'transicion',
    grades: ['0°'],
    subjects: ['DIMENSIÓN COMUNICATIVA', 'DIMENSIÓN COGNITIVA', 'DIMENSIÓN CORPORAL', 'DIMENSIÓN ESTÉTICA', 'DIMENSIÓN ÉTICA']
  },
  
  // Coordinadora de Convivencia
  {
    id: 5,
    email: 'convivencia@gada.edu.co',
    password: 'conv123',
    name: 'Sandra Patricia López',
    role: 'coordinadora_convivencia'
  },
  
  // Students with login credentials
  {
    id: 101,
    email: 'geovanny.salas@estudiante.gada.edu.co',
    password: 'est123',
    name: 'Geovanny Erick Salas Pérez',
    role: 'student',
    studentId: 1,
    grade: '11°',
    document: '1087585001426',
    parentId: 201
  },
  {
    id: 102,
    email: 'maria.salas@estudiante.gada.edu.co',
    password: 'est123',
    name: 'María Isabel Salas Pérez',
    role: 'student',
    studentId: 2,
    grade: '3°',
    document: '1087585001427',
    parentId: 201
  },
  {
    id: 103,
    email: 'ashley.munoz@estudiante.gada.edu.co',
    password: 'est123',
    name: 'Ashley Muñoz Rada',
    role: 'student',
    studentId: 3,
    grade: '2°',
    document: '1087585001428',
    parentId: 202
  },
  {
    id: 104,
    email: 'gabriel.rosania@estudiante.gada.edu.co',
    password: 'est123',
    name: 'Gabriel Antón Rosanía',
    role: 'student',
    studentId: 4,
    grade: '7°',
    document: '1087585001429',
    parentId: 203
  },
  {
    id: 105,
    email: 'santiago.moreno@estudiante.gada.edu.co',
    password: 'est123',
    name: 'Santiago Moreno Castro',
    role: 'student',
    studentId: 5,
    grade: '0°',
    document: '1087585001430',
    parentId: 204
  },
  
  // Parents
  {
    id: 201,
    email: 'padre.salas@gada.edu.co',
    password: 'pad123',
    name: 'Roberto Salas',
    role: 'parent',
    children: [1, 2] // studentIds
  },
  {
    id: 202,
    email: 'madre.munoz@gada.edu.co',
    password: 'pad123',
    name: 'Carmen Rada',
    role: 'parent',
    children: [3]
  },
  {
    id: 203,
    email: 'padre.rosania@gada.edu.co',
    password: 'pad123',
    name: 'Antonio Rosanía',
    role: 'parent',
    children: [4]
  },
  {
    id: 204,
    email: 'madre.moreno@gada.edu.co',
    password: 'pad123',
    name: 'Claudia Castro',
    role: 'parent',
    children: [5]
  }
];

// Mock students data with correct grade structure (0° to 11°)
export const mockStudents = [
  {
    id: 1,
    name: 'Geovanny Erick Salas Pérez',
    grade: '11°',
    level: 'Media Vocacional',
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
  },
  {
    id: 5,
    name: 'Ana Sofia Torres',
    grade: '0°',
    level: 'Transición',
    academicYear: 2025,
    parentId: 8,
    document: '1087585001430',
    birthDate: '2018-04-12'
  }
];

// Mock subjects for different educational levels with correct structure
export const mockSubjectsByLevel = {
  'Transición': {
    areas: [
      {
        area: 'HUMANIDADES',
        subjects: [
          { name: 'ESPAÑOL', hours: 5 },
          { name: 'INGLES', hours: 2 }
        ]
      },
      {
        area: 'MATEMATICAS',
        subjects: [
          { name: 'MATEMATICAS', hours: 5 }
        ]
      },
      {
        area: 'INTEGRADA',
        subjects: [
          { name: 'SOCIALES-NATURALES', hours: 3 }
        ]
      },
      {
        area: 'ED. RELIGIOSA Y MORAL',
        subjects: [
          { name: 'ETICA Y RELIGION', hours: 1 }
        ]
      },
      {
        area: 'TECNOLOGIA',
        subjects: [
          { name: 'INFORMATICA', hours: 1 }
        ]
      },
      {
        area: 'ARTISTICA',
        subjects: [
          { name: 'ARTE', hours: 1 }
        ]
      },
      {
        area: 'ED. FIS, RECR Y DEP',
        subjects: [
          { name: 'ED. FISICA', hours: 2 }
        ]
      }
    ],
    specialSections: ['CONVIVENCIA ESCOLAR', 'ACOMPAÑAMIENTO DEL ACUDIENTE']
  },
  
  'Básica Primaria': {
    areas: [
      {
        area: 'HUMANIDADES',
        subjects: [
          { name: 'ESPAÑOL', hours: 5 },
          { name: 'CALIGRAFIA', hours: 1 },
          { name: 'INGLES', hours: 3 }
        ]
      },
      {
        area: 'MATEMATICAS',
        subjects: [
          { name: 'MATEMATICAS', hours: 5 }
        ]
      },
      {
        area: 'C. NATURALES Y EDUCACION AMBIENTAL',
        subjects: [
          { name: 'NATURALES', hours: 3 }
        ]
      },
      {
        area: 'CIENCIAS SOCIALES',
        subjects: [
          { name: 'SOCIALES', hours: 2 },
          { name: 'CATEDRA DE PAZ', hours: 1 }
        ]
      },
      {
        area: 'ED. RELIGIOSA Y MORAL',
        subjects: [
          { name: 'ETICA Y RELIGION', hours: 1 }
        ]
      },
      {
        area: 'TECNOLOGIA',
        subjects: [
          { name: 'INFORMATICA', hours: 1 }
        ]
      },
      {
        area: 'ARTISTICA',
        subjects: [
          { name: 'ARTE', hours: 1 }
        ]
      },
      {
        area: 'ED. FIS, RECR Y DEP',
        subjects: [
          { name: 'ED. FISICA', hours: 2 }
        ]
      }
    ],
    specialSections: ['CONVIVENCIA ESCOLAR', 'ACOMPAÑAMIENTO DEL ACUDIENTE']
  },

  'Básica Secundaria': {
    areas: [
      {
        area: 'HUMANIDADES',
        subjects: [
          { name: 'ESPAÑOL', hours: 5 },
          { name: 'INGLES', hours: 4 }
        ]
      },
      {
        area: 'MATEMÁTICAS',
        subjects: [
          { name: 'MATEMATICA', hours: 3 },
          { name: 'GEOMETRIA', hours: 1 },
          { name: 'ESTADISTICA', hours: 1 }
        ]
      },
      {
        area: 'CIENCIAS NATURALES Y EDUCACIÓN AMBIENTAL',
        subjects: [
          { name: 'BIOLOGIA', hours: 2 },
          { name: 'ED. SEXUAL', hours: 1 },
          { name: 'QUIMICA', hours: 1 },
          { name: 'FISICA', hours: 1 }
        ]
      },
      {
        area: 'CIENCIAS SOCIALES',
        subjects: [
          { name: 'HISTORIA', hours: 2 },
          { name: 'GEOGRAFIA', hours: 2 },
          { name: 'CATEDRA DE LA PAZ', hours: 1 }
        ]
      },
      {
        area: 'VOCACIONAL',
        subjects: [
          { name: 'EMPRENDIMIENTO', hours: 1 }
        ]
      },
      {
        area: 'ED. RELIGIOSA Y MORAL',
        subjects: [
          { name: 'ETICA Y RELIGION', hours: 1 }
        ]
      },
      {
        area: 'TECNOLOGIA',
        subjects: [
          { name: 'INFORMATICA', hours: 1 }
        ]
      },
      {
        area: 'ARTISTICA',
        subjects: [
          { name: 'ARTE', hours: 1 }
        ]
      },
      {
        area: 'ED. FIS, RECR Y DEP',
        subjects: [
          { name: 'ED. FISICA', hours: 2 }
        ]
      }
    ],
    specialSections: ['CONVIVENCIA ESCOLAR', 'ACOMPAÑAMIENTO DEL ACUDIENTE']
  },

  'Media Vocacional': {
    areas: [
      {
        area: 'HUMANIDADES',
        subjects: [
          { name: 'ESPAÑOL', hours: 5 },
          { name: 'INGLES', hours: 4 }
        ]
      },
      {
        area: 'MATEMÁTICAS',
        subjects: [
          { name: 'MATEMATICA', hours: 3 },
          { name: 'GEOMETRIA', hours: 1 },
          { name: 'ESTADISTICA', hours: 1 }
        ]
      },
      {
        area: 'CIENCIAS NATURALES Y EDUCACIÓN AMBIENTAL',
        subjects: [
          { name: 'BIOLOGIA', hours: 2 },
          { name: 'ED. SEXUAL', hours: 1 },
          { name: 'QUIMICA', hours: 1 },
          { name: 'FISICA', hours: 1 }
        ]
      },
      {
        area: 'CIENCIAS SOCIALES',
        subjects: [
          { name: 'HISTORIA', hours: 2 },
          { name: 'GEOGRAFIA', hours: 2 },
          { name: 'CATEDRA DE LA PAZ', hours: 1 }
        ]
      },
      {
        area: 'VOCACIONAL',
        subjects: [
          { name: 'EMPRENDIMIENTO', hours: 1 }
        ]
      },
      {
        area: 'ED. RELIGIOSA Y MORAL',
        subjects: [
          { name: 'ETICA Y RELIGION', hours: 1 }
        ]
      },
      {
        area: 'TECNOLOGIA',
        subjects: [
          { name: 'INFORMATICA', hours: 1 }
        ]
      },
      {
        area: 'ARTISTICA',
        subjects: [
          { name: 'ARTE', hours: 1 }
        ]
      },
      {
        area: 'ED. FIS, RECR Y DEP',
        subjects: [
          { name: 'ED. FISICA', hours: 2 }
        ]
      }
    ],
    specialSections: ['CONVIVENCIA ESCOLAR', 'ACOMPAÑAMIENTO DEL ACUDIENTE']
  }
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
  { 
    id: 1, 
    name: 'Primer Período', 
    startDate: '2025-01-15', 
    endDate: '2025-03-30',
    gradeEntryStart: '2025-03-20T08:00',
    gradeEntryEnd: '2025-03-30T18:00',
    isActive: true,
    isGradeEntryOpen: true
  },
  { 
    id: 2, 
    name: 'Segundo Período', 
    startDate: '2025-04-01', 
    endDate: '2025-06-15',
    gradeEntryStart: '2025-06-05T08:00',
    gradeEntryEnd: '2025-06-15T18:00',
    isActive: false,
    isGradeEntryOpen: false
  },
  { 
    id: 3, 
    name: 'Tercer Período', 
    startDate: '2025-07-01', 
    endDate: '2025-09-15',
    gradeEntryStart: '2025-09-05T08:00',
    gradeEntryEnd: '2025-09-15T18:00',
    isActive: false,
    isGradeEntryOpen: false
  },
  { 
    id: 4, 
    name: 'Cuarto Período', 
    startDate: '2025-09-16', 
    endDate: '2025-11-30',
    gradeEntryStart: '2025-11-20T08:00',
    gradeEntryEnd: '2025-11-30T18:00',
    isActive: false,
    isGradeEntryOpen: false
  }
];

// Performance scale with correct GADA scales
export const performanceScale = {
  // Para Transición hasta 10° grado
  'default': {
    'DESEMPEÑO SUPERIOR': { min: 4.8, max: 5.0, code: 'S' },
    'DESEMPEÑO ALTO': { min: 4.1, max: 4.7, code: 'A' },
    'DESEMPEÑO BÁSICO': { min: 3.3, max: 4.0, code: 'Bs' },
    'DESEMPEÑO BAJO': { min: 0.1, max: 3.2, code: 'Bj' }
  },
  // Solo para 11° grado
  'grado_11': {
    'DESEMPEÑO SUPERIOR': { min: 9.6, max: 10.0, code: 'S' },
    'DESEMPEÑO ALTO': { min: 7.8, max: 9.5, code: 'A' },
    'DESEMPEÑO BÁSICO': { min: 6.6, max: 7.7, code: 'Bs' },
    'DESEMPEÑO BAJO': { min: 1.0, max: 6.5, code: 'Bj' }
  }
};

// School information
export const schoolInfo = {
  name: 'GIMNASIO AMERICANO DEL ATLÁNTICO SEDE 2 MANUELA BELTRÁN',
  levels: {
    preescolar: 'PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA',
    license: 'LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002',
    vocational: 'LICENCIA DE FUNCIONAMIENTO RES. 1257 DEL 7 DE SEPTIEMBRE DE 1.999',
    dane: 'REGISTRO DANE 308758-001703 NIT 830.503.934-4'
  },
  academicYear: 2025,
  coordinator: 'Pedro Hurtado',
  position: 'Coordinador Académico',
  developer: 'Pedro Hurtado - Coordinador Académico',
  copyright: 'Derechos reservados a Pedro Hurtado - Coordinador Académico'
};