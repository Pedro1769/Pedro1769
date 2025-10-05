import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { Textarea } from '../../ui/textarea';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Users, 
  Heart, 
  AlertCircle, 
  FileText, 
  MessageSquare,
  Plus,
  Search,
  Filter,
  BarChart3,
  UserCheck
} from 'lucide-react';
import { MOCK_STUDENTS, PERIODS, GRADES } from '../../../mockData';

const ConvivenciaDashboard = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Filtrar estudiantes
  const filteredStudents = MOCK_STUDENTS.filter(student => {
    const matchesGrade = selectedGrade === 'Todos' || student.grade === selectedGrade;
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGrade && matchesSearch;
  });

  const allGrades = ['Todos', ...GRADES.PREESCOLAR, ...GRADES.PRIMARIA, ...GRADES.BACHILLERATO];

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coordinación de Convivencia</h1>
        <p className="text-gray-600">{user.name}</p>
        <p className="text-sm text-purple-600">Gestión integral de convivencia escolar</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STUDENTS.length}</div>
            <p className="text-xs text-blue-100">Todos los grados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Seguimientos</CardTitle>
            <Heart className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-100">Activos este período</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casos Especiales</CardTitle>
            <AlertCircle className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-yellow-100">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-purple-100">Convivencia activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtrar Estudiantes</span>
          </CardTitle>
          <CardDescription>
            Busca y filtra estudiantes para gestión de convivencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {allGrades.map(grade => (
                <Badge
                  key={grade}
                  variant={selectedGrade === grade ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedGrade(grade)}
                >
                  {grade}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Estudiantes y Gestión */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Estudiantes ({filteredStudents.length})</span>
              </CardTitle>
              <CardDescription>
                {selectedGrade !== 'Todos' ? `Grado ${selectedGrade}` : 'Todos los grados'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredStudents.map((student, index) => (
                  <div 
                    key={index} 
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedStudent?.id === student.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-600">Grado {student.grade} - {student.level}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {Math.floor(Math.random() * 3) + 1} seguimientos
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <UserCheck className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Gestión de Convivencia</span>
              </CardTitle>
              <CardDescription>
                {selectedStudent ? `${selectedStudent.name}` : 'Selecciona un estudiante'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStudent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-sm mb-1">Información del Estudiante</h4>
                    <p className="text-sm text-gray-600">
                      <strong>Grado:</strong> {selectedStudent.grade}<br/>
                      <strong>Nivel:</strong> {selectedStudent.level}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-2">Tipo de Observación</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm">
                        <option>Convivencia Positiva</option>
                        <option>Llamado de Atención</option>
                        <option>Compromiso Académico</option>
                        <option>Seguimiento Comportamental</option>
                        <option>Reunión con Acudiente</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Observación</label>
                      <Textarea
                        placeholder="Describe la situación, acciones tomadas o seguimiento..."
                        rows={4}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Período</label>
                      <select className="w-full border rounded-md px-3 py-2 text-sm">
                        {PERIODS.map(period => (
                          <option key={period} value={period}>Período {period}</option>
                        ))}
                      </select>
                    </div>

                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Registrar Observación
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-sm mb-2">Historial Reciente</h4>
                    <div className="space-y-2">
                      <div className="text-xs p-2 bg-gray-50 rounded">
                        <Badge variant="outline" className="text-xs mb-1">Seguimiento</Badge>
                        <p className="text-gray-600">Mejora en participación en clase...</p>
                        <p className="text-gray-400 mt-1">Hace 2 días</p>
                      </div>
                      <div className="text-xs p-2 bg-gray-50 rounded">
                        <Badge variant="secondary" className="text-xs mb-1">Positiva</Badge>
                        <p className="text-gray-600">Excelente comportamiento durante...</p>
                        <p className="text-gray-400 mt-1">Hace 1 semana</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Selecciona un estudiante</p>
                  <p className="text-sm">para gestionar su convivencia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reportes y Proyectos */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Reportes de Convivencia</span>
            </CardTitle>
            <CardDescription>
              Estadísticas y análisis de convivencia escolar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Reporte por Período
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="h-4 w-4 mr-2" />
                Estadísticas Generales
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="h-4 w-4 mr-2" />
                Casos de Seguimiento
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Proyectos de Convivencia</span>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </CardTitle>
            <CardDescription>
              Gestiona proyectos institucionales de convivencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Convivencia y Valores</h4>
                <p className="text-xs text-gray-600 mt-1">Fortalecimiento de valores institucionales</p>
                <Badge variant="default" className="text-xs mt-2">Activo</Badge>
              </div>
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Resolución de Conflictos</h4>
                <p className="text-xs text-gray-600 mt-1">Estrategias de mediación escolar</p>
                <Badge variant="secondary" className="text-xs mt-2">En desarrollo</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConvivenciaDashboard;