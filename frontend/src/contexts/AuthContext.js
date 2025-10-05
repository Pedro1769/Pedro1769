import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS, USER_ROLES } from '../mockData';

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
    // Verificar si hay usuario guardado en localStorage
    const savedUser = localStorage.getItem('gimamericano_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Simular validación con mock data
      const foundUser = MOCK_USERS.find(u => u.username === username);
      
      if (!foundUser) {
        throw new Error('Usuario no encontrado');
      }

      // En producción, aquí se validaría la contraseña
      if (password !== 'gim123') {
        throw new Error('Contraseña incorrecta');
      }

      setUser(foundUser);
      localStorage.setItem('gimamericano_user', JSON.stringify(foundUser));
      
      return { success: true, user: foundUser };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gimamericano_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAdmin: user?.role === USER_ROLES.ADMIN,
    isDocentePrimaria: user?.role === USER_ROLES.DOCENTE_PRIMARIA,
    isDocenteBachillerato: user?.role === USER_ROLES.DOCENTE_BACHILLERATO,
    isCoordinadorConvivencia: user?.role === USER_ROLES.COORDINADOR_CONVIVENCIA,
    isPadre: user?.role === USER_ROLES.PADRE,
    isEstudiante: user?.role === USER_ROLES.ESTUDIANTE,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};