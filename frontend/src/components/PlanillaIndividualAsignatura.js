import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Download, Save, X, Printer } from 'lucide-react';

const PlanillaIndividualAsignatura = ({ teacher, selectedGrade, selectedPeriod, selectedSubject, onClose }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});

  // Definir competencias específicas por asignatura según la imagen
  const getCompetenciesForSubject = (subject, teachingLevel) => {
    // Formato exacto según la imagen: Afectivas, Cognitivas, Procedimentales
    return {
      afectivas: ['Asistencia', 'Participación', 'Uniforme'],
      cognitivas: ['Evaluaciones', 'Quiz'],
      procedimentales: ['Talleres', 'Actividades', 'Compromisos']
    };
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
    
    // Cargar notas guardadas para esta asignatura específica
    const savedGrades = JSON.parse(localStorage.getItem(`gada_planilla_individual_${teacher.id}_${selectedGrade}_${selectedPeriod}_${selectedSubject}`) || '{}');
    setGrades(savedGrades);
  }, [teacher, selectedGrade, selectedPeriod, selectedSubject]);

  const saveGrades = () => {
    localStorage.setItem(`gada_planilla_individual_${teacher.id}_${selectedGrade}_${selectedPeriod}_${selectedSubject}`, JSON.stringify(grades));
    alert(`Planilla de ${selectedSubject} guardada exitosamente`);
  };

  const updateGrade = (studentId, category, competency, grade) => {
    const gradeKey = `${studentId}_${category}_${competency}`;
    setGrades(prev => ({
      ...prev,
      [gradeKey]: grade
    }));
  };

  const getCategoryAverage = (studentId, category, competencies) => {
    let total = 0;
    let count = 0;
    
    competencies.forEach(comp => {
      const gradeKey = `${studentId}_${category}_${comp}`;
      const grade = grades[gradeKey];
      if (grade && !isNaN(parseFloat(grade))) {
        total += parseFloat(grade);
        count++;
      }
    });
    
    return count > 0 ? (total / count).toFixed(1) : '';
  };

  const getFinalAverage = (studentId, allCompetencies) => {
    const afectivasAvg = getCategoryAverage(studentId, 'afectivas', allCompetencies.afectivas);
    const cognitivasAvg = getCategoryAverage(studentId, 'cognitivas', allCompetencies.cognitivas);
    const procedimentalesAvg = getCategoryAverage(studentId, 'procedimentales', allCompetencies.procedimentales);
    
    const validAverages = [afectivasAvg, cognitivasAvg, procedimentalesAvg]
      .filter(avg => avg && !isNaN(parseFloat(avg)))
      .map(avg => parseFloat(avg));
    
    if (validAverages.length === 0) return '';
    
    const finalAvg = validAverages.reduce((sum, avg) => sum + avg, 0) / validAverages.length;
    return finalAvg.toFixed(1);
  };

  const getPerformanceColor = (grade) => {
    if (!grade) return 'bg-white';
    const numGrade = parseFloat(grade);
    if (selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade)) {
      // Escala 1-5 para transición y primaria
      if (numGrade >= 4.6) return 'bg-green-100 text-green-800 font-bold';
      if (numGrade >= 4.0) return 'bg-blue-100 text-blue-800 font-bold';
      if (numGrade >= 3.0) return 'bg-yellow-100 text-yellow-800 font-bold';
      return 'bg-red-100 text-red-800 font-bold';
    } else {
      // Escala 1-10 para bachillerato
      if (numGrade >= 9.0) return 'bg-green-100 text-green-800 font-bold';
      if (numGrade >= 8.0) return 'bg-blue-100 text-blue-800 font-bold';
      if (numGrade >= 7.0) return 'bg-yellow-100 text-yellow-800 font-bold';
      return 'bg-red-100 text-red-800 font-bold';
    }
  };

  const exportToExcel = () => {
    const competencies = getCompetenciesForSubject(selectedSubject, teacher.teachingLevel);
    let csv = 'GIMNASIO AMERICANO DEL ATLÁNTICO\n';
    csv += `PLANILLA DE NOTAS - ${selectedSubject}\n`;
    csv += `GRADO ${selectedGrade} - PERÍODO ${selectedPeriod}\n`;
    csv += `DOCENTE RESPONSABLE: ${teacher.name}\n\n`;
    
    // Headers
    csv += 'No.,Nombre completo / Fecha Asistencia,';
    
    // Headers de competencias
    competencies.afectivas.forEach(comp => csv += `Afectivas-${comp},`);
    csv += 'DEF Afectivas,';
    competencies.cognitivas.forEach(comp => csv += `Cognitivas-${comp},`);
    csv += 'DEF Cognitivas,';
    competencies.procedimentales.forEach(comp => csv += `Procedimentales-${comp},`);
    csv += 'DEF Procedimentales,DEFINITIVA %\n';

    // Data rows
    students.forEach((student, index) => {
      csv += `${index + 1},${student.name},`;
      
      // Afectivas
      competencies.afectivas.forEach(comp => {
        const gradeKey = `${student.id}_afectivas_${comp}`;
        csv += `${grades[gradeKey] || ''},`;
      });
      csv += `${getCategoryAverage(student.id, 'afectivas', competencies.afectivas)},`;
      
      // Cognitivas
      competencies.cognitivas.forEach(comp => {
        const gradeKey = `${student.id}_cognitivas_${comp}`;
        csv += `${grades[gradeKey] || ''},`;
      });
      csv += `${getCategoryAverage(student.id, 'cognitivas', competencies.cognitivas)},`;
      
      // Procedimentales
      competencies.procedimentales.forEach(comp => {
        const gradeKey = `${student.id}_procedimentales_${comp}`;
        csv += `${grades[gradeKey] || ''},`;
      });
      csv += `${getCategoryAverage(student.id, 'procedimentales', competencies.procedimentales)},`;
      csv += `${getFinalAverage(student.id, competencies)}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_${selectedSubject}_${selectedGrade}_Periodo_${selectedPeriod}.csv`;
    link.click();
  };

  const competencies = getCompetenciesForSubject(selectedSubject, teacher.teachingLevel);
  const maxScale = selectedGrade === '0°' || ['1°', '2°', '3°', '4°', '5°'].includes(selectedGrade) ? "5" : "10";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <Card className="w-full max-w-[98vw] max-h-[98vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-bold">
                📋 PLANILLA DE NOTAS GADA 2025 V1
              </CardTitle>
              <p className="text-blue-100 text-sm">
                {selectedSubject} - Grado {selectedGrade} - Período {selectedPeriod}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={saveGrades} variant="secondary" size="sm">
                <Save className="mr-1 h-3 w-3" />
                Guardar
              </Button>
              <Button onClick={exportToExcel} variant="secondary" size="sm">
                <Download className="mr-1 h-3 w-3" />
                Excel
              </Button>
              <Button onClick={() => window.print()} variant="secondary" size="sm">
                <Printer className="mr-1 h-3 w-3" />
                Imprimir
              </Button>
              <Button onClick={onClose} variant="secondary" size="sm">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-auto max-h-[calc(98vh-120px)]">
            {/* Header institucional exacto de la imagen */}
            <div className="bg-white p-4 border-b-2 border-gray-400">
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20">
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSJ1cmwoI2dyYWRpZW50KSIvPgo8dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE4IiBmb250LXdlaWdodD0iYm9sZCI+R0FEQTWVYXQ+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50IiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj4KPHN0b3Agb2Zmc2V0PSIwJSIgc3RvcC1jb2xvcj0iIzIyOTNmNiIvPgo8c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNkYzI2MjYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K" 
                      alt="GADA Logo" 
                      className="w-full h-full"
                    />
                  </div>
                  <div className="text-center">
                    <h1 className="font-bold text-sm text-gray-800">GIMNASIO AMERICANO DEL ATLÁNTICO</h1>
                    <p className="text-xs text-gray-700">PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA</p>
                    <p className="text-xs text-gray-700">MEDIA VOCACIONAL COMERCIAL</p>
                    <p className="text-xs text-gray-600">LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002</p>
                    <p className="text-xs text-gray-600">LICENCIA DE FUNCIONAMIENTO RES. 1557 DEL 7 DE SEPTIEMBRE DE 1.999</p>
                    <p className="text-xs text-gray-600">REGISTRO DANE 308758-001703 NIT 830.503.594-4</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-8 text-xs border border-gray-400 p-2 mb-2">
                <div>
                  <div className="mb-1"><span className="font-semibold">DIRECTOR DE GRUPO:</span></div>
                  <div className="border-b border-gray-400 h-4"></div>
                </div>
                <div className="text-center">
                  <div className="mb-1"><span className="font-semibold">GRADO:</span> <span className="font-bold text-lg">{selectedGrade}</span></div>
                </div>
                <div className="text-center">
                  <div className="mb-1"><span className="font-semibold">PERÍODO:</span> <span className="font-bold text-lg">{selectedPeriod}</span></div>
                </div>
              </div>

              <div className="text-xs">
                <div className="mb-1">
                  <span className="font-semibold">PLANILLA DE NOTAS</span>
                  <span className="ml-8"><span className="font-semibold">DOCENTE RESPONSABLE:</span> {teacher.name}</span>
                </div>
                <div>
                  <span className="font-semibold">ASIGNATURA:</span> <span className="font-bold text-blue-800">{selectedSubject}</span>
                </div>
              </div>
            </div>

            {/* Tabla exacta según la imagen */}
            <table className="w-full border-collapse text-[9px] font-mono bg-white">
              <thead>
                {/* Primera fila de headers principales */}
                <tr className="bg-blue-700 text-white">
                  <th className="border border-gray-400 p-1 w-8" rowSpan="3">No.</th>
                  <th className="border border-gray-400 p-1 min-w-[180px]" rowSpan="3">
                    Nombre completo / Fecha Asistencia
                  </th>
                  
                  {/* Afectivas */}
                  <th className="border border-gray-400 p-1 bg-green-600" colSpan={competencies.afectivas.length + 1}>
                    Afectivas: Asistencia, Participación, Uniforme
                  </th>
                  
                  {/* Cognitivas */}
                  <th className="border border-gray-400 p-1 bg-blue-600" colSpan={competencies.cognitivas.length + 1}>
                    Cognitivas: Evaluaciones, Quiz
                  </th>
                  
                  {/* Procedimentales */}
                  <th className="border border-gray-400 p-1 bg-purple-600" colSpan={competencies.procedimentales.length + 1}>
                    Procedimentales: Talleres, Actividades, Compromisos
                  </th>

                  <th className="border border-gray-400 p-1 bg-red-700" rowSpan="3">
                    DEFINITIVA<br/>%
                  </th>
                </tr>
                
                {/* Segunda fila - números de competencias */}
                <tr className="bg-gray-200 text-gray-800">
                  {/* Afectivas números */}
                  {competencies.afectivas.map((_, index) => (
                    <th key={`af-${index}`} className="border border-gray-400 p-1 w-8 bg-green-200">
                      {index + 1}
                    </th>
                  ))}
                  <th className="border border-gray-400 p-1 w-8 bg-green-300 font-bold">DEF</th>
                  
                  {/* Cognitivas números */}
                  {competencies.cognitivas.map((_, index) => (
                    <th key={`cog-${index}`} className="border border-gray-400 p-1 w-8 bg-blue-200">
                      {index + 1}
                    </th>
                  ))}
                  <th className="border border-gray-400 p-1 w-8 bg-blue-300 font-bold">DEF</th>
                  
                  {/* Procedimentales números */}
                  {competencies.procedimentales.map((_, index) => (
                    <th key={`proc-${index}`} className="border border-gray-400 p-1 w-8 bg-purple-200">
                      {index + 1}
                    </th>
                  ))}
                  <th className="border border-gray-400 p-1 w-8 bg-purple-300 font-bold">DEF</th>
                </tr>

                {/* Tercera fila - nombres específicos de competencias */}
                <tr className="bg-gray-100 text-[8px]">
                  {/* Afectivas nombres */}
                  {competencies.afectivas.map((comp) => (
                    <th key={`afn-${comp}`} className="border border-gray-400 p-1 bg-green-100 text-green-800 font-semibold">
                      {comp}
                    </th>
                  ))}
                  <th className="border border-gray-400 p-1 bg-green-200 font-bold">%</th>
                  
                  {/* Cognitivas nombres */}
                  {competencies.cognitivas.map((comp) => (
                    <th key={`cogn-${comp}`} className="border border-gray-400 p-1 bg-blue-100 text-blue-800 font-semibold">
                      {comp}
                    </th>
                  ))}
                  <th className="border border-gray-400 p-1 bg-blue-200 font-bold">%</th>
                  
                  {/* Procedimentales nombres */}
                  {competencies.procedimentales.map((comp) => (
                    <th key={`procn-${comp}`} className="border border-gray-400 p-1 bg-purple-100 text-purple-800 font-semibold">
                      {comp}
                    </th>
                  ))}
                  <th className="border border-gray-400 p-1 bg-purple-200 font-bold">%</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student, studentIndex) => (
                  <tr key={student.id} className={studentIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-400 p-1 text-center font-bold text-blue-800">
                      {studentIndex + 1}
                    </td>
                    <td className="border border-gray-400 p-1 font-semibold text-[8px]">
                      {student.name.toUpperCase()}
                    </td>
                    
                    {/* Afectivas inputs */}
                    {competencies.afectivas.map((comp) => {
                      const gradeKey = `${student.id}_afectivas_${comp}`;
                      const currentGrade = grades[gradeKey] || '';
                      return (
                        <td key={gradeKey} className="border border-gray-400 p-0">
                          <Input
                            value={currentGrade}
                            onChange={(e) => updateGrade(student.id, 'afectivas', comp, e.target.value)}
                            className={`border-0 text-center text-[8px] h-5 w-full ${getPerformanceColor(currentGrade)}`}
                            maxLength={4}
                            type="number"
                            step="0.1"
                            min="1"
                            max={maxScale}
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-400 p-1 text-center bg-green-50 font-bold text-[8px]">
                      <Badge className={`text-[7px] ${getPerformanceColor(getCategoryAverage(student.id, 'afectivas', competencies.afectivas))}`}>
                        {getCategoryAverage(student.id, 'afectivas', competencies.afectivas)}
                      </Badge>
                    </td>
                    
                    {/* Cognitivas inputs */}
                    {competencies.cognitivas.map((comp) => {
                      const gradeKey = `${student.id}_cognitivas_${comp}`;
                      const currentGrade = grades[gradeKey] || '';
                      return (
                        <td key={gradeKey} className="border border-gray-400 p-0">
                          <Input
                            value={currentGrade}
                            onChange={(e) => updateGrade(student.id, 'cognitivas', comp, e.target.value)}
                            className={`border-0 text-center text-[8px] h-5 w-full ${getPerformanceColor(currentGrade)}`}
                            maxLength={4}
                            type="number"
                            step="0.1"
                            min="1"
                            max={maxScale}
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-400 p-1 text-center bg-blue-50 font-bold text-[8px]">
                      <Badge className={`text-[7px] ${getPerformanceColor(getCategoryAverage(student.id, 'cognitivas', competencies.cognitivas))}`}>
                        {getCategoryAverage(student.id, 'cognitivas', competencies.cognitivas)}
                      </Badge>
                    </td>
                    
                    {/* Procedimentales inputs */}
                    {competencies.procedimentales.map((comp) => {
                      const gradeKey = `${student.id}_procedimentales_${comp}`;
                      const currentGrade = grades[gradeKey] || '';
                      return (
                        <td key={gradeKey} className="border border-gray-400 p-0">
                          <Input
                            value={currentGrade}
                            onChange={(e) => updateGrade(student.id, 'procedimentales', comp, e.target.value)}
                            className={`border-0 text-center text-[8px] h-5 w-full ${getPerformanceColor(currentGrade)}`}
                            maxLength={4}
                            type="number"
                            step="0.1"
                            min="1"
                            max={maxScale}
                          />
                        </td>
                      );
                    })}
                    <td className="border border-gray-400 p-1 text-center bg-purple-50 font-bold text-[8px]">
                      <Badge className={`text-[7px] ${getPerformanceColor(getCategoryAverage(student.id, 'procedimentales', competencies.procedimentales))}`}>
                        {getCategoryAverage(student.id, 'procedimentales', competencies.procedimentales)}
                      </Badge>
                    </td>
                    
                    {/* Definitiva final */}
                    <td className="border border-gray-400 p-1 text-center bg-red-50 font-bold text-[8px]">
                      <Badge className={`text-[7px] ${getPerformanceColor(getFinalAverage(student.id, competencies))}`}>
                        {getFinalAverage(student.id, competencies)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer institucional */}
          <div className="bg-gray-100 p-3 border-t border-gray-400 text-[9px]">
            <div className="grid grid-cols-2 gap-4">
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
              <div className="text-right">
                <div><strong>ASIGNATURA:</strong> {selectedSubject}</div>
                <div><strong>TOTAL ESTUDIANTES:</strong> {students.length}</div>
                <div><strong>PERÍODO:</strong> {selectedPeriod}</div>
                <div><strong>FECHA:</strong> {new Date().toLocaleDateString('es-CO')}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanillaIndividualAsignatura;