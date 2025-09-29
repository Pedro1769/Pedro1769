import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Download, Save, X, FileSpreadsheet, Printer } from 'lucide-react';

const PlanillaCompletaPorPeriodo = ({ teacher, selectedGrade, selectedPeriod, onClose }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});

  // Definir todas las asignaturas según el nivel educativo
  const getAllSubjectsForLevel = (teachingLevel, grade) => {
    if (grade === '0°') {
      // Transición
      return [
        { name: 'DIMENSIÓN COMUNICATIVA', competencies: ['Expresión Oral', 'Comprensión', 'Escritura', 'Literatura'] },
        { name: 'DIMENSIÓN COGNITIVA', competencies: ['Lógico-Matemática', 'Pensamiento Científico', 'Solución Problemas', 'Atención'] },
        { name: 'DIMENSIÓN CORPORAL', competencies: ['Motricidad Gruesa', 'Motricidad Fina', 'Coordinación', 'Lateralidad'] },
        { name: 'DIMENSIÓN ESTÉTICA', competencies: ['Expresión Artística', 'Apreciación', 'Creatividad', 'Sensibilidad'] },
        { name: 'DIMENSIÓN ÉTICA', competencies: ['Valores', 'Convivencia', 'Autonomía', 'Respeto'] }
      ];
    } else if (['1°', '2°', '3°', '4°', '5°'].includes(grade)) {
      // Primaria
      return [
        { name: 'ESPAÑOL', competencies: ['Producción Textual', 'Comprensión Lectora', 'Literatura', 'Medios de Comunicación'] },
        { name: 'MATEMÁTICAS', competencies: ['Pensamiento Numérico', 'Pensamiento Espacial', 'Pensamiento Métrico', 'Pensamiento Aleatorio'] },
        { name: 'CIENCIAS NATURALES', competencies: ['Entorno Vivo', 'Entorno Físico', 'Ciencia y Tecnología', 'Desarrollo Sostenible'] },
        { name: 'CIENCIAS SOCIALES', competencies: ['Relaciones Espaciales', 'Relaciones Tiempo-Historia', 'Relaciones Ético-Políticas', 'Identidad Cultural'] },
        { name: 'INGLÉS', competencies: ['Listening', 'Speaking', 'Reading', 'Writing'] },
        { name: 'EDUCACIÓN ARTÍSTICA', competencies: ['Expresión Plástica', 'Expresión Musical', 'Expresión Corporal', 'Apreciación Artística'] },
        { name: 'ÉTICA Y RELIGIÓN', competencies: ['Antropológica', 'Cristológica', 'Eclesiológica', 'Escatológica'] },
        { name: 'INFORMÁTICA', competencies: ['Manejo de Herramientas', 'Tecnología y Sociedad', 'Solución de Problemas', 'Comunicación Digital'] }
      ];
    } else {
      // Bachillerato
      return [
        { name: 'ESPAÑOL', competencies: ['Interpretativa', 'Argumentativa', 'Propositiva', 'Ciudadana'] },
        { name: 'MATEMÁTICAS', competencies: ['Interpretativa', 'Argumentativa', 'Propositiva', 'Modelación'] },
        { name: 'CIENCIAS NATURALES', competencies: ['Uso Conceptos', 'Explicación Fenómenos', 'Indagación', 'Desarrollo Sostenible'] },
        { name: 'CIENCIAS SOCIALES', competencies: ['Interpretativa', 'Argumentativa', 'Propositiva', 'Ciudadana'] },
        { name: 'INGLÉS', competencies: ['Listening', 'Speaking', 'Reading', 'Writing'] },
        { name: 'EDUCACIÓN FÍSICA', competencies: ['Competencia Motriz', 'Expresión Corporal', 'Axiológica Corporal', 'Lúdica'] },
        { name: 'QUÍMICA', competencies: ['Uso Conceptos', 'Explicación Fenómenos', 'Indagación', 'Desarrollo Sostenible'] },
        { name: 'FÍSICA', competencies: ['Mecánica', 'Ondas y Termodinámica', 'Electricidad y Magnetismo', 'Física Moderna'] },
        { name: 'FILOSOFÍA', competencies: ['Interpretativa', 'Argumentativa', 'Propositiva', 'Dialógica'] },
        { name: 'EDUCACIÓN ARTÍSTICA', competencies: ['Sensibilidad', 'Apreciación Estética', 'Comunicación', 'Creativa'] },
        { name: 'ÉTICA Y RELIGIÓN', competencies: ['Antropológica', 'Cristológica', 'Eclesiológica', 'Escatológica'] },
        { name: 'INFORMÁTICA', competencies: ['Tecnológica', 'Comunicativa', 'Investigativa', 'Pensamiento Crítico'] }
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
    
    // Cargar notas guardadas para esta planilla completa
    const savedGrades = JSON.parse(localStorage.getItem(`gada_planilla_completa_${selectedGrade}_${selectedPeriod}`) || '{}');
    setGrades(savedGrades);
  }, [selectedGrade, selectedPeriod]);

  const saveGrades = () => {
    localStorage.setItem(`gada_planilla_completa_${selectedGrade}_${selectedPeriod}`, JSON.stringify(grades));
    alert(`Planilla completa guardada exitosamente para ${selectedGrade} - Período ${selectedPeriod}`);
  };

  const updateGrade = (studentId, subject, competency, grade) => {
    const gradeKey = `${studentId}_${subject}_${competency}`;
    setGrades(prev => ({
      ...prev,
      [gradeKey]: grade
    }));
  };

  const getSubjectAverage = (studentId, subject, competencies) => {
    let total = 0;
    let count = 0;
    
    competencies.forEach(comp => {
      const gradeKey = `${studentId}_${subject}_${comp}`;
      const grade = grades[gradeKey];
      if (grade && !isNaN(parseFloat(grade))) {
        total += parseFloat(grade);
        count++;
      }
    });
    
    return count > 0 ? (total / count).toFixed(1) : '';
  };

  const getOverallAverage = (studentId, allSubjects) => {
    let totalSubjectAverages = 0;
    let subjectCount = 0;
    
    allSubjects.forEach(subject => {
      const subjectAvg = getSubjectAverage(studentId, subject.name, subject.competencies);
      if (subjectAvg && !isNaN(parseFloat(subjectAvg))) {
        totalSubjectAverages += parseFloat(subjectAvg);
        subjectCount++;
      }
    });
    
    return subjectCount > 0 ? (totalSubjectAverages / subjectCount).toFixed(1) : '';
  };

  const getPerformanceColor = (grade) => {
    if (!grade) return '';
    const numGrade = parseFloat(grade);
    if (selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade)) {
      // Escala 1-5 para transición y primaria
      if (numGrade >= 4.6) return 'bg-green-100 text-green-800 font-semibold';
      if (numGrade >= 4.0) return 'bg-blue-100 text-blue-800 font-semibold';
      if (numGrade >= 3.0) return 'bg-yellow-100 text-yellow-800 font-semibold';
      return 'bg-red-100 text-red-800 font-semibold';
    } else {
      // Escala 1-10 para bachillerato
      if (numGrade >= 9.0) return 'bg-green-100 text-green-800 font-semibold';
      if (numGrade >= 8.0) return 'bg-blue-100 text-blue-800 font-semibold';
      if (numGrade >= 7.0) return 'bg-yellow-100 text-yellow-800 font-semibold';
      return 'bg-red-100 text-red-800 font-semibold';
    }
  };

  const exportToPDF = () => {
    // Simular exportación a PDF
    alert('Funcionalidad de exportación a PDF será implementada próximamente');
  };

  const printPlanilla = () => {
    window.print();
  };

  const exportToExcel = () => {
    const allSubjects = getAllSubjectsForLevel(teacher.teachingLevel, selectedGrade);
    let csv = 'GIMNASIO AMERICANO DEL ATLÁNTICO\n';
    csv += `PLANILLA COMPLETA DE NOTAS - PERÍODO ${selectedPeriod}\n`;
    csv += `GRADO ${selectedGrade} - AÑO LECTIVO 2025\n\n`;
    
    // Headers
    csv += 'No.,Estudiante,Documento,';
    allSubjects.forEach(subject => {
      subject.competencies.forEach(comp => {
        csv += `${subject.name}-${comp},`;
      });
      csv += `${subject.name} Definitiva,`;
    });
    csv += 'Promedio General\n';

    // Data rows
    students.forEach((student, index) => {
      csv += `${index + 1},${student.name},${student.document},`;
      
      allSubjects.forEach(subject => {
        subject.competencies.forEach(comp => {
          const gradeKey = `${student.id}_${subject.name}_${comp}`;
          const grade = grades[gradeKey] || '';
          csv += `${grade},`;
        });
        const subjectAvg = getSubjectAverage(student.id, subject.name, subject.competencies);
        csv += `${subjectAvg},`;
      });
      
      const overallAvg = getOverallAverage(student.id, allSubjects);
      csv += `${overallAvg}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_Completa_${selectedGrade}_Periodo_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const allSubjects = getAllSubjectsForLevel(teacher.teachingLevel, selectedGrade);
  const maxScale = selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade) ? "5" : "10";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <Card className="w-full max-w-[95vw] max-h-[95vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                📋 PLANILLA COMPLETA DE NOTAS - GADA 2025
              </CardTitle>
              <p className="text-blue-100">
                Grado {selectedGrade} - Período {selectedPeriod} - Todas las Asignaturas
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveGrades} variant="secondary" size="sm">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
              <Button onClick={exportToExcel} variant="secondary" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button onClick={printPlanilla} variant="secondary" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
              <Button onClick={onClose} variant="secondary" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(95vh-140px)]">
            {/* Header institucional completo */}
            <div className="bg-white p-6 border-b-2 border-gray-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">GADA</span>
                  </div>
                  <div className="text-center">
                    <h1 className="font-bold text-lg text-blue-800">GIMNASIO AMERICANO DEL ATLÁNTICO</h1>
                    <p className="text-sm text-gray-700">PREESCOLAR - BÁSICA PRIMARIA - BÁSICA SECUNDARIA</p>
                    <p className="text-sm text-gray-700">MEDIA VOCACIONAL COMERCIAL</p>
                    <p className="text-xs text-gray-600 font-bold text-blue-700">40+ AÑOS DE EXCELENCIA ACADÉMICA</p>
                    <p className="text-xs text-gray-600">LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002</p>
                    <p className="text-xs text-gray-600">LICENCIA DE FUNCIONAMIENTO RES. 1557 DEL 7 DE SEPTIEMBRE DE 1.999</p>
                    <p className="text-xs text-gray-600">REGISTRO DANE 308758-001703 NIT 830.503.594-4</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">AÑO LECTIVO 2025</div>
                  <div className="text-sm">PUERTO COLOMBIA - ATLÁNTICO</div>
                </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm border-2 border-gray-400 p-4">
                <div>
                  <strong>DIRECTOR DE GRUPO:</strong>
                  <div className="border-b border-gray-400 mt-1 h-6"></div>
                </div>
                <div>
                  <strong>GRADO:</strong> <span className="font-bold text-blue-800">{selectedGrade}</span>
                </div>
                <div>
                  <strong>PERÍODO:</strong> <span className="font-bold text-blue-800">{selectedPeriod}</span>
                </div>
                <div>
                  <strong>JORNADA:</strong> {selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade) ? 'TARDE' : 'MAÑANA'}
                </div>
              </div>
            </div>

            {/* Tabla de notas completa */}
            <div className="bg-white">
              <table className="w-full border-collapse text-[10px] font-mono">
                <thead>
                  {/* Fila principal de headers */}
                  <tr className="bg-blue-700 text-white">
                    <th className="border-2 border-gray-400 p-1 w-8" rowSpan="2">No.</th>
                    <th className="border-2 border-gray-400 p-1 min-w-[200px]" rowSpan="2">APELLIDOS Y NOMBRES</th>
                    <th className="border-2 border-gray-400 p-1 w-20" rowSpan="2">DOCUMENTO</th>
                    
                    {/* Headers de materias */}
                    {allSubjects.map((subject, index) => (
                      <th key={subject.name} className={`border-2 border-gray-400 p-1 text-center ${
                        index % 2 === 0 ? 'bg-green-600' : 'bg-blue-600'
                      }`} colSpan={subject.competencies.length + 1}>
                        {subject.name}
                      </th>
                    ))}
                    
                    <th className="border-2 border-gray-400 p-1 w-16 bg-red-700" rowSpan="2">
                      PROMEDIO<br/>GENERAL
                    </th>
                  </tr>
                  
                  {/* Fila de competencias */}
                  <tr className="bg-gray-100 text-gray-800">
                    {allSubjects.map((subject, subjectIndex) => (
                      <React.Fragment key={`comp-${subject.name}`}>
                        {subject.competencies.map((comp, compIndex) => (
                          <th key={comp} className={`border border-gray-400 p-1 w-12 text-[9px] ${
                            compIndex % 2 === 0 ? 'bg-gray-200' : 'bg-gray-100'
                          }`}>
                            {comp.length > 8 ? comp.substring(0, 8) + '...' : comp}
                          </th>
                        ))}
                        <th className={`border border-gray-400 p-1 w-12 font-bold ${
                          subjectIndex % 2 === 0 ? 'bg-green-200' : 'bg-blue-200'
                        }`}>
                          DEF
                        </th>
                      </React.Fragment>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {students.map((student, studentIndex) => (
                    <tr key={student.id} className={studentIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-400 p-1 text-center font-bold text-blue-800">
                        {studentIndex + 1}
                      </td>
                      <td className="border border-gray-400 p-1 font-semibold">
                        {student.name.toUpperCase()}
                      </td>
                      <td className="border border-gray-400 p-1 text-center">
                        {student.document}
                      </td>
                      
                      {/* Notas por materia */}
                      {allSubjects.map((subject, subjectIndex) => (
                        <React.Fragment key={`grades-${subject.name}`}>
                          {subject.competencies.map((comp, compIndex) => {
                            const gradeKey = `${student.id}_${subject.name}_${comp}`;
                            const currentGrade = grades[gradeKey] || '';
                            
                            return (
                              <td key={gradeKey} className="border border-gray-400 p-0">
                                <Input
                                  value={currentGrade}
                                  onChange={(e) => updateGrade(student.id, subject.name, comp, e.target.value)}
                                  className={`border-0 text-center text-[10px] h-6 w-full ${getPerformanceColor(currentGrade)}`}
                                  placeholder=""
                                  maxLength={4}
                                  type="number"
                                  step="0.1"
                                  min="1"
                                  max={maxScale}
                                />
                              </td>
                            );
                          })}
                          
                          {/* Definitiva de la materia */}
                          <td className={`border border-gray-400 p-1 text-center font-bold ${
                            subjectIndex % 2 === 0 ? 'bg-green-50' : 'bg-blue-50'
                          }`}>
                            <Badge className={`text-[9px] ${getPerformanceColor(getSubjectAverage(student.id, subject.name, subject.competencies))}`}>
                              {getSubjectAverage(student.id, subject.name, subject.competencies)}
                            </Badge>
                          </td>
                        </React.Fragment>
                      ))}
                      
                      {/* Promedio general */}
                      <td className="border border-gray-400 p-1 text-center bg-yellow-50 font-bold">
                        <Badge className={`text-[10px] ${getPerformanceColor(getOverallAverage(student.id, allSubjects))}`}>
                          {getOverallAverage(student.id, allSubjects)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer institucional */}
          <div className="bg-gray-100 p-4 border-t-2 border-gray-400 text-xs">
            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <strong>ESCALA DE VALORACIÓN INSTITUCIONAL:</strong>
                <div className="mt-1">
                  {selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade) ? (
                    <span>5.0-4.6 SUPERIOR | 4.5-4.0 ALTO | 3.9-3.0 BÁSICO | 2.9-1.0 BAJO</span>
                  ) : (
                    <span>10.0-9.0 SUPERIOR | 8.9-8.0 ALTO | 7.9-7.0 BÁSICO | 6.9-1.0 BAJO</span>
                  )}
                </div>
              </div>
              <div className="text-center">
                <strong>TOTAL ESTUDIANTES:</strong> {students.length}<br/>
                <strong>TOTAL ASIGNATURAS:</strong> {allSubjects.length}
              </div>
              <div className="text-right">
                <strong>FECHA DE IMPRESIÓN:</strong><br/>
                {new Date().toLocaleDateString('es-CO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
            
            <div className="flex justify-between border-t pt-3 text-center">
              <div className="w-1/3">
                <div className="border-b border-gray-400 mb-2 pb-1"></div>
                <strong>COORDINADOR ACADÉMICO</strong>
              </div>
              <div className="w-1/3">
                <div className="border-b border-gray-400 mb-2 pb-1"></div>
                <strong>DIRECTOR DE GRUPO</strong>
              </div>
              <div className="w-1/3">
                <div className="border-b border-gray-400 mb-2 pb-1"></div>
                <strong>RECTOR</strong>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanillaCompletaPorPeriodo;