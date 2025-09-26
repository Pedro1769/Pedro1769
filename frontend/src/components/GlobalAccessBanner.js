import React from 'react';
import { Badge } from './ui/badge';
import { CheckCircle, Unlock, Zap } from 'lucide-react';

const GlobalAccessBanner = ({ userRole }) => {
  const getRoleMessage = () => {
    switch (userRole) {
      case 'admin':
      case 'coordinador_academico':
        return {
          title: '🔥 ACCESO ADMINISTRATIVO TOTAL ACTIVADO',
          message: 'Control completo sobre todas las funcionalidades, usuarios, períodos, calificaciones y configuraciones del sistema sin restricciones.',
          color: 'from-red-50 to-orange-50',
          border: 'border-red-200',
          textColor: 'text-red-800',
          badgeColor: 'bg-red-100 text-red-800'
        };
      case 'teacher':
        return {
          title: '🎓 ACCESO DOCENTE COMPLETO ACTIVADO',
          message: 'Gestión total de calificaciones, estudiantes, reportes y notas en todos los períodos académicos sin limitaciones.',
          color: 'from-blue-50 to-teal-50',
          border: 'border-blue-200',
          textColor: 'text-blue-800',
          badgeColor: 'bg-blue-100 text-blue-800'
        };
      case 'coordinadora_convivencia':
        return {
          title: '🛡️ ACCESO DE CONVIVENCIA TOTAL ACTIVADO',
          message: 'Administración completa de notas comportamentales, reportes, archivos adjuntos y gestión de convivencia en todos los períodos.',
          color: 'from-purple-50 to-pink-50',
          border: 'border-purple-200',
          textColor: 'text-purple-800',
          badgeColor: 'bg-purple-100 text-purple-800'
        };
      case 'parent':
        return {
          title: '👨‍👩‍👧‍👦 ACCESO PARENTAL COMPLETO ACTIVADO',
          message: 'Visualización total de calificaciones, reportes, boletines y progreso académico de sus hijos en todos los períodos.',
          color: 'from-green-50 to-emerald-50',
          border: 'border-green-200',
          textColor: 'text-green-800',
          badgeColor: 'bg-green-100 text-green-800'
        };
      case 'student':
        return {
          title: '📚 ACCESO ESTUDIANTIL COMPLETO ACTIVADO',
          message: 'Acceso total a calificaciones, progreso académico, logros, boletines y historial en todos los períodos escolares.',
          color: 'from-indigo-50 to-blue-50',
          border: 'border-indigo-200',
          textColor: 'text-indigo-800',
          badgeColor: 'bg-indigo-100 text-indigo-800'
        };
      default:
        return {
          title: '✨ ACCESO COMPLETO ACTIVADO',
          message: 'Todas las funcionalidades del sistema están habilitadas sin restricciones.',
          color: 'from-gray-50 to-slate-50',
          border: 'border-gray-200',
          textColor: 'text-gray-800',
          badgeColor: 'bg-gray-100 text-gray-800'
        };
    }
  };

  const roleConfig = getRoleMessage();

  return (
    <div className={`mb-6 p-4 bg-gradient-to-r ${roleConfig.color} rounded-lg border-2 ${roleConfig.border} shadow-lg animate-pulse-soft`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Zap className="h-5 w-5 text-yellow-500 mr-2 animate-bounce" />
            <span className={`font-bold ${roleConfig.textColor}`}>
              {roleConfig.title}
            </span>
          </div>
          <p className={`text-sm ${roleConfig.textColor} opacity-90 leading-relaxed`}>
            {roleConfig.message}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-1 ml-4">
          <Badge className={`${roleConfig.badgeColor} border-0 animate-float`}>
            <CheckCircle className="mr-1 h-3 w-3" />
            HABILITADO
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800 border-0 text-xs">
            <Unlock className="mr-1 h-3 w-3" />
            SIN RESTRICCIONES
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default GlobalAccessBanner;