import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { useAuth } from '../../../contexts/AuthContext';
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
  Heart, 
  AlertCircle, 
  FileText, 
  MessageSquare,
  Plus,
  Search,
  Filter,
  BarChart3,
  UserCheck,
  Download
} from 'lucide-react';
import { MOCK_STUDENTS, PERIODS, GRADES } from '../../../mockData';
import { studentService, gradeService } from '../../../services/api';
import { useToast } from '../../../hooks/use-toast';

const ConvivenciaDashboard = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [selectedStudentForGrade, setSelectedStudentForGrade] = useState(null);
  const [convivenciaGrade, setConvivenciaGrade] = useState({
    period: 'I',
    grade: '',
    observations: ''
  });
  const [newStudent, setNewStudent] = useState({
    name: '',
    document_number: '',
    grade: 'Transición',
    level: 'PREESCOLAR'
  });
  const { toast } = useToast();

  // Cargar TODOS los estudiantes (coordinadora ve todos)
  const loadAllStudents = async () => {
    try {
      setLoading(true);
      console.log('ConvivenciaDashboard - Cargando todos los estudiantes...');
      const allStudents = await studentService.getAll();
      console.log('ConvivenciaDashboard - Total estudiantes recibidos:', allStudents.length);
      setStudents(allStudents);
      toast({
        title: "Estudiantes cargados",
        description: `Se cargaron ${allStudents.length} estudiantes reales`,
      });
    } catch (error) {
      console.error('Error loading students:', error);
      // Fallback a datos mock
      setStudents(MOCK_STUDENTS);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar los estudiantes reales. Usando datos de prueba.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllStudents();
  }, []);

  // Función para descargar lista completa de estudiantes
  const downloadAllStudents = () => {
    if (!students || students.length === 0) {
      toast({
        title: "Sin datos para descargar",
        description: "No hay estudiantes para exportar",
        variant: "destructive",
      });
      return;
    }

    const studentsData = students.map(student => ({
      'Nombre Completo': student.name,
      'Grado': student.grade,
      'Nivel': student.level,
      'Documento': student.document_number || 'No registrado',
      'Estado': student.is_active ? 'Activo' : 'Inactivo',
      'Fecha de Registro': new Date(student.created_at).toLocaleDateString()
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
    link.setAttribute('download', `todos_estudiantes_gaa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Lista completa descargada",
      description: `Se descargó el listado completo de ${studentsData.length} estudiantes`,
    });
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

      // Determinar el nivel según el grado
      let level = 'PREESCOLAR';
      if (['1°', '2°', '3°', '4°', '5°'].includes(newStudent.grade)) {
        level = 'BÁSICA PRIMARIA';
      } else if (['6°', '7°', '8°', '9°'].includes(newStudent.grade)) {
        level = 'BÁSICA SECUNDARIA';
      } else if (['10°', '11°'].includes(newStudent.grade)) {
        level = 'MEDIA';
      }

      const studentData = {
        ...newStudent,
        name: newStudent.name.toUpperCase(),
        level: level,
        is_active: true,
        created_at: new Date().toISOString()
      };

      await studentService.createStudent(studentData);
      
      // Recargar lista de estudiantes
      loadAllStudents();
      
      // Limpiar formulario y cerrar modal
      setNewStudent({
        name: '',
        document_number: '',
        grade: 'Transición',
        level: 'PREESCOLAR'
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

  // Función para abrir modal de nota de convivencia
  const openGradeModal = (student) => {
    setSelectedStudentForGrade(student);
    setConvivenciaGrade({
      period: 'I',
      grade: '',
      observations: ''
    });
    setShowGradeModal(true);
  };

  // Función para asignar nota de convivencia
  const handleAssignConvivenciaGrade = async () => {
    try {
      if (!convivenciaGrade.grade) {
        toast({
          title: "Error",
          description: "Debes asignar una nota de convivencia",
          variant: "destructive",
        });
        return;
      }

      const gradeValue = parseFloat(convivenciaGrade.grade);
      if (isNaN(gradeValue) || gradeValue < 1 || gradeValue > 5) {
        toast({
          title: "Nota inválida",
          description: "La nota debe estar entre 1.0 y 5.0",
          variant: "destructive",
        });
        return;
      }

      const gradeData = {
        student_id: selectedStudentForGrade._id || selectedStudentForGrade.id,
        subject: "CONVIVENCIA ESCOLAR",
        period: convivenciaGrade.period,
        grade: gradeValue,
        teacher_notes: convivenciaGrade.observations
      };

      await gradeService.assignGrade(gradeData);

      setShowGradeModal(false);
      setSelectedStudentForGrade(null);

      toast({
        title: "Nota de convivencia asignada",
        description: `Nota ${gradeValue} asignada a ${selectedStudentForGrade.name} en período ${convivenciaGrade.period}`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo asignar la nota de convivencia. Intenta nuevamente.",
        variant: "destructive",
      });
      console.error('Error assigning convivencia grade:', error);
    }
  };

  // Filtrar estudiantes
  const filteredStudents = (students || []).filter(student => {
    const matchesGrade = selectedGrade === 'Todos' || student.grade === selectedGrade;
    const matchesSearch = student.name && student.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const allGrades = ['Todos', ...GRADES.PREESCOLAR, ...GRADES.PRIMARIA, ...GRADES.BACHILLERATO];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 relative overflow-hidden">
      {/* Elementos decorativos dinámicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6 pt-20 px-6">
        {/* Header mejorado */}
        <div className="mb-8 p-8 bg-gradient-to-r from-pink-600/20 via-rose-600/15 to-purple-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-800 to-purple-800 bg-clip-text text-transparent">
                  Coordinación de Convivencia
                </h1>
                <div className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-2xl text-xl font-bold shadow-lg animate-bounce">
                  💜 CONV
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">{user.name} - Coordinadora de Convivencia</p>
              <div className="mt-3 px-6 py-3 bg-gradient-to-r from-rose-500 to-purple-600 text-white rounded-2xl inline-flex items-center space-x-2 shadow-lg">
                <Heart className="h-5 w-5" />
                <span className="font-bold">🌟 Gestión integral de convivencia escolar</span>
              </div>
            </div>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STUDENTS.length}</div>
            <p className="text-xs text-blue-100">Todos los grados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguimientos</CardTitle>
            <Heart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-100">Activos este período</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Especiales</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-yellow-100">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-purple-100">Convivencia activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filtrar Estudiantes</span>
              </CardTitle>
              <CardDescription>
                Busca y filtra estudiantes para gestión de convivencia
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button onClick={() => setShowAddStudent(true)} size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Estudiante
              </Button>
              <Button onClick={downloadAllStudents} size="sm" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar Lista Completa
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allGrades.map(grade => (
                <Badge
                  key={grade}
                  variant={selectedGrade === grade ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedGrade(grade)}
                >
                  {grade}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Estudiantes y Gestión */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Estudiantes ({filteredStudents.length})</span>
              </CardTitle>
              <CardDescription>
                {selectedGrade !== 'Todos' ? `Grado ${selectedGrade}` : 'Todos los grados'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Cargando estudiantes...</p>
                </div>
              ) : !filteredStudents || filteredStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No se encontraron estudiantes</p>
                  <p className="text-sm text-gray-400">Total de estudiantes cargados: {students?.length || 0}</p>
                  <p className="text-sm text-gray-400">Filtro actual: {selectedGrade}</p>
                  <Button 
                    onClick={loadAllStudents} 
                    size="sm" 
                    className="mt-3 bg-pink-600 hover:bg-pink-700"
                  >
                    Recargar Estudiantes
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border border-pink-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-pink-800 font-bold text-lg">
                          ✅ {filteredStudents.length} ESTUDIANTES REALES
                        </p>
                        <p className="text-pink-600 text-sm">
                          {selectedGrade !== 'Todos' ? `Grado ${selectedGrade}` : 'Todos los grados'} - Base de datos institucional
                        </p>
                      </div>
                      <div className="px-4 py-2 bg-pink-600 text-white rounded-full font-bold text-xl">
                        {filteredStudents.length}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {(filteredStudents || []).map((student, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">Grado {student.grade} - {student.level}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 3) + 1} seguimientos
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openGradeModal(student)}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-700"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        Convivencia
                      </Button>
                      <Button variant="ghost" size="sm">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </div>
                    </div>
                  ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Gestión de Convivencia</span>
              </CardTitle>
              <CardDescription>
                {selectedStudent ? `${selectedStudent.name}` : 'Selecciona un estudiante'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Información del Estudiante</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Grado:</strong> {selectedStudent.grade}<br/>
                      <strong>Nivel:</strong> {selectedStudent.level}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Observación</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm">
                        <option>Convivencia Positiva</option>
                        <option>Llamado de Atención</option>
                        <option>Compromiso Académico</option>
                        <option>Seguimiento Comportamental</option>
                        <option>Reunión con Acudiente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Observación</label>
                      <Textarea
                        placeholder="Describe la situación, acciones tomadas o seguimiento..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Período</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm">
                        {PERIODS.map(period => (
                          <option key={period} value={period}>Período {period}</option>
                        ))}
                      </select>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Observación
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2">Historial Reciente</h4>
                    <div className="space-y-2">
                      <div className="text-xs p-2 bg-gray-50 rounded">
                        <Badge variant="outline" className="text-xs mb-1">Seguimiento</Badge>
                        <p className="text-gray-600">Mejora en participación en clase...</p>
                        <p className="text-gray-400 mt-1">Hace 2 días</p>
                      </div>
                      <div className="text-xs p-2 bg-gray-50 rounded">
                        <Badge variant="secondary" className="text-xs mb-1">Positiva</Badge>
                        <p className="text-gray-600">Excelente comportamiento durante...</p>
                        <p className="text-gray-400 mt-1">Hace 1 semana</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecciona un estudiante</p>
                  <p className="text-sm">para gestionar su convivencia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reportes y Proyectos */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Reportes de Convivencia</span>
            </CardTitle>
            <CardDescription>
              Estadísticas y análisis de convivencia escolar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Reporte por Período
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Estadísticas Generales
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Casos de Seguimiento
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Proyectos de Convivencia</span>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </CardTitle>
            <CardDescription>
              Gestiona proyectos institucionales de convivencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Convivencia y Valores</h4>
                <p className="text-xs text-gray-600 mt-1">Fortalecimiento de valores institucionales</p>
                <Badge variant="default" className="text-xs mt-2">Activo</Badge>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Resolución de Conflictos</h4>
                <p className="text-xs text-gray-600 mt-1">Estrategias de mediación escolar</p>
                <Badge variant="secondary" className="text-xs mt-2">En desarrollo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Agregar Estudiante */}
        <Dialog open={showAddStudent} onOpenChange={setShowAddStudent}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Estudiante</DialogTitle>
              <DialogDescription>
                Agrega un estudiante a cualquier grado de la institución
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
                  placeholder="Ej: ANA SOFÍA TORRES"
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
                    <SelectItem value="Transición">Transición</SelectItem>
                    <SelectItem value="1°">1°</SelectItem>
                    <SelectItem value="2°">2°</SelectItem>
                    <SelectItem value="3°">3°</SelectItem>
                    <SelectItem value="4°">4°</SelectItem>
                    <SelectItem value="5°">5°</SelectItem>
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

        {/* Modal Asignar Nota de Convivencia */}
        <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Asignar Nota de Convivencia</DialogTitle>
              <DialogDescription>
                {selectedStudentForGrade && `Asignar nota de convivencia a ${selectedStudentForGrade.name}`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Período
                </Label>
                <Select
                  value={convivenciaGrade.period}
                  onValueChange={(value) => setConvivenciaGrade({...convivenciaGrade, period: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecciona período" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(period => (
                      <SelectItem key={period} value={period}>Período {period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Nota (1.0 - 5.0)
                </Label>
                <Input
                  id="grade"
                  type="number"
                  min="1.0"
                  max="5.0"
                  step="0.1"
                  value={convivenciaGrade.grade}
                  onChange={(e) => setConvivenciaGrade({...convivenciaGrade, grade: e.target.value})}
                  className="col-span-3"
                  placeholder="Ej: 4.5"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="observations" className="text-right">
                  Observaciones
                </Label>
                <Textarea
                  id="observations"
                  value={convivenciaGrade.observations}
                  onChange={(e) => setConvivenciaGrade({...convivenciaGrade, observations: e.target.value})}
                  className="col-span-3"
                  placeholder="Observaciones sobre la convivencia del estudiante..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setShowGradeModal(false)} variant="outline">
                Cancelar
              </Button>
              <Button onClick={handleAssignConvivenciaGrade} className="bg-pink-600 hover:bg-pink-700">
                <Heart className="h-4 w-4 mr-2" />
                Asignar Nota
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </div>
  );
};

export default ConvivenciaDashboard;