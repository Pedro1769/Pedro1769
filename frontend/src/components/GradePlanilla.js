import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Download, Save, Edit3, X, Plus } from 'lucide-react';

const GradePlanilla = ({ teacher, selectedGrade, selectedPeriod, onClose }) => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [newGrade, setNewGrade] = useState('');

  // Configuración de competencias según el nivel
  const getCompetenciesForLevel = (teachingLevel) => {
    if (teachingLevel === 'transicion' || teachingLevel === 'primaria') {
      return [
        'Comunicativa (1-4)',
        'Matemática (1-4)', 
        'Científica (1-4)',
        'Ciudadana (1-4)',
        'Artística (1-4)',
        'Corporal (1-4)'
      ];
    }
    return [
      'Cognitiva (1-5)',
      'Procedimental (1-5)', 
      'Actitudinal (1-5)'
    ];
  };

  // Materias según el nivel educativo
  const getSubjectsForLevel = (teachingLevel) => {
    if (teachingLevel === 'transicion') {
      return [
        'DIMENSIÓN COMUNICATIVA',
        'DIMENSIÓN COGNITIVA', 
        'DIMENSIÓN CORPORAL',
        'DIMENSIÓN ESTÉTICA',
        'DIMENSIÓN ÉTICA'
      ];
    } else if (teachingLevel === 'primaria') {
      return [
        'ESPAÑOL',
        'MATEMÁTICAS', 
        'CIENCIAS NATURALES',
        'CIENCIAS SOCIALES',
        'INGLÉS',
        'EDUCACIÓN FÍSICA',
        'EDUCACIÓN ARTÍSTICA',
        'ÉTICA Y RELIGIÓN',
        'INFORMÁTICA'
      ];
    } else {
      return teacher.subjects || [
        'ESPAÑOL',
        'MATEMÁTICAS',
        'CIENCIAS NATURALES', 
        'CIENCIAS SOCIALES',
        'INGLÉS',
        'QUÍMICA',
        'FÍSICA',
        'FILOSOFÍA'
      ];
    }
  };

  useEffect(() => {
    // Cargar estudiantes del grado seleccionado
    const storedStudents = JSON.parse(localStorage.getItem('gada_students') || '[]');
    const registeredStudents = JSON.parse(localStorage.getItem('gada_registered_users') || '[]')
      .filter(user => user.role === 'student' && user.grade === selectedGrade);
    
    const gradeStudents = [
      ...storedStudents.filter(s => s.grade === selectedGrade),
      ...registeredStudents.map(s => ({
        id: s.id,
        name: s.name,
        document: s.document,
        grade: s.grade
      }))
    ];

    setStudents(gradeStudents);
    
    // Configurar materias según el nivel del docente
    const subjectsForGrade = getSubjectsForLevel(teacher.teachingLevel);
    setSubjects(subjectsForGrade);
    
    // Cargar notas guardadas
    const savedGrades = JSON.parse(localStorage.getItem(`gada_planilla_${teacher.id}_${selectedGrade}_${selectedPeriod}`) || '{}');
    setGrades(savedGrades);
  }, [teacher, selectedGrade, selectedPeriod]);

  const saveGrades = () => {
    localStorage.setItem(`gada_planilla_${teacher.id}_${selectedGrade}_${selectedPeriod}`, JSON.stringify(grades));
    alert('Planilla guardada exitosamente');
  };

  const exportToCSV = () => {
    let csv = 'GIMNASIO AMERICANO DEL ATLÁNTICO\n';
    csv += `PLANILLA DE NOTAS - GRADO ${selectedGrade} - PERÍODO ${selectedPeriod}\n`;
    csv += `DOCENTE: ${teacher.name}\n\n`;
    
    // Headers
    csv += 'No.,Estudiante,Documento,';
    subjects.forEach(subject => {
      const competencies = getCompetenciesForLevel(teacher.teachingLevel);
      competencies.forEach(comp => {
        csv += `${subject} - ${comp},`;
      });
    });
    csv += 'Definitiva\n';

    // Data rows
    students.forEach((student, index) => {
      csv += `${index + 1},${student.name},${student.document},`;
      let totalGrades = 0;
      let gradeCount = 0;
      
      subjects.forEach(subject => {
        const competencies = getCompetenciesForLevel(teacher.teachingLevel);
        competencies.forEach(comp => {
          const gradeKey = `${student.id}_${subject}_${comp}`;
          const grade = grades[gradeKey] || '';
          csv += `${grade},`;
          if (grade) {
            totalGrades += parseFloat(grade);
            gradeCount++;
          }
        });
      });
      
      const average = gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : '';
      csv += `${average}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_${selectedGrade}_Periodo_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const updateGrade = (studentId, subject, competency, grade) => {
    const gradeKey = `${studentId}_${subject}_${competency}`;
    setGrades(prev => ({
      ...prev,
      [gradeKey]: grade
    }));
  };

  const getStudentAverage = (studentId) => {
    let total = 0;
    let count = 0;
    
    subjects.forEach(subject => {
      const competencies = getCompetenciesForLevel(teacher.teachingLevel);
      competencies.forEach(comp => {
        const gradeKey = `${studentId}_${subject}_${comp}`;
        const grade = grades[gradeKey];
        if (grade && !isNaN(parseFloat(grade))) {
          total += parseFloat(grade);
          count++;
        }
      });
    });
    
    return count > 0 ? (total / count).toFixed(1) : '';
  };

  const getPerformanceColor = (grade) => {
    if (!grade) return '';
    const numGrade = parseFloat(grade);
    if (numGrade >= 4.6) return 'bg-green-100 text-green-800';
    if (numGrade >= 4.0) return 'bg-blue-100 text-blue-800';
    if (numGrade >= 3.0) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const competencies = getCompetenciesForLevel(teacher.teachingLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                📋 PLANILLA DE NOTAS GADA 2025 V1
              </CardTitle>
              <p className="text-blue-100">
                Grado {selectedGrade} - Período {selectedPeriod} - {teacher.name}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveGrades} variant="secondary" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button onClick={exportToCSV} variant="secondary" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
              <Button onClick={onClose} variant="secondary" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(90vh-140px)]">
            {/* Header institucional */}
            <div className="bg-gray-50 p-4 border-b text-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">GADA</span>
                </div>
                <div>
                  <h2 className="font-bold text-sm">GIMNASIO AMERICANO DEL ATLÁNTICO</h2>
                  <p className="text-xs text-gray-600">PREESCOLAR - BÁSICA PRIMARIA - BÁSICA SECUNDARIA</p>
                  <p className="text-xs text-gray-600">MEDIA VOCACIONAL COMERCIAL</p>
                </div>
              </div>
            </div>

            {/* Tabla de notas */}
            <table className="w-full border-collapse text-xs">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  <th className="border border-gray-300 p-2 w-8">No.</th>
                  <th className="border border-gray-300 p-2 min-w-[200px]">ESTUDIANTE</th>
                  <th className="border border-gray-300 p-2 w-24">DOCUMENTO</th>
                  
                  {subjects.map(subject => (
                    <th key={subject} className="border border-gray-300 p-1" colSpan={competencies.length}>
                      <div className="text-center">
                        <div className="font-bold text-xs">{subject}</div>
                        <div className="flex">
                          {competencies.map(comp => (
                            <div key={comp} className="flex-1 border-l border-gray-400 text-xs p-1">
                              {comp.split(' ')[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </th>
                  ))}
                  
                  <th className="border border-gray-300 p-2 w-16 bg-green-600">DEF</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 p-2 text-center font-medium">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 p-2 font-medium">
                      {student.name}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      {student.document}
                    </td>
                    
                    {subjects.map(subject => 
                      competencies.map(comp => {
                        const gradeKey = `${student.id}_${subject}_${comp}`;
                        const currentGrade = grades[gradeKey] || '';
                        
                        return (
                          <td key={gradeKey} className="border border-gray-300 p-0 w-12">
                            <Input
                              value={currentGrade}
                              onChange={(e) => updateGrade(student.id, subject, comp, e.target.value)}
                              className={`border-0 text-center text-xs h-8 ${getPerformanceColor(currentGrade)}`}
                              placeholder=""
                              maxLength={3}
                            />
                          </td>
                        );
                      })
                    )}
                    
                    <td className="border border-gray-300 p-2 text-center bg-green-50 font-bold">
                      <Badge className={`text-xs ${getPerformanceColor(getStudentAverage(student.id))}`}>
                        {getStudentAverage(student.id)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer con información */}
          <div className="bg-gray-100 p-3 border-t text-xs">
            <div className="flex justify-between">
              <div>
                <strong>Escala de Valoración:</strong> 
                <span className="ml-2">5.0-4.6 Superior | 4.5-4.0 Alto | 3.9-3.0 Básico | 2.9-1.0 Bajo</span>
              </div>
              <div>
                <strong>Total Estudiantes:</strong> {students.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradePlanilla;