import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { mockUsers } from '../mock/mockData';
import { Eye, EyeOff, User, Lock, UserPlus } from 'lucide-react';
import SimpleRegisterModal from '../components/SimpleRegisterModal';
import ApiService from '../services/apiService';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Primero intentar con usuarios mock para compatibilidad
      const mockUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (mockUser) {
        login(mockUser);
        redirectBasedOnRole(mockUser.role);
        return;
      }

      // Si no se encuentra en mock, intentar login con la API
      try {
        const loginResponse = await ApiService.login(email, password);
        
        if (loginResponse.success && loginResponse.user) {
          login(loginResponse.user);
          redirectBasedOnRole(loginResponse.user.role);
        } else {
          setError('Credenciales incorrectas. Verifique su email y contraseña.');
        }
      } catch (apiError) {
        console.error('Error consultando usuarios de BD:', apiError);
        // Fallback a localStorage si hay error con la API
        const registeredUsers = JSON.parse(localStorage.getItem('gada_registered_users') || '[]');
        const localUser = registeredUsers.find(
          (u) => u.email === email && u.password === password && u.approved
        );
        
        if (localUser) {
          login(localUser);
          redirectBasedOnRole(localUser.role);
        } else {
          setError('Credenciales incorrectas o error de conectividad.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Error al iniciar sesión. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'admin':
      case 'coordinador_academico':
        navigate('/admin');
        break;
      case 'teacher':
        navigate('/teacher');
        break;
      case 'parent':
        navigate('/parent');
        break;
      case 'coordinadora_convivencia':
        navigate('/convivencia');
        break;
      case 'student':
        navigate('/student');
        break;
      default:
        navigate('/');
    }
  };

  const handleRegister = async (userData) => {
    try {
      // Verificar si el email ya existe en la base de datos
      const existingUsers = await ApiService.getUsers();
      const allUsers = [...mockUsers, ...existingUsers];
      
      if (allUsers.some(u => u.email === userData.email)) {
        alert('Este email ya está registrado');
        return;
      }
      
      alert('¡Registro exitoso! El usuario ha sido guardado en la base de datos. Ahora puede iniciar sesión.');
      setShowRegisterModal(false);
    } catch (error) {
      console.error('Error al verificar registro:', error);
      // Fallback a localStorage si hay error con la API
      try {
        const existingLocalUsers = JSON.parse(localStorage.getItem('gada_registered_users') || '[]');
        const allLocalUsers = [...mockUsers, ...existingLocalUsers];
        
        if (allLocalUsers.some(u => u.email === userData.email)) {
          alert('Este email ya está registrado');
          return;
        }
        
        const updatedUsers = [...existingLocalUsers, userData];
        localStorage.setItem('gada_registered_users', JSON.stringify(updatedUsers));
        
        alert('¡Registro exitoso! (guardado localmente). Ahora puede iniciar sesión.');
        setShowRegisterModal(false);
      } catch (localError) {
        console.error('Error en fallback local:', localError);
        alert('Error al registrar usuario');
      }
    }
  };

  return (
    <div className="min-h-screen bg-institutional flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl float-animation"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-blue-500/20 rounded-full blur-3xl float-animation" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-gradient-gada rounded-full flex items-center justify-center mr-3 shadow-lg">
              <span className="text-white font-bold text-sm">GADA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gimnasio Americano</h1>
              <p className="text-sm text-gray-600">del Atlántico</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">Sistema Académico</h1>
          <p className="text-gray-600">Sede 2 Manuela Beltrán</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0 card-institutional hover-gradient">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@gada.edu.co"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-gada text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="text-center space-y-2">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-teal-600 hover:underline transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
              
              <div className="border-t pt-4">
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-blue-200 hover:bg-gradient-hover hover:border-blue-300 transition-all duration-300" 
                  onClick={() => setShowRegisterModal(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrarse
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link 
            to="/" 
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            ← Volver al inicio
          </Link>
        </div>

        {/* Developer Credits */}
        <div className="text-center text-xs text-gray-500">
          <p>Desarrollado por Pedro Hurtado - Coordinador Académico</p>
        </div>
      </div>

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal 
          onClose={() => setShowRegisterModal(false)}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};

export default LoginPage;