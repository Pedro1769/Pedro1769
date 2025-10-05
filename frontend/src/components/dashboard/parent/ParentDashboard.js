import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import { studentService, gradeService, bulletinService } from '../../../services/api';
import { useToast } from '../../../hooks/use-toast';
import { 
  Users, 
  BookOpen, 
  Download, 
  Eye,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Heart,
  Calendar
} from 'lucide-react';

const ParentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myChildren, setMyChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [bulletinCode, setBulletinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloadingBulletin, setDownloadingBulletin] = useState(false);

  useEffect(() => {
    loadMyChildren();
  }, []);

  const loadMyChildren = async () => {
    try {
      setLoading(true);
      const children = await studentService.getStudents({ parent_id: user.id });
      setMyChildren(children);
      if (children.length > 0) {
        setSelectedChild(children[0]);
        loadChildData(children[0]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (child) => {
    try {
      // Cargar notas del estudiante
      const grades = await gradeService.getStudentGrades(child.id);
      setSelectedChild({ ...child, grades });
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const downloadBulletinWithCode = async () => {
    if (!bulletinCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese el código de descarga",
        variant: "destructive",
      });
      return;
    }

    try {
      setDownloadingBulletin(true);
      const response = await bulletinService.downloadBulletinWithCode(bulletinCode);
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `boletin_${bulletinCode}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Descarga exitosa",
        description: "Boletín descargado correctamente",
      });
      setBulletinCode('');
    } catch (error) {
      const message = error.response?.data?.detail || 'Error al descargar el boletín';
      toast({
        title: "Error de descarga",
        description: message,
        variant: "destructive",
      });
    } finally {
      setDownloadingBulletin(false);
    }
  };

  const calculateChildStatistics = (child) => {
    if (!child.grades || child.grades.length === 0) {
      return {
        average: 0,
        totalGrades: 0,
        performance: 'SIN DATOS',
        trend: 'neutral'
      };
    }

    const gradesByPeriod = {};
    child.grades.forEach(grade => {
      if (!gradesByPeriod[grade.period]) {
        gradesByPeriod[grade.period] = [];
      }
      gradesByPeriod[grade.period].push(grade.grade);
    });

    const periodAverages = Object.keys(gradesByPeriod).map(period => {
      const grades = gradesByPeriod[period];
      return grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    });

    const totalAverage = periodAverages.reduce((sum, avg) => sum + avg, 0) / periodAverages.length;
    
    let performance = 'BAJO';
    if (totalAverage >= 4.6) performance = 'SUPERIOR';
    else if (totalAverage >= 4.0) performance = 'ALTO';
    else if (totalAverage >= 3.0) performance = 'BÁSICO';

    const trend = periodAverages.length > 1 
      ? (periodAverages[periodAverages.length - 1] > periodAverages[0] ? 'up' : 'down')
      : 'neutral';

    return {
      average: parseFloat(totalAverage.toFixed(1)),
      totalGrades: child.grades.length,
      performance,
      trend,
      periodAverages: gradesByPeriod
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const childStats = selectedChild ? calculateChildStatistics(selectedChild) : null;

  return (
    <div className="space-y-6 pt-16 bg-gradient-to-br from-blue-50/30 via-white to-red-50/30 min-h-screen">
      {/* Header */}
      <div className="mb-8 p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-white/20">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-red-800 bg-clip-text text-transparent mb-2">
          Panel de Padre/Acudiente
        </h1>
        <p className="text-gray-600">{user.name}</p>
        <p className="text-sm text-blue-600">Seguimiento académico de sus hijos</p>
      </div>

      {myChildren.length === 0 ? (
        <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
          <CardContent className="text-center py-16">
            <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay estudiantes registrados</h3>
            <p className="text-gray-500">
              No se encontraron estudiantes asociados a su cuenta. 
              Contacte al administrador para vincular a sus hijos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Selector de hijo */}
          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Mis Hijos</span>
              </CardTitle>
              <CardDescription>
                Seleccione el estudiante para ver su información académica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {myChildren.map((child) => (
                  <Button
                    key={child.id}
                    variant={selectedChild?.id === child.id ? "default" : "outline"}
                    onClick={() => {
                      setSelectedChild(child);
                      loadChildData(child);
                    }}
                    className={`transition-all duration-300 ${
                      selectedChild?.id === child.id 
                        ? 'bg-gradient-to-r from-blue-600 to-red-600 text-white shadow-lg scale-105' 
                        : 'hover:scale-105'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    {child.name} - {child.grade}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedChild && childStats && (
            <>
              {/* Estadísticas del estudiante */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio General</CardTitle>
                    {childStats.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                    {childStats.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                    {childStats.trend === 'neutral' && <BookOpen className="h-4 w-4" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{childStats.average}</div>
                    <p className="text-xs text-blue-100">De 5.0 posibles</p>
                  </CardContent>
                </Card>

                <Card className={`text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  childStats.performance === 'SUPERIOR' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  childStats.performance === 'ALTO' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  childStats.performance === 'BÁSICO' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Desempeño</CardTitle>
                    <TrendingUp className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">{childStats.performance}</div>
                    <p className="text-xs opacity-90">Nivel actual</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Notas</CardTitle>
                    <BookOpen className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{childStats.totalGrades}</div>
                    <p className="text-xs text-purple-100">Registradas</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg transform hover:scale-105 transition-all duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Grado</CardTitle>
                    <Calendar className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedChild.grade}</div>
                    <p className="text-xs text-orange-100">{selectedChild.level}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Información detallada del estudiante */}
              <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span>Información Académica - {selectedChild.name}</span>
                  </CardTitle>
                  <CardDescription>
                    Seguimiento del rendimiento académico por período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {Object.keys(childStats.periodAverages).length > 0 ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700 mb-3">Promedios por Período:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(childStats.periodAverages).map(([period, grades]) => {
                          const periodAverage = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
                          return (
                            <div key={period} className="text-center p-4 bg-gradient-to-br from-blue-50 to-red-50 rounded-xl border">
                              <div className="text-lg font-bold text-gray-700">Período {period}</div>
                              <div className={`text-2xl font-bold ${
                                periodAverage >= 4.0 ? 'text-green-600' : 
                                periodAverage >= 3.0 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {periodAverage.toFixed(1)}
                              </div>
                              <div className="text-sm text-gray-500">{grades.length} materias</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay notas registradas aún</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {/* Descarga de boletines */}
          <Card className="bg-white/80 backdrop-blur-md border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="h-5 w-5 text-green-600" />
                <span>Descargar Boletín</span>
              </CardTitle>
              <CardDescription>
                Ingrese el código proporcionado por el coordinador académico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Código de descarga (ej: ABC12345)"
                    value={bulletinCode}
                    onChange={(e) => setBulletinCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg"
                  />
                </div>
                <Button 
                  onClick={downloadBulletinWithCode}
                  disabled={downloadingBulletin || !bulletinCode.trim()}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg transition-all duration-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {downloadingBulletin ? 'Descargando...' : 'Descargar Boletín'}
                </Button>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Instrucciones:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Solicite el código de descarga al coordinador académico</li>
                  <li>• El código es único para cada estudiante y período</li>
                  <li>• Los códigos tienen fecha de vencimiento</li>
                  <li>• Contacte al colegio si tiene problemas con la descarga</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ParentDashboard;