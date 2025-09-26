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
  User,
  Trophy,
  Target,
  Clock,
  Star
} from 'lucide-react';
import { mockGrades, performanceScale, schoolInfo } from '../mock/mockData';
import ReportCardComponent from '../components/ReportCard';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [showReportCard, setShowReportCard] = useState(false);

  if (!user || user.role !== 'student') {
    return <Navigate to="/login" />;
  }

  // Get student grades for selected period
  const studentGrades = mockGrades.filter(
    grade => grade.studentId === user.studentId && 
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
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Boletín
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
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Primer Período</SelectItem>
                      <SelectItem value="2">Segundo Período</SelectItem>
                      <SelectItem value="3">Tercer Período</SelectItem>
                      <SelectItem value="4">Cuarto Período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-6">
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
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Gráfico de Progreso</p>
                  <p className="text-sm">Aquí podrás ver tu evolución académica a lo largo del año</p>
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
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">¡Sigue esforzándote!</p>
                  <p className="text-sm">Tus logros y reconocimientos aparecerán aquí</p>
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
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Download className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Descargar Boletín</p>
                    <Button variant="outline" disabled>
                      Próximamente
                    </Button>
                  </div>
                  
                  <div className="text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-gray-600 mb-2">Historial Académico</p>
                    <Button variant="outline" disabled>
                      Próximamente
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
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