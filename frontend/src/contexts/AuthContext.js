import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay usuario guardado
    const savedUser = localStorage.getItem('gaa_user');
    const savedToken = localStorage.getItem('gaa_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('🔍 AUTH CONTEXT - Usuario cargado desde localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('❌ AUTH CONTEXT - Error al parsear usuario guardado:', error);
        localStorage.removeItem('gaa_user');
        localStorage.removeItem('gaa_token');
      }
    } else {
      console.log('🔍 AUTH CONTEXT - No hay usuario/token guardado');
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        console.log('✅ AUTH CONTEXT - Login exitoso, usuario recibido:', response.user);
        setUser(response.user);
        localStorage.setItem('gaa_user', JSON.stringify(response.user));
        localStorage.setItem('gaa_token', response.token);
        console.log('✅ AUTH CONTEXT - Usuario guardado en localStorage');
        
        return { success: true, user: response.user };
      } else {
        console.log('❌ AUTH CONTEXT - Login fallido:', response.message);
        return { success: false, error: response.message };
      }
    } catch (error) {
      const message = getErrorMessage(error, 'Error de conexión');
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔵 AUTH CONTEXT - Iniciando registro con datos:', { ...userData, password: '***' });
      const response = await authService.register(userData);
      console.log('🔵 AUTH CONTEXT - Respuesta de registro:', response);
      
      if (response.success) {
        console.log('✅ AUTH CONTEXT - Registro exitoso, usuario recibido:', response.user);
        setUser(response.user);
        localStorage.setItem('gaa_user', JSON.stringify(response.user));
        localStorage.setItem('gaa_token', response.token);
        console.log('✅ AUTH CONTEXT - Usuario guardado en localStorage');
        
        return { success: true, user: response.user };
      } else {
        console.log('❌ AUTH CONTEXT - Registro fallido:', response.message);
        return { success: false, error: response.message || 'Error en el registro' };
      }
    } catch (error) {
      console.error('❌ AUTH CONTEXT - Error en registro:', error);
      console.error('❌ Detalles del error:', error.response?.data);
      const message = error.response?.data?.detail || getErrorMessage(error, 'Error al registrar usuario');
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar errores del logout
    } finally {
      setUser(null);
      localStorage.removeItem('gaa_user');
      localStorage.removeItem('gaa_token');
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('gaa_user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    // Helpers para roles
    isAdmin: user?.role === 'admin',
    isDocentePrimaria: user?.role === 'docente_primaria',
    isDocenteBachillerato: user?.role === 'docente_bachillerato',
    isCoordinadorConvivencia: user?.role === 'coordinador_convivencia',
    isPadre: user?.role === 'padre',
    isEstudiante: user?.role === 'estudiante',
    isTeacher: user?.role?.includes('docente'),
    canViewAllStudents: user?.role === 'admin' || user?.role === 'coordinador_convivencia'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};