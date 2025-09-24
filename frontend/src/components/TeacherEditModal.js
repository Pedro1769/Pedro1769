import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { X, Save, AlertCircle, Plus, Minus } from 'lucide-react';

const TeacherEditModal = ({ teacher, onClose, onUpdate, isNew = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    subjects: [],
    grades: [],
    specialization: '',
    academicLevel: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (teacher && !isNew) {
      setFormData({
        name: teacher.name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        document: teacher.document || '',
        subjects: teacher.subjects || [],
        grades: teacher.grades || [],
        specialization: teacher.specialization || '',
        academicLevel: teacher.academicLevel || ''
      });
    }
  }, [teacher, isNew]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (formData.email && !formData.email.includes('@')) newErrors.email = 'Email inválido';
    if (!formData.document.trim()) newErrors.document = 'El documento es obligatorio';
    if (formData.subjects.length === 0) newErrors.subjects = 'Debe asignar al menos una materia';
    if (formData.grades.length === 0) newErrors.grades = 'Debe asignar al menos un grado';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const teacherData = {
        ...formData,
        role: 'teacher',
        id: isNew ? Date.now() + Math.random() : teacher.id,
        createdAt: isNew ? new Date().toISOString() : teacher.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      onUpdate(teacherData);
      onClose();
    } catch (error) {
      console.error('Error saving teacher:', error);
      setErrors({ general: 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
  };

  const subjectOptions = [
    'Matemáticas', 'Español', 'Inglés', 'Ciencias Naturales', 'Biología', 
    'Física', 'Química', 'Ciencias Sociales', 'Geografía', 'Historia',
    'Educación Física', 'Educación Artística', 'Tecnología', 'Informática',
    'Filosofía', 'Ética y Valores', 'Educación Religiosa', 'Cátedra de la Paz'
  ];

  const gradeOptions = ['1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isNew ? 'Agregar Docente' : 'Editar Docente'}</CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.general && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información Personal */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
            </div>

            <div>
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombres y apellidos"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="document">Documento de Identidad *</Label>
              <Input
                id="document"
                value={formData.document}
                onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                placeholder="Número de documento"
                className={errors.document ? 'border-red-500' : ''}
              />
              {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Institucional *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="profesor@gada.edu.co"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Número de contacto"
              />
            </div>

            <div>
              <Label htmlFor="specialization">Especialización</Label>
              <Input
                id="specialization"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="Área de especialización"
              />
            </div>

            <div>
              <Label htmlFor="academicLevel">Nivel Académico</Label>
              <Select value={formData.academicLevel} onValueChange={(value) => setFormData({ ...formData, academicLevel: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="licenciatura">Licenciatura</SelectItem>
                  <SelectItem value="especializacion">Especialización</SelectItem>
                  <SelectItem value="maestria">Maestría</SelectItem>
                  <SelectItem value="doctorado">Doctorado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Asignación Académica */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4 mt-6">Asignación Académica</h3>
            </div>

            <div className="md:col-span-2">
              <Label>Materias Asignadas *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto border p-3 rounded">
                {subjectOptions.map((subject) => (
                  <div key={subject} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.subjects.includes(subject)}
                      onCheckedChange={() => toggleSubject(subject)}
                    />
                    <label className="text-sm">{subject}</label>
                  </div>
                ))}
              </div>
              {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
            </div>

            <div className="md:col-span-2">
              <Label>Grados Asignados *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
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
              {errors.grades && <p className="text-red-500 text-sm mt-1">{errors.grades}</p>}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : (isNew ? 'Crear Docente' : 'Guardar Cambios')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherEditModal;