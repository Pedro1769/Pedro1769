import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Download, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Users,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';
import { StudentsManager, GradesManager, PeriodsManager } from '../utils/dataManager';
import { performanceScale } from '../mock/mockData';

const GradeConsolidation = ({ onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [consolidatedData, setConsolidatedData] = useState([]);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    setStudents(StudentsManager.getAll());
    setPeriods(PeriodsManager.getAll());
  }, []);

  const getPerformanceLevel = (grade, studentGrade) => {
    if (!grade) return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
    
    const scale = studentGrade === '11°' ? performanceScale['grado_11'] : performanceScale['default'];
    if (!scale) return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
    
    for (const [performance, range] of Object.entries(scale)) {
      if (grade >= range.min && grade <= range.max) {
        return { level: performance, code: range.code };
      }
    }
    return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
  };

  const calculateStudentAverage = (studentId, periodFilter = null) => {
    const allGrades = GradesManager.getAll();
    let studentGrades = allGrades.filter(g => g.studentId === studentId);
    
    if (periodFilter && periodFilter !== 'all') {
      studentGrades = studentGrades.filter(g => g.period === parseInt(periodFilter));
    }
    
    if (studentGrades.length === 0) return 0;
    return studentGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / studentGrades.length;
  };

  const calculatePeriodAverages = (studentId) => {
    const periodAverages = {};
    for (let period = 1; period <= 4; period++) {
      periodAverages[period] = calculateStudentAverage(studentId, period.toString());
    }
    return periodAverages;
  };

  const generateConsolidation = () => {
    let filteredStudents = students;
    
    if (selectedGrade && selectedGrade !== 'all') {
      filteredStudents = students.filter(s => s.grade === selectedGrade);
    }

    const consolidated = filteredStudents.map(student => {
      const periodAverages = calculatePeriodAverages(student.id);
      const overallAverage = Object.values(periodAverages).reduce((sum, avg) => sum + avg, 0) / 4;
      const performance = getPerformanceLevel(overallAverage, student.grade);
      
      // Determinar estado del estudiante
      let status = 'APROBADO';
      let failedPeriods = 0;
      
      Object.values(periodAverages).forEach(avg => {
        if (avg < 3.3) failedPeriods++;
      });
      
      if (failedPeriods >= 3) {
        status = 'REPRUEBA AÑO';
      } else if (failedPeriods === 2) {
        status = 'OPORTUNIDAD';
      } else if (failedPeriods === 1) {
        status = 'EN OBSERVACIÓN';
      }
      
      return {
        student,
        periodAverages,
        overallAverage,
        performance,
        status,
        failedPeriods
      };
    });

    // Ordenar por promedio general descendente
    consolidated.sort((a, b) => b.overallAverage - a.overallAverage);
    setConsolidatedData(consolidated);
  };

  useEffect(() => {
    if (students.length > 0) {
      generateConsolidation();
    }
  }, [selectedGrade, selectedPeriod, students]);

  const exportConsolidation = () => {
    const data = {
      consolidation: consolidatedData,
      filters: { grade: selectedGrade, period: selectedPeriod },
      generated: new Date().toISOString(),
      institution: 'Gimnasio Americano del Atlántico Sede 2'
    };
    
    // Crear CSV
    const csvHeaders = [
      'Estudiante', 'Grado', 'Nivel', 'Documento',
      'Período 1', 'Período 2', 'Período 3', 'Período 4',
      'Promedio General', 'Desempeño', 'Estado Académico'
    ];
    
    const csvRows = consolidatedData.map(item => [
      item.student.name,
      item.student.grade,
      item.student.level,
      item.student.document,
      item.periodAverages[1].toFixed(1),
      item.periodAverages[2].toFixed(1),
      item.periodAverages[3].toFixed(1),
      item.periodAverages[4].toFixed(1),
      item.overallAverage.toFixed(1),
      item.performance.level,
      item.status
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `consolidado_${selectedGrade || 'todos'}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APROBADO':
        return 'bg-green-100 text-green-800';
      case 'EN OBSERVACIÓN':
        return 'bg-yellow-100 text-yellow-800';
      case 'OPORTUNIDAD':
        return 'bg-orange-100 text-orange-800';
      case 'REPRUEBA AÑO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const gradeOptions = ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

  // Estadísticas generales
  const stats = {
    total: consolidatedData.length,
    approved: consolidatedData.filter(item => item.status === 'APROBADO').length,
    observation: consolidatedData.filter(item => item.status === 'EN OBSERVACIÓN').length,
    opportunity: consolidatedData.filter(item => item.status === 'OPORTUNIDAD').length,
    failed: consolidatedData.filter(item => item.status === 'REPRUEBA AÑO').length
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Consolidado Académico
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportConsolidation} disabled={consolidatedData.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Grado</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {gradeOptions.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vista</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Consolidado Anual (4 períodos)</SelectItem>
                  <SelectItem value="1">Solo Período 1</SelectItem>
                  <SelectItem value="2">Solo Período 2</SelectItem>
                  <SelectItem value="3">Solo Período 3</SelectItem>
                  <SelectItem value="4">Solo Período 4</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateConsolidation} className="w-full">
                Actualizar Consolidado
              </Button>
            </div>
          </div>

          {/* Estadísticas Resumen */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
                <p className="text-sm text-green-700">Aprobados</p>
              </CardContent>
            </Card>

            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.observation}</div>
                <p className="text-sm text-yellow-700">En Observación</p>
              </CardContent>
            </Card>

            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.opportunity}</div>
                <p className="text-sm text-orange-700">Oportunidad</p>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <p className="text-sm text-red-700">Reprueban</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabla de Consolidado */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="border p-3 text-left font-medium">Estudiante</th>
                    <th className="border p-3 text-center font-medium">Grado</th>
                    <th className="border p-3 text-center font-medium">Documento</th>
                    {selectedPeriod === 'all' ? (
                      <>
                        <th className="border p-3 text-center font-medium">P1</th>
                        <th className="border p-3 text-center font-medium">P2</th>
                        <th className="border p-3 text-center font-medium">P3</th>
                        <th className="border p-3 text-center font-medium">P4</th>
                        <th className="border p-3 text-center font-medium">Promedio</th>
                      </>
                    ) : (
                      <th className="border p-3 text-center font-medium">Promedio P{selectedPeriod}</th>
                    )}
                    <th className="border p-3 text-center font-medium">Desempeño</th>
                    <th className="border p-3 text-center font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedData.map((item, index) => (
                    <tr key={item.student.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                      <td className="border p-3 font-medium">{item.student.name}</td>
                      <td className="border p-3 text-center">{item.student.grade}</td>
                      <td className="border p-3 text-center">{item.student.document}</td>
                      
                      {selectedPeriod === 'all' ? (
                        <>
                          <td className="border p-3 text-center">
                            <Badge variant={item.periodAverages[1] >= 3.3 ? 'default' : 'destructive'}>
                              {item.periodAverages[1].toFixed(1)}
                            </Badge>
                          </td>
                          <td className="border p-3 text-center">
                            <Badge variant={item.periodAverages[2] >= 3.3 ? 'default' : 'destructive'}>
                              {item.periodAverages[2].toFixed(1)}
                            </Badge>
                          </td>
                          <td className="border p-3 text-center">
                            <Badge variant={item.periodAverages[3] >= 3.3 ? 'default' : 'destructive'}>
                              {item.periodAverages[3].toFixed(1)}
                            </Badge>
                          </td>
                          <td className="border p-3 text-center">
                            <Badge variant={item.periodAverages[4] >= 3.3 ? 'default' : 'destructive'}>
                              {item.periodAverages[4].toFixed(1)}
                            </Badge>
                          </td>
                          <td className="border p-3 text-center">
                            <Badge 
                              variant={item.overallAverage >= 3.3 ? 'default' : 'destructive'}
                              className="font-bold"
                            >
                              {item.overallAverage.toFixed(1)}
                            </Badge>
                          </td>
                        </>
                      ) : (
                        <td className="border p-3 text-center">
                          <Badge 
                            variant={item.periodAverages[parseInt(selectedPeriod)] >= 3.3 ? 'default' : 'destructive'}
                            className="font-bold"
                          >
                            {item.periodAverages[parseInt(selectedPeriod)].toFixed(1)}
                          </Badge>
                        </td>
                      )}
                      
                      <td className="border p-3 text-center">
                        <Badge variant="outline">{item.performance.code}</Badge>
                      </td>
                      
                      <td className="border p-3 text-center">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Análisis por Estado */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estudiantes en Riesgo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-600 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Estudiantes en Riesgo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {consolidatedData
                    .filter(item => item.status === 'REPRUEBA AÑO' || item.status === 'OPORTUNIDAD')
                    .map(item => (
                      <div key={item.student.id} className="border-l-4 border-red-500 bg-red-50 p-3 rounded">
                        <div className="font-medium">{item.student.name}</div>
                        <div className="text-sm text-gray-600">
                          {item.student.grade} - Promedio: {item.overallAverage.toFixed(1)}
                        </div>
                        <Badge className={getStatusColor(item.status)} size="sm">
                          {item.status}
                        </Badge>
                      </div>
                    ))}
                  {consolidatedData.filter(item => item.status === 'REPRUEBA AÑO' || item.status === 'OPORTUNIDAD').length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      No hay estudiantes en riesgo académico
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Estudiantes Destacados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Estudiantes Destacados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {consolidatedData
                    .filter(item => item.overallAverage >= 4.8)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.student.id} className="border-l-4 border-green-500 bg-green-50 p-3 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{item.student.name}</div>
                            <div className="text-sm text-gray-600">
                              {item.student.grade} - Promedio: {item.overallAverage.toFixed(1)}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  {consolidatedData.filter(item => item.overallAverage >= 4.8).length === 0 && (
                    <div className="text-center text-gray-500 py-4">
                      No hay estudiantes con desempeño superior en este filtro
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumen Estadístico */}
          {consolidatedData.length > 0 && (
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Análisis Estadístico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {consolidatedData.length > 0 
                          ? (consolidatedData.reduce((sum, item) => sum + item.overallAverage, 0) / consolidatedData.length).toFixed(1)
                          : '0.0'}
                      </div>
                      <p className="text-sm text-gray-600">Promedio General</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((stats.approved / stats.total) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">Tasa de Aprobación</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {Math.round(((stats.opportunity + stats.observation) / stats.total) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">Requieren Apoyo</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {Math.round((stats.failed / stats.total) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">En Riesgo de Reprobación</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeConsolidation;