import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  PlusCircle,
  Edit,
  Save,
  UserPlus,
  X,
  Shield,
  Eye,
  Plus,
  UserCheck,
  FileText,
  Target,
  Download,
  BarChart3
} from 'lucide-react';
import { mockStudents, mockGrades, mockSubjects } from '../mock/mockData';
import { StudentsManager, PeriodsManager } from '../utils/dataManager';
import ProjectsManager from '../components/ProjectsManager';
import EnhancedGradePlanilla from '../components/EnhancedGradePlanilla';
import SelectorPlanillas from '../components/SelectorPlanillas';
import PlanillaCompletaPorPeriodo from '../components/PlanillaCompletaPorPeriodo';
import MaterialEstudiantesManager from '../components/MaterialEstudiantesManager';
import PreparadoresClase from '../components/PreparadoresClase';
import FilterControls from '../components/FilterControls';
import useFilters from '../hooks/useFilters';
import ApiService from '../services/apiService';

const TeacherDashboard = () => {
  const { user } = useAuth();
  
  // Estados existentes
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showProjectsManager, setShowProjectsManager] = useState(false);
  const [showGradePlanilla, setShowGradePlanilla] = useState(false);
  const [showMaterialManager, setShowMaterialManager] = useState(false);
  const [showSelectorPlanillas, setShowSelectorPlanillas] = useState(false);
  const [showPlanillaCompleta, setShowPlanillaCompleta] = useState(false);
  const [showPreparadores, setShowPreparadores] = useState(false);
  
  // Nuevos filtros dinámicos usando el hook personalizado
  const {
    selectedPeriod,
    setSelectedPeriod,
    selectedGrade: selectedGradeForStudents,
    setSelectedGrade: setSelectedGradeForStudents,
    filterStudents,
    filterGrades,
    filterObservations,
    resetFilters,
    getFilteredStats
  } = useFilters('1', 'all');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Cargar períodos dinámicamente
      const loadedPeriods = PeriodsManager.getAll();
      setPeriods(loadedPeriods);
      if (loadedPeriods.length > 0) {
        setSelectedPeriod(loadedPeriods[0].id.toString());
      }
      
      // Cargar estudiantes desde múltiples fuentes
      const mockStudentsData = mockStudents;
      const localStudents = StudentsManager.getAll();
      
      // Intentar cargar estudiantes de la base de datos también
      let dbStudents = [];
      try {
        dbStudents = await ApiService.getStudents();
        console.log('Estudiantes cargados desde BD:', dbStudents.length);
      } catch (error) {
        console.log('No se pudieron cargar estudiantes de BD, usando datos locales:', error.message);
      }
      
      // Combinar todas las fuentes, evitando duplicados por documento
      const allStudentsSources = [...mockStudentsData, ...localStudents, ...dbStudents];
      const uniqueStudents = allStudentsSources.reduce((acc, student) => {
        const exists = acc.find(s => s.document === student.document && student.document);
        if (!exists) {
          acc.push(student);
        }
        return acc;
      }, []);
      
      setStudents(uniqueStudents);
      setAllStudents(uniqueStudents);
      
      console.log('Total estudiantes cargados:', uniqueStudents.length);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
      // Fallback a datos locales
      const mockStudentsData = mockStudents;
      const localStudents = StudentsManager.getAll();
      const combinedStudents = [...mockStudentsData, ...localStudents];
      
      setStudents(combinedStudents);
      setAllStudents(combinedStudents);
    }
  };

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  // Obtener grados disponibles para el docente - Nueva lógica según especificaciones
  const getAvailableGrades = () => {
    // REGLA PRINCIPAL: En primaria (incluyendo transición), el docente SOLO ve su grado asignado
    if (user.teachingLevel === 'transicion') {
      // Grado 0° está incluido en primaria como mencionó el usuario
      return user.grades && user.grades.length > 0 ? user.grades : ['0°'];
    } else if (user.teachingLevel === 'primaria') {
      // En primaria, un docente por grado - SOLO su grado asignado
      return user.grades && user.grades.length > 0 ? user.grades : [];
    } else if (user.teachingLevel === 'bachillerato') {
      // En bachillerato, los docentes son rotativos en todos los grados asignados
      return user.grades && user.grades.length > 0 ? user.grades : ['6°', '7°', '8°', '9°', '10°', '11°'];
    }
    
    // Si no hay información específica de nivel, devolver los grados asignados o vacío
    return user.grades && user.grades.length > 0 ? user.grades : [];
  };

  const availableGrades = getAvailableGrades();

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  // Filter students by available grades
  const teacherStudents = allStudents.filter(student => 
    availableGrades.includes(student.grade)
  );

  // Get subjects for the teacher - Materias según el boletín del nivel
  const getTeacherSubjects = () => {
    if (user.teachingLevel === 'transicion') {
      // Grado 0° - Transición (incluido en primaria según usuario)
      return ['ESPAÑOL', 'INGLES', 'MATEMATICAS', 'SOCIALES-NATURALES', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
    } else if (user.teachingLevel === 'primaria') {
      // Grados 1° a 5° - Básica Primaria - Docente enseña todas las materias del boletín
      return ['ESPAÑOL', 'CALIGRAFIA', 'INGLES', 'MATEMATICAS', 'NATURALES', 'SOCIALES', 'CATEDRA DE PAZ', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
    } else if (user.teachingLevel === 'bachillerato') {
      // Grados 6° a 11° - Bachillerato - Materias específicas según asignación
      return user.subjects && user.subjects.length > 0 ? user.subjects : [];
    }
    
    // Fallback: usar materias asignadas al usuario o vacío
    return user.subjects && user.subjects.length > 0 ? user.subjects : [];
  };

  const teacherSubjects = getTeacherSubjects();

  // Group students by grade with filters applied
  const filteredStudents = filterStudents(teacherStudents);
  const studentsByGrade = availableGrades.reduce((acc, grade) => {
    acc[grade] = filteredStudents.filter(student => student.grade === grade);
    return acc;
  }, {});

  // Handle adding new student
  const handleAddStudent = (studentData) => {
    const newStudent = StudentsManager.add(studentData);
    const updatedStudents = StudentsManager.getAll();
    const combinedStudents = [...mockStudents, ...updatedStudents];
    setStudents(combinedStudents);
    setAllStudents(combinedStudents);
    setShowAddStudentModal(false);
  };

  // Add Student Modal Component
  const AddStudentModal = () => {
    const [newStudent, setNewStudent] = useState({
      name: '',
      document: '',
      birthDate: '',
      grade: (selectedGradeForStudents !== "all" ? selectedGradeForStudents : availableGrades[0]) || '',
      level: '',
      academicYear: 2025
    });

    const [errors, setErrors] = useState({});

    const validateStudent = () => {
      const newErrors = {};
      if (!newStudent.name.trim()) newErrors.name = 'El nombre es obligatorio';
      if (!newStudent.document.trim()) newErrors.document = 'El documento es obligatorio';
      if (!newStudent.birthDate) newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
      if (!newStudent.grade) newErrors.grade = 'El grado es obligatorio';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      if (!validateStudent()) return;

      // Determinar el nivel según el grado
      let level = '';
      if (newStudent.grade === '0°') level = 'Transición';
      else if (['1°', '2°', '3°', '4°', '5°'].includes(newStudent.grade)) level = 'Básica Primaria';
      else if (['6°', '7°', '8°', '9°'].includes(newStudent.grade)) level = 'Básica Secundaria';
      else if (['10°', '11°'].includes(newStudent.grade)) level = 'Media Vocacional';

      const studentToAdd = {
        ...newStudent,
        level
      };

      handleAddStudent(studentToAdd);
    };

    const handleInputChange = (field) => (e) => {
      setNewStudent(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const handleSelectChange = (field) => (value) => {
      setNewStudent(prev => ({
        ...prev,
        [field]: value
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <UserPlus className="mr-2 h-5 w-5" />
              Agregar Nuevo Estudiante
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowAddStudentModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={newStudent.name}
                  onChange={handleInputChange('name')}
                  placeholder="Nombres y apellidos del estudiante"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="document">Documento de Identidad *</Label>
                <Input
                  id="document"
                  value={newStudent.document}
                  onChange={handleInputChange('document')}
                  placeholder="Número de documento"
                  className={errors.document ? 'border-red-500' : ''}
                />
                {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
              </div>

              <div>
                <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={newStudent.birthDate}
                  onChange={handleInputChange('birthDate')}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
              </div>

              <div>
                <Label htmlFor="grade">Grado *</Label>
                <Select value={newStudent.grade} onValueChange={handleSelectChange('grade')}>
                  <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGrades.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddStudentModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Agregar Estudiante
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-institutional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Mejorado */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
                  Panel del Profesor
                </h1>
                <p className="text-gray-600 mt-2">Bienvenido, {user.name}</p>
                
                {/* Información del Docente */}
                <div className="mt-4 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                      🎓 Nivel: {user.teachingLevel === 'transicion' ? 'Transición (0°)' : 
                               user.teachingLevel === 'primaria' ? 'Primaria (1°-5°)' : 
                               user.teachingLevel === 'bachillerato' ? 'Bachillerato (6°-11°)' : 
                               'No especificado'}
                    </Badge>
                    
                    <Badge variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50">
                      📚 Grados: {availableGrades.length > 0 ? availableGrades.join(', ') : 'Ninguno asignado'}
                    </Badge>
                    
                    {(user.teachingLevel === 'transicion' || user.teachingLevel === 'primaria') && availableGrades.length === 1 && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        👨‍🏫 Tutor: {availableGrades[0]}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      📖 Materias: {teacherSubjects.length} 
                      {teacherSubjects.length <= 3 ? ` (${teacherSubjects.join(', ')})` : ' materias asignadas'}
                    </Badge>
                    
                    {(user.teachingLevel === 'transicion' || user.teachingLevel === 'primaria') && (
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        ℹ️ Todas las materias del nivel
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Acceso Rápido según el Nivel */}
              <div className="mt-4 lg:mt-0">
                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">🔑 Acceso Configurado:</p>
                  {user.teachingLevel === 'transicion' || user.teachingLevel === 'primaria' ? (
                    <div className="text-sm text-blue-600">
                      ✓ Solo grado asignado<br/>
                      ✓ Todas las materias del nivel<br/>
                      ✓ Tutoría automática
                    </div>
                  ) : user.teachingLevel === 'bachillerato' ? (
                    <div className="text-sm text-green-600">
                      ✓ Múltiples grados<br/>
                      ✓ Materias específicas<br/>
                      ✓ Sistema rotativo
                    </div>
                  ) : (
                    <div className="text-sm text-orange-600">
                      ⚠️ Configuración pendiente
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-900">{teacherStudents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 via-teal-100 to-teal-50 border-teal-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-700">Materias</p>
                  <p className="text-2xl font-bold text-teal-900">{teacherSubjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 border-slate-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-slate-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-700">Grados</p>
                  <p className="text-2xl font-bold text-slate-900">{availableGrades.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="grades" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
            <TabsTrigger value="students">Mis Estudiantes</TabsTrigger>
            <TabsTrigger value="convivencia">Observaciones Académicas</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="material">Material Estudiantes</TabsTrigger>
            <TabsTrigger value="preparadores">Preparadores</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6">
            {/* Controles de filtro para calificaciones */}
            <FilterControls
              selectedPeriod={selectedPeriod}
              setSelectedPeriod={setSelectedPeriod}
              selectedGrade={selectedGrade}
              setSelectedGrade={setSelectedGrade}
              availableGrades={availableGrades}
              availablePeriods={periods}
              showPeriodFilter={true}
              showGradeFilter={true}
              onReset={() => {
                setSelectedGrade('');
                setSelectedPeriod('1');
              }}
              className="mb-4"
            />

            <Card>
              <CardHeader>
                <CardTitle>Asignar Calificaciones</CardTitle>
                <p className="text-sm text-gray-600">
                  Use los filtros para seleccionar el período y grado. Las calificaciones se aplicarán según los filtros activos.
                </p>
                <div className="mt-2 p-3 bg-green-50 rounded-lg border-green-200 border">
                  <p className="text-sm text-green-800">
                    ✅ <strong>FILTROS DINÁMICOS ACTIVOS</strong> - Los filtros de período y grado se aplican automáticamente en todas las funcionalidades de calificaciones.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Botones para abrir planillas */}
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setShowPlanillaCompleta(true)}
                    className="bg-gradient-to-r from-red-600 to-blue-600 text-white hover:shadow-lg text-sm font-bold"
                    disabled={!selectedGrade || !selectedPeriod}
                  >
                    📋 PLANILLA COMPLETA PERÍODO
                  </Button>
                  <Button
                    onClick={() => setShowSelectorPlanillas(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg"
                    disabled={!selectedGrade || !selectedPeriod}
                  >
                    📋 Planillas por Asignatura
                  </Button>
                  <Button
                    onClick={() => setShowGradePlanilla(true)}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white hover:shadow-lg"
                    disabled={!selectedGrade}
                  >
                    📊 Planilla Anterior (Demo)
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="grade">Grado</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableGrades.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Materia</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherSubjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="period">Período</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Students Grade Table */}
                {selectedGrade && selectedSubject && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Estudiante</th>
                          <th className="text-left p-3 font-medium">Calificación</th>
                          <th className="text-left p-3 font-medium">Observaciones</th>
                          <th className="text-left p-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherStudents
                          .filter(student => student.grade === selectedGrade)
                          .map((student) => {
                            const existingGrade = mockGrades.find(
                              g => g.studentId === student.id && 
                                   g.subject === selectedSubject && 
                                   g.period === parseInt(selectedPeriod)
                            );
                            
                            return (
                              <tr key={student.id} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-medium">{student.name}</td>
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="10"
                                    defaultValue={existingGrade?.grade || ''}
                                    placeholder="0.0"
                                    className="w-20"
                                  />
                                </td>
                                <td className="p-3">
                                  <Input
                                    placeholder="Observaciones..."
                                    defaultValue={existingGrade?.description || ''}
                                    className="max-w-xs"
                                  />
                                </td>
                                <td className="p-3">
                                  <Button size="sm">
                                    <Save className="mr-2 h-3 w-3" />
                                    Guardar
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {(!selectedGrade || !selectedSubject) && (
                  <div className="text-center py-12 text-gray-500">
                    Seleccione un grado y materia para comenzar a asignar calificaciones
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            {/* Controles de filtro para estudiantes */}
            <FilterControls
              selectedGrade={selectedGradeForStudents}
              setSelectedGrade={setSelectedGradeForStudents}
              availableGrades={availableGrades}
              showPeriodFilter={false}
              showGradeFilter={true}
              onReset={() => setSelectedGradeForStudents('all')}
              filteredCount={filterStudents(allStudents).length}
              totalCount={allStudents.length}
              className="mb-4"
            />

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Mis Estudiantes</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Estudiantes asignados a sus grados. Incluye estudiantes registrados en el sistema.
                  </p>
                  <div className="mt-2 p-2 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-xs text-blue-800">
                      📋 <strong>Sistema Integrado:</strong> Se muestran estudiantes creados manualmente + usuarios registrados como estudiantes aprobados
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={() => setShowAddStudentModal(true)} className="bg-gradient-gada text-white hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Agregar Estudiante
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {selectedGradeForStudents && selectedGradeForStudents !== "all" ? (
                  // Mostrar estudiantes del grado seleccionado
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <GraduationCap className="mr-2 h-5 w-5" />
                      Grado {selectedGradeForStudents}
                      <Badge className="ml-2">{filteredStudents.filter(s => s.grade === selectedGradeForStudents).length} estudiantes</Badge>
                    </h3>
                    
                    {filteredStudents.filter(s => s.grade === selectedGradeForStudents).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-3">Nombre</th>
                              <th className="text-left p-3">Documento</th>
                              <th className="text-left p-3">Nivel</th>
                              <th className="text-left p-3">Promedio</th>
                              <th className="text-left p-3">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredStudents.filter(s => s.grade === selectedGradeForStudents).map((student) => {
                              const studentGrades = mockGrades.filter(g => g.studentId === student.id);
                              const average = studentGrades.length > 0 
                                ? (studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length).toFixed(1)
                                : 'N/A';

                              return (
                                <tr key={student.id} className="border-b hover:bg-gray-50">
                                  <td className="p-3 font-medium">{student.name}</td>
                                  <td className="p-3">{student.document}</td>
                                  <td className="p-3">{student.level}</td>
                                  <td className="p-3">
                                    <Badge variant={average !== 'N/A' && parseFloat(average) >= 8 ? 'default' : 'secondary'}>
                                      {average}
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    <Button size="sm" variant="outline">
                                      <Edit className="mr-2 h-3 w-3" />
                                      Ver Detalle
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No hay estudiantes en el grado {selectedGradeForStudents}</p>
                        <Button 
                          onClick={() => setShowAddStudentModal(true)}
                          className="mt-4"
                          variant="outline"
                        >
                          <UserPlus className="mr-2 h-4 w-4" />
                          Agregar Primer Estudiante
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Mostrar resumen por grados
                  <div className="space-y-6">
                    {availableGrades.map((grade) => (
                      <Card key={grade} className="border border-blue-200 hover-gradient card-institutional transition-all duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
                              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Grado {grade}</h3>
                              <Badge className="ml-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white">{studentsByGrade[grade]?.length || 0} estudiantes</Badge>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setSelectedGradeForStudents(grade)}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                Ver Todos
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => {
                                  setSelectedGradeForStudents(grade);
                                  setShowAddStudentModal(true);
                                }}
                                className="bg-gradient-to-r from-teal-500 to-blue-500 text-white hover:shadow-md transition-all"
                              >
                                <UserPlus className="mr-1 h-3 w-3" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {studentsByGrade[grade]?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                              {studentsByGrade[grade].slice(0, 6).map((student) => (
                                <div key={student.id} className="p-3 border rounded-lg bg-gray-50">
                                  <p className="font-medium text-sm">{student.name}</p>
                                  <p className="text-xs text-gray-600">Doc: {student.document}</p>
                                </div>
                              ))}
                              {studentsByGrade[grade].length > 6 && (
                                <div className="p-3 border rounded-lg bg-blue-50 flex items-center justify-center">
                                  <p className="text-sm text-blue-600">
                                    +{studentsByGrade[grade].length - 6} más
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-6 text-gray-500">
                              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                              <p className="text-sm">No hay estudiantes registrados</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Proyectos Institucionales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Gestiona proyectos institucionales, sube material educativo y colabora con otros docentes.
                </p>
                <Button 
                  onClick={() => setShowProjectsManager(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Abrir Gestión de Proyectos
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="material" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Material para Estudiantes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Crea y gestiona talleres, recuperaciones y actividades para tus estudiantes.
                </p>
                <Button 
                  onClick={() => setShowMaterialManager(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Abrir Gestión de Material
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preparadores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preparadores de Clase</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Crea y gestiona tus preparadores de clase siguiendo el formato institucional.
                </p>
                <Button 
                  onClick={() => setShowPreparadores(true)}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Abrir Gestión de Preparadores
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Sección de Acciones Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-blue-600" />
                  Acciones Rápidas de Reportes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    className="flex flex-col items-center p-4 h-auto bg-blue-50 text-blue-700 hover:bg-blue-100"
                    onClick={() => {
                      const reportContent = `REPORTE RÁPIDO - RESUMEN ACADÉMICO\nDocente: ${user.name}\nFecha: ${new Date().toLocaleDateString('es-CO')}\n\nEstudiantes por grado:\n${availableGrades.map(grade => `${grade}: ${allStudents.filter(s => s.grade === grade).length} estudiantes`).join('\n')}`;
                      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `Resumen_Academico_${user.name}_${new Date().toISOString().split('T')[0]}.txt`;
                      link.click();
                    }}
                  >
                    <Download className="h-6 w-6 mb-2" />
                    <span className="text-sm">Resumen Académico</span>
                  </Button>

                  <Button 
                    className="flex flex-col items-center p-4 h-auto bg-green-50 text-green-700 hover:bg-green-100"
                    onClick={() => {
                      const observaciones = JSON.parse(localStorage.getItem('gada_observaciones') || '[]').filter(obs => obs.teacherId === user.id);
                      const reportContent = `REPORTE OBSERVACIONES\nDocente: ${user.name}\nTotal: ${observaciones.length}\n\n${observaciones.map((obs, i) => `${i+1}. ${obs.estudianteNombre} (${obs.grado})\n   ${obs.tipo}: ${obs.descripcion}\n   Fecha: ${new Date(obs.fecha).toLocaleDateString('es-CO')}\n`).join('\n')}`;
                      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `Reporte_Observaciones_${user.name}_${new Date().toISOString().split('T')[0]}.txt`;
                      link.click();
                    }}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    <span className="text-sm">Reporte Observaciones</span>
                  </Button>

                  <Button 
                    className="flex flex-col items-center p-4 h-auto bg-purple-50 text-purple-700 hover:bg-purple-100"
                    onClick={() => {
                      const preparadores = JSON.parse(localStorage.getItem(`gada_preparadores_${user.id}`) || '[]');
                      const reportContent = `REPORTE PREPARADORES DE CLASE\nDocente: ${user.name}\nTotal: ${preparadores.length}\n\n${preparadores.map((prep, i) => `${i+1}. ${prep.asignatura} - ${prep.grado}\n   Unidad: ${prep.tituloUnidad}\n   Semana: ${prep.semana}\n   Creado: ${new Date(prep.fechaCreacion).toLocaleDateString('es-CO')}\n`).join('\n')}`;
                      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `Reporte_Preparadores_${user.name}_${new Date().toISOString().split('T')[0]}.txt`;
                      link.click();
                    }}
                  >
                    <BookOpen className="h-6 w-6 mb-2" />
                    <span className="text-sm">Reporte Preparadores</span>
                  </Button>

                  <Button 
                    className="flex flex-col items-center p-4 h-auto bg-orange-50 text-orange-700 hover:bg-orange-100"
                    onClick={() => {
                      const talleres = JSON.parse(localStorage.getItem('gada_talleres') || '[]').filter(t => t.profesorId === user.id);
                      const reportContent = `REPORTE MATERIAL ESTUDIANTES\nDocente: ${user.name}\nTotal Talleres: ${talleres.length}\n\n${talleres.map((taller, i) => `${i+1}. ${taller.titulo}\n   Materia: ${taller.materia} - Grado: ${taller.grado}\n   Tipo: ${taller.tipo}\n   Fecha límite: ${new Date(taller.fechaLimite).toLocaleDateString('es-CO')}\n`).join('\n')}`;
                      const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = `Reporte_Material_${user.name}_${new Date().toISOString().split('T')[0]}.txt`;
                      link.click();
                    }}
                  >
                    <Users className="h-6 w-6 mb-2" />
                    <span className="text-sm">Material Estudiantes</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Sección de Estadísticas del Período */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                  Estadísticas del Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Panel de control de estadísticas */}
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Período 1</SelectItem>
                          <SelectItem value="2">Período 2</SelectItem>
                          <SelectItem value="3">Período 3</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          const estadisticas = {
                            periodo: selectedPeriod,
                            totalEstudiantes: allStudents.filter(s => availableGrades.includes(s.grade)).length,
                            gradosAtendidos: availableGrades.length,
                            observacionesRegistradas: JSON.parse(localStorage.getItem('gada_observaciones') || '[]').filter(obs => obs.teacherId === user.id).length,
                            preparadoresCreados: JSON.parse(localStorage.getItem(`gada_preparadores_${user.id}`) || '[]').length,
                            talleresAsignados: JSON.parse(localStorage.getItem('gada_talleres') || '[]').filter(t => t.profesorId === user.id).length
                          };
                          
                          alert(`ESTADÍSTICAS PERÍODO ${selectedPeriod}:\n\n` +
                                `👥 Estudiantes atendidos: ${estadisticas.totalEstudiantes}\n` +
                                `📚 Grados asignados: ${estadisticas.gradosAtendidos}\n` +
                                `📝 Observaciones registradas: ${estadisticas.observacionesRegistradas}\n` +
                                `📋 Preparadores creados: ${estadisticas.preparadoresCreados}\n` +
                                `🎯 Talleres asignados: ${estadisticas.talleresAsignados}`);
                        }}
                      >
                        Ver Detallado
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {allStudents.filter(s => availableGrades.includes(s.grade)).length}
                        </div>
                        <p className="text-sm text-blue-700">Estudiantes</p>
                      </div>
                      
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {availableGrades.length}
                        </div>
                        <p className="text-sm text-green-700">Grados</p>
                      </div>
                      
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {JSON.parse(localStorage.getItem('gada_observaciones') || '[]').filter(obs => obs.teacherId === user.id).length}
                        </div>
                        <p className="text-sm text-purple-700">Observaciones</p>
                      </div>
                      
                      <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {JSON.parse(localStorage.getItem(`gada_preparadores_${user.id}`) || '[]').length}
                        </div>
                        <p className="text-sm text-orange-700">Preparadores</p>
                      </div>
                    </div>
                  </div>

                  {/* Gráfico simulado de rendimiento */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Rendimiento por Grado</h4>
                    <div className="space-y-2">
                      {availableGrades.map(grade => {
                        const estudiantesGrado = allStudents.filter(s => s.grade === grade).length;
                        const porcentaje = availableGrades.length > 0 ? (estudiantesGrado / allStudents.filter(s => availableGrades.includes(s.grade)).length * 100).toFixed(1) : 0;
                        return (
                          <div key={grade} className="flex items-center space-x-3">
                            <span className="w-8 text-sm font-medium">{grade}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                              <div 
                                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                                style={{ width: `${porcentaje}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-600">{estudiantesGrado}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección adicional de estadísticas y acciones rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Estudiantes evaluados:</span>
                      <Badge>{teacherStudents.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Promedio general:</span>
                      <Badge variant="secondary">8.2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Estudiantes destacados:</span>
                      <Badge variant="default">3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Requieren apoyo:</span>
                      <Badge variant="destructive">1</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Evaluación
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Enviar Comunicado
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="convivencia" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registro de Observaciones */}
              <Card className="shadow-lg border-0 card-institutional">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-purple-600" />
                    Registro de Observaciones Académicas
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Registre observaciones académicas y de comportamiento en aula de sus estudiantes.
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Estudiante</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estudiante" />
                        </SelectTrigger>
                        <SelectContent>
                          {allStudents.filter(s => availableGrades.includes(s.grade)).map(student => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              {student.name} - {student.grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Tipo de Observación</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="positiva">😊 Observación Positiva</SelectItem>
                          <SelectItem value="proceso">📋 En Proceso</SelectItem>
                          <SelectItem value="llamado">⚠️ Llamado de Atención</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Observación</Label>
                      <Textarea 
                        placeholder="Describe el comportamiento observado..."
                        className="min-h-[80px]"
                      />
                    </div>
                    
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => {
                        // Funcionalidad completa para registrar observación
                        const studentSelect = document.querySelector('select[value]');
                        const tipoSelect = document.querySelectorAll('select')[1];
                        const observacionTextarea = document.querySelector('textarea');
                        
                        if (!studentSelect?.value || !tipoSelect?.value || !observacionTextarea?.value) {
                          alert('Complete todos los campos para registrar la observación');
                          return;
                        }
                        
                        const nuevaObservacion = {
                          id: Date.now(),
                          estudianteId: studentSelect.value,
                          estudianteNombre: studentSelect.options[studentSelect.selectedIndex].text.split(' - ')[0],
                          grado: studentSelect.options[studentSelect.selectedIndex].text.split(' - ')[1],
                          tipo: tipoSelect.value,
                          descripcion: observacionTextarea.value,
                          teacherId: user.id,
                          teacherName: user.name,
                          fecha: new Date().toISOString()
                        };
                        
                        const observaciones = JSON.parse(localStorage.getItem('gada_observaciones') || '[]');
                        observaciones.push(nuevaObservacion);
                        localStorage.setItem('gada_observaciones', JSON.stringify(observaciones));
                        
                        alert('Observación registrada exitosamente');
                        
                        // Limpiar formulario
                        studentSelect.value = '';
                        tipoSelect.value = '';
                        observacionTextarea.value = '';
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Registrar Observación
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Historial de Convivencia */}
              <Card className="shadow-lg border-0 card-institutional">
                <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-green-600" />
                    Historial de Observaciones
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-2">
                    Consulte el historial completo de observaciones académicas y comportamentales.
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Filtros */}
                    <div className="grid grid-cols-2 gap-3">
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Filtrar por grado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos los grados</SelectItem>
                          {availableGrades.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Período 1</SelectItem>
                          <SelectItem value="2">Período 2</SelectItem>
                          <SelectItem value="3">Período 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Lista de observaciones recientes */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto">
                      {/* Simulación de historial */}
                      <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-green-800">María Isabel Salas Pérez</p>
                            <p className="text-sm text-green-600">3° - Observación Positiva</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Hoy
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">Excelente participación en clase de matemáticas. Ayudó a sus compañeros con las actividades.</p>
                      </div>

                      <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-400">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-yellow-800">Ashley Muñoz Rada</p>
                            <p className="text-sm text-yellow-600">2° - En Proceso</p>
                          </div>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                            Ayer
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">Necesita mejorar la atención durante las explicaciones. Se distrae fácilmente.</p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-blue-800">Gabriel Antón Rosanía</p>
                            <p className="text-sm text-blue-600">7° - Observación Positiva</p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800 text-xs">
                            2 días
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">Liderazgo positivo en trabajo en equipo. Fomenta la colaboración.</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          // Exportar historial completo
                          const allObservations = JSON.parse(localStorage.getItem('gada_observaciones') || '[]');
                          const teacherObservations = allObservations.filter(obs => obs.teacherId === user.id);
                          
                          let exportContent = `HISTORIAL COMPLETO DE OBSERVACIONES ACADÉMICAS\n`;
                          exportContent += `DOCENTE: ${user.name}\n`;
                          exportContent += `FECHA: ${new Date().toLocaleDateString('es-CO')}\n\n`;
                          
                          teacherObservations.forEach((obs, index) => {
                            exportContent += `${index + 1}. ${obs.estudianteNombre} - ${obs.grado}\n`;
                            exportContent += `   Tipo: ${obs.tipo}\n`;
                            exportContent += `   Fecha: ${new Date(obs.fecha).toLocaleDateString('es-CO')}\n`;
                            exportContent += `   Observación: ${obs.descripcion}\n\n`;
                          });
                          
                          const blob = new Blob([exportContent], { type: 'text/plain;charset=utf-8;' });
                          const link = document.createElement('a');
                          link.href = URL.createObjectURL(blob);
                          link.download = `Historial_Observaciones_${user.name}_${new Date().toISOString().split('T')[0]}.txt`;
                          link.click();
                        }}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Historial
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          // Mostrar historial completo en modal
                          const allObservations = JSON.parse(localStorage.getItem('gada_observaciones') || '[]');
                          const teacherObservations = allObservations.filter(obs => obs.teacherId === user.id);
                          
                          if (teacherObservations.length === 0) {
                            alert('No hay observaciones registradas aún');
                            return;
                          }
                          
                          let displayContent = `HISTORIAL COMPLETO - ${teacherObservations.length} OBSERVACIONES:\n\n`;
                          teacherObservations.forEach((obs, index) => {
                            displayContent += `${index + 1}. ${obs.estudianteNombre} (${obs.grado})\n`;
                            displayContent += `   ${obs.tipo} - ${new Date(obs.fecha).toLocaleDateString('es-CO')}\n`;
                            displayContent += `   ${obs.descripcion}\n\n`;
                          });
                          
                          alert(displayContent);
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver Completo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Estadísticas de Convivencia */}
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-teal-600" />
                  Estadísticas de Convivencia - Mis Estudiantes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <p className="text-sm text-green-700">Observaciones Positivas</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">12%</div>
                    <p className="text-sm text-yellow-700">En Proceso</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">3%</div>
                    <p className="text-sm text-red-700">Llamados Atención</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{allStudents.filter(s => availableGrades.includes(s.grade)).length}</div>
                    <p className="text-sm text-blue-700">Total Estudiantes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal para agregar estudiante */}
        {showAddStudentModal && <AddStudentModal />}

        {/* Modal de Proyectos Institucionales */}
        {showProjectsManager && (
          <ProjectsManager 
            onClose={() => setShowProjectsManager(false)}
          />
        )}

        {/* Modal de Planilla de Notas Mejorada */}
        {showGradePlanilla && selectedGrade && (
          <EnhancedGradePlanilla
            teacher={user}
            selectedGrade={selectedGrade}
            selectedPeriod={selectedPeriod}
            onClose={() => setShowGradePlanilla(false)}
          />
        )}

        {/* Modal de Material para Estudiantes */}
        {showMaterialManager && (
          <MaterialEstudiantesManager
            teacher={user}
            onClose={() => setShowMaterialManager(false)}
          />
        )}

        {/* Selector de Planillas por Asignatura */}
        {showSelectorPlanillas && selectedGrade && selectedPeriod && (
          <SelectorPlanillas
            teacher={user}
            selectedGrade={selectedGrade}
            selectedPeriod={selectedPeriod}
            onClose={() => setShowSelectorPlanillas(false)}
          />
        )}

        {/* Planilla Completa por Período */}
        {showPlanillaCompleta && selectedGrade && selectedPeriod && (
          <PlanillaCompletaPorPeriodo
            teacher={user}
            selectedGrade={selectedGrade}
            selectedPeriod={selectedPeriod}
            onClose={() => setShowPlanillaCompleta(false)}
          />
        )}

        {/* Modal de Preparadores de Clase */}
        {showPreparadores && (
          <PreparadoresClase
            teacher={user}
            onClose={() => setShowPreparadores(false)}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;