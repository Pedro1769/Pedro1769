import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { useAuth } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { Label } from '../../ui/label';
import { 
  Trophy,
  Star,
  Medal,
  Award,
  Target,
  Users,
  Calendar,
  Plus
} from 'lucide-react';
import { studentService } from '../../../services/api';
import { PERIODS } from '../../../mockData';

const BancoLogros = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('academicos');
  const [showCreateLogro, setShowCreateLogro] = useState(false);
  const [newLogro, setNewLogro] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'academico',
    estudiantes: [],
    periodo: 'I'
  });
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Datos de logros (ahora manejados por estado)
  const [logros, setLogros] = useState({
    academicos: [
      {
        id: 1,
        titulo: "Excelencia Académica",
        descripcion: "Promedio superior a 4.5 en todas las asignaturas",
        estudiantes: ["GUTIERREZ GENIETH", "OSPINO ANDRES"],
        periodo: "I",
        fecha: "2024-03-15",
        tipo: "academico"
      },
      {
        id: 2,
        titulo: "Mejor Desempeño en Matemática",
        descripcion: "Nota perfecta (5.0) en evaluaciones de matemática",
        estudiantes: ["GUTIERREZ GENIETH"],
        periodo: "I", 
        fecha: "2024-03-20",
        tipo: "academico"
      }
    ],
    convivencia: [
      {
        id: 3,
        titulo: "Líder Estudiantil",
        descripcion: "Demostró excelentes habilidades de liderazgo",
        estudiantes: ["OSPINO ANDRES"],
        periodo: "I",
        fecha: "2024-03-10",
        tipo: "convivencia"
      },
      {
        id: 4,
        titulo: "Compañerismo Ejemplar",
        descripcion: "Apoyo constante a compañeros de clase",
        estudiantes: ["GUTIERREZ GENIETH", "OSPINO ANDRES"],
        periodo: "I",
        fecha: "2024-03-25",
        tipo: "convivencia"
      }
    ],
    deportivos: [
      {
        id: 5,
        titulo: "Participación Deportiva",
        descripcion: "Participación activa en eventos deportivos",
        estudiantes: ["OSPINO ANDRES"],
        periodo: "I",
        fecha: "2024-03-18",
        tipo: "deportivo"
      }
    ]
  });

  // Cargar estudiantes disponibles
  useEffect(() => {
    loadAvailableStudents();
  }, [user]);

  const loadAvailableStudents = async () => {
    try {
      let studentsList = [];
      
      if (user.role === 'docente_bachillerato' && user.grades) {
        const allStudents = await studentService.getAll();
        studentsList = allStudents.filter(student => 
          user.grades.includes(student.grade)
        );
      } else if (user.role === 'docente_primaria' && user.grade) {
        const allStudents = await studentService.getAll();
        studentsList = allStudents.filter(student => 
          student.grade === user.grade
        );
      } else {
        const allStudents = await studentService.getAll();
        studentsList = allStudents;
      }
      
      setAvailableStudents(studentsList);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  };

  const handleCreateLogro = () => {
    if (!newLogro.titulo.trim() || !newLogro.descripcion.trim()) {
      toast({
        title: "Error",
        description: "El título y descripción son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (selectedStudents.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un estudiante",
        variant: "destructive",
      });
      return;
    }

    const nuevoLogro = {
      id: Date.now(),
      titulo: newLogro.titulo,
      descripcion: newLogro.descripcion,
      tipo: newLogro.tipo,
      periodo: newLogro.periodo,
      fecha: new Date().toISOString().split('T')[0],
      estudiantes: selectedStudents.map(s => s.name),
      docente: user.name
    };

    // Agregar al estado local (en una app real se enviaría al backend)
    setLogros(prev => ({
      ...prev,
      [newLogro.tipo + 's']: [...(prev[newLogro.tipo + 's'] || []), nuevoLogro]
    }));

    // Limpiar formulario
    setNewLogro({
      titulo: '',
      descripcion: '',
      tipo: 'academico',
      estudiantes: [],
      periodo: 'I'
    });
    setSelectedStudents([]);
    setShowCreateLogro(false);

    toast({
      title: "Logro creado exitosamente",
      description: `Logro "${nuevoLogro.titulo}" asignado a ${selectedStudents.length} estudiante(s)`,
    });
  };

  const categorias = [
    { key: 'academicos', label: 'Académicos', icon: Trophy, color: 'blue' },
    { key: 'convivencia', label: 'Convivencia', icon: Star, color: 'green' },
    { key: 'deportivos', label: 'Deportivos', icon: Medal, color: 'orange' }
  ];

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'academico': return Trophy;
      case 'convivencia': return Star;
      case 'deportivo': return Medal;
      default: return Award;
    }
  };

  const getColorByType = (tipo) => {
    switch (tipo) {
      case 'academico': return 'bg-blue-500';
      case 'convivencia': return 'bg-green-500';
      case 'deportivo': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-yellow-500/20 via-orange-500/15 to-red-500/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                Banco de Logros
              </h1>
              <div className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl text-lg font-bold shadow-lg animate-bounce">
                🏆 LOGROS
              </div>
            </div>
            <p className="text-gray-700 font-medium">Reconocimientos y logros estudiantiles</p>
          </div>
          <Button 
            onClick={() => setShowCreateLogro(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Logro
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logros</CardTitle>
            <Award className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(logros).flat().length}
            </div>
            <p className="text-xs text-yellow-100">Registrados este período</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Académicos</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logros.academicos.length}</div>
            <p className="text-xs text-blue-100">Excelencia académica</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Convivencia</CardTitle>
            <Star className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logros.convivencia.length}</div>
            <p className="text-xs text-green-100">Valores y convivencia</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deportivos</CardTitle>
            <Medal className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logros.deportivos.length}</div>
            <p className="text-xs text-orange-100">Actividades deportivas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de categorías */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Categorías de Logros</span>
          </CardTitle>
          <CardDescription>
            Selecciona una categoría para ver los logros correspondientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categorias.map(categoria => {
              const IconComponent = categoria.icon;
              return (
                <Button
                  key={categoria.key}
                  variant={selectedCategory === categoria.key ? "default" : "outline"}
                  onClick={() => setSelectedCategory(categoria.key)}
                  className={`${selectedCategory === categoria.key ? 
                    `bg-${categoria.color}-600 hover:bg-${categoria.color}-700` : ''
                  }`}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {categoria.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de logros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Logros - {categorias.find(c => c.key === selectedCategory)?.label}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logros[selectedCategory].map(logro => {
              const IconComponent = getIconByType(logro.tipo);
              return (
                <div key={logro.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-full ${getColorByType(logro.tipo)} text-white`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{logro.titulo}</h3>
                        <p className="text-gray-600 mb-3">{logro.descripcion}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {logro.fecha}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {logro.estudiantes.length} estudiante(s)
                          </div>
                          <Badge variant="outline">
                            Período {logro.periodo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Estudiantes reconocidos */}
                  <div className="mt-4 pl-16">
                    <p className="text-sm font-medium text-gray-700 mb-2">Estudiantes reconocidos:</p>
                    <div className="flex flex-wrap gap-2">
                      {logro.estudiantes.map((estudiante, index) => (
                        <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                          {estudiante}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {logros[selectedCategory].length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Award className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay logros registrados en esta categoría</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear Logro */}
      <Dialog open={showCreateLogro} onOpenChange={setShowCreateLogro}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Logro</DialogTitle>
            <DialogDescription>
              Registra un nuevo logro o reconocimiento para estudiantes
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="titulo" className="text-right">
                Título *
              </Label>
              <Input
                id="titulo"
                value={newLogro.titulo}
                onChange={(e) => setNewLogro({...newLogro, titulo: e.target.value})}
                className="col-span-3"
                placeholder="Ej: Excelencia Académica en Matemática"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="descripcion" className="text-right">
                Descripción *
              </Label>
              <textarea
                id="descripcion"
                value={newLogro.descripcion}
                onChange={(e) => setNewLogro({...newLogro, descripcion: e.target.value})}
                className="col-span-3 border rounded-md px-3 py-2 text-sm min-h-[80px]"
                placeholder="Describe el logro y los criterios para obtenerlo"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tipo" className="text-right">
                Categoría
              </Label>
              <select
                id="tipo"
                value={newLogro.tipo}
                onChange={(e) => setNewLogro({...newLogro, tipo: e.target.value})}
                className="col-span-3 border rounded-md px-3 py-2 text-sm"
              >
                <option value="academico">Académico</option>
                <option value="convivencia">Convivencia</option>
                <option value="deportivo">Deportivo</option>
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="periodo" className="text-right">
                Período
              </Label>
              <select
                id="periodo"
                value={newLogro.periodo}
                onChange={(e) => setNewLogro({...newLogro, periodo: e.target.value})}
                className="col-span-3 border rounded-md px-3 py-2 text-sm"
              >
                {PERIODS.map(period => (
                  <option key={period} value={period}>Período {period}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right">
                Estudiantes *
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="border rounded-md p-3 max-h-32 overflow-y-auto">
                  {availableStudents.length > 0 ? (
                    availableStudents.map(student => (
                      <div key={student._id || student.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`student-${student._id || student.id}`}
                          checked={selectedStudents.some(s => (s._id || s.id) === (student._id || student.id))}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudents(prev => [...prev, student]);
                            } else {
                              setSelectedStudents(prev => 
                                prev.filter(s => (s._id || s.id) !== (student._id || student.id))
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <label 
                          htmlFor={`student-${student._id || student.id}`}
                          className="text-sm cursor-pointer"
                        >
                          {student.name} - {student.grade}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">Cargando estudiantes...</p>
                  )}
                </div>
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-green-600">
                    {selectedStudents.length} estudiante(s) seleccionado(s)
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowCreateLogro(false);
                setNewLogro({
                  titulo: '',
                  descripcion: '',
                  tipo: 'academico',
                  estudiantes: [],
                  periodo: 'I'
                });
                setSelectedStudents([]);
              }} 
              variant="outline"
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateLogro} className="bg-yellow-600 hover:bg-yellow-700">
              <Trophy className="h-4 w-4 mr-2" />
              Crear Logro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BancoLogros;