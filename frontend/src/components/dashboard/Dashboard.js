import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../mockData';
import Sidebar from './Sidebar';
import AdminDashboard from './admin/AdminDashboard';
import DocentePrimariaDashboard from './docente/DocentePrimariaDashboard';
import DocenteBachilleratoDashboard from './docente/DocenteBachilleratoDashboard';
import ConvivenciaDashboard from './convivencia/ConvivenciaDashboard';
import Header from './Header';

const Dashboard = () => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderDashboard = () => {
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return <AdminDashboard />;
      case USER_ROLES.DOCENTE_PRIMARIA:
        return <DocentePrimariaDashboard />;
      case USER_ROLES.DOCENTE_BACHILLERATO:
        return <DocenteBachilleratoDashboard />;
      case USER_ROLES.COORDINADOR_CONVIVENCIA:
        return <ConvivenciaDashboard />;
      default:
        return <div>Panel no configurado para este rol</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
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