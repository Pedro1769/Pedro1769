import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { studentService, adminService } from '../../services/api';
import { useToast } from '../../hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  Download, 
  CheckCircle,
  AlertCircle,
  Users
} from 'lucide-react';

const BulkStudentUpload = ({ onClose }) => {
  const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual', 'paste', 'file'
  const [students, setStudents] = useState([]);
  const [csvText, setCsvText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const { toast } = useToast();

  const grades = ['Transición', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
  const levels = {
    'Transición': 'PREESCOLAR',
    '0°': 'PREESCOLAR',
    '1°': 'BÁSICA PRIMARIA', '2°': 'BÁSICA PRIMARIA', '3°': 'BÁSICA PRIMARIA', '4°': 'BÁSICA PRIMARIA', '5°': 'BÁSICA PRIMARIA',
    '6°': 'BÁSICA SECUNDARIA', '7°': 'BÁSICA SECUNDARIA', '8°': 'BÁSICA SECUNDARIA', '9°': 'BÁSICA SECUNDARIA',
    '10°': 'MEDIA VOCACIONAL', '11°': 'MEDIA VOCACIONAL'
  };

  const addEmptyStudent = () => {
    setStudents([...students, {
      id: Date.now(),
      name: '',
      grade: '',
      level: '',
      document_number: '',
      teacher_id: null,
      parent_id: null
    }]);
  };

  const updateStudent = (id, field, value) => {
    setStudents(students.map(student => {
      if (student.id === id) {
        const updated = { ...student, [field]: value };
        // Auto-seleccionar nivel basado en grado
        if (field === 'grade' && levels[value]) {
          updated.level = levels[value];
        }
        return updated;
      }
      return student;
    }));
  };

  const removeStudent = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const parseCsvText = () => {
    if (!csvText.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese los datos",
        variant: "destructive",
      });
      return;
    }

    const lines = csvText.trim().split('\n');
    const parsedStudents = [];
    
    // Palabras a ignorar que no son nombres
    const ignoreWords = ['asignar', 'pendiente', 'sin asignar', 'n/a', 'na', 'documento'];

    lines.forEach((line, index) => {
      if (line.trim()) {
        // Ignorar SOLO si la primera línea contiene "Nombre completo" y "Grado" y "Documento"
        if (index === 0) {
          const lowerLine = line.toLowerCase();
          if (lowerLine.includes('nombre completo') && lowerLine.includes('grado') && lowerLine.includes('documento')) {
            console.log('Saltando línea de encabezado:', line);
            return; // Skip header line
          }
        }

        // Detectar automáticamente el separador (coma, punto y coma, tab, barra vertical)
        let columns = [];
        const separators = [',', ';', '\t', '|', ' '];
        
        for (let sep of separators) {
          const testColumns = line.split(sep).map(col => col.trim()).filter(col => col);
          if (testColumns.length >= columns.length) {
            columns = testColumns;
          }
        }

        // Si no hay separadores, tratar toda la línea como nombre
        if (columns.length === 0) {
          columns = [line.trim()];
        }

        // Extraer información del estudiante de manera flexible
        let name = '';
        let grade = '';
        let document = '';

        // Buscar el nombre - debe ser el primer campo que no sea grado ni "Asignar"
        for (let col of columns) {
          const colLower = col.toLowerCase();
          
          // Ignorar si es un grado válido
          if (grades.includes(col)) {
            continue;
          }
          
          // Ignorar si es solo "Asignar" o similar
          if (colLower === 'asignar' || colLower === 'pendiente' || colLower === 'documento') {
            continue;
          }
          
          // Ignorar si es solo números (probablemente documento)
          if (/^\d+$/.test(col)) {
            continue;
          }
          
          // Si tiene al menos 3 caracteres y contiene letras, es un nombre
          if (col.length >= 3 && /[a-zA-ZáéíóúñÁÉÍÓÚÑ]/.test(col)) {
            name = col;
            break;
          }
        }

        // Buscar el grado en cualquier posición
        for (let col of columns) {
          const trimmedCol = col.trim();
          
          // Log para debugging en las primeras 3 líneas
          if (index < 3) {
            console.log(`Línea ${index + 1}, Columna: "${col}" (trimmed: "${trimmedCol}"), ¿Es grado?: ${grades.includes(trimmedCol)}`);
          }
          
          if (grades.includes(trimmedCol)) {
            grade = trimmedCol;
            break;
          }
        }

        // Si no encuentra grado, intentar detectarlo por patrones
        if (!grade) {
          for (let col of columns) {
            // Buscar patrones como "0°", "1°", "2do", "primero", "segundo", etc.
            const normalized = col.toLowerCase().replace(/[°º]/, '').trim();
            if (normalized.match(/^(0|transicion|transición|preescolar|kinder)$/)) grade = '0°';
            else if (normalized.match(/^(1|primero|1ro|1er)$/)) grade = '1°';
            else if (normalized.match(/^(2|segundo|2do)$/)) grade = '2°';
            else if (normalized.match(/^(3|tercero|3ro|3er)$/)) grade = '3°';
            else if (normalized.match(/^(4|cuarto|4to)$/)) grade = '4°';
            else if (normalized.match(/^(5|quinto|5to)$/)) grade = '5°';
            else if (normalized.match(/^(6|sexto|6to)$/)) grade = '6°';
            else if (normalized.match(/^(7|septimo|séptimo|7mo)$/)) grade = '7°';
            else if (normalized.match(/^(8|octavo|8vo)$/)) grade = '8°';
            else if (normalized.match(/^(9|noveno|9no)$/)) grade = '9°';
            else if (normalized.match(/^(10|decimo|décimo)$/)) grade = '10°';
            else if (normalized.match(/^(11|once|undecimo|undécimo)$/)) grade = '11°';
            
            if (grade) break;
          }
        }

        // Buscar documento (números) - ignorar "Asignar" y palabras similares
        for (let col of columns) {
          const colLower = col.toLowerCase();
          const isIgnoreWord = ignoreWords.some(word => colLower === word || colLower.includes(word));
          
          if (!isIgnoreWord && /^\d{6,}$/.test(col.replace(/[-.\s]/g, ''))) {
            document = col;
            break;
          }
        }

        // Si tenemos al menos un nombre, crear el estudiante
        if (name) {
          // Si no hay grado especificado, usar un grado por defecto
          if (!grade) {
            console.warn(`Línea ${index + 1}: Grado no detectado, usando 1° por defecto. Nombre: ${name}`);
            grade = '1°'; // Grado por defecto
          }

          const student = {
            id: Date.now() + index,
            name: name.toUpperCase(),
            grade: grade,
            level: levels[grade] || 'BÁSICA PRIMARIA',
            document_number: document || '',
            teacher_id: null,
            parent_id: null
          };
          
          parsedStudents.push(student);
          
          // Log para debugging
          if (index < 5) {
            console.log(`Estudiante ${index + 1} procesado:`, student);
          }
        } else {
          console.warn(`Línea ${index + 1}: No se pudo extraer nombre. Línea: "${line.substring(0, 50)}..."`);
        }
      }
    });

    if (parsedStudents.length === 0) {
      toast({
        title: "Sin datos válidos",
        description: "No se pudo extraer información de estudiantes. Verifica que tengas al menos nombres en los datos.",
        variant: "destructive",
      });
      return;
    }

    // Contar estudiantes por grado para mostrar distribución
    const gradeCount = {};
    parsedStudents.forEach(student => {
      gradeCount[student.grade] = (gradeCount[student.grade] || 0) + 1;
    });
    
    const gradeDistribution = Object.entries(gradeCount)
      .sort((a, b) => {
        const orderA = grades.indexOf(a[0]);
        const orderB = grades.indexOf(b[0]);
        return orderA - orderB;
      })
      .map(([grade, count]) => `${grade}: ${count}`)
      .join(', ');

    console.log('Distribución por grado:', gradeDistribution);

    // Cargar TODOS los estudiantes sin eliminar duplicados
    setStudents(parsedStudents);
    
    toast({
      title: "Datos Procesados Exitosamente",
      description: `Se procesaron ${parsedStudents.length} estudiantes. Distribución: ${gradeDistribution}`,
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let content = e.target.result;
        
        // Si es un archivo Excel, intentar convertirlo a texto simple
        if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          toast({
            title: "Archivo Excel detectado",
            description: "Por favor, copia y pega los datos desde Excel en lugar de subir el archivo directamente, o guarda como CSV.",
            variant: "destructive",
          });
          return;
        }
        
        setCsvText(content);
        toast({
          title: "Archivo cargado",
          description: `Archivo ${file.name} cargado. Haz clic en "Procesar Datos" para continuar.`,
        });
      } catch (error) {
        toast({
          title: "Error al leer archivo",
          description: "No se pudo leer el contenido del archivo. Intenta con un archivo de texto o CSV.",
          variant: "destructive",
        });
      }
    };
    
    reader.readAsText(file, 'UTF-8');
  };

  const validateStudents = () => {
    const errors = [];

    students.forEach((student, index) => {
      if (!student.name.trim()) {
        errors.push(`Fila ${index + 1}: Nombre requerido`);
      }
      if (!student.grade) {
        errors.push(`Fila ${index + 1}: Grado requerido`);
      }
      if (!student.level) {
        errors.push(`Fila ${index + 1}: Nivel requerido`);
      }
    });

    return errors; // Solo errores críticos, sin validación de duplicados
  };

  const removeDuplicates = () => {
    const uniqueStudents = [];
    const seen = new Set();
    
    students.forEach(student => {
      const key = student.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueStudents.push(student);
      }
    });
    
    const removedCount = students.length - uniqueStudents.length;
    setStudents(uniqueStudents);
    
    if (removedCount > 0) {
      toast({
        title: "Duplicados eliminados",
        description: `Se eliminaron ${removedCount} estudiantes duplicados. Quedan ${uniqueStudents.length} estudiantes únicos.`,
      });
    } else {
      toast({
        title: "Sin duplicados",
        description: "No se encontraron duplicados para eliminar.",
      });
    }
  };

  const handleBulkUpload = async () => {
    if (students.length === 0) {
      toast({
        title: "Error",
        description: "No hay estudiantes para cargar",
        variant: "destructive",
      });
      return;
    }

    const validationErrors = validateStudents();
    if (validationErrors.length > 0) {
      toast({
        title: "Errores de validación",
        description: validationErrors.join('\n'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const studentsToCreate = students.map(student => ({
        name: student.name.toUpperCase(),
        grade: student.grade,
        level: student.level,
        document_number: student.document_number || null,
        teacher_id: student.teacher_id || null,
        parent_id: student.parent_id || null
      }));

      const result = await studentService.createBulkStudents(studentsToCreate);
      
      setResults({
        success: true,
        created: result.length,
        total: students.length
      });

      toast({
        title: "Carga exitosa",
        description: `Se crearon ${result.length} estudiantes exitosamente`,
      });

      // Limpiar formulario y cerrar modal después de 3 segundos para que el usuario vea el resultado
      setTimeout(() => {
        setStudents([]);
        setCsvText('');
        setResults(null);
        if (onClose) {
          onClose(); // Cerrar modal y recargar datos en el dashboard
        }
      }, 3000);

    } catch (error) {
      const message = error.response?.data?.detail || 'Error al crear estudiantes';
      setResults({
        success: false,
        error: message
      });

      toast({
        title: "Error en carga masiva",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `# PLANTILLA FLEXIBLE PARA CARGA DE ESTUDIANTES
# Acepta múltiples formatos:

# Formato 1: CSV completo (recomendado)
Nombre Completo,Grado,Documento
JUAN PÉREZ GARCÍA,1°,12345678
MARÍA RODRÍGUEZ LÓPEZ,2°,87654321
CARLOS MARTÍNEZ RUIZ,6°,11223344

# Formato 2: Con separador punto y coma
ANA SOFÍA TORRES;3°;55667788
LUIS ALBERTO GÓMEZ;4°;99887766

# Formato 3: Con espacios o tabulación
PEDRO ANTONIO SILVA	5°	44332211
LAURA BEATRIZ MORA	Transición	88776655

# Formato 4: Solo nombres (se asignará grado 1° por defecto)
JOSÉ MIGUEL HERRERA
CAROLINA ISABEL VEGA
DIEGO ALEJANDRO RUIZ

# Grados válidos: Transición, 1°, 2°, 3°, 4°, 5°, 6°, 7°, 8°, 9°, 10°, 11°`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_estudiantes_flexible.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Carga Masiva de Estudiantes</h2>
          <p className="text-gray-600">Agregar múltiples estudiantes al sistema</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      {/* Método de carga */}
      <Card>
        <CardHeader>
          <CardTitle>Método de Carga</CardTitle>
          <CardDescription>
            Seleccione cómo desea cargar los estudiantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button
              variant={uploadMethod === 'manual' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('manual')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Plus className="h-6 w-6 mb-2" />
              <span>Manual</span>
            </Button>
            
            <Button
              variant={uploadMethod === 'paste' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('paste')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>Pegar Datos</span>
            </Button>
            
            <Button
              variant={uploadMethod === 'file' ? 'default' : 'outline'}
              onClick={() => setUploadMethod('file')}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Upload className="h-6 w-6 mb-2" />
              <span>Subir Archivo</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="h-20 flex flex-col items-center justify-center"
            >
              <Download className="h-6 w-6 mb-2" />
              <span>Plantilla</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Entrada CSV */}
      {uploadMethod === 'paste' && (
        <Card>
          <CardHeader>
            <CardTitle>Pegar Datos de Estudiantes</CardTitle>
            <CardDescription>
              Acepta cualquier formato: CSV, tabla copiada de Excel, lista simple. El sistema detectará automáticamente nombres, grados y documentos.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                <p className="font-semibold text-blue-900 mb-1">✅ Cómo copiar desde Excel:</p>
                <ol className="text-blue-800 ml-4 list-decimal space-y-1">
                  <li>Selecciona las columnas: Nombre, Grado, Documento (o solo Nombre y Grado)</li>
                  <li>Copia (Ctrl+C o Cmd+C)</li>
                  <li>Pega aquí abajo (Ctrl+V o Cmd+V)</li>
                  <li>Haz clic en "Procesar Datos"</li>
                </ol>
                <p className="mt-2 text-blue-700"><strong>Importante:</strong> Puedes incluir o no la fila de encabezados. El sistema detecta automáticamente.</p>
              </div>
              <Textarea
                placeholder="Pega aquí los datos copiados desde Excel...&#10;&#10;Ejemplo:&#10;Josue David Blanco Martinez	0°	1043194902&#10;Mayli Alexandra Borrero Utria	0°	1047064870&#10;Brian De Jesus Castillo Pizarro	0°	1041779125&#10;&#10;O con 'Asignar' en documento:&#10;Charlotte Maria Carreño Millan	0°	Asignar&#10;Luciana Cervera Gonzalez	1°	Asignar"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={parseCsvText} className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Procesar Datos
              </Button>
              <Button 
                onClick={() => {
                  const testData = `Josue David Blanco Martinez	0°	1043194902
Mayli Alexandra Borrero Utria	0°	1047064870
Brian De Jesus Castillo Pizarro	0°	Asignar
Charlotte Maria Carreño Millan	1°	1048334300
Luciana Cervera Gonzalez	1°	Asignar
Adrian David Corredor Rodelo	2°	1242189977
Valery Sofia De La Hoz Bolivar	3°	1043194957
Angel Fabian Escalona Medina	4°	Asignar
Andres Camilo Espitia Beltran	5°	1242190202
Carlos Junior Frile Escorcia	6°	1045252007`;
                  setCsvText(testData);
                  toast({
                    title: "Datos de prueba cargados",
                    description: "10 estudiantes de ejemplo (grados 0° a 6°). Haz clic en 'Procesar Datos'.",
                  });
                }}
                variant="outline"
                className="px-4"
              >
                Cargar Ejemplo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Carga de archivo */}
      {uploadMethod === 'file' && (
        <Card>
          <CardHeader>
            <CardTitle>Subir Archivo</CardTitle>
            <CardDescription>
              Acepta archivos CSV, TXT o cualquier archivo de texto. También puedes subir datos copiados de Excel guardados como CSV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <Input
                type="file"
                accept=".csv,.txt,.tsv"
                onChange={handleFileUpload}
                className="mb-4"
              />
              <p className="text-sm text-gray-600">
                Formatos aceptados: CSV, TXT, TSV
              </p>
              {selectedFile && (
                <p className="mt-2 text-sm font-medium text-green-600">
                  Archivo seleccionado: {selectedFile.name}
                </p>
              )}
            </div>
            
            {csvText && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vista previa del contenido:
                </label>
                <Textarea
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                  placeholder="El contenido del archivo aparecerá aquí..."
                />
                <Button onClick={parseCsvText} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Procesar Datos del Archivo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Formulario manual */}
      {uploadMethod === 'manual' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Estudiantes a Crear</span>
              <Button onClick={addEmptyStudent} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay estudiantes agregados</p>
                <Button onClick={addEmptyStudent} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Primer Estudiante
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student, index) => (
                  <div key={student.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-sm">Estudiante #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeStudent(student.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Nombre Completo *
                        </label>
                        <Input
                          placeholder="NOMBRE APELLIDOS"
                          value={student.name}
                          onChange={(e) => updateStudent(student.id, 'name', e.target.value.toUpperCase())}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Grado *
                        </label>
                        <Select
                          value={student.grade}
                          onValueChange={(value) => updateStudent(student.id, 'grade', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar grado" />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map(grade => (
                              <SelectItem key={grade} value={grade}>
                                {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Documento
                        </label>
                        <Input
                          placeholder="Número de documento"
                          value={student.document_number}
                          onChange={(e) => updateStudent(student.id, 'document_number', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    {student.level && (
                      <div className="mt-2">
                        <Badge variant="secondary">{student.level}</Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de estudiantes procesados */}
      {students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resumen de Carga ({students.length} estudiantes)</span>
              <div className="flex gap-2">
                <Button 
                  onClick={removeDuplicates} 
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar Duplicados
                </Button>
                <Button 
                  onClick={handleBulkUpload} 
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {loading ? 'Cargando...' : 'Crear Estudiantes'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {students.map((student, index) => (
                <div key={student.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{student.name || `Estudiante ${index + 1}`}</span>
                    {student.grade && (
                      <Badge variant="outline" className="ml-2">{student.grade}</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {student.name && student.grade && student.level ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados */}
      {results && (
        <Card className={results.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardContent className="pt-6">
            {results.success ? (
              <div className="flex items-center space-x-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">
                  ¡Carga exitosa! Se crearon {results.created} de {results.total} estudiantes
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Error: {results.error}</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkStudentUpload;