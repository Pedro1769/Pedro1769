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
  Target,
  BookOpen,
  FileText,
  X,
  AlertCircle
} from 'lucide-react';

const AcademicObjectivesManager = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('objectives');
  const [objectives, setObjectives] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    grade: '',
    level: '',
    period: '',
    objective: '',
    achievement: '',
    type: 'cognitive', // cognitive, procedural, attitudinal
    category: ''
  });

  // Cargar datos del localStorage
  useEffect(() => {
    const storedObjectives = JSON.parse(localStorage.getItem('gada_objectives') || '[]');
    const storedAchievements = JSON.parse(localStorage.getItem('gada_achievements') || '[]');
    setObjectives(storedObjectives);
    setAchievements(storedAchievements);
  }, []);

  const saveToStorage = () => {
    localStorage.setItem('gada_objectives', JSON.stringify(objectives));
    localStorage.setItem('gada_achievements', JSON.stringify(achievements));
  };

  const handleSaveObjective = () => {
    if (!formData.subject || !formData.grade || !formData.objective) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const newObjective = {
      id: editingItem?.id || Date.now() + Math.random(),
      ...formData,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingItem) {
      setObjectives(prev => prev.map(obj => obj.id === editingItem.id ? newObjective : obj));
    } else {
      setObjectives(prev => [...prev, newObjective]);
    }

    setEditingItem(null);
    setFormData({
      subject: '',
      grade: '',
      level: '',
      period: '',
      objective: '',
      achievement: '',
      type: 'cognitive',
      category: ''
    });
    
    saveToStorage();
  };

  const handleSaveAchievement = () => {
    if (!formData.subject || !formData.grade || !formData.achievement) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const newAchievement = {
      id: editingItem?.id || Date.now() + Math.random(),
      ...formData,
      createdAt: editingItem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingItem) {
      setAchievements(prev => prev.map(ach => ach.id === editingItem.id ? newAchievement : ach));
    } else {
      setAchievements(prev => [...prev, newAchievement]);
    }

    setEditingItem(null);
    setFormData({
      subject: '',
      grade: '',
      level: '',
      period: '',
      objective: '',
      achievement: '',
      type: 'cognitive',
      category: ''
    });
    
    saveToStorage();
  };

  const handleEdit = (item, type) => {
    setEditingItem({ ...item, itemType: type });
    setFormData(item);
  };

  const handleDelete = (id, type) => {
    if (window.confirm('¿Está seguro de eliminar este elemento?')) {
      if (type === 'objective') {
        setObjectives(prev => prev.filter(obj => obj.id !== id));
      } else {
        setAchievements(prev => prev.filter(ach => ach.id !== id));
      }
      saveToStorage();
    }
  };

  const exportData = () => {
    const data = {
      objectives: objectives,
      achievements: achievements,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `objetivos_logros_GADA_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.objectives) setObjectives(data.objectives);
          if (data.achievements) setAchievements(data.achievements);
          saveToStorage();
          alert('Datos importados exitosamente');
        } catch (error) {
          alert('Error al importar los datos');
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

  const gradeOptions = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  const levelOptions = ['Básica Primaria', 'Básica Secundaria', 'Media Vocacional'];
  const periodOptions = ['1', '2', '3', '4'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Gestión de Objetivos y Logros Académicos
          </CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
              id="import-file"
            />
            <Button variant="outline" onClick={() => document.getElementById('import-file').click()}>
              <Upload className="mr-2 h-4 w-4" />
              Importar
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="objectives">Objetivos Académicos</TabsTrigger>
              <TabsTrigger value="achievements">Banco de Logros</TabsTrigger>
            </TabsList>

            <TabsContent value="objectives" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario para Objetivos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingItem?.itemType === 'objective' ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Materia *</Label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
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

                      <div>
                        <Label>Período</Label>
                        <Select value={formData.period} onValueChange={(value) => setFormData({...formData, period: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            {periodOptions.map(period => (
                              <SelectItem key={period} value={period}>Período {period}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Tipo de Objetivo</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cognitive">Cognitivo</SelectItem>
                          <SelectItem value="procedural">Procedimental</SelectItem>
                          <SelectItem value="attitudinal">Actitudinal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Objetivo *</Label>
                      <Textarea
                        value={formData.objective}
                        onChange={(e) => setFormData({...formData, objective: e.target.value})}
                        placeholder="Describa el objetivo académico..."
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleSaveObjective} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      {editingItem?.itemType === 'objective' ? 'Actualizar' : 'Guardar'} Objetivo
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de Objetivos */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Objetivos Registrados ({objectives.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {objectives.map((objective) => (
                        <div key={objective.id} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex space-x-2">
                              <Badge variant="outline">{objective.subject}</Badge>
                              <Badge variant="secondary">{objective.grade}</Badge>
                              {objective.period && <Badge>{objective.period}°</Badge>}
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(objective, 'objective')}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(objective.id, 'objective')}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{objective.objective}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Formulario para Logros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {editingItem?.itemType === 'achievement' ? 'Editar Logro' : 'Nuevo Logro'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Materia *</Label>
                        <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
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
                    </div>

                    <div>
                      <Label>Categoría del Logro</Label>
                      <Input
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        placeholder="Ej: Comprensión lectora, Resolución de problemas..."
                      />
                    </div>

                    <div>
                      <Label>Logro Académico *</Label>
                      <Textarea
                        value={formData.achievement}
                        onChange={(e) => setFormData({...formData, achievement: e.target.value})}
                        placeholder="Describa el logro o indicador de desempeño..."
                        rows={4}
                      />
                    </div>

                    <Button onClick={handleSaveAchievement} className="w-full">
                      <Save className="mr-2 h-4 w-4" />
                      {editingItem?.itemType === 'achievement' ? 'Actualizar' : 'Guardar'} Logro
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de Logros */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Banco de Logros ({achievements.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {achievements.map((achievement) => (
                        <div key={achievement.id} className="border p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex space-x-2">
                              <Badge variant="outline">{achievement.subject}</Badge>
                              <Badge variant="secondary">{achievement.grade}</Badge>
                              {achievement.category && <Badge variant="default">{achievement.category}</Badge>}
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(achievement, 'achievement')}>
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(achievement.id, 'achievement')}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{achievement.achievement}</p>
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

export default AcademicObjectivesManager;