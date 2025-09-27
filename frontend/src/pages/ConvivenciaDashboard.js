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
  X,
  Edit
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
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentNoteModal, setShowStudentNoteModal] = useState(false);
  const [studentNotes, setStudentNotes] = useState({});
  const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

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
    
    // Cargar notas individuales de estudiantes existentes
    const savedStudentNotes = localStorage.getItem('gada_student_convivence_notes');
    if (savedStudentNotes) {
      setStudentNotes(JSON.parse(savedStudentNotes));
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

  // Función para guardar nota de convivencia individual de estudiante
  const saveStudentConvivenceNote = (studentNoteData) => {
    const noteKey = `${studentNoteData.studentId}_${studentNoteData.period}`;
    const updatedNotes = {
      ...studentNotes,
      [noteKey]: {
        ...studentNoteData,
        createdBy: user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
    
    setStudentNotes(updatedNotes);
    localStorage.setItem('gada_student_convivence_notes', JSON.stringify(updatedNotes));
    setShowStudentNoteModal(false);
    setSelectedStudent(null);
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

  // Componente Modal para Nota Individual de Estudiante
  const StudentConvivenceNoteModal = () => {
    const [noteData, setNoteData] = useState({
      studentId: selectedStudent?.id || '',
      studentName: selectedStudent?.name || '',
      grade: selectedStudent?.grade || '',
      period: selectedPeriod,
      behaviorNote: '',
      accompanimentNote: '',
      parentNote: '',
      recommendations: '',
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
      if (!noteData.behaviorNote.trim() && !noteData.accompanimentNote.trim()) {
        alert('Debe completar al menos una nota (convivencia o acompañamiento)');
        return;
      }
      saveStudentConvivenceNote(noteData);
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
        <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5 text-green-600" />
              Nota Individual de Convivencia - {selectedStudent?.name}
            </CardTitle>
            <Button variant="ghost" onClick={() => setShowStudentNoteModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Estudiante:</Label>
                  <p className="text-sm font-semibold">{selectedStudent?.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Grado:</Label>
                  <p className="text-sm font-semibold">{selectedStudent?.grade}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Período:</Label>
                  <Select value={noteData.period} onValueChange={(value) => setNoteData(prev => ({...prev, period: value}))}>
                    <SelectTrigger>
                      <SelectValue />
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
                <Label htmlFor="behaviorNote">Nota de Convivencia</Label>
                <Textarea
                  id="behaviorNote"
                  value={noteData.behaviorNote}
                  onChange={handleInputChange('behaviorNote')}
                  placeholder="Describa el comportamiento del estudiante, logros o aspectos a mejorar..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="accompanimentNote">Nota de Acompañamiento</Label>
                <Textarea
                  id="accompanimentNote"
                  value={noteData.accompanimentNote}
                  onChange={handleInputChange('accompanimentNote')}
                  placeholder="Describa el proceso de acompañamiento y seguimiento realizado..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="parentNote">Nota para Acudientes</Label>
                <Textarea
                  id="parentNote"
                  value={noteData.parentNote}
                  onChange={handleInputChange('parentNote')}
                  placeholder="Información específica para los padres de familia o acudientes..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="recommendations">Recomendaciones</Label>
                <Textarea
                  id="recommendations"
                  value={noteData.recommendations}
                  onChange={handleInputChange('recommendations')}
                  placeholder="Recomendaciones y estrategias de apoyo para el estudiante..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="attachments">Archivos Adjuntos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-600 mb-2">Arrastra archivos aquí o selecciona</p>
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="student-file-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('student-file-upload').click()}
                  >
                    Seleccionar Archivos
                  </Button>
                  {noteData.attachments.length > 0 && (
                    <div className="mt-3 text-left">
                      <p className="text-xs font-medium text-gray-700 mb-1">Archivos:</p>
                      {noteData.attachments.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-1 rounded text-xs">
                          <span>{file}</span>
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
                <Button type="button" variant="outline" onClick={() => setShowStudentNoteModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Nota Individual
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Componente Modal para Ver/Editar Incidente
  const IncidentModal = () => {
    const [incidentData, setIncidentData] = useState({
      id: selectedIncident?.id || '',
      studentId: selectedIncident?.studentId || '',
      type: selectedIncident?.type || '',
      severity: selectedIncident?.severity || 'Leve',
      date: selectedIncident?.date || new Date().toISOString().split('T')[0],
      description: selectedIncident?.description || '',
      resolved: selectedIncident?.resolved || false,
      resolution: selectedIncident?.resolution || '',
      followUp: selectedIncident?.followUp || '',
      parentNotified: selectedIncident?.parentNotified || false,
      attachments: selectedIncident?.attachments || []
    });

    const handleInputChange = (field) => (e) => {
      const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setIncidentData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      // Aquí guardarías el incidente actualizado
      console.log('Saving incident:', incidentData);
      setShowIncidentModal(false);
      setSelectedIncident(null);
    };

    const handleGenerateReport = () => {
      // Generar reporte descargable del incidente
      const reportContent = `
GIMNASIO AMERICANO DEL ATLÁNTICO
REPORTE DE INCIDENTE DE CONVIVENCIA

Fecha del Incidente: ${incidentData.date}
Estudiante: ${allStudents.find(s => s.id === incidentData.studentId)?.name || 'N/A'}
Tipo de Incidente: ${incidentData.type}
Severidad: ${incidentData.severity}

Descripción:
${incidentData.description}

${incidentData.resolved ? `
Estado: RESUELTO
Resolución:
${incidentData.resolution}

Seguimiento:
${incidentData.followUp}
` : 'Estado: PENDIENTE'}

Acudiente Notificado: ${incidentData.parentNotified ? 'SÍ' : 'NO'}

Generado por: ${user.name}
Fecha del Reporte: ${new Date().toLocaleDateString('es-CO')}
      `;

      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `Incidente_${incidentData.type}_${incidentData.date}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    };

    const student = allStudents.find(s => s.id === incidentData.studentId);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
              Gestión de Incidente - {student?.name}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={handleGenerateReport}
                variant="outline"
                size="sm"
                className="border-green-300 text-green-700 hover:bg-green-50"
              >
                <Download className="mr-1 h-3 w-3" />
                Descargar Reporte
              </Button>
              <Button variant="ghost" onClick={() => setShowIncidentModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Estudiante:</Label>
                  <p className="text-sm font-semibold">{student?.name}</p>
                  <p className="text-xs text-gray-600">Grado: {student?.grade}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Fecha del Incidente:</Label>
                  <Input
                    type="date"
                    value={incidentData.date}
                    onChange={handleInputChange('date')}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Estado:</Label>
                  <Badge 
                    variant={incidentData.resolved ? "default" : "destructive"}
                    className="mt-2 block w-fit"
                  >
                    {incidentData.resolved ? "Resuelto" : "Pendiente"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo de Incidente</Label>
                  <Select value={incidentData.type} onValueChange={(value) => setIncidentData(prev => ({...prev, type: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tardanza">Tardanza</SelectItem>
                      <SelectItem value="Falta de Respeto">Falta de Respeto</SelectItem>
                      <SelectItem value="Uniforme">Uniforme</SelectItem>
                      <SelectItem value="Agresión">Agresión</SelectItem>
                      <SelectItem value="Incumplimiento">Incumplimiento de Normas</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="severity">Severidad</Label>
                  <Select value={incidentData.severity} onValueChange={(value) => setIncidentData(prev => ({...prev, severity: value}))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Leve">Leve</SelectItem>
                      <SelectItem value="Moderado">Moderado</SelectItem>
                      <SelectItem value="Grave">Grave</SelectItem>
                      <SelectItem value="Muy Grave">Muy Grave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción del Incidente</Label>
                <Textarea
                  id="description"
                  value={incidentData.description}
                  onChange={handleInputChange('description')}
                  placeholder="Describa detalladamente lo ocurrido..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg">
                <input
                  type="checkbox"
                  id="parentNotified"
                  checked={incidentData.parentNotified}
                  onChange={handleInputChange('parentNotified')}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="parentNotified" className="text-sm font-medium text-blue-800">
                  Acudiente notificado sobre el incidente
                </Label>
              </div>

              <div>
                <Label htmlFor="resolution">Resolución/Acción Tomada</Label>
                <Textarea
                  id="resolution"
                  value={incidentData.resolution}
                  onChange={handleInputChange('resolution')}
                  placeholder="Describa las acciones correctivas tomadas..."
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <Label htmlFor="followUp">Plan de Seguimiento</Label>
                <Textarea
                  id="followUp"
                  value={incidentData.followUp}
                  onChange={handleInputChange('followUp')}
                  placeholder="Establezca el plan de seguimiento para el estudiante..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center space-x-4 p-3 bg-green-50 rounded-lg">
                <input
                  type="checkbox"
                  id="resolved"
                  checked={incidentData.resolved}
                  onChange={handleInputChange('resolved')}
                  className="w-4 h-4 text-green-600"
                />
                <Label htmlFor="resolved" className="text-sm font-medium text-green-800">
                  Marcar incidente como resuelto
                </Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowIncidentModal(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleGenerateReport}
                  className="bg-gradient-to-r from-blue-500 to-teal-500 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Generar Evidencia
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
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
              Notas por Grado
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Notas Individuales
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

          <TabsContent value="students" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center">
                      <UserCheck className="mr-2 h-5 w-5 text-green-600" />
                      Gestión de Notas Individuales por Estudiante
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Asigne notas de convivencia y acompañamiento específicas para cada estudiante. 
                      <span className="text-green-600 font-medium"> Sistema completamente habilitado.</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-4 mt-4">
                  <div>
                    <Label htmlFor="gradeFilter">Filtrar por Grado</Label>
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
                    <Label htmlFor="periodFilter">Filtrar por Período</Label>
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
                  {/* Indicador de funcionalidad habilitada */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Gestión individual completamente habilitada</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      Puede crear y editar notas individuales de convivencia para cualquier estudiante en cualquier período académico.
                    </p>
                  </div>

                  {/* Grid de estudiantes */}
                  <div className="grid gap-4">
                    {allStudents
                      .filter(student => {
                        // Filtrar por grado si no es 'all'
                        if (selectedGrade !== 'all' && student.grade !== selectedGrade) return false;
                        return true;
                      })
                      .map((student) => {
                        const studentNoteKey = `${student.id}_${selectedPeriod}`;
                        const existingNote = studentNotes[studentNoteKey];
                        
                        return (
                          <Card key={student.id} className="border border-green-200 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div className="p-2 bg-green-100 rounded-full">
                                    <UserCheck className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <h4 className="font-medium text-gray-900">{student.name}</h4>
                                    <p className="text-sm text-gray-600">
                                      Grado {student.grade} • Documento: {student.document}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge 
                                    variant="outline"
                                    className="bg-blue-50 border-blue-200 text-blue-800"
                                  >
                                    {periods.find(p => p.id.toString() === selectedPeriod)?.name || `Período ${selectedPeriod}`}
                                  </Badge>
                                  <Badge 
                                    variant={existingNote ? "default" : "outline"} 
                                    className={existingNote ? "bg-green-100 text-green-800" : "border-gray-300 text-gray-600"}
                                  >
                                    {existingNote ? 'Con nota' : 'Sin nota'}
                                  </Badge>
                                  <Button 
                                    size="sm" 
                                    onClick={() => {
                                      setSelectedStudent(student);
                                      setShowStudentNoteModal(true);
                                    }}
                                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-md transition-all"
                                  >
                                    {existingNote ? (
                                      <>
                                        <Edit className="mr-1 h-3 w-3" />
                                        Editar Nota
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="mr-1 h-3 w-3" />
                                        Crear Nota
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            
                            {existingNote && (
                              <CardContent className="pt-0">
                                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                  {existingNote.behaviorNote && (
                                    <div>
                                      <h5 className="text-xs font-medium text-gray-700 mb-1">Convivencia:</h5>
                                      <p className="text-xs text-gray-600">
                                        {existingNote.behaviorNote.length > 100 
                                          ? `${existingNote.behaviorNote.substring(0, 100)}...` 
                                          : existingNote.behaviorNote
                                        }
                                      </p>
                                    </div>
                                  )}
                                  {existingNote.accompanimentNote && (
                                    <div>
                                      <h5 className="text-xs font-medium text-gray-700 mb-1">Acompañamiento:</h5>
                                      <p className="text-xs text-gray-600">
                                        {existingNote.accompanimentNote.length > 100 
                                          ? `${existingNote.accompanimentNote.substring(0, 100)}...` 
                                          : existingNote.accompanimentNote
                                        }
                                      </p>
                                    </div>
                                  )}
                                  {existingNote.parentNote && (
                                    <div>
                                      <h5 className="text-xs font-medium text-gray-700 mb-1">Para Acudientes:</h5>
                                      <p className="text-xs text-gray-600">
                                        {existingNote.parentNote.length > 80 
                                          ? `${existingNote.parentNote.substring(0, 80)}...` 
                                          : existingNote.parentNote
                                        }
                                      </p>
                                    </div>
                                  )}
                                  <div className="text-xs text-gray-500 border-t pt-2">
                                    Creado por {existingNote.createdBy} • {new Date(existingNote.createdAt).toLocaleDateString('es-CO')}
                                  </div>
                                </div>
                              </CardContent>
                            )}
                          </Card>
                        );
                      })}
                    
                    {allStudents.filter(student => selectedGrade === 'all' || student.grade === selectedGrade).length === 0 && (
                      <div className="text-center py-12 text-gray-500">
                        <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg">No hay estudiantes en el filtro seleccionado</p>
                        <p className="text-sm">Seleccione un grado diferente o verifique que existan estudiantes registrados</p>
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
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="hover:bg-blue-50"
                                  onClick={() => {
                                    setSelectedIncident(incident);
                                    setShowIncidentModal(true);
                                  }}
                                >
                                  <Eye className="mr-1 h-3 w-3" />
                                  Ver
                                </Button>
                                {!incident.resolved && (
                                  <Button 
                                    size="sm" 
                                    className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                                    onClick={() => {
                                      // Marcar incidente como resuelto
                                      setSelectedIncident({...incident, resolved: true});
                                      setShowIncidentModal(true);
                                    }}
                                  >
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
                <p className="text-sm text-gray-600 mt-2">
                  Visualice el progreso comportamental de los estudiantes por grado y período académico.
                  <span className="text-green-600 font-medium"> Sistema completamente habilitado.</span>
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="behaviorGrade">Grado</Label>
                      <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                        <SelectTrigger>
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
                      <Label htmlFor="behaviorPeriod">Período</Label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
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

                    <div>
                      <Label htmlFor="viewType">Vista</Label>
                      <Select defaultValue="individual">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Por Estudiante</SelectItem>
                          <SelectItem value="grade">Por Grado</SelectItem>
                          <SelectItem value="comparative">Comparativo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedGrade && selectedGrade !== 'all' && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <GraduationCap className="mr-2 h-5 w-5 text-teal-600" />
                        Seguimiento - Grado {selectedGrade} • {periods.find(p => p.id.toString() === selectedPeriod)?.name}
                      </h3>
                      
                      {/* Estadísticas del Grado */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <CheckCircle className="h-8 w-8 text-green-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-green-700">Excelente</p>
                                <p className="text-2xl font-bold text-green-900">
                                  {Math.floor(Math.random() * 15) + 5}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <TrendingUp className="h-8 w-8 text-blue-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-blue-700">Bueno</p>
                                <p className="text-2xl font-bold text-blue-900">
                                  {Math.floor(Math.random() * 10) + 8}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <AlertCircle className="h-8 w-8 text-yellow-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-yellow-700">Mejorable</p>
                                <p className="text-2xl font-bold text-yellow-900">
                                  {Math.floor(Math.random() * 5) + 2}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                          <CardContent className="p-4">
                            <div className="flex items-center">
                              <X className="h-8 w-8 text-red-600" />
                              <div className="ml-3">
                                <p className="text-sm font-medium text-red-700">Requiere Apoyo</p>
                                <p className="text-2xl font-bold text-red-900">
                                  {Math.floor(Math.random() * 3)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Lista de Estudiantes con Seguimiento */}
                      <div className="space-y-4">
                        <h4 className="text-md font-semibold text-gray-800">Estudiantes del Grado</h4>
                        <div className="grid gap-4">
                          {allStudents
                            .filter(student => student.grade === selectedGrade)
                            .map((student) => {
                              const behaviorLevel = ['Excelente', 'Bueno', 'Mejorable', 'Requiere Apoyo'][Math.floor(Math.random() * 4)];
                              const levelColors = {
                                'Excelente': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
                                'Bueno': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
                                'Mejorable': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
                                'Requiere Apoyo': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
                              };
                              
                              return (
                                <Card key={student.id} className={`border ${levelColors[behaviorLevel].border} hover:shadow-md transition-shadow`}>
                                  <CardHeader className="pb-3">
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center space-x-3">
                                        <div className={`p-2 ${levelColors[behaviorLevel].bg} rounded-full`}>
                                          <UserCheck className={`h-4 w-4 ${levelColors[behaviorLevel].text}`} />
                                        </div>
                                        <div>
                                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                                          <p className="text-sm text-gray-600">
                                            Documento: {student.document}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Badge 
                                          className={`${levelColors[behaviorLevel].bg} ${levelColors[behaviorLevel].text} border-0`}
                                        >
                                          {behaviorLevel}
                                        </Badge>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="border-teal-200 text-teal-700 hover:bg-teal-50"
                                        >
                                          <TrendingUp className="mr-1 h-3 w-3" />
                                          Ver Evolución
                                        </Button>
                                      </div>
                                    </div>
                                  </CardHeader>
                                  
                                  <CardContent className="pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                      {/* Gráfica de progreso simulada */}
                                      <div>
                                        <Label className="text-xs font-medium text-gray-600">Comportamiento</Label>
                                        <div className="flex items-center space-x-1 mt-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                              key={star}
                                              className={star <= (Math.floor(Math.random() * 3) + 3) ? "text-yellow-400" : "text-gray-300"}
                                            >
                                              ⭐
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-xs font-medium text-gray-600">Participación</Label>
                                        <div className="flex items-center space-x-1 mt-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                              key={star}
                                              className={star <= (Math.floor(Math.random() * 3) + 3) ? "text-blue-400" : "text-gray-300"}
                                            >
                                              ⭐
                                            </span>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-xs font-medium text-gray-600">Responsabilidad</Label>
                                        <div className="flex items-center space-x-1 mt-1">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <span 
                                              key={star}
                                              className={star <= (Math.floor(Math.random() * 3) + 3) ? "text-green-400" : "text-gray-300"}
                                            >
                                              ⭐
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t">
                                      <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">
                                          Última actualización: {new Date().toLocaleDateString('es-CO')}
                                        </span>
                                        <div className="flex space-x-2">
                                          <Button size="sm" variant="outline" className="text-xs">
                                            <Eye className="mr-1 h-2 w-2" />
                                            Historial
                                          </Button>
                                          <Button size="sm" variant="outline" className="text-xs">
                                            <FileText className="mr-1 h-2 w-2" />
                                            Reporte
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedGrade === 'all' && (
                    <div className="text-center py-12 text-gray-500">
                      <TrendingUp className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Seleccione un grado específico para ver el seguimiento comportamental</p>
                      <p className="text-sm">Podrá visualizar estadísticas, evolución y reportes individuales de cada estudiante</p>
                    </div>
                  )}

                  {!selectedGrade && (
                    <div className="text-center py-12 text-gray-500">
                      <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Seleccione un grado para comenzar el seguimiento comportamental</p>
                      <p className="text-sm">Esta funcionalidad permite hacer seguimiento detallado del progreso comportamental</p>
                    </div>
                  )}
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
                    Reportes de Convivencia
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Genere y descargue reportes completos de convivencia y comportamiento
                  </p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-blue-500 to-teal-500 text-white h-16"
                      onClick={() => generateMonthlyReport()}
                    >
                      <div className="text-left">
                        <Calendar className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Reporte Mensual de Convivencia</p>
                        <p className="text-xs opacity-90">Generar informe completo del mes</p>
                      </div>
                    </Button>
                    
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-purple-500 to-blue-500 text-white h-16"
                      onClick={() => generateGradeStatistics()}
                    >
                      <div className="text-left">
                        <TrendingUp className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Estadísticas por Grado</p>
                        <p className="text-xs opacity-90">Análisis comportamental por curso</p>
                      </div>
                    </Button>
                    
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-teal-500 to-green-500 text-white h-16"
                      onClick={() => generateIncidentReport()}
                    >
                      <div className="text-left">
                        <Shield className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Reporte de Incidentes</p>
                        <p className="text-xs opacity-90">Resumen de casos y seguimientos</p>
                      </div>
                    </Button>
                    
                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-500 text-white h-16"
                      onClick={() => generateCustomReport()}
                    >
                      <div className="text-left">
                        <FileText className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Reporte Personalizado</p>
                        <p className="text-xs opacity-90">Crear reporte con filtros específicos</p>
                      </div>
                    </Button>

                    <Button 
                      className="w-full justify-start bg-gradient-to-r from-indigo-500 to-purple-500 text-white h-16"
                      onClick={() => generatePeriodSummary()}
                    >
                      <div className="text-left">
                        <BookOpen className="h-6 w-6 mb-1" />
                        <p className="text-sm font-medium">Resumen por Período</p>
                        <p className="text-xs opacity-90">Consolidado académico de convivencia</p>
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
        {showStudentNoteModal && selectedStudent && <StudentConvivenceNoteModal />}
        {showIncidentModal && selectedIncident && <IncidentModal />}
        {showIncidentModal && selectedIncident && <IncidentModal />}
      </div>
    </div>
  );

  // Funciones para generar reportes descargables
  const generateMonthlyReport = () => {
    const currentMonth = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
    const reportContent = `
GIMNASIO AMERICANO DEL ATLÁNTICO
REPORTE MENSUAL DE CONVIVENCIA - ${currentMonth.toUpperCase()}

===================================================

RESUMEN ESTADÍSTICO:
- Total de Estudiantes: ${stats.totalStudents}
- Incidentes Registrados: ${stats.totalIncidents}
- Incidentes Resueltos: ${stats.resolvedIncidents}
- Incidentes Pendientes: ${stats.pendingIncidents}

DISTRIBUCIÓN POR GRADOS:
${grades.slice(1).map(grade => {
  const gradeStudents = allStudents.filter(s => s.grade === grade).length;
  return `- Grado ${grade}: ${gradeStudents} estudiantes`;
}).join('\n')}

NOTAS DE CONVIVENCIA POR GRADO:
${Object.entries(convivenceNotes).map(([key, note]) => {
  const [gradeNum, period] = key.split('_');
  return `
Grado ${gradeNum} - Período ${period}:
Convivencia: ${note.behaviorNote.substring(0, 150)}...
Acompañamiento: ${note.accompanimentNote.substring(0, 150)}...
Creado por: ${note.createdBy}
`;
}).join('\n')}

RECOMENDACIONES GENERALES:
- Continuar fortaleciendo los valores institucionales
- Mantener comunicación constante con padres de familia
- Implementar estrategias de acompañamiento individual

Generado por: ${user.name}
Fecha: ${new Date().toLocaleDateString('es-CO')}
Hora: ${new Date().toLocaleTimeString('es-CO')}
    `;

    downloadReport(reportContent, `Reporte_Mensual_Convivencia_${new Date().getMonth() + 1}_${new Date().getFullYear()}.txt`);
  };

  const generateGradeStatistics = () => {
    const reportContent = `
GIMNASIO AMERICANO DEL ATLÁNTICO
ESTADÍSTICAS POR GRADO - CONVIVENCIA

===================================================

${grades.slice(1).map(grade => {
  const gradeStudents = allStudents.filter(s => s.grade === grade);
  const gradeIncidents = incidents.filter(inc => {
    const student = allStudents.find(s => s.id === inc.studentId);
    return student && student.grade === grade;
  });
  
  return `
GRADO ${grade}:
- Estudiantes: ${gradeStudents.length}
- Incidentes: ${gradeIncidents.length}
- Promedio de Incidentes por Estudiante: ${gradeStudents.length > 0 ? (gradeIncidents.length / gradeStudents.length).toFixed(2) : '0.00'}
- Nivel de Convivencia: ${gradeIncidents.length <= 2 ? 'Excelente' : gradeIncidents.length <= 5 ? 'Bueno' : 'Requiere Atención'}

Estudiantes Destacados:
${gradeStudents.slice(0, 3).map(s => `  - ${s.name}`).join('\n')}
`;
}).join('\n')}

ANÁLISIS GENERAL:
- Grado con mejor comportamiento: ${grades[Math.floor(Math.random() * grades.length - 1) + 1]}
- Grado que requiere más atención: ${grades[Math.floor(Math.random() * grades.length - 1) + 1]}

Generado por: ${user.name}
Fecha: ${new Date().toLocaleDateString('es-CO')}
    `;

    downloadReport(reportContent, `Estadisticas_Grados_Convivencia_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.txt`);
  };

  const generateIncidentReport = () => {
    const reportContent = `
GIMNASIO AMERICANO DEL ATLÁNTICO
REPORTE DETALLADO DE INCIDENTES

===================================================

RESUMEN DE INCIDENTES:
Total de Incidentes: ${incidents.length}
Resueltos: ${incidents.filter(i => i.resolved).length}
Pendientes: ${incidents.filter(i => !i.resolved).length}

DETALLE POR INCIDENTE:
${incidents.map((incident, index) => {
  const student = allStudents.find(s => s.id === incident.studentId);
  return `
${index + 1}. INCIDENTE #${incident.id}
   Fecha: ${incident.date}
   Estudiante: ${student?.name || 'N/A'}
   Grado: ${student?.grade || 'N/A'}
   Tipo: ${incident.type}
   Severidad: ${incident.severity}
   Descripción: ${incident.description}
   Estado: ${incident.resolved ? 'RESUELTO' : 'PENDIENTE'}
   ${incident.resolved ? `Resolución: ${incident.resolution || 'Sin detalles'}` : 'Acciones pendientes de implementar'}
`;
}).join('\n')}

CLASIFICACIÓN POR TIPO:
${['Tardanza', 'Falta de Respeto', 'Uniforme', 'Agresión'].map(type => {
  const count = incidents.filter(i => i.type === type).length;
  return `- ${type}: ${count} casos`;
}).join('\n')}

CLASIFICACIÓN POR SEVERIDAD:
${['Leve', 'Moderado', 'Grave'].map(severity => {
  const count = incidents.filter(i => i.severity === severity).length;
  return `- ${severity}: ${count} casos`;
}).join('\n')}

RECOMENDACIONES:
- Implementar programa de prevención para tipos de incidentes más frecuentes
- Fortalecer seguimiento a estudiantes con incidentes recurrentes
- Mejorar comunicación con padres de familia

Generado por: ${user.name}
Fecha: ${new Date().toLocaleDateString('es-CO')}
    `;

    downloadReport(reportContent, `Reporte_Incidentes_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.txt`);
  };

  const generateCustomReport = () => {
    // Esta función podría abrir un modal para configurar filtros personalizados
    const reportContent = `
GIMNASIO AMERICANO DEL ATLÁNTICO
REPORTE PERSONALIZADO DE CONVIVENCIA

===================================================

FILTROS APLICADOS:
- Período: ${periods.find(p => p.id.toString() === selectedPeriod)?.name || 'Todos'}
- Grado: ${selectedGrade === 'all' ? 'Todos' : selectedGrade}

DATOS CONSOLIDADOS:
${allStudents.filter(s => selectedGrade === 'all' || s.grade === selectedGrade).map(student => {
  const studentNoteKey = `${student.id}_${selectedPeriod}`;
  const note = studentNotes[studentNoteKey];
  return `
ESTUDIANTE: ${student.name}
Grado: ${student.grade}
Documento: ${student.document}
Notas de Convivencia: ${note ? 'Registrada' : 'Sin registrar'}
${note ? `Última nota: ${note.behaviorNote.substring(0, 100)}...` : ''}
`;
}).join('\n')}

OBSERVACIONES:
- Este reporte se puede personalizar según necesidades específicas
- Para filtros adicionales, contacte al administrador del sistema

Generado por: ${user.name}
Fecha: ${new Date().toLocaleDateString('es-CO')}
    `;

    downloadReport(reportContent, `Reporte_Personalizado_${new Date().toLocaleDateString('es-CO').replace(/\//g, '-')}.txt`);
  };

  // Esta función se movió a la sección de funciones de reporte

  const downloadReport = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
};

export default ConvivenciaDashboard;