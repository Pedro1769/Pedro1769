import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, Save, AlertCircle } from 'lucide-react';
import { StudentsManager } from '../utils/dataManager';

const StudentEditModal = ({ student, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    level: '',
    document: '',
    birthDate: '',
    parentEmail: '',
    academicYear: 2025
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Cargar datos del estudiante al abrir el modal
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        grade: student.grade || '',
        level: student.level || '',
        document: student.document || '',
        birthDate: student.birthDate || '',
        parentEmail: student.parentEmail || '',
        academicYear: student.academicYear || 2025
      });
    }
  }, [student]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    
    if (!formData.grade) {
      newErrors.grade = 'El grado es obligatorio';
    }
    
    if (!formData.level) {
      newErrors.level = 'El nivel es obligatorio';
    }
    
    if (!formData.document.trim()) {
      newErrors.document = 'El documento es obligatorio';
    }
    
    if (formData.parentEmail && !formData.parentEmail.includes('@')) {
      newErrors.parentEmail = 'Email inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar cambios
  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      // Actualizar usando el manager
      const updatedStudent = StudentsManager.update(student.id, formData);
      
      if (updatedStudent && onUpdate) {
        onUpdate(updatedStudent);
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating student:', error);
      setErrors({ general: 'Error al guardar los cambios' });
    } finally {
      setSaving(false);
    }
  };

  // Opciones de grado y nivel
  const gradeOptions = [
    '1°', '2°', '3°', '4°', '5°', // Primaria
    '6°', '7°', '8°', '9°', // Secundaria
    '10°', '11°' // Media
  ];

  const levelOptions = [
    'Básica Primaria',
    'Básica Secundaria', 
    'Media Vocacional'
  ];

  if (!student) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Editar Estudiante</CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {errors.general && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">
                {errors.general}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre Completo */}
            <div className="md:col-span-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombres y apellidos del estudiante"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Grado */}
            <div>
              <Label htmlFor="grade">Grado *</Label>
              <Select value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })}>
                <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
            </div>

            {/* Nivel Educativo */}
            <div>
              <Label htmlFor="level">Nivel Educativo *</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Seleccionar nivel" />
                </SelectTrigger>
                <SelectContent>
                  {levelOptions.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
            </div>

            {/* Documento de Identidad */}
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

            {/* Fecha de Nacimiento */}
            <div>
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>

            {/* Email del Padre/Acudiente */}
            <div className="md:col-span-2">
              <Label htmlFor="parentEmail">Email del Padre/Acudiente</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                placeholder="correo@ejemplo.com"
                className={errors.parentEmail ? 'border-red-500' : ''}
              />
              {errors.parentEmail && <p className="text-red-500 text-sm mt-1">{errors.parentEmail}</p>}
            </div>

            {/* Año Académico */}
            <div>
              <Label htmlFor="academicYear">Año Académico</Label>
              <Select value={formData.academicYear.toString()} onValueChange={(value) => setFormData({ ...formData, academicYear: parseInt(value) })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2026">2026</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Información del estudiante */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Información de Registro</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
              <div>ID: {student.id}</div>
              <div>Creado: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('es-CO') : 'N/A'}</div>
              <div className="md:col-span-2">
                Última actualización: {student.updatedAt ? new Date(student.updatedAt).toLocaleDateString('es-CO') : 'N/A'}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentEditModal;