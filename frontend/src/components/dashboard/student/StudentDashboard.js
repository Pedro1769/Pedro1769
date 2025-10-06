import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import { studentService, gradeService, adminService } from '../../../services/api';
import { useToast } from '../../../hooks/use-toast';
import { 
  BookOpen, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Eye,
  EyeOff,
  Trophy,
  Target,
  Calendar
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentData, setStudentData] = useState(null);
  const [myGrades, setMyGrades] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudentData();
    loadSystemSettings();
  }, []);

  const loadStudentData = async () => {
    try {
      // En un sistema real, el estudiante tendría su propio ID
      // Por ahora usamos una búsqueda por nombre o documento
      const students = await studentService.getStudents();
      const myStudent = students.find(s => s.name.includes(user.name) || s.parent_id === user.id);
      
      if (myStudent) {
        setStudentData(myStudent);
        const grades = await gradeService.getStudentGrades(myStudent.id);
        setMyGrades(grades);
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSystemSettings = async () => {
    try {
      const systemSettings = await adminService.getSettings();
      setSettings(systemSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const calculateStatistics = () => {
    if (!myGrades || myGrades.length === 0) {
      return {
        average: 0,
        totalGrades: 0,
        performance: 'SIN DATOS',
        trend: 'neutral',
        periodAverages: {}
      };
    }

    const gradesByPeriod = {};
    myGrades.forEach(grade => {
      if (!gradesByPeriod[grade.period]) {
        gradesByPeriod[grade.period] = [];
      }
      gradesByPeriod[grade.period].push(grade.grade);
    });

    const periodAverages = Object.keys(gradesByPeriod).map(period => {
      const grades = gradesByPeriod[period];
      return {
        period,
        average: grades.reduce((sum, grade) => sum + grade, 0) / grades.length
      };
    });

    const totalAverage = periodAverages.reduce((sum, p) => sum + p.average, 0) / periodAverages.length;
    
    let performance = 'BAJO';
    if (totalAverage >= 4.6) performance = 'SUPERIOR';
    else if (totalAverage >= 4.0) performance = 'ALTO';
    else if (totalAverage >= 3.0) performance = 'BÁSICO';

    const trend = periodAverages.length > 1 
      ? (periodAverages[periodAverages.length - 1].average > periodAverages[0].average ? 'up' : 'down')
      : 'neutral';

    return {
      average: parseFloat(totalAverage.toFixed(1)),
      totalGrades: myGrades.length,
      performance,
      trend,
      periodAverages: gradesByPeriod,
      periodAveragesList: periodAverages
    };
  };

  const canViewGrades = () => {
    return settings.grades_visible_to_students?.value || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="space-y-6 pt-16">
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Perfil de estudiante no encontrado</h3>
            <p className="text-gray-500">
              No se pudo encontrar información académica asociada a su cuenta.
              Contacte al administrador para resolver este problema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = calculateStatistics();
  const gradesVisible = canViewGrades();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 relative overflow-hidden">
      {/* Elementos decorativos dinámicos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-cyan-400 to-sky-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-gradient-to-r from-sky-400 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-700"></div>
        <div className="absolute -bottom-8 left-1/2 w-80 h-80 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 space-y-6 pt-20 px-6">
        {/* Header mejorado */}
        <div className="mb-8 p-8 bg-gradient-to-r from-cyan-600/20 via-sky-600/15 to-blue-600/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-800 to-blue-800 bg-clip-text text-transparent">
                  Portal del Estudiante
                </h1>
                <div className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-2xl text-xl font-bold shadow-lg animate-bounce">
                  🎒 EST
                </div>
              </div>
              <p className="text-gray-700 font-medium text-lg">{user.name}</p>
              <div className="flex items-center space-x-3 mt-4">
                <div className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold">
                  📚 {studentData.grade}
                </div>
                <div className="px-3 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-gray-700 font-medium">
                  {studentData.level}
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Estadísticas del estudiante */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className={`text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 ${
          gradesVisible 
            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
            {gradesVisible ? (
              stats.trend === 'up' ? <TrendingUp className="h-4 w-4" /> :
              stats.trend === 'down' ? <TrendingDown className="h-4 w-4" /> :
              <BookOpen className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {gradesVisible ? stats.average : '--'}
            </div>
            <p className="text-xs opacity-90">
              {gradesVisible ? 'De 5.0 posibles' : 'No visible'}
            </p>
          </CardContent>
        </Card>

        <Card className={`text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 ${
          gradesVisible 
            ? (stats.performance === 'SUPERIOR' ? 'bg-gradient-to-br from-green-500 to-green-600' :
               stats.performance === 'ALTO' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
               stats.performance === 'BÁSICO' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
               'bg-gradient-to-br from-red-500 to-red-600')
            : 'bg-gradient-to-br from-gray-500 to-gray-600'
        }`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Desempeño</CardTitle>
            {gradesVisible ? <Trophy className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {gradesVisible ? stats.performance : 'OCULTO'}
            </div>
            <p className="text-xs opacity-90">Nivel actual</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mi Grado</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.grade}</div>
            <p className="text-xs text-purple-100">{studentData.level}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período Actual</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {settings.current_period?.value || 'I'}
            </div>
            <p className="text-xs text-orange-100">En curso</p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de visibilidad de notas */}
      <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {gradesVisible ? <Eye className="h-5 w-5 text-green-600" /> : <EyeOff className="h-5 w-5 text-red-600" />}
            <span>Estado de Notas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gradesVisible ? (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <Eye className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Notas Visibles</span>
              </div>
              <p className="text-green-700 text-sm">
                El administrador ha habilitado la visualización de notas para estudiantes.
                Puede consultar su rendimiento académico en tiempo real.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center space-x-2 mb-2">
                <EyeOff className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Notas No Disponibles</span>
              </div>
              <p className="text-red-700 text-sm">
                El administrador no ha habilitado la visualización de notas para estudiantes.
                Las notas estarán disponibles cuando el coordinador académico lo autorice.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rendimiento por período */}
      {gradesVisible && Object.keys(stats.periodAverages).length > 0 && (
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span>Mi Rendimiento Académico</span>
            </CardTitle>
            <CardDescription>
              Seguimiento de tu progreso por períodos académicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-700 mb-3">Promedios por Período:</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.periodAverages).map(([period, grades]) => {
                  const periodAverage = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
                  return (
                    <div key={period} className="text-center p-6 bg-gradient-to-br from-blue-50 to-red-50 rounded-xl border-2 border-white/50 shadow-md">
                      <div className="text-lg font-bold text-gray-700 mb-2">Período {period}</div>
                      <div className={`text-3xl font-bold mb-1 ${
                        periodAverage >= 4.6 ? 'text-green-600' :
                        periodAverage >= 4.0 ? 'text-blue-600' :
                        periodAverage >= 3.0 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {periodAverage.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">{grades.length} materias</div>
                      <Badge 
                        variant="secondary" 
                        className={`mt-2 ${
                          periodAverage >= 4.6 ? 'bg-green-100 text-green-800' :
                          periodAverage >= 4.0 ? 'bg-blue-100 text-blue-800' :
                          periodAverage >= 3.0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {periodAverage >= 4.6 ? 'Superior' :
                         periodAverage >= 4.0 ? 'Alto' :
                         periodAverage >= 3.0 ? 'Básico' : 'Bajo'}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              {/* Mensaje motivacional */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">💪 Mensaje Motivacional</h4>
                <p className="text-gray-700 text-sm">
                  {stats.average >= 4.6 
                    ? "¡Excelente trabajo! Mantén ese nivel de excelencia académica."
                    : stats.average >= 4.0 
                    ? "¡Muy bien! Estás en un nivel alto, sigue esforzándote."
                    : stats.average >= 3.0 
                    ? "Buen trabajo. Con un poco más de esfuerzo puedes alcanzar un nivel superior."
                    : "No te desanimes. Cada día es una nueva oportunidad para mejorar. ¡Tú puedes lograrlo!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información académica general */}
      <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-purple-600" />
            <span>Información Académica</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Datos del Estudiante</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{studentData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Grado:</span>
                  <span className="font-medium">{studentData.grade}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nivel:</span>
                  <span className="font-medium">{studentData.level}</span>
                </div>
                {gradesVisible && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de notas:</span>
                    <span className="font-medium">{stats.totalGrades}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-700 mb-3">Información Institucional</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Institución:</span>
                  <span className="font-medium text-xs">GIMNASIO AMERICANO DEL ATLÁNTICO</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período actual:</span>
                  <span className="font-medium">{settings.current_period?.value || 'I'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estado:</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;