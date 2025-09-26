import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { mockStudents, mockGrades, performanceScale, schoolInfo } from '../mock/mockData';
import ReportCardComponent from '../components/ReportCard';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [showReportCard, setShowReportCard] = useState(false);

  if (!user || user.role !== 'parent') {
    return <Navigate to="/login" />;
  }

  // Get children data
  const children = mockStudents.filter(student => 
    user.children?.includes(student.id)
  );

  const selectedChildData = children.find(child => child.id === parseInt(selectedChild));

  // Get grades for selected child and period
  const childGrades = selectedChild ? mockGrades.filter(
    grade => grade.studentId === parseInt(selectedChild) && 
             grade.period === parseInt(selectedPeriod)
  ) : [];

  // Calculate statistics
  const calculateAverage = (grades) => {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
  };

  const getPerformanceLevel = (grade, level) => {
    const scale = performanceScale[level] || performanceScale['Básica Secundaria'];
    
    for (const [performance, range] of Object.entries(scale)) {
      if (grade >= range.min && grade <= range.max) {
        return { level: performance, code: range.code };
      }
    }
    return { level: 'Bajo', code: 'Bj' };
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {children.map((child) => {
            const childAllGrades = mockGrades.filter(g => g.studentId === child.id);
            const average = calculateAverage(childAllGrades);
            const performance = getPerformanceLevel(average, child.level);

            return (
              <Card key={child.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedChild(child.id.toString())}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{child.name}</h3>
                      <p className="text-gray-600 text-sm">{child.grade} - {child.level}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Promedio General:</span>
                      <Badge variant={average >= 8 ? 'default' : average >= 6 ? 'secondary' : 'destructive'}>
                        {average.toFixed(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Desempeño:</span>
                      <Badge variant="outline">{performance.level}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Calificaciones:</span>
                      <span className="text-sm font-medium">{childAllGrades.length} registradas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Child Details */}
        {selectedChild && (
          <Tabs defaultValue="grades" className="space-y-6">
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="grades">Calificaciones</TabsTrigger>
                <TabsTrigger value="report">Boletín</TabsTrigger>
                <TabsTrigger value="attendance">Asistencia</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-4">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Primer Período</SelectItem>
                    <SelectItem value="2">Segundo Período</SelectItem>
                    <SelectItem value="3">Tercer Período</SelectItem>
                    <SelectItem value="4">Cuarto Período</SelectItem>
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
                    <Button onClick={() => setShowReportCard(true)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Boletín
                    </Button>
                    <Button variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
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

            <TabsContent value="attendance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Control de Asistencia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center bg-green-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-green-600">95%</div>
                      <p className="text-green-700">Asistencia General</p>
                    </div>
                    <div className="text-center bg-blue-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">2</div>
                      <p className="text-blue-700">Faltas Justificadas</p>
                    </div>
                    <div className="text-center bg-orange-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-orange-600">0</div>
                      <p className="text-orange-700">Faltas Injustificadas</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Registro de Asistencia - {selectedChildData?.name}</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 text-center">
                        Registro detallado de asistencia próximamente disponible
                      </p>
                    </div>
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