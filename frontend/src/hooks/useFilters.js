import { useState, useEffect } from 'react';

// Hook personalizado para manejar filtros dinámicos en los dashboards
export const useFilters = (initialPeriod = '1', initialGrade = 'all') => {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [filteredData, setFilteredData] = useState({});

  // Función para filtrar datos por período y grado
  const applyFilters = (data, filters = {}) => {
    if (!data || !Array.isArray(data)) return [];

    let filtered = data;

    // Filtrar por período si existe el campo
    if (selectedPeriod && selectedPeriod !== 'all' && filters.filterByPeriod !== false) {
      filtered = filtered.filter(item => {
        // Buscar en diferentes campos posibles para período
        return item.period === selectedPeriod || 
               item.periodo === selectedPeriod ||
               item.selectedPeriod === selectedPeriod ||
               (item.period && item.period.toString() === selectedPeriod.toString());
      });
    }

    // Filtrar por grado si existe el campo
    if (selectedGrade && selectedGrade !== 'all' && filters.filterByGrade !== false) {
      filtered = filtered.filter(item => {
        // Buscar en diferentes campos posibles para grado
        return item.grade === selectedGrade || 
               item.grado === selectedGrade ||
               item.selectedGrade === selectedGrade ||
               item.student_grade === selectedGrade;
      });
    }

    return filtered;
  };

  // Función para filtrar estudiantes específicamente
  const filterStudents = (students) => {
    if (!students || !Array.isArray(students)) return [];

    let filtered = students;

    // Filtrar por grado
    if (selectedGrade && selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade === selectedGrade);
    }

    return filtered;
  };

  // Función para filtrar calificaciones por período y/o grado
  const filterGrades = (grades) => {
    return applyFilters(grades);
  };

  // Función para filtrar observaciones por período y/o grado
  const filterObservations = (observations) => {
    return applyFilters(observations);
  };

  // Función para filtrar notas de convivencia
  const filterConvivenciaNotes = (notes) => {
    return applyFilters(notes);
  };

  // Función para resetear filtros
  const resetFilters = () => {
    setSelectedPeriod(initialPeriod);
    setSelectedGrade(initialGrade);
  };

  // Función para obtener estadísticas filtradas
  const getFilteredStats = (data) => {
    const filtered = applyFilters(data);
    return {
      total: filtered.length,
      byGrade: filtered.reduce((acc, item) => {
        const grade = item.grade || item.grado || 'Sin grado';
        acc[grade] = (acc[grade] || 0) + 1;
        return acc;
      }, {}),
      byPeriod: filtered.reduce((acc, item) => {
        const period = item.period || item.periodo || 'Sin período';
        acc[period] = (acc[period] || 0) + 1;
        return acc;
      }, {})
    };
  };

  return {
    selectedPeriod,
    setSelectedPeriod,
    selectedGrade,
    setSelectedGrade,
    applyFilters,
    filterStudents,
    filterGrades,
    filterObservations,
    filterConvivenciaNotes,
    resetFilters,
    getFilteredStats,
    // Funciones de utilidad
    isGradeSelected: selectedGrade && selectedGrade !== 'all',
    isPeriodSelected: selectedPeriod && selectedPeriod !== 'all',
    hasActiveFilters: (selectedGrade && selectedGrade !== 'all') || (selectedPeriod && selectedPeriod !== 'all')
  };
};

export default useFilters;