import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  AlertTriangle,
  BookOpen,
  FileText,
  Video,
  Download,
  Send,
  Plus,
  X,
  Target,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';

const SistemaAyudaPersonalizada = ({ studentData, teacher, onClose }) => {
  const [ayudaData, setAyudaData] = useState({
    tipo: '',
    descripcion: '',
    materiales: [],
    actividades: [],
    fechaLimite: '',
    prioridad: 'media'
  });
  const [newMaterial, setNewMaterial] = useState({ tipo: '', titulo: '', contenido: '', archivo: null });
  const [newActividad, setNewActividad] = useState({ titulo: '', descripcion: '', fechaLimite: '' });
  const [ayudasExistentes, setAyudasExistentes] = useState([]);

  useEffect(() => {
    // Cargar ayudas existentes para este estudiante
    const existingHelps = JSON.parse(localStorage.getItem(`gada_ayuda_${studentData.id}`) || '[]');
    setAyudasExistentes(existingHelps);
  }, [studentData]);

  const tiposAyuda = [
    { value: 'refuerzo-academico', label: 'Refuerzo Académico', color: 'bg-blue-100 text-blue-800' },
    { value: 'material-didactico', label: 'Material Didáctico', color: 'bg-green-100 text-green-800' },
    { value: 'tutoria-individual', label: 'Tutoría Individual', color: 'bg-purple-100 text-purple-800' },
    { value: 'actividades-casa', label: 'Actividades para Casa', color: 'bg-orange-100 text-orange-800' },
    { value: 'evaluacion-adaptada', label: 'Evaluación Adaptada', color: 'bg-yellow-100 text-yellow-800' }
  ];

  const tiposMaterial = [
    { value: 'video', label: '📹 Video Explicativo', icon: Video },
    { value: 'documento', label: '📄 Documento PDF', icon: FileText },
    { value: 'presentacion', label: '📊 Presentación', icon: BookOpen },
    { value: 'enlace', label: '🔗 Enlace Web', icon: Download }
  ];

  const agregarMaterial = () => {
    if (!newMaterial.titulo || !newMaterial.contenido) {
      alert('Complete todos los campos del material');
      return;
    }

    const material = {
      id: Date.now(),
      ...newMaterial,
      fechaCreacion: new Date().toISOString()
    };

    setAyudaData(prev => ({
      ...prev,
      materiales: [...prev.materiales, material]
    }));

    setNewMaterial({ tipo: '', titulo: '', contenido: '', archivo: null });
  };

  const agregarActividad = () => {
    if (!newActividad.titulo || !newActividad.descripcion) {
      alert('Complete todos los campos de la actividad');
      return;
    }

    const actividad = {
      id: Date.now(),
      ...newActividad,
      completada: false,
      fechaCreacion: new Date().toISOString()
    };

    setAyudaData(prev => ({
      ...prev,
      actividades: [...prev.actividades, actividad]
    }));

    setNewActividad({ titulo: '', descripcion: '', fechaLimite: '' });
  };

  const crearPlanAyuda = () => {
    if (!ayudaData.tipo || !ayudaData.descripcion) {
      alert('Complete los campos requeridos');
      return;
    }

    const nuevaAyuda = {
      id: Date.now(),
      ...ayudaData,
      studentId: studentData.id,
      teacherId: teacher.id,
      teacherName: teacher.name,
      fechaCreacion: new Date().toISOString(),
      estado: 'activo'
    };

    const ayudasActualizadas = [...ayudasExistentes, nuevaAyuda];
    localStorage.setItem(`gada_ayuda_${studentData.id}`, JSON.stringify(ayudasActualizadas));
    
    // También guardar en historial general
    const historialGeneral = JSON.parse(localStorage.getItem('gada_ayudas_historial') || '[]');
    historialGeneral.push(nuevaAyuda);
    localStorage.setItem('gada_ayudas_historial', JSON.stringify(historialGeneral));

    alert('Plan de ayuda creado exitosamente');
    onClose();
  };

  const getPrioridadColor = (prioridad) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'necesita-apoyo':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: AlertTriangle,
          mensaje: 'Este estudiante necesita apoyo adicional'
        };
      case 'reprobado':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertTriangle,
          mensaje: 'Este estudiante está en riesgo de reprobación'
        };
      default:
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Target,
          mensaje: 'Plan de mejora académica'
        };
    }
  };

  const statusInfo = getStatusInfo(studentData.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-5xl max-h-[95vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                🎯 SISTEMA DE AYUDA PERSONALIZADA
              </CardTitle>
              <p className="text-orange-100">
                Plan de apoyo académico para {studentData.name}
              </p>
            </div>
            <Button onClick={onClose} variant="secondary" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          {/* Información del estudiante */}
          <div className="mb-6">
            <Card className={`border-2 ${statusInfo.color.replace('text-', 'border-').replace('100', '200')}`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <StatusIcon className="h-8 w-8" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{studentData.name}</h3>
                    <p className="text-sm text-gray-600">
                      Grado {studentData.grade} | Promedio: {studentData.overallAverage || 'N/A'}
                    </p>
                    <Badge className={statusInfo.color}>
                      {statusInfo.mensaje}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Docente: {teacher.name}</p>
                    <p className="text-xs text-gray-600">
                      {new Date().toLocaleDateString('es-CO')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario para crear nueva ayuda */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">✨ Crear Plan de Ayuda</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Ayuda *</Label>
                    <Select value={ayudaData.tipo} onValueChange={(value) => setAyudaData(prev => ({...prev, tipo: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposAyuda.map(tipo => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Prioridad</Label>
                      <Select value={ayudaData.prioridad} onValueChange={(value) => setAyudaData(prev => ({...prev, prioridad: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alta">🔴 Alta</SelectItem>
                          <SelectItem value="media">🟡 Media</SelectItem>
                          <SelectItem value="baja">🟢 Baja</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Fecha Límite</Label>
                      <Input
                        type="date"
                        value={ayudaData.fechaLimite}
                        onChange={(e) => setAyudaData(prev => ({...prev, fechaLimite: e.target.value}))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Descripción del Plan *</Label>
                    <Textarea
                      value={ayudaData.descripcion}
                      onChange={(e) => setAyudaData(prev => ({...prev, descripcion: e.target.value}))}
                      placeholder="Describe las dificultades identificadas y el plan de apoyo..."
                      className="min-h-[80px]"
                    />
                  </div>

                  {/* Sección para agregar materiales */}
                  <Card className="bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">📚 Material de Apoyo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Select value={newMaterial.tipo} onValueChange={(value) => setNewMaterial(prev => ({...prev, tipo: value}))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo de material" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposMaterial.map(tipo => (
                              <SelectItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Título del material"
                          value={newMaterial.titulo}
                          onChange={(e) => setNewMaterial(prev => ({...prev, titulo: e.target.value}))}
                        />
                      </div>

                      <Textarea
                        placeholder="Contenido/URL del material..."
                        value={newMaterial.contenido}
                        onChange={(e) => setNewMaterial(prev => ({...prev, contenido: e.target.value}))}
                        className="min-h-[60px]"
                      />

                      <Button onClick={agregarMaterial} size="sm" className="w-full" disabled={!newMaterial.tipo || !newMaterial.titulo}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Material
                      </Button>

                      {/* Lista de materiales agregados */}
                      {ayudaData.materiales.length > 0 && (
                        <div className="space-y-2">
                          {ayudaData.materiales.map(material => (
                            <div key={material.id} className="bg-white p-2 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">{material.titulo}</p>
                                  <p className="text-xs text-gray-600">{material.tipo}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setAyudaData(prev => ({
                                    ...prev,
                                    materiales: prev.materiales.filter(m => m.id !== material.id)
                                  }))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Sección para agregar actividades */}
                  <Card className="bg-green-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">🎯 Actividades de Refuerzo</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Input
                        placeholder="Título de la actividad"
                        value={newActividad.titulo}
                        onChange={(e) => setNewActividad(prev => ({...prev, titulo: e.target.value}))}
                      />

                      <Textarea
                        placeholder="Descripción de la actividad..."
                        value={newActividad.descripcion}
                        onChange={(e) => setNewActividad(prev => ({...prev, descripcion: e.target.value}))}
                        className="min-h-[60px]"
                      />

                      <Input
                        type="date"
                        value={newActividad.fechaLimite}
                        onChange={(e) => setNewActividad(prev => ({...prev, fechaLimite: e.target.value}))}
                      />

                      <Button onClick={agregarActividad} size="sm" className="w-full" disabled={!newActividad.titulo}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Actividad
                      </Button>

                      {/* Lista de actividades agregadas */}
                      {ayudaData.actividades.length > 0 && (
                        <div className="space-y-2">
                          {ayudaData.actividades.map(actividad => (
                            <div key={actividad.id} className="bg-white p-2 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-sm">{actividad.titulo}</p>
                                  {actividad.fechaLimite && (
                                    <p className="text-xs text-gray-600">
                                      Fecha límite: {new Date(actividad.fechaLimite).toLocaleDateString('es-CO')}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setAyudaData(prev => ({
                                    ...prev,
                                    actividades: prev.actividades.filter(a => a.id !== actividad.id)
                                  }))}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Button
                    onClick={crearPlanAyuda}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    disabled={!ayudaData.tipo || !ayudaData.descripcion}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Crear Plan de Ayuda
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Historial de ayudas existentes */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">📋 Historial de Ayudas</CardTitle>
                </CardHeader>
                <CardContent>
                  {ayudasExistentes.length === 0 ? (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No hay planes de ayuda previos</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto">
                      {ayudasExistentes.map(ayuda => {
                        const tipoInfo = tiposAyuda.find(t => t.value === ayuda.tipo);
                        return (
                          <Card key={ayuda.id} className="border">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Badge className={tipoInfo?.color || 'bg-gray-100'}>
                                    {tipoInfo?.label || ayuda.tipo}
                                  </Badge>
                                  <Badge className={getPrioridadColor(ayuda.prioridad)} size="sm">
                                    {ayuda.prioridad}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(ayuda.fechaCreacion).toLocaleDateString('es-CO')}
                                </div>
                              </div>

                              <p className="text-sm text-gray-700 mb-3">{ayuda.descripcion}</p>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="font-medium">Materiales:</span> {ayuda.materiales.length}
                                </div>
                                <div>
                                  <span className="font-medium">Actividades:</span> {ayuda.actividades.length}
                                </div>
                              </div>

                              {ayuda.fechaLimite && (
                                <div className="flex items-center mt-2 text-xs text-gray-600">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Límite: {new Date(ayuda.fechaLimite).toLocaleDateString('es-CO')}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SistemaAyudaPersonalizada;