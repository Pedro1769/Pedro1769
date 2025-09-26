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
  Clock,
  Target,
  Grid,
  CheckCircle,
  Shield
} from 'lucide-react';
import { mockUsers, mockGrades } from '../mock/mockData';
import { StudentsManager, PeriodsManager, GradesManager, DownloadCodesManager, initializeDefaultData } from '../utils/dataManager';
import StudentBulkManager from '../components/StudentBulkManager';
import PeriodManager from '../components/PeriodManager';
import ReportCardModern from '../components/ReportCardModern';
import StudentEditModal from '../components/StudentEditModal';
import TeacherEditModal from '../components/TeacherEditModal';
import UserApprovalManager from '../components/UserApprovalManager';
import AcademicObjectivesManager from '../components/AcademicObjectivesManager';
import CurriculumManager from '../components/CurriculumManager';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showBulkManager, setShowBulkManager] = useState(false);
  const [showPeriodManager, setShowPeriodManager] = useState(false);
  const [showReportCard, setShowReportCard] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [showUserManager, setShowUserManager] = useState(false);
  const [showObjectivesManager, setShowObjectivesManager] = useState(false);
  const [showCurriculumManager, setShowCurriculumManager] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isNewTeacher, setIsNewTeacher] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [students, setStudents] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [downloadCodes, setDownloadCodes] = useState([]);

  // Cargar códigos de descarga
  useEffect(() => {
    const codes = DownloadCodesManager.getAll();
    setDownloadCodes(codes);
  }, []);

  // Inicializar datos al cargar el componente
  useEffect(() => {
    initializeDefaultData();
    setStudents(StudentsManager.getAll());
    setPeriods(PeriodsManager.getAll());
    // Cargar teachers del localStorage o usar mock data
    const storedTeachers = JSON.parse(localStorage.getItem('gada_teachers') || '[]');
    if (storedTeachers.length === 0) {
      const defaultTeachers = mockUsers.filter(user => user.role === 'teacher');
      localStorage.setItem('gada_teachers', JSON.stringify(defaultTeachers));
      setTeachers(defaultTeachers);
    } else {
      setTeachers(storedTeachers);
    }
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

  const calculateStats = () => {
    try {
      // Obtener estudiantes de ambas fuentes
      const allStudents = StudentsManager.getAll();
      
      // Obtener usuarios registrados
      const registeredUsers = JSON.parse(localStorage.getItem('gada_registered_users') || '[]');
      const approvedUsers = registeredUsers.filter(u => u.approved);
      
      return {
        students: allStudents.length,
        teachers: [...mockUsers.filter(u => u.role === 'teacher'), ...approvedUsers.filter(u => u.role === 'teacher')].length,
        parents: [...mockUsers.filter(u => u.role === 'parent'), ...approvedUsers.filter(u => u.role === 'parent')].length,
        grades: GradesManager.getAll().length,
        registeredUsers: registeredUsers.length,
        approvedUsers: approvedUsers.length,
        activePeriod: periods.find(p => p.isActive)?.name || 'Ninguno'
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        students: 0,
        teachers: 0,
        parents: 0,
        grades: 0,
        registeredUsers: 0,
        approvedUsers: 0,
        activePeriod: 'Ninguno'
      };
    }
  };

  const stats = calculateStats();

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

  // Funciones para gestión de docentes
  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setIsNewTeacher(false);
    setShowTeacherModal(true);
  };

  const handleNewTeacher = () => {
    setEditingTeacher(null);
    setIsNewTeacher(true);
    setShowTeacherModal(true);
  };

  const handleTeacherUpdated = (teacherData) => {
    let updatedTeachers;
    if (isNewTeacher) {
      updatedTeachers = [...teachers, teacherData];
    } else {
      updatedTeachers = teachers.map(teacher => 
        teacher.id === teacherData.id ? teacherData : teacher
      );
    }
    setTeachers(updatedTeachers);
    localStorage.setItem('gada_teachers', JSON.stringify(updatedTeachers));
  };

  const handleDeleteTeacher = (teacherId) => {
    if (window.confirm('¿Está seguro de eliminar este docente?')) {
      const updatedTeachers = teachers.filter(teacher => teacher.id !== teacherId);
      setTeachers(updatedTeachers);
      localStorage.setItem('gada_teachers', JSON.stringify(updatedTeachers));
    }
  };

  const getStudentGrades = (studentId, period) => {
    return mockGrades.filter(g => g.studentId === studentId && g.period === period);
  };

  return (
    <div className="min-h-screen bg-institutional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">Panel de Administración</h1>
            <p className="text-gray-600 mt-2">Bienvenido, {user.name}</p>
            
            {/* Indicador de acceso total */}
            <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">🚀 ACCESO ADMINISTRATIVO COMPLETO ACTIVADO</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Todas las funcionalidades, períodos, reportes, gestión de usuarios, calificaciones y configuraciones están completamente habilitadas sin restricciones.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.students}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-teal-50 via-teal-100 to-teal-50 border-teal-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-teal-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-teal-700">Profesores</p>
                  <p className="text-2xl font-bold text-teal-900">{stats.teachers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 border-slate-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-slate-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-700">Padres</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.parents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border-amber-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-amber-700">Usuarios Registrados</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.registeredUsers}</p>
                  <p className="text-xs text-amber-600">({stats.approvedUsers} aprobados)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="downloads">Códigos Descarga</TabsTrigger>
            <TabsTrigger value="students">Estudiantes</TabsTrigger>
            <TabsTrigger value="teachers">Profesores</TabsTrigger>
            <TabsTrigger value="academic">Académico</TabsTrigger>
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
                  <Button onClick={() => setShowUserManager(true)} className="bg-gradient-gada text-white hover:shadow-lg hover:scale-105 transition-all duration-300">
                    <Users className="mr-2 h-4 w-4" />
                    Gestión de Usuarios Registrados
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowBulkManager(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Gestión Masiva de Estudiantes
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowObjectivesManager(true)}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Banco de Logros y Objetivos
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowCurriculumManager(true)}>
                    <FileText className="mr-2 h-4 w-4" />
                    Mallas Curriculares
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => setShowPeriodManager(true)}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Gestionar Períodos Académicos
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

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Usuarios del Sistema</CardTitle>
                <p className="text-sm text-gray-600">
                  Administre todos los usuarios registrados: docentes, padres de familia y coordinadores.
                  Aquí puede ver, editar o eliminar cualquier cuenta de usuario registrada en el sistema.
                </p>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowUserManager(true)} className="mb-4">
                  <Users className="mr-2 h-4 w-4" />
                  Abrir Gestor de Usuarios
                </Button>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> Todos los usuarios ahora se registran con acceso inmediato. 
                    Use este gestor para ver los detalles completos, editar información o eliminar cuentas si es necesario.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="downloads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Códigos de Descarga para Padres de Familia</CardTitle>
                <p className="text-sm text-gray-600">
                  Genere códigos únicos para que los padres puedan descargar boletines y documentos de sus hijos.
                  <span className="text-red-600 font-medium"> Cada código es de un solo uso.</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowCodeGenerator(true)}
                    className="bg-gradient-gada text-white hover:shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Generar Nuevo Código de Descarga
                  </Button>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-medium text-orange-800 mb-2">🔒 Sistema de Seguridad:</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Cada código es único y funciona una sola vez</li>
                      <li>• El código expira en 24 horas automáticamente</li>
                      <li>• Solo el padre autorizado puede usar el código</li>
                      <li>• Se requiere email del padre y documento del estudiante</li>
                    </ul>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Código</th>
                          <th className="text-left p-3">Padre/Email</th>
                          <th className="text-left p-3">Estudiante</th>
                          <th className="text-left p-3">Tipo</th>
                          <th className="text-left p-3">Estado</th>
                          <th className="text-left p-3">Expira</th>
                          <th className="text-left p-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {downloadCodes.length > 0 ? downloadCodes.map((code) => (
                          <tr key={code.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-mono text-blue-600">{code.code}</td>
                            <td className="p-3">{code.parentEmail}</td>
                            <td className="p-3">{code.studentDocument}</td>
                            <td className="p-3 capitalize">{code.type}</td>
                            <td className="p-3">
                              <Badge variant={
                                code.used ? 'secondary' : 
                                new Date() > new Date(code.expiresAt) ? 'destructive' : 
                                'default'
                              }>
                                {code.used ? 'Usado' : 
                                 new Date() > new Date(code.expiresAt) ? 'Expirado' : 
                                 'Activo'}
                              </Badge>
                            </td>
                            <td className="p-3 text-xs">
                              {new Date(code.expiresAt).toLocaleDateString('es-CO')} <br/>
                              {new Date(code.expiresAt).toLocaleTimeString('es-CO', {hour: '2-digit', minute: '2-digit'})}
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    navigator.clipboard.writeText(code.code);
                                    alert('Código copiado al portapapeles');
                                  }}
                                >
                                  📋 Copiar
                                </Button>
                                {!code.used && code.active && (
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      if(confirm('¿Desactivar este código?')) {
                                        DownloadCodesManager.deactivateCode(code.id);
                                        setDownloadCodes(DownloadCodesManager.getAll());
                                      }
                                    }}
                                  >
                                    ❌ Desactivar
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="7" className="p-8 text-center text-gray-500">
                              No hay códigos de descarga generados aún
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditStudent(student)}
                                title="Editar estudiante"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleViewReportCard(student)}
                                title="Ver boletín"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteStudent(student.id)}
                                title="Eliminar estudiante"
                                className="hover:bg-red-50 hover:border-red-200"
                              >
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
                <Button onClick={handleNewTeacher}>
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
                      {teachers.map((teacher) => (
                        <tr key={teacher.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{teacher.name}</td>
                          <td className="p-3">{teacher.email}</td>
                          <td className="p-3">{teacher.subjects?.slice(0, 2).join(', ')}{teacher.subjects?.length > 2 ? '...' : ''}</td>
                          <td className="p-3">{teacher.grades?.slice(0, 3).join(', ')}{teacher.grades?.length > 3 ? '...' : ''}</td>
                          <td className="p-3">
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditTeacher(teacher)}
                                title="Editar profesor"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteTeacher(teacher.id)}
                                title="Eliminar profesor"
                                className="hover:bg-red-50 hover:border-red-200"
                              >
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

          <TabsContent value="academic" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowObjectivesManager(true)}>
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                  <h3 className="text-lg font-semibold mb-2">Banco de Logros</h3>
                  <p className="text-gray-600 text-sm">Gestionar objetivos y logros académicos para boletines</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowCurriculumManager(true)}>
                <CardContent className="p-6 text-center">
                  <Grid className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-semibold mb-2">Mallas Curriculares</h3>
                  <p className="text-gray-600 text-sm">Administrar mallas por asignaturas y áreas académicas</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-purple-600" />
                  <h3 className="text-lg font-semibold mb-2">Proyectos Institucionales</h3>
                  <p className="text-gray-600 text-sm">Gestionar proyectos y actividades institucionales</p>
                </CardContent>
              </Card>
            </div>
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

        {showTeacherModal && (
          <TeacherEditModal 
            teacher={editingTeacher}
            isNew={isNewTeacher}
            onClose={() => {
              setShowTeacherModal(false);
              setEditingTeacher(null);
              setIsNewTeacher(false);
            }}
            onUpdate={handleTeacherUpdated}
          />
        )}

        {showCodeGenerator && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Generar Código de Descarga
                </CardTitle>
                <Button variant="ghost" onClick={() => setShowCodeGenerator(false)}>
                  ❌
                </Button>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const type = formData.get('type');
                  const studentDocument = formData.get('studentDocument');
                  const parentEmail = formData.get('parentEmail');
                  
                  if (!type || !studentDocument || !parentEmail) {
                    alert('Todos los campos son obligatorios');
                    return;
                  }
                  
                  const newCode = DownloadCodesManager.generateCode(type, studentDocument, parentEmail);
                  if (newCode) {
                    setDownloadCodes(DownloadCodesManager.getAll());
                    alert(`Código generado exitosamente: ${newCode.code}\n\nEste código expira en 24 horas y es de un solo uso.`);
                    setShowCodeGenerator(false);
                  } else {
                    alert('Error al generar el código');
                  }
                }} className="space-y-4">
                  
                  <div>
                    <Label htmlFor="type">Tipo de Documento *</Label>
                    <Select name="type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="boletin">Boletín de Calificaciones</SelectItem>
                        <SelectItem value="certificado">Certificado Académico</SelectItem>
                        <SelectItem value="reporte">Reporte Comportamental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="studentDocument">Documento del Estudiante *</Label>
                    <Input
                      name="studentDocument"
                      placeholder="Número de documento del estudiante"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentEmail">Email del Padre/Acudiente *</Label>
                    <Input
                      name="parentEmail"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>Importante:</strong> Este código será válido por 24 horas y se puede usar una sola vez. 
                      Compártalo directamente con el padre autorizado.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowCodeGenerator(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-gradient-gada text-white">
                      🔑 Generar Código
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {showUserManager && (
          <UserApprovalManager 
            onClose={() => setShowUserManager(false)}
          />
        )}

        {showObjectivesManager && (
          <AcademicObjectivesManager 
            onClose={() => setShowObjectivesManager(false)}
          />
        )}

        {showCurriculumManager && (
          <CurriculumManager 
            onClose={() => setShowCurriculumManager(false)}
          />
        )}

        {showEditModal && editingStudent && (
          <StudentEditModal 
            student={editingStudent}
            onClose={() => {
              setShowEditModal(false);
              setEditingStudent(null);
            }}
            onUpdate={handleStudentUpdated}
          />
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