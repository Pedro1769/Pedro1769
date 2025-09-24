import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { mockUsers } from '../mock/mockData';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Mock authentication
      const user = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (user) {
        login(user);
        
        // Redirect based on role
        switch (user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'teacher':
            navigate('/teacher');
            break;
          case 'parent':
            navigate('/parent');
            break;
          default:
            navigate('/dashboard');
        }
      } else {
        setError('Credenciales incorrectas. Verifique su email y contraseña.');
      }
    } catch (err) {
      setError('Error al iniciar sesión. Inténtelo nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Administrador', email: 'admin@gaa.edu.co', password: 'admin123' },
    { role: 'Profesor', email: 'profesor1@gaa.edu.co', password: 'teacher123' },
    { role: 'Padre de Familia', email: 'padre1@gmail.com', password: 'parent123' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">GADA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gimnasio Americano</h1>
              <p className="text-sm text-gray-600">del Atlántico</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sistema Académico</h1>
          <p className="text-gray-600">Sede 2 Manuela Beltrán</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
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
                    placeholder="usuario@gaa.edu.co"
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
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            <div className="text-center">
              <Link 
                to="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              Credenciales de Demostración
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoCredentials.map((cred, index) => (
              <div key={index} className="text-xs space-y-1">
                <div className="font-medium text-gray-600">{cred.role}:</div>
                <div className="text-gray-500">
                  {cred.email} / {cred.password}
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default LoginPage;