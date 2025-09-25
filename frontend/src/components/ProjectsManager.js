import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload,
  Download,
  FileText,
  Calendar,
  Users,
  Target,
  X,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const ProjectsManager = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [projects, setProjects] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'pedagogico', // pedagogico, cultural, deportivo, social, ambiental
    responsible: '',
    participants: [],
    grades: [],
    startDate: '',
    endDate: '',
    objectives: [],
    activities: [],
    resources: [],
    budget: '',
    status: 'planificacion', // planificacion, en_desarrollo, finalizado, suspendido
    observations: ''
  });
  
  const [errors, setErrors] = useState({});

  // Cargar datos del localStorage
  useEffect(() => {
    try {
      const storedProjects = JSON.parse(localStorage.getItem('gada_institutional_projects') || '[]');
      setProjects(storedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      setProjects([]);
    }
  }, []);

  const saveToStorage = (projectsData) => {
    try {
      localStorage.setItem('gada_institutional_projects', JSON.stringify(projectsData));
    } catch (error) {
      console.error('Error saving projects:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.description.trim()) newErrors.description = 'La descripción es obligatoria';
    if (!formData.type) newErrors.type = 'El tipo de proyecto es obligatorio';
    if (!formData.responsible.trim()) newErrors.responsible = 'El responsable es obligatorio';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es obligatoria';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    try {
      const projectData = {
        id: editingProject?.id || Date.now() + Math.random(),
        ...formData,
        createdAt: editingProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      let updatedProjects;
      if (editingProject) {
        updatedProjects = projects.map(project => 
          project.id === editingProject.id ? projectData : project
        );
      } else {
        updatedProjects = [...projects, projectData];
      }

      setProjects(updatedProjects);
      saveToStorage(updatedProjects);
      resetForm();
      setActiveTab('list');
    } catch (error) {
      console.error('Error saving project:', error);
      setErrors({ general: 'Error al guardar el proyecto' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'pedagogico',
      responsible: '',
      participants: [],
      grades: [],
      startDate: '',
      endDate: '',
      objectives: [],
      activities: [],
      resources: [],
      budget: '',
      status: 'planificacion',
      observations: ''
    });
    setEditingProject(null);
    setErrors({});
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData(project);
    setActiveTab('form');
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Está seguro de eliminar este proyecto?')) {
      const updatedProjects = projects.filter(project => project.id !== id);
      setProjects(updatedProjects);
      saveToStorage(updatedProjects);
    }
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const toggleGrade = (grade) => {
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.includes(grade)
        ? prev.grades.filter(g => g !== grade)
        : [...prev.grades, grade]
    }));
  };

  const exportProjects = () => {
    const data = {
      projects: projects,
      exportDate: new Date().toISOString(),
      institution: 'Gimnasio Americano del Atlántico Sede 2'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proyectos_institucionales_GADA_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importProjects = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.projects) {
            setProjects(data.projects);
            saveToStorage(data.projects);
            alert('Proyectos importados exitosamente');
          }
        } catch (error) {
          alert('Error al importar los proyectos');
        }
      };
      reader.readAsText(file);
    }
  };

  const projectTypes = [
    { value: 'pedagogico', label: 'Pedagógico', color: 'bg-blue-100 text-blue-800' },
    { value: 'cultural', label: 'Cultural', color: 'bg-purple-100 text-purple-800' },
    { value: 'deportivo', label: 'Deportivo', color: 'bg-green-100 text-green-800' },
    { value: 'social', label: 'Social', color: 'bg-orange-100 text-orange-800' },
    { value: 'ambiental', label: 'Ambiental', color: 'bg-emerald-100 text-emerald-800' },
    { value: 'tecnologico', label: 'Tecnológico', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const statusOptions = [
    { value: 'planificacion', label: 'Planificación', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'en_desarrollo', label: 'En Desarrollo', color: 'bg-blue-100 text-blue-800' },
    { value: 'finalizado', label: 'Finalizado', color: 'bg-green-100 text-green-800' },
    { value: 'suspendido', label: 'Suspendido', color: 'bg-red-100 text-red-800' }
  ];

  const gradeOptions = ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const typeObj = projectTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Gestión de Proyectos Institucionales
          </CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={importProjects}
              className="hidden"
              id="import-projects"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-projects').click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="outline" onClick={exportProjects}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="list">Lista de Proyectos</TabsTrigger>
              <TabsTrigger value="form">{editingProject ? 'Editar' : 'Nuevo'} Proyecto</TabsTrigger>
              <TabsTrigger value="statistics">Estadísticas</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Proyectos Institucionales ({projects.length})</h3>
                <Button onClick={() => { resetForm(); setActiveTab('form'); }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Proyecto
                </Button>
              </div>

              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="border hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{project.name}</h4>
                          <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge className={getTypeColor(project.type)}>
                              {projectTypes.find(t => t.value === project.type)?.label}
                            </Badge>
                            <Badge className={getStatusColor(project.status)}>
                              {statusOptions.find(s => s.value === project.status)?.label}
                            </Badge>
                            {project.grades.length > 0 && (
                              <Badge variant="outline">
                                Grados: {project.grades.join(', ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(project)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDelete(project.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Responsable:</strong> {project.responsible}
                        </div>
                        <div>
                          <strong>Inicio:</strong> {new Date(project.startDate).toLocaleDateString('es-CO')}
                        </div>
                        <div>
                          <strong>Fin:</strong> {project.endDate ? new Date(project.endDate).toLocaleDateString('es-CO') : 'No definido'}
                        </div>
                      </div>

                      {project.objectives.length > 0 && (
                        <div className="mt-3">
                          <strong className="text-sm">Objetivos:</strong>
                          <ul className="text-sm text-gray-600 mt-1">
                            {project.objectives.slice(0, 2).map((obj, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-1">•</span>
                                <span>{obj}</span>
                              </li>
                            ))}
                            {project.objectives.length > 2 && (
                              <li className="text-blue-600">+ {project.objectives.length - 2} más...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}

                {projects.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay proyectos registrados</p>
                    <Button className="mt-4" onClick={() => { resetForm(); setActiveTab('form'); }}>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primer Proyecto
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="form" className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto Institucional'}
                </h3>
                <Button variant="outline" onClick={() => setActiveTab('list')}>
                  ← Volver a la Lista
                </Button>
              </div>

              {errors.general && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información Básica */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nombre del Proyecto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nombre descriptivo del proyecto"
                        className={errors.name ? 'border-red-500' : ''}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                    </div>

                    <div>
                      <Label htmlFor="description">Descripción *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Descripción detallada del proyecto"
                        rows={4}
                        className={errors.description ? 'border-red-500' : ''}
                      />
                      {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Tipo de Proyecto *</Label>
                        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                          <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {projectTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type}</p>}
                      </div>

                      <div>
                        <Label htmlFor="status">Estado</Label>
                        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map(status => (
                              <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="responsible">Responsable del Proyecto *</Label>
                      <Input
                        id="responsible"
                        value={formData.responsible}
                        onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                        placeholder="Nombre del docente o coordinador responsable"
                        className={errors.responsible ? 'border-red-500' : ''}
                      />
                      {errors.responsible && <p className="text-red-500 text-sm mt-1">{errors.responsible}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startDate">Fecha de Inicio *</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                          className={errors.startDate ? 'border-red-500' : ''}
                        />
                        {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                      </div>

                      <div>
                        <Label htmlFor="endDate">Fecha de Finalización</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="budget">Presupuesto Estimado</Label>
                      <Input
                        id="budget"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder="Ej: $500,000"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Detalles del Proyecto */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Detalles del Proyecto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Grados Participantes</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {gradeOptions.map((grade) => (
                          <div key={grade} className="flex items-center space-x-2">
                            <Checkbox
                              checked={formData.grades.includes(grade)}
                              onCheckedChange={() => toggleGrade(grade)}
                            />
                            <label className="text-sm">{grade}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Objetivos del Proyecto</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar objetivo..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('objectives', e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input');
                              addArrayItem('objectives', input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {formData.objectives.map((objective, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{objective}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeArrayItem('objectives', index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Actividades Planificadas</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar actividad..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('activities', e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input');
                              addArrayItem('activities', input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {formData.activities.map((activity, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{activity}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeArrayItem('activities', index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="observations">Observaciones</Label>
                      <Textarea
                        id="observations"
                        value={formData.observations}
                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                        placeholder="Observaciones adicionales del proyecto..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setActiveTab('list')}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingProject ? 'Actualizar' : 'Guardar'} Proyecto
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <h3 className="text-lg font-semibold">Estadísticas de Proyectos</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{projects.length}</div>
                    <p className="text-sm text-gray-600">Total Proyectos</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {projects.filter(p => p.status === 'en_desarrollo').length}
                    </div>
                    <p className="text-sm text-gray-600">En Desarrollo</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {projects.filter(p => p.status === 'finalizado').length}
                    </div>
                    <p className="text-sm text-gray-600">Finalizados</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {projects.filter(p => p.status === 'planificacion').length}
                    </div>
                    <p className="text-sm text-gray-600">En Planificación</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Proyectos por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {projectTypes.map(type => {
                        const count = projects.filter(p => p.type === type.value).length;
                        return (
                          <div key={type.value} className="flex justify-between items-center">
                            <Badge className={type.color}>{type.label}</Badge>
                            <span className="font-semibold">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Próximos a Finalizar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {projects
                        .filter(p => p.endDate && p.status === 'en_desarrollo')
                        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
                        .slice(0, 5)
                        .map(project => (
                          <div key={project.id} className="text-sm">
                            <div className="font-medium">{project.name}</div>
                            <div className="text-gray-600">
                              Finaliza: {new Date(project.endDate).toLocaleDateString('es-CO')}
                            </div>
                          </div>
                        ))}
                      {projects.filter(p => p.endDate && p.status === 'en_desarrollo').length === 0 && (
                        <p className="text-gray-500 text-sm">No hay proyectos próximos a finalizar</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectsManager;