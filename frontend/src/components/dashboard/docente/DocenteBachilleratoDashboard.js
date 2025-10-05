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
  GraduationCap,
  Plus,
  Edit,
  School
} from 'lucide-react';
import { MOCK_STUDENTS, SUBJECTS, PERIODS, getPerformanceLevel } from '../../../mockData';

const DocenteBachilleratoDashboard = () => {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('I');
  const [selectedGrade, setSelectedGrade] = useState('6°');
  const [selectedSubject, setSelectedSubject] = useState(user.subjects[0]);

  // Filtrar estudiantes por grado seleccionado (docentes de bachillerato manejan todos los grados)
  const gradeStudents = MOCK_STUDENTS.filter(student => student.grade === selectedGrade);
  
  const getStudentGrade = (student, period, subject) => {
    return student.grades[period]?.[subject] || '';
  };

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Panel Docente - Bachillerato</h1>
        <p className="text-gray-600">{user.name}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">Tutor de Grupo</Badge>
          {user.subjects.map(subject => (
            <Badge key={subject} variant="outline">{subject}</Badge>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grados a Cargo</CardTitle>
            <School className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.grades.length}</div>
            <p className="text-xs text-blue-100">{user.grades.join(', ')}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asignaturas</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.subjects.length}</div>
            <p className="text-xs text-green-100">Materias especializadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estudiantes Actual</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gradeStudents.length}</div>
            <p className="text-xs text-purple-100">Grado {selectedGrade}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Períodos</CardTitle>
            <FileText className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{PERIODS.length}</div>
            <p className="text-xs text-orange-100">Período: {selectedPeriod}</p>
          </CardContent>
        </Card>
      </div>

      {/* Selector de Grado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5" />
            <span>Seleccionar Grado</span>
          </CardTitle>
          <CardDescription>
            Elige el grado para gestionar estudiantes y calificaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {user.grades.map(grade => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? "default" : "outline"}
                onClick={() => setSelectedGrade(grade)}
                className="min-w-[60px]"
              >
                {grade}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Estudiantes del Grado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Estudiantes - Grado {selectedGrade}</span>
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Estudiante
            </Button>
          </CardTitle>
          <CardDescription>
            Gestiona estudiantes del grado seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gradeStudents.length > 0 ? (
              gradeStudents.map((student, index) => (
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
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay estudiantes registrados para el grado {selectedGrade}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Asignación de Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Asignación de Notas - Grado {selectedGrade}</span>
          </CardTitle>
          <CardDescription>
            Registra calificaciones para tus asignaturas
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
              {user.subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {gradeStudents.length > 0 ? (
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
                  {gradeStudents.map((student, index) => {
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Selecciona un grado con estudiantes para asignar notas</p>
            </div>
          )}
        </CardContent>
      </Card>

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
            Gestiona y comparte proyectos pedagógicos para bachillerato
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

export default DocenteBachilleratoDashboard;