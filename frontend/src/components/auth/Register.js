import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
    email: '',
    phone: '',
    role: 'padre',
    grade: '',
    grades: [],
    subjects: []
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Opciones para roles
  const roles = [
    { value: 'padre', label: 'Padre/Acudiente' },
    { value: 'docente_primaria', label: 'Docente de Primaria' },
    { value: 'docente_bachillerato', label: 'Docente de Bachillerato' },
    { value: 'coordinador_convivencia', label: 'Coordinador de Convivencia' }
  ];

  // Opciones para grados
  const gradesPrimaria = ['Transición', '1°', '2°', '3°', '4°', '5°'];
  const gradesBachillerato = ['6°', '7°', '8°', '9°', '10°', '11°'];

  // Opciones para materias
  const subjectsPrimaria = [
    'HUMANIDADES', 'INGLÉS', 'MATEMÁTICA', 'GEOMETRÍA', 'ESTADÍSTICA',
    'CIENCIAS NATURALES', 'C.N. SEXUAL', 'CIENCIAS SOCIALES', 'CÁTEDRA DE LA PAZ',
    'ÉTICA Y RELIGIÓN', 'ED. RELIGIOSA Y MORAL', 'TECNOLOGÍA', 'INFORMÁTICA',
    'ED. FÍS. REC Y DEP', 'ED. FÍSICA', 'CONVIVENCIA ESCOLAR', 'ACOMPAÑAMIENTO DEL ACUDIENTE'
  ];

  const subjectsBachillerato = [
    'HUMANIDADES', 'LENGUA CASTELLANA', 'INGLÉS', 'MATEMÁTICA', 'GEOMETRÍA', 'ESTADÍSTICA',
    'BIOLOGÍA', 'QUÍMICA', 'FÍSICA', 'CIENCIAS SOCIALES', 'FILOSOFÍA', 'CIENCIAS POLÍTICAS',
    'ÉTICA Y RELIGIÓN', 'TECNOLOGÍA', 'INFORMÁTICA', 'ED. FÍSICA', 'EMPRENDIMIENTO',
    'PROYECTO DE VIDA', 'SERVICIO SOCIAL'
  ];

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Limpiar campos específicos al cambiar rol
      if (field === 'role') {
        updated.grade = '';
        updated.grades = [];
        updated.subjects = [];
      }
      
      return updated;
    });
  };

  const handleGradeSelection = (grade, checked) => {
    setFormData(prev => ({
      ...prev,
      grades: checked 
        ? [...prev.grades, grade]
        : prev.grades.filter(g => g !== grade)
    }));
  };

  const handleSubjectSelection = (subject, checked) => {
    setFormData(prev => ({
      ...prev,
      subjects: checked 
        ? [...prev.subjects, subject]
        : prev.subjects.filter(s => s !== subject)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    // Validaciones específicas por rol
    if (formData.role === 'docente_primaria' && !formData.grade) {
      toast({
        title: "Error",
        description: "Los docentes de primaria deben seleccionar un grado",
        variant: "destructive",
      });
      return;
    }

    if (formData.role === 'docente_bachillerato' && (formData.grades.length === 0 || formData.subjects.length === 0)) {
      toast({
        title: "Error",
        description: "Los docentes de bachillerato deben seleccionar grados y materias",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const userData = {
        username: formData.username,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role
      };

      // Agregar campos específicos según el rol
      if (formData.role === 'docente_primaria') {
        userData.grade = formData.grade;
        userData.subjects = subjectsPrimaria;
      } else if (formData.role === 'docente_bachillerato') {
        userData.grades = formData.grades;
        userData.subjects = formData.subjects;
      }

      const result = await register(userData);
      
      if (result.success) {
        toast({
          title: "Registro exitoso",
          description: `Bienvenido, ${result.user.name}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error de registro",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-red-400/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center mb-4 shadow-xl">
            <img 
              src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
              alt="Logo GAA"
              className="w-18 h-18 rounded-full object-cover"
            />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-red-800 bg-clip-text text-transparent mb-2">
            GIMNASIO AMERICANO DEL ATLÁNTICO
          </h1>
          <p className="text-gray-600">Registro de Usuario</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <UserPlus className="h-6 w-6 text-blue-600" />
              <span>Crear Cuenta</span>
            </CardTitle>
            <CardDescription>
              Completa tus datos para acceder al sistema institucional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información básica */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <Input
                    type="text"
                    placeholder="Ingrese su nombre completo"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Usuario *
                  </label>
                  <Input
                    type="text"
                    placeholder="Nombre de usuario"
                    value={formData.username}
                    onChange={(e) => handleChange('username', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    type="tel"
                    placeholder="Número de teléfono"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                  />
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Repita la contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Rol */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol en la Institución *
                </label>
                <Select onValueChange={(value) => handleChange('role', value)} value={formData.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione su rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Campos específicos por rol */}
              {formData.role === 'docente_primaria' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grado a Cargo *
                  </label>
                  <Select onValueChange={(value) => handleChange('grade', value)} value={formData.grade}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione el grado" />
                    </SelectTrigger>
                    <SelectContent>
                      {gradesPrimaria.map(grade => (
                        <SelectItem key={grade} value={grade}>
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.role === 'docente_bachillerato' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grados a Cargo * (Seleccione uno o más)
                    </label>
                    <div className="grid grid-cols-3 gap-2 p-4 border rounded-md bg-gray-50">
                      {gradesBachillerato.map(grade => (
                        <label key={grade} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.grades.includes(grade)}
                            onChange={(e) => handleGradeSelection(grade, e.target.checked)}
                          />
                          <span className="text-sm">{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Materias a Cargo * (Seleccione una o más)
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-4 border rounded-md bg-gray-50 max-h-40 overflow-y-auto">
                      {subjectsBachillerato.map(subject => (
                        <label key={subject} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.subjects.includes(subject)}
                            onChange={(e) => handleSubjectSelection(subject, e.target.checked)}
                          />
                          <span className="text-xs">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white py-3"
                  disabled={loading}
                >
                  {loading ? 'Registrando...' : 'Crear Cuenta'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Ya tengo cuenta
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;