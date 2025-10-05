import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../mockData';
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
  GraduationCap
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();

  const getMenuItems = () => {
    const baseItems = [
      { icon: Home, label: 'Inicio', href: '#dashboard' },
    ];

    switch (user.role) {
      case USER_ROLES.ADMIN:
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

      case USER_ROLES.DOCENTE_PRIMARIA:
        return [
          ...baseItems,
          { icon: GraduationCap, label: 'Mis Estudiantes', href: '#estudiantes' },
          { icon: BookOpen, label: 'Asignar Notas', href: '#notas' },
          { icon: UserCheck, label: 'Convivencia', href: '#convivencia' },
          { icon: FolderOpen, label: 'Proyectos', href: '#proyectos' },
          { icon: FileText, label: 'Boletines', href: '#boletines' },
        ];

      case USER_ROLES.DOCENTE_BACHILLERATO:
        return [
          ...baseItems,
          { icon: GraduationCap, label: 'Mis Estudiantes', href: '#estudiantes' },
          { icon: BookOpen, label: 'Asignar Notas', href: '#notas' },
          { icon: FolderOpen, label: 'Proyectos', href: '#proyectos' },
          { icon: FileText, label: 'Boletines', href: '#boletines' },
        ];

      case USER_ROLES.COORDINADOR_CONVIVENCIA:
        return [
          ...baseItems,
          { icon: Users, label: 'Todos los Estudiantes', href: '#estudiantes' },
          { icon: UserCheck, label: 'Convivencia', href: '#convivencia' },
          { icon: BarChart3, label: 'Reportes', href: '#reportes' },
          { icon: FolderOpen, label: 'Proyectos', href: '#proyectos' },
        ];

      default:
        return baseItems;
    }
  };

  const menuItems = getMenuItems();

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
        fixed top-0 left-0 z-30 w-64 h-full bg-gradient-to-b from-blue-700 to-red-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <img 
                  src="https://customer-assets.emergentagent.com/job_142a9560-64f7-45de-9e71-42aef7b2f85d/artifacts/a2p68uxj_LOGO%20GIM%20AMERICANO.jpeg"
                  alt="Logo GAA"
                  className="w-10 h-10 rounded-full object-cover"
                />
              </div>
              <div className="text-white">
                <h2 className="font-semibold text-sm">Gimnasio Americano</h2>
                <p className="text-xs text-white/80 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <a
                    href={item.href}
                    className="flex items-center space-x-3 px-3 py-3 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-200"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer del sidebar */}
          <div className="p-4 border-t border-white/20">
            <div className="text-center text-white/70 text-xs">
              <p>© 2025 GAA</p>
              <p>Sistema v1.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;