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
  UserPlus
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
    <div className="space-y-6 pt-16">
      {/* Header mejorado */}
      <div className="mb-8 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-red-800 bg-clip-text text-transparent mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-600">Bienvenido, {user.name}</p>
            <div className="mt-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg inline-flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">ACCESO ADMINISTRATIVO COMPLETO ACTIVADO</span>
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

        {/* Otros tabs - implementación básica */}
        <TabsContent value="usuarios">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Funcionalidad de gestión de usuarios en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permisos">
          <Card>
            <CardHeader>
              <CardTitle>Permisos y Configuración</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Panel de permisos y configuración en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="codigos">
          <Card>
            <CardHeader>
              <CardTitle>Códigos de Descarga</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gestión de códigos de descarga en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profesores">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Profesores</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Panel de gestión de profesores en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academico">
          <Card>
            <CardHeader>
              <CardTitle>Gestión Académica</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Panel académico en desarrollo...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="boletines">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Boletines</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Panel de boletines en desarrollo...</p>
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