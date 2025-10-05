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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Ganan</CardTitle>
            <TrendingUp className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsWinning}</div>
            <p className="text-xs text-green-100">
              {((studentsWinning / consolidatedData.length) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Requieren Ayuda</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsNeedHelp}</div>
            <p className="text-xs text-yellow-100">
              {((studentsNeedHelp / consolidatedData.length) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Pierden</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentsLosing}</div>
            <p className="text-xs text-red-100">
              {((studentsLosing / consolidatedData.length) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <GraduationCap className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consolidatedData.length}</div>
            <p className="text-xs text-blue-100">{docentes.length} docentes activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Consolidado Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Consolidado Académico</span>
          </CardTitle>
          <CardDescription>
            Comparativo de rendimiento por períodos seleccionados
          </CardDescription>
          
          {/* Period Selection */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-sm font-medium">Períodos:</span>
            {PERIODS.map(period => (
              <Badge
                key={period}
                variant={selectedPeriods.includes(period) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedPeriods(prev => 
                    prev.includes(period) 
                      ? prev.filter(p => p !== period)
                      : [...prev, period]
                  );
                }}
              >
                {period}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Estudiante</th>
                  <th className="text-left p-2">Grado</th>
                  {selectedPeriods.map(period => (
                    <th key={period} className="text-center p-2">{period}</th>
                  ))}
                  <th className="text-center p-2">Promedio</th>
                  <th className="text-center p-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                {consolidatedData.map((student, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{student.name}</td>
                    <td className="p-2">{student.grade}</td>
                    {student.periodGrades.map((pg, idx) => (
                      <td key={idx} className="text-center p-2">
                        <Badge variant={pg.average >= 3.0 ? "default" : "destructive"}>
                          {pg.average || '--'}
                        </Badge>
                      </td>
                    ))}
                    <td className="text-center p-2">
                      <Badge variant={student.totalAverage >= 3.0 ? "default" : "destructive"}>
                        {student.totalAverage}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestión Masiva</CardTitle>
            <CardDescription>Administración de estudiantes en lote</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              Carga Masiva de Estudiantes
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Eliminar en Masa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Códigos y Permisos</CardTitle>
            <CardDescription>Gestión de accesos y descargas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Generar Códigos Boletines
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Habilitar Períodos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Proyectos Institucionales</CardTitle>
            <CardDescription>{activeProjects} proyectos activos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Ver Todos los Proyectos
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;