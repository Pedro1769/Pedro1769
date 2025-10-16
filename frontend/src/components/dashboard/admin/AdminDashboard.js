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

  // Renderizar sección según navegación
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'consolidados':
        return renderConsolidadosSection();
      case 'estudiantes':
        return renderEstudiantesSection();
      case 'docentes':
        return renderDocentesSection();
      case 'permisos':
        return renderPermisosSection();
      case 'codigos':
        return renderCodigosSection();
      case 'proyectos':
        return <Proyectos />;
      case 'config':
        return renderConfigSection();
      case 'carga-masiva':
        return <CargaMasivaNotas />;
      case 'dashboard':
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
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
            <p className="text-xs text-blue-100">Todos los grados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Docentes</CardTitle>
            <GraduationCap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'docente_primaria' || u.role === 'docente_bachillerato').length}
            </div>
            <p className="text-xs text-green-100">Personal académico</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Padres</CardTitle>
            <UserCheck className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'padre').length}
            </div>
            <p className="text-xs text-purple-100">Acudientes registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Total</CardTitle>
            <Shield className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-orange-100">Sistema completo</p>
          </CardContent>
        </Card>
      </div>

      {/* Navegación rápida */}
      <Card>
        <CardHeader>
          <CardTitle>Acceso Rápido</CardTitle>
          <CardDescription>Accede a las principales funciones administrativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('consolidados')}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Consolidados</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('estudiantes')}
            >
              <Users className="h-6 w-6" />
              <span>Estudiantes</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('docentes')}
            >
              <UserCheck className="h-6 w-6" />
              <span>Docentes</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('carga-masiva')}
            >
              <Upload className="h-6 w-6" />
              <span>Carga Masiva</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('codigos')}
            >
              <Download className="h-6 w-6" />
              <span>Códigos Boletines</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('proyectos')}
            >
              <FolderOpen className="h-6 w-6" />
              <span>Proyectos</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('permisos')}
            >
              <Shield className="h-6 w-6" />
              <span>Permisos</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex-col space-y-2"
              onClick={() => setActiveSection('config')}
            >
              <Settings className="h-6 w-6" />
              <span>Configuración</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );

  // Sección de Consolidados
  const renderConsolidadosSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Consolidados Académicos</span>
        </CardTitle>
        <CardDescription>
          Vista consolidada del rendimiento académico por períodos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Sección en desarrollo - Próximamente</p>
      </CardContent>
    </Card>
  );

  // Sección de Gestión de Estudiantes
  const renderEstudiantesSection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Gestión de Estudiantes</span>
              </CardTitle>
              <CardDescription>
                Administra estudiantes del sistema
              </CardDescription>
            </div>
            <Button onClick={() => setShowBulkUpload(true)} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Carga Masiva
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Cargando estudiantes...</p>
          ) : (
            <div className="space-y-4">
              {students.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hay estudiantes registrados</p>
              ) : (
                <div className="space-y-2">
                  {students.slice(0, 20).map((student) => (
                    <div key={student._id || student.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">Grado {student.grade} - {student.level}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={student.is_active ? "default" : "secondary"}>
                          {student.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingStudent(student);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {students.length > 20 && (
                    <p className="text-center text-sm text-gray-500 py-2">
                      Y {students.length - 20} estudiantes más...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  // Sección de Gestión de Docentes
  const renderDocentesSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5" />
          <span>Gestión de Docentes</span>
        </CardTitle>
        <CardDescription>
          Administra el personal docente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.filter(u => u.role === 'docente_primaria' || u.role === 'docente_bachillerato').map((docente) => (
            <div key={docente._id || docente.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{docente.name}</p>
                <p className="text-sm text-gray-600">
                  {docente.role === 'docente_primaria' ? 'Primaria' : 'Bachillerato'}
                  {docente.grade && ` - Grado ${docente.grade}`}
                  {docente.grades && ` - Grados: ${docente.grades.join(', ')}`}
                </p>
              </div>
              <Badge variant="outline">{docente.email}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // Sección de Permisos
  const renderPermisosSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Gestión de Permisos</span>
        </CardTitle>
        <CardDescription>
          Configura roles y permisos de usuarios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Sección en desarrollo - Próximamente</p>
      </CardContent>
    </Card>
  );

  // Sección de Códigos para Boletines
  const renderCodigosSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Códigos de Descarga de Boletines</span>
        </CardTitle>
        <CardDescription>
          Genera códigos únicos de 24 horas para descargar boletines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Sección en desarrollo - Próximamente</p>
      </CardContent>
    </Card>
  );

  // Sección de Configuración
  const renderConfigSection = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuración del Sistema</span>
        </CardTitle>
        <CardDescription>
          Ajustes generales de la plataforma
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">Sección en desarrollo - Próximamente</p>
      </CardContent>
    </Card>
  );

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

      {/* Contenido dinámico según sección activa */}
      {renderActiveSection()}
      </div>
      
      {/* Modales */}
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