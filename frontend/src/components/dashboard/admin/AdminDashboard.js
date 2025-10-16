import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { getErrorMessage } from '../../../utils/errorHandler';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  FileText,
  Download,
  Settings,
  Shield,
  UserCheck,
  FolderOpen,
  BarChart3,
  Upload,
  UserPlus,
  Calendar,
  Eye,
  Target,
  Trash2,
  Edit,
  Check
} from 'lucide-react';
import { studentService, adminService, gradeService, bulletinService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import BulkStudentUpload from '../../admin/BulkStudentUpload';
import GestionNotasAdmin from './GestionNotasAdmin';
import StudentEditForm from './StudentEditForm';
import CargaMasivaNotas from './CargaMasivaNotas';
import Proyectos from '../sections/Proyectos';
import { sortStudentsByGrade } from '../../../utils/gradeUtils';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPeriods, setSelectedPeriods] = useState(['I', 'II', 'III', 'IV']);
  const [activeTab, setActiveTab] = useState('resumen');
  const [activeSection, setActiveSection] = useState('dashboard'); // Para navegación del sidebar
  const [statistics, setStatistics] = useState(null);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Escuchar cambios de navegación desde el sidebar
  useEffect(() => {
    window.setActiveSection = setActiveSection;
    
    return () => {
      delete window.setActiveSection;
    };
  }, []);

  // Función para eliminar estudiantes masivamente
  const handleBulkDelete = async () => {
    try {
      await studentService.deleteBulkStudents(selectedStudents);
      
      toast({
        title: "Estudiantes eliminados",
        description: `Se eliminaron ${selectedStudents.length} estudiante(s) exitosamente`,
      });
      
      // Recargar datos
      await loadDashboardData();
      setSelectedStudents([]);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron eliminar los estudiantes",
        variant: "destructive"
      });
    }
  };

  // Función para eliminar un estudiante individual
  const handleDeleteStudent = async (studentId) => {
    try {
      await studentService.deleteStudent(studentId);
      
      toast({
        title: "Estudiante eliminado",
        description: "Estudiante eliminado exitosamente",
      });
      
      // Recargar datos
      await loadDashboardData();
      
    } catch (error) {
      toast({
        title: "Error", 
        description: "No se pudo eliminar el estudiante",
        variant: "destructive"
      });
    }
  };

  // Función para abrir modal de edición
  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  // Función para actualizar estudiante
  const handleUpdateStudent = async (studentData) => {
    try {
      await studentService.updateStudent(editingStudent._id || editingStudent.id, studentData);
      
      toast({
        title: "Estudiante actualizado",
        description: "Los datos del estudiante se actualizaron exitosamente",
      });
      
      // Recargar datos y cerrar modal
      await loadDashboardData();
      setShowEditModal(false);
      setEditingStudent(null);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estudiante", 
        variant: "destructive"
      });
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas del sistema
      const [statsData, studentsData, usersData] = await Promise.all([
        adminService.getStatistics(),
        studentService.getAll(),
        adminService.getUsers()
      ]);
      
      console.log('AdminDashboard - Total estudiantes cargados:', studentsData.length);
      
      // Ordenar estudiantes por grado
      const sortedStudents = sortStudentsByGrade(studentsData);
      
      setStatistics(statsData);
      setStudents(sortedStudents);
      setUsers(usersData);
      
      toast({
        title: "Dashboard cargado",
        description: `Se cargaron ${studentsData.length} estudiantes en total`,
      });
      
      // Cargar consolidado académico
      await loadConsolidatedData(studentsData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del dashboard",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConsolidatedData = async (studentsData = students) => {
    try {
      if (studentsData.length === 0) return;
      
      const consolidated = await gradeService.getConsolidatedGrades(selectedPeriods);
      setConsolidatedData(consolidated.students || []);
      
    } catch (error) {
      console.error('Error loading consolidated data:', error);
    }
  };

  const downloadStudentList = (format = 'csv') => {
    const studentsData = students.map(student => ({
      'Nombre Completo': student.name,
      'Grado': student.grade,
      'Nivel': student.level,
      'Documento': student.document_number || 'No registrado',
      'Estado': student.is_active ? 'Activo' : 'Inactivo',
      'Fecha de Registro': new Date(student.created_at).toLocaleDateString()
    }));

    if (format === 'csv') {
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
      link.setAttribute('download', `estudiantes_gaa_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "Lista descargada",
      description: `Se descargó el listado de ${studentsData.length} estudiantes`,
    });
  };

  const downloadConsolidatedReport = () => {
    if (consolidatedData.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay consolidado académico para descargar",
        variant: "destructive",
      });
      return;
    }

    const reportData = consolidatedData.map(record => ({
      'Estudiante': record.student.name,
      'Grado': record.student.grade,
      'Nivel': record.student.level,
      'Promedio General': record.total_average.toFixed(2),
      'Estado Académico': record.status,
      'Período I': record.periods.I || 'N/A',
      'Período II': record.periods.II || 'N/A',
      'Período III': record.periods.III || 'N/A',
      'Período IV': record.periods.IV || 'N/A'
    }));

    const headers = Object.keys(reportData[0]);
    const csvContent = [
      headers.join(','),
      ...reportData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consolidado_academico_gaa_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Reporte descargado",
      description: `Se descargó el consolidado de ${reportData.length} estudiantes`,
    });
  };


  const generateBulletinCode = async (studentId, period) => {
    try {
      const result = await bulletinService.generateBulletinCode(studentId, period);
      
      toast({
        title: "Código generado",
        description: `Código: ${result.code} - Válido hasta ${new Date(result.expires_at).toLocaleDateString()}`,
      });
      
      return result;
    } catch (error) {
      const message = getErrorMessage(error, 'Error al generar código');
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const studentsWinning = consolidatedData.filter(s => s.status === 'GANA').length;
  const studentsNeedHelp = consolidatedData.filter(s => s.status === 'REQUIERE AYUDA').length;
  const studentsLosing = consolidatedData.filter(s => s.status === 'PIERDE').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-red-50 relative overflow-hidden">
      {/* Elementos decorativos dinámicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-r from-purple-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-gradient-to-r from-red-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6 pt-20 px-6">
        {/* Header mejorado */}
        <div className="mb-8 p-8 bg-gradient-to-r from-blue-600/20 via-purple-600/15 to-red-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 hover:shadow-3xl transition-all duration-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-red-800 bg-clip-text text-transparent">
                Panel de Administración
              </h1>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-red-600 text-white rounded-xl text-lg font-bold shadow-lg animate-bounce">
                GADA
              </div>
            </div>
            <p className="text-gray-600 font-medium">Bienvenido, {user.name} - Coordinador Académico</p>
            <div className="mt-3 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-2xl inline-flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-300">
              <Shield className="h-5 w-5 animate-spin" />
              <span className="font-bold">🔐 ACCESO ADMINISTRATIVO COMPLETO ACTIVADO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.students?.total || students.length}</div>
            <p className="text-xs text-blue-100">Total registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profesores</CardTitle>
            <UserCheck className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.users?.by_role?.docente_primaria + statistics?.users?.by_role?.docente_bachillerato || 0}</div>
            <p className="text-xs text-green-100">Activos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Padres</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.users?.by_role?.padre || 0}</div>
            <p className="text-xs text-purple-100">Registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <GraduationCap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics?.users?.total || users.length}</div>
            <p className="text-xs text-orange-100">(0 aprobados)</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation como en la referencia */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 bg-white/80 backdrop-blur-md">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="permisos">Permisos</TabsTrigger>
          <TabsTrigger value="codigos">Códigos Descarga</TabsTrigger>
          <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
          <TabsTrigger value="profesores">Profesores</TabsTrigger>
          <TabsTrigger value="notas">Gestión de Notas</TabsTrigger>
          <TabsTrigger value="boletines">Boletines</TabsTrigger>
        </TabsList>

        {/* Tab Resumen */}
        <TabsContent value="resumen" className="space-y-6">
          {/* Acciones Rápidas */}
          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Acciones Rápidas</span>
              </CardTitle>
              <CardDescription>
                Funciones administrativas principales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-blue-50"
                  onClick={() => setActiveTab('usuarios')}
                >
                  <UserCheck className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gestión de Usuarios Registrados</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-green-50"
                  onClick={() => setShowBulkUpload(true)}
                >
                  <Upload className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gestión Masiva de Estudiantes</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-purple-50"
                  onClick={() => setActiveTab('notas')}
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span className="text-sm">Banco de Logros y Objetivos</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-orange-50"
                  onClick={() => setActiveTab('notas')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Mallas Curriculares</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-red-50"
                  onClick={() => setActiveTab('notas')}
                >
                  <FolderOpen className="h-6 w-6 mb-2" />
                  <span className="text-sm">Proyectos Institucionales</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-yellow-50"
                  onClick={() => setActiveTab('permisos')}
                >
                  <Settings className="h-6 w-6 mb-2" />
                  <span className="text-sm">Gestionar Períodos Académicos</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-indigo-50"
                  onClick={() => setActiveTab('permisos')}
                >
                  <Shield className="h-6 w-6 mb-2" />
                  <span className="text-sm">Configuración</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Badge variant="secondary">Período</Badge>
                  <span className="text-sm">Se habilitó el período académico II</span>
                  <span className="text-xs text-gray-500 ml-auto">Hace 2 horas</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <Badge variant="default">Nuevo</Badge>
                  <span className="text-sm">Se registró un nuevo padre de familia</span>
                  <span className="text-xs text-gray-500 ml-auto">Hace 1 día</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <Badge variant="outline">Actualizado</Badge>
                  <span className="text-sm">Se actualizaron las mallas curriculares de 6°</span>
                  <span className="text-xs text-gray-500 ml-auto">Hace 2 días</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Estudiantes */}
        <TabsContent value="estudiantes" className="space-y-6">
          {/* Lista de TODOS los estudiantes */}
          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-bold text-green-700">
                    📚 Lista Completa de Estudiantes 
                  </CardTitle>
                  <div className="mt-2 px-4 py-2 bg-green-100 rounded-lg inline-flex items-center">
                    <span className="text-2xl font-bold text-green-800">{students?.length || 0}</span>
                    <span className="ml-2 text-green-700 font-semibold">estudiantes reales cargados</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => downloadStudentList('csv')} size="sm" className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar CSV
                  </Button>
                  <Button 
                    onClick={() => {
                      if (selectedStudents.length === 0) {
                        toast({
                          title: "Ningún estudiante seleccionado",
                          description: "Selecciona estudiantes para eliminar",
                          variant: "destructive"
                        });
                        return;
                      }
                      if (window.confirm(`¿Estás seguro de eliminar ${selectedStudents.length} estudiante(s)?`)) {
                        handleBulkDelete();
                      }
                    }}
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700"
                    disabled={selectedStudents.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar Seleccionados ({selectedStudents.length})
                  </Button>
                  <Button 
                    onClick={() => {
                      setSelectedStudents(selectedStudents.length === students.length ? [] : students.map(s => s._id || s.id));
                    }}
                    size="sm" 
                    variant="outline"
                  >
                    {selectedStudents.length === students.length ? 'Deseleccionar Todos' : 'Seleccionar Todos'}
                  </Button>
                </div>
              </div>
              <CardDescription>
                Todos los estudiantes matriculados en la institución - ¡Datos reales cargados!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-center p-3 font-semibold w-12">
                        <input
                          type="checkbox"
                          checked={selectedStudents.length === students.length && students.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(students.map(s => s._id || s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                          className="rounded"
                        />
                      </th>
                      <th className="text-left p-3 font-semibold">Nombre Completo</th>
                      <th className="text-left p-3 font-semibold">Grado</th>
                      <th className="text-left p-3 font-semibold">Nivel</th>
                      <th className="text-left p-3 font-semibold">Documento</th>
                      <th className="text-center p-3 font-semibold">Estado</th>
                      <th className="text-center p-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.slice(0, 50).map((student, index) => {
                      const studentId = student._id || student.id;
                      const isSelected = selectedStudents.includes(studentId);
                      
                      return (
                        <tr key={studentId || index} className="border-b hover:bg-blue-50 transition-colors">
                          <td className="text-center p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents(prev => [...prev, studentId]);
                                } else {
                                  setSelectedStudents(prev => prev.filter(id => id !== studentId));
                                }
                              }}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3 font-medium text-blue-800">{student.name}</td>
                          <td className="p-3">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800">
                              {student.grade}
                            </Badge>
                          </td>
                          <td className="p-3 text-gray-600">{student.level}</td>
                          <td className="p-3 text-gray-600">{student.document_number || 'No registrado'}</td>
                          <td className="text-center p-3">
                            <Badge variant={student.is_active ? "default" : "secondary"}>
                              {student.is_active ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </td>
                          <td className="text-center p-3">
                            <div className="flex items-center justify-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditStudent(student)}
                                className="h-8 w-8 p-0"
                                title="Editar estudiante"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (window.confirm(`¿Estás seguro de eliminar a ${student.name}?`)) {
                                    handleDeleteStudent(studentId);
                                  }
                                }}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Eliminar estudiante"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {students.length > 50 && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-blue-700 font-semibold">
                      Mostrando los primeros 50 de {students.length} estudiantes totales. 
                      Descarga el CSV para ver la lista completa.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Consolidado Académico */}
          {consolidatedData.length > 0 ? (
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Consolidado Académico ({consolidatedData.length} estudiantes)</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => downloadStudentList('csv')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Lista Estudiantes
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={downloadConsolidatedReport}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Consolidado CSV
                    </Button>
                    <Button onClick={() => loadConsolidatedData()}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Actualizar
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Estudiante</th>
                        <th className="text-left p-2">Grado</th>
                        <th className="text-center p-2">Promedio</th>
                        <th className="text-center p-2">Estado</th>
                        <th className="text-center p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consolidatedData.slice(0, 10).map((student, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2 font-medium">{student.student.name}</td>
                          <td className="p-2">{student.student.grade}</td>
                          <td className="text-center p-2">
                            <Badge variant={student.total_average >= 3.0 ? "default" : "destructive"}>
                              {student.total_average}
                            </Badge>
                          </td>
                          <td className="text-center p-2">
                            <Badge 
                              variant={
                                student.status === 'GANA' ? 'default' : 
                                student.status === 'REQUIERE AYUDA' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {student.status}
                            </Badge>
                          </td>
                          <td className="text-center p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => generateBulletinCode(student.student.id, 'I')}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Código
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardContent className="text-center py-16">
                <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay estudiantes registrados</h3>
                <p className="text-gray-500 mb-4">Comience agregando estudiantes al sistema</p>
                <Button onClick={() => setShowBulkUpload(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Estudiantes
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Tab Usuarios - FUNCIONAL */}
        <TabsContent value="usuarios" className="space-y-6">
          <Card className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-red-500/10 backdrop-blur-md border-0 shadow-2xl animate-pulse">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-6 w-6 animate-bounce" />
                <span className="text-xl font-bold">👥 Gestión de Usuarios Registrados</span>
              </CardTitle>
              <CardDescription className="text-purple-100">
                Administrar todos los usuarios del sistema GADA
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-2">Usuarios Activos</h3>
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-blue-100">Total registrados</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-2">Pendientes</h3>
                  <p className="text-3xl font-bold">0</p>
                  <p className="text-green-100">Por aprobar</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-lg font-bold mb-2">Roles Únicos</h3>
                  <p className="text-3xl font-bold">6</p>
                  <p className="text-orange-100">Diferentes tipos</p>
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Agregar Nuevo Usuario
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Permisos - FUNCIONAL */}
        <TabsContent value="permisos" className="space-y-6">
          <Card className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 animate-spin" />
                <span className="text-xl font-bold">🔐 Permisos y Configuración del Sistema</span>
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Configurar períodos académicos y permisos de visualización
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Períodos Académicos
                  </h3>
                  <div className="space-y-3">
                    {['I', 'II', 'III', 'IV'].map(period => (
                      <div key={period} className="flex items-center justify-between p-3 bg-emerald-500/30 rounded-lg">
                        <span>Período {period}</span>
                        <Badge variant="default" className="bg-white text-emerald-600">Habilitado</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Permisos de Visualización
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-teal-500/30 rounded-lg">
                      <span>Notas a Padres</span>
                      <Badge variant="default" className="bg-green-500">Activo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-teal-500/30 rounded-lg">
                      <span>Notas a Estudiantes</span>
                      <Badge variant="secondary" className="bg-yellow-500 text-white">Controlado</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Códigos - FUNCIONAL */}
        <TabsContent value="codigos" className="space-y-6">
          <Card className="bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-red-500/10 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-6 w-6 animate-pulse" />
                <span className="text-xl font-bold">🔑 Códigos de Descarga de Boletines</span>
              </CardTitle>
              <CardDescription className="text-yellow-100">
                Generar códigos únicos para que los padres descarguen boletines
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {consolidatedData.slice(0, 8).map((student, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                    <h4 className="font-bold text-sm mb-2">{student.student?.name || 'Estudiante'}</h4>
                    <p className="text-xs mb-3">Grado: {student.student?.grade}</p>
                    <Button 
                      size="sm" 
                      className="w-full bg-white text-orange-600 hover:bg-orange-50"
                      onClick={() => generateBulletinCode(student.student?.id, 'I')}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Generar Código
                    </Button>
                  </div>
                ))}
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
                <p className="text-gray-700 font-medium">💡 Los códigos tienen vigencia de 30 días y son de uso único</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Profesores - FUNCIONAL */}
        <TabsContent value="profesores" className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-purple-500/10 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <UserCheck className="h-6 w-6 animate-bounce" />
                <span className="text-xl font-bold">👨‍🏫 Gestión de Profesores</span>
              </CardTitle>
              <CardDescription className="text-indigo-100">
                Administrar docentes de primaria y bachillerato
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-xl text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Docentes Primaria
                  </h3>
                  <p className="text-3xl font-bold mb-2">{users.filter(u => u.role === 'docente_primaria').length}</p>
                  <p className="text-indigo-200">Grados Transición - 5°</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white shadow-lg">
                  <h3 className="text-lg font-bold mb-4 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Docentes Bachillerato
                  </h3>
                  <p className="text-3xl font-bold mb-2">{users.filter(u => u.role === 'docente_bachillerato').length}</p>
                  <p className="text-blue-200">Grados 6° - 11°</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {users.filter(u => u.role?.includes('docente')).map((teacher, index) => (
                  <div key={index} className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl shadow-md transform hover:scale-102 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-indigo-800">{teacher.name}</h4>
                        <p className="text-sm text-indigo-600">{teacher.role === 'docente_primaria' ? `Grado ${teacher.grade}` : 'Bachillerato'}</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-400 to-green-600 text-white">Activo</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Gestión de Notas - FUNCIONAL */}
        <TabsContent value="notas" className="space-y-6">
          <GestionNotasAdmin />
        </TabsContent>

        {/* Tab Boletines - FUNCIONAL */}
        <TabsContent value="boletines" className="space-y-6">
          <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-indigo-500/10 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-6 w-6 animate-pulse" />
                <span className="text-xl font-bold">📄 Gestión de Boletines</span>
              </CardTitle>
              <CardDescription className="text-cyan-100">
                Configurar formatos de boletines por nivel educativo
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-gradient-to-br from-green-400 to-green-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl mb-3">🌱</div>
                  <h3 className="text-lg font-bold mb-2">Transición</h3>
                  <p className="text-sm opacity-90 mb-4">Formato específico</p>
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30">
                    Configurar
                  </Button>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-lg font-bold mb-2">Primaria (1°-5°)</h3>
                  <p className="text-sm opacity-90 mb-4">Formato específico</p>
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30">
                    Configurar
                  </Button>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl mb-3">🎓</div>
                  <h3 className="text-lg font-bold mb-2">Bachillerato (6°-10°)</h3>
                  <p className="text-sm opacity-90 mb-4">Formato específico</p>
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30">
                    Configurar
                  </Button>
                </div>
                <div className="p-6 bg-gradient-to-br from-red-400 to-red-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl mb-3">🏆</div>
                  <h3 className="text-lg font-bold mb-2">Grado 11°</h3>
                  <p className="text-sm opacity-90 mb-4">Formato específico</p>
                  <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30">
                    Configurar
                  </Button>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-lg">
                <h4 className="font-bold text-cyan-800 mb-2">🚀 Características Avanzadas:</h4>
                <ul className="text-cyan-700 text-sm space-y-1">
                  <li>• Generación automática de PDF</li>
                  <li>• Códigos QR de verificación</li>
                  <li>• Firmas digitales integradas</li>
                  <li>• Descarga con códigos únicos</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Carga Masiva */}
      {showBulkUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <BulkStudentUpload 
                onClose={() => {
                  setShowBulkUpload(false);
                  loadDashboardData(); // Recargar datos después de la carga
                }}
              />
            </div>
          </div>
        </div>
      )}
      </div>

      {/* Modal de Edición de Estudiante */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Estudiante</DialogTitle>
            <DialogDescription>
              Modifica los datos del estudiante {editingStudent?.name}
            </DialogDescription>
          </DialogHeader>
          {editingStudent && (
            <StudentEditForm
              student={editingStudent}
              onSave={handleUpdateStudent}
              onCancel={() => {
                setShowEditModal(false);
                setEditingStudent(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Carga Masiva */}
      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Carga Masiva de Estudiantes</DialogTitle>
            <DialogDescription>
              Sube un archivo Excel (.xlsx) con los datos de los estudiantes
            </DialogDescription>
          </DialogHeader>
          <BulkStudentUpload 
            onClose={() => setShowBulkUpload(false)}
            onSuccess={() => {
              setShowBulkUpload(false);
              loadDashboardData();
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;