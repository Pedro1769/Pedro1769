import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { 
  Calendar, 
  Clock, 
  Lock, 
  Unlock, 
  Edit, 
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const PeriodManager = ({ periods = [], onPeriodsUpdate }) => {
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [periodData, setPeriodData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    gradeEntryStart: '',
    gradeEntryEnd: '',
    isActive: false,
    isGradeEntryOpen: false
  });

  const handleEditPeriod = (period) => {
    setEditingPeriod(period.id);
    setPeriodData({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      gradeEntryStart: period.gradeEntryStart || '',
      gradeEntryEnd: period.gradeEntryEnd || '',
      isActive: period.isActive || false,
      isGradeEntryOpen: period.isGradeEntryOpen || false
    });
  };

  const handleSavePeriod = () => {
    if (!periodData.name || !periodData.startDate || !periodData.endDate) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const updatedPeriods = periods.map(period => 
      period.id === editingPeriod 
        ? { ...period, ...periodData }
        : period
    );

    onPeriodsUpdate(updatedPeriods);
    setEditingPeriod(null);
    setPeriodData({
      name: '',
      startDate: '',
      endDate: '',
      gradeEntryStart: '',
      gradeEntryEnd: '',
      isActive: false,
      isGradeEntryOpen: false
    });
  };

  const toggleGradeEntry = (periodId, isOpen) => {
    const updatedPeriods = periods.map(period => 
      period.id === periodId 
        ? { ...period, isGradeEntryOpen: isOpen }
        : period
    );
    onPeriodsUpdate(updatedPeriods);
  };

  const toggleActivePeriod = (periodId, isActive) => {
    const updatedPeriods = periods.map(period => 
      period.id === periodId 
        ? { ...period, isActive }
        : { ...period, isActive: false } // Solo un período puede estar activo
    );
    onPeriodsUpdate(updatedPeriods);
  };

  const getStatusColor = (period) => {
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    if (now < start) return 'bg-blue-100 text-blue-800';
    if (now > end) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (period) => {
    const now = new Date();
    const start = new Date(period.startDate);
    const end = new Date(period.endDate);
    
    if (now < start) return 'Próximo';
    if (now > end) return 'Finalizado';
    return 'En Curso';
  };

  const isGradeEntryAllowed = (period) => {
    if (!period.isGradeEntryOpen) return false;
    
    const now = new Date();
    if (period.gradeEntryStart && period.gradeEntryEnd) {
      const entryStart = new Date(period.gradeEntryStart);
      const entryEnd = new Date(period.gradeEntryEnd);
      return now >= entryStart && now <= entryEnd;
    }
    
    return true;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Gestión de Períodos Académicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Configure los períodos académicos y controle las fechas de asignación de notas. 
              Solo un período puede estar activo a la vez.
            </AlertDescription>
          </Alert>

          <div className="grid gap-6">
            {periods.map((period) => (
              <Card key={period.id} className={`border-2 ${period.isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                <CardContent className="p-6">
                  {editingPeriod === period.id ? (
                    // Modo Edición
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="periodName">Nombre del Período</Label>
                          <Input
                            id="periodName"
                            value={periodData.name}
                            onChange={(e) => setPeriodData({ ...periodData, name: e.target.value })}
                            placeholder="Ej: Primer Período"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={periodData.isActive}
                            onCheckedChange={(checked) => setPeriodData({ ...periodData, isActive: checked })}
                          />
                          <Label>Período Activo</Label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="startDate">Fecha de Inicio</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={periodData.startDate}
                            onChange={(e) => setPeriodData({ ...periodData, startDate: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="endDate">Fecha de Fin</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={periodData.endDate}
                            onChange={(e) => setPeriodData({ ...periodData, endDate: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3 flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Control de Asignación de Notas
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={periodData.isGradeEntryOpen}
                              onCheckedChange={(checked) => setPeriodData({ ...periodData, isGradeEntryOpen: checked })}
                            />
                            <Label>Permitir Asignación</Label>
                          </div>
                          
                          <div>
                            <Label htmlFor="gradeEntryStart">Inicio Asignación</Label>
                            <Input
                              id="gradeEntryStart"
                              type="datetime-local"
                              value={periodData.gradeEntryStart}
                              onChange={(e) => setPeriodData({ ...periodData, gradeEntryStart: e.target.value })}
                              disabled={!periodData.isGradeEntryOpen}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="gradeEntryEnd">Fin Asignación</Label>
                            <Input
                              id="gradeEntryEnd"
                              type="datetime-local"
                              value={periodData.gradeEntryEnd}
                              onChange={(e) => setPeriodData({ ...periodData, gradeEntryEnd: e.target.value })}
                              disabled={!periodData.isGradeEntryOpen}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button variant="outline" onClick={() => setEditingPeriod(null)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleSavePeriod}>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar Cambios
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Modo Vista
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold flex items-center">
                            {period.name}
                            {period.isActive && (
                              <Badge className="ml-2 bg-blue-600">Activo</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {new Date(period.startDate).toLocaleDateString('es-CO')} - {' '}
                            {new Date(period.endDate).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(period)}>
                            {getStatusText(period)}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPeriod(period)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Estado del Período:</span>
                            <Switch
                              checked={period.isActive}
                              onCheckedChange={(checked) => toggleActivePeriod(period.id, checked)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Asignación de Notas:</span>
                            <div className="flex items-center space-x-2">
                              {isGradeEntryAllowed(period) ? (
                                <>
                                  <Unlock className="h-4 w-4 text-green-600" />
                                  <span className="text-green-600 font-medium">Abierta</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="h-4 w-4 text-red-600" />
                                  <span className="text-red-600 font-medium">Cerrada</span>
                                </>
                              )}
                              <Switch
                                checked={period.isGradeEntryOpen}
                                onCheckedChange={(checked) => toggleGradeEntry(period.id, checked)}
                              />
                            </div>
                          </div>
                          
                          {period.gradeEntryStart && period.gradeEntryEnd && (
                            <p className="text-xs text-gray-600">
                              Ventana: {new Date(period.gradeEntryStart).toLocaleString('es-CO')} - {' '}
                              {new Date(period.gradeEntryEnd).toLocaleString('es-CO')}
                            </p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          {isGradeEntryAllowed(period) && (
                            <Alert className="border-green-200 bg-green-50 p-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <AlertDescription className="text-xs text-green-700">
                                Los profesores pueden asignar notas
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PeriodManager;