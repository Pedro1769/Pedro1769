import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  BookOpen, 
  Users, 
  GraduationCap, 
  PlusCircle,
  Edit,
  Save
} from 'lucide-react';
import { mockStudents, mockGrades, mockSubjects } from '../mock/mockData';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('1');

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/login" />;
  }

  // Filter students by teacher's grades
  const teacherStudents = mockStudents.filter(student => 
    user.grades?.includes(student.grade)
  );

  // Get subjects for the teacher
  const teacherSubjects = user.subjects || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel del Profesor</h1>
          <p className="text-gray-600">Bienvenido, {user.name}</p>
          <div className="mt-2">
            <Badge variant="secondary" className="mr-2">
              Materias: {teacherSubjects.join(', ')}
            </Badge>
            <Badge variant="outline">
              Grados: {user.grades?.join(', ')}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-900">{teacherStudents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Materias</p>
                  <p className="text-2xl font-bold text-green-900">{teacherSubjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Grados</p>
                  <p className="text-2xl font-bold text-purple-900">{user.grades?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="grades" className="space-y-6">
          <TabsList>
            <TabsTrigger value="grades">Calificaciones</TabsTrigger>
            <TabsTrigger value="students">Mis Estudiantes</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Asignar Calificaciones</CardTitle>
                <p className="text-sm text-gray-600">
                  Seleccione el grado, materia y período para asignar calificaciones
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="grade">Grado</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {user.grades?.map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Materia</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar materia" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherSubjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="period">Período</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
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
                </div>

                {/* Students Grade Table */}
                {selectedGrade && selectedSubject && (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Estudiante</th>
                          <th className="text-left p-3 font-medium">Calificación</th>
                          <th className="text-left p-3 font-medium">Observaciones</th>
                          <th className="text-left p-3 font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherStudents
                          .filter(student => student.grade === selectedGrade)
                          .map((student) => {
                            const existingGrade = mockGrades.find(
                              g => g.studentId === student.id && 
                                   g.subject === selectedSubject && 
                                   g.period === parseInt(selectedPeriod)
                            );
                            
                            return (
                              <tr key={student.id} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-medium">{student.name}</td>
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    step="0.1"
                                    min="1"
                                    max="10"
                                    defaultValue={existingGrade?.grade || ''}
                                    placeholder="0.0"
                                    className="w-20"
                                  />
                                </td>
                                <td className="p-3">
                                  <Input
                                    placeholder="Observaciones..."
                                    defaultValue={existingGrade?.description || ''}
                                    className="max-w-xs"
                                  />
                                </td>
                                <td className="p-3">
                                  <Button size="sm">
                                    <Save className="mr-2 h-3 w-3" />
                                    Guardar
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}

                {(!selectedGrade || !selectedSubject) && (
                  <div className="text-center py-12 text-gray-500">
                    Seleccione un grado y materia para comenzar a asignar calificaciones
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mis Estudiantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Grado</th>
                        <th className="text-left p-3">Nivel</th>
                        <th className="text-left p-3">Promedio</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teacherStudents.map((student) => {
                        const studentGrades = mockGrades.filter(g => g.studentId === student.id);
                        const average = studentGrades.length > 0 
                          ? (studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length).toFixed(1)
                          : 'N/A';

                        return (
                          <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{student.name}</td>
                            <td className="p-3">{student.grade}</td>
                            <td className="p-3">{student.level}</td>
                            <td className="p-3">
                              <Badge variant={average !== 'N/A' && parseFloat(average) >= 8 ? 'default' : 'secondary'}>
                                {average}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Button size="sm" variant="outline">
                                <Edit className="mr-2 h-3 w-3" />
                                Ver Detalle
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas del Período</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Estudiantes evaluados:</span>
                      <Badge>{teacherStudents.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Promedio general:</span>
                      <Badge variant="secondary">8.2</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Estudiantes destacados:</span>
                      <Badge variant="default">3</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Requieren apoyo:</span>
                      <Badge variant="destructive">1</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nueva Evaluación
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Generar Reporte
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="mr-2 h-4 w-4" />
                    Enviar Comunicado
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeacherDashboard;