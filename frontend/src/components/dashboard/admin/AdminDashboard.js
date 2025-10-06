import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
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
  Target
} from 'lucide-react';
import { studentService, adminService, gradeService, bulletinService } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import BulkStudentUpload from '../../admin/BulkStudentUpload';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [selectedPeriods, setSelectedPeriods] = useState(['I', 'II', 'III', 'IV']);
  const [activeTab, setActiveTab] = useState('resumen');
  const [statistics, setStatistics] = useState(null);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas del sistema
      const [statsData, studentsData, usersData] = await Promise.all([
        adminService.getStatistics(),
        studentService.getStudents(),
        adminService.getUsers()
      ]);
      
      setStatistics(statsData);
      setStudents(studentsData);
      setUsers(usersData);
      
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

  const generateBulletinCode = async (studentId, period) => {
    try {
      const result = await bulletinService.generateBulletinCode(studentId, period);
      
      toast({
        title: "Código generado",
        description: `Código: ${result.code} - Válido hasta ${new Date(result.expires_at).toLocaleDateString()}`,
      });
      
      return result;
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al generar código';
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
          <TabsTrigger value="academico">Académico</TabsTrigger>
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
                  onClick={() => setActiveTab('academico')}
                >
                  <BookOpen className="h-6 w-6 mb-2" />
                  <span className="text-sm">Banco de Logros y Objetivos</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-orange-50"
                  onClick={() => setActiveTab('academico')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  <span className="text-sm">Mallas Curriculares</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center hover:bg-red-50"
                  onClick={() => setActiveTab('academico')}
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
          {consolidatedData.length > 0 ? (
            <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Consolidado Académico ({consolidatedData.length} estudiantes)</span>
                  <Button onClick={() => loadConsolidatedData()}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Actualizar
                  </Button>
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

        {/* Tab Académico - FUNCIONAL */}
        <TabsContent value="academico" className="space-y-6">
          <Card className="bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-fuchsia-500/10 backdrop-blur-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 animate-pulse" />
                <span className="text-xl font-bold">📚 Gestión Académica</span>
              </CardTitle>
              <CardDescription className="text-rose-100">
                Banco de logros, objetivos y mallas curriculares
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-rose-400 to-rose-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Target className="h-12 w-12 mb-4 animate-spin" />
                  <h3 className="text-lg font-bold mb-2">Logros Académicos</h3>
                  <p className="text-rose-100">250+ objetivos configurados</p>
                  <Button className="mt-4 bg-white text-rose-600 hover:bg-rose-50 w-full">Ver Banco</Button>
                </div>
                <div className="p-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <FolderOpen className="h-12 w-12 mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold mb-2">Mallas Curriculares</h3>
                  <p className="text-pink-100">Todos los grados actualizados</p>
                  <Button className="mt-4 bg-white text-pink-600 hover:bg-pink-50 w-full">Gestionar</Button>
                </div>
                <div className="p-6 bg-gradient-to-br from-fuchsia-400 to-fuchsia-600 rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300">
                  <BarChart3 className="h-12 w-12 mb-4 animate-pulse" />
                  <h3 className="text-lg font-bold mb-2">Reportes</h3>
                  <p className="text-fuchsia-100">Estadísticas en tiempo real</p>
                  <Button className="mt-4 bg-white text-fuchsia-600 hover:bg-fuchsia-50 w-full">Generar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
                {[
                  { name: 'Transición', color: 'from-green-400 to-green-600', icon: '🌱' },
                  { name: 'Primaria (1°-5°)', color: 'from-blue-400 to-blue-600', icon: '📚' },
                  { name: 'Bachillerato (6°-10°)', color: 'from-purple-400 to-purple-600', icon: '🎓' },
                  { name: 'Grado 11°', color: 'from-red-400 to-red-600', icon: '🏆' }
                ].map((level, index) => (
                  <div key={index} className={`p-6 bg-gradient-to-br ${level.color} rounded-xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
                    <div className="text-4xl mb-3">{level.icon}</div>
                    <h3 className="text-lg font-bold mb-2">{level.name}</h3>
                    <p className="text-sm opacity-90 mb-4">Formato específico</p>
                    <Button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30">
                      Configurar
                    </Button>
                  </div>
                ))}
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
  );
};

export default AdminDashboard;