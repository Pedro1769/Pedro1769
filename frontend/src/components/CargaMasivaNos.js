import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  X,
  Download,
  Users
} from 'lucide-react';

const CargaMasivaNotas = ({ onClose }) => {
  const [cargaData, setCargaData] = useState({
    grado: '',
    periodo1: '',
    periodo2: '',
    formato: 'csv'
  });
  const [archivo, setArchivo] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const procesarArchivo = async () => {
    if (!archivo || !cargaData.grado) {
      alert('Seleccione un archivo y grado antes de procesar');
      return;
    }

    setProcesando(true);
    
    try {
      const texto = await archivo.text();
      const lineas = texto.split('\n').filter(linea => linea.trim());
      
      if (lineas.length < 2) {
        throw new Error('El archivo debe tener al menos una línea de encabezados y una de datos');
      }

      // Procesar encabezados
      const encabezados = lineas[0].split(',').map(h => h.trim());
      const estudiantesData = [];
      
      // Procesar cada línea de estudiante
      for (let i = 1; i < lineas.length; i++) {
        const valores = lineas[i].split(',').map(v => v.trim());
        
        if (valores.length >= 3) { // Mínimo: nombre, documento, notas
          const estudiante = {
            nombre: valores[0],
            documento: valores[1],
            grado: cargaData.grado,
            notas: {}
          };

          // Procesar notas por período
          for (let j = 2; j < valores.length; j++) {
            const encabezado = encabezados[j];
            const nota = parseFloat(valores[j]);
            
            if (!isNaN(nota) && encabezado) {
              // Determinar período y asignatura del encabezado
              const [asignatura, periodo] = encabezado.includes('P1') ? [encabezado.replace('P1', '').trim(), '1'] :
                                          encabezado.includes('P2') ? [encabezado.replace('P2', '').trim(), '2'] :
                                          [encabezado, cargaData.periodo1 || '1'];
              
              if (!estudiante.notas[periodo]) {
                estudiante.notas[periodo] = {};
              }
              estudiante.notas[periodo][asignatura] = nota;
            }
          }
          
          estudiantesData.push(estudiante);
        }
      }

      // Distribuir notas en la plataforma
      await distribuirNotas(estudiantesData);
      
      setResultado({
        exito: true,
        procesados: estudiantesData.length,
        mensaje: `Se procesaron exitosamente ${estudiantesData.length} estudiantes`
      });

    } catch (error) {
      setResultado({
        exito: false,
        mensaje: `Error al procesar archivo: ${error.message}`
      });
    }
    
    setProcesando(false);
  };

  const distribuirNotas = async (estudiantesData) => {
    // Obtener estudiantes existentes
    const estudiantesExistentes = [
      ...JSON.parse(localStorage.getItem('gada_students') || '[]'),
      ...JSON.parse(localStorage.getItem('gada_registered_users') || '[]')
        .filter(u => u.role === 'student')
        .map(u => ({ id: u.id, name: u.name, document: u.document, grade: u.grade }))
    ];

    const notasDistribuidas = [];

    for (const estudianteData of estudiantesData) {
      // Buscar estudiante en la plataforma
      const estudianteExistente = estudiantesExistentes.find(e => 
        e.document === estudianteData.documento || 
        e.name.toLowerCase().includes(estudianteData.nombre.toLowerCase())
      );

      if (estudianteExistente) {
        // Distribuir notas por período y asignatura
        Object.entries(estudianteData.notas).forEach(([periodo, asignaturas]) => {
          Object.entries(asignaturas).forEach(([asignatura, nota]) => {
            // Guardar en planilla individual de la asignatura
            const planillaKey = `gada_planilla_individual_admin_${cargaData.grado}_${periodo}_${asignatura}`;
            const planillaExistente = JSON.parse(localStorage.getItem(planillaKey) || '{}');
            
            // Agregar nota del estudiante
            planillaExistente[`${estudianteExistente.id}_afectivas_Asistencia`] = nota;
            planillaExistente[`${estudianteExistente.id}_cognitivas_Evaluaciones`] = nota;
            planillaExistente[`${estudianteExistente.id}_procedimentales_Talleres`] = nota;
            
            localStorage.setItem(planillaKey, JSON.stringify(planillaExistente));
            
            notasDistribuidas.push({
              estudiante: estudianteExistente.name,
              asignatura,
              periodo,
              nota
            });
          });
        });
      }
    }

    // Guardar log de distribución
    const logDistribucion = {
      fecha: new Date().toISOString(),
      grado: cargaData.grado,
      totalProcesados: estudiantesData.length,
      notasDistribuidas: notasDistribuidas.length,
      detalles: notasDistribuidas
    };

    const historiaCarga = JSON.parse(localStorage.getItem('gada_historial_carga_masiva') || '[]');
    historiaCarga.push(logDistribucion);
    localStorage.setItem('gada_historial_carga_masiva', JSON.stringify(historiaCarga));
  };

  const descargarPlantilla = () => {
    const asignaturasEjemplo = cargaData.grado === '0°' ? 
      ['DIMENSIÓN COMUNICATIVA', 'DIMENSIÓN COGNITIVA'] :
      cargaData.grado && ['1°', '2°', '3°', '4°', '5°'].includes(cargaData.grado) ?
      ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES'] :
      ['ESPAÑOL', 'MATEMÁTICAS', 'CIENCIAS NATURALES', 'INGLÉS'];

    let csv = 'Nombre Completo,Documento,';
    
    // Agregar columnas para período 1 y 2
    asignaturasEjemplo.forEach(asignatura => {
      csv += `${asignatura} P1,${asignatura} P2,`;
    });
    csv += '\n';

    // Agregar ejemplos
    csv += 'JUAN PÉREZ GARCÍA,1234567890,4.5,4.2,3.8,4.0,4.1,4.3\n';
    csv += 'MARÍA LÓPEZ SÁNCHEZ,0987654321,4.8,4.6,4.2,4.4,4.0,4.5\n';
    csv += 'CARLOS RODRÍGUEZ TORRES,1122334455,3.5,3.8,3.2,3.6,3.9,4.0\n';

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Plantilla_Carga_Masiva_${cargaData.grado || 'Ejemplo'}.csv`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold">
                📊 CARGA MASIVA DE NOTAS - PERÍODOS ANTERIORES
              </CardTitle>
              <p className="text-green-100">
                Subir consolidado de notas de períodos 1 y 2 para distribución automática
              </p>
            </div>
            <Button onClick={onClose} variant="secondary" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          {!resultado && (
            <>
              {/* Configuración de carga */}
              <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Upload className="mr-2 h-5 w-5" />
                  Configuración de Carga
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Grado a procesar *</Label>
                    <Select value={cargaData.grado} onValueChange={(value) => setCargaData(prev => ({...prev, grado: value}))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'].map(grado => (
                          <SelectItem key={grado} value={grado}>{grado}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Formato de archivo</Label>
                    <Select value={cargaData.formato} onValueChange={(value) => setCargaData(prev => ({...prev, formato: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">📊 CSV (Recomendado)</SelectItem>
                        <SelectItem value="txt">📄 Texto separado por comas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">Formato esperado del archivo:</p>
                      <p className="text-yellow-700">
                        <code>Nombre,Documento,Materia1 P1,Materia1 P2,Materia2 P1,Materia2 P2,...</code>
                      </p>
                      <p className="text-yellow-600 mt-2">
                        Las notas se distribuirán automáticamente a cada estudiante registrado en la plataforma.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subir archivo */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <Label>Archivo de consolidado *</Label>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={descargarPlantilla}
                    disabled={!cargaData.grado}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar Plantilla
                  </Button>
                </div>
                
                <Input
                  type="file"
                  accept=".csv,.txt"
                  onChange={(e) => setArchivo(e.target.files[0])}
                  className="mb-2"
                />
                
                {archivo && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>{archivo.name} ({(archivo.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              {/* Instrucciones */}
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">📋 Instrucciones de uso:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Seleccione el grado que va a procesar</li>
                  <li>Descargue la plantilla como ejemplo del formato</li>
                  <li>Prepare su archivo CSV con las notas de períodos 1 y 2</li>
                  <li>Suba el archivo y procese la carga</li>
                  <li>Las notas se distribuirán automáticamente en las planillas de cada docente</li>
                </ol>
              </div>

              {/* Botón de procesamiento */}
              <div className="text-center">
                <Button
                  onClick={procesarArchivo}
                  disabled={!archivo || !cargaData.grado || procesando}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                >
                  {procesando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Procesar Carga Masiva
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Resultado de la carga */}
          {resultado && (
            <div className="text-center py-8">
              {resultado.exito ? (
                <div className="space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-600" />
                  <h3 className="text-xl font-semibold text-green-800">¡Carga Exitosa!</h3>
                  <p className="text-green-700">{resultado.mensaje}</p>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      Las notas han sido distribuidas automáticamente en las planillas de cada docente.
                      Los profesores podrán ver y editar estas notas desde sus paneles individuales.
                    </p>
                  </div>
                  
                  <Button onClick={() => setResultado(null)} className="mr-3">
                    Realizar otra carga
                  </Button>
                  <Button onClick={onClose} variant="outline">
                    Cerrar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <AlertCircle className="h-16 w-16 mx-auto text-red-600" />
                  <h3 className="text-xl font-semibold text-red-800">Error en la carga</h3>
                  <p className="text-red-700">{resultado.mensaje}</p>
                  
                  <Button onClick={() => setResultado(null)}>
                    Intentar nuevamente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CargaMasivaNotas;