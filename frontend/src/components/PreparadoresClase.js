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
  Upload,
  Download,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Calendar,
  BookOpen,
  Target,
  Users
} from 'lucide-react';

const PreparadoresClase = ({ teacher, onClose }) => {
  const [preparadores, setPreparadores] = useState([]);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPreparador, setEditingPreparador] = useState(null);
  const [preparadorData, setPreparadorData] = useState({
    // Encabezado
    docente: teacher.name,
    grado: '',
    area: '',
    asignatura: '',
    semana: '',
    periodo: '',
    numeroUnidad: '',
    tituloUnidad: '',
    
    // Contenido
    indicadoresLogros: [''],
    contenido: '',
    
    // Actividades
    inicioActividad: '',
    inicioDescripcion: '',
    desarrolloDefiniciones: '',
    desarrolloEjemplos: '',
    desarrolloActividades: [''],
    desarrolloActividadDinamica: '',
    cierreActividad: '',
    cierreDescripcion: '',
    
    // Recursos y evaluación
    recursos: [''],
    evaluacionTipo: '',
    evaluacionInstrumentos: [''],
    
    // Metadatos
    fechaCreacion: '',
    estado: 'borrador'
  });

  useEffect(() => {
    // Cargar preparadores existentes del docente
    const preparadoresGuardados = JSON.parse(localStorage.getItem(`gada_preparadores_${teacher.id}`) || '[]');
    setPreparadores(preparadoresGuardados);
  }, [teacher]);

  const resetPreparador = () => {
    setPreparadorData({
      docente: teacher.name,
      grado: '',
      area: '',
      asignatura: '',
      semana: '',
      periodo: '',
      numeroUnidad: '',
      tituloUnidad: '',
      indicadoresLogros: [''],
      contenido: '',
      inicioActividad: '',
      inicioDescripcion: '',
      desarrolloDefiniciones: '',
      desarrolloEjemplos: '',
      desarrolloActividades: [''],
      desarrolloActividadDinamica: '',
      cierreActividad: '',
      cierreDescripcion: '',
      recursos: [''],
      evaluacionTipo: '',
      evaluacionInstrumentos: [''],
      fechaCreacion: new Date().toISOString(),
      estado: 'borrador'
    });
  };

  const nuevoPreparador = () => {
    resetPreparador();
    setEditingPreparador(null);
    setShowEditor(true);
  };

  const editarPreparador = (preparador) => {
    setPreparadorData(preparador);
    setEditingPreparador(preparador.id);
    setShowEditor(true);
  };

  const guardarPreparador = () => {
    if (!preparadorData.grado || !preparadorData.asignatura || !preparadorData.contenido) {
      alert('Complete los campos obligatorios: Grado, Asignatura y Contenido');
      return;
    }

    let preparadoresActualizados;

    if (editingPreparador) {
      // Editando preparador existente
      preparadoresActualizados = preparadores.map(p => 
        p.id === editingPreparador ? { ...preparadorData, id: editingPreparador } : p
      );
    } else {
      // Nuevo preparador
      const nuevoPrep = {
        ...preparadorData,
        id: Date.now(),
        fechaCreacion: new Date().toISOString(),
        fechaModificacion: new Date().toISOString()
      };
      preparadoresActualizados = [...preparadores, nuevoPrep];
    }

    setPreparadores(preparadoresActualizados);
    localStorage.setItem(`gada_preparadores_${teacher.id}`, JSON.stringify(preparadoresActualizados));
    
    // Guardar en historial general para el administrador
    const historialGeneral = JSON.parse(localStorage.getItem('gada_preparadores_historial') || '[]');
    const preparadorParaHistorial = {
      ...preparadorData,
      id: editingPreparador || Date.now(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      fechaModificacion: new Date().toISOString()
    };
    
    // Actualizar o agregar al historial
    const indiceExistente = historialGeneral.findIndex(p => p.id === preparadorParaHistorial.id);
    if (indiceExistente >= 0) {
      historialGeneral[indiceExistente] = preparadorParaHistorial;
    } else {
      historialGeneral.push(preparadorParaHistorial);
    }
    localStorage.setItem('gada_preparadores_historial', JSON.stringify(historialGeneral));

    alert('Preparador guardado exitosamente');
    setShowEditor(false);
    setEditingPreparador(null);
  };

  const eliminarPreparador = (id) => {
    if (confirm('¿Está seguro de eliminar este preparador?')) {
      const preparadoresActualizados = preparadores.filter(p => p.id !== id);
      setPreparadores(preparadoresActualizados);
      localStorage.setItem(`gada_preparadores_${teacher.id}`, JSON.stringify(preparadoresActualizados));
    }
  };

  const exportarPreparador = (preparador) => {
    const contenido = `
COLEGIO GIMNASIO AMERICANO DEL ATLÁNTICO
PLAN DE CLASE

Docente: ${preparador.docente}
Grado: ${preparador.grado}
Área: ${preparador.area}
Asignatura: ${preparador.asignatura}
Semana: ${preparador.semana}
Período: ${preparador.periodo}
No. Unidad: ${preparador.numeroUnidad}
Título de la unidad: ${preparador.tituloUnidad}

INDICADORES DE LOGROS:
${preparador.indicadoresLogros.filter(i => i.trim()).map((logro, index) => `${index + 1}. ${logro}`).join('\n')}

CONTENIDO:
${preparador.contenido}

ACTIVIDADES:

INICIO:
Actividad: ${preparador.inicioActividad}
Descripción: ${preparador.inicioDescripcion}

DESARROLLO:
Definiciones: ${preparador.desarrolloDefiniciones}
Ejemplos: ${preparador.desarrolloEjemplos}
Actividades: ${preparador.desarrolloActividades.filter(a => a.trim()).join(', ')}
Actividad Dinámica: ${preparador.desarrolloActividadDinamica}

CIERRE:
Actividad: ${preparador.cierreActividad}
Descripción: ${preparador.cierreDescripcion}

RECURSOS:
${preparador.recursos.filter(r => r.trim()).map((recurso, index) => `• ${recurso}`).join('\n')}

EVALUACIÓN:
Tipo: ${preparador.evaluacionTipo}
Instrumentos: ${preparador.evaluacionInstrumentos.filter(i => i.trim()).join(', ')}

Firma docente: ${preparador.docente}
Fecha: ${new Date(preparador.fechaCreacion).toLocaleDateString('es-CO')}
    `;

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Preparador_${preparador.asignatura}_${preparador.grado}_Semana${preparador.semana}.txt`;
    link.click();
  };

  const actualizarArray = (array, index, valor) => {
    const nuevoArray = [...array];
    nuevoArray[index] = valor;
    return nuevoArray;
  };

  const agregarElementoArray = (array, valorInicial = '') => {
    return [...array, valorInicial];
  };

  const eliminarElementoArray = (array, index) => {
    return array.filter((_, i) => i !== index);
  };

  const getAsignaturasDisponibles = () => {
    if (teacher.teachingLevel === 'transicion') {
      return ['DIMENSIÓN COMUNICATIVA', 'DIMENSIÓN COGNITIVA', 'DIMENSIÓN CORPORAL', 'DIMENSIÓN ESTÉTICA', 'DIMENSIÓN ÉTICA'];
    } else if (teacher.teachingLevel === 'primaria') {
      return ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 'INGLÉS', 'EDUCACIÓN ARTÍSTICA', 'ÉTICA Y RELIGIÓN', 'INFORMÁTICA'];
    } else {
      return teacher.subjects || ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'CIENCIAS SOCIALES', 'INGLÉS'];
    }
  };

  const getGradosDisponibles = () => {
    if (teacher.grades && teacher.grades.length > 0) {
      return teacher.grades;
    }
    return ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  };

  if (showEditor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
        <Card className="w-full max-w-4xl max-h-[98vh] overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                📝 {editingPreparador ? 'Editar' : 'Nuevo'} Preparador de Clase
              </CardTitle>
              <div className="flex space-x-2">
                <Button onClick={guardarPreparador} variant="secondary" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Guardar
                </Button>
                <Button onClick={() => setShowEditor(false)} variant="secondary" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 max-h-[calc(98vh-100px)] overflow-y-auto">
            <div className="space-y-6">
              {/* Encabezado */}
              <Card className="bg-gray-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📋 INFORMACIÓN GENERAL</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <Label>Grado *</Label>
                      <Select value={preparadorData.grado} onValueChange={(value) => setPreparadorData(prev => ({...prev, grado: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Grado" />
                        </SelectTrigger>
                        <SelectContent>
                          {getGradosDisponibles().map(grado => (
                            <SelectItem key={grado} value={grado}>{grado}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Área</Label>
                      <Input
                        value={preparadorData.area}
                        onChange={(e) => setPreparadorData(prev => ({...prev, area: e.target.value}))}
                        placeholder="Ej: Lenguaje"
                      />
                    </div>

                    <div>
                      <Label>Asignatura *</Label>
                      <Select value={preparadorData.asignatura} onValueChange={(value) => setPreparadorData(prev => ({...prev, asignatura: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Asignatura" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAsignaturasDisponibles().map(asignatura => (
                            <SelectItem key={asignatura} value={asignatura}>{asignatura}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Semana</Label>
                      <Input
                        value={preparadorData.semana}
                        onChange={(e) => setPreparadorData(prev => ({...prev, semana: e.target.value}))}
                        placeholder="Ej: 21-23"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Período</Label>
                      <Select value={preparadorData.periodo} onValueChange={(value) => setPreparadorData(prev => ({...prev, periodo: value}))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Período" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Primer Período</SelectItem>
                          <SelectItem value="2">Segundo Período</SelectItem>
                          <SelectItem value="3">Tercer Período</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>No. Unidad</Label>
                      <Input
                        value={preparadorData.numeroUnidad}
                        onChange={(e) => setPreparadorData(prev => ({...prev, numeroUnidad: e.target.value}))}
                        placeholder="Ej: 3"
                      />
                    </div>

                    <div>
                      <Label>Título de la Unidad</Label>
                      <Input
                        value={preparadorData.tituloUnidad}
                        onChange={(e) => setPreparadorData(prev => ({...prev, tituloUnidad: e.target.value}))}
                        placeholder="Ej: Hiperonimia e Hiponimia"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Indicadores de Logros */}
              <Card className="bg-blue-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">🎯 INDICADORES DE LOGROS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {preparadorData.indicadoresLogros.map((logro, index) => (
                    <div key={index} className="flex space-x-2">
                      <Textarea
                        value={logro}
                        onChange={(e) => setPreparadorData(prev => ({
                          ...prev,
                          indicadoresLogros: actualizarArray(prev.indicadoresLogros, index, e.target.value)
                        }))}
                        placeholder={`Indicador de logro ${index + 1}...`}
                        className="min-h-[60px] flex-1"
                      />
                      {preparadorData.indicadoresLogros.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreparadorData(prev => ({
                            ...prev,
                            indicadoresLogros: eliminarElementoArray(prev.indicadoresLogros, index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreparadorData(prev => ({
                      ...prev,
                      indicadoresLogros: agregarElementoArray(prev.indicadoresLogros)
                    }))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Indicador
                  </Button>
                </CardContent>
              </Card>

              {/* Contenido */}
              <Card className="bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📚 CONTENIDO</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={preparadorData.contenido}
                    onChange={(e) => setPreparadorData(prev => ({...prev, contenido: e.target.value}))}
                    placeholder="Tema principal a desarrollar..."
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>

              {/* Actividades */}
              <Card className="bg-purple-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">🎭 ACTIVIDADES</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Inicio */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🚀 INICIO</h4>
                    <div className="space-y-3">
                      <Input
                        value={preparadorData.inicioActividad}
                        onChange={(e) => setPreparadorData(prev => ({...prev, inicioActividad: e.target.value}))}
                        placeholder="Actividad de inicio..."
                      />
                      <Textarea
                        value={preparadorData.inicioDescripcion}
                        onChange={(e) => setPreparadorData(prev => ({...prev, inicioDescripcion: e.target.value}))}
                        placeholder="Descripción de la actividad de inicio..."
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>

                  {/* Desarrollo */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">📖 DESARROLLO</h4>
                    <div className="space-y-3">
                      <div>
                        <Label>Definiciones</Label>
                        <Textarea
                          value={preparadorData.desarrolloDefiniciones}
                          onChange={(e) => setPreparadorData(prev => ({...prev, desarrolloDefiniciones: e.target.value}))}
                          placeholder="Definiciones y conceptos clave..."
                          className="min-h-[80px]"
                        />
                      </div>
                      
                      <div>
                        <Label>Ejemplos</Label>
                        <Textarea
                          value={preparadorData.desarrolloEjemplos}
                          onChange={(e) => setPreparadorData(prev => ({...prev, desarrolloEjemplos: e.target.value}))}
                          placeholder="Ejemplos y casos prácticos..."
                          className="min-h-[80px]"
                        />
                      </div>

                      <div>
                        <Label>Actividades de Práctica</Label>
                        {preparadorData.desarrolloActividades.map((actividad, index) => (
                          <div key={index} className="flex space-x-2 mb-2">
                            <Textarea
                              value={actividad}
                              onChange={(e) => setPreparadorData(prev => ({
                                ...prev,
                                desarrolloActividades: actualizarArray(prev.desarrolloActividades, index, e.target.value)
                              }))}
                              placeholder={`Actividad ${index + 1}...`}
                              className="min-h-[60px] flex-1"
                            />
                            {preparadorData.desarrolloActividades.length > 1 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setPreparadorData(prev => ({
                                  ...prev,
                                  desarrolloActividades: eliminarElementoArray(prev.desarrolloActividades, index)
                                }))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreparadorData(prev => ({
                            ...prev,
                            desarrolloActividades: agregarElementoArray(prev.desarrolloActividades)
                          }))}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Agregar Actividad
                        </Button>
                      </div>

                      <div>
                        <Label>Actividad Dinámica</Label>
                        <Textarea
                          value={preparadorData.desarrolloActividadDinamica}
                          onChange={(e) => setPreparadorData(prev => ({...prev, desarrolloActividadDinamica: e.target.value}))}
                          placeholder="Actividad dinámica, juegos, competencias..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cierre */}
                  <div className="bg-white p-3 rounded border">
                    <h4 className="font-medium mb-3">🎯 CIERRE</h4>
                    <div className="space-y-3">
                      <Input
                        value={preparadorData.cierreActividad}
                        onChange={(e) => setPreparadorData(prev => ({...prev, cierreActividad: e.target.value}))}
                        placeholder="Actividad de cierre..."
                      />
                      <Textarea
                        value={preparadorData.cierreDescripcion}
                        onChange={(e) => setPreparadorData(prev => ({...prev, cierreDescripcion: e.target.value}))}
                        placeholder="Descripción de la actividad de cierre..."
                        className="min-h-[60px]"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recursos */}
              <Card className="bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">🛠️ RECURSOS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {preparadorData.recursos.map((recurso, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={recurso}
                        onChange={(e) => setPreparadorData(prev => ({
                          ...prev,
                          recursos: actualizarArray(prev.recursos, index, e.target.value)
                        }))}
                        placeholder={`Recurso ${index + 1}...`}
                        className="flex-1"
                      />
                      {preparadorData.recursos.length > 1 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setPreparadorData(prev => ({
                            ...prev,
                            recursos: eliminarElementoArray(prev.recursos, index)
                          }))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreparadorData(prev => ({
                      ...prev,
                      recursos: agregarElementoArray(prev.recursos)
                    }))}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Recurso
                  </Button>
                </CardContent>
              </Card>

              {/* Evaluación */}
              <Card className="bg-red-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">📊 EVALUACIÓN</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Tipo de Evaluación</Label>
                    <Select value={preparadorData.evaluacionTipo} onValueChange={(value) => setPreparadorData(prev => ({...prev, evaluacionTipo: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="formativa">Evaluación Formativa</SelectItem>
                        <SelectItem value="sumativa">Evaluación Sumativa</SelectItem>
                        <SelectItem value="diagnostica">Evaluación Diagnóstica</SelectItem>
                        <SelectItem value="continua">Evaluación Continua</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Instrumentos de Evaluación</Label>
                    {preparadorData.evaluacionInstrumentos.map((instrumento, index) => (
                      <div key={index} className="flex space-x-2 mb-2">
                        <Input
                          value={instrumento}
                          onChange={(e) => setPreparadorData(prev => ({
                            ...prev,
                            evaluacionInstrumentos: actualizarArray(prev.evaluacionInstrumentos, index, e.target.value)
                          }))}
                          placeholder={`Instrumento ${index + 1}...`}
                          className="flex-1"
                        />
                        {preparadorData.evaluacionInstrumentos.length > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreparadorData(prev => ({
                              ...prev,
                              evaluacionInstrumentos: eliminarElementoArray(prev.evaluacionInstrumentos, index)
                            }))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreparadorData(prev => ({
                        ...prev,
                        evaluacionInstrumentos: agregarElementoArray(prev.evaluacionInstrumentos)
                      }))}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Instrumento
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[95vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                📝 PREPARADORES DE CLASE
              </CardTitle>
              <p className="text-indigo-100">
                Gestión de preparadores y planeaciones - {teacher.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={nuevoPreparador} variant="secondary" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Preparador
              </Button>
              <Button onClick={onClose} variant="secondary" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[calc(95vh-140px)] overflow-y-auto">
          {preparadores.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No hay preparadores creados</h3>
              <p className="text-gray-500 mb-6">Comience creando su primer preparador de clase</p>
              <Button onClick={nuevoPreparador} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Preparador
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {preparadores.map((preparador) => (
                <Card key={preparador.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{preparador.tituloUnidad || preparador.contenido}</h3>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-1">
                          <Badge variant="outline">{preparador.asignatura}</Badge>
                          <Badge variant="outline">Grado {preparador.grado}</Badge>
                          {preparador.semana && <Badge variant="outline">Semana {preparador.semana}</Badge>}
                          {preparador.periodo && <Badge variant="outline">Período {preparador.periodo}</Badge>}
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => exportarPreparador(preparador)}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => editarPreparador(preparador)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => eliminarPreparador(preparador.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Contenido:</strong> {preparador.contenido}</p>
                      {preparador.inicioActividad && (
                        <p><strong>Actividad Inicio:</strong> {preparador.inicioActividad}</p>
                      )}
                      <p><strong>Creado:</strong> {new Date(preparador.fechaCreacion).toLocaleDateString('es-CO')}</p>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <div className="flex space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          📋 {preparador.indicadoresLogros.filter(i => i.trim()).length} Indicadores
                        </Badge>
                        <Badge className="bg-green-100 text-green-800">
                          🛠️ {preparador.recursos.filter(r => r.trim()).length} Recursos
                        </Badge>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800">
                        {preparador.estado || 'borrador'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreparadoresClase;