import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Settings, 
  Download,
  Plus,
  Edit,
  Trash2,
  Upload,
  Eye,
  Calendar,
  Clock
} from 'lucide-react';
import { mockUsers, mockGrades } from '../mock/mockData';
import { StudentsManager, PeriodsManager, GradesManager, initializeDefaultData } from '../utils/dataManager';
import StudentBulkManager from '../components/StudentBulkManager';
import PeriodManager from '../components/PeriodManager';
import ReportCardModern from '../components/ReportCardModern';
import StudentEditModal from '../components/StudentEditModal';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBulkManager, setShowBulkManager] = useState(false);
  const [showPeriodManager, setShowPeriodManager] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);

  // Inicializar datos al cargar el componente
  useEffect(() => {
    initializeDefaultData();
    setStudents(StudentsManager.getAll());
    setPeriods(PeriodsManager.getAll());
  }, []);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  // Actualizar estudiantes y persistir
  const updateStudents = (newStudents) => {
    setStudents(newStudents);
    StudentsManager.save(newStudents);
  };

  // Actualizar períodos y persistir
  const updatePeriods = (newPeriods) => {
    setPeriods(newPeriods);
    PeriodsManager.save(newPeriods);
  };

  const stats = {
    students: students.length,
    teachers: mockUsers.filter(u => u.role === 'teacher').length,
    parents: mockUsers.filter(u => u.role === 'parent').length,
    grades: mockGrades.length,
    activePeriod: periods.find(p => p.isActive)?.name || 'Ninguno'
  };

  const handleViewReportCard = (student) => {
    setSelectedStudent(student);
    setShowReportCard(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowEditModal(true);
  };

  const handleStudentUpdated = (updatedStudent) => {
    // Actualizar la lista de estudiantes
    const updatedStudents = students.map(student => 
      student.id === updatedStudent.id ? updatedStudent : student
    );
    setStudents(updatedStudents);
    StudentsManager.save(updatedStudents);
  };

  const handleDeleteStudent = (studentId) => {
    if (window.confirm('¿Está seguro de eliminar este estudiante?')) {
      const updatedStudents = StudentsManager.delete(studentId);
      setStudents(updatedStudents);
    }
  };

  const getStudentGrades = (studentId, period) => {
    return mockGrades.filter(g => g.studentId === studentId && g.period === period);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600">Bienvenido, {user.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Profesores</p>
                  <p className="text-2xl font-bold text-green-900">{stats.teachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Padres</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.parents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Calificaciones</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.grades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="teachers">Profesores</TabsTrigger>
            <TabsTrigger value="parents">Padres</TabsTrigger>
            <TabsTrigger value="periods">Períodos</TabsTrigger>
            <TabsTrigger value="reports">Boletines</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" onClick={() => setShowBulkManager(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Gestión Masiva de Estudiantes
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowPeriodManager(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Gestionar Períodos Académicos
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Profesor
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Generar Reportes
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">Período</Badge>
                      Período activo: {stats.activePeriod}
                    </div>
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">Nuevo</Badge>
                      Se agregó el estudiante Gabriel Antón
                    </div>
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">Actualizado</Badge>
                      Calificaciones del período 1 actualizadas
                    </div>
                    <div className="flex items-center text-sm">
                      <Badge variant="outline" className="mr-2">Generado</Badge>
                      Boletín de Ashley Muñoz generado
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Estudiantes</CardTitle>
                <div className="flex space-x-2">
                  <Button onClick={() => setShowBulkManager(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Gestión Masiva
                  </Button>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Estudiante
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Grado</th>
                        <th className="text-left p-3">Nivel</th>
                        <th className="text-left p-3">Documento</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{student.name}</td>
                          <td className="p-3">{student.grade}</td>
                          <td className="p-3">{student.level}</td>
                          <td className="p-3">{student.document}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewReportCard(student)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Profesores</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Profesor
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Materias</th>
                        <th className="text-left p-3">Grados</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.filter(user => user.role === 'teacher').map((teacher) => (
                        <tr key={teacher.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{teacher.name}</td>
                          <td className="p-3">{teacher.email}</td>
                          <td className="p-3">{teacher.subjects?.join(', ')}</td>
                          <td className="p-3">{teacher.grades?.join(', ')}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parents" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Gestión de Padres de Familia</CardTitle>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Padre
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Nombre</th>
                        <th className="text-left p-3">Email</th>
                        <th className="text-left p-3">Hijos</th>
                        <th className="text-left p-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.filter(user => user.role === 'parent').map((parent) => (
                        <tr key={parent.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{parent.name}</td>
                          <td className="p-3">{parent.email}</td>
                          <td className="p-3">
                            {parent.children?.map(childId => {
                              const child = students.find(s => s.id === childId);
                              return child ? child.name : '';
                            }).join(', ')}
                          </td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="periods" className="mt-6">
            <PeriodManager 
              periods={periods} 
              onPeriodsUpdate={setPeriods} 
            />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Boletines Académicos</CardTitle>
                <p className="text-sm text-gray-600">
                  Visualice, edite y descargue boletines de calificaciones por estudiante y período
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {students.map((student) => {
                    const studentGrades = getStudentGrades(student.id, selectedPeriod);
                    const average = studentGrades.length > 0 
                      ? (studentGrades.reduce((sum, g) => sum + g.grade, 0) / studentGrades.length).toFixed(1)
                      : 'N/A';
                    
                    return (
                      <Card key={student.id} className="border hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm">{student.name}</h4>
                              <p className="text-xs text-gray-600">{student.grade} - {student.level}</p>
                            </div>
                            <Badge variant={average !== 'N/A' && parseFloat(average) >= 8 ? 'default' : 'secondary'} className="text-xs">
                              {average}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2">
                            <Button 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => handleViewReportCard(student)}
                            >
                              <Eye className="mr-1 h-3 w-3" />
                              Ver Boletín
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full text-xs"
                            >
                              <Download className="mr-1 h-3 w-3" />
                              Descargar PDF
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Período:</label>
                    <select 
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      {periods.map(period => (
                        <option key={period.id} value={period.id}>
                          {period.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Todos los Boletines
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modales */}
        {showBulkManager && (
          <StudentBulkManager 
            students={students}
            onStudentsUpdate={updateStudents}
            onClose={() => setShowBulkManager(false)}
          />
        )}

        {showPeriodManager && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto w-full">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestión de Períodos Académicos</h3>
                <Button variant="ghost" onClick={() => setShowPeriodManager(false)}>
                  ✕
                </Button>
              </div>
              <div className="p-6">
                <PeriodManager 
                  periods={periods} 
                  onPeriodsUpdate={updatePeriods} 
                />
              </div>
            </div>
          </div>
        )}

        {showReportCard && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Boletín de {selectedStudent.name}</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                  <Button variant="ghost" onClick={() => setShowReportCard(false)}>
                    ✕
                  </Button>
                </div>
              </div>
              <ReportCardModern 
                student={selectedStudent}
                period={selectedPeriod}
                grades={getStudentGrades(selectedStudent.id, selectedPeriod)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;