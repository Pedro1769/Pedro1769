import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  console.log('🔍 PROTECTED ROUTE - Loading:', loading);
  console.log('🔍 PROTECTED ROUTE - Usuario:', user);
  console.log('🔍 PROTECTED ROUTE - Roles permitidos:', allowedRoles);

  if (loading) {
    console.log('⏳ PROTECTED ROUTE - Mostrando loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    console.log('❌ PROTECTED ROUTE - Sin usuario, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.log('❌ PROTECTED ROUTE - Rol no permitido, redirigiendo a /dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ PROTECTED ROUTE - Acceso permitido, renderizando children');
  return children;
};

export default ProtectedRoute;