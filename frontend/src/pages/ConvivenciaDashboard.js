import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Users, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Calendar,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Eye,
  Save,
  Upload,
  Download,
  BookOpen,
  GraduationCap,
  Plus,
  X
} from 'lucide-react';
import { mockStudents } from '../mock/mockData';
import { PeriodsManager, StudentsManager } from '../utils/dataManager';

const ConvivenciaDashboard = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('1');
  const [periods, setPeriods] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [convivenceNotes, setConvivenceNotes] = useState({});
  const [allStudents, setAllStudents] = useState([]);

  useEffect(() => {
    // Cargar períodos desde localStorage
    const loadedPeriods = PeriodsManager.getAll();
    setPeriods(loadedPeriods);
    
    // Cargar todos los estudiantes (mock + registrados)
    const students = [...mockStudents, ...StudentsManager.getAll()];
    setAllStudents(students);
    
    // Cargar notas de convivencia existentes
    const savedNotes = localStorage.getItem('gada_convivence_notes');
    if (savedNotes) {
      setConvivenceNotes(JSON.parse(savedNotes));
    }
  }, []);

  if (!user || user.role !== 'coordinadora_convivencia') {
    return <Navigate to="/login" />;
  }

  // Mock data for behavioral incidents
  const incidents = [
    { id: 1, studentId: 1, type: 'Tardanza', severity: 'Leve', date: '2024-01-15', description: 'Llegada tarde a clase', resolved: true },
    { id: 2, studentId: 2, type: 'Falta de Respeto', severity: 'Grave', date: '2024-01-16', description: 'Irrespeto al docente', resolved: false },
    { id: 3, studentId: 3, type: 'Uniforme', severity: 'Leve', date: '2024-01-17', description: 'Uniforme incompleto', resolved: true }
  ];

  const stats = {
    totalStudents: allStudents.length,
    totalIncidents: incidents.length,
    resolvedIncidents: incidents.filter(i => i.resolved).length,
    pendingIncidents: incidents.filter(i => !i.resolved).length
  };

  const grades = ['all', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

  // Función para guardar nota de convivencia
  const saveConvivenceNote = (gradeData) => {
    const noteKey = `${gradeData.grade}_${gradeData.period}`;
    const updatedNotes = {
      ...convivenceNotes,
      [noteKey]: {
        ...gradeData,
        createdBy: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    setConvivenceNotes(updatedNotes);
    localStorage.setItem('gada_convivence_notes', JSON.stringify(updatedNotes));
    setShowNoteModal(false);
  };

  // Componente Modal para Nota de Convivencia
  const ConvivenceNoteModal = () => {
    const [noteData, setNoteData] = useState({
      grade: selectedGrade !== 'all' ? selectedGrade : '1°',
      period: selectedPeriod,
      behaviorNote: '',
      accompanimentNote: '',
      attachments: []
    });

    const handleInputChange = (field) => (e) => {
      setNoteData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      saveConvivenceNote(noteData);
    };

    const handleFileUpload = (e) => {
      const files = Array.from(e.target.files);
      setNoteData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...files.map(file => file.name)]
      }));
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
              Nota de Convivencia y Acompañamiento
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowNoteModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Grado *</Label>
                  <Select value={noteData.grade} onValueChange={(value) => setNoteData(prev => ({...prev, grade: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {grades.slice(1).map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Período *</Label>
                  <Select value={noteData.period} onValueChange={(value) => setNoteData(prev => ({...prev, period: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.id} value={period.id.toString()}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="behaviorNote">Nota de Convivencia *</Label>
                <Textarea
                  id="behaviorNote"
                  value={noteData.behaviorNote}
                  onChange={handleInputChange('behaviorNote')}
                  placeholder="Escriba la nota de convivencia para el grado seleccionado..."
                  className="min-h-[120px]"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Esta nota aparecerá en el boletín de todos los estudiantes del grado {noteData.grade}
                </p>
              </div>

              <div>
                <Label htmlFor="accompanimentNote">Nota de Acompañamiento *</Label>
                <Textarea
                  id="accompanimentNote"
                  value={noteData.accompanimentNote}
                  onChange={handleInputChange('accompanimentNote')}
                  placeholder="Escriba la nota de acompañamiento y seguimiento..."
                  className="min-h-[120px]"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Nota sobre el proceso de acompañamiento psicopedagógico del grado
                </p>
              </div>

              <div>
                <Label htmlFor="attachments">Archivos Adjuntos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    Seleccionar Archivos
                  </Button>
                  {noteData.attachments.length > 0 && (
                    <div className="mt-4 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">Archivos seleccionados:</p>
                      {noteData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm">{file}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setNoteData(prev => ({
                              ...prev,
                              attachments: prev.attachments.filter((_, i) => i !== index)
                            }))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowNoteModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-gada text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Nota
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-institutional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
              Panel de Convivencia
            </h1>
            <p className="text-gray-600 mt-2">Bienvenida, {user.name}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Coordinadora de Convivencia
              </Badge>
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                ✓ Todas las sesiones habilitadas
              </Badge>
            </div>
            
            {/* Información de acceso completo */}
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800 font-medium">Acceso Completo al Sistema</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Como Coordinadora de Convivencia tiene acceso a todas las funcionalidades: gestión de notas para boletín, 
                reportes manuales, archivos adjuntos y administración de períodos académicos sin restricciones.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border-amber-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-amber-700">Incidentes</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 border-green-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Resueltos</p>
                  <p className="text-2xl font-bold text-green-900">{stats.resolvedIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-50 border-red-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">Pendientes</p>
                  <p className="text-2xl font-bold text-red-900">{stats.pendingIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="notes" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Notas de Convivencia
            </TabsTrigger>
            <TabsTrigger value="incidents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Incidentes
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Seguimiento Comportamental
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <BookOpen className="mr-2 h-5 w-5 text-blue-600" />
                      Gestión de Notas de Convivencia para Boletín
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Administre las notas de convivencia y acompañamiento que aparecerán en los boletines por grado y período.
                      <span className="text-green-600 font-medium"> Todas las sesiones están habilitadas.</span>
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowNoteModal(true)}
                    className="bg-gradient-gada text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Nueva Nota
                  </Button>
                </div>
                
                <div className="flex space-x-4 mt-4">
                  <div>
                    <Label htmlFor="grade">Filtrar por Grado</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los grados</SelectItem>
                        {grades.slice(1).map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="period">Filtrar por Período</Label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        {periods.map((period) => (
                          <SelectItem key={period.id} value={period.id.toString()}>
                            {period.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Indicador de períodos habilitados */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Todas las sesiones académicas están habilitadas</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Puede crear y editar notas de convivencia para cualquier período académico sin restricciones.
                    </p>
                  </div>

                  {/* Grid de notas existentes */}
                  <div className="grid gap-4">
                    {Object.entries(convivenceNotes)
                      .filter(([key]) => {
                        if (selectedGrade === 'all' && selectedPeriod === '1') return true;
                        const [grade, period] = key.split('_');
                        if (selectedGrade !== 'all' && grade !== selectedGrade) return false;
                        if (period !== selectedPeriod) return false;
                        return true;
                      })
                      .map(([key, note]) => (
                        <Card key={key} className="border border-blue-200 hover:shadow-md transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-blue-100 text-blue-800">
                                  Grado {note.grade}
                                </Badge>
                                <Badge className="bg-purple-100 text-purple-800">
                                  {periods.find(p => p.id.toString() === note.period)?.name || `Período ${note.period}`}
                                </Badge>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Activo
                                </Badge>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => {
                                    // Editar nota existente
                                    setShowNoteModal(true);
                                  }}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  Editar
                                </Button>
                                <Button 
                                  size="sm"
                                  className="bg-gradient-to-r from-teal-500 to-blue-500 text-white"
                                >
                                  <Download className="mr-1 h-3 w-3" />
                                  Aplicar
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-1">Convivencia:</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {note.behaviorNote.length > 150 
                                    ? `${note.behaviorNote.substring(0, 150)}...` 
                                    : note.behaviorNote
                                  }
                                </p>
                              </div>
                              <div>
                                <h4 className="font-medium text-sm text-gray-700 mb-1">Acompañamiento:</h4>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {note.accompanimentNote.length > 150 
                                    ? `${note.accompanimentNote.substring(0, 150)}...` 
                                    : note.accompanimentNote
                                  }
                                </p>
                              </div>
                              {note.attachments && note.attachments.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700 mb-1">Adjuntos:</h4>
                                  <div className="flex flex-wrap gap-1">
                                    {note.attachments.map((file, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {file}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div className="text-xs text-gray-500 border-t pt-2">
                                Creado por {note.createdBy} • {new Date(note.createdAt).toLocaleDateString('es-CO')}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    
                    {Object.keys(convivenceNotes).length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No hay notas de convivencia registradas</p>
                        <p className="text-sm mb-4">Comience creando la primera nota para un grado y período</p>
                        <Button 
                          onClick={() => setShowNoteModal(true)}
                          className="bg-gradient-gada text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Crear Primera Nota
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="incidents" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-purple-600" />
                  Gestión de Incidentes
                </CardTitle>
                <div className="flex space-x-4 mt-4">
                  <div>
                    <Label htmlFor="grade">Grado</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {grades.slice(1).map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-medium text-gray-700">Fecha</th>
                        <th className="text-left p-3 font-medium text-gray-700">Estudiante</th>
                        <th className="text-left p-3 font-medium text-gray-700">Tipo</th>
                        <th className="text-left p-3 font-medium text-gray-700">Severidad</th>
                        <th className="text-left p-3 font-medium text-gray-700">Estado</th>
                        <th className="text-left p-3 font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((incident) => {
                        const student = allStudents.find(s => s.id === incident.studentId);
                        return (
                          <tr key={incident.id} className="border-b hover:bg-gradient-hover transition-colors">
                            <td className="p-3">{incident.date}</td>
                            <td className="p-3 font-medium">{student?.name || 'N/A'}</td>
                            <td className="p-3">{incident.type}</td>
                            <td className="p-3">
                              <Badge variant={incident.severity === 'Grave' ? 'destructive' : incident.severity === 'Moderado' ? 'default' : 'secondary'}>
                                {incident.severity}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={incident.resolved ? 'default' : 'secondary'}>
                                {incident.resolved ? 'Resuelto' : 'Pendiente'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="hover:bg-blue-50">
                                  <Eye className="mr-1 h-3 w-3" />
                                  Ver
                                </Button>
                                {!incident.resolved && (
                                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Resolver
                                  </Button>
                                )}
                              </div>
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

          <TabsContent value="behavior" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                  Seguimiento Comportamental por Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Seleccione un estudiante para ver su historial comportamental</p>
                  <p className="text-sm">Esta funcionalidad permite hacer seguimiento detallado del progreso comportamental</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Reportes Manuales */}
              <Card className="shadow-lg border-0 card-institutional">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-blue-600" />
                    Reportes Manuales
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Cree reportes personalizados de convivencia y comportamiento
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-teal-500 text-white h-16">
                      <div className="text-left">
                        <Calendar className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Reporte Mensual de Convivencia</p>
                        <p className="text-xs opacity-90">Generar informe completo del mes</p>
                      </div>
                    </Button>
                    
                    <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-blue-500 text-white h-16">
                      <div className="text-left">
                        <TrendingUp className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Estadísticas por Grado</p>
                        <p className="text-xs opacity-90">Análisis comportamental por curso</p>
                      </div>
                    </Button>
                    
                    <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-green-500 text-white h-16">
                      <div className="text-left">
                        <Shield className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Reporte de Incidentes</p>
                        <p className="text-xs opacity-90">Resumen de casos y seguimientos</p>
                      </div>
                    </Button>
                    
                    <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 text-white h-16">
                      <div className="text-left">
                        <FileText className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Reporte Personalizado</p>
                        <p className="text-xs opacity-90">Crear reporte con filtros específicos</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Gestión de Archivos */}
              <Card className="shadow-lg border-0 card-institutional">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Upload className="mr-2 h-5 w-5 text-green-600" />
                    Gestión de Archivos
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Administre documentos y archivos adjuntos del área de convivencia
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Zona de carga de archivos */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-2">Subir archivos de convivencia</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Formatos: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Máx. 10MB)
                      </p>
                      <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                        <Plus className="mr-2 h-4 w-4" />
                        Seleccionar Archivos
                      </Button>
                    </div>

                    {/* Archivos recientes */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-gray-700">Archivos Recientes</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="text-sm">Reglamento_Convivencia_2024.pdf</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-sm">Acta_Comite_Convivencia_Enero.docx</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-purple-600 mr-2" />
                            <span className="text-sm">Estadisticas_Comportamiento_Q1.xlsx</span>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white">
                      <Upload className="mr-2 h-4 w-4" />
                      Ver Todos los Archivos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Configuración de Períodos */}
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-orange-600" />
                  Configuración de Períodos Académicos
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Administre y configure los períodos académicos para el manejo de notas de convivencia
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {periods.map((period) => (
                    <Card key={period.id} className="border border-green-200 bg-green-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-green-800">{period.name}</h4>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <p className="text-xs text-green-700 mb-2">
                          {period.startDate} - {period.endDate}
                        </p>
                        <Badge className="bg-green-200 text-green-800 text-xs">
                          Habilitado
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Estado del Sistema: Totalmente Operativo</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Todos los períodos académicos están habilitados para la gestión de notas de convivencia. 
                    Puede crear, editar y administrar contenido en cualquier período sin restricciones.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modales */}
        {showNoteModal && <ConvivenceNoteModal />}
      </div>
    </div>
  );
};

export default ConvivenciaDashboard;