import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { 
  GraduationCap, 
  BookOpen, 
  TrendingUp,
  Download,
  Eye,
  Calendar,
  User,
  Star,
  Trophy,
  MessageSquare,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react';
import { mockStudents, mockGrades, performanceScale, schoolInfo } from '../mock/mockData';
import { StudentsManager, PeriodsManager } from '../utils/dataManager';
import ReportCardComponent from '../components/ReportCard';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [showReportCard, setShowReportCard] = useState(false);
  const [children, setChildren] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    // Cargar períodos
    const loadedPeriods = PeriodsManager.getAll();
    setPeriods(loadedPeriods);
    
    // Cargar todos los estudiantes (mock + registrados)
    const students = [...mockStudents, ...StudentsManager.getAll()];
    setAllStudents(students);
    
    // Para efectos de demostración, mostrar algunos estudiantes como hijos
    // En un sistema real, esto se basaría en la relación padre-estudiante
    const demoChildren = students.slice(0, 3).map(student => ({
      ...student,
      parentId: user.id // Simular relación padre-hijo
    }));
    
    setChildren(demoChildren);
    
    // Seleccionar el primer hijo por defecto
    if (demoChildren.length > 0 && !selectedChild) {
      setSelectedChild(demoChildren[0].id.toString());
    }
  }, [user, selectedChild]);

  if (!user || user.role !== 'parent') {
    return <Navigate to="/login" />;
  }

  const selectedChildData = children && children.length > 0 && selectedChild 
    ? children.find(child => child && child.id === parseInt(selectedChild))
    : null;

  // Get grades for selected child and period
  const childGrades = selectedChild && mockGrades ? mockGrades.filter(
    grade => grade.studentId === parseInt(selectedChild) && 
             grade.period === parseInt(selectedPeriod)
  ) : [];

  // Calculate statistics with safe checks
  const calculateAverage = (grades) => {
    if (!grades || grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + (grade.grade || 0), 0) / grades.length;
  };

  const getPerformanceLevel = (grade, level) => {
    if (!performanceScale || !level) return { level: 'N/A', code: 'N/A' };
    
    const scale = performanceScale[level] || performanceScale['Básica Secundaria'] || {};
    
    for (const [performance, range] of Object.entries(scale)) {
      if (range && grade >= range.min && grade <= range.max) {
        return { level: performance, code: range.code };
      }
    }
    return { level: 'N/A', code: 'N/A' };
  };

  return (
    <div className="min-h-screen bg-institutional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">Panel de Padres</h1>
            <p className="text-gray-600 mt-2">Bienvenido/a, {user.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Padre de Familia
              </Badge>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                ✅ Acceso Total a Información Académica
              </Badge>
            </div>
            
            {/* Mensaje de acceso completo */}
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
              <div className="flex items-center">
                <User className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-purple-800 font-medium">👨‍👩‍👧‍👦 ACCESO PARENTAL COMPLETO</span>
              </div>
              <p className="text-sm text-purple-700 mt-1">
                Acceso total a calificaciones, reportes, boletines, progreso académico y comunicaciones de todos sus hijos en todos los períodos escolares.
              </p>
            </div>
          </div>
        </div>

        {/* Children Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {children && children.length > 0 ? children.map((child) => {
            const childGradesForStats = mockGrades ? mockGrades.filter(g => g.studentId === child.id) : [];
            const average = calculateAverage(childGradesForStats);
            const performance = getPerformanceLevel(average, child.level || 'Básica Secundaria');

            return (
              <Card 
                key={child.id} 
                className={`cursor-pointer transition-all duration-300 card-institutional hover-gradient ${
                  selectedChild === child.id.toString() 
                    ? 'ring-2 ring-blue-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedChild(child.id.toString())}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      {(child.name || 'N').charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{child.name || 'Nombre no disponible'}</h3>
                      <p className="text-sm text-gray-600">Grado: {child.grade || 'N/A'}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          Promedio: {average.toFixed(1)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {performance.level}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          }) : (
            <Card className="col-span-3 p-8 text-center text-gray-500">
              <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron estudiantes asociados</p>
              <p className="text-sm">Los estudiantes aparecerán aquí cuando estén registrados</p>
            </Card>
          )}
        </div>

        {/* Child Details */}
        {selectedChild && (
          <Tabs defaultValue="grades" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200">
                <TabsTrigger value="grades" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                  Calificaciones
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                  Progreso Académico
                </TabsTrigger>
                <TabsTrigger value="behavior" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                  Convivencia
                </TabsTrigger>
                <TabsTrigger value="report" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                  Boletín
                </TabsTrigger>
                <TabsTrigger value="communication" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
                  Comunicaciones
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-4">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ✅ Todas las sesiones habilitadas
                </Badge>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods && periods.length > 0 ? periods.map((period) => (
                      <SelectItem key={period.id} value={period.id.toString()}>
                        {period.name || `Período ${period.id}`}
                      </SelectItem>
                    )) : (
                      <SelectItem value="1">Primer Período</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="grades" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    {selectedChildData?.name} - Período {selectedPeriod}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {childGrades.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-3">Materia</th>
                            <th className="text-left p-3">Calificación</th>
                            <th className="text-left p-3">Desempeño</th>
                            <th className="text-left p-3">Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {childGrades.map((grade, index) => {
                            const performance = getPerformanceLevel(grade.grade, selectedChildData?.level);
                            return (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="p-3 font-medium">{grade.subject}</td>
                                <td className="p-3">
                                  <Badge variant={grade.grade >= 8 ? 'default' : grade.grade >= 6 ? 'secondary' : 'destructive'}>
                                    {grade.grade.toFixed(1)}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <Badge variant="outline">{performance.level}</Badge>
                                </td>
                                <td className="p-3 text-gray-600">{grade.description}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {/* Summary */}
                      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {calculateAverage(childGrades).toFixed(1)}
                            </div>
                            <p className="text-sm text-gray-600">Promedio del Período</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {childGrades.filter(g => g.grade >= 8).length}
                            </div>
                            <p className="text-sm text-gray-600">Materias Sobresalientes</p>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                              {childGrades.filter(g => g.grade < 6).length}
                            </div>
                            <p className="text-sm text-gray-600">Materias a Mejorar</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay calificaciones registradas para este período</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="report" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Boletín de Calificaciones
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => setShowReportCard(true)}
                      className="bg-gradient-gada text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Boletín Completo
                    </Button>
                    <Button 
                      className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Descargar Boletín
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-blue-300 text-blue-600 hover:bg-blue-50"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Historial Académico
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedChildData && (
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Información del Estudiante</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Nombre:</strong> {selectedChildData.name}
                          </div>
                          <div>
                            <strong>Grado:</strong> {selectedChildData.grade}
                          </div>
                          <div>
                            <strong>Nivel:</strong> {selectedChildData.level}
                          </div>
                          <div>
                            <strong>Año Académico:</strong> {selectedChildData.academicYear}
                          </div>
                        </div>
                      </div>

                      <div className="text-center text-gray-600">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p>Haga clic en "Ver Boletín" para visualizar el boletín completo</p>
                        <p className="text-sm">o "Descargar PDF" para obtener una copia en formato PDF</p>
                      </div>
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
                    Progreso Académico de {selectedChildData?.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Evolución académica completa en todos los períodos
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4 border-2 border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-3">Evolución por Períodos</h4>
                      <div className="space-y-2">
                        {periods && periods.length > 0 ? periods.map((period, index) => (
                          <div key={period.id} className="flex items-center justify-between">
                            <span className="text-sm">{period.name || `Período ${period.id}`}</span>
                            <div className="flex items-center space-x-2">
                              <div className="w-24 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full" 
                                  style={{width: `${75 + index * 5}%`}}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{(7.5 + index * 0.5).toFixed(1)}</span>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-gray-500">No hay períodos disponibles</p>
                        )}
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-2 border-teal-200">
                      <h4 className="font-medium text-teal-800 mb-3">Materias Destacadas</h4>
                      <div className="space-y-2">
                        {['Matemáticas', 'Español', 'Ciencias', 'Inglés'].map((materia, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{materia}</span>
                            <Badge className="bg-green-100 text-green-800">
                              {(9.0 - index * 0.3).toFixed(1)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Seguimiento Académico Completo Habilitado</span>
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
                    Convivencia y Comportamiento
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Seguimiento comportamental y notas de convivencia
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="p-4 text-center border-2 border-green-200 bg-green-50">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <h4 className="font-medium text-green-800">Comportamiento Excelente</h4>
                      <p className="text-sm text-green-700 mt-1">Sin incidentes reportados</p>
                    </Card>
                    
                    <Card className="p-4 text-center border-2 border-blue-200 bg-blue-50">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-medium text-blue-800">Reconocimientos</h4>
                      <p className="text-sm text-blue-700 mt-1">3 menciones positivas</p>
                    </Card>
                    
                    <Card className="p-4 text-center border-2 border-orange-200 bg-orange-50">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <h4 className="font-medium text-orange-800">Puntualidad</h4>
                      <p className="text-sm text-orange-700 mt-1">95% de asistencia</p>
                    </Card>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Nota de Convivencia - Período {selectedPeriod}</h4>
                    <p className="text-sm text-purple-700">
                      El estudiante {selectedChildData?.name} ha demostrado un excelente comportamiento durante este período, 
                      mostrando respeto hacia sus compañeros y docentes. Su participación en actividades grupales ha sido destacada.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="communication" className="space-y-6">
              <Card className="shadow-lg border-0 card-institutional">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-orange-600" />
                    Comunicaciones y Notificaciones
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Mensajes del colegio, citaciones y comunicados importantes
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Card className="p-4 border-l-4 border-green-500 bg-green-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-green-800">Felicitación Académica</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Su hijo {selectedChildData?.name} ha obtenido excelentes resultados en el período actual. ¡Felicitaciones!
                          </p>
                          <p className="text-xs text-green-600 mt-2">Enviado por: Coordinación Académica</p>
                        </div>
                        <Badge className="bg-green-200 text-green-800 text-xs">Hoy</Badge>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-l-4 border-blue-500 bg-blue-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-blue-800">Reunión de Padres</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Cordial invitación a la reunión de padres de familia del grado {selectedChildData?.grade} 
                            programada para el viernes 28 de enero a las 2:00 PM.
                          </p>
                          <p className="text-xs text-blue-600 mt-2">Enviado por: Dirección de Grupo</p>
                        </div>
                        <Badge className="bg-blue-200 text-blue-800 text-xs">2 días</Badge>
                      </div>
                    </Card>
                    
                    <Card className="p-4 border-l-4 border-purple-500 bg-purple-50">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-purple-800">Actividad Extracurricular</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Inscripciones abiertas para el taller de ciencias. Su hijo está invitado a participar.
                          </p>
                          <p className="text-xs text-purple-600 mt-2">Enviado por: Coordinación Extracurricular</p>
                        </div>
                        <Badge className="bg-purple-200 text-purple-800 text-xs">1 semana</Badge>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mt-6 text-center">
                    <Button className="bg-gradient-gada text-white hover:shadow-lg">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ver Todas las Comunicaciones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Report Card Modal/Component */}
        {showReportCard && selectedChildData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Boletín de Calificaciones</h3>
                <Button variant="ghost" onClick={() => setShowReportCard(false)}>
                  ✕
                </Button>
              </div>
              <ReportCardComponent 
                student={selectedChildData}
                period={parseInt(selectedPeriod)}
                grades={childGrades}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;