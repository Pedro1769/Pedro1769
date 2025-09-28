import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  FileSpreadsheet, 
  BookOpen,
  X,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import PlanillaIndividualAsignatura from './PlanillaIndividualAsignatura';

const SelectorPlanillas = ({ teacher, selectedGrade, selectedPeriod, onClose }) => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showPlanilla, setShowPlanilla] = useState(false);

  // Obtener materias según el nivel del docente
  const getSubjectsForTeacher = () => {
    if (teacher.teachingLevel === 'transicion') {
      return [
        'DIMENSIÓN COMUNICATIVA',
        'DIMENSIÓN COGNITIVA', 
        'DIMENSIÓN CORPORAL',
        'DIMENSIÓN ESTÉTICA',
        'DIMENSIÓN ÉTICA'
      ];
    } else if (teacher.teachingLevel === 'primaria') {
      return [
        'ESPAÑOL',
        'MATEMÁTICAS', 
        'CIENCIAS NATURALES',
        'CIENCIAS SOCIALES',
        'INGLÉS',
        'EDUCACIÓN ARTÍSTICA',
        'ÉTICA Y RELIGIÓN',
        'INFORMÁTICA'
        // Nota: Educación Física no incluida según tu solicitud
      ];
    } else {
      // Para bachillerato, usar las materias específicas del docente
      return teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects : [
        'ESPAÑOL',
        'MATEMÁTICAS',
        'CIENCIAS NATURALES', 
        'CIENCIAS SOCIALES',
        'INGLÉS',
        'QUÍMICA',
        'FÍSICA',
        'FILOSOFÍA',
        'EDUCACIÓN FÍSICA'
      ];
    }
  };

  const availableSubjects = getSubjectsForTeacher();

  const openPlanilla = (subject) => {
    setSelectedSubject(subject);
    setShowPlanilla(true);
  };

  const getSubjectIcon = (subject) => {
    if (subject.includes('MATEMÁTICAS')) return '🔢';
    if (subject.includes('ESPAÑOL')) return '📖';
    if (subject.includes('INGLÉS')) return '🗣️';
    if (subject.includes('CIENCIAS')) return '🔬';
    if (subject.includes('SOCIALES')) return '🌍';
    if (subject.includes('EDUCACIÓN')) return '🎨';
    if (subject.includes('FÍSICA')) return '⚛️';
    if (subject.includes('QUÍMICA')) return '🧪';
    if (subject.includes('FILOSOFÍA')) return '🤔';
    if (subject.includes('DIMENSIÓN')) return '👶';
    if (subject.includes('ÉTICA')) return '⚖️';
    if (subject.includes('INFORMÁTICA')) return '💻';
    return '📚';
  };

  const getGradeDescription = () => {
    if (selectedGrade === '0°') return 'Transición';
    if (['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade)) return 'Básica Primaria';
    if (['6°', '7°', '8°', '9°'].includes(selectedGrade)) return 'Básica Secundaria';
    if (['10°', '11°'].includes(selectedGrade)) return 'Media Vocacional';
    return '';
  };

  if (showPlanilla && selectedSubject) {
    return (
      <PlanillaIndividualAsignatura
        teacher={teacher}
        selectedGrade={selectedGrade}
        selectedPeriod={selectedPeriod}
        selectedSubject={selectedSubject}
        onClose={() => {
          setShowPlanilla(false);
          setSelectedSubject('');
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                📋 Seleccionar Planilla de Notas
              </CardTitle>
              <p className="text-indigo-100">
                Grado {selectedGrade} ({getGradeDescription()}) - Período {selectedPeriod}
              </p>
              <p className="text-indigo-200 text-sm">
                Docente: {teacher.name} | Nivel: {teacher.teachingLevel || 'N/A'}
              </p>
            </div>
            <Button onClick={onClose} variant="secondary" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Asignaturas Disponibles ({availableSubjects.length})
              </h3>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>📌 Información:</strong> Cada asignatura tiene su propia planilla con competencias específicas.
                {teacher.teachingLevel === 'primaria' && (
                  <span className="block mt-1">
                    ✅ <strong>Primaria:</strong> Todas las asignaturas excepto Educación Física (según solicitud).
                  </span>
                )}
                {teacher.teachingLevel === 'transicion' && (
                  <span className="block mt-1">
                    ✅ <strong>Transición:</strong> Todas las dimensiones del desarrollo habilitadas.
                  </span>
                )}
                {teacher.teachingLevel === 'bachillerato' && (
                  <span className="block mt-1">
                    ✅ <strong>Bachillerato:</strong> Planillas individuales por cada asignatura asignada.
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSubjects.map((subject) => (
              <Card 
                key={subject} 
                className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-indigo-300"
                onClick={() => openPlanilla(subject)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-2xl">
                      {getSubjectIcon(subject)}
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-800 text-xs">
                      {teacher.teachingLevel}
                    </Badge>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm leading-tight">
                    {subject}
                  </h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-600">
                      Grado {selectedGrade}
                    </div>
                    <ChevronRight className="h-4 w-4 text-indigo-500" />
                  </div>
                  
                  <Button 
                    className="w-full mt-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPlanilla(subject);
                    }}
                  >
                    <FileSpreadsheet className="mr-2 h-3 w-3" />
                    Abrir Planilla
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {availableSubjects.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No hay asignaturas configuradas</p>
              <p className="text-gray-400">Configure las asignaturas en el perfil del docente</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                <strong>Información de la Planilla:</strong>
              </div>
              <div className="text-right">
                <div>Período: {selectedPeriod} | Grado: {selectedGrade}</div>
                <div>Competencias por asignatura | Escala de evaluación institucional</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectorPlanillas;