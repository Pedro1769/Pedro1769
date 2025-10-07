import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  FileText, 
  GraduationCap,
  Plus,
  Edit,
  School,
  Download,
  FolderOpen,
  Trophy
} from 'lucide-react';
import { MOCK_STUDENTS, SUBJECTS, PERIODS, getPerformanceLevel } from '../../../mockData';
import { studentService, gradeService } from '../../../services/api';
import BancoLogros from '../sections/BancoLogros';
import Boletines from '../sections/Boletines';
import Proyectos from '../sections/Proyectos';

const DocenteBachilleratoDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedGrade, setSelectedGrade] = useState('6°');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects?.[0] || 'MATEMÁTICA');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    document_number: '',
    grade: selectedGrade,
    level: 'BÁSICA SECUNDARIA'
  });
  const [savedGrades, setSavedGrades] = useState({}); // Para almacenar las notas guardadas
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [tempGrades, setTempGrades] = useState({}); // Para manejar valores temporales
  const [activeSection, setActiveSection] = useState('dashboard'); // Para navegación
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, [user.grades, selectedGrade]);

  // Cargar notas cuando cambian los estudiantes, período o asignatura
  useEffect(() => {
    if (students && students.length > 0) {
      console.log('Cargando notas para', students.length, 'estudiantes');
      loadAllStudentGrades();
    }
  }, [students, selectedPeriod, selectedSubject]);

  // Cargar notas iniciales cuando se cargan estudiantes por primera vez
  useEffect(() => {
    if (students && students.length > 0 && Object.keys(savedGrades).length === 0) {
      console.log('Carga inicial de notas');
      loadAllStudentGrades();
    }
  }, [students]);

  useEffect(() => {
    // Escuchar cambios de navegación desde el sidebar
    window.setActiveSection = setActiveSection;
    
    return () => {
      delete window.setActiveSection;
    };
  }, []);

  useEffect(() => {
    setNewStudent(prev => ({
      ...prev,
      grade: selectedGrade
    }));
  }, [selectedGrade]);

  // Filtrar estudiantes por grado seleccionado
  const gradeStudents = (students || []).filter(student => student.grade === selectedGrade);
  
  // Función para obtener nota desde el estado guardado o datos del estudiante
  const getStudentGrade = (student, period, subject) => {
    const studentId = student._id || student.id;
    const gradeKey = `${studentId}-${period}-${subject}`;
    
    // Log de debug detallado
    console.log(`🔍 Buscando nota: Estudiante=${student.name}, ID=${studentId}, Período=${period}, Materia=${subject}`);
    console.log(`🔍 GradeKey generado: ${gradeKey}`);
    console.log(`🔍 SavedGrades disponibles:`, Object.keys(savedGrades));
    console.log(`🔍 Valor en savedGrades[${gradeKey}]:`, savedGrades[gradeKey]);
    
    // Primero verificar en las notas guardadas en el estado (base de datos)
    if (savedGrades[gradeKey] && savedGrades[gradeKey].grade !== undefined) {
      const grade = savedGrades[gradeKey].grade;
      console.log(`✅ NOTA ENCONTRADA EN BD para ${student.name} - ${subject}: ${grade}`);
      return grade;
    }
    
    // Luego verificar en los datos del estudiante (mock data - fallback)
    if (student.grades && student.grades[period] && student.grades[period][subject]) {
      const grade = student.grades[period][subject];
      console.log(`✅ NOTA ENCONTRADA EN MOCK para ${student.name} - ${subject}: ${grade}`);
      return grade;
    }
    
    console.log(`❌ SIN NOTA para ${student.name} - ${subject} - ${period}`);
    return '';
  };

  // Función para cargar notas reales desde la base de datos
  const loadStudentGrades = async (studentId) => {
    try {
      const grades = await gradeService.getStudentGrades(studentId);
      const gradeMap = {};
      
      grades.forEach(grade => {
        const gradeKey = `${studentId}-${grade.period}-${grade.subject}`;
        gradeMap[gradeKey] = grade;
      });
      
      setSavedGrades(prev => ({ ...prev, ...gradeMap }));
    } catch (error) {
      console.error('Error loading grades for student:', studentId, error);
    }
  };

  // Función para cargar todas las notas de todos los estudiantes
  const loadAllStudentGrades = async () => {
    if (!students || students.length === 0) return;
    
    try {
      const gradeMap = {};
      
      for (const student of students) {
        const studentId = student._id || student.id;
        const grades = await gradeService.getStudentGrades(studentId);
        
        grades.forEach(grade => {
          const gradeKey = `${studentId}-${grade.period}-${grade.subject}`;
          gradeMap[gradeKey] = grade;
        });
      }
      
      setSavedGrades(gradeMap);
      console.log(`Notas cargadas para ${students.length} estudiantes:`, gradeMap);
    } catch (error) {
      console.error('Error loading all student grades:', error);
    }
  };

  // Función sincronizada para cargar notas (llamada desde loadStudents)
  const loadAllStudentGradesSync = async (studentsList) => {
    try {
      const gradeMap = {};
      
      console.log(`Iniciando carga de notas para ${studentsList.length} estudiantes...`);
      
      for (const student of studentsList) {
        const studentId = student._id || student.id;
        console.log(`Cargando notas para ${student.name} (${studentId})`);
        
        try {
          const grades = await gradeService.getStudentGrades(studentId);
          console.log(`${student.name} tiene ${grades.length} notas:`, grades);
          
          grades.forEach(grade => {
            const gradeKey = `${studentId}-${grade.period}-${grade.subject}`;
            gradeMap[gradeKey] = grade;
          });
        } catch (error) {
          console.error(`Error loading grades for student ${student.name}:`, error);
        }
      }
      
      setSavedGrades(gradeMap);
      console.log(`✅ TODAS LAS NOTAS CARGADAS (${Object.keys(gradeMap).length} notas):`, gradeMap);
      
      // Log detallado de cada nota cargada
      Object.keys(gradeMap).forEach(key => {
        const grade = gradeMap[key];
        console.log(`   📝 ${key}: ${grade.grade} en ${grade.subject} (${grade.period})`);
      });
      
      return gradeMap;
    } catch (error) {
      console.error('Error loading student grades sync:', error);
    }
  };

  // Función para guardar nota
  const handleGradeChange = async (studentId, period, subject, gradeValue) => {
    if (!gradeValue || gradeValue === '') return;
    
    const grade = parseFloat(gradeValue);
    if (isNaN(grade) || grade < 1 || grade > 5) {
      toast({
        title: "Nota inválida",
        description: "La nota debe estar entre 1.0 y 5.0",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoadingGrades(true);
      
      const gradeData = {
        student_id: studentId,
        subject: subject,
        period: period,
        grade: grade,
        teacher_notes: ''
      };

      const savedGrade = await gradeService.assignGrade(gradeData);
      
      // Actualizar el estado local
      const gradeKey = `${studentId}-${period}-${subject}`;
      setSavedGrades(prev => ({
        ...prev,
        [gradeKey]: savedGrade
      }));

      toast({
        title: "Nota guardada",
        description: `Nota ${grade} asignada exitosamente en ${subject}`,
      });

      // Recargar las notas para asegurar persistencia
      await loadStudentGrades(studentId);

    } catch (error) {
      toast({
        title: "Error al guardar nota",
        description: "No se pudo guardar la nota. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error('Error saving grade:', error);
    } finally {
      setLoadingGrades(false);
    }
  };

  const downloadMyGradeStudents = () => {
    if (!gradeStudents || gradeStudents.length === 0) {
      toast({
        title: "Sin datos para descargar",
        description: "No hay estudiantes para exportar",
        variant: "destructive",
      });
      return;
    }

    const studentsData = gradeStudents.map(student => ({
      'Nombre Completo': student.name,
      'Grado': student.grade,
      'Documento': student.document_number || 'No registrado',
      'Estado': student.is_active ? 'Activo' : 'Inactivo',
    }));

    const headers = Object.keys(studentsData[0]);
    const csvContent = [
      headers.join(','),
      ...studentsData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `estudiantes_${selectedGrade}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddStudent = async () => {
    try {
      if (!newStudent.name.trim()) {
        toast({
          title: "Error",
          description: "El nombre del estudiante es obligatorio",
          variant: "destructive",
        });
        return;
      }

      const studentData = {
        ...newStudent,
        name: newStudent.name.toUpperCase(),
        is_active: true,
        created_at: new Date().toISOString(),
        level: ['6°', '7°', '8°', '9°', '10°', '11°'].includes(newStudent.grade) ? 'BÁSICA SECUNDARIA' : 'MEDIA'
      };

      await studentService.createStudent(studentData);
      
      // Recargar lista de estudiantes
      loadStudents();
      
      // Limpiar formulario y cerrar modal
      setNewStudent({
        name: '',
        document_number: '',
        grade: selectedGrade,
        level: 'BÁSICA SECUNDARIA'
      });
      setShowAddStudent(false);

      toast({
        title: "Estudiante agregado",
        description: `${studentData.name} ha sido agregado exitosamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el estudiante. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      let gradeStudents = [];
      
      if (user.grades && user.grades.length > 0) {
        // Filtrar estudiantes por los grados asignados al docente
        const allStudents = await studentService.getAll();
        gradeStudents = allStudents.filter(student => 
          user.grades.includes(student.grade)
        );
      } else {
        // Fallback: mostrar todos los estudiantes de bachillerato
        const allStudents = await studentService.getAll();
        gradeStudents = allStudents.filter(student => 
          ['6°', '7°', '8°', '9°', '10°', '11°'].includes(student.grade)
        );
      }
      
      setStudents(gradeStudents);
      
      // Cargar todas las notas de una vez
      if (gradeStudents.length > 0) {
        await loadAllStudentGradesSync(gradeStudents);
      }
      
      toast({
        title: "Estudiantes y notas cargados",
        description: `Se cargaron ${gradeStudents.length} estudiantes con sus notas`,
      });
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error al cargar estudiantes",
        description: "No se pudieron cargar los estudiantes reales. Usando datos de prueba.",
        variant: "destructive",
      });
      // Fallback a datos mock
      const myStudents = MOCK_STUDENTS.filter(student => 
        user.grades ? user.grades.includes(student.grade) : ['6°', '7°', '8°', '9°', '10°', '11°'].includes(student.grade)
      );
      setStudents(myStudents);
    } finally {
      setLoading(false);
    }
  };

  // Renderizar sección según navegación
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'banco-logros':
        return <BancoLogros />;
      case 'boletines':
        return <Boletines />;
      case 'proyectos':
        return <Proyectos />;
      default:
        return renderDashboardContent();
    }
  };

  // Contenido principal del dashboard
  const renderDashboardContent = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grados a Cargo</CardTitle>
            <School className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.grades.length}</div>
            <p className="text-xs text-blue-100">{user.grades.join(', ')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.subjects.length}</div>
            <p className="text-xs text-green-100">Materias especializadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Actual</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeStudents.length}</div>
            <p className="text-xs text-purple-100">Grado {selectedGrade}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Períodos</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PERIODS.length}</div>
            <p className="text-xs text-orange-100">Período: {selectedPeriod}</p>
          </CardContent>
        </Card>
      </div>

      {/* Selector de Grado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Seleccionar Grado</span>
          </CardTitle>
          <CardDescription>
            Elige el grado para gestionar estudiantes y calificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.grades.map(grade => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? "default" : "outline"}
                onClick={() => setSelectedGrade(grade)}
                className="min-w-[60px]"
              >
                {grade}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Estudiantes del Grado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Estudiantes - Grado {selectedGrade} ({gradeStudents.length})</span>
            </div>
            <div className="flex space-x-2">
              <Button onClick={downloadMyGradeStudents} size="sm" className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar Lista
              </Button>
              <Button onClick={() => setShowAddStudent(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Gestiona estudiantes del grado seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando estudiantes...</p>
            </div>
          ) : !gradeStudents || gradeStudents.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 mb-2">No se encontraron estudiantes en grado {selectedGrade}</p>
              <p className="text-sm text-gray-400">Total de estudiantes cargados: {students?.length || 0}</p>
              <Button 
                onClick={loadStudents} 
                size="sm" 
                className="mt-3 bg-purple-600 hover:bg-purple-700"
              >
                Recargar Estudiantes
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-800 font-bold text-lg">
                      ✅ {gradeStudents.length} ESTUDIANTES REALES
                    </p>
                    <p className="text-purple-600 text-sm">
                      Grado {selectedGrade} - Datos cargados desde la base de datos
                    </p>
                  </div>
                  <div className="px-4 py-2 bg-purple-600 text-white rounded-full font-bold text-xl">
                    {gradeStudents.length}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {(gradeStudents || []).map((student, index) => (
                  <div key={student._id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">Grado {student.grade} - {student.level}</p>
                      <p className="text-xs text-gray-400">Doc: {student.document_number || 'No registrado'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={student.is_active ? "default" : "secondary"}>
                        {student.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Asignación de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Asignación de Notas - Grado {selectedGrade}</span>
          </CardTitle>
          <CardDescription>
            Registra calificaciones para tus asignaturas
          </CardDescription>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mt-4">
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
          </div>
          
          <div className="mt-2">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {user.subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {gradeStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Estudiante</th>
                    <th className="text-center p-2">Nota Actual</th>
                    <th className="text-center p-2">Nueva Nota</th>
                    <th className="text-center p-2">Desempeño</th>
                    <th className="text-center p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {(gradeStudents || []).map((student, index) => {
                    const currentGrade = getStudentGrade(student, selectedPeriod, selectedSubject);
                    const performance = currentGrade ? getPerformanceLevel(currentGrade) : null;
                    
                    // Debugging para verificar notas
                    
                    return (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{student.name}</td>
                        <td className="text-center p-2">
                          {currentGrade ? (
                            <Badge variant={currentGrade >= 3.0 ? "default" : "destructive"}>
                              {currentGrade}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">Sin nota</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          <Input
                            key={`${student._id || index}-${selectedSubject}-${selectedPeriod}`}
                            type="number"
                            min="1"
                            max="5"
                            step="0.1"
                            placeholder="1.0 - 5.0"
                            className="w-20 text-center"
                            value={tempGrades[`${student._id || student.id}-${selectedPeriod}-${selectedSubject}`] || currentGrade || ''}
                            onChange={(e) => {
                              const gradeKey = `${student._id || student.id}-${selectedPeriod}-${selectedSubject}`;
                              setTempGrades(prev => ({
                                ...prev,
                                [gradeKey]: e.target.value
                              }));
                            }}
                          />
                        </td>
                        <td className="text-center p-2">
                          {performance && (
                            <Badge 
                              variant={
                                performance.label.includes('SUPERIOR') ? 'default' :
                                performance.label.includes('ALTO') ? 'secondary' :
                                performance.label.includes('BÁSICO') ? 'outline' :
                                'destructive'
                              }
                            >
                              {performance.label.split(' ')[1]}
                            </Badge>
                          )}
                        </td>
                        <td className="text-center p-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const gradeKey = `${student._id || student.id}-${selectedPeriod}-${selectedSubject}`;
                              const gradeValue = tempGrades[gradeKey] || currentGrade;
                              if (gradeValue) {
                                handleGradeChange(student._id || student.id, selectedPeriod, selectedSubject, gradeValue);
                                // Limpiar valor temporal después de guardar
                                setTempGrades(prev => {
                                  const newTemp = {...prev};
                                  delete newTemp[gradeKey];
                                  return newTemp;
                                });
                              }
                            }}
                            disabled={loadingGrades}
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                          >
                            {loadingGrades ? 'Guardando...' : 'Guardar'}
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
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona un grado con estudiantes para asignar notas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Agregar Estudiante */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
            <DialogDescription>
              Agrega un estudiante de bachillerato
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre Completo
              </Label>
              <Input
                id="name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                className="col-span-3"
                placeholder="Ej: MARÍA LÓPEZ GÓMEZ"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                Documento
              </Label>
              <Input
                id="document"
                value={newStudent.document_number}
                onChange={(e) => setNewStudent({...newStudent, document_number: e.target.value})}
                className="col-span-3"
                placeholder="Número de documento (opcional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grado
              </Label>
              <Select
                value={newStudent.grade}
                onValueChange={(value) => setNewStudent({...newStudent, grade: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona un grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6°">6°</SelectItem>
                  <SelectItem value="7°">7°</SelectItem>
                  <SelectItem value="8°">8°</SelectItem>
                  <SelectItem value="9°">9°</SelectItem>
                  <SelectItem value="10°">10°</SelectItem>
                  <SelectItem value="11°">11°</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAddStudent(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleAddStudent} className="bg-green-600 hover:bg-green-700">
              Agregar Estudiante
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos dinámicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6 pt-20 px-6">
        {/* Header mejorado */}
        <div className="mb-8 p-8 bg-gradient-to-r from-purple-600/20 via-indigo-600/15 to-blue-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-800 to-blue-800 bg-clip-text text-transparent">
                  Panel Docente - Bachillerato
                </h1>
                <div className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl text-xl font-bold shadow-lg animate-bounce">
                  🎓 BAC
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">{user.name}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <div className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-bold">
                  <GraduationCap className="h-4 w-4 inline mr-2" />
                  Tutor de Grupo
                </div>
                {user.subjects && user.subjects.map(subject => (
                  <div key={subject} className="px-3 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-gray-700 font-medium">
                    {subject}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Navegación por pestañas */}
        <Card>
          <CardHeader>
            <CardTitle>Navegación del Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeSection === 'dashboard' ? "default" : "outline"}
                onClick={() => setActiveSection('dashboard')}
                className="flex items-center space-x-2"
              >
                <GraduationCap className="h-4 w-4" />
                <span>Tutor de Grupo</span>
              </Button>
              {user.subjects && user.subjects.map(subject => (
                <Button
                  key={subject}
                  variant={activeSection === subject ? "default" : "outline"}
                  onClick={() => setActiveSection('dashboard')}
                  className="flex items-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{subject}</span>
                </Button>
              ))}
              <Button
                variant={activeSection === 'banco-logros' ? "default" : "outline"}
                onClick={() => setActiveSection('banco-logros')}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 hover:from-yellow-600 hover:to-orange-600"
              >
                <Trophy className="h-4 w-4" />
                <span>Banco de Logros</span>
              </Button>
              <Button
                variant={activeSection === 'boletines' ? "default" : "outline"}
                onClick={() => setActiveSection('boletines')}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 hover:from-purple-600 hover:to-blue-600"
              >
                <FileText className="h-4 w-4" />
                <span>Boletines</span>
              </Button>
              <Button
                variant={activeSection === 'proyectos' ? "default" : "outline"}
                onClick={() => setActiveSection('proyectos')}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-blue-500 text-white border-0 hover:from-green-600 hover:to-blue-600"
              >
                <FolderOpen className="h-4 w-4" />
                <span>Proyectos</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contenido dinámico */}
        {renderActiveSection()}
      </div>
    </div>
  );
};

export default DocenteBachilleratoDashboard;