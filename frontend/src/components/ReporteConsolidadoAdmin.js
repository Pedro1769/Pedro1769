import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  X,
  Download,
  Search,
  Users,
  BarChart3,
  Heart
} from 'lucide-react';

const ReporteConsolidadoAdmin = ({ onClose }) => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState(['1']);
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAyudaModal, setShowAyudaModal] = useState(false);
  const [selectedStudentForHelp, setSelectedStudentForHelp] = useState(null);

  const generateConsolidatedReport = () => {
    if (!selectedGrade) {
      alert('Por favor seleccione un grado');
      return;
    }

    // Obtener estudiantes del grado seleccionado
    const storedStudents = JSON.parse(localStorage.getItem('gada_students') || '[]');
    const registeredStudents = JSON.parse(localStorage.getItem('gada_registered_users') || '[]')
      .filter(user => user.role === 'student' && user.grade === selectedGrade);
    
    const gradeStudents = [
      ...storedStudents.filter(s => s.grade === selectedGrade),
      ...registeredStudents.map(s => ({
        id: s.id,
        name: s.name,
        document: s.document,
        grade: s.grade
      }))
    ];

    // Generar reporte consolidado
    const consolidatedData = gradeStudents.map(student => {
      const studentReport = {
        id: student.id,
        name: student.name,
        document: student.document,
        grade: student.grade,
        periodAverages: {},
        overallAverage: 0,
        status: 'evaluando',
        subjects: {}
      };

      // Obtener asignaturas según el nivel
      const subjects = getSubjectsForGrade(selectedGrade);
      let totalPeriodAverage = 0;
      let periodCount = 0;

      selectedPeriods.forEach(period => {
        let periodSum = 0;
        let subjectCount = 0;

        subjects.forEach(subject => {
          // Buscar notas de planillas individuales
          const planillaKey = `gada_planilla_individual_*_${selectedGrade}_${period}_${subject}`;
          
          // Simular búsqueda de notas (en implementación real buscaría en todas las planillas)
          const mockGrade = generateMockGrade(student.id, subject, period);
          
          if (mockGrade > 0) {
            periodSum += mockGrade;
            subjectCount++;
            
            if (!studentReport.subjects[subject]) {
              studentReport.subjects[subject] = {};
            }
            studentReport.subjects[subject][period] = mockGrade;
          }
        });

        if (subjectCount > 0) {
          const periodAverage = periodSum / subjectCount;
          studentReport.periodAverages[period] = parseFloat(periodAverage.toFixed(1));
          totalPeriodAverage += periodAverage;
          periodCount++;
        }
      });

      // Calcular promedio general
      if (periodCount > 0) {
        studentReport.overallAverage = parseFloat((totalPeriodAverage / periodCount).toFixed(1));
      }

      // Determinar estado del estudiante
      studentReport.status = determineStudentStatus(studentReport.overallAverage, selectedGrade);

      return studentReport;
    });

    setReportData(consolidatedData);
    setFilteredData(consolidatedData);
  };

  const getSubjectsForGrade = (grade) => {
    if (grade === '0°') {
      return ['DIMENSIÓN COMUNICATIVA', 'DIMENSIÓN COGNITIVA', 'DIMENSIÓN CORPORAL', 'DIMENSIÓN ESTÉTICA', 'DIMENSIÓN ÉTICA'];
    } else if (['1°', '2°', '3°', '4°', '5°'].includes(grade)) {
      return ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 'INGLÉS', 'EDUCACIÓN ARTÍSTICA', 'ÉTICA Y RELIGIÓN', 'INFORMÁTICA'];
    } else {
      return ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 'INGLÉS', 'EDUCACIÓN FÍSICA', 'QUÍMICA', 'FÍSICA', 'FILOSOFÍA'];
    }
  };

  const generateMockGrade = (studentId, subject, period) => {
    // Generar notas mock basadas en hash del studentId + subject + period
    const hash = (studentId + subject + period).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const isLowPerformer = Math.abs(hash % 10) < 2; // 20% serán de bajo rendimiento
    const isHighPerformer = Math.abs(hash % 10) > 7; // 20% serán de alto rendimiento
    
    if (selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade)) {
      // Escala 1-5
      if (isLowPerformer) return parseFloat((Math.random() * 1.5 + 1.5).toFixed(1)); // 1.5-3.0
      if (isHighPerformer) return parseFloat((Math.random() * 1.0 + 4.0).toFixed(1)); // 4.0-5.0
      return parseFloat((Math.random() * 1.5 + 3.0).toFixed(1)); // 3.0-4.5
    } else {
      // Escala 1-10
      if (isLowPerformer) return parseFloat((Math.random() * 2.0 + 3.0).toFixed(1)); // 3.0-5.0
      if (isHighPerformer) return parseFloat((Math.random() * 1.5 + 8.5).toFixed(1)); // 8.5-10.0
      return parseFloat((Math.random() * 2.0 + 6.0).toFixed(1)); // 6.0-8.0
    }
  };

  const determineStudentStatus = (average, grade) => {
    if (!average || average === 0) return 'sin-datos';
    
    if (grade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(grade)) {
      // Escala 1-5
      if (average >= 4.0) return 'aprobado';
      if (average >= 3.0) return 'necesita-apoyo';
      return 'reprobado';
    } else {
      // Escala 1-10
      if (average >= 7.0) return 'aprobado';
      if (average >= 6.0) return 'necesita-apoyo';
      return 'reprobado';
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'aprobado':
        return { 
          label: 'APROBADO', 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          description: 'Estudiante con rendimiento satisfactorio'
        };
      case 'necesita-apoyo':
        return { 
          label: 'NECESITA APOYO', 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: AlertTriangle,
          description: 'Requiere refuerzo académico'
        };
      case 'reprobado':
        return { 
          label: 'RIESGO REPROBACIÓN', 
          color: 'bg-red-100 text-red-800', 
          icon: TrendingDown,
          description: 'En riesgo de perder el año'
        };
      default:
        return { 
          label: 'SIN DATOS', 
          color: 'bg-gray-100 text-gray-800', 
          icon: Search,
          description: 'No hay suficientes datos'
        };
    }
  };

  const filterData = () => {
    if (!searchTerm) {
      setFilteredData(reportData);
      return;
    }
    
    const filtered = reportData.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.document.includes(searchTerm)
    );
    setFilteredData(filtered);
  };

  useEffect(() => {
    filterData();
  }, [searchTerm, reportData]);

  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    let csv = 'REPORTE CONSOLIDADO ACADÉMICO - GIMNASIO AMERICANO DEL ATLÁNTICO\n';
    csv += `GRADO ${selectedGrade} - PERÍODOS ${selectedPeriods.join(', ')}\n\n`;
    
    // Headers
    csv += 'No.,Estudiante,Documento,';
    selectedPeriods.forEach(period => csv += `Período ${period},`);
    csv += 'Promedio General,Estado,Observaciones\n';

    // Data
    filteredData.forEach((student, index) => {
      csv += `${index + 1},${student.name},${student.document},`;
      selectedPeriods.forEach(period => {
        csv += `${student.periodAverages[period] || 'N/A'},`;
      });
      csv += `${student.overallAverage || 'N/A'},${getStatusInfo(student.status).label},`;
      csv += `${getStatusInfo(student.status).description}\n`;
    });

    // Estadísticas
    const stats = getReportStatistics();
    csv += `\nESTADÍSTICAS CONSOLIDADAS:\n`;
    csv += `Total Estudiantes: ${stats.total}\n`;
    csv += `Aprobados: ${stats.aprobados} (${stats.aprobadosPerc}%)\n`;
    csv += `Necesitan Apoyo: ${stats.necesitanApoyo} (${stats.necesitanApoyoPerc}%)\n`;
    csv += `En Riesgo: ${stats.enRiesgo} (${stats.enRiesgoPerc}%)\n`;

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reporte_Consolidado_${selectedGrade}_Periodos_${selectedPeriods.join('-')}.csv`;
    link.click();
  };

  const getReportStatistics = () => {
    const total = filteredData.length;
    const aprobados = filteredData.filter(s => s.status === 'aprobado').length;
    const necesitanApoyo = filteredData.filter(s => s.status === 'necesita-apoyo').length;
    const enRiesgo = filteredData.filter(s => s.status === 'reprobado').length;

    return {
      total,
      aprobados,
      necesitanApoyo,
      enRiesgo,
      aprobadosPerc: total > 0 ? ((aprobados / total) * 100).toFixed(1) : 0,
      necesitanApoyoPerc: total > 0 ? ((necesitanApoyo / total) * 100).toFixed(1) : 0,
      enRiesgoPerc: total > 0 ? ((enRiesgo / total) * 100).toFixed(1) : 0
    };
  };

  const stats = reportData.length > 0 ? getReportStatistics() : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                📊 REPORTE CONSOLIDADO ACADÉMICO
              </CardTitle>
              <p className="text-red-100">
                Análisis de rendimiento académico y riesgo de reprobación
              </p>
            </div>
            <div className="flex space-x-2">
              {reportData.length > 0 && (
                <Button onClick={exportToExcel} variant="secondary" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exportar Excel
                </Button>
              )}
              <Button onClick={onClose} variant="secondary" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          {/* Filtros y controles */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label>Grado *</Label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar grado" />
                  </SelectTrigger>
                  <SelectContent>
                    {['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'].map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Períodos a incluir *</Label>
                <Select value={selectedPeriods.join(',')} onValueChange={(value) => setSelectedPeriods(value.split(','))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Solo Período 1</SelectItem>
                    <SelectItem value="1,2">Períodos 1 y 2</SelectItem>
                    <SelectItem value="1,2,3">Períodos 1, 2 y 3</SelectItem>
                    <SelectItem value="2">Solo Período 2</SelectItem>
                    <SelectItem value="3">Solo Período 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={generateConsolidatedReport}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!selectedGrade}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generar Reporte
                </Button>
              </div>
            </div>

            {reportData.length > 0 && (
              <div>
                <Label>Buscar estudiante</Label>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o documento..."
                  className="max-w-md"
                />
              </div>
            )}
          </div>

          {/* Estadísticas generales */}
          {stats && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-800">{stats.total}</div>
                  <p className="text-blue-600 text-sm">Total Estudiantes</p>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-800">{stats.aprobados}</div>
                  <p className="text-green-600 text-sm">Aprobados ({stats.aprobadosPerc}%)</p>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold text-yellow-800">{stats.necesitanApoyo}</div>
                  <p className="text-yellow-600 text-sm">Necesitan Apoyo ({stats.necesitanApoyoPerc}%)</p>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-800">{stats.enRiesgo}</div>
                  <p className="text-red-600 text-sm">En Riesgo ({stats.enRiesgoPerc}%)</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tabla de resultados */}
          {filteredData.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">No.</th>
                    <th className="border border-gray-300 p-2 text-left">Estudiante</th>
                    <th className="border border-gray-300 p-2 text-left">Documento</th>
                    {selectedPeriods.map(period => (
                      <th key={period} className="border border-gray-300 p-2 text-center">
                        Período {period}
                      </th>
                    ))}
                    <th className="border border-gray-300 p-2 text-center">Promedio General</th>
                    <th className="border border-gray-300 p-2 text-center">Estado</th>
                    <th className="border border-gray-300 p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((student, index) => {
                    const statusInfo = getStatusInfo(student.status);
                    const StatusIcon = statusInfo.icon;
                    
                    return (
                      <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-2">{index + 1}</td>
                        <td className="border border-gray-300 p-2 font-medium">{student.name}</td>
                        <td className="border border-gray-300 p-2">{student.document}</td>
                        {selectedPeriods.map(period => (
                          <td key={period} className="border border-gray-300 p-2 text-center">
                            <Badge variant="outline">
                              {student.periodAverages[period] || 'N/A'}
                            </Badge>
                          </td>
                        ))}
                        <td className="border border-gray-300 p-2 text-center">
                          <Badge className="font-bold">
                            {student.overallAverage || 'N/A'}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-2 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <StatusIcon className="h-4 w-4" />
                            <Badge className={statusInfo.color}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {reportData.length === 0 && selectedGrade && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Haga clic en "Generar Reporte" para analizar el rendimiento</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReporteConsolidadoAdmin;