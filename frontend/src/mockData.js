// Mock data para el Sistema de Gestión Escolar - Gimnasio Americano del Atlántico

export const INSTITUTIONAL_INFO = {
  name: "GIMNASIO AMERICANO DEL ATLÁNTICO",
  subtitle: "PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA",
  subtitle2: "MEDIA VOCACIONAL COMERCIAL",
  licenses: [
    "LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002",
    "LICENCIA DE FUNCIONAMIENTO RES. 1557 DEL 7 DE SEPTIEMBRE DE 1.999"
  ],
  dane: "308758-001703",
  nit: "830.503.934-4",
  coordinator: {
    name: "Pedro Hurtado",
    position: "Coordinador Académico",
    email: "pedro_12hurbe@hotmail.com",
    phone: "3011968877"
  }
};

export const GRADES = {
  PREESCOLAR: ["Transición", "0°"],
  PRIMARIA: ["1°", "2°", "3°", "4°", "5°"],
  BACHILLERATO: ["6°", "7°", "8°", "9°", "10°", "11°"]
};

export const SUBJECTS = {
  PRIMARIA: [
    "HUMANIDADES", "INGLÉS", "MATEMÁTICA", "GEOMETRÍA", "ESTADÍSTICA",
    "CIENCIAS NATURALES", "C.N. SEXUAL", "CIENCIAS SOCIALES", "CÁTEDRA DE LA PAZ",
    "ÉTICA Y RELIGIÓN", "ED. RELIGIOSA Y MORAL", "TECNOLOGÍA", "INFORMÁTICA",
    "ED. FÍS. REC Y DEP", "ED. FÍSICA", "CONVIVENCIA ESCOLAR", "ACOMPAÑAMIENTO DEL ACUDIENTE"
  ],
  BACHILLERATO: [
    "HUMANIDADES", "LENGUA CASTELLANA", "INGLÉS", "MATEMÁTICA", "GEOMETRÍA", "ESTADÍSTICA",
    "BIOLOGÍA", "QUÍMICA", "FÍSICA", "CIENCIAS SOCIALES", "FILOSOFÍA",
    "ÉTICA Y RELIGIÓN", "TECNOLOGÍA", "INFORMÁTICA", "ED. FÍSICA", "EMPRENDIMIENTO",
    "PROYECTO DE VIDA", "SERVICIO SOCIAL"
  ]
};

export const PERIODS = ["I", "II", "III", "IV"];

export const USER_ROLES = {
  ADMIN: "admin",
  DOCENTE_PRIMARIA: "docente_primaria",
  DOCENTE_BACHILLERATO: "docente_bachillerato", 
  COORDINADOR_CONVIVENCIA: "coordinador_convivencia",
  PADRE: "padre",
  ESTUDIANTE: "estudiante"
};

export const MOCK_USERS = [
  {
    id: "admin001",
    username: "pedro.hurtado",
    name: "Pedro Hurtado",
    role: USER_ROLES.ADMIN,
    email: "pedro_12hurbe@hotmail.com",
    phone: "3011968877"
  },
  {
    id: "doc001",
    username: "yocelyn.cabarcas",
    name: "Yocelyn Cabarcas Navarro",
    role: USER_ROLES.DOCENTE_PRIMARIA,
    email: "yocelyn.cabarcas@gimamericano.edu.co",
    grade: "2°",
    subjects: SUBJECTS.PRIMARIA
  },
  {
    id: "doc002",
    username: "bifencia.orozco",
    name: "Bifencia Orozco Tordecilla",
    role: USER_ROLES.DOCENTE_PRIMARIA,
    email: "bifencia.orozco@gimamericano.edu.co",
    grade: "1°",
    subjects: SUBJECTS.PRIMARIA
  },
  {
    id: "doc003",
    username: "carolina.sierra",
    name: "Carolina Sierra",
    role: USER_ROLES.DOCENTE_BACHILLERATO,
    email: "carolina.sierra@gimamericano.edu.co",
    subjects: ["MATEMÁTICA", "GEOMETRÍA"],
    grades: ["6°", "7°", "8°", "9°", "10°", "11°"]
  },
  {
    id: "conv001",
    username: "coord.convivencia",
    name: "Coordinadora de Convivencia",
    role: USER_ROLES.COORDINADOR_CONVIVENCIA,
    email: "convivencia@gimamericano.edu.co"
  }
];

export const MOCK_STUDENTS = [
  {
    id: "est001",
    name: "ANTÓN ROSANÍA GABRIEL ESTEBAN",
    grade: "2°",
    level: "BÁSICA SECUNDARIA",
    docente_id: "doc001",
    padre_id: "pad001",
    grades: {
      "I": { HUMANIDADES: 2.5, INGLÉS: 2.7, MATEMÁTICA: 4.0, GEOMETRÍA: 4.0 },
      "II": { HUMANIDADES: 2.0, INGLÉS: 2.0, MATEMÁTICA: 2.0, GEOMETRÍA: 2.0 }
    }
  },
  {
    id: "est002", 
    name: "MUÑOZ RADA ASHLEY SALOME",
    grade: "1°",
    level: "BÁSICA PRIMARIA",
    docente_id: "doc002",
    padre_id: "pad002",
    grades: {
      "I": { HUMANIDADES: 4.0, INGLÉS: 4.0, MATEMÁTICA: 4.5, GEOMETRÍA: 4.5 },
      "II": { HUMANIDADES: 4.0, INGLÉS: 4.0, MATEMÁTICA: 4.0, GEOMETRÍA: 4.0 }
    }
  },
  {
    id: "est003",
    name: "GEOVANNY ERICK SALAS PÁEZ",
    grade: "11°",
    level: "BÁSICA SECUNDARIA", 
    docente_id: "doc003",
    padre_id: "pad003",
    grades: {
      "I": { BIOLOGÍA: 9.0, QUÍMICA: 8.5, FÍSICA: 9.5, MATEMÁTICA: 10.0 },
      "II": { BIOLOGÍA: 9.2, QUÍMICA: 8.8, FÍSICA: 9.8, MATEMÁTICA: 10.0 }
    }
  },
  {
    id: "est004",
    name: "TALAIGUA PERIRAN DANNY MANUEL",
    grade: "3°",
    level: "BÁSICA SECUNDARIA",
    docente_id: "doc001",
    padre_id: "pad004",
    grades: {
      "I": { HUMANIDADES: 4.2, INGLÉS: 4.2, MATEMÁTICA: 4.5, GEOMETRÍA: 4.5 },
      "II": { HUMANIDADES: 4.0, INGLÉS: 4.0, MATEMÁTICA: 4.0, GEOMETRÍA: 4.2 }
    }
  }
];

export const MOCK_PROJECTS = [
  {
    id: "proy001",
    title: "Proyecto de Lectura Comprensiva",
    description: "Mejora en habilidades de comprensión lectora",
    uploaded_by: "doc001",
    date: "2025-01-15",
    grade: "1°-5°",
    status: "Activo"
  },
  {
    id: "proy002", 
    title: "Convivencia y Valores",
    description: "Fortalecimiento de valores institucionales",
    uploaded_by: "conv001",
    date: "2025-01-10",
    grade: "Todos",
    status: "Activo"
  },
  {
    id: "proy003",
    title: "Ciencias Experimentales",
    description: "Laboratorios virtuales de ciencias",
    uploaded_by: "doc003", 
    date: "2025-01-20",
    grade: "6°-11°",
    status: "En desarrollo"
  }
];

export const PERFORMANCE_SCALE = {
  SUPERIOR: { min: 4.6, max: 5.0, label: "DESEMPEÑO SUPERIOR" },
  ALTO: { min: 4.0, max: 4.5, label: "DESEMPEÑO ALTO" },
  BASICO: { min: 3.0, max: 3.9, label: "DESEMPEÑO BÁSICO" },
  BAJO: { min: 1.0, max: 2.9, label: "DESEMPEÑO BAJO" }
};

export const getPerformanceLevel = (grade) => {
  const numGrade = parseFloat(grade);
  if (numGrade >= 4.6) return PERFORMANCE_SCALE.SUPERIOR;
  if (numGrade >= 4.0) return PERFORMANCE_SCALE.ALTO; 
  if (numGrade >= 3.0) return PERFORMANCE_SCALE.BASICO;
  return PERFORMANCE_SCALE.BAJO;
};

export const BULLETIN_TEMPLATES = {
  TRANSICION: "transicion",
  PRIMARIA: "primaria", 
  BACHILLERATO: "bachillerato",
  GRADO_11: "grado_11"
};

export const getBulletinTemplate = (grade) => {
  if (grade === "Transición") return BULLETIN_TEMPLATES.TRANSICION;
  if (["1°", "2°", "3°", "4°", "5°"].includes(grade)) return BULLETIN_TEMPLATES.PRIMARIA;
  if (grade === "11°") return BULLETIN_TEMPLATES.GRADO_11;
  return BULLETIN_TEMPLATES.BACHILLERATO;
};