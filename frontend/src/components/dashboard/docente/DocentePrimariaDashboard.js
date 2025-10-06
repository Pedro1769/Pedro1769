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
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  FileText, 
  Heart,
  MessageSquare,
  Plus,
  Edit,
  Download
} from 'lucide-react';
import { MOCK_STUDENTS, SUBJECTS, PERIODS, getPerformanceLevel } from '../../../mockData';
import { studentService } from '../../../services/api';

const DocentePrimariaDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedSubject, setSelectedSubject] = useState('HUMANIDADES');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    document_number: '',
    grade: user.grade || '',
    level: user.grade && ['Transición', '1°', '2°', '3°', '4°', '5°'].includes(user.grade) ? 'BÁSICA PRIMARIA' : 'BÁSICA SECUNDARIA'
  });
  const { toast } = useToast();

  // Cargar estudiantes del grado asignado al docente
  useEffect(() => {
    loadStudents();
  }, [user.grade]);

  const myStudents = students;
  
  const getStudentGrade = (student, period, subject) => {
    return student.grades[period]?.[subject] || '';
  };

  const downloadMyStudentsList = () => {
    const studentsData = myStudents.map(student => ({
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
    link.setAttribute('download', `mis_estudiantes_${user.grade}_${new Date().toISOString().split('T')[0]}.csv`);
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
        created_at: new Date().toISOString()
      };

      await studentService.createStudent(studentData);
      
      // Recargar lista de estudiantes
      loadStudents();
      
      // Limpiar formulario y cerrar modal
      setNewStudent({
        name: '',
        document_number: '',
        grade: user.grade || '',
        level: user.grade && ['Transición', '1°', '2°', '3°', '4°', '5°'].includes(user.grade) ? 'BÁSICA PRIMARIA' : 'BÁSICA SECUNDARIA'
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
      console.log('Cargando estudiantes para grado:', user.grade);
      const allStudents = await studentService.getAll();
      console.log('Total estudiantes recibidos:', allStudents.length);
      const gradeStudents = allStudents.filter(student => student.grade === user.grade);
      console.log('Estudiantes filtrados para grado', user.grade, ':', gradeStudents.length);
      setStudents(gradeStudents);
      toast({
        title: "Estudiantes cargados",
        description: `Se encontraron ${gradeStudents.length} estudiantes en grado ${user.grade}`,
      });
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error al cargar estudiantes",
        description: "No se pudieron cargar los estudiantes reales. Usando datos de prueba.",
        variant: "destructive",
      });
      // Fallback a datos mock solo si hay error
      const myStudents = MOCK_STUDENTS.filter(student => student.grade === user.grade);
      setStudents(myStudents);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Elementos decorativos dinámicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-gradient-to-r from-teal-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6 pt-20 px-6">
        {/* Header mejorado */}
        <div className="mb-8 p-8 bg-gradient-to-r from-green-600/20 via-emerald-600/15 to-teal-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-green-800 to-teal-800 bg-clip-text text-transparent">
                  Panel Docente - Primaria
                </h1>
                <div className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl text-xl font-bold shadow-lg animate-bounce">
                  📚 {user.grade}
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">{user.name} - Docente de Grado {user.grade}</p>
              <div className="mt-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl inline-flex items-center space-x-2 shadow-lg">
                <BookOpen className="h-5 w-5" />
                <span className="font-bold">🌟 Docente de todas las asignaturas del grado</span>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStudents.length}</div>
            <p className="text-xs text-blue-100">Grado {user.grade}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SUBJECTS.PRIMARIA.length}</div>
            <p className="text-xs text-green-100">Todas las materias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Períodos</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PERIODS.length}</div>
            <p className="text-xs text-purple-100">Período actual: {selectedPeriod}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Mis Estudiantes - Grado {user.grade}</span>
            </div>
            <div className="flex space-x-2">
              <Button onClick={downloadMyStudentsList} size="sm" className="bg-green-600 hover:bg-green-700">
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
            Gestiona tu lista de estudiantes del grado a cargo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">Grado {student.grade} - {student.level}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Activo</Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asignación de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Asignación de Notas</span>
          </CardTitle>
          <CardDescription>
            Registra calificaciones para el período y asignatura seleccionada
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
              {SUBJECTS.PRIMARIA.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
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
                {myStudents.map((student, index) => {
                  const currentGrade = getStudentGrade(student, selectedPeriod, selectedSubject);
                  const performance = currentGrade ? getPerformanceLevel(currentGrade) : null;
                  
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
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="0.0"
                          className="w-20 text-center"
                          defaultValue={currentGrade}
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
                        <Button size="sm" variant="outline">
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Convivencia y Acompañamiento */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Convivencia</span>
            </CardTitle>
            <CardDescription>
              Registra observaciones de convivencia escolar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myStudents.slice(0, 3).map((student, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{student.name}</span>
                  <Badge variant="outline" className="text-xs">Convivencia</Badge>
                </div>
                <textarea
                  placeholder="Observaciones de convivencia..."
                  className="w-full p-2 text-sm border rounded resize-none"
                  rows="2"
                />
                <Button size="sm" className="mt-2 w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Registrar Observación
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Acompañamiento de Acudiente</span>
            </CardTitle>
            <CardDescription>
              Registra actividades de acompañamiento familiar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myStudents.slice(0, 3).map((student, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{student.name}</span>
                  <Badge variant="secondary" className="text-xs">Acompañamiento</Badge>
                </div>
                <textarea
                  placeholder="Seguimiento del acompañamiento familiar..."
                  className="w-full p-2 text-sm border rounded resize-none"
                  rows="2"
                />
                <Button size="sm" className="mt-2 w-full" variant="secondary">
                  <Plus className="h-3 w-3 mr-1" />
                  Registrar Seguimiento
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Proyectos Institucionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Proyectos Institucionales</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Subir Proyecto
            </Button>
          </CardTitle>
          <CardDescription>
            Gestiona y comparte proyectos pedagógicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay proyectos registrados</p>
            <p className="text-sm">Sube tu primer proyecto institucional</p>
          </div>
        </CardContent>
      </Card>

      {/* Modal Agregar Estudiante */}
      <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
            <DialogDescription>
              Agrega un estudiante a tu grado {user.grade}
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
                placeholder="Ej: JUAN PÉREZ GARCÍA"
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
              <Input
                id="grade"
                value={newStudent.grade}
                disabled
                className="col-span-3 bg-gray-100"
              />
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
      </div>
    </div>
  );
};

export default DocentePrimariaDashboard;