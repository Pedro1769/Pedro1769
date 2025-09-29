import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Filter, X, RotateCcw } from 'lucide-react';

const FilterControls = ({ 
  selectedPeriod, 
  setSelectedPeriod, 
  selectedGrade, 
  setSelectedGrade,
  availableGrades = [],
  availablePeriods = [],
  showPeriodFilter = true,
  showGradeFilter = true,
  onReset,
  filteredCount,
  totalCount,
  className = ""
}) => {
  // Períodos por defecto si no se proporcionan
  const defaultPeriods = [
    { id: '1', name: 'Período 1' },
    { id: '2', name: 'Período 2' },
    { id: '3', name: 'Período 3' },
    { id: '4', name: 'Período 4' }
  ];

  const periods = availablePeriods.length > 0 ? availablePeriods : defaultPeriods;
  
  const hasActiveFilters = (selectedGrade && selectedGrade !== 'all') || (selectedPeriod && selectedPeriod !== 'all');

  return (
    <div className={`bg-gray-50 p-4 rounded-lg border ${className}`}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center text-sm font-medium text-gray-700">
          <Filter className="h-4 w-4 mr-2" />
          Filtros:
        </div>

        {showPeriodFilter && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">Período:</Label>
            <Select value={selectedPeriod || 'all'} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {periods.map(period => (
                  <SelectItem key={period.id} value={period.id.toString()}>
                    {period.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {showGradeFilter && (
          <div className="flex items-center gap-2">
            <Label className="text-sm">Grado:</Label>
            <Select value={selectedGrade || 'all'} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {availableGrades.map(grade => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {hasActiveFilters && onReset && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Limpiar
          </Button>
        )}

        {/* Contador de resultados */}
        {filteredCount !== undefined && totalCount !== undefined && (
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant={hasActiveFilters ? "default" : "secondary"}>
              {hasActiveFilters ? `${filteredCount} de ${totalCount} registros` : `${totalCount} registros`}
            </Badge>
          </div>
        )}
      </div>

      {/* Indicadores de filtros activos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs text-gray-600">Filtros activos:</span>
          {selectedPeriod && selectedPeriod !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Período: {periods.find(p => p.id.toString() === selectedPeriod)?.name || selectedPeriod}
            </Badge>
          )}
          {selectedGrade && selectedGrade !== 'all' && (
            <Badge variant="outline" className="text-xs">
              Grado: {selectedGrade}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;