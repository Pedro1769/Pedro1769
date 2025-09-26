import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { X, Save, AlertCircle, UserPlus } from 'lucide-react';

const RegisterModal = ({ onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    document: '',
    phone: '',
    role: '',
    // Teacher specific
    teachingLevel: '', // 'transicion', 'primaria', 'bachillerato'
    isTutor: false,
    tutorGrade: '',
    subjects: [],
    grades: [],
    // Parent specific
    studentDocument: '',
    relationshipType: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Manejar cambios en campos de texto
  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  // Manejar cambios en selects
  const handleSelectChange = (field) => (value) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: value
    }));
  };

  // Manejar cambios en checkboxes
  const handleCheckboxChange = (field) => (checked) => {
    setFormData(prevState => ({
      ...prevState,
      [field]: checked
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio';
    if (!formData.email.trim()) newErrors.email = 'El email es obligatorio';
    if (formData.email && !formData.email.includes('@')) newErrors.email = 'Email inválido';
    if (!formData.password) newErrors.password = 'La contraseña es obligatoria';
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    if (!formData.document.trim()) newErrors.document = 'El documento es obligatorio';
    if (!formData.role) newErrors.role = 'Debe seleccionar un rol';
    
    if (formData.role === 'teacher') {
      if (!formData.teachingLevel) newErrors.teachingLevel = 'Debe seleccionar el nivel educativo';
      if (formData.isTutor && !formData.tutorGrade) newErrors.tutorGrade = 'Debe seleccionar el grado a cargo';
      if (formData.subjects.length === 0) newErrors.subjects = 'Debe seleccionar al menos una materia';
    }
    
    if (formData.role === 'parent') {
      if (!formData.studentDocument.trim()) newErrors.studentDocument = 'El documento del estudiante es obligatorio';
      if (!formData.relationshipType) newErrors.relationshipType = 'Debe especificar la relación con el estudiante';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const userData = {
        ...formData,
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        approved: true // Todos los usuarios se aprueban automáticamente
      };
      
      // Asignar grados automáticamente según el nivel educativo para docentes
      if (formData.role === 'teacher' && formData.teachingLevel) {
        userData.grades = getGradesByLevel(formData.teachingLevel);
      }
      
      // Remove password confirmation from final data
      delete userData.confirmPassword;
      
      onRegister(userData);
      onClose();
    } catch (error) {
      console.error('Error registering user:', error);
      setErrors({ general: 'Error al registrar usuario' });
    } finally {
      setLoading(false);
    }
  };

  const getSubjectsByLevel = (level) => {
    switch (level) {
      case 'transicion':
        return ['ESPAÑOL', 'INGLES', 'MATEMATICAS', 'SOCIALES-NATURALES', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
      case 'primaria':
        return ['ESPAÑOL', 'CALIGRAFIA', 'INGLES', 'MATEMATICAS', 'NATURALES', 'SOCIALES', 'CATEDRA DE PAZ', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
      case 'bachillerato':
        return ['ESPAÑOL', 'INGLES', 'MATEMATICA', 'GEOMETRIA', 'ESTADISTICA', 'BIOLOGIA', 'ED. SEXUAL', 'QUIMICA', 'FISICA', 'HISTORIA', 'GEOGRAFIA', 'CATEDRA DE LA PAZ', 'EMPRENDIMIENTO', 'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'];
      default:
        return [];
    }
  };

  const getGradesByLevel = (level) => {
    switch (level) {
      case 'transicion':
        return ['Transición'];
      case 'primaria':
        return ['1°', '2°', '3°', '4°', '5°'];
      case 'bachillerato':
        return ['6°', '7°', '8°', '9°', '10°', '11°'];
      default:
        return [];
    }
  };

  const toggleSubject = (subject) => {
    setFormData(prevState => ({
      ...prevState,
      subjects: prevState.subjects.includes(subject)
        ? prevState.subjects.filter(s => s !== subject)
        : [...prevState.subjects, subject]
    }));
  };

  const toggleGrade = (grade) => {
    setFormData(prevState => ({
      ...prevState,
      grades: prevState.grades.includes(grade)
        ? prevState.grades.filter(g => g !== grade)
        : [...prevState.grades, grade]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Registro de Usuario
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {errors.general && (
            <Alert className="border-red-200 bg-red-50 mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-700">{errors.general}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
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
                    onChange={handleInputChange('document')}
                    placeholder="Número de documento"
                    className={errors.document ? 'border-red-500' : ''}
                  />
                  {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="correo@ejemplo.com"
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange('phone')}
                    placeholder="Número de contacto"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder="Mínimo 6 caracteres"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    placeholder="Repetir contraseña"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Rol */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Información del Rol</h3>
              <div className="mb-4">
                <Label htmlFor="role">Tipo de Usuario *</Label>
                <Select value={formData.role} onValueChange={handleSelectChange('role')}>
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher">Docente</SelectItem>
                    <SelectItem value="parent">Padre de Familia</SelectItem>
                    <SelectItem value="student">Estudiante</SelectItem>
                    <SelectItem value="coordinadora_convivencia">Coordinadora de Convivencia</SelectItem>
                    <SelectItem value="coordinador_academico">Coordinador Académico</SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
              </div>
            </div>

            {/* Información Específica por Rol */}
            {formData.role === 'teacher' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Docente</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="teachingLevel">Nivel Educativo *</Label>
                      <Select 
                        value={formData.teachingLevel} 
                        onValueChange={(value) => {
                          setFormData(prevState => ({ 
                            ...prevState, 
                            teachingLevel: value, 
                            subjects: [], 
                            grades: [], 
                            tutorGrade: '' 
                          }));
                        }}
                      >
                        <SelectTrigger className={errors.teachingLevel ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar nivel" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="transicion">Transición</SelectItem>
                          <SelectItem value="primaria">Primaria (1° - 5°)</SelectItem>
                          <SelectItem value="bachillerato">Bachillerato (6° - 11°)</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.teachingLevel && <p className="text-red-500 text-sm mt-1">{errors.teachingLevel}</p>}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.isTutor}
                        onCheckedChange={handleCheckboxChange('isTutor')}
                      />
                      <Label>¿Es tutor de grado?</Label>
                    </div>
                  </div>

                  {formData.isTutor && formData.teachingLevel && (
                    <div>
                      <Label htmlFor="tutorGrade">Grado a Cargo *</Label>
                      <Select value={formData.tutorGrade} onValueChange={handleSelectChange('tutorGrade')}>
                        <SelectTrigger className={errors.tutorGrade ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Seleccionar grado" />
                        </SelectTrigger>
                        <SelectContent>
                          {getGradesByLevel(formData.teachingLevel).map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.tutorGrade && <p className="text-red-500 text-sm mt-1">{errors.tutorGrade}</p>}
                    </div>
                  )}

                  {formData.teachingLevel && (
                    <div>
                      <Label>Materias que Imparte *</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto border p-3 rounded">
                        {getSubjectsByLevel(formData.teachingLevel).map((subject) => (
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
                  )}
                </div>
              </div>
            )}

            {formData.role === 'parent' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Información del Acudiente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentDocument">Documento del Estudiante *</Label>
                    <Input
                      id="studentDocument"
                      value={formData.studentDocument}
                      onChange={handleInputChange('studentDocument')}
                      placeholder="Documento del estudiante"
                      className={errors.studentDocument ? 'border-red-500' : ''}
                    />
                    {errors.studentDocument && <p className="text-red-500 text-sm mt-1">{errors.studentDocument}</p>}
                  </div>

                  <div>
                    <Label htmlFor="relationshipType">Relación con el Estudiante *</Label>
                    <Select value={formData.relationshipType} onValueChange={handleSelectChange('relationshipType')}>
                      <SelectTrigger className={errors.relationshipType ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar relación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padre">Padre</SelectItem>
                        <SelectItem value="madre">Madre</SelectItem>
                        <SelectItem value="abuelo">Abuelo/a</SelectItem>
                        <SelectItem value="tio">Tío/a</SelectItem>
                        <SelectItem value="tutor">Tutor Legal</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.relationshipType && <p className="text-red-500 text-sm mt-1">{errors.relationshipType}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? 'Registrando...' : 'Registrar Usuario'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterModal;