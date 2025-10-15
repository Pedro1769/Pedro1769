import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card.jsx';
import { Button } from '../../ui/button.jsx';
import { Input } from '../../ui/input.jsx';
import { Badge } from '../../ui/badge.jsx';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import {
  Plus,
  BookOpen,
  Calendar,
  Upload,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  FileText,
  Users
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

const ActividadesTareas = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  
  // Formulario para crear actividad
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity_type: 'Tarea',
    subject: user.subjects?.[0] || '',
    grade: user.grade || user.grades?.[0] || '',
    period: 'I',
    due_date: '',
    max_score: 5.0,
    instructions: ''
  });

  const activityTypes = ['Tarea', 'Taller', 'Actividad', 'Recuperación', 'Evaluación'];
  const periods = ['I', 'II', 'III', 'IV'];
  
  // Materias según tipo de docente
  const subjects = user.role === 'docente_primaria'
    ? ['HUMANIDADES', 'INGLÉS', 'MATEMÁTICA', 'GEOMETRÍA', 'ESTADÍSTICA', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES']
    : ['HUMANIDADES', 'LENGUA CASTELLANA', 'INGLÉS', 'MATEMÁTICA', 'BIOLOGÍA', 'QUÍMICA', 'FÍSICA'];

  const grades = user.role === 'docente_primaria'
    ? ['1°', '2°', '3°', '4°', '5°']
    : ['6°', '7°', '8°', '9°', '10°', '11°'];

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('gaa_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activities/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las actividades',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateActivity = async () => {
    try {
      // Validar campos requeridos
      if (!formData.title || !formData.description || !formData.due_date) {
        toast({
          title: 'Campos requeridos',
          description: 'Por favor completa todos los campos obligatorios',
          variant: 'destructive'
        });
        return;
      }

      const token = localStorage.getItem('gaa_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activities/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          due_date: new Date(formData.due_date).toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: 'Actividad creada',
          description: 'La actividad se ha creado exitosamente'
        });
        setShowCreateModal(false);
        loadActivities();
        // Resetear formulario
        setFormData({
          title: '',
          description: '',
          activity_type: 'Tarea',
          subject: user.subjects?.[0] || '',
          grade: user.grade || user.grades?.[0] || '',
          period: 'I',
          due_date: '',
          max_score: 5.0,
          instructions: ''
        });
      } else {
        throw new Error('Error al crear actividad');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la actividad',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      const token = localStorage.getItem('gaa_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activities/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast({
          title: 'Actividad eliminada',
          description: 'La actividad se ha eliminado exitosamente'
        });
        loadActivities();
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la actividad',
        variant: 'destructive'
      });
    }
  };

  const loadSubmissions = async (activityId) => {
    try {
      const token = localStorage.getItem('gaa_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activities/${activityId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions(data);
        setShowSubmissionsModal(true);
      }
    } catch (error) {
      console.error('Error al cargar entregas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las entregas',
        variant: 'destructive'
      });
    }
  };

  const handleGradeSubmission = async (submissionId, grade, feedback) => {
    try {
      const token = localStorage.getItem('gaa_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/activities/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          grade: parseFloat(grade),
          teacher_feedback: feedback
        })
      });

      if (response.ok) {
        toast({
          title: 'Calificación guardada',
          description: 'La calificación se ha registrado exitosamente'
        });
        // Recargar entregas
        if (selectedActivity) {
          loadSubmissions(selectedActivity._id);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la calificación',
        variant: 'destructive'
      });
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'Tarea': 'bg-blue-500',
      'Taller': 'bg-green-500',
      'Actividad': 'bg-purple-500',
      'Recuperación': 'bg-orange-500',
      'Evaluación': 'bg-red-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Pendiente': 'outline',
      'Enviada': 'secondary',
      'Calificada': 'default',
      'Retrasada': 'destructive'
    };
    return variants[status] || 'outline';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5" />
                <span>Actividades y Tareas</span>
              </CardTitle>
              <CardDescription>
                Gestiona actividades, tareas, talleres y recuperaciones para tus estudiantes
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de actividades */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">Cargando actividades...</p>
          </CardContent>
        </Card>
      ) : activities.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">No hay actividades creadas</p>
            <p className="text-center text-sm text-gray-400 mt-2">Crea tu primera actividad para comenzar</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activities.map((activity) => (
            <Card key={activity._id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge className={`${getActivityTypeColor(activity.activity_type)} text-white`}>
                        {activity.activity_type}
                      </Badge>
                      <h3 className="text-lg font-semibold">{activity.title}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{activity.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <BookOpen className="h-4 w-4" />
                        <span>{activity.subject}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>Grado {activity.grade}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Período {activity.period}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Hasta: {new Date(activity.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedActivity(activity);
                        loadSubmissions(activity._id);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Entregas
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteActivity(activity._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear Actividad */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Nueva Actividad</DialogTitle>
            <DialogDescription>
              Completa la información para crear una nueva actividad o tarea
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej: Tarea de Matemáticas - Ecuaciones"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descripción *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe la actividad..."
                className="w-full p-2 border rounded-md resize-none"
                rows="3"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="activity_type">Tipo *</Label>
                <Select
                  value={formData.activity_type}
                  onValueChange={(value) => setFormData({ ...formData, activity_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="subject">Materia *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="grade">Grado *</Label>
                <Select
                  value={formData.grade}
                  onValueChange={(value) => setFormData({ ...formData, grade: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="period">Período *</Label>
                <Select
                  value={formData.period}
                  onValueChange={(value) => setFormData({ ...formData, period: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {periods.map(period => (
                      <SelectItem key={period} value={period}>{period}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="due_date">Fecha límite *</Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="max_score">Calificación máxima</Label>
                <Input
                  id="max_score"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instructions">Instrucciones adicionales</Label>
              <textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                placeholder="Instrucciones o recursos adicionales..."
                className="w-full p-2 border rounded-md resize-none"
                rows="2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateActivity} className="bg-blue-600 hover:bg-blue-700">
              Crear Actividad
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Entregas */}
      <Dialog open={showSubmissionsModal} onOpenChange={setShowSubmissionsModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Entregas de: {selectedActivity?.title}</DialogTitle>
            <DialogDescription>
              Revisa y califica las entregas de los estudiantes
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay entregas aún</p>
            ) : (
              submissions.map((submission) => (
                <Card key={submission._id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{submission.student_name}</h4>
                          <Badge variant={getStatusBadge(submission.status)}>
                            {submission.status}
                          </Badge>
                          {submission.is_late && (
                            <Badge variant="destructive">Entrega tardía</Badge>
                          )}
                        </div>
                        
                        {submission.comments && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Comentario:</strong> {submission.comments}
                          </p>
                        )}
                        
                        {submission.submitted_at && (
                          <p className="text-xs text-gray-500">
                            Entregado: {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        )}
                        
                        {submission.grade && (
                          <div className="mt-2 p-2 bg-green-50 rounded">
                            <p className="text-sm font-semibold text-green-700">
                              Calificación: {submission.grade}/5.0
                            </p>
                            {submission.teacher_feedback && (
                              <p className="text-sm text-green-600">
                                Retroalimentación: {submission.teacher_feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {submission.status === 'Enviada' && (
                        <div className="ml-4">
                          <Button
                            size="sm"
                            onClick={() => {
                              const grade = prompt('Calificación (0-5):');
                              const feedback = prompt('Retroalimentación:');
                              if (grade) {
                                handleGradeSubmission(submission._id, grade, feedback);
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Calificar
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActividadesTareas;
