import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Badge } from '../../ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  Users, 
  BookOpen, 
  UserPlus, 
  FileText, 
  Heart,
  MessageSquare,
  Plus,
  Edit
} from 'lucide-react';
import { MOCK_STUDENTS, SUBJECTS, PERIODS, getPerformanceLevel } from '../../../mockData';

const DocentePrimariaDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedSubject, setSelectedSubject] = useState('HUMANIDADES');

  // Filtrar estudiantes del docente
  const myStudents = MOCK_STUDENTS.filter(student => student.docente_id === user.id);
  
  const getStudentGrade = (student, period, subject) => {
    return student.grades[period]?.[subject] || '';
  };

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Docente - Primaria</h1>
        <p className="text-gray-600">{user.name} - Grado {user.grade}</p>
        <p className="text-sm text-blue-600">Docente de todas las asignaturas del grado</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mis Estudiantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myStudents.length}</div>
            <p className="text-xs text-blue-100">Grado {user.grade}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SUBJECTS.PRIMARIA.length}</div>
            <p className="text-xs text-green-100">Todas las materias</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Períodos</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PERIODS.length}</div>
            <p className="text-xs text-purple-100">Período actual: {selectedPeriod}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gestión de Estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Mis Estudiantes - Grado {user.grade}</span>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Estudiante
            </Button>
          </CardTitle>
          <CardDescription>
            Gestiona tu lista de estudiantes del grado a cargo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {myStudents.map((student, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-600">Grado {student.grade} - {student.level}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Activo</Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Asignación de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Asignación de Notas</span>
          </CardTitle>
          <CardDescription>
            Registra calificaciones para el período y asignatura seleccionada
          </CardDescription>
          
          {/* Filtros */}
          <div className="flex flex-wrap gap-4 mt-4">
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
          </div>
          
          <div className="mt-2">
            <select 
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm"
            >
              {SUBJECTS.PRIMARIA.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Estudiante</th>
                  <th className="text-center p-2">Nota Actual</th>
                  <th className="text-center p-2">Nueva Nota</th>
                  <th className="text-center p-2">Desempeño</th>
                  <th className="text-center p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {myStudents.map((student, index) => {
                  const currentGrade = getStudentGrade(student, selectedPeriod, selectedSubject);
                  const performance = currentGrade ? getPerformanceLevel(currentGrade) : null;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{student.name}</td>
                      <td className="text-center p-2">
                        {currentGrade ? (
                          <Badge variant={currentGrade >= 3.0 ? "default" : "destructive"}>
                            {currentGrade}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">Sin nota</span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="0.0"
                          className="w-20 text-center"
                          defaultValue={currentGrade}
                        />
                      </td>
                      <td className="text-center p-2">
                        {performance && (
                          <Badge 
                            variant={
                              performance.label.includes('SUPERIOR') ? 'default' :
                              performance.label.includes('ALTO') ? 'secondary' :
                              performance.label.includes('BÁSICO') ? 'outline' :
                              'destructive'
                            }
                          >
                            {performance.label.split(' ')[1]}
                          </Badge>
                        )}
                      </td>
                      <td className="text-center p-2">
                        <Button size="sm" variant="outline">
                          Guardar
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Convivencia y Acompañamiento */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span>Convivencia</span>
            </CardTitle>
            <CardDescription>
              Registra observaciones de convivencia escolar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myStudents.slice(0, 3).map((student, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{student.name}</span>
                  <Badge variant="outline" className="text-xs">Convivencia</Badge>
                </div>
                <textarea
                  placeholder="Observaciones de convivencia..."
                  className="w-full p-2 text-sm border rounded resize-none"
                  rows="2"
                />
                <Button size="sm" className="mt-2 w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Registrar Observación
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span>Acompañamiento de Acudiente</span>
            </CardTitle>
            <CardDescription>
              Registra actividades de acompañamiento familiar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {myStudents.slice(0, 3).map((student, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-sm">{student.name}</span>
                  <Badge variant="secondary" className="text-xs">Acompañamiento</Badge>
                </div>
                <textarea
                  placeholder="Seguimiento del acompañamiento familiar..."
                  className="w-full p-2 text-sm border rounded resize-none"
                  rows="2"
                />
                <Button size="sm" className="mt-2 w-full" variant="secondary">
                  <Plus className="h-3 w-3 mr-1" />
                  Registrar Seguimiento
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Proyectos Institucionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Proyectos Institucionales</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Subir Proyecto
            </Button>
          </CardTitle>
          <CardDescription>
            Gestiona y comparte proyectos pedagógicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hay proyectos registrados</p>
            <p className="text-sm">Sube tu primer proyecto institucional</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocentePrimariaDashboard;