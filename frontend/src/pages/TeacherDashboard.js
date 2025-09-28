import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
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
  UserCheck
} from 'lucide-react';
import { mockStudents, mockGrades, mockSubjects } from '../mock/mockData';
import { StudentsManager, PeriodsManager } from '../utils/dataManager';
import ProjectsManager from '../components/ProjectsManager';
import GradePlanilla from '../components/GradePlanilla';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedGradeForStudents, setSelectedGradeForStudents] = useState('all');
  const [periods, setPeriods] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [showProjectsManager, setShowProjectsManager] = useState(false);

  useEffect(() => {
    // Cargar períodos dinámicamente
    const loadedPeriods = PeriodsManager.getAll();
    setPeriods(loadedPeriods);
    if (loadedPeriods.length > 0) {
      setSelectedPeriod(loadedPeriods[0].id.toString());
    }
    
    // Cargar todos los estudiantes (mock + registrados + creados por docentes)
    const mockStudentsData = mockStudents;
    const registeredStudents = StudentsManager.getAll();
    const combinedStudents = [...mockStudentsData, ...registeredStudents];
    
    setStudents(combinedStudents);
    setAllStudents(combinedStudents);
  }, []);

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  // Obtener grados disponibles para el docente
  const getAvailableGrades = () => {
    // Si el profesor tiene grados específicamente asignados
    if (user.grades && user.grades.length > 0) {
      return user.grades;
    }
    
    // Para tutores de primaria, si no tienen grado específico, mostrar todos los de primaria
    if (user.teachingLevel === 'primaria') {
      return ['1°', '2°', '3°', '4°', '5°'];
    } else if (user.teachingLevel === 'transicion') {
      return ['0°'];
    } else if (user.teachingLevel === 'bachillerato') {
      return ['6°', '7°', '8°', '9°', '10°', '11°'];
    }
    
    // Si no hay información específica, devolver todos los grados como fallback
    return ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  };

  const availableGrades = getAvailableGrades();

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  // Filter students by available grades
  const teacherStudents = allStudents.filter(student => 
    availableGrades.includes(student.grade)
  );

  // Get subjects for the teacher - Lógica especial para primaria
  const getTeacherSubjects = () => {
    if (user.teachingLevel === 'primaria') {
      // En primaria, el docente enseña todas las materias de su(s) grado(s)
      return ['ESPAÑOL', 'CALIGRAFIA', 'INGLES', 'MATEMATICAS', 'NATURALES', 'SOCIALES', 'CATEDRA DE PAZ', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
    } else if (user.teachingLevel === 'transicion') {
      return ['ESPAÑOL', 'INGLES', 'MATEMATICAS', 'SOCIALES-NATURALES', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
    } else {
      // Para bachillerato, usar las materias específicas asignadas
      return user.subjects && user.subjects.length > 0 ? user.subjects : ['Todas las materias'];
    }
  };

  const teacherSubjects = getTeacherSubjects();

  // Group students by grade
  const studentsByGrade = availableGrades.reduce((acc, grade) => {
    acc[grade] = teacherStudents.filter(student => student.grade === grade);
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
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">Panel del Profesor</h1>
            <p className="text-gray-600 mt-2">Bienvenido, {user.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                Materias: {teacherSubjects.join(', ')}
              </Badge>
              <Badge variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors">
                Grados: {availableGrades.join(', ')}
              </Badge>
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
            <TabsTrigger value="convivencia">Convivencia</TabsTrigger>
            <TabsTrigger value="projects">Proyectos</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asignar Calificaciones</CardTitle>
                <p className="text-sm text-gray-600">
                  Seleccione el grado, materia y período para asignar calificaciones
                </p>
                <div className="mt-2 p-3 bg-green-50 rounded-lg border-green-200 border">
                  <p className="text-sm text-green-800">
                    ✅ <strong>ACCESO TOTAL HABILITADO</strong> - Todos los períodos, grados y funcionalidades están completamente disponibles para gestión de calificaciones, estudiantes y reportes.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  <Select value={selectedGradeForStudents} onValueChange={setSelectedGradeForStudents}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Todos los grados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {availableGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <Badge className="ml-2">{studentsByGrade[selectedGradeForStudents]?.length || 0} estudiantes</Badge>
                    </h3>
                    
                    {studentsByGrade[selectedGradeForStudents]?.length > 0 ? (
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
                            {studentsByGrade[selectedGradeForStudents].map((student) => {
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

          <TabsContent value="reports" className="space-y-6">
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
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-purple-600" />
                  Gestión de Convivencia - Docente
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Como docente, puede registrar observaciones de convivencia y comportamiento para sus estudiantes.
                  <span className="text-green-600 font-medium"> Acceso completo habilitado.</span>
                </p>
                <div className="mt-2 p-3 bg-green-50 rounded-lg border-green-200 border">
                  <p className="text-sm text-green-800">
                    ✅ <strong>FUNCIONALIDAD DOCENTE COMPLETA</strong> - Puede registrar notas de convivencia, observaciones comportamentales y recomendaciones para todos sus estudiantes en cualquier período académico.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gradeSelect">Grado</Label>
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
                      <Label htmlFor="periodSelect">Período</Label>
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

                  {selectedGrade && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="mr-2 h-5 w-5" />
                        Estudiantes de {selectedGrade} - Período {selectedPeriod}
                      </h3>
                      
                      <div className="grid gap-4">
                        {teacherStudents
                          .filter(student => student.grade === selectedGrade)
                          .map((student) => (
                            <Card key={student.id} className="border border-purple-200 hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-full">
                                      <UserCheck className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-gray-900">{student.name}</h4>
                                      <p className="text-sm text-gray-600">
                                        Documento: {student.document}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button size="sm" variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                                      <Eye className="mr-1 h-3 w-3" />
                                      Ver Historial
                                    </Button>
                                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-md transition-all">
                                      <Plus className="mr-1 h-3 w-3" />
                                      Agregar Nota
                                    </Button>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-3">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Observación Rápida</Label>
                                    <div className="flex gap-2 mt-1">
                                      <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                                        Excelente
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                                        Bueno
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50">
                                        Mejorar
                                      </Button>
                                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                                        Refuerzo
                                      </Button>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                      <Label className="text-xs font-medium text-gray-600">Comportamiento</Label>
                                      <div className="flex items-center space-x-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button key={star} className="text-gray-300 hover:text-yellow-400 transition-colors">
                                            ⭐
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-xs font-medium text-gray-600">Participación</Label>
                                      <div className="flex items-center space-x-1 mt-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button key={star} className="text-gray-300 hover:text-blue-400 transition-colors">
                                            ⭐
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  )}

                  {!selectedGrade && (
                    <div className="text-center py-12 text-gray-500">
                      <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Seleccione un grado para gestionar las notas de convivencia</p>
                      <p className="text-sm">Podrá registrar observaciones y notas comportamentales para sus estudiantes</p>
                    </div>
                  )}
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
      </div>
    </div>
  );
};

export default TeacherDashboard;