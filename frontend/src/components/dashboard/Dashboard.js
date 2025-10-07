import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import AdminDashboard from './admin/AdminDashboard';
import DocentePrimariaDashboard from './docente/DocentePrimariaDashboard';
import DocenteBachilleratoDashboard from './docente/DocenteBachilleratoDashboard';
import ConvivenciaDashboard from './convivencia/ConvivenciaDashboard';
import ParentDashboard from './parent/ParentDashboard';
import StudentDashboard from './student/StudentDashboard';
import Header from './Header';

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderDashboard = () => {
    
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'docente_primaria':
        return <DocentePrimariaDashboard />;
      case 'docente_bachillerato':
        return <DocenteBachilleratoDashboard />;
      case 'coordinador_convivencia':
        return <ConvivenciaDashboard />;
      case 'padre':
        return <ParentDashboard />;
      case 'estudiante':
        return <StudentDashboard />;
      default:
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel no configurado</h2>
              <p className="text-gray-600">No se encontró un dashboard para el rol: {user.role}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-red-50/30">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen}
          onNavigationClick={(section) => {
            // Propagar navegación al dashboard específico según el rol
            if (window.setActiveSection) {
              window.setActiveSection(section);
            }
          }}
        />
        <main className="flex-1 min-h-screen pl-0 lg:pl-64">
          <div className="p-6">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;