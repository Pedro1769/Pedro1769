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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-red-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-red-600 flex items-center justify-center mb-4">
            <img 
              src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
              alt="Logo GADA"
              className="w-18 h-18 rounded-full object-cover"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{INSTITUTIONAL_INFO.name}</h1>
          <p className="text-gray-600">Portal Institucional</p>
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
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingrese su usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10"
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

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-red-600 hover:from-blue-700 hover:to-red-700 text-white py-2"
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