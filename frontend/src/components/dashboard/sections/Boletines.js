import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import { 
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  BookOpen,
  Filter,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { studentService, gradeService } from '../../../services/api';
import { SUBJECTS, PERIODS } from '../../../mockData';

const Boletines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState({});

  useEffect(() => {
    loadStudents();
  }, [user]);

  useEffect(() => {
    if (students.length > 0) {
      loadConsolidatedGrades();
    }
  }, [students, selectedPeriod]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      let studentsList = [];
      
      if (user.role === 'docente_bachillerato') {
        if (user.grades && user.grades.length > 0) {
          const allStudents = await studentService.getAll();
          studentsList = allStudents.filter(student => 
            user.grades.includes(student.grade)
          );
        }
      } else if (user.role === 'docente_primaria') {
        if (user.grade) {
          const allStudents = await studentService.getAll();
          studentsList = allStudents.filter(student => 
            student.grade === user.grade
          );
        }
      }
      
      setStudents(studentsList);
      
      if (studentsList.length > 0 && !selectedGrade) {
        setSelectedGrade(studentsList[0].grade);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConsolidatedGrades = async () => {
    try {
      const periods = [selectedPeriod];
      const consolidated = await gradeService.getConsolidatedGrades(periods, selectedGrade);
      setConsolidatedData(consolidated);
    } catch (error) {
      console.error('Error loading consolidated grades:', error);
    }
  };

  const generateBoletin = async (student) => {
    try {
      toast({
        title: "Generando boletín",
        description: `Preparando boletín para ${student.name}...`,
      });

      // Simular generación de boletín
      setTimeout(() => {
        toast({
          title: "Boletín generado",
          description: `Boletín de ${student.name} listo para descargar`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el boletín",
        variant: "destructive",
      });
    }
  };

  // Función para determinar el nivel educativo
  const determineEducationalLevel = (grade) => {
    if (['TRANSICIÓN', 'TRANSICION'].includes(grade.toUpperCase())) {
      return 'TRANSICION';
    } else if (['1°', '2°', '3°', '4°', '5°'].includes(grade)) {
      return 'PRIMARIA';
    } else if (['6°', '7°', '8°', '9°', '10°', '11°'].includes(grade)) {
      return 'BACHILLERATO';
    }
    return 'BACHILLERATO'; // default
  };

  // Función para generar boletín de Transición
  const generateBoletinTransicion = (boletinData, grades) => {
    const dimensiones = {
      'DIMENSIÓN COGNITIVA': grades.filter(g => ['PRE-MATEMÁTICA', 'PRE-LECTOESCRITURA', 'EXPLORACIÓN DEL MEDIO'].includes(g.subject)),
      'DIMENSIÓN COMUNICATIVA': grades.filter(g => ['EXPRESIÓN ORAL', 'COMPRENSIÓN LECTORA', 'INGLÉS BÁSICO'].includes(g.subject)),
      'DIMENSIÓN ARTÍSTICA': grades.filter(g => ['ARTES PLÁSTICAS', 'MÚSICA Y MOVIMIENTO', 'EXPRESIÓN CORPORAL'].includes(g.subject)),
      'DIMENSIÓN ÉTICA Y VALORES': grades.filter(g => ['CONVIVENCIA ESCOLAR', 'VALORES INSTITUCIONALES'].includes(g.subject)),
      'DIMENSIÓN CORPORAL': grades.filter(g => ['PSICOMOTRICIDAD', 'EDUCACIÓN FÍSICA'].includes(g.subject))
    };

    return `
╔══════════════════════════════════════════════════════════════╗
║              BOLETÍN ACADÉMICO - TRANSICIÓN                  ║
║                ${boletinData.institucion}                ║
╚══════════════════════════════════════════════════════════════╝

INFORMACIÓN DEL ESTUDIANTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nombre: ${boletinData.estudiante}
• Grado: ${boletinData.grado}
• Período: ${boletinData.periodo}
• Docente Titular: ${boletinData.docente}
• Fecha: ${boletinData.fecha}

EVALUACIÓN POR DIMENSIONES DEL DESARROLLO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${Object.keys(dimensiones).map(dimension => `
🔸 ${dimension}:
${dimensiones[dimension].length > 0 ? 
  dimensiones[dimension].map(nota => `   • ${nota.subject}: ${nota.performance_level || 'EN PROCESO'}`).join('\n') :
  '   • EN PROCESO DE EVALUACIÓN'
}
`).join('')}

PROCESO DE DESARROLLO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Adaptación al ambiente escolar: POSITIVA
• Participación en actividades: ACTIVA
• Relaciones interpersonales: EN DESARROLLO
• Autonomía personal: PROGRESIVA

OBSERVACIONES PEDAGÓGICAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${grades.length > 0 ? 
  'El estudiante muestra un desarrollo integral acorde a su edad y grado de madurez. Se evidencia progreso en las diferentes dimensiones del desarrollo.' : 
  'El proceso de evaluación se centra en el desarrollo integral del niño/a, observando sus avances en las diferentes dimensiones.'}

RECOMENDACIONES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Continuar fortaleciendo la rutina de estudio en casa
• Fomentar la lectura de cuentos y actividades lúdicas
• Mantener comunicación constante familia-colegio
• Desarrollar actividades de motricidad fina y gruesa

╔══════════════════════════════════════════════════════════════╗
║   GIMNASIO AMERICANO ATLÁNTICO - GADA                       ║
║   "Formando líderes integrales para el futuro"              ║
║   Generado: ${new Date().toLocaleString('es-CO')}            ║
╚══════════════════════════════════════════════════════════════╝
    `;
  };

  // Función para generar boletín de Primaria
  const generateBoletinPrimaria = (boletinData, grades) => {
    const materiasPrimaria = [
      'MATEMÁTICA', 'HUMANIDADES', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 
      'INGLÉS', 'EDUCACIÓN FÍSICA', 'ARTES', 'ÉTICA Y VALORES', 'RELIGIÓN',
      'CONVIVENCIA ESCOLAR', 'TECNOLOGÍA E INFORMÁTICA'
    ];

    const notasPorMateria = materiasPrimaria.map(materia => {
      const nota = grades.find(g => g.subject === materia);
      return {
        asignatura: materia,
        nota: nota ? nota.grade : 'Pendiente',
        desempeño: nota ? nota.performance_level : 'SIN EVALUAR',
        observaciones: nota ? nota.teacher_notes || 'Sin observaciones' : 'Pendiente de evaluación'
      };
    });

    const promedio = grades.length > 0 ? 
      (grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length).toFixed(1) : 
      'Pendiente';

    return `
╔══════════════════════════════════════════════════════════════╗
║              BOLETÍN ACADÉMICO - PRIMARIA                    ║
║                ${boletinData.institucion}                ║
╚══════════════════════════════════════════════════════════════╝

INFORMACIÓN DEL ESTUDIANTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Nombre: ${boletinData.estudiante}
• Grado: ${boletinData.grado} - BÁSICA PRIMARIA
• Período Académico: ${boletinData.periodo}
• Docente Titular: ${boletinData.docente}
• Fecha de Emisión: ${boletinData.fecha}

ÁREAS DEL CONOCIMIENTO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${notasPorMateria.map(materia => `
📚 ${materia.asignatura}
   Calificación: ${materia.nota}
   Desempeño: ${materia.desempeño}
   Observaciones: ${materia.observaciones}
`).join('')}

CONSOLIDADO ACADÉMICO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Promedio General: ${promedio}
• Áreas Evaluadas: ${grades.length}/${materiasPrimaria.length}
• Nivel de Desempeño General: ${promedio >= 4.5 ? 'SUPERIOR' : promedio >= 4.0 ? 'ALTO' : promedio >= 3.0 ? 'BÁSICO' : 'BAJO'}

COMPETENCIAS TRANSVERSALES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Trabajo en equipo: EN DESARROLLO
• Comunicación efectiva: EN DESARROLLO  
• Pensamiento crítico: EN DESARROLLO
• Responsabilidad académica: EN DESARROLLO

OBSERVACIONES DEL DOCENTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${grades.length > 0 ? 
  `El estudiante ${boletinData.estudiante} ha demostrado un desempeño ${promedio >= 4.0 ? 'destacado' : promedio >= 3.0 ? 'satisfactorio' : 'que requiere refuerzo'} durante este período académico. Se evidencian fortalezas en las áreas evaluadas y se recomienda continuar con el proceso de acompañamiento familiar.` : 
  'El estudiante se encuentra en proceso de evaluación. Se requiere completar las actividades pendientes para generar el consolidado académico correspondiente.'}

COMPROMISOS Y RECOMENDACIONES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Mantener rutinas de estudio diarias
• Fomentar la lectura comprensiva
• Participar activamente en clase
• Cumplir con tareas y trabajos asignados

╔══════════════════════════════════════════════════════════════╗
║   GIMNASIO AMERICANO ATLÁNTICO - GADA                       ║
║   NIT: 900.123.456-7 | Resolución 12345 de 2020           ║
║   "Educación integral para la excelencia académica"         ║
║   Generado: ${new Date().toLocaleString('es-CO')}            ║
╚══════════════════════════════════════════════════════════════╝
    `;
  };

  // Función para generar boletín de Bachillerato
  const generateBoletinBachillerato = (boletinData, grades) => {
    const materiasBachillerato = [
      'MATEMÁTICA', 'FÍSICA', 'QUÍMICA', 'BIOLOGÍA', 'HUMANIDADES', 
      'CIENCIAS SOCIALES', 'INGLÉS', 'EDUCACIÓN FÍSICA', 'ARTES',
      'ÉTICA Y VALORES', 'RELIGIÓN', 'FILOSOFÍA', 'ECONOMÍA Y POLÍTICA',
      'TECNOLOGÍA E INFORMÁTICA', 'CONVIVENCIA ESCOLAR'
    ];

    const notasPorMateria = materiasBachillerato.map(materia => {
      const nota = grades.find(g => g.subject === materia);
      return {
        asignatura: materia,
        nota: nota ? nota.grade : 'Pendiente',
        desempeño: nota ? nota.performance_level : 'SIN EVALUAR',
        observaciones: nota ? nota.teacher_notes || 'Sin observaciones' : 'Pendiente de evaluación',
        intensidad: nota ? '4 horas semanales' : 'N/A'
      };
    });

    const promedio = grades.length > 0 ? 
      (grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length).toFixed(1) : 
      'Pendiente';

    const nivel = boletinData.grado.includes('10') || boletinData.grado.includes('11') ? 'EDUCACIÓN MEDIA' : 'BÁSICA SECUNDARIA';

    return `
╔══════════════════════════════════════════════════════════════╗
║              BOLETÍN ACADÉMICO - BACHILLERATO                ║
║                ${boletinData.institucion}                ║
║                    EDUCACIÓN ${nivel}                        ║
╚══════════════════════════════════════════════════════════════╝

INFORMACIÓN DEL ESTUDIANTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Estudiante: ${boletinData.estudiante}
• Grado: ${boletinData.grado} - ${nivel}
• Período Académico: ${boletinData.periodo} / 2025
• Fecha de Emisión: ${boletinData.fecha}

ASIGNATURAS Y CALIFICACIONES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${notasPorMateria.map(materia => `
📖 ${materia.asignatura} (${materia.intensidad})
   ├─ Calificación Final: ${materia.nota}
   ├─ Nivel de Desempeño: ${materia.desempeño}
   └─ Observaciones: ${materia.observaciones}
`).join('')}

CONSOLIDADO ACADÉMICO PERÍODO ${boletinData.periodo}:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┌─────────────────────────────────────────────────────────────┐
│ PROMEDIO GENERAL: ${promedio}                                  │
│ ASIGNATURAS CURSADAS: ${materiasBachillerato.length}                               │
│ ASIGNATURAS EVALUADAS: ${grades.length}                                  │
│ DESEMPEÑO GENERAL: ${promedio >= 4.6 ? 'SUPERIOR (96-100%)' : promedio >= 4.0 ? 'ALTO (80-95%)' : promedio >= 3.0 ? 'BÁSICO (60-79%)' : 'BAJO (<60%)'}         │
└─────────────────────────────────────────────────────────────┘

COMPETENCIAS DEL SIGLO XXI:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Pensamiento Crítico y Resolución de Problemas: EN DESARROLLO
• Creatividad e Innovación: EN DESARROLLO
• Comunicación y Colaboración: EN DESARROLLO
• Alfabetización Tecnológica: EN DESARROLLO
• Flexibilidad y Adaptabilidad: EN DESARROLLO

OBSERVACIONES ACADÉMICAS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${grades.length > 0 ? 
  `El/La estudiante ${boletinData.estudiante} presenta un rendimiento académico ${promedio >= 4.0 ? 'SOBRESALIENTE' : promedio >= 3.0 ? 'SATISFACTORIO' : 'QUE REQUIERE MEJORAMIENTO'} en el período evaluado. ${promedio >= 4.0 ? 'Se destaca su compromiso y dedicación en el proceso de aprendizaje.' : promedio >= 3.0 ? 'Cumple con los objetivos básicos de aprendizaje establecidos.' : 'Se requiere mayor compromiso y acompañamiento para alcanzar los logros esperados.'}` : 
  'El estudiante se encuentra en proceso de evaluación continua. Se requiere completar las actividades académicas pendientes para la emisión del consolidado definitivo.'}

PLAN DE MEJORAMIENTO Y PROYECCIÓN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Fortalecer hábitos de estudio independiente
• Desarrollar proyectos de investigación disciplinar
• Participar en actividades de liderazgo estudiantil
• Prepararse para la educación superior y/o mundo laboral

COMPROMISOS INSTITUCIONALES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Acompañamiento pedagógico personalizado
• Orientación vocacional y profesional
• Formación en valores y competencias ciudadanas
• Preparación para pruebas de estado (ICFES)

╔══════════════════════════════════════════════════════════════╗
║   GIMNASIO AMERICANO ATLÁNTICO - GADA                       ║
║   NIT: 900.123.456-7 | Licencia 12345 SED Atlántico       ║
║   "Formando líderes transformadores del siglo XXI"          ║
║                                                              ║
║   Rector: [Nombre del Rector]                                ║
║   Coordinadora Académica: [Nombre de la Coordinadora]       ║
║   Generado automáticamente: ${new Date().toLocaleString('es-CO')} ║
╚══════════════════════════════════════════════════════════════╝
    `;
  };

  const downloadBoletin = async (student) => {
    try {
      // Obtener notas reales del estudiante para el período seleccionado
      const grades = await gradeService.getStudentGrades(student._id || student.id, selectedPeriod);
      
      // Crear datos básicos del boletín
      const boletinData = {
        estudiante: student.name,
        grado: student.grade,
        periodo: selectedPeriod,
        institucion: "Gimnasio Americano Atlántico - GADA",
        fecha: new Date().toLocaleDateString('es-CO'),
        docente: user.name
      };

      // Determinar el nivel educativo y generar boletín correspondiente
      const nivel = determineEducationalLevel(student.grade);
      let boletinContent = '';

      switch (nivel) {
        case 'TRANSICION':
          boletinContent = generateBoletinTransicion(boletinData, grades);
          break;
        case 'PRIMARIA':
          boletinContent = generateBoletinPrimaria(boletinData, grades);
          break;
        case 'BACHILLERATO':
        default:
          boletinContent = generateBoletinBachillerato(boletinData, grades);
          break;
      }

      // Crear y descargar archivo
      const blob = new Blob([boletinContent], { type: 'text/plain;charset=utf-8' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const fileName = `BOLETIN_${nivel}_${student.name.replace(/\s+/g, '_')}_${student.grade}_P${selectedPeriod}_${new Date().toISOString().split('T')[0]}.txt`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: `Boletín de ${nivel} generado`,
        description: `Boletín específico de ${student.name} con estructura de ${nivel} descargado exitosamente`,
      });
      
    } catch (error) {
      console.error('Error generating bulletin:', error);
      toast({
        title: "Error al generar boletín",
        description: "No se pudo generar el boletín. Verifique la conexión y los permisos.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const availableGrades = [...new Set(students.map(student => student.grade))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-indigo-500/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Boletines Académicos
              </h1>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl text-lg font-bold shadow-lg animate-bounce">
                📋 BOLETINES
              </div>
            </div>
            <p className="text-gray-700 font-medium">Generar y descargar boletines estudiantiles</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-blue-100">Para boletines</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período Actual</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedPeriod}</div>
            <p className="text-xs text-green-100">Período académico</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.subjects?.length || 0}</div>
            <p className="text-xs text-purple-100">Materias a cargo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grados</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableGrades.length}</div>
            <p className="text-xs text-orange-100">Grados disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros y Configuración</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Filtro por período */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Período:</span>
              {PERIODS.map(period => (
                <Badge
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Badge>
              ))}
            </div>

            {/* Filtro por grado */}
            {availableGrades.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Grado:</span>
                <select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="">Todos</option>
                  {availableGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Buscador */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudiantes para boletines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Boletines Disponibles ({filteredStudents.length})</span>
            </div>
            <Button 
              onClick={() => {
                filteredStudents.forEach(student => downloadBoletin(student));
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={filteredStudents.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Todos
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando estudiantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron estudiantes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student, index) => (
                <div key={student._id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{student.grade}</Badge>
                            <Badge variant="secondary">{student.level}</Badge>
                            <span className="text-xs text-gray-500">
                              Doc: {student.document_number || 'No registrado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Estado del boletín */}
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disponible
                      </Badge>
                      
                      {/* Acciones */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateBoletin(student)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Previsualizar
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => downloadBoletin(student)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Boletines;