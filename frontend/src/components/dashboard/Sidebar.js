import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Users, 
  BookOpen, 
  FileText, 
  Settings, 
  BarChart3, 
  UserCheck,
  FolderOpen,
  Download,
  Shield,
  GraduationCap,
  Eye,
  Heart,
  Trophy
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, onNavigationClick }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Inicio', href: '#dashboard' },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { icon: BarChart3, label: 'Consolidados', href: '#consolidados' },
          { icon: Users, label: 'Gestión Estudiantes', href: '#estudiantes' },
          { icon: UserCheck, label: 'Gestión Docentes', href: '#docentes' },
          { icon: Shield, label: 'Permisos', href: '#permisos' },
          { icon: Download, label: 'Códigos Boletines', href: '#codigos' },
          { icon: FolderOpen, label: 'Proyectos', href: '#proyectos' },
          { icon: Settings, label: 'Configuración', href: '#config' },
        ];

      case 'docente_primaria':
        return [
          ...baseItems,
          { icon: GraduationCap, label: 'Mis Estudiantes', href: '#estudiantes' },
          { icon: BookOpen, label: 'Asignar Notas', href: '#notas' },
          { icon: Heart, label: 'Convivencia', href: '#convivencia' },
          { icon: FolderOpen, label: 'Proyectos', href: '#proyectos' },
          { icon: FileText, label: 'Boletines', href: '#boletines' },
        ];

      case 'docente_bachillerato':
        return [
          ...baseItems,
          { icon: GraduationCap, label: 'Mis Estudiantes', section: 'dashboard' },
          { icon: BookOpen, label: 'Asignar Notas', section: 'dashboard' },
          { icon: Trophy, label: 'Banco de Logros', section: 'banco-logros' },
          { icon: FolderOpen, label: 'Proyectos', section: 'proyectos' },
          { icon: FileText, label: 'Boletines', section: 'boletines' },
        ];

      case 'coordinador_convivencia':
        return [
          ...baseItems,
          { icon: Users, label: 'Todos los Estudiantes', href: '#estudiantes' },
          { icon: Heart, label: 'Convivencia', href: '#convivencia' },
          { icon: BarChart3, label: 'Reportes', href: '#reportes' },
          { icon: FolderOpen, label: 'Proyectos', href: '#proyectos' },
        ];

      case 'padre':
        return [
          ...baseItems,
          { icon: Users, label: 'Mis Hijos', href: '#hijos' },
          { icon: Eye, label: 'Seguimiento', href: '#seguimiento' },
          { icon: Download, label: 'Boletines', href: '#boletines' },
        ];

      case 'estudiante':
        return [
          ...baseItems,
          { icon: BookOpen, label: 'Mis Notas', href: '#notas' },
          { icon: Eye, label: 'Mi Progreso', href: '#progreso' },
          { icon: FileText, label: 'Información', href: '#info' },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'admin': 'Administrador',
      'docente_primaria': 'Docente Primaria',
      'docente_bachillerato': 'Docente Bachillerato',
      'coordinador_convivencia': 'Coordinador Convivencia',
      'padre': 'Padre/Acudiente',
      'estudiante': 'Estudiante'
    };
    return roleNames[role] || role;
  };

  return (
    <>
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 z-30 w-64 h-full bg-gradient-to-b from-blue-700 via-blue-800 to-red-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                <img 
                  src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
                  alt="Logo GADA"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="text-white">
                <h2 className="font-semibold text-sm">Gimnasio Americano</h2>
                <p className="text-xs text-white/80">{getRoleDisplayName(user.role)}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => {
                      if (onNavigationClick) {
                        onNavigationClick(item.section || 'dashboard');
                      }
                      setSidebarOpen(false);
                    }}
                    className="w-full group flex items-center space-x-3 px-4 py-3 text-white/90 hover:text-white hover:bg-white/20 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg backdrop-blur-sm"
                  >
                    <item.icon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="text-center text-white/70 text-xs">
              <p className="font-semibold">© 2025 GADA</p>
              <p>Sistema Académico v1.0</p>
              <div className="mt-2 h-1 bg-gradient-to-r from-blue-400 to-red-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;