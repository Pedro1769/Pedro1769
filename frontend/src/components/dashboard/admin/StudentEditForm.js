import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { DialogFooter } from '../../ui/dialog';

const StudentEditForm = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: student.name || '',
    grade: student.grade || '',
    level: student.level || '',
    document_number: student.document_number || '',
    is_active: student.is_active !== undefined ? student.is_active : true
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.grade.trim()) {
      newErrors.grade = 'El grado es obligatorio';
    }

    if (!formData.level.trim()) {
      newErrors.level = 'El nivel es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const gradeOptions = [
    'TRANSICIÓN', '1°', '2°', '3°', '4°', '5°', 
    '6°', '7°', '8°', '9°', '10°', '11°'
  ];

  const levelOptions = [
    'PREESCOLAR', 'PRIMARIA', 'BACHILLERATO'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 py-4">
        {/* Nombre */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nombre Completo *
          </Label>
          <div className="col-span-3">
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre completo del estudiante"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Grado */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="grade" className="text-right">
            Grado *
          </Label>
          <div className="col-span-3">
            <Select
              value={formData.grade}
              onValueChange={(value) => handleInputChange('grade', value)}
            >
              <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar grado" />
              </SelectTrigger>
              <SelectContent>
                {gradeOptions.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.grade && (
              <p className="text-red-500 text-xs mt-1">{errors.grade}</p>
            )}
          </div>
        </div>

        {/* Nivel */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="level" className="text-right">
            Nivel *
          </Label>
          <div className="col-span-3">
            <Select
              value={formData.level}
              onValueChange={(value) => handleInputChange('level', value)}
            >
              <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar nivel" />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map(level => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.level && (
              <p className="text-red-500 text-xs mt-1">{errors.level}</p>
            )}
          </div>
        </div>

        {/* Número de documento */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="document_number" className="text-right">
            Documento
          </Label>
          <div className="col-span-3">
            <Input
              id="document_number"
              value={formData.document_number}
              onChange={(e) => handleInputChange('document_number', e.target.value)}
              placeholder="Número de documento (opcional)"
            />
          </div>
        </div>

        {/* Estado */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="is_active" className="text-right">
            Estado
          </Label>
          <div className="col-span-3">
            <Select
              value={formData.is_active ? 'true' : 'false'}
              onValueChange={(value) => handleInputChange('is_active', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
          Guardar Cambios
        </Button>
      </DialogFooter>
    </form>
  );
};

export default StudentEditForm;