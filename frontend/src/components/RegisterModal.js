import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { X, Save, AlertCircle, UserPlus } from 'lucide-react';
import ApiService from '../services/apiService';

const RegisterModal = ({ onClose, onRegister }) => {
  // Estado del formulario con valores iniciales más explícitos
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    document: '',
    phone: '',
    role: '',
    // Teacher specific
    teachingLevel: '',
    isTutor: false,
    tutorGrade: '',
    subjects: [],
    grades: [],
    // Student specific
    studentGrade: '',
    birthDate: '',
    // Parent specific
    studentDocument: '',
    relationshipType: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  // Debug: Log estado del formulario cada vez que cambie
  useEffect(() => {
    console.log('🔍 Estado actual del formulario:', {
      name: formData.name,
      email: formData.email,
      password: formData.password ? '***' : '',
      role: formData.role,
      subjects: formData.subjects
    });
  }, [formData]);

  // Handler mejorado para campos de input con logging detallado
  const handleInputChange = useCallback((event) => {
    if (!event || !event.target) {
      console.error('❌ Evento inválido en handleInputChange:', event);
      return;
    }
    
    const { name, value, type } = event.target;
    
    console.log(`📝 Input cambiado - Campo: ${name}, Valor: ${value}, Tipo: ${type}`);
    
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [name]: value
      };
      console.log(`💾 Nuevo estado para ${name}:`, newState[name]);
      return newState;
    });
    
    // Limpiar errores cuando el usuario escribe
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Handler mejorado para selects
  const handleSelectChange = useCallback((field, value) => {
    console.log(`🎯 Select cambiado - Campo: ${field}, Valor: ${value}`);
    
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [field]: value
      };
      console.log(`💾 Nuevo estado para ${field}:`, newState[field]);
      return newState;
    });
    
    // Limpiar errores
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Handler mejorado para checkboxes
  const handleCheckboxChange = useCallback((field, checked) => {
    console.log(`☑️ Checkbox cambiado - Campo: ${field}, Marcado: ${checked}`);
    
    setFormData(prevState => {
      const newState = {
        ...prevState,
        [field]: checked
      };
      console.log(`💾 Nuevo estado para ${field}:`, newState[field]);
      return newState;
    });
  }, []);

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
    
    if (formData.role === 'student') {
      if (!formData.studentGrade) newErrors.studentGrade = 'Debe seleccionar el grado';
      if (!formData.birthDate) newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    }
    
    if (formData.role === 'parent') {
      if (!formData.studentDocument.trim()) newErrors.studentDocument = 'El documento del estudiante es obligatorio';
      if (!formData.relationshipType) newErrors.relationshipType = 'Debe especificar la relación con el estudiante';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    console.log('🚀 INICIANDO ENVÍO DEL FORMULARIO');
    console.log('📋 Estado completo del formulario:', formData);
    
    // Validar que tenemos los datos mínimos
    console.log('🔍 Validando datos del formulario:', {
      name: formData.name || 'VACIO',
      email: formData.email || 'VACIO', 
      password: formData.password ? 'PRESENTE' : 'VACIO',
      role: formData.role || 'VACIO',
      document: formData.document || 'VACIO'
    });
    
    if (!validateForm()) {
      console.error('❌ Validación del formulario falló:', errors);
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar datos con valores por defecto más robustos
      const userData = {
        name: String(formData.name || '').trim(),
        email: String(formData.email || '').trim().toLowerCase(),
        password: String(formData.password || ''),
        role: String(formData.role || ''),
        document: String(formData.document || '').trim(),
        phone: String(formData.phone || '').trim(),
        subjects: Array.isArray(formData.subjects) ? formData.subjects : [],
        grades: [],
        teaching_level: String(formData.teachingLevel || '')
      };
      
      // Asignar grados automáticamente según el nivel educativo para docentes
      if (formData.role === 'teacher' && formData.teachingLevel) {
        userData.grades = getGradesByLevel(formData.teachingLevel);
        console.log('👨‍🏫 Grados asignados para docente:', userData.grades);
      }

      // Asignar información específica para estudiantes
      if (formData.role === 'student' && formData.studentGrade) {
        userData.grades = [formData.studentGrade];
        console.log('🎓 Grado asignado para estudiante:', userData.grades);
      }
      
      console.log('📤 Enviando datos a la API:', {
        ...userData,
        password: '***' // No mostrar la contraseña en logs
      });
      
      // Llamar a la API
      const createdUser = await ApiService.createUser(userData);
      
      console.log('✅ Usuario creado exitosamente:', {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role
      });
      
      // Si es estudiante, también crear registro de estudiante
      if (formData.role === 'student' && formData.studentGrade) {
        try {
          const studentData = {
            name: formData.name,
            grade: formData.studentGrade,
            document: formData.document,
            age: 0,
            parent_email: '',
            parent_phone: '',
            created_by: 'registration'
          };
          
          await ApiService.createStudent(studentData);
          console.log('✅ Registro de estudiante creado');
        } catch (studentError) {
          console.warn('⚠️ Error creando registro de estudiante:', studentError);
          // No fallar el registro principal por esto
        }
      }
      
      // Mostrar mensaje de éxito
      alert(`✅ Usuario ${formData.name} registrado exitosamente!\n\nPuede hacer login inmediatamente con su email y contraseña.`);
      
      // Llamar al callback de éxito
      if (onRegister && typeof onRegister === 'function') {
        onRegister(createdUser);
      }
      
      // Cerrar modal
      onClose();
      
    } catch (error) {
      console.error('❌ ERROR al registrar usuario:', error);
      
      let errorMessage = 'Error desconocido al registrar usuario';
      
      if (error.response) {
        // Error de respuesta del servidor
        errorMessage = `Error del servidor: ${error.response.status} - ${error.response.data?.detail || error.response.statusText}`;
      } else if (error.request) {
        // Error de red
        errorMessage = 'Error de conexión. Verifique su conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ general: errorMessage });
      
    } finally {
      setLoading(false);
    }
  }, [formData, errors, validateForm, getGradesByLevel, onRegister, onClose]);

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

  const getStudentLevel = (grade) => {
    switch (grade) {
      case '0°':
        return 'Transición';
      case '1°':
      case '2°':
      case '3°':
      case '4°':
      case '5°':
        return 'Básica Primaria';
      case '6°':
      case '7°':
      case '8°':
      case '9°':
        return 'Básica Secundaria';
      case '10°':
      case '11°':
        return 'Media Vocacional';
      default:
        return 'N/A';
    }
  };

  const toggleSubject = useCallback((subject) => {
    console.log('📚 Cambiando materia:', subject, 'Materias actuales:', formData.subjects);
    
    setFormData(prevState => {
      const currentSubjects = Array.isArray(prevState.subjects) ? prevState.subjects : [];
      const newSubjects = currentSubjects.includes(subject)
        ? currentSubjects.filter(s => s !== subject)
        : [...currentSubjects, subject];
      
      console.log('📚 Nuevas materias:', newSubjects);
      
      return {
        ...prevState,
        subjects: newSubjects
      };
    });
  }, [formData.subjects]);

  const toggleGrade = useCallback((grade) => {
    console.log('🎯 Cambiando grado:', grade, 'Grados actuales:', formData.grades);
    
    setFormData(prevState => {
      const currentGrades = Array.isArray(prevState.grades) ? prevState.grades : [];
      const newGrades = currentGrades.includes(grade)
        ? currentGrades.filter(g => g !== grade)
        : [...currentGrades, grade];
      
      console.log('🎯 Nuevos grados:', newGrades);
      
      return {
        ...prevState,
        grades: newGrades
      };
    });
  }, [formData.grades]);

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
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    onFocus={() => console.log('📝 Focus en campo nombre')}
                    onBlur={() => console.log('📝 Blur en campo nombre, valor:', formData.name)}
                    placeholder="Nombres y apellidos"
                    autoComplete="name"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="document">Documento de Identidad *</Label>
                  <input
                    id="document"
                    name="document"
                    type="text"
                    value={formData.document || ''}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    onFocus={() => console.log('📝 Focus en campo documento')}
                    onBlur={() => console.log('📝 Blur en campo documento, valor:', formData.document)}
                    placeholder="Número de documento"
                    autoComplete="off"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.document ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.document && <p className="text-red-500 text-sm mt-1">{errors.document}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    onFocus={() => console.log('📝 Focus en campo email')}
                    onBlur={() => console.log('📝 Blur en campo email, valor:', formData.email)}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone || ''}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    placeholder="Número de contacto"
                    autoComplete="tel"
                    className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="password">Contraseña *</Label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password || ''}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    onFocus={() => console.log('📝 Focus en campo password')}
                    onBlur={() => console.log('📝 Blur en campo password, longitud:', formData.password?.length || 0)}
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    onInput={handleInputChange}
                    placeholder="Repetir contraseña"
                    autoComplete="new-password"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
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
                <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
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
                        onCheckedChange={(checked) => handleCheckboxChange('isTutor', checked)}
                      />
                      <Label>¿Es tutor de grado?</Label>
                    </div>
                  </div>

                  {formData.isTutor && formData.teachingLevel && (
                    <div>
                      <Label htmlFor="tutorGrade">Grado a Cargo *</Label>
                      <Select value={formData.tutorGrade} onValueChange={(value) => handleSelectChange('tutorGrade', value)}>
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

            {/* Student specific fields */}
            {formData.role === 'student' && (
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-medium text-green-800">Información del Estudiante</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentGrade">Grado *</Label>
                    <Select value={formData.studentGrade || ''} onValueChange={(value) => handleSelectChange('studentGrade', value)}>
                      <SelectTrigger className={errors.studentGrade ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0°">Transición</SelectItem>
                        <SelectItem value="1°">Primero</SelectItem>
                        <SelectItem value="2°">Segundo</SelectItem>
                        <SelectItem value="3°">Tercero</SelectItem>
                        <SelectItem value="4°">Cuarto</SelectItem>
                        <SelectItem value="5°">Quinto</SelectItem>
                        <SelectItem value="6°">Sexto</SelectItem>
                        <SelectItem value="7°">Séptimo</SelectItem>
                        <SelectItem value="8°">Octavo</SelectItem>
                        <SelectItem value="9°">Noveno</SelectItem>
                        <SelectItem value="10°">Décimo</SelectItem>
                        <SelectItem value="11°">Once</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.studentGrade && <p className="text-red-500 text-sm mt-1">{errors.studentGrade}</p>}
                  </div>

                  <div>
                    <Label htmlFor="birthDate">Fecha de Nacimiento *</Label>
                    <input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={handleInputChange}
                      onInput={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Parent specific fields */}
            {formData.role === 'parent' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Información del Acudiente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentDocument">Documento del Estudiante *</Label>
                    <input
                      id="studentDocument"
                      name="studentDocument"
                      type="text"
                      value={formData.studentDocument || ''}
                      onChange={handleInputChange}
                      onInput={handleInputChange}
                      placeholder="Documento del estudiante"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.studentDocument ? 'border-red-500' : 'border-gray-300'}`}
                    />
                    {errors.studentDocument && <p className="text-red-500 text-sm mt-1">{errors.studentDocument}</p>}
                  </div>

                  <div>
                    <Label htmlFor="relationshipType">Relación con el Estudiante *</Label>
                    <Select value={formData.relationshipType} onValueChange={(value) => handleSelectChange('relationshipType', value)}>
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

            {/* Debug - Mostrar estado del formulario */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Estado del Formulario (Debug):</h4>
                <pre className="text-xs text-gray-600 max-h-32 overflow-y-auto">
                  {JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password ? '***' : '',
                    role: formData.role,
                    document: formData.document,
                    subjects: formData.subjects
                  }, null, 2)}
                </pre>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-between items-center space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  console.log('🔍 Estado actual completo del formulario:', formData);
                  alert(`Datos capturados:\nNombre: ${formData.name}\nEmail: ${formData.email}\nRol: ${formData.role}\nDocumento: ${formData.document}`);
                }}
              >
                🔍 Ver Datos
              </Button>
              
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Registrando...' : 'Registrar Usuario'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterModal;