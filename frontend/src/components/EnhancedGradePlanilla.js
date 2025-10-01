import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Download, Save, Edit3, X, Plus, Calculator, Target } from 'lucide-react';

const EnhancedGradePlanilla = ({ teacher, selectedGrade, selectedPeriod, onClose }) => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [grades, setGrades] = useState({});
  const [percentages, setPercentages] = useState({});
  const [editingCell, setEditingCell] = useState(null);
  const [newGrade, setNewGrade] = useState('');
  const [showPercentageConfig, setShowPercentageConfig] = useState(false);

  // Configuración de los 4 períodos académicos
  const academicPeriods = [
    { id: '1', name: 'Primer Período', weight: 25 },
    { id: '2', name: 'Segundo Período', weight: 25 },
    { id: '3', name: 'Tercer Período', weight: 25 },
    { id: '4', name: 'Cuarto Período', weight: 25 }
  ];

  // Materias según el nivel educativo del boletín
  const getSubjectsForLevel = (teachingLevel) => {
    if (teachingLevel === 'transicion') {
      return [
        'ESPAÑOL', 'INGLES', 'MATEMATICAS', 'SOCIALES-NATURALES', 
        'ETICA Y RELIGION', 'INFORMATICA', 'ARTE', 'ED. FISICA'
      ];
    } else if (teachingLevel === 'primaria') {
      return [
        'ESPAÑOL', 'CALIGRAFIA', 'INGLES', 'MATEMATICAS', 'NATURALES', 
        'SOCIALES', 'CATEDRA DE PAZ', 'ETICA Y RELIGION', 'INFORMATICA', 
        'ARTE', 'ED. FISICA'
      ];
    } else if (teachingLevel === 'bachillerato') {
      // Para bachillerato, usar las materias específicas asignadas al docente
      return teacher.subjects && teacher.subjects.length > 0 ? teacher.subjects : [
        'ESPAÑOL', 'INGLES', 'MATEMATICA', 'GEOMETRIA', 'ESTADISTICA',
        'BIOLOGIA', 'ED. SEXUAL', 'QUIMICA', 'FISICA', 'HISTORIA', 
        'GEOGRAFIA', 'CATEDRA DE LA PAZ', 'EMPRENDIMIENTO', 'ETICA Y RELIGION',
        'TECNOLOGIA', 'INFORMATICA', 'ARTE', 'MUSICA', 'ED. FISICA'
      ];
    }
    return [];
  };

  // Estructura de evaluación por período
  const getEvaluationStructure = () => {
    return {
      'Evaluación 1': { weight: 25, type: 'evaluation' },
      'Evaluación 2': { weight: 25, type: 'evaluation' },
      'Actividades': { weight: 30, type: 'activities' },
      'Participación': { weight: 20, type: 'participation' }
    };
  };

  useEffect(() => {
    loadStudentsAndData();
  }, [teacher, selectedGrade, selectedPeriod]);

  const loadStudentsAndData = async () => {
    try {
      // Cargar estudiantes desde múltiples fuentes
      const storedStudents = JSON.parse(localStorage.getItem('gada_students') || '[]');
      let registeredStudents = [];
      
      // Intentar cargar estudiantes registrados de la API
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001'}/api/users`);
        if (response.ok) {
          const users = await response.json();
          registeredStudents = users
            .filter(user => user.role === 'student')
            .map(s => ({
              id: s.id,
              name: s.name,
              document: s.document,
              grade: s.grade || 'N/A'
            }));
        }
      } catch (error) {
        console.log('Error cargando estudiantes de API, usando localStorage:', error);
        registeredStudents = JSON.parse(localStorage.getItem('gada_registered_users') || '[]')
          .filter(user => user.role === 'student')
          .map(s => ({
            id: s.id,
            name: s.name,
            document: s.document,
            grade: s.grade || 'N/A'
          }));
      }

      // Filtrar estudiantes del grado seleccionado
      const gradeStudents = [
        ...storedStudents.filter(s => s.grade === selectedGrade),
        ...registeredStudents.filter(s => s.grade === selectedGrade)
      ];

      // Remover duplicados por documento
      const uniqueStudents = gradeStudents.reduce((acc, student) => {
        const exists = acc.find(s => s.document === student.document);
        if (!exists && student.document) {
          acc.push(student);
        }
        return acc;
      }, []);

      setStudents(uniqueStudents);
      console.log(`📚 Estudiantes cargados para grado ${selectedGrade}:`, uniqueStudents.length);

      // Configurar materias según el nivel y restricciones del docente
      const availableSubjects = getSubjectsForLevel(teacher.teachingLevel);
      
      // Para primaria y transición, el docente ve todas las materias de su nivel
      // Para bachillerato, solo las materias asignadas al docente
      let subjectsToShow = availableSubjects;
      
      if (teacher.teachingLevel === 'bachillerato') {
        // En bachillerato, filtrar por las materias específicas del docente
        subjectsToShow = teacher.subjects && teacher.subjects.length > 0 
          ? teacher.subjects.filter(subject => availableSubjects.includes(subject))
          : [];
      }
      
      setSubjects(subjectsToShow);
      console.log(`📖 Materias disponibles para ${teacher.teachingLevel}:`, subjectsToShow);

      // Cargar notas y porcentajes guardados
      const savedGrades = JSON.parse(localStorage.getItem(`gada_enhanced_planilla_${teacher.id}_${selectedGrade}_${selectedPeriod}`) || '{}');
      const savedPercentages = JSON.parse(localStorage.getItem(`gada_percentages_${teacher.id}_${selectedGrade}_${selectedPeriod}`) || '{}');
      
      setGrades(savedGrades);
      setPercentages(savedPercentages);

    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // Calcular promedio de período con porcentajes
  const calculatePeriodAverage = (studentId, subject) => {
    const evaluationStructure = getEvaluationStructure();
    let totalWeightedScore = 0;
    let totalWeight = 0;

    Object.entries(evaluationStructure).forEach(([evalType, config]) => {
      const key = `${studentId}_${subject}_${evalType}`;
      const grade = parseFloat(grades[key] || 0);
      const percentage = parseFloat(percentages[key] || config.weight);
      
      if (grade > 0) {
        totalWeightedScore += (grade * percentage) / 100;
        totalWeight += percentage / 100;
      }
    });

    return totalWeight > 0 ? (totalWeightedScore / totalWeight).toFixed(1) : '0.0';
  };

  // Calcular promedio final del estudiante en todas las materias
  const calculateFinalAverage = (studentId) => {
    if (subjects.length === 0) return '0.0';
    
    let totalScore = 0;
    let validSubjects = 0;

    subjects.forEach(subject => {
      const average = parseFloat(calculatePeriodAverage(studentId, subject));
      if (average > 0) {
        totalScore += average;
        validSubjects++;
      }
    });

    return validSubjects > 0 ? (totalScore / validSubjects).toFixed(1) : '0.0';
  };

  // Obtener nivel de desempeño según la nota
  const getPerformanceLevel = (score) => {
    const numScore = parseFloat(score);
    if (teacher.teachingLevel === 'transicion' || teacher.teachingLevel === 'primaria') {
      if (numScore >= 4) return { level: 'Superior', color: 'bg-green-100 text-green-800' };
      if (numScore >= 3) return { level: 'Alto', color: 'bg-blue-100 text-blue-800' };
      if (numScore >= 2) return { level: 'Básico', color: 'bg-yellow-100 text-yellow-800' };
      return { level: 'Bajo', color: 'bg-red-100 text-red-800' };
    } else {
      if (numScore >= 9) return { level: 'Superior', color: 'bg-green-100 text-green-800' };
      if (numScore >= 7) return { level: 'Alto', color: 'bg-blue-100 text-blue-800' };
      if (numScore >= 6) return { level: 'Básico', color: 'bg-yellow-100 text-yellow-800' };
      return { level: 'Bajo', color: 'bg-red-100 text-red-800' };
    }
  };

  // Guardar notas y porcentajes
  const saveData = () => {
    localStorage.setItem(`gada_enhanced_planilla_${teacher.id}_${selectedGrade}_${selectedPeriod}`, JSON.stringify(grades));
    localStorage.setItem(`gada_percentages_${teacher.id}_${selectedGrade}_${selectedPeriod}`, JSON.stringify(percentages));
    
    alert(`✅ Planilla del ${academicPeriods.find(p => p.id === selectedPeriod)?.name || `Período ${selectedPeriod}`} guardada exitosamente`);
  };

  // Manejar cambio de nota
  const handleGradeChange = (studentId, subject, evalType, value) => {
    const key = `${studentId}_${subject}_${evalType}`;
    setGrades(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Manejar cambio de porcentaje
  const handlePercentageChange = (studentId, subject, evalType, value) => {
    const key = `${studentId}_${subject}_${evalType}`;
    setPercentages(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Generar reporte CSV
  const exportToCSV = () => {
    let csv = '';
    const periodName = academicPeriods.find(p => p.id === selectedPeriod)?.name || `Período ${selectedPeriod}`;
    csv += `PLANILLA DE NOTAS MEJORADA - GADA 2025\n`;
    csv += `${periodName} - Grado: ${selectedGrade}\n`;
    csv += `Docente: ${teacher.name}\n`;
    csv += `Nivel: ${teacher.teachingLevel}\n`;
    csv += `Fecha: ${new Date().toLocaleDateString()}\n\n`;

    // Headers
    csv += 'Estudiante,Documento';
    subjects.forEach(subject => {
      csv += `,${subject} (Promedio)`;
    });
    csv += ',Promedio General,Desempeño\n';

    // Data
    students.forEach(student => {
      csv += `${student.name},${student.document}`;
      subjects.forEach(subject => {
        const average = calculatePeriodAverage(student.id, subject);
        csv += `,${average}`;
      });
      const finalAverage = calculateFinalAverage(student.id);
      const performance = getPerformanceLevel(finalAverage);
      csv += `,${finalAverage},${performance.level}\n`;
    });

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `planilla_${selectedGrade}_${periodName.replace(' ', '_')}_${new Date().getTime()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const evaluationStructure = getEvaluationStructure();
  const periodInfo = academicPeriods.find(p => p.id === selectedPeriod);
  const maxScore = teacher.teachingLevel === 'transicion' || teacher.teachingLevel === 'primaria' ? 4 : 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-screen overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-600 to-teal-600 text-white">
          <div>
            <h2 className="text-xl font-bold">📋 Planilla de Notas Mejorada - GADA 2025</h2>
            <p className="text-blue-100">
              {periodInfo?.name || `Período ${selectedPeriod}`} • Grado: {selectedGrade} • Docente: {teacher.name}
            </p>
            <p className="text-blue-100 text-sm">
              Nivel: {teacher.teachingLevel} • Escala: 1-{maxScore} • Total Estudiantes: {students.length}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              onClick={() => setShowPercentageConfig(!showPercentageConfig)}
              variant="outline" 
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Configurar %
            </Button>
            <Button onClick={saveData} className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
            <Button onClick={exportToCSV} className="bg-purple-600 hover:bg-purple-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button onClick={onClose} variant="outline" className="text-gray-600 border-gray-300">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Configuración de Porcentajes */}
        {showPercentageConfig && (
          <div className="p-4 bg-yellow-50 border-b">
            <h3 className="font-semibold text-yellow-800 mb-2">⚙️ Configuración de Porcentajes por Evaluación</h3>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(evaluationStructure).map(([evalType, config]) => (
                <div key={evalType} className="text-center">
                  <label className="block text-sm font-medium text-gray-700">{evalType}</label>
                  <span className="text-sm text-gray-600">Peso por defecto: {config.weight}%</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-yellow-700 mt-2">
              💡 Los porcentajes se pueden ajustar individualmente por estudiante y materia si es necesario.
            </p>
          </div>
        )}

        {/* Contenido Principal */}
        <div className="p-6 overflow-auto max-h-[calc(100vh-200px)]">
          {students.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay estudiantes registrados para el grado {selectedGrade}</p>
              <p className="text-sm text-gray-400 mt-2">Agregue estudiantes desde el panel principal</p>
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay materias asignadas para este nivel</p>
              <p className="text-sm text-gray-400 mt-2">
                {teacher.teachingLevel === 'bachillerato' 
                  ? 'Configure las materias específicas en su perfil de docente'
                  : 'Las materias se asignan automáticamente según el nivel'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tabla por cada materia */}
              {subjects.map((subject, subjectIndex) => (
                <Card key={subject} className="border-2 border-blue-200">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-blue-800 flex items-center">
                      <Target className="h-5 w-5 mr-2" />
                      {subject}
                      <Badge variant="outline" className="ml-2 text-blue-600">
                        Escala 1-{maxScore}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="border border-gray-300 p-2 text-left">Estudiante</th>
                            <th className="border border-gray-300 p-2 text-left">Documento</th>
                            {Object.entries(evaluationStructure).map(([evalType, config]) => (
                              <th key={evalType} className="border border-gray-300 p-2 text-center">
                                {evalType}
                                <div className="text-xs text-gray-500">({config.weight}%)</div>
                              </th>
                            ))}
                            <th className="border border-gray-300 p-2 text-center bg-green-50">
                              <div className="font-bold text-green-800">Promedio</div>
                              <div className="text-xs text-green-600">Calculado</div>
                            </th>
                            <th className="border border-gray-300 p-2 text-center bg-blue-50">
                              <div className="font-bold text-blue-800">Desempeño</div>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student, studentIndex) => {
                            const average = calculatePeriodAverage(student.id, subject);
                            const performance = getPerformanceLevel(average);
                            
                            return (
                              <tr key={student.id} className={studentIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-gray-300 p-2 font-medium">{student.name}</td>
                                <td className="border border-gray-300 p-2 text-gray-600">{student.document}</td>
                                {Object.entries(evaluationStructure).map(([evalType, config]) => {
                                  const gradeKey = `${student.id}_${subject}_${evalType}`;
                                  const currentGrade = grades[gradeKey] || '';
                                  
                                  return (
                                    <td key={evalType} className="border border-gray-300 p-1">
                                      <Input
                                        type="number"
                                        min="0"
                                        max={maxScore}
                                        step="0.1"
                                        value={currentGrade}
                                        onChange={(e) => handleGradeChange(student.id, subject, evalType, e.target.value)}
                                        className="w-20 text-center"
                                        placeholder={`0-${maxScore}`}
                                      />
                                    </td>
                                  );
                                })}
                                <td className="border border-gray-300 p-2 text-center bg-green-50">
                                  <div className="font-bold text-green-800 text-lg">{average}</div>
                                </td>
                                <td className="border border-gray-300 p-2 text-center">
                                  <Badge className={performance.color}>
                                    {performance.level}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Resumen General */}
              <Card className="border-2 border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">📊 Resumen General del {periodInfo?.name || `Período ${selectedPeriod}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{students.length}</div>
                      <div className="text-sm text-gray-600">Total Estudiantes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{subjects.length}</div>
                      <div className="text-sm text-gray-600">Materias Asignadas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4</div>
                      <div className="text-sm text-gray-600">Tipos de Evaluación</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {students.length > 0 ? 
                          (students.reduce((sum, student) => sum + parseFloat(calculateFinalAverage(student.id)), 0) / students.length).toFixed(1)
                          : '0.0'
                        }
                      </div>
                      <div className="text-sm text-gray-600">Promedio Grupal</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedGradePlanilla;