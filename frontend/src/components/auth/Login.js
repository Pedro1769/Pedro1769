import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { INSTITUTIONAL_INFO } from '../../mockData';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const result = await login(username, password);
      
      if (result.success) {
        toast({
          title: "Acceso exitoso",
          description: `Bienvenido, ${result.user.name}`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: "Error de acceso",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-red-500 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Fondo animado con círculos */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-red-600 flex items-center justify-center mb-4 shadow-2xl ring-4 ring-white/50">
            <img 
              src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
              alt="Logo GADA"
              className="w-20 h-20 rounded-full object-cover shadow-lg"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">{INSTITUTIONAL_INFO.name}</h1>
          <p className="text-white/90 drop-shadow">Portal Institucional</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <LogIn className="h-5 w-5 text-blue-600" />
              <span>Iniciar Sesión</span>
            </CardTitle>
            <CardDescription>
              Accede a tu panel institucional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Usuario
                </label>
                <div className="gradient-input">
                  <input
                    id="username"
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="gradient-input">
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Ingrese su contraseña"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <Button
                type="submit"
                className="w-full gradient-button text-white py-3 font-semibold text-base"
                disabled={loading}
              >
                {loading ? 'Accediendo...' : 'Ingresar'}
              </Button>
            </form>

            {/* Enlace de registro */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿No tienes cuenta?{' '}
                <Button 
                  variant="link" 
                  onClick={() => navigate('/register')}
                  className="text-blue-600 hover:text-blue-800 font-medium p-0 h-auto"
                >
                  Regístrate aquí
                </Button>
              </p>
            </div>

            {/* Información de contacto para soporte */}
            <div className="mt-6 text-center p-4 bg-gradient-to-r from-blue-50 to-red-50 rounded-lg border">
              <p className="text-xs text-gray-600 mb-2">¿Problemas para acceder?</p>
              <p className="text-xs text-gray-800 font-medium">
                Contacta al Coordinador Académico:<br />
                📧 pedro_12hurbe@hotmail.com<br />
                📞 3011968877
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← Volver al inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;