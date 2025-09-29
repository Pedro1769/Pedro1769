import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { 
  Shield, 
  GraduationCap, 
  FileText, 
  Save, 
  AlertCircle,
  Settings,
  Users,
  Lock,
  Unlock
} from 'lucide-react';
import ApiService from '../services/apiService';

const StudentPermissionsManager = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Estados para permisos de calificaciones
  const [gradesEnabled, setGradesEnabled] = useState(false);
  const [enabledPeriods, setEnabledPeriods] = useState([]);
  
  // Estados para permisos de boletín
  const [bulletinDownloadEnabled, setBulletinDownloadEnabled] = useState(false);
  
  const availablePeriods = [
    { id: '1', name: 'Período 1' },
    { id: '2', name: 'Período 2' },
    { id: '3', name: 'Período 3' },
    { id: '4', name: 'Período 4' }
  ];

  useEffect(() => {
    loadCurrentSettings();
  }, []);

  const loadCurrentSettings = async () => {
    setLoading(true);
    try {
      // Cargar configuración de calificaciones
      const gradesConfig = await ApiService.getAdminConfig('student_grades_enabled');
      setGradesEnabled(gradesConfig.config_value || false);
      setEnabledPeriods(gradesConfig.enabled_periods || []);
      
      // Cargar configuración de boletín
      const bulletinConfig = await ApiService.getAdminConfig('student_bulletin_download_enabled');
      setBulletinDownloadEnabled(bulletinConfig.config_value || false);
      
      console.log('Configuraciones cargadas:', { gradesConfig, bulletinConfig });
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
      setError('Error al cargar las configuraciones actuales');
      // Usar valores por defecto
      setGradesEnabled(false);
      setEnabledPeriods([]);
      setBulletinDownloadEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodToggle = (periodId) => {
    setEnabledPeriods(prev => {
      if (prev.includes(periodId)) {
        return prev.filter(p => p !== periodId);
      } else {
        return [...prev, periodId];
      }
    });
  };

  const saveGradesPermissions = async () => {
    setSaving(true);
    try {
      const configData = {
        config_key: 'student_grades_enabled',
        config_value: gradesEnabled,
        enabled_periods: enabledPeriods,
        admin_id: user.id
      };
      
      await ApiService.createAdminConfig(configData);
      setMessage('✅ Permisos de calificaciones guardados correctamente');
      setError('');
    } catch (error) {
      console.error('Error guardando permisos de calificaciones:', error);
      setError('Error al guardar los permisos de calificaciones');
      setMessage('');
    } finally {
      setSaving(false);
    }
  };

  const saveBulletinPermissions = async () => {
    setSaving(true);
    try {
      const configData = {
        config_key: 'student_bulletin_download_enabled',
        config_value: bulletinDownloadEnabled,
        enabled_periods: [],
        admin_id: user.id
      };
      
      await ApiService.createAdminConfig(configData);
      setMessage('✅ Permisos de boletín guardados correctamente');
      setError('');
    } catch (error) {
      console.error('Error guardando permisos de boletín:', error);
      setError('Error al guardar los permisos de boletín');
      setMessage('');
    } finally {
      setSaving(false);
    }
  };

  const saveAllPermissions = async () => {
    setSaving(true);
    try {
      // Guardar configuración de calificaciones
      await ApiService.createAdminConfig({
        config_key: 'student_grades_enabled',
        config_value: gradesEnabled,
        enabled_periods: enabledPeriods,
        admin_id: user.id
      });

      // Guardar configuración de boletín
      await ApiService.createAdminConfig({
        config_key: 'student_bulletin_download_enabled',
        config_value: bulletinDownloadEnabled,
        enabled_periods: [],
        admin_id: user.id
      });

      setMessage('✅ Todas las configuraciones guardadas correctamente');
      setError('');
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
      setError('Error al guardar las configuraciones');
      setMessage('');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando configuraciones...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensajes de estado */}
      {message && (
        <Alert className="border-green-200 bg-green-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-green-700">{message}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Control de Calificaciones por Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-blue-600" />
            Control de Calificaciones para Estudiantes
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gestiona qué períodos de calificaciones pueden ver los estudiantes en sus paneles
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Switch principal */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Habilitar visualización de calificaciones</Label>
              <p className="text-sm text-gray-600 mt-1">
                Permite a los estudiantes ver sus calificaciones en el panel
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {gradesEnabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <Unlock className="h-3 w-3 mr-1" />
                  Habilitado
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Deshabilitado
                </Badge>
              )}
              <Switch
                checked={gradesEnabled}
                onCheckedChange={setGradesEnabled}
              />
            </div>
          </div>

          {/* Selección de períodos */}
          {gradesEnabled && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-base font-medium mb-3 block">Períodos habilitados:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availablePeriods.map(period => (
                  <div key={period.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`period-${period.id}`}
                      checked={enabledPeriods.includes(period.id)}
                      onCheckedChange={() => handlePeriodToggle(period.id)}
                    />
                    <Label 
                      htmlFor={`period-${period.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {period.name}
                    </Label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-blue-700 mt-3">
                Solo los períodos seleccionados serán visibles para los estudiantes
              </p>
            </div>
          )}

          <Button 
            onClick={saveGradesPermissions} 
            disabled={saving}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración de Calificaciones'}
          </Button>
        </CardContent>
      </Card>

      {/* Control de Descarga de Boletín */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-purple-600" />
            Control de Descarga de Boletín
          </CardTitle>
          <p className="text-sm text-gray-600">
            Controla si los estudiantes pueden descargar sus boletines académicos
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label className="text-base font-medium">Permitir descarga de boletín</Label>
              <p className="text-sm text-gray-600 mt-1">
                Los estudiantes podrán descargar sus boletines en formato PDF
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {bulletinDownloadEnabled ? (
                <Badge className="bg-green-100 text-green-800">
                  <Unlock className="h-3 w-3 mr-1" />
                  Permitido
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </Badge>
              )}
              <Switch
                checked={bulletinDownloadEnabled}
                onCheckedChange={setBulletinDownloadEnabled}
              />
            </div>
          </div>

          <Button 
            onClick={saveBulletinPermissions} 
            disabled={saving}
            className="w-full"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar Configuración de Boletín'}
          </Button>
        </CardContent>
      </Card>

      {/* Botón para guardar todo */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Guardar Todas las Configuraciones</h3>
          <p className="text-sm text-gray-600 mb-4">
            Aplica todos los cambios de permisos para estudiantes de una vez
          </p>
          <Button 
            onClick={saveAllPermissions} 
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            size="lg"
          >
            <Settings className="mr-2 h-5 w-5" />
            {saving ? 'Guardando Todas...' : 'Guardar Todas las Configuraciones'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPermissionsManager;