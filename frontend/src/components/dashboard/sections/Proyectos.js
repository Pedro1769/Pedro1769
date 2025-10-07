import React, { useState } from 'react';
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
  FolderOpen,
  Plus,
  Upload,
  FileText,
  Calendar,
  Users,
  Eye,
  Download,
  Edit,
  Trash2,
  BookOpen,
  Target
} from 'lucide-react';

const Proyectos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'pedagogico',
    grade: '',
    subject: ''
  });

  // Datos mock de proyectos
  const [proyectos, setProyectos] = useState([
    {
      id: 1,
      title: "Proyecto de Matemática Aplicada",
      description: "Aplicación de conceptos matemáticos en situaciones reales del entorno estudiantil",
      category: "pedagogico",
      grade: "10°",
      subject: "MATEMÁTICA",
      author: "Prof. María González",
      date: "2024-03-15",
      status: "Activo",
      participants: 25,
      files: ["proyecto_matematica.pdf", "recursos_adicionales.docx"]
    },
    {
      id: 2,
      title: "Feria de Ciencias 2024",
      description: "Proyectos experimentales de física y química para bachillerato",
      category: "cientifico",
      grade: "11°",
      subject: "FÍSICA",
      author: "Prof. Carlos Rodríguez",
      date: "2024-03-20",
      status: "En desarrollo",
      participants: 18,
      files: ["experimentos_fisica.pdf"]
    },
    {
      id: 3,
      title: "Lectura Comprensiva Digital",
      description: "Uso de herramientas digitales para mejorar la comprensión lectora",
      category: "tecnologico",
      grade: "9°",
      subject: "HUMANIDADES",
      author: "Prof. Ana López",
      date: "2024-03-18",
      status: "Finalizado",
      participants: 30,
      files: ["plan_lectura.pdf", "evaluacion_resultados.xlsx"]
    }
  ]);

  const categorias = [
    { key: 'todos', label: 'Todos', color: 'gray' },
    { key: 'pedagogico', label: 'Pedagógicos', color: 'blue' },
    { key: 'cientifico', label: 'Científicos', color: 'green' },
    { key: 'tecnologico', label: 'Tecnológicos', color: 'purple' },
    { key: 'cultural', label: 'Culturales', color: 'orange' }
  ];

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    toast({
      title: "Archivos seleccionados",
      description: `${files.length} archivo(s) seleccionado(s) para subir`,
    });
  };

  const handleUploadProject = () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Error",
        description: "El título del proyecto es obligatorio",
        variant: "destructive",
      });
      return;
    }

    const proyecto = {
      id: proyectos.length + 1,
      ...newProject,
      author: user.name,
      date: new Date().toISOString().split('T')[0],
      status: "En desarrollo",
      participants: 0,
      files: selectedFiles.map(file => file.name)
    };

    setProyectos(prev => [...prev, proyecto]);
    setNewProject({
      title: '',
      description: '',
      category: 'pedagogico',
      grade: '',
      subject: ''
    });
    setSelectedFiles([]);
    setShowUpload(false);

    toast({
      title: "Proyecto creado exitosamente",
      description: `El proyecto "${proyecto.title}" ha sido creado con ${proyecto.files.length} archivo(s)`,
    });
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setNewProject({
      title: project.title,
      description: project.description,
      category: project.category,
      grade: project.grade,
      subject: project.subject
    });
    setShowEdit(true);
  };

  const handleUpdateProject = () => {
    if (!newProject.title.trim()) {
      toast({
        title: "Error",
        description: "El título del proyecto es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setProyectos(prev => prev.map(p => 
      p.id === editingProject.id 
        ? { ...p, ...newProject, updated_at: new Date().toISOString().split('T')[0] }
        : p
    ));

    setNewProject({
      title: '',
      description: '',
      category: 'pedagogico',
      grade: '',
      subject: ''
    });
    setEditingProject(null);
    setShowEdit(false);

    toast({
      title: "Proyecto actualizado",
      description: `El proyecto "${newProject.title}" ha sido actualizado exitosamente`,
    });
  };

  const handleDeleteProject = (projectId) => {
    setProyectos(prev => prev.filter(p => p.id !== projectId));
    toast({
      title: "Proyecto eliminado",
      description: "El proyecto ha sido eliminado exitosamente",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Activo': return 'bg-green-500';
      case 'En desarrollo': return 'bg-yellow-500';
      case 'Finalizado': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category) => {
    const cat = categorias.find(c => c.key === category);
    return cat ? `bg-${cat.color}-100 text-${cat.color}-700 border-${cat.color}-200` : 'bg-gray-100';
  };

  const filteredProjects = selectedCategory === 'todos' ? 
    proyectos : proyectos.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-green-500/20 via-blue-500/15 to-purple-500/20 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Proyectos Institucionales
              </h1>
              <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl text-lg font-bold shadow-lg animate-bounce">
                📁 PROYECTOS
              </div>
            </div>
            <p className="text-gray-700 font-medium">Gestiona y comparte proyectos pedagógicos</p>
          </div>
          <Button 
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
            <FolderOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{proyectos.length}</div>
            <p className="text-xs text-green-100">Proyectos registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <Target className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proyectos.filter(p => p.status === 'Activo').length}
            </div>
            <p className="text-xs text-blue-100">En ejecución</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participantes</CardTitle>
            <Users className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {proyectos.reduce((sum, p) => sum + p.participants, 0)}
            </div>
            <p className="text-xs text-purple-100">Total estudiantes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categorías</CardTitle>
            <BookOpen className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(proyectos.map(p => p.category)).size}
            </div>
            <p className="text-xs text-orange-100">Diferentes tipos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros por categoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Categorías de Proyectos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categorias.map(categoria => (
              <Button
                key={categoria.key}
                variant={selectedCategory === categoria.key ? "default" : "outline"}
                onClick={() => setSelectedCategory(categoria.key)}
                className={selectedCategory === categoria.key ? 
                  `bg-${categoria.color}-600 hover:bg-${categoria.color}-700` : ''
                }
              >
                {categoria.label}
                <Badge variant="secondary" className="ml-2">
                  {categoria.key === 'todos' ? proyectos.length : 
                   proyectos.filter(p => p.category === categoria.key).length}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de proyectos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>Proyectos ({filteredProjects.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No hay proyectos en esta categoría</p>
              <Button 
                onClick={() => setShowUpload(true)}
                size="sm" 
                className="mt-3 bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map(proyecto => (
                <div key={proyecto.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{proyecto.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{proyecto.description}</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(proyecto.status)} ml-4 mt-2`}></div>
                  </div>

                  {/* Metadatos */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{proyecto.date}</span>
                      </div>
                      <Badge variant="outline" className={getCategoryColor(proyecto.category)}>
                        {categorias.find(c => c.key === proyecto.category)?.label}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{proyecto.participants} estudiantes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Badge variant="secondary">{proyecto.grade}</Badge>
                        <Badge variant="outline">{proyecto.subject}</Badge>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500">
                      <span>Por: {proyecto.author}</span>
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="mb-4">
                    <Badge variant="outline" className={`${getStatusColor(proyecto.status)} text-white border-none`}>
                      {proyecto.status}
                    </Badge>
                  </div>

                  {/* Archivos */}
                  {proyecto.files && proyecto.files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Archivos:</p>
                      <div className="space-y-1">
                        {proyecto.files.map((file, index) => (
                          <div key={index} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-600">{file}</span>
                            </div>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center space-x-1"
                      onClick={() => {
                        toast({
                          title: "Detalles del proyecto",
                          description: `Mostrando detalles completos de "${proyecto.title}"`,
                        });
                      }}
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ver Detalles</span>
                    </Button>
                    <div className="flex space-x-1">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditProject(proyecto)}
                        title="Editar proyecto"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => {
                          if (window.confirm(`¿Estás seguro de eliminar el proyecto "${proyecto.title}"?`)) {
                            handleDeleteProject(proyecto.id);
                          }
                        }}
                        title="Eliminar proyecto"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Crear Proyecto */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
            <DialogDescription>
              Registra un nuevo proyecto institucional para compartir con la comunidad académica
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título *
              </Label>
              <Input
                id="title"
                value={newProject.title}
                onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                className="col-span-3"
                placeholder="Ej: Proyecto de Matemática Aplicada"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <textarea
                id="description"
                value={newProject.description}
                onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                className="col-span-3 border rounded-md px-3 py-2 text-sm min-h-[80px]"
                placeholder="Describe el objetivo y alcance del proyecto"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <select
                id="category"
                value={newProject.category}
                onChange={(e) => setNewProject({...newProject, category: e.target.value})}
                className="col-span-3 border rounded-md px-3 py-2 text-sm"
              >
                {categorias.slice(1).map(cat => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="grade" className="text-right">
                Grado
              </Label>
              <Input
                id="grade"
                value={newProject.grade}
                onChange={(e) => setNewProject({...newProject, grade: e.target.value})}
                className="col-span-3"
                placeholder="Ej: 10°, 11°"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Asignatura
              </Label>
              <select
                id="subject"
                value={newProject.subject}
                onChange={(e) => setNewProject({...newProject, subject: e.target.value})}
                className="col-span-3 border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Seleccionar asignatura</option>
                {user.subjects && user.subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowUpload(false)} variant="outline">
              Cancelar
            </Button>
            <Button onClick={handleUploadProject} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Crear Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Proyectos;