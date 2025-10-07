import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import { 
  BookOpen,
  Users,
  Eye,
  Filter,
  Download,
  Search,
  GraduationCap,
  UserCheck,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { studentService, gradeService } from '../../../services/api';
import { PERIODS } from '../../../mockData';

const GestionNotasAdmin = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Estados para filtros
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchStudent, setSearchStudent] = useState('');
  
  // Estados para datos
  const [allGrades, setAllGrades] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    totalGrades: 0,
    totalStudents: 0,
    totalTeachers: 0,
    averageGrade: 0
  });

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allGrades, selectedPeriod, selectedGrade, selectedTeacher, selectedSubject, searchStudent]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Cargar todas las notas del sistema
      const gradesResponse = await fetch('/api/grades/all', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('gaa_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let allGradesData = [];
      
      if (gradesResponse.ok) {
        allGradesData = await gradesResponse.json();
      } else {
        // Fallback: cargar todas las notas estudiante por estudiante
        const studentsData = await studentService.getAll();
        setStudents(studentsData);
        
        for (const student of studentsData) {
          try {
            const studentGrades = await gradeService.getStudentGrades(student._id || student.id);
            
            // Enriquecer cada nota con datos del estudiante
            const enrichedGrades = studentGrades.map(grade => ({
              ...grade,
              student_name: student.name,
              student_grade: student.grade,
              student_level: student.level
            }));
            
            allGradesData = [...allGradesData, ...enrichedGrades];
          } catch (error) {
            console.error(`Error loading grades for student ${student.name}:`, error);
          }
        }
      }
      
      setAllGrades(allGradesData);
      
      // Extraer listas únicas para filtros
      const uniqueTeachers = [...new Set(allGradesData.map(g => g.teacher_id))].filter(Boolean);
      const uniqueSubjects = [...new Set(allGradesData.map(g => g.subject))].filter(Boolean);
      const uniqueGrades = [...new Set(allGradesData.map(g => g.student_grade))].filter(Boolean);
      
      setTeachers(uniqueTeachers);
      setSubjects(uniqueSubjects.sort());
      
      // Calcular estadísticas
      calculateStatistics(allGradesData);
      
      toast({
        title: "Datos cargados",
        description: `${allGradesData.length} notas cargadas del sistema`,
      });
      
    } catch (error) {
      console.error('Error loading grades data:', error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron cargar todas las notas del sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (gradesData) => {
    if (gradesData.length === 0) {
      setStatistics({ totalGrades: 0, totalStudents: 0, totalTeachers: 0, averageGrade: 0 });
      return;
    }

    const totalGrades = gradesData.length;
    const uniqueStudents = new Set(gradesData.map(g => g.student_id)).size;
    const uniqueTeachers = new Set(gradesData.map(g => g.teacher_id)).size;
    const averageGrade = gradesData.reduce((sum, g) => sum + g.grade, 0) / totalGrades;

    setStatistics({
      totalGrades,
      totalStudents: uniqueStudents,
      totalTeachers: uniqueTeachers,
      averageGrade: averageGrade.toFixed(2)
    });
  };

  const applyFilters = () => {
    let filtered = [...allGrades];

    // Filtrar por período
    if (selectedPeriod) {
      filtered = filtered.filter(grade => grade.period === selectedPeriod);
    }

    // Filtrar por grado
    if (selectedGrade) {
      filtered = filtered.filter(grade => grade.student_grade === selectedGrade);
    }

    // Filtrar por docente
    if (selectedTeacher) {
      filtered = filtered.filter(grade => grade.teacher_id === selectedTeacher);
    }

    // Filtrar por asignatura
    if (selectedSubject) {
      filtered = filtered.filter(grade => grade.subject === selectedSubject);
    }

    // Filtrar por búsqueda de estudiante
    if (searchStudent) {
      filtered = filtered.filter(grade => 
        grade.student_name?.toLowerCase().includes(searchStudent.toLowerCase())
      );
    }

    setFilteredGrades(filtered);
    calculateStatistics(filtered);
  };

  const exportGrades = () => {
    if (filteredGrades.length === 0) {
      toast({
        title: "Sin datos para exportar",
        description: "No hay notas que cumplan los criterios de filtro",
        variant: "destructive",
      });
      return;
    }

    const csvData = filteredGrades.map(grade => ({
      'Estudiante': grade.student_name || 'No disponible',
      'Grado': grade.student_grade || 'No disponible',
      'Asignatura': grade.subject,
      'Período': grade.period,
      'Nota': grade.grade,
      'Desempeño': grade.performance_level || 'No calculado',
      'Docente': grade.teacher_id || 'No disponible',
      'Observaciones': grade.teacher_notes || 'Sin observaciones',
      'Fecha': new Date(grade.created_at).toLocaleDateString('es-CO')
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => 
        headers.map(header => `"${row[header]}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `notas_sistema_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Exportación exitosa",
      description: `${filteredGrades.length} notas exportadas a CSV`,
    });
  };

  const clearFilters = () => {
    setSelectedPeriod('I');
    setSelectedGrade('');
    setSelectedTeacher('');
    setSelectedSubject('');
    setSearchStudent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-indigo-500/10 backdrop-blur-md border-0 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 animate-pulse" />
              <span className="text-xl font-bold">📊 Gestión de Notas del Sistema</span>
            </div>
            <Button 
              onClick={exportGrades}
              className="bg-white text-blue-600 hover:bg-blue-50"
              disabled={filteredGrades.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </CardTitle>
          <CardDescription className="text-blue-100">
            Supervisión y análisis de todas las calificaciones asignadas por los docentes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl text-white">
              <BookOpen className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-bold">{statistics.totalGrades}</h3>
              <p className="text-blue-100 text-sm">Total Notas</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
              <Users className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-bold">{statistics.totalStudents}</h3>
              <p className="text-green-100 text-sm">Estudiantes Evaluados</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
              <UserCheck className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-bold">{statistics.totalTeachers}</h3>
              <p className="text-purple-100 text-sm">Docentes Activos</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
              <TrendingUp className="h-8 w-8 mb-2" />
              <h3 className="text-lg font-bold">{statistics.averageGrade}</h3>
              <p className="text-orange-100 text-sm">Promedio General</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Filtros de Búsqueda</h3>
              <Button 
                onClick={clearFilters}
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                Limpiar Filtros
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Período */}
              <div>
                <label className="text-sm font-medium text-gray-700">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar período" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(period => (
                      <SelectItem key={period} value={period}>Período {period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Grado */}
              <div>
                <label className="text-sm font-medium text-gray-700">Grado</label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los grados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {[...new Set(allGrades.map(g => g.student_grade))].filter(Boolean).sort().map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Docente */}
              <div>
                <label className="text-sm font-medium text-gray-700">Docente</label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los docentes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    {teachers.map(teacherId => (
                      <SelectItem key={teacherId} value={teacherId}>{teacherId}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Asignatura */}
              <div>
                <label className="text-sm font-medium text-gray-700">Asignatura</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las materias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Búsqueda estudiante */}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-700">Buscar Estudiante</label>
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                  <Input
                    placeholder="Nombre del estudiante..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabla de notas */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando notas del sistema...</p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notas del Sistema ({filteredGrades.length})</span>
                  <Badge variant="secondary">
                    Mostrando {filteredGrades.length} de {allGrades.length} notas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredGrades.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No se encontraron notas con los criterios seleccionados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left p-3">Estudiante</th>
                          <th className="text-center p-3">Grado</th>
                          <th className="text-center p-3">Asignatura</th>
                          <th className="text-center p-3">Período</th>
                          <th className="text-center p-3">Nota</th>
                          <th className="text-center p-3">Desempeño</th>
                          <th className="text-left p-3">Docente</th>
                          <th className="text-center p-3">Fecha</th>
                          <th className="text-center p-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGrades.map((grade, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">
                              {grade.student_name || 'No disponible'}
                            </td>
                            <td className="text-center p-3">
                              <Badge variant="outline">{grade.student_grade || 'N/A'}</Badge>
                            </td>
                            <td className="text-center p-3">{grade.subject}</td>
                            <td className="text-center p-3">
                              <Badge variant="secondary">Período {grade.period}</Badge>
                            </td>
                            <td className="text-center p-3">
                              <Badge 
                                variant={grade.grade >= 3.0 ? "default" : "destructive"}
                                className="font-bold"
                              >
                                {grade.grade}
                              </Badge>
                            </td>
                            <td className="text-center p-3">
                              <Badge 
                                variant={
                                  grade.performance_level === 'SUPERIOR' ? 'default' :
                                  grade.performance_level === 'ALTO' ? 'secondary' :
                                  grade.performance_level === 'BASICO' ? 'outline' :
                                  'destructive'
                                }
                              >
                                {grade.performance_level || 'N/A'}
                              </Badge>
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                              {grade.teacher_id || 'No disponible'}
                            </td>
                            <td className="text-center p-3 text-xs text-gray-500">
                              {grade.created_at ? new Date(grade.created_at).toLocaleDateString('es-CO') : 'N/A'}
                            </td>
                            <td className="text-center p-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  toast({
                                    title: "Detalle de nota",
                                    description: grade.teacher_notes || "Sin observaciones adicionales",
                                  });
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestionNotasAdmin;