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
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Upload,
  Download,
  BookOpen,
  FileText,
  Grid,
  List
} from 'lucide-react';

const CurriculumManager = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjectCurriculums, setSubjectCurriculums] = useState([]);
  const [areaCurriculums, setAreaCurriculums] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'subject', // subject or area
    grade: '',
    level: '',
    period: '',
    description: '',
    generalObjective: '',
    specificObjectives: [],
    contents: [],
    methodology: '',
    evaluation: '',
    resources: [],
    bibliography: ''
  });

  // Cargar datos del localStorage
  useEffect(() => {
    const storedSubjects = JSON.parse(localStorage.getItem('gada_subject_curricula') || '[]');
    const storedAreas = JSON.parse(localStorage.getItem('gada_area_curricula') || '[]');
    setSubjectCurriculums(storedSubjects);
    setAreaCurriculums(storedAreas);
  }, []);

  const saveToStorage = () => {
    localStorage.setItem('gada_subject_curricula', JSON.stringify(subjectCurriculums));
    localStorage.setItem('gada_area_curricula', JSON.stringify(areaCurriculums));
  };

  const handleSave = () => {
    if (!formData.name || !formData.grade || !formData.description) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const newCurriculum = {
      id: editingItem?.id || Date.now() + Math.random(),
      ...formData,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (formData.type === 'subject') {
      if (editingItem) {
        setSubjectCurriculums(prev => prev.map(curr => curr.id === editingItem.id ? newCurriculum : curr));
      } else {
        setSubjectCurriculums(prev => [...prev, newCurriculum]);
      }
    } else {
      if (editingItem) {
        setAreaCurriculums(prev => prev.map(curr => curr.id === editingItem.id ? newCurriculum : curr));
      } else {
        setAreaCurriculums(prev => [...prev, newCurriculum]);
      }
    }

    setEditingItem(null);
    resetForm();
    saveToStorage();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'subject',
      grade: '',
      level: '',
      period: '',
      description: '',
      generalObjective: '',
      specificObjectives: [],
      contents: [],
      methodology: '',
      evaluation: '',
      resources: [],
      bibliography: ''
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleDelete = (id, type) => {
    if (window.confirm('¿Está seguro de eliminar esta malla curricular?')) {
      if (type === 'subject') {
        setSubjectCurriculums(prev => prev.filter(curr => curr.id !== id));
      } else {
        setAreaCurriculums(prev => prev.filter(curr => curr.id !== id));
      }
      saveToStorage();
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

  const exportCurriculum = () => {
    const data = {
      subjectCurriculums,
      areaCurriculums,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mallas_curriculares_GADA_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importCurriculum = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.subjectCurriculums) setSubjectCurriculums(data.subjectCurriculums);
          if (data.areaCurriculums) setAreaCurriculums(data.areaCurriculums);
          saveToStorage();
          alert('Mallas curriculares importadas exitosamente');
        } catch (error) {
          alert('Error al importar las mallas curriculares');
        }
      };
      reader.readAsText(file);
    }
  };

  const subjectOptions = [
    'Matemáticas', 'Español', 'Inglés', 'Ciencias Naturales', 'Biología', 
    'Física', 'Química', 'Ciencias Sociales', 'Geografía', 'Historia',
    'Educación Física', 'Educación Artística', 'Tecnología', 'Informática',
    'Filosofía', 'Ética y Valores', 'Educación Religiosa'
  ];

  const areaOptions = [
    'Humanidades', 'Ciencias Naturales', 'Ciencias Sociales', 
    'Matemáticas', 'Educación Artística', 'Educación Física',
    'Tecnología e Informática'
  ];

  const gradeOptions = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  const levelOptions = ['Básica Primaria', 'Básica Secundaria', 'Media Vocacional'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Grid className="mr-2 h-5 w-5" />
            Gestión de Mallas Curriculares
          </CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={importCurriculum}
              className="hidden"
              id="import-curriculum"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-curriculum').click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="outline" onClick={exportCurriculum}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subjects">Por Asignaturas</TabsTrigger>
              <TabsTrigger value="areas">Por Áreas</TabsTrigger>
            </TabsList>

            <TabsContent value="subjects" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Formulario */}
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingItem ? 'Editar Malla Curricular' : 'Nueva Malla Curricular por Asignatura'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Asignatura *</Label>
                        <Select value={formData.name} onValueChange={(value) => setFormData({...formData, name: value, type: 'subject'})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjectOptions.map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Grado *</Label>
                        <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map(grade => (
                              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Nivel</Label>
                        <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {levelOptions.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Descripción General *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Descripción de la asignatura y su enfoque..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label>Objetivo General</Label>
                      <Textarea
                        value={formData.generalObjective}
                        onChange={(e) => setFormData({...formData, generalObjective: e.target.value})}
                        placeholder="Objetivo general de la asignatura..."
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label>Objetivos Específicos</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar objetivo específico..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('specificObjectives', e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input');
                              addArrayItem('specificObjectives', input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1">
                          {formData.specificObjectives.map((objective, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{objective}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeArrayItem('specificObjectives', index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Contenidos Temáticos</Label>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar contenido temático..."
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                addArrayItem('contents', e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <Button 
                            type="button" 
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input');
                              addArrayItem('contents', input.value);
                              input.value = '';
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {formData.contents.map((content, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">{content}</span>
                              <Button size="sm" variant="ghost" onClick={() => removeArrayItem('contents', index)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Metodología</Label>
                        <Textarea
                          value={formData.methodology}
                          onChange={(e) => setFormData({...formData, methodology: e.target.value})}
                          placeholder="Estrategias metodológicas..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>Sistema de Evaluación</Label>
                        <Textarea
                          value={formData.evaluation}
                          onChange={(e) => setFormData({...formData, evaluation: e.target.value})}
                          placeholder="Criterios y métodos de evaluación..."
                          rows={3}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSave} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      {editingItem ? 'Actualizar' : 'Guardar'} Malla Curricular
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de Mallas por Asignatura */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mallas por Asignatura ({subjectCurriculums.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {subjectCurriculums.map((curriculum) => (
                        <div key={curriculum.id} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{curriculum.name}</div>
                              <div className="flex space-x-2 mt-1">
                                <Badge variant="outline">{curriculum.grade}</Badge>
                                <Badge variant="secondary">{curriculum.level}</Badge>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(curriculum)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(curriculum.id, 'subject')}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{curriculum.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="areas" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Formulario para Áreas */}
                <Card className="xl:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingItem ? 'Editar Malla Curricular' : 'Nueva Malla Curricular por Área'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Área *</Label>
                        <Select value={formData.name} onValueChange={(value) => setFormData({...formData, name: value, type: 'area'})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {areaOptions.map(area => (
                              <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>Grado *</Label>
                        <Select value={formData.grade} onValueChange={(value) => setFormData({...formData, grade: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {gradeOptions.map(grade => (
                              <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Nivel</Label>
                        <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {levelOptions.map(level => (
                              <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Resto del formulario similar al de asignaturas */}
                    <div>
                      <Label>Descripción del Área *</Label>
                      <Textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Descripción del área y sus componentes..."
                        rows={3}
                      />
                    </div>

                    <Button onClick={handleSave} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      {editingItem ? 'Actualizar' : 'Guardar'} Malla Curricular
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de Mallas por Área */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Mallas por Área ({areaCurriculums.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {areaCurriculums.map((curriculum) => (
                        <div key={curriculum.id} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="font-medium">{curriculum.name}</div>
                              <div className="flex space-x-2 mt-1">
                                <Badge variant="outline">{curriculum.grade}</Badge>
                                <Badge variant="secondary">{curriculum.level}</Badge>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(curriculum)}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(curriculum.id, 'area')}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{curriculum.description}</p>
                        </div>
                      ))}
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

export default CurriculumManager;