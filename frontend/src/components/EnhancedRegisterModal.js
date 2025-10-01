import React, { useState } from 'react';
import { X, Save, User, Mail, Lock, FileText, Users, BookOpen, GraduationCap } from 'lucide-react';

const EnhancedRegisterModal = ({ onClose, onRegister }) => {
  // Estado para formulario
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    document: '',
    role: '',
    // Campos específicos para docentes
    teaching_level: '',
    grades: [],
    subjects: [],
    is_tutor: false,
    tutor_grade: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Definir materias por nivel
  const subjectsByLevel = {
    transicion: [
      'ESPAÑOL', 'INGLES', 'MATEMATICAS', 'SOCIALES-NATURALES', 
      'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'
    ],
    primaria: [
      'ESPAÑOL', 'CALIGRAFIA', 'INGLES', 'MATEMATICAS', 'NATURALES', 
      'SOCIALES', 'CATEDRA DE PAZ', 'ETICA Y RELIGION', 'INFORMATICA', 
      'ARTE', 'ED. FISICA'
    ],
    bachillerato: [
      'ESPAÑOL', 'INGLES', 'MATEMATICA', 'GEOMETRIA', 'ESTADISTICA',
      'BIOLOGIA', 'ED. SEXUAL', 'QUIMICA', 'FISICA', 'HISTORIA', 
      'GEOGRAFIA', 'CATEDRA DE LA PAZ', 'EMPRENDIMIENTO', 'ETICA Y RELIGION',
      'TECNOLOGIA', 'INFORMATICA', 'ARTE', 'MUSICA', 'ED. FISICA'
    ]
  };

  // Definir grados por nivel
  const gradesByLevel = {
    transicion: ['0°'],
    primaria: ['1°', '2°', '3°', '4°', '5°'],
    bachillerato: ['6°', '7°', '8°', '9°', '10°', '11°']
  };

  // Función para manejar cambios en inputs
  const handleInputChange = (field, value) => {
    console.log(`📝 Cambiando ${field}:`, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Función para manejar cambios en el nivel de enseñanza
  const handleTeachingLevelChange = (level) => {
    console.log('🎓 Cambiando nivel de enseñanza:', level);
    setFormData(prev => ({
      ...prev,
      teaching_level: level,
      grades: [], // Resetear grados seleccionados
      subjects: [], // Resetear materias seleccionadas
      tutor_grade: '' // Resetear grado de tutoría
    }));
  };

  // Función para manejar selección de grados
  const handleGradeToggle = (grade) => {
    const currentGrades = Array.isArray(formData.grades) ? formData.grades : [];
    
    // Para transición y primaria, solo un grado
    if (formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') {
      setFormData(prev => ({
        ...prev,
        grades: currentGrades.includes(grade) ? [] : [grade],
        tutor_grade: currentGrades.includes(grade) ? '' : grade // Auto-asignar como tutor
      }));
    } else {
      // Para bachillerato, múltiples grados
      const newGrades = currentGrades.includes(grade)
        ? currentGrades.filter(g => g !== grade)
        : [...currentGrades, grade];
      
      setFormData(prev => ({
        ...prev,
        grades: newGrades
      }));
    }
  };

  // Función para manejar selección de materias
  const handleSubjectToggle = (subject) => {
    const currentSubjects = Array.isArray(formData.subjects) ? formData.subjects : [];
    
    // Para transición y primaria, todas las materias automáticamente
    if (formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') {
      const allSubjects = subjectsByLevel[formData.teaching_level] || [];
      setFormData(prev => ({
        ...prev,
        subjects: allSubjects
      }));
      return;
    }
    
    // Para bachillerato, selección individual
    const newSubjects = currentSubjects.includes(subject)
      ? currentSubjects.filter(s => s !== subject)
      : [...currentSubjects, subject];
    
    setFormData(prev => ({
      ...prev,
      subjects: newSubjects
    }));
  };

  // Función para envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Enviando formulario mejorado con datos:', {
      ...formData,
      password: formData.password ? '***' : ''
    });

    // Validación básica
    if (!formData.name || !formData.email || !formData.password || !formData.document || !formData.role) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validación específica para docentes
    if (formData.role === 'teacher') {
      if (!formData.teaching_level) {
        setError('Por favor seleccione el nivel de enseñanza');
        return;
      }
      
      if (!formData.grades || formData.grades.length === 0) {
        setError('Por favor seleccione al menos un grado');
        return;
      }
      
      // Para bachillerato, verificar que haya materias seleccionadas
      if (formData.teaching_level === 'bachillerato' && (!formData.subjects || formData.subjects.length === 0)) {
        setError('Por favor seleccione al menos una materia para bachillerato');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      // Preparar datos de usuario para envío
      let userData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        document: formData.document.trim(),
        phone: ''
      };

      // Añadir campos específicos para docentes
      if (formData.role === 'teacher') {
        userData.teaching_level = formData.teaching_level;
        userData.grades = formData.grades;
        
        // Asignar materias según el nivel
        if (formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') {
          userData.subjects = subjectsByLevel[formData.teaching_level] || [];
        } else {
          userData.subjects = formData.subjects;
        }
      } else {
        userData.subjects = [];
        userData.grades = [];
        userData.teaching_level = '';
      }

      console.log('📤 Enviando a:', `${backendUrl}/api/users`);
      console.log('📤 Datos finales:', { ...userData, password: '***' });

      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const createdUser = await response.json();
        console.log('✅ Usuario creado:', createdUser);
        
        let successMessage = `✅ Usuario registrado exitosamente!\n\nNombre: ${createdUser.name}\nEmail: ${createdUser.email}\nRol: ${createdUser.role}`;
        
        if (createdUser.role === 'teacher') {
          successMessage += `\nNivel: ${createdUser.teaching_level}\nGrados: ${createdUser.grades?.join(', ') || 'N/A'}\nMaterias: ${createdUser.subjects?.length || 0} materias asignadas`;
          
          if (formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') {
            successMessage += `\nTutor de: ${formData.grades[0] || 'N/A'}`;
          }
        }
        
        successMessage += '\n\nYa puede hacer login.';
        
        alert(successMessage);
        
        if (onRegister) {
          onRegister(createdUser);
        }
        onClose();
      } else {
        const errorData = await response.text();
        console.error('❌ Error del servidor:', errorData);
        setError(`Error del servidor: ${response.status} - ${errorData}`);
      }
      
    } catch (error) {
      console.error('❌ Error de red:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            Registro de Usuario - Gimnasio Americano del Atlántico
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <User className="h-4 w-4 inline mr-1" />
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Ingrese su nombre completo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="h-4 w-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Lock className="h-4 w-4 inline mr-1" />
                Contraseña *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Documento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="h-4 w-4 inline mr-1" />
                Documento *
              </label>
              <input
                type="text"
                value={formData.document}
                onChange={(e) => handleInputChange('document', e.target.value)}
                placeholder="Número de documento"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Rol *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['teacher', 'student', 'parent', 'coordinadora_convivencia', 'admin'].map((roleOption) => (
                <label key={roleOption} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="role"
                    value={roleOption}
                    checked={formData.role === roleOption}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm font-medium">
                    {roleOption === 'teacher' ? 'Docente' :
                     roleOption === 'student' ? 'Estudiante' :
                     roleOption === 'parent' ? 'Padre/Madre' :
                     roleOption === 'coordinadora_convivencia' ? 'Coord. Convivencia' :
                     'Administrador'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Configuración específica para Docentes */}
          {formData.role === 'teacher' && (
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Configuración Docente
              </h3>

              {/* Nivel de Enseñanza */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nivel de Enseñanza *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['transicion', 'primaria', 'bachillerato'].map((level) => (
                    <label key={level} className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      formData.teaching_level === level ? 'border-blue-500 bg-blue-50' : ''
                    }`}>
                      <input
                        type="radio"
                        name="teaching_level"
                        value={level}
                        checked={formData.teaching_level === level}
                        onChange={(e) => handleTeachingLevelChange(e.target.value)}
                        className="mr-2"
                        disabled={loading}
                      />
                      <span className="text-sm font-medium">
                        {level === 'transicion' ? 'Transición (0°)' :
                         level === 'primaria' ? 'Primaria (1°-5°)' :
                         'Bachillerato (6°-11°)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Selección de Grados */}
              {formData.teaching_level && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grados a Cargo *
                    {(formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') && 
                      <span className="text-xs text-gray-500 ml-1">(Un grado por docente)</span>
                    }
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {(gradesByLevel[formData.teaching_level] || []).map((grade) => (
                      <label key={grade} className={`flex items-center justify-center p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                        (formData.grades || []).includes(grade) ? 'border-blue-500 bg-blue-50' : ''
                      }`}>
                        <input
                          type="checkbox"
                          checked={(formData.grades || []).includes(grade)}
                          onChange={() => handleGradeToggle(grade)}
                          className="mr-1"
                          disabled={loading}
                        />
                        <span className="text-sm font-medium">{grade}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Selección de Materias para Bachillerato */}
              {formData.teaching_level === 'bachillerato' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="h-4 w-4 inline mr-1" />
                    Materias que Imparte *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border p-3 rounded">
                    {(subjectsByLevel.bachillerato || []).map((subject) => (
                      <label key={subject} className={`flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                        (formData.subjects || []).includes(subject) ? 'border-green-500 bg-green-50' : ''
                      }`}>
                        <input
                          type="checkbox"
                          checked={(formData.subjects || []).includes(subject)}
                          onChange={() => handleSubjectToggle(subject)}
                          className="mr-2"
                          disabled={loading}
                        />
                        <span className="text-xs">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Información de Materias para Primaria/Transición */}
              {(formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                  <p className="text-sm text-blue-800 font-medium">
                    ℹ️ Materias Asignadas Automáticamente:
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Como docente de {formData.teaching_level}, se le asignarán automáticamente todas las materias correspondientes a este nivel.
                  </p>
                  {formData.teaching_level && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(subjectsByLevel[formData.teaching_level] || []).map((subject) => (
                        <span key={subject} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Información de Tutoría */}
              {formData.grades && formData.grades.length > 0 && (formData.teaching_level === 'transicion' || formData.teaching_level === 'primaria') && (
                <div className="bg-green-50 border border-green-200 p-3 rounded">
                  <p className="text-sm text-green-800 font-medium">
                    ✅ Tutoría Asignada:
                  </p>
                  <p className="text-xs text-green-700">
                    Será tutor del grado <strong>{formData.grades[0]}</strong> y solo podrá acceder a ese grado en su panel.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Estado actual del formulario */}
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
            <strong>Estado actual:</strong><br/>
            Nombre: {formData.name || '(vacío)'}<br/>
            Email: {formData.email || '(vacío)'}<br/>
            Password: {formData.password ? '(ingresado)' : '(vacío)'}<br/>
            Documento: {formData.document || '(vacío)'}<br/>
            Rol: {formData.role || '(no seleccionado)'}
            {formData.role === 'teacher' && (
              <>
                <br/>Nivel: {formData.teaching_level || '(no seleccionado)'}
                <br/>Grados: {formData.grades?.length ? formData.grades.join(', ') : '(ninguno)'}
                <br/>Materias: {formData.subjects?.length ? `${formData.subjects.length} seleccionadas` : '(ninguna)'}
              </>
            )}
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedRegisterModal;