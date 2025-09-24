import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { 
  Upload, 
  Download, 
  Copy, 
  Trash2, 
  FileSpreadsheet, 
  Users,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

const StudentBulkManager = ({ students = [], onStudentsUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState('import');
  const [importData, setImportData] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState(null);

  // Template para importación
  const csvTemplate = `Nombre,Grado,Nivel,Documento,Fecha_Nacimiento,Padre_Email
Juan Pérez García,6°,Básica Secundaria,1234567890,2010-05-15,padre.juan@gmail.com
María López Rodríguez,3°,Básica Primaria,0987654321,2013-08-22,madre.maria@gmail.com`;

  const textTemplate = `Maicol Escorcia Oliveros 10° Media
Kelly Michell Florez Campuzano 10° Media
Mansol Gamarra Acosta 10° Media
Elkin David García Palencia 10° Media`;

  const loadTemplate = (format) => {
    if (format === 'csv') {
      setImportData(csvTemplate);
    } else {
      setImportData(textTemplate);
    }
  };

  // Procesar importación desde CSV/texto
  const processImportData = () => {
    setProcessing(true);
    try {
      const lines = importData.trim().split('\n').filter(line => line.trim());
      const newStudents = [];
      const errors = [];

      // Detectar si es formato CSV (con comas) o texto plano (con espacios)
      const isCSV = lines.some(line => line.includes(','));
      
      let startIndex = 0;
      let headers = [];

      if (isCSV) {
        // Formato CSV tradicional
        headers = lines[0].split(',').map(h => h.trim());
        startIndex = 1;
      }

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        let studentData = {};

        if (isCSV) {
          // Procesamiento CSV
          const values = line.split(',').map(v => v.trim());
          if (values.length !== headers.length) {
            errors.push(`Línea ${i + 1}: Número incorrecto de campos`);
            continue;
          }

          headers.forEach((header, index) => {
            switch (header.toLowerCase()) {
              case 'nombre':
                studentData.name = values[index];
                break;
              case 'grado':
                studentData.grade = values[index];
                break;
              case 'nivel':
                studentData.level = values[index];
                break;
              case 'documento':
                studentData.document = values[index];
                break;
              case 'fecha_nacimiento':
                studentData.birthDate = values[index];
                break;
              case 'padre_email':
                studentData.parentEmail = values[index];
                break;
              default:
                studentData[header] = values[index];
            }
          });
        } else {
          // Procesamiento de texto plano (como el formato mostrado en la imagen)
          const parts = line.split(/\s+/);
          if (parts.length < 3) {
            errors.push(`Línea ${i + 1}: Formato incorrecto. Debe incluir al menos nombre, grado y nivel`);
            continue;
          }

          // Extraer grado (buscar patrón como "10°", "11°", etc.)
          let gradeIndex = -1;
          let grade = '';
          
          for (let j = 0; j < parts.length; j++) {
            if (parts[j].match(/^\d{1,2}°?$/)) {
              grade = parts[j].replace('°', '') + '°';
              gradeIndex = j;
              break;
            }
          }

          if (gradeIndex === -1) {
            errors.push(`Línea ${i + 1}: No se pudo identificar el grado`);
            continue;
          }

          // Extraer nivel (buscar "Media", "Básica", etc.)
          let level = 'Básica Secundaria'; // Por defecto
          const levelKeywords = ['Media', 'Básica', 'Primaria', 'Secundaria'];
          for (const keyword of levelKeywords) {
            if (line.toLowerCase().includes(keyword.toLowerCase())) {
              if (keyword === 'Media') {
                level = 'Media Vocacional';
              } else if (keyword === 'Primaria') {
                level = 'Básica Primaria';
              }
              break;
            }
          }

          // Extraer nombre (todo lo que está antes del grado)
          const nameeParts = parts.slice(0, gradeIndex);
          const name = nameeParts.join(' ');

          if (!name.trim()) {
            errors.push(`Línea ${i + 1}: No se pudo extraer el nombre`);
            continue;
          }

          // Generar documento automáticamente si no se proporciona
          const document = `DOC${Date.now()}${Math.floor(Math.random() * 1000)}`;

          studentData = {
            name: name.trim(),
            grade: grade,
            level: level,
            document: document,
            birthDate: '',
            parentEmail: ''
          };
        }

        // Validaciones básicas
        if (!studentData.name || !studentData.grade) {
          errors.push(`Línea ${i + 1}: Faltan campos obligatorios (nombre, grado)`);
          continue;
        }

        // Asegurar que el documento exista
        if (!studentData.document) {
          studentData.document = `DOC${Date.now()}${Math.floor(Math.random() * 1000)}`;
        }

        studentData.id = Date.now() + Math.random();
        studentData.academicYear = 2025;
        newStudents.push(studentData);
      }

      setResults({
        success: newStudents.length,
        errors: errors,
        students: newStudents
      });

      if (newStudents.length > 0 && onStudentsUpdate) {
        onStudentsUpdate([...students, ...newStudents]);
      }
    } catch (error) {
      setResults({
        success: 0,
        errors: [`Error al procesar datos: ${error.message}`],
        students: []
      });
    }
    setProcessing(false);
  };

  // Exportar datos a CSV
  const exportToCSV = () => {
    const headers = ['Nombre', 'Grado', 'Nivel', 'Documento', 'Fecha_Nacimiento', 'Padre_Email'];
    const csvContent = [
      headers.join(','),
      ...students.map(student => [
        student.name,
        student.grade,
        student.level,
        student.document,
        student.birthDate || '',
        student.parentEmail || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `estudiantes_GADA_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Seleccionar/deseleccionar estudiantes para eliminación
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Eliminar estudiantes seleccionados
  const deleteSelectedStudents = () => {
    if (selectedStudents.length === 0) return;
    
    if (window.confirm(`¿Está seguro de eliminar ${selectedStudents.length} estudiante(s)?`)) {
      const updatedStudents = students.filter(student => !selectedStudents.includes(student.id));
      onStudentsUpdate(updatedStudents);
      setSelectedStudents([]);
      setResults({
        success: 0,
        errors: [],
        deleted: selectedStudents.length
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Gestión Masiva de Estudiantes
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="import">Importar</TabsTrigger>
              <TabsTrigger value="export">Exportar</TabsTrigger>
              <TabsTrigger value="paste">Pegar Datos</TabsTrigger>
              <TabsTrigger value="delete">Eliminar</TabsTrigger>
            </TabsList>

            {/* Importar */}
            <TabsContent value="import" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Formatos aceptados:</strong><br/>
                    • <strong>CSV:</strong> Nombre,Grado,Nivel,Documento,Fecha_Nacimiento,Padre_Email<br/>
                    • <strong>Texto:</strong> Nombre Apellido Grado° Nivel (ej: Juan Pérez 10° Media)
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="csvData">Datos para Importar</Label>
                  <Textarea
                    id="csvData"
                    placeholder="Pegue aquí los datos en formato CSV o texto plano..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                    className="mt-2"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={processImportData} disabled={processing || !importData.trim()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {processing ? 'Procesando...' : 'Importar Datos'}
                  </Button>
                  
                  <Button variant="outline" onClick={() => loadTemplate('text')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Plantilla Texto
                  </Button>

                  <Button variant="outline" onClick={() => loadTemplate('csv')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Plantilla CSV
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Exportar */}
            <TabsContent value="export" className="space-y-4">
              <div className="text-center space-y-4">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Exportar Lista de Estudiantes</h3>
                  <p className="text-gray-600 mb-4">
                    Se exportarán {students.length} estudiante(s) en formato CSV
                  </p>
                  
                  <Button onClick={exportToCSV} className="w-full sm:w-auto">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar CSV
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-semibold text-blue-900">Básica Primaria</h4>
                    <p className="text-blue-700">
                      {students.filter(s => s.level === 'Básica Primaria').length} estudiantes
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <h4 className="font-semibold text-green-900">Básica Secundaria</h4>
                    <p className="text-green-700">
                      {students.filter(s => s.level === 'Básica Secundaria').length} estudiantes
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <h4 className="font-semibold text-purple-900">Media Vocacional</h4>
                    <p className="text-purple-700">
                      {students.filter(s => s.level === 'Media Vocacional').length} estudiantes
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Pegar Datos */}
            <TabsContent value="paste" className="space-y-4">
              <Alert>
                <Copy className="h-4 w-4" />
                <AlertDescription>
                  <strong>Formatos flexibles:</strong><br/>
                  • Copie desde Excel/Sheets (automáticamente detecta el formato)<br/>
                  • Texto plano: "Nombre Apellido Grado° Nivel"<br/>
                  • CSV: "Nombre,Grado,Nivel,Documento"
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="pasteData">Datos desde Excel/Sheets o Texto Plano</Label>
                <Textarea
                  id="pasteData"
                  placeholder="Pegue aquí los datos copiados desde Excel, Google Sheets o como texto plano..."
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  rows={10}
                  className="mt-2"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={processImportData} disabled={processing || !importData.trim()}>
                  <Upload className="mr-2 h-4 w-4" />
                  {processing ? 'Procesando...' : 'Importar Datos Pegados'}
                </Button>
                
                <Button variant="outline" onClick={() => loadTemplate('text')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Ejemplo Texto
                </Button>
              </div>
            </TabsContent>

            {/* Eliminar */}
            <TabsContent value="delete" className="space-y-4">
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Seleccione los estudiantes que desea eliminar. Esta acción no se puede deshacer.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudents(students.map(s => s.id))}
                    >
                      Seleccionar Todos
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedStudents([])}
                    >
                      Deseleccionar Todos
                    </Button>
                  </div>
                  
                  {selectedStudents.length > 0 && (
                    <Button 
                      variant="destructive" 
                      onClick={deleteSelectedStudents}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar {selectedStudents.length} Estudiante(s)
                    </Button>
                  )}
                </div>

                <div className="border rounded-lg max-h-64 overflow-y-auto">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center p-3 border-b hover:bg-gray-50">
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={() => toggleStudentSelection(student.id)}
                        className="mr-3"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">{student.grade} - {student.level}</p>
                      </div>
                      <Badge variant="outline">{student.document}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Resultados */}
          {results && (
            <Alert className={`mt-4 ${results.errors.length > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
              {results.errors.length > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
              <AlertDescription>
                {results.success > 0 && (
                  <div className="text-green-700 mb-2">
                    ✓ {results.success} estudiante(s) procesado(s) exitosamente
                  </div>
                )}
                {results.deleted > 0 && (
                  <div className="text-blue-700 mb-2">
                    ✓ {results.deleted} estudiante(s) eliminado(s)
                  </div>
                )}
                {results.errors.length > 0 && (
                  <div className="text-red-700">
                    <strong>Errores encontrados:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {results.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentBulkManager;