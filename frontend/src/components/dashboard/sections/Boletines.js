import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import { 
  FileText,
  Download,
  Eye,
  Calendar,
  Users,
  BookOpen,
  Filter,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { studentService, gradeService } from '../../../services/api';
import { SUBJECTS, PERIODS } from '../../../mockData';

const Boletines = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [consolidatedData, setConsolidatedData] = useState({});

  useEffect(() => {
    loadStudents();
  }, [user]);

  useEffect(() => {
    if (students.length > 0) {
      loadConsolidatedGrades();
    }
  }, [students, selectedPeriod]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      let studentsList = [];
      
      if (user.role === 'docente_bachillerato') {
        if (user.grades && user.grades.length > 0) {
          const allStudents = await studentService.getAll();
          studentsList = allStudents.filter(student => 
            user.grades.includes(student.grade)
          );
        }
      } else if (user.role === 'docente_primaria') {
        if (user.grade) {
          const allStudents = await studentService.getAll();
          studentsList = allStudents.filter(student => 
            student.grade === user.grade
          );
        }
      }
      
      setStudents(studentsList);
      
      if (studentsList.length > 0 && !selectedGrade) {
        setSelectedGrade(studentsList[0].grade);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los estudiantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConsolidatedGrades = async () => {
    try {
      const periods = [selectedPeriod];
      const consolidated = await gradeService.getConsolidatedGrades(periods, selectedGrade);
      setConsolidatedData(consolidated);
    } catch (error) {
      console.error('Error loading consolidated grades:', error);
    }
  };

  const generateBoletin = async (student) => {
    try {
      toast({
        title: "Generando boletín",
        description: `Preparando boletín para ${student.name}...`,
      });

      // Simular generación de boletín
      setTimeout(() => {
        toast({
          title: "Boletín generado",
          description: `Boletín de ${student.name} listo para descargar`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el boletín",
        variant: "destructive",
      });
    }
  };

  const downloadBoletin = (student) => {
    // Crear datos del boletín
    const boletinData = {
      estudiante: student.name,
      grado: student.grade,
      periodo: selectedPeriod,
      institucion: "Gimnasio Americano Atlántico",
      fecha: new Date().toLocaleDateString('es-CO'),
      notas: user.subjects ? user.subjects.map(subject => ({
        asignatura: subject,
        nota: Math.random() * (5 - 3) + 3, // Nota aleatoria entre 3 y 5
        desempeño: Math.random() > 0.5 ? 'SUPERIOR' : 'ALTO'
      })) : []
    };

    const boletinContent = `
BOLETÍN ACADÉMICO
${boletinData.institucion}

ESTUDIANTE: ${boletinData.estudiante}
GRADO: ${boletinData.grado}
PERÍODO: ${boletinData.periodo}
FECHA: ${boletinData.fecha}

CALIFICACIONES:
${boletinData.notas.map(nota => 
  `${nota.asignatura}: ${nota.nota.toFixed(1)} - ${nota.desempeño}`
).join('\n')}

PROMEDIO GENERAL: ${(boletinData.notas.reduce((sum, nota) => sum + nota.nota, 0) / boletinData.notas.length).toFixed(1)}
    `;

    const blob = new Blob([boletinContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `boletin_${student.name.replace(/\s+/g, '_')}_${selectedPeriod}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Boletín descargado",
      description: `Boletín de ${student.name} descargado exitosamente`,
    });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !selectedGrade || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const availableGrades = [...new Set(students.map(student => student.grade))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 via-blue-500/15 to-indigo-500/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Boletines Académicos
              </h1>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl text-lg font-bold shadow-lg animate-bounce">
                📋 BOLETINES
              </div>
            </div>
            <p className="text-gray-700 font-medium">Generar y descargar boletines estudiantiles</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredStudents.length}</div>
            <p className="text-xs text-blue-100">Para boletines</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Período Actual</CardTitle>
            <Calendar className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedPeriod}</div>
            <p className="text-xs text-green-100">Período académico</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.subjects?.length || 0}</div>
            <p className="text-xs text-purple-100">Materias a cargo</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grados</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableGrades.length}</div>
            <p className="text-xs text-orange-100">Grados disponibles</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros y Configuración</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Filtro por período */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Período:</span>
              {PERIODS.map(period => (
                <Badge
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedPeriod(period)}
                >
                  {period}
                </Badge>
              ))}
            </div>

            {/* Filtro por grado */}
            {availableGrades.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Grado:</span>
                <select 
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="border rounded-md px-3 py-1 text-sm"
                >
                  <option value="">Todos</option>
                  {availableGrades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Buscador */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de estudiantes para boletines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Boletines Disponibles ({filteredStudents.length})</span>
            </div>
            <Button 
              onClick={() => {
                filteredStudents.forEach(student => downloadBoletin(student));
              }}
              className="bg-green-600 hover:bg-green-700"
              disabled={filteredStudents.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Todos
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Cargando estudiantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No se encontraron estudiantes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.map((student, index) => (
                <div key={student._id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{student.grade}</Badge>
                            <Badge variant="secondary">{student.level}</Badge>
                            <span className="text-xs text-gray-500">
                              Doc: {student.document_number || 'No registrado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* Estado del boletín */}
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Disponible
                      </Badge>
                      
                      {/* Acciones */}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => generateBoletin(student)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Previsualizar
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => downloadBoletin(student)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Boletines;