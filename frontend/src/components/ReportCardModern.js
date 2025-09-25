import React from 'react';
import { schoolInfo, performanceScale, mockSubjectsByLevel } from '../mock/mockData';

const ReportCardModern = ({ student, period, grades = [] }) => {
  if (!student) return null;

  const getPerformanceLevel = (grade, student) => {
    if (!grade || !student) return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
    
    // Determinar qué escala usar basada en el grado del estudiante
    let scale;
    if (student.grade === '11°') {
      scale = performanceScale['grado_11'] || performanceScale['default'];
    } else {
      scale = performanceScale['default'];
    }
    
    if (!scale) return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
    
    for (const [performance, range] of Object.entries(scale)) {
      if (grade >= range.min && grade <= range.max) {
        return { level: performance, code: range.code };
      }
    }
    return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
  };

  const calculateAverage = () => {
    if (!grades || grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + (grade?.grade || 0), 0) / grades.length;
  };

  const average = calculateAverage();
  const performance = getPerformanceLevel(average, student);

  // Obtener la estructura de materias según el nivel del estudiante
  const getSubjectStructure = () => {
    if (!student || !student.level) return { areas: [], specialSections: [] };
    
    const levelData = mockSubjectsByLevel[student.level];
    return levelData || { areas: [], specialSections: [] };
  };

  const subjectStructure = getSubjectStructure();

  // Obtener calificación para una materia específica
  const getGradeForSubject = (subjectName) => {
    if (!grades || grades.length === 0) return null;
    return grades.find(g => g && g.subject === subjectName);
  };

  if (!schoolInfo) return null;

  return (
    <div className="bg-white p-6 text-sm shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Moderno */}
      <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
        <div className="flex justify-center items-center mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mr-4 shadow-lg">
            <span className="text-white font-bold text-lg">GADA</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold uppercase text-gray-800">{schoolInfo.name || 'GIMNASIO AMERICANO DEL ATLÁNTICO SEDE 2'}</h1>
            <p className="text-xs text-gray-600">{schoolInfo.levels?.preescolar || 'PREESCOLAR - BÁSICA PRIMARIA BÁSICA SECUNDARIA'}</p>
            <p className="text-xs text-gray-600">{schoolInfo.levels?.license || 'LICENCIA DE FUNCIONAMIENTO'}</p>
            <p className="text-xs text-blue-600 font-medium">{schoolInfo.levels?.dane || 'REGISTRO DANE'}</p>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <h2 className="text-lg font-bold text-blue-800">INFORME ACADÉMICO AÑO {schoolInfo.academicYear || 2025}</h2>
          <p className="text-sm text-blue-600">{period === 1 ? 'PRIMER' : period === 2 ? 'SEGUNDO' : period === 3 ? 'TERCER' : 'CUARTO'} PERÍODO</p>
        </div>
      </div>

      {/* Información del Estudiante */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">ESTUDIANTE:</span>
              <span className="text-gray-900 font-medium">{student.name?.toUpperCase() || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">GRADO:</span>
              <span className="text-gray-900">{student.grade || 'N/A'}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">NIVEL:</span>
              <span className="text-gray-900">{student.level?.toUpperCase() || 'N/A'}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">PERÍODO:</span>
              <span className="text-gray-900">{period || 1}°</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">AÑO:</span>
              <span className="text-gray-900">{student.academicYear || 2025}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">DOCUMENTO:</span>
              <span className="text-gray-900">{student.document || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Calificaciones */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-6 shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="border border-blue-500 p-3 text-left font-semibold">ÁREAS</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">ASIGNATURA</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">INT HORA</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">NOTA PERÍODO</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">ACUM</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">DEFINITIVA</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">DESEMPEÑO</th>
            </tr>
          </thead>
          <tbody>
            {subjectStructure.areas && subjectStructure.areas.map((area, areaIndex) => (
              area.subjects && area.subjects.map((subject, subjectIndex) => {
                const gradeData = getGradeForSubject(subject.name);
                const gradeValue = gradeData?.grade || 0;
                const gradePerformance = getPerformanceLevel(gradeValue, student);
                const isFirstInArea = subjectIndex === 0;
                const isEven = (areaIndex * 10 + subjectIndex) % 2 === 0;
                
                return (
                  <tr key={`${areaIndex}-${subjectIndex}`} className={isEven ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 p-2 font-medium text-gray-800">
                      {isFirstInArea ? area.area : ''}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-gray-700">
                      {subject.name}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-gray-600">
                      {subject.hours}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-medium text-blue-600">
                      {gradeValue.toFixed(1)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center text-gray-600">
                      {gradeValue.toFixed(1)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center font-bold text-gray-800">
                      {gradeValue.toFixed(1)}
                    </td>
                    <td className="border border-gray-300 p-2 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        gradePerformance.code === 'S' ? 'bg-green-100 text-green-800' :
                        gradePerformance.code === 'A' ? 'bg-blue-100 text-blue-800' :
                        gradePerformance.code === 'Bs' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {gradePerformance.code}
                      </span>
                    </td>
                  </tr>
                );
              })
            ))}
            
            {/* Convivencia Escolar */}
            <tr className="bg-gray-100">
              <td className="border border-gray-300 p-2 font-medium text-gray-800">CONVIVENCIA ESCOLAR</td>
              <td className="border border-gray-300 p-2 text-center text-gray-700">CONVIVENCIA</td>
              <td className="border border-gray-300 p-2 text-center text-gray-600">-</td>
              <td className="border border-gray-300 p-2 text-center font-medium text-blue-600">4.5</td>
              <td className="border border-gray-300 p-2 text-center text-gray-600">4.5</td>
              <td className="border border-gray-300 p-2 text-center font-bold text-gray-800">4.5</td>
              <td className="border border-gray-300 p-2 text-center">
                <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">A</span>
              </td>
            </tr>

            {/* Acompañamiento del Acudiente */}
            <tr className="bg-gray-100">
              <td className="border border-gray-300 p-2 font-medium text-gray-800">ACOMPAÑAMIENTO DEL ACUDIENTE</td>
              <td className="border border-gray-300 p-2 text-center text-gray-700">ACOMPAÑAMIENTO</td>
              <td className="border border-gray-300 p-2 text-center text-gray-600">-</td>
              <td className="border border-gray-300 p-2 text-center font-medium text-blue-600">4.0</td>
              <td className="border border-gray-300 p-2 text-center text-gray-600">4.0</td>
              <td className="border border-gray-300 p-2 text-center font-bold text-gray-800">4.0</td>
              <td className="border border-gray-300 p-2 text-center">
                <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">Bs</span>
              </td>
            </tr>
            
            {/* Fila de Promedio */}
            <tr className="bg-blue-100 border-t-2 border-blue-600">
              <td className="border border-gray-300 p-3 font-bold text-blue-800" colSpan="5">
                PROMEDIO GENERAL DEL PERÍODO
              </td>
              <td className="border border-gray-300 p-3 text-center font-bold text-blue-800 text-lg">
                {average.toFixed(1)}
              </td>
              <td className="border border-gray-300 p-3 text-center">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  performance.code === 'S' ? 'bg-green-100 text-green-800' :
                  performance.code === 'A' ? 'bg-blue-100 text-blue-800' :
                  performance.code === 'Bs' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {performance.code}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Escala Valorativa */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold text-sm mb-3 text-blue-800">ESCALA VALORATIVA:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(() => {
            const scale = student.grade === '11°' ? performanceScale['grado_11'] : performanceScale['default'];
            if (!scale) return null;
            
            return Object.entries(scale).map(([level, range]) => (
              <div key={level} className="bg-white p-2 rounded shadow-sm">
                <div className="text-xs font-semibold text-gray-800">
                  <span className="text-blue-600">{range.code}:</span> {level}
                </div>
                <div className="text-xs text-gray-600">{range.min} - {range.max}</div>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Observaciones */}
      <div className="mb-6">
        <h3 className="font-bold text-sm mb-2 text-gray-800">OBSERVACIONES:</h3>
        <div className="border border-gray-300 min-h-20 p-3 text-xs bg-gray-50 rounded">
          {average >= 4.8 ? "Felicitaciones por su excelente desempeño académico. Continue así." :
           average >= 4.1 ? "Buen desempeño académico. Puede mejorar aún más." :
           average >= 3.3 ? "Desempeño académico básico. Debe esforzarse más." :
           "Debe mejorar su rendimiento académico. Se recomienda apoyo adicional."}
        </div>
      </div>

      {/* Firmas */}
      <div className="grid grid-cols-2 gap-12 mt-12">
        <div className="text-center">
          <div className="border-t-2 border-gray-400 mt-16 pt-3">
            <p className="text-sm font-bold text-gray-800">RECTOR</p>
            <p className="text-xs text-gray-600">Representante Legal</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-gray-400 mt-16 pt-3">
            <p className="text-sm font-bold text-gray-800">DIRECTOR DE GRUPO</p>
            <p className="text-xs font-medium text-blue-600">{schoolInfo.coordinator || 'Pedro Hurtado'}</p>
            <p className="text-xs text-gray-600">{schoolInfo.position || 'Coordinador Académico'}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Este documento es válido con la firma y sello de la institución</p>
        <p className="text-xs text-gray-500">Generado el: {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}</p>
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <p className="text-xs font-medium text-blue-800">{schoolInfo.developer || 'Desarrollado por Pedro Hurtado'}</p>
          <p className="text-xs text-blue-600">{schoolInfo.copyright || 'Derechos reservados a Pedro Hurtado - Coordinador Académico'}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModern;