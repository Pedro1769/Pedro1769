import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  FileText, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  BookOpen,
  Send,
  Eye
} from 'lucide-react';

const TalleresAsistidos = ({ user }) => {
  const [talleres, setTalleres] = useState([]);
  const [selectedTaller, setSelectedTaller] = useState(null);
  const [respuesta, setRespuesta] = useState('');
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    // Cargar talleres asignados al estudiante
    const allTalleres = JSON.parse(localStorage.getItem('gada_talleres') || '[]');
    const studentTalleres = allTalleres.filter(
      taller => taller.grado === user.grade || taller.estudiantes?.includes(user.id)
    );
    setTalleres(studentTalleres);
  }, [user]);

  const getStatusBadge = (taller, respuestas) => {
    const respuesta = respuestas?.find(r => r.estudianteId === user.id);
    
    if (respuesta) {
      if (respuesta.calificacion) {
        return <Badge className="bg-green-100 text-green-800">Calificado: {respuesta.calificacion}</Badge>;
      }
      return <Badge className="bg-blue-100 text-blue-800">Entregado</Badge>;
    }
    
    const fechaLimite = new Date(taller.fechaLimite);
    const hoy = new Date();
    
    if (hoy > fechaLimite) {
      return <Badge className="bg-red-100 text-red-800">Vencido</Badge>;
    }
    
    return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
  };

  const submitRespuesta = (tallerId) => {
    const respuestas = JSON.parse(localStorage.getItem(`gada_respuestas_${tallerId}`) || '[]');
    
    const nuevaRespuesta = {
      estudianteId: user.id,
      estudiante: user.name,
      respuesta: respuesta,
      archivo: archivo?.name || null,
      fechaEntrega: new Date().toISOString(),
      calificacion: null
    };

    const respuestasActualizadas = respuestas.filter(r => r.estudianteId !== user.id);
    respuestasActualizadas.push(nuevaRespuesta);
    
    localStorage.setItem(`gada_respuestas_${tallerId}`, JSON.stringify(respuestasActualizadas));
    
    setRespuesta('');
    setArchivo(null);
    setSelectedTaller(null);
    
    // Actualizar la lista de talleres
    const allTalleres = JSON.parse(localStorage.getItem('gada_talleres') || '[]');
    const studentTalleres = allTalleres.filter(
      taller => taller.grado === user.grade || taller.estudiantes?.includes(user.id)
    );
    setTalleres(studentTalleres);
    
    alert('Respuesta enviada exitosamente');
  };

  const downloadArchivo = (archivoUrl, archivoNombre) => {
    // Simular descarga de archivo
    const link = document.createElement('a');
    link.href = archivoUrl || '#';
    link.download = archivoNombre || 'archivo_taller.pdf';
    link.click();
  };

  const getRespuestaEstudiante = (tallerId) => {
    const respuestas = JSON.parse(localStorage.getItem(`gada_respuestas_${tallerId}`) || '[]');
    return respuestas.find(r => r.estudianteId === user.id);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📚 Talleres Asistidos</h2>
        <p className="text-gray-600">
          Aquí puedes ver y responder los talleres enviados por tus profesores
        </p>
      </div>

      {talleres.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No tienes talleres asignados</p>
            <p className="text-gray-400">Los talleres aparecerán aquí cuando tus profesores los publiquen</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {talleres.map((taller) => {
            const respuestas = JSON.parse(localStorage.getItem(`gada_respuestas_${taller.id}`) || '[]');
            const miRespuesta = getRespuestaEstudiante(taller.id);
            
            return (
              <Card key={taller.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                        {taller.titulo}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>📖 {taller.materia}</span>
                        <span>👨‍🏫 {taller.profesor}</span>
                        <span>📅 Publicado: {new Date(taller.fechaCreacion).toLocaleDateString('es-CO')}</span>
                        <span className="text-red-600">⏰ Vence: {new Date(taller.fechaLimite).toLocaleDateString('es-CO')}</span>
                      </div>
                    </div>
                    {getStatusBadge(taller, respuestas)}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Instrucciones:</h4>
                      <p className="text-gray-700 leading-relaxed">{taller.descripcion}</p>
                    </div>

                    {taller.archivos && taller.archivos.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Archivos adjuntos:</h4>
                        <div className="flex flex-wrap gap-2">
                          {taller.archivos.map((archivo, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => downloadArchivo(archivo.url, archivo.nombre)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {archivo.nombre}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mostrar respuesta si ya fue enviada */}
                    {miRespuesta ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-green-800">Tu respuesta:</h4>
                          <div className="text-sm text-green-600">
                            Entregado el {new Date(miRespuesta.fechaEntrega).toLocaleDateString('es-CO')}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{miRespuesta.respuesta}</p>
                        
                        {miRespuesta.archivo && (
                          <div className="text-sm text-gray-600">
                            📎 Archivo adjunto: {miRespuesta.archivo}
                          </div>
                        )}

                        {miRespuesta.calificacion && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-800">Calificación:</span>
                              <Badge className="bg-blue-600 text-white text-lg">
                                {miRespuesta.calificacion}
                              </Badge>
                            </div>
                            {miRespuesta.observaciones && (
                              <p className="text-blue-700 mt-2 text-sm">{miRespuesta.observaciones}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Formulario para responder */
                      <div className="border-t pt-4">
                        {selectedTaller === taller.id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tu respuesta:
                              </label>
                              <Textarea
                                value={respuesta}
                                onChange={(e) => setRespuesta(e.target.value)}
                                placeholder="Escribe aquí tu respuesta al taller..."
                                className="min-h-[120px]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Archivo adjunto (opcional):
                              </label>
                              <Input
                                type="file"
                                onChange={(e) => setArchivo(e.target.files[0])}
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button
                                onClick={() => submitRespuesta(taller.id)}
                                disabled={!respuesta.trim()}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Enviar Respuesta
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSelectedTaller(null);
                                  setRespuesta('');
                                  setArchivo(null);
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedTaller(taller.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={new Date() > new Date(taller.fechaLimite)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Responder Taller
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TalleresAsistidos;