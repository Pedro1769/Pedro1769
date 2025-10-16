import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card.jsx';
import { Button } from '../../ui/button.jsx';
import { Input } from '../../ui/input.jsx';
import { Badge } from '../../ui/badge.jsx';
import { Label } from '../../ui/label.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select.jsx';
import { useToast } from '../../../hooks/use-toast';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Download,
  Info
} from 'lucide-react';

const CargaMasivaNotas = () => {
  const { toast } = useToast();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formatType, setFormatType] = useState('format1');
  const [academicYear, setAcademicYear] = useState('2024');
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        toast({
          title: 'Archivo inválido',
          description: 'Por favor selecciona un archivo Excel (.xlsx o .xls)',
          variant: 'destructive'
        });
        return;
      }
      setFile(selectedFile);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'Archivo requerido',
        description: 'Por favor selecciona un archivo Excel',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('gaa_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/bulk-grades/upload-consolidated?academic_year=${academicYear}&format_type=${formatType}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResults(data.results);
        toast({
          title: 'Carga exitosa',
          description: data.message
        });
      } else {
        throw new Error(data.detail || 'Error al cargar archivo');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cargar el archivo',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5" />
            <span>Carga Masiva de Notas</span>
          </CardTitle>
          <CardDescription>
            Sube un archivo Excel con las notas de todos los estudiantes
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Información de formatos */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className={`cursor-pointer transition-all ${formatType === 'format1' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFormatType('format1')}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Formato 1: Consolidado</CardTitle>
                <CardDescription className="mt-2">
                  Todos los estudiantes en una sola hoja
                </CardDescription>
              </div>
              {formatType === 'format1' && (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="font-semibold">Columnas requeridas:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Área</li>
                <li>Asignatura</li>
                <li>Periodo I, II, III, IV (verticales)</li>
                <li>Nombre (del estudiante)</li>
                <li>Grado</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className={`cursor-pointer transition-all ${formatType === 'format2' ? 'ring-2 ring-blue-500' : ''}`}
          onClick={() => setFormatType('format2')}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Formato 2: Individual</CardTitle>
                <CardDescription className="mt-2">
                  Una hoja por cada estudiante
                </CardDescription>
              </div>
              {formatType === 'format2' && (
                <CheckCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="font-semibold">Estructura:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Cada hoja = Boletín de un estudiante</li>
                <li>Nombre y grado del estudiante</li>
                <li>Tabla con: Asignatura, Periodo I, II, III, IV</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de carga */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Archivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="academic_year">Año Lectivo</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file">Archivo Excel</Label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>{file.name}</span>
                  <Badge variant="outline">{(file.size / 1024).toFixed(2)} KB</Badge>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-semibold mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Las notas existentes se actualizarán</li>
                  <li>Los nombres de estudiantes deben coincidir con la base de datos</li>
                  <li>Las notas deben estar entre 0.0 y 5.0</li>
                  <li>Formato seleccionado: <strong>{formatType === 'format1' ? 'Consolidado' : 'Individual'}</strong></li>
                </ul>
              </div>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? (
                <>
                  <Upload className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Notas
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados de la Carga</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold text-green-700">{results.success}</p>
                    <p className="text-sm text-green-600">Notas cargadas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-red-700">{results.errors}</p>
                    <p className="text-sm text-red-600">Errores</p>
                  </div>
                </div>
              </div>

              {results.details && results.details.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold mb-2">Detalles:</p>
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {results.details.map((detail, idx) => (
                      <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plantillas de ejemplo */}
      <Card>
        <CardHeader>
          <CardTitle>Plantillas de Ejemplo</CardTitle>
          <CardDescription>
            Descarga plantillas para guiarte en el formato correcto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Plantilla Formato 1
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Plantilla Formato 2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CargaMasivaNotas;
