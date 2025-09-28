import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  FileText, 
  Plus, 
  Eye, 
  Edit3,
  Trash2,
  Download,
  Upload,
  Send,
  Users,
  Calendar,
  BookOpen,
  X
} from 'lucide-react';

const MaterialEstudiantesManager = ({ teacher, onClose }) => {
  const [talleres, setTalleres] = useState([]);
  const [selectedTab, setSelectedTab] = useState('crear');
  const [selectedTaller, setSelectedTaller] = useState(null);
  
  // Form data for new taller
  const [formData, setFormData] = useState({
    titulo: '',
    materia: '',
    grado: '',
    periodo: '1',
    tipo: 'taller', // taller, recuperacion, actividad
    descripcion: '',
    fechaLimite: '',
    archivos: []
  });

  useEffect(() => {
    // Cargar talleres creados por el profesor
    const allTalleres = JSON.parse(localStorage.getItem('gada_talleres') || '[]');
    const teacherTalleres = allTalleres.filter(t => t.profesorId === teacher.id);
    setTalleres(teacherTalleres);
  }, [teacher]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map(file => ({
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type,
      url: URL.createObjectURL(file) // En producción sería una URL real
    }));
    
    setFormData(prev => ({
      ...prev,
      archivos: [...prev.archivos, ...fileData]
    }));
  };

  const createTaller = () => {
    if (!formData.titulo || !formData.materia || !formData.grado || !formData.descripcion || !formData.fechaLimite) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const nuevoTaller = {
      id: Date.now(),
      ...formData,
      profesorId: teacher.id,
      profesor: teacher.name,
      fechaCreacion: new Date().toISOString(),
      estado: 'activo'
    };

    const allTalleres = JSON.parse(localStorage.getItem('gada_talleres') || '[]');
    allTalleres.push(nuevoTaller);
    localStorage.setItem('gada_talleres', JSON.stringify(allTalleres));
    
    setTalleres(prev => [...prev, nuevoTaller]);
    
    // Reset form
    setFormData({
      titulo: '',
      materia: '',
      grado: '',
      periodo: '1',
      tipo: 'taller',
      descripcion: '',
      fechaLimite: '',
      archivos: []
    });
    
    alert('Taller creado exitosamente');
  };

  const deleteTaller = (tallerId) => {
    if (confirm('¿Está seguro de eliminar este taller?')) {
      const allTalleres = JSON.parse(localStorage.getItem('gada_talleres') || '[]');
      const updatedTalleres = allTalleres.filter(t => t.id !== tallerId);
      localStorage.setItem('gada_talleres', JSON.stringify(updatedTalleres));
      
      setTalleres(prev => prev.filter(t => t.id !== tallerId));
      
      // También eliminar respuestas
      localStorage.removeItem(`gada_respuestas_${tallerId}`);
    }
  };

  const verRespuestas = (taller) => {
    const respuestas = JSON.parse(localStorage.getItem(`gada_respuestas_${taller.id}`) || '[]');
    setSelectedTaller({ ...taller, respuestas });
  };

  const calificarRespuesta = (tallerId, estudianteId, calificacion, observaciones) => {
    const respuestas = JSON.parse(localStorage.getItem(`gada_respuestas_${tallerId}`) || '[]');
    const updatedRespuestas = respuestas.map(r => {
      if (r.estudianteId === estudianteId) {
        return { ...r, calificacion, observaciones };
      }
      return r;
    });
    
    localStorage.setItem(`gada_respuestas_${tallerId}`, JSON.stringify(updatedRespuestas));
    
    // Actualizar el taller seleccionado
    if (selectedTaller) {
      setSelectedTaller(prev => ({
        ...prev,
        respuestas: updatedRespuestas
      }));
    }
    
    alert('Calificación guardada exitosamente');
  };

  const getAvailableGrades = () => {
    if (teacher.grades && teacher.grades.length > 0) {
      return teacher.grades;
    }
    if (teacher.teachingLevel === 'primaria') {
      return ['1°', '2°', '3°', '4°', '5°'];
    } else if (teacher.teachingLevel === 'transicion') {
      return ['0°'];
    }
    return ['6°', '7°', '8°', '9°', '10°', '11°'];
  };

  const getAvailableSubjects = () => {
    if (teacher.teachingLevel === 'primaria') {
      return ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 'INGLÉS', 'EDUCACIÓN FÍSICA', 'EDUCACIÓN ARTÍSTICA'];
    }
    return teacher.subjects || ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS', 'INGLÉS'];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              📚 Gestión de Material para Estudiantes
            </CardTitle>
            <Button onClick={onClose} variant="secondary" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            <Button
              variant={selectedTab === 'crear' ? 'secondary' : 'ghost'}
              onClick={() => setSelectedTab('crear')}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Material
            </Button>
            <Button
              variant={selectedTab === 'gestionar' ? 'secondary' : 'ghost'}
              onClick={() => setSelectedTab('gestionar')}
              size="sm"
            >
              <Eye className="mr-2 h-4 w-4" />
              Gestionar Talleres ({talleres.length})
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 max-h-[calc(90vh-180px)] overflow-y-auto">
          {selectedTab === 'crear' && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Título del Material *</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => handleInputChange('titulo', e.target.value)}
                    placeholder="Ej: Taller de Comprensión Lectora"
                  />
                </div>
                
                <div>
                  <Label>Tipo de Material *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleInputChange('tipo', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="taller">📝 Taller</SelectItem>
                      <SelectItem value="recuperacion">🔄 Recuperación</SelectItem>
                      <SelectItem value="actividad">⚡ Actividad</SelectItem>
                      <SelectItem value="proyecto">📋 Proyecto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Materia *</Label>
                  <Select value={formData.materia} onValueChange={(value) => handleInputChange('materia', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar materia" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableSubjects().map(subject => (
                        <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Grado *</Label>
                  <Select value={formData.grado} onValueChange={(value) => handleInputChange('grado', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableGrades().map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Período *</Label>
                  <Select value={formData.periodo} onValueChange={(value) => handleInputChange('periodo', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Primer Período</SelectItem>
                      <SelectItem value="2">Segundo Período</SelectItem>
                      <SelectItem value="3">Tercer Período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fecha Límite *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.fechaLimite}
                    onChange={(e) => handleInputChange('fechaLimite', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Descripción e Instrucciones *</Label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Describa las instrucciones del taller, objetivos, criterios de evaluación..."
                  className="min-h-[120px]"
                />
              </div>

              <div>
                <Label>Archivos Adjuntos (PDF, Word, Imágenes)</Label>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                
                {formData.archivos.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {formData.archivos.map((archivo, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{archivo.nombre}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            archivos: prev.archivos.filter((_, i) => i !== index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button onClick={createTaller} className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white">
                <Send className="mr-2 h-4 w-4" />
                Crear y Enviar Material
              </Button>
            </div>
          )}

          {selectedTab === 'gestionar' && !selectedTaller && (
            <div className="p-6">
              <div className="grid gap-4">
                {talleres.map(taller => {
                  const respuestas = JSON.parse(localStorage.getItem(`gada_respuestas_${taller.id}`) || '[]');
                  
                  return (
                    <Card key={taller.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{taller.titulo}</h3>
                            <div className="flex space-x-4 text-sm text-gray-600">
                              <span>📖 {taller.materia}</span>
                              <span>🎓 {taller.grado}</span>
                              <span>📅 {new Date(taller.fechaLimite).toLocaleDateString('es-CO')}</span>
                            </div>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {taller.tipo.toUpperCase()}
                          </Badge>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{taller.descripcion}</p>

                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <Badge variant="outline">
                              <Users className="mr-1 h-3 w-3" />
                              {respuestas.length} respuestas
                            </Badge>
                            <Badge variant="outline">
                              📎 {taller.archivos?.length || 0} archivos
                            </Badge>
                          </div>

                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => verRespuestas(taller)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Respuestas
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => deleteTaller(taller.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {talleres.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No has creado ningún material aún</p>
                    <Button onClick={() => setSelectedTab('crear')} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primer Material
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedTab === 'gestionar' && selectedTaller && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Respuestas: {selectedTaller.titulo}</h2>
                <Button variant="outline" onClick={() => setSelectedTaller(null)}>
                  ← Volver a Lista
                </Button>
              </div>

              <div className="space-y-4">
                {selectedTaller.respuestas?.map(respuesta => (
                  <Card key={respuesta.estudianteId} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{respuesta.estudiante}</h3>
                        <p className="text-sm text-gray-600">
                          Entregado: {new Date(respuesta.fechaEntrega).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      {respuesta.calificacion && (
                        <Badge className="bg-green-100 text-green-800">
                          Calificado: {respuesta.calificacion}
                        </Badge>
                      )}
                    </div>

                    <div className="bg-gray-50 p-3 rounded mb-3">
                      <p className="text-gray-700">{respuesta.respuesta}</p>
                      {respuesta.archivo && (
                        <p className="text-sm text-blue-600 mt-2">📎 {respuesta.archivo}</p>
                      )}
                    </div>

                    <div className="flex space-x-4">
                      <Input
                        placeholder="Calificación (1-5)"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        defaultValue={respuesta.calificacion || ''}
                        className="w-32"
                        id={`cal-${respuesta.estudianteId}`}
                      />
                      <Input
                        placeholder="Observaciones"
                        defaultValue={respuesta.observaciones || ''}
                        className="flex-1"
                        id={`obs-${respuesta.estudianteId}`}
                      />
                      <Button
                        onClick={() => {
                          const cal = document.getElementById(`cal-${respuesta.estudianteId}`).value;
                          const obs = document.getElementById(`obs-${respuesta.estudianteId}`).value;
                          calificarRespuesta(selectedTaller.id, respuesta.estudianteId, cal, obs);
                        }}
                        size="sm"
                      >
                        💾 Calificar
                      </Button>
                    </div>
                  </Card>
                ))}

                {selectedTaller.respuestas?.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay respuestas aún</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialEstudiantesManager;