import React from 'react';
import { schoolInfo, performanceScale } from '../mock/mockData';

const ReportCardModern = ({ student, period, grades, level = 'Básica Secundaria' }) => {
  if (!student) return null;

  const getPerformanceLevel = (grade, student) => {
    // Determinar qué escala usar basada en el grado del estudiante
    let scale;
    if (student.grade === '11°') {
      scale = performanceScale['grado_11'];
    } else {
      scale = performanceScale['default'];
    }
    
    for (const [performance, range] of Object.entries(scale)) {
      if (grade >= range.min && grade <= range.max) {
        return { level: performance, code: range.code };
      }
    }
    return { level: 'DESEMPEÑO BAJO', code: 'Bj' };
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
  };

  const average = calculateAverage();
  const performance = getPerformanceLevel(average, student.level);

  // Configuración específica por nivel educativo basada en las imágenes
  const getLevelConfig = () => {
    switch (student.level) {
      case 'Básica Primaria':
        return {
          gradeScale: '1.0 - 5.0',
          subjects: [
            'HUMANIDADES - ESPAÑOL',
            'HUMANIDADES - INGLÉS', 
            'MATEMÁTICAS',
            'CIENCIAS NATURALES',
            'CIENCIAS SOCIALES',
            'EDUCACIÓN ARTÍSTICA',
            'EDUCACIÓN FÍSICA',
            'TECNOLOGÍA',
            'ÉTICA Y RELIGIÓN'
          ],
          observationDefault: 'Obtuvo un buen rendimiento académico, continúa así practicando lectura y escritura.'
        };
      case 'Básica Secundaria':
        return {
          gradeScale: '1.0 - 10.0',
          subjects: [
            'HUMANIDADES - ESPAÑOL',
            'HUMANIDADES - INGLÉS',
            'MATEMÁTICAS',
            'GEOMETRÍA', 
            'CIENCIAS NATURALES - BIOLOGÍA',
            'CIENCIAS NATURALES - FÍSICA',
            'CIENCIAS NATURALES - QUÍMICA',
            'CIENCIAS SOCIALES',
            'GEOGRAFÍA',
            'EDUCACIÓN ARTÍSTICA',
            'EDUCACIÓN FÍSICA',
            'TECNOLOGÍA E INFORMÁTICA',
            'ÉTICA Y VALORES',
            'EDUCACIÓN RELIGIOSA'
          ],
          observationDefault: 'El estudiante debe mejorar el rendimiento académico.'
        };
      case 'Media Vocacional':
        return {
          gradeScale: '1.0 - 10.0',
          subjects: [
            'HUMANIDADES - ESPAÑOL',
            'HUMANIDADES - INGLÉS',
            'MATEMÁTICAS',
            'CIENCIAS NATURALES - FÍSICA',
            'CIENCIAS NATURALES - QUÍMICA', 
            'CIENCIAS NATURALES - BIOLOGÍA',
            'CIENCIAS SOCIALES',
            'FILOSOFÍA',
            'CÁTEDRA DE LA PAZ',
            'EMPRENDIMIENTO',
            'EDUCACIÓN FÍSICA',
            'ED. RELIGIOSA Y MORAL',
            'TECNOLOGÍA',
            'ED. ARTÍSTICA',
            'CONVIVENCIA ESCOLAR'
          ],
          observationDefault: 'El estudiante debe mejorar el rendimiento académico.'
        };
      default:
        return {
          gradeScale: '1.0 - 10.0',
          subjects: [],
          observationDefault: 'Continuar con el buen desempeño académico.'
        };
    }
  };

  const config = getLevelConfig();

  return (
    <div className="bg-white p-6 text-sm shadow-lg" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header Moderno */}
      <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
        <div className="flex justify-center items-center mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full flex items-center justify-center mr-4 shadow-lg">
            <span className="text-white font-bold text-lg">GADA</span>
          </div>
          <div className="text-left">
            <h1 className="text-xl font-bold uppercase text-gray-800">{schoolInfo.name}</h1>
            <p className="text-xs text-gray-600">{schoolInfo.levels.preescolar}</p>
            <p className="text-xs text-gray-600">{schoolInfo.levels.license}</p>
            <p className="text-xs text-blue-600 font-medium">{schoolInfo.levels.dane}</p>
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <h2 className="text-lg font-bold text-blue-800">INFORME ACADÉMICO AÑO {schoolInfo.academicYear}</h2>
          <p className="text-sm text-blue-600">{period === 1 ? 'PRIMER' : period === 2 ? 'SEGUNDO' : period === 3 ? 'TERCER' : 'CUARTO'} PERÍODO</p>
        </div>
      </div>

      {/* Información del Estudiante - Moderna */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">ESTUDIANTE:</span>
              <span className="text-gray-900 font-medium">{student.name.toUpperCase()}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">GRADO:</span>
              <span className="text-gray-900">{student.grade}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">NIVEL:</span>
              <span className="text-gray-900">{student.level.toUpperCase()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">PERÍODO:</span>
              <span className="text-gray-900">{period}°</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">AÑO:</span>
              <span className="text-gray-900">{student.academicYear}</span>
            </div>
            <div className="flex">
              <span className="font-semibold text-gray-700 w-24">DOCUMENTO:</span>
              <span className="text-gray-900">{student.document}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de Calificaciones - Moderna */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-6 shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <th className="border border-blue-500 p-3 text-left font-semibold">ÁREAS</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">ASIGNATURA</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">IH</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">NOTA POR PERÍODO</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">ACUM</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">DEFINITIVA</th>
              <th className="border border-blue-500 p-3 text-center font-semibold">DESEMPEÑO</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => {
              const gradePerformance = getPerformanceLevel(grade.grade, student.level);
              const isEven = index % 2 === 0;
              
              return (
                <tr key={index} className={isEven ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 p-2 font-medium text-gray-800">
                    {grade.subject.split(' - ')[0] || grade.subject}
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-gray-700">
                    {grade.subject.split(' - ')[1] || grade.subject}
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-gray-600">2</td>
                  <td className="border border-gray-300 p-2 text-center font-medium text-blue-600">
                    {grade.grade.toFixed(1)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center text-gray-600">
                    {grade.grade.toFixed(1)}
                  </td>
                  <td className="border border-gray-300 p-2 text-center font-bold text-gray-800">
                    {grade.grade.toFixed(1)}
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
            })}
            
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

      {/* Escala Valorativa - Moderna */}
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="font-bold text-sm mb-3 text-blue-800">ESCALA VALORATIVA:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(performanceScale[student.level] || performanceScale['Básica Secundaria']).map(([level, range]) => (
            <div key={level} className="bg-white p-2 rounded shadow-sm">
              <div className="text-xs font-semibold text-gray-800">
                <span className="text-blue-600">{range.code}:</span> {level}
              </div>
              <div className="text-xs text-gray-600">{range.min} - {range.max}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Observaciones - Moderna */}
      <div className="mb-6">
        <h3 className="font-bold text-sm mb-2 text-gray-800">OBSERVACIONES:</h3>
        <div className="border border-gray-300 min-h-20 p-3 text-xs bg-gray-50 rounded">
          {average >= 9.0 && "Felicitaciones por su excelente desempeño académico. Continue así."}
          {average >= 8.0 && average < 9.0 && "Buen desempeño académico. Puede mejorar aún más."}
          {average >= 6.0 && average < 8.0 && "Desempeño académico satisfactorio. Debe esforzarse más."}
          {average < 6.0 && config.observationDefault}
        </div>
      </div>

      {/* Firmas - Moderna */}
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
            <p className="text-xs font-medium text-blue-600">{schoolInfo.coordinator}</p>
            <p className="text-xs text-gray-600">{schoolInfo.position}</p>
          </div>
        </div>
      </div>

      {/* Footer - Moderna */}
      <div className="text-center mt-8 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600 mb-1">Este documento es válido con la firma y sello de la institución</p>
        <p className="text-xs text-gray-500">Generado el: {new Date().toLocaleDateString('es-CO')} a las {new Date().toLocaleTimeString('es-CO')}</p>
        <div className="mt-2 p-2 bg-blue-50 rounded">
          <p className="text-xs font-medium text-blue-800">{schoolInfo.developer}</p>
          <p className="text-xs text-blue-600">{schoolInfo.copyright}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportCardModern;