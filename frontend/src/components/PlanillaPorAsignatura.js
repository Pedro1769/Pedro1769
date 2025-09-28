import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Download, Save, Edit3, X, Plus, FileSpreadsheet } from 'lucide-react';

const PlanillaPorAsignatura = ({ teacher, selectedGrade, selectedPeriod, selectedSubject, onClose }) => {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});
  const [editingCell, setEditingCell] = useState(null);

  // Definir competencias según el nivel educativo y asignatura
  const getCompetenciesForSubject = (subject, teachingLevel) => {
    if (teachingLevel === 'transicion') {
      // Para transición, las dimensiones tienen competencias específicas
      switch(subject) {
        case 'DIMENSIÓN COMUNICATIVA':
          return ['Expresión Oral', 'Comprensión', 'Escritura Inicial', 'Literatura'];
        case 'DIMENSIÓN COGNITIVA':
          return ['Lógico-Matemática', 'Pensamiento Científico', 'Solución Problemas', 'Atención'];
        case 'DIMENSIÓN CORPORAL':
          return ['Motricidad Gruesa', 'Motricidad Fina', 'Coordinación', 'Lateralidad'];
        case 'DIMENSIÓN ESTÉTICA':
          return ['Expresión Artística', 'Apreciación', 'Creatividad', 'Sensibilidad'];
        case 'DIMENSIÓN ÉTICA':
          return ['Valores', 'Convivencia', 'Autonomía', 'Respeto'];
        default:
          return ['Competencia 1', 'Competencia 2', 'Competencia 3', 'Competencia 4'];
      }
    } else if (teachingLevel === 'primaria') {
      // Para primaria, competencias específicas por asignatura
      switch(subject) {
        case 'ESPAÑOL':
          return ['Producción Textual', 'Comprensión Lectora', 'Literatura', 'Medios de Comunicación'];
        case 'MATEMÁTICAS':
          return ['Pensamiento Numérico', 'Pensamiento Espacial', 'Pensamiento Métrico', 'Pensamiento Aleatorio'];
        case 'CIENCIAS NATURALES':
          return ['Entorno Vivo', 'Entorno Físico', 'Ciencia y Tecnología', 'Desarrollo Sostenible'];
        case 'CIENCIAS SOCIALES':
          return ['Relaciones Espaciales', 'Relaciones Tiempo-Historia', 'Relaciones Ético-Políticas', 'Identidad Cultural'];
        case 'INGLÉS':
          return ['Listening', 'Speaking', 'Reading', 'Writing'];
        case 'EDUCACIÓN ARTÍSTICA':
          return ['Expresión Plástica', 'Expresión Musical', 'Expresión Corporal', 'Apreciación Artística'];
        case 'ÉTICA Y RELIGIÓN':
          return ['Antropológica', 'Cristológica', 'Eclesiológica', 'Escatológica'];
        case 'INFORMÁTICA':
          return ['Manejo de Herramientas', 'Tecnología y Sociedad', 'Solución de Problemas', 'Comunicación Digital'];
        default:
          return ['Saber', 'Saber Hacer', 'Saber Ser', 'Saber Convivir'];
      }
    } else {
      // Para bachillerato, competencias generales
      return ['Interpretativa', 'Argumentativa', 'Propositiva', 'Ciudadana'];
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
    
    // Cargar notas guardadas para esta asignatura específica
    const savedGrades = JSON.parse(localStorage.getItem(`gada_planilla_${teacher.id}_${selectedGrade}_${selectedPeriod}_${selectedSubject}`) || '{}');
    setGrades(savedGrades);
  }, [teacher, selectedGrade, selectedPeriod, selectedSubject]);

  const saveGrades = () => {
    localStorage.setItem(`gada_planilla_${teacher.id}_${selectedGrade}_${selectedPeriod}_${selectedSubject}`, JSON.stringify(grades));
    alert(`Planilla de ${selectedSubject} guardada exitosamente`);
  };

  const exportToCSV = () => {
    let csv = 'GIMNASIO AMERICANO DEL ATLÁNTICO\n';
    csv += `PLANILLA DE NOTAS - ${selectedSubject}\n`;
    csv += `GRADO ${selectedGrade} - PERÍODO ${selectedPeriod}\n`;
    csv += `DOCENTE: ${teacher.name}\n\n`;
    
    const competencies = getCompetenciesForSubject(selectedSubject, teacher.teachingLevel);
    
    // Headers
    csv += 'No.,Estudiante,Documento,';
    competencies.forEach(comp => {
      csv += `${comp},`;
    });
    csv += 'Definitiva\n';

    // Data rows
    students.forEach((student, index) => {
      csv += `${index + 1},${student.name},${student.document},`;
      let totalGrades = 0;
      let gradeCount = 0;
      
      competencies.forEach(comp => {
        const gradeKey = `${student.id}_${comp}`;
        const grade = grades[gradeKey] || '';
        csv += `${grade},`;
        if (grade && !isNaN(parseFloat(grade))) {
          totalGrades += parseFloat(grade);
          gradeCount++;
        }
      });
      
      const average = gradeCount > 0 ? (totalGrades / gradeCount).toFixed(1) : '';
      csv += `${average}\n`;
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Planilla_${selectedSubject}_${selectedGrade}_Periodo_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const updateGrade = (studentId, competency, grade) => {
    const gradeKey = `${studentId}_${competency}`;
    setGrades(prev => ({
      ...prev,
      [gradeKey]: grade
    }));
  };

  const getStudentAverage = (studentId) => {
    const competencies = getCompetenciesForSubject(selectedSubject, teacher.teachingLevel);
    let total = 0;
    let count = 0;
    
    competencies.forEach(comp => {
      const gradeKey = `${studentId}_${comp}`;
      const grade = grades[gradeKey];
      if (grade && !isNaN(parseFloat(grade))) {
        total += parseFloat(grade);
        count++;
      }
    });
    
    return count > 0 ? (total / count).toFixed(1) : '';
  };

  const getPerformanceColor = (grade) => {
    if (!grade) return '';
    const numGrade = parseFloat(grade);
    if (teacher.teachingLevel === 'transicion' || teacher.teachingLevel === 'primaria') {
      // Escala 1-5 para transición y primaria
      if (numGrade >= 4.6) return 'bg-green-100 text-green-800';
      if (numGrade >= 4.0) return 'bg-blue-100 text-blue-800';
      if (numGrade >= 3.0) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    } else {
      // Escala 1-10 para bachillerato
      if (numGrade >= 9.0) return 'bg-green-100 text-green-800';
      if (numGrade >= 8.0) return 'bg-blue-100 text-blue-800';
      if (numGrade >= 7.0) return 'bg-yellow-100 text-yellow-800';
      return 'bg-red-100 text-red-800';
    }
  };

  const getScaleInfo = () => {
    if (teacher.teachingLevel === 'transicion' || teacher.teachingLevel === 'primaria') {
      return 'Escala: 5.0-4.6 Superior | 4.5-4.0 Alto | 3.9-3.0 Básico | 2.9-1.0 Bajo';
    } else {
      return 'Escala: 10.0-9.0 Superior | 8.9-8.0 Alto | 7.9-7.0 Básico | 6.9-1.0 Bajo';
    }
  };

  const competencies = getCompetenciesForSubject(selectedSubject, teacher.teachingLevel);

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
                {selectedSubject} - Grado {selectedGrade} - Período {selectedPeriod}
              </p>
              <p className="text-blue-200 text-sm">
                Docente: {teacher.name}
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
                  <p className="text-xs text-gray-600">LICENCIA DE FUNCIONAMIENTO RES. 1544 DEL 31 DE DICIEMBRE DE 2.002</p>
                  <p className="text-xs text-gray-600">LICENCIA DE FUNCIONAMIENTO RES. 1557 DEL 7 DE SEPTIEMBRE DE 1.999</p>
                  <p className="text-xs text-gray-600">REGISTRO DANE 308758-001703 NIT 830.503.594-4</p>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>DIRECTOR DE GRUPO:</strong>
                  <div className="border-b border-gray-400 mt-1"></div>
                </div>
                <div className="text-center">
                  <strong>GRADO: {selectedGrade}</strong>
                </div>
                <div className="text-center">
                  <strong>PERÍODO: {selectedPeriod}</strong>
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <strong>PLANILLA DE NOTAS</strong>
                <span className="ml-4"><strong>DOCENTE RESPONSABLE:</strong> {teacher.name}</span>
                <span className="ml-4"><strong>ASIGNATURA:</strong> {selectedSubject}</span>
              </div>
            </div>

            {/* Tabla de notas */}
            <table className="w-full border-collapse text-xs">
              <thead className="bg-blue-600 text-white sticky top-0">
                <tr>
                  <th className="border border-gray-300 p-2 w-8">No.</th>
                  <th className="border border-gray-300 p-2 min-w-[200px]">ESTUDIANTE</th>
                  <th className="border border-gray-300 p-2 w-24">DOCUMENTO</th>
                  
                  {/* Competencias de la asignatura */}
                  <th className="border border-gray-300 p-1" colSpan={competencies.length}>
                    <div className="text-center">
                      <div className="font-bold text-xs bg-green-600 p-1 rounded">{selectedSubject}</div>
                      <div className="flex mt-1">
                        {competencies.map((comp, index) => (
                          <div key={comp} className={`flex-1 border-l border-gray-400 text-xs p-1 ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-blue-500' : 
                            index === 2 ? 'bg-purple-500' : 'bg-orange-500'
                          }`}>
                            {comp.length > 15 ? comp.substring(0, 15) + '...' : comp}
                          </div>
                        ))}
                      </div>
                    </div>
                  </th>
                  
                  <th className="border border-gray-300 p-2 w-16 bg-red-600">DEFINITIVA</th>
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
                    
                    {/* Inputs para cada competencia */}
                    {competencies.map((comp, compIndex) => {
                      const gradeKey = `${student.id}_${comp}`;
                      const currentGrade = grades[gradeKey] || '';
                      
                      return (
                        <td key={gradeKey} className="border border-gray-300 p-0 w-12">
                          <Input
                            value={currentGrade}
                            onChange={(e) => updateGrade(student.id, comp, e.target.value)}
                            className={`border-0 text-center text-xs h-8 ${getPerformanceColor(currentGrade)}`}
                            placeholder=""
                            maxLength={teacher.teachingLevel === 'bachillerato' ? 4 : 3}
                            type="number"
                            step="0.1"
                            min="1"
                            max={teacher.teachingLevel === 'bachillerato' ? "10" : "5"}
                          />
                        </td>
                      );
                    })}
                    
                    <td className="border border-gray-300 p-2 text-center bg-yellow-50 font-bold">
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
                <strong>{getScaleInfo()}</strong>
              </div>
              <div className="flex space-x-4">
                <span><strong>Asignatura:</strong> {selectedSubject}</span>
                <span><strong>Total Estudiantes:</strong> {students.length}</span>
                <span><strong>Competencias:</strong> {competencies.length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanillaPorAsignatura;