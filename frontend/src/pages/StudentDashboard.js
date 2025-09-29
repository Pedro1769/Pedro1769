import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Download,
  Eye,
  Calendar,
  User,
  Trophy,
  Target,
  Clock,
  Star,
  CheckCircle,
  Lock,
  AlertCircle,
  Shield
} from 'lucide-react';
import { mockGrades, performanceScale, schoolInfo } from '../mock/mockData';
import ReportCardComponent from '../components/ReportCard';
import TalleresAsistidos from '../components/TalleresAsistidos';
import ApiService from '../services/apiService';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [showReportCard, setShowReportCard] = useState(false);
  const [permissions, setPermissions] = useState({
    grades_enabled: false,
    grades_periods: [],
    period_enabled: false,
    bulletin_download_enabled: false
  });
  const [loadingPermissions, setLoadingPermissions] = useState(true);

  useEffect(() => {
    loadStudentPermissions();
  }, [selectedPeriod]);

  const loadStudentPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const studentId = user.studentId || user.id;
      const perms = await ApiService.getStudentPermissions(studentId, selectedPeriod);
      setPermissions(perms);
      console.log('Permisos cargados para estudiante:', perms);
    } catch (error) {
      console.error('Error cargando permisos:', error);
      // Usar valores por defecto restrictivos si hay error
      setPermissions({
        grades_enabled: false,
        grades_periods: [],
        period_enabled: false,
        bulletin_download_enabled: false
      });
    } finally {
      setLoadingPermissions(false);
    }
  };

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" />;
  }

  // Get student grades for selected period
  const studentGrades = mockGrades.filter(
    grade => grade.studentId === (user.studentId || user.id) && 
             grade.period === parseInt(selectedPeriod)
  );

  // Calculate statistics
  const calculateAverage = (grades) => {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
  };

  const getPerformanceLevel = (grade) => {
    if (grade >= 9.0) return { level: 'Superior', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (grade >= 8.0) return { level: 'Alto', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (grade >= 7.0) return { level: 'Básico', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { level: 'Bajo', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const average = calculateAverage(studentGrades);
  const performance = getPerformanceLevel(average);

  const stats = {
    subjects: studentGrades.length,
    average: average.toFixed(1),
    performance: performance.level,
    period: selectedPeriod
  };

  // Group grades by subject
  const subjectGrades = studentGrades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = [];
    }
    acc[grade.subject].push(grade);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-institutional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
              Mi Panel Estudiantil
            </h1>
            <p className="text-gray-600 mt-2">Bienvenido/a, {user.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors">
                Grado: {user.grade || 'N/A'}
              </Badge>
              <Badge variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 transition-colors">
                Documento: {user.document}
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✅ Acceso Total Habilitado
              </Badge>
            </div>
            
            {/* Mensaje de acceso total */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">🎓 ACCESO ESTUDIANTIL COMPLETO</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Tienes acceso completo a todas tus calificaciones, reportes, boletines, logros y progreso académico en todos los períodos sin restricciones.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Materias</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.subjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 via-teal-100 to-teal-50 border-teal-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-700">Promedio</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.average}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${performance.bgColor} border-gray-200 hover-gradient card-institutional`}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className={`h-8 w-8 ${performance.color}`} />
                <div className="ml-4">
                  <p className={`text-sm font-medium ${performance.color}`}>Rendimiento</p>
                  <p className={`text-xl font-bold ${performance.color}`}>{stats.performance}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 border-purple-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-700">Período</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.period}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="grades" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="grades" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Mis Calificaciones
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Mi Progreso
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Logros
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Convivencia
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Boletín
            </TabsTrigger>
            <TabsTrigger value="homework" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Tareas
            </TabsTrigger>
            <TabsTrigger value="talleres" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Talleres Asistidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-teal-50 rounded-t-lg">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                    Calificaciones por Período
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-2">
                  {permissions.grades_enabled && (
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        {permissions.grades_periods.map(period => (
                          <SelectItem key={period} value={period}>
                            Período {period}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loadingPermissions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando permisos...</p>
                  </div>
                ) : !permissions.grades_enabled ? (
                  <Alert className="border-orange-200 bg-orange-50">
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="text-orange-700">
                      <div className="space-y-2">
                        <p><strong>Acceso Restringido</strong></p>
                        <p>Las calificaciones no están disponibles en este momento. El administrador debe habilitar el acceso para poder visualizar tus calificaciones.</p>
                        <div className="flex items-center mt-3 text-sm">
                          <Shield className="h-4 w-4 mr-2" />
                          <span>Contacta con la administración para más información.</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : !permissions.period_enabled ? (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-yellow-700">
                      <div className="space-y-2">
                        <p><strong>Período No Disponible</strong></p>
                        <p>El período {selectedPeriod} no está habilitado para consulta.</p>
                        <p>Períodos disponibles: {permissions.grades_periods.join(', ')}</p>
                      </div>
                    </AlertDescription>
                  </Alert>
                ) : (
                {studentGrades.length > 0 ? (
                  <div className="grid gap-4">
                    {Object.entries(subjectGrades).map(([subject, grades]) => {
                      const subjectAverage = calculateAverage(grades);
                      const subjectPerformance = getPerformanceLevel(subjectAverage);
                      
                      return (
                        <Card key={subject} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-gray-800">{subject}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={`${subjectPerformance.bgColor} ${subjectPerformance.color} border-0`}>
                                  {subjectAverage.toFixed(1)}
                                </Badge>
                                <Badge variant="outline" className={`${subjectPerformance.color} border-current`}>
                                  {subjectPerformance.level}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              {grades.map((grade, index) => (
                                <div key={index} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600">Calificación {index + 1}:</span>
                                  <span className="font-medium">{grade.grade.toFixed(1)}</span>
                                </div>
                              ))}
                              {grades[0]?.description && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm text-gray-700">
                                    <strong>Observaciones:</strong> {grades[0].description}
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No hay calificaciones disponibles</p>
                    <p className="text-sm">Las calificaciones aparecerán aquí una vez que sean registradas por tus profesores</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                  Mi Progreso Académico
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Visualiza tu evolución académica completa en todos los períodos
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Gráfico de progreso simulado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 border-2 border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-3">Evolución por Períodos</h4>
                      <div className="space-y-2">
                        {['1er Período', '2do Período', '3er Período', '4to Período'].map((periodo, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{periodo}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" 
                                  style={{width: `${85 + index * 3}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{(8.5 + index * 0.3).toFixed(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-2 border-teal-200">
                      <h4 className="font-medium text-teal-800 mb-3">Materias Destacadas</h4>
                      <div className="space-y-2">
                        {['Matemáticas', 'Español', 'Ciencias', 'Inglés'].map((materia, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{materia}</span>
                            <Badge className="bg-green-100 text-green-800">
                              {(9.2 - index * 0.2).toFixed(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Target className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Progreso Académico Activado</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Seguimiento completo habilitado para todos los períodos y materias.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-600" />
                  Mis Logros y Reconocimientos
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Celebra tus éxitos académicos y reconocimientos especiales
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Logros académicos */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4 text-center border-2 border-yellow-200 bg-yellow-50">
                      <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                      <h4 className="font-medium text-yellow-800 mb-1">Excelencia Académica</h4>
                      <p className="text-xs text-yellow-700">Promedio superior a 9.0</p>
                      <Badge className="mt-2 bg-yellow-200 text-yellow-800">Primer Período</Badge>
                    </Card>
                    
                    <Card className="p-4 text-center border-2 border-blue-200 bg-blue-50">
                      <Star className="h-12 w-12 mx-auto mb-3 text-blue-600" />
                      <h4 className="font-medium text-blue-800 mb-1">Estudiante Destacado</h4>
                      <p className="text-xs text-blue-700">Comportamiento ejemplar</p>
                      <Badge className="mt-2 bg-blue-200 text-blue-800">Convivencia</Badge>
                    </Card>
                    
                    <Card className="p-4 text-center border-2 border-green-200 bg-green-50">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 text-green-600" />
                      <h4 className="font-medium text-green-800 mb-1">Participación Activa</h4>
                      <p className="text-xs text-green-700">Liderazgo en actividades</p>
                      <Badge className="mt-2 bg-green-200 text-green-800">Extracurricular</Badge>
                    </Card>
                  </div>
                  
                  {/* Certificaciones */}
                  <Card className="p-4 border-2 border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-3">Certificaciones y Diplomas</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 text-purple-600 mr-2" />
                          <span className="text-sm">Certificado de Inglés Básico</span>
                        </div>
                        <Button size="sm" variant="outline" className="border-purple-300 text-purple-600">
                          <Download className="mr-1 h-3 w-3" />
                          Descargar
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 bg-purple-50 rounded">
                        <div className="flex items-center">
                          <Trophy className="h-4 w-4 text-purple-600 mr-2" />
                          <span className="text-sm">Diploma Mejor Compañero</span>
                        </div>
                        <Button size="sm" variant="outline" className="border-purple-300 text-purple-600">
                          <Download className="mr-1 h-3 w-3" />
                          Descargar
                        </Button>
                      </div>
                    </div>
                  </Card>
                  
                  <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-yellow-800 font-medium">Sistema de Logros Activo</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      Todos tus logros, certificaciones y reconocimientos están habilitados para visualización y descarga.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-purple-600" />
                  Mi Comportamiento y Convivencia
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Seguimiento de mi comportamiento escolar y reconocimientos
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4 text-center border-2 border-green-200 bg-green-50">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-medium text-green-800">Comportamiento Excelente</h4>
                    <p className="text-sm text-green-700 mt-1">Sin observaciones negativas</p>
                  </Card>
                  
                  <Card className="p-4 text-center border-2 border-blue-200 bg-blue-50">
                    <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-medium text-blue-800">Reconocimientos</h4>
                    <p className="text-sm text-blue-700 mt-1">3 menciones positivas</p>
                  </Card>
                  
                  <Card className="p-4 text-center border-2 border-orange-200 bg-orange-50">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <h4 className="font-medium text-orange-800">Asistencia</h4>
                    <p className="text-sm text-orange-700 mt-1">95% puntualidad</p>
                  </Card>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Nota de Convivencia - Período {selectedPeriod}</h4>
                  <p className="text-sm text-purple-700">
                    Has demostrado un excelente comportamiento durante este período, mostrando respeto hacia tus compañeros y docentes. 
                    Tu participación en actividades grupales ha sido destacada. ¡Sigue así!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="homework" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5 text-indigo-600" />
                  Mis Tareas y Actividades
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Seguimiento de tareas asignadas y actividades pendientes
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Card className="p-4 border-l-4 border-red-500 bg-red-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-red-800">Matemáticas - Ejercicios Cap. 5</h4>
                        <p className="text-sm text-red-700 mt-1">
                          Resolver ejercicios del 15 al 30 del capítulo de ecuaciones lineales
                        </p>
                        <p className="text-xs text-red-600 mt-2">Fecha límite: Mañana</p>
                      </div>
                      <Badge className="bg-red-200 text-red-800 text-xs">Pendiente</Badge>
                    </div>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-yellow-500 bg-yellow-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-yellow-800">Español - Ensayo</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Escribir ensayo de 500 palabras sobre "El medio ambiente en mi comunidad"
                        </p>
                        <p className="text-xs text-yellow-600 mt-2">Fecha límite: Viernes</p>
                      </div>
                      <Badge className="bg-yellow-200 text-yellow-800 text-xs">En Progreso</Badge>
                    </div>
                  </Card>
                  
                  <Card className="p-4 border-l-4 border-green-500 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-green-800">Ciencias - Laboratorio</h4>
                        <p className="text-sm text-green-700 mt-1">
                          Informe del experimento sobre densidad de líquidos realizado en clase
                        </p>
                        <p className="text-xs text-green-600 mt-2">Entregado el: Lunes pasado</p>
                      </div>
                      <Badge className="bg-green-200 text-green-800 text-xs">Completado</Badge>
                    </div>
                  </Card>
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-indigo-600 mr-2" />
                    <span className="text-indigo-800 font-medium">Sistema de Tareas Completamente Habilitado</span>
                  </div>
                  <p className="text-sm text-indigo-700 mt-1">
                    Acceso total a todas las tareas, fechas límite y seguimiento de actividades académicas.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    <GraduationCap className="mr-2 h-5 w-5 text-purple-600" />
                    Mi Boletín de Calificaciones
                  </CardTitle>
                  <Button 
                    onClick={() => setShowReportCard(true)}
                    className="bg-gradient-gada text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Boletín
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="text-center p-6 border-2 border-blue-200 hover:border-blue-400 transition-colors hover:shadow-lg">
                    <Download className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <p className="text-sm text-gray-700 mb-2 font-medium">Descargar Boletín</p>
                    <Button className="bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:shadow-lg">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </Card>
                  
                  <Card className="text-center p-6 border-2 border-green-200 hover:border-green-400 transition-colors hover:shadow-lg">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-sm text-gray-700 mb-2 font-medium">Historial Académico</p>
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg">
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Historial
                    </Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="talleres" className="space-y-6">
            <TalleresAsistidos user={user} />
          </TabsContent>
        </Tabs>

        {/* Report Card Modal */}
        {showReportCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-lg font-semibold">Boletín de Calificaciones</h2>
                <Button variant="ghost" onClick={() => setShowReportCard(false)}>
                  ✕
                </Button>
              </div>
              <ReportCardComponent 
                studentData={{
                  id: user.studentId,
                  name: user.name,
                  document: user.document,
                  grade: user.grade,
                  level: user.level || 'N/A'
                }}
                period={parseInt(selectedPeriod)}
                schoolInfo={schoolInfo}
                performanceScale={performanceScale}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;