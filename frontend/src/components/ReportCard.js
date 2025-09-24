import React from 'react';
import { schoolInfo, performanceScale } from '../mock/mockData';

const ReportCardComponent = ({ student, period, grades }) => {
  if (!student) return null;

  const getPerformanceLevel = (grade, level) => {
    const scale = performanceScale[level] || performanceScale['Básica Secundaria'];
    
    for (const [performance, range] of Object.entries(scale)) {
      if (grade >= range.min && grade <= range.max) {
        return { level: performance, code: range.code };
      }
    }
    return { level: 'Bajo', code: 'Bj' };
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    return grades.reduce((sum, grade) => sum + grade.grade, 0) / grades.length;
  };

  const average = calculateAverage();
  const performance = getPerformanceLevel(average, student.level);

  return (
    <div className="bg-white p-8 text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex justify-center items-center mb-2">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mr-4">
            <span className="text-white font-bold text-sm">GADA</span>
          </div>
          <div>
            <h1 className="text-lg font-bold uppercase">{schoolInfo.name}</h1>
            <p className="text-xs">{schoolInfo.levels.preescolar}</p>
            <p className="text-xs">{schoolInfo.levels.license}</p>
            <p className="text-xs">{schoolInfo.levels.dane}</p>
          </div>
        </div>
        <h2 className="text-base font-bold mt-2">INFORME ACADÉMICO AÑO {schoolInfo.academicYear}</h2>
      </div>

      {/* Student Information */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <p><strong>ESTUDIANTE:</strong> {student.name.toUpperCase()}</p>
            <p><strong>GRADO:</strong> {student.grade}</p>
            <p><strong>NIVEL:</strong> {student.level.toUpperCase()}</p>
          </div>
          <div>
            <p><strong>PERÍODO:</strong> {period}°</p>
            <p><strong>AÑO:</strong> {student.academicYear}</p>
            <p><strong>DOCUMENTO:</strong> {student.document}</p>
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="border border-gray-800 mb-6">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-800 p-1 text-left">ÁREAS</th>
              <th className="border border-gray-800 p-1 text-center">ASIGNATURA</th>
              <th className="border border-gray-800 p-1 text-center">IH</th>
              <th className="border border-gray-800 p-1 text-center">ACUM</th>
              <th className="border border-gray-800 p-1 text-center">DEFINITIVA</th>
              <th className="border border-gray-800 p-1 text-center">DESEMPEÑO</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade, index) => {
              const gradePerformance = getPerformanceLevel(grade.grade, student.level);
              return (
                <tr key={index}>
                  <td className="border border-gray-800 p-1 font-semibold">
                    {grade.subject.split(' - ')[0] || grade.subject}
                  </td>
                  <td className="border border-gray-800 p-1 text-center">
                    {grade.subject.split(' - ')[1] || grade.subject}
                  </td>
                  <td className="border border-gray-800 p-1 text-center">2</td>
                  <td className="border border-gray-800 p-1 text-center">{grade.grade.toFixed(1)}</td>
                  <td className="border border-gray-800 p-1 text-center font-bold">{grade.grade.toFixed(1)}</td>
                  <td className="border border-gray-800 p-1 text-center">{gradePerformance.code}</td>
                </tr>
              );
            })}
            
            {/* Average Row */}
            <tr className="bg-gray-50">
              <td className="border border-gray-800 p-1 font-bold" colSpan="4">
                PROMEDIO GENERAL
              </td>
              <td className="border border-gray-800 p-1 text-center font-bold">
                {average.toFixed(1)}
              </td>
              <td className="border border-gray-800 p-1 text-center font-bold">
                {performance.code}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Performance Scale */}
      <div className="mb-6">
        <h3 className="font-bold text-xs mb-2">ESCALA VALORATIVA:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            {Object.entries(performanceScale[student.level] || performanceScale['Básica Secundaria']).map(([level, range]) => (
              <div key={level} className="text-xs flex justify-between">
                <span><strong>{range.code}:</strong> {level}</span>
                <span>{range.min} a {range.max}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Observations */}
      <div className="mb-6">
        <h3 className="font-bold text-xs mb-2">OBSERVACIONES:</h3>
        <div className="border border-gray-800 min-h-16 p-2 text-xs">
          {average >= 9.0 && "Felicitaciones por su excelente desempeño académico. Continue así."}
          {average >= 8.0 && average < 9.0 && "Buen desempeño académico. Puede mejorar aún más."}
          {average >= 6.0 && average < 8.0 && "Desempeño académico satisfactorio. Debe esforzarse más."}
          {average < 6.0 && "Debe mejorar su rendimiento académico. Se recomienda apoyo adicional."}
        </div>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="text-center">
          <div className="border-t border-gray-800 mt-16 pt-2">
            <p className="text-xs font-bold">RECTOR</p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t border-gray-800 mt-16 pt-2">
            <p className="text-xs font-bold">DIRECTOR DE GRUPO</p>
            <p className="text-xs">{schoolInfo.coordinator}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-6 text-xs text-gray-600">
        <p>Este documento es válido con la firma y sello de la institución</p>
        <p>Generado el: {new Date().toLocaleDateString('es-CO')}</p>
        <p className="mt-2 font-semibold">{schoolInfo.developer}</p>
      </div>
    </div>
  );
};

export default ReportCardComponent;