import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  Download,
  Users,
  FileSpreadsheet,
  X,
  Filter
} from 'lucide-react';

const DescargaListadosEstudiantes = ({ onClose }) => {
  const [filtros, setFiltros] = useState({
    grado: 'todos',
    formato: 'excel',
    incluirContactos: true,
    incluirDocumentos: true
  });
  const [estadisticas, setEstadisticas] = useState({});

  useEffect(() => {
    generarEstadisticas();
  }, []);

  const generarEstadisticas = () => {
    // Obtener todos los estudiantes
    const storedStudents = JSON.parse(localStorage.getItem('gada_students') || '[]');
    const registeredStudents = JSON.parse(localStorage.getItem('gada_registered_users') || '[]')
      .filter(user => user.role === 'student');
    
    const allStudents = [
      ...storedStudents,
      ...registeredStudents.map(s => ({
        id: s.id,
        name: s.name,
        document: s.document,
        grade: s.grade,
        email: s.email,
        parentEmail: s.parentEmail || '',
        parentPhone: s.parentPhone || '',
        isRegistered: true
      }))
    ];

    // Generar estadísticas por grado
    const stats = {
      total: allStudents.length,
      porGrado: {}
    };

    const grados = ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
    
    grados.forEach(grado => {
      const estudiantesGrado = allStudents.filter(s => s.grade === grado);
      stats.porGrado[grado] = {
        total: estudiantesGrado.length,
        registrados: estudiantesGrado.filter(s => s.isRegistered).length,
        manuales: estudiantesGrado.filter(s => !s.isRegistered).length
      };
    });

    setEstadisticas(stats);
  };

  const descargarListado = () => {
    // Obtener estudiantes según filtro de grado
    const storedStudents = JSON.parse(localStorage.getItem('gada_students') || '[]');
    const registeredStudents = JSON.parse(localStorage.getItem('gada_registered_users') || '[]')
      .filter(user => user.role === 'student');
    
    let allStudents = [
      ...storedStudents.map(s => ({...s, isRegistered: false, origen: 'manual'})),
      ...registeredStudents.map(s => ({
        id: s.id,
        name: s.name,
        document: s.document,
        grade: s.grade,
        email: s.email,
        parentEmail: s.parentEmail || '',
        parentPhone: s.parentPhone || '',
        isRegistered: true,
        origen: 'registro'
      }))
    ];

    // Filtrar por grado si no es 'todos'
    if (filtros.grado !== 'todos') {
      allStudents = allStudents.filter(s => s.grade === filtros.grado);
    }

    // Ordenar por grado y luego por nombre
    allStudents.sort((a, b) => {
      if (a.grade !== b.grade) {
        const gradeOrder = ['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];
        return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
      }
      return a.name.localeCompare(b.name);
    });

    if (filtros.formato === 'excel') {
      generarExcel(allStudents);
    } else {
      generarTXT(allStudents);
    }
  };

  const generarExcel = (estudiantes) => {
    let csv = 'GIMNASIO AMERICANO DEL ATLÁNTICO - LISTADO DE ESTUDIANTES\n';
    csv += `Generado el: ${new Date().toLocaleDateString('es-CO')}\n`;
    csv += `Filtro aplicado: ${filtros.grado === 'todos' ? 'Todos los grados' : `Grado ${filtros.grado}`}\n`;
    csv += `Total estudiantes: ${estudiantes.length}\n\n`;
    
    // Headers
    csv += 'No.,Nombres y Apellidos,Grado,Documento';
    if (filtros.incluirContactos) {
      csv += ',Email Estudiante,Email Acudiente,Teléfono Acudiente';
    }
    csv += ',Origen,Estado\n';

    // Data rows
    estudiantes.forEach((estudiante, index) => {
      csv += `${index + 1},"${estudiante.name}",${estudiante.grade},"${estudiante.document}"`;
      
      if (filtros.incluirContactos) {
        csv += `,"${estudiante.email || 'N/A'}","${estudiante.parentEmail || 'N/A'}","${estudiante.parentPhone || 'N/A'}"`;
      }
      
      csv += `,"${estudiante.origen}","${estudiante.isRegistered ? 'Registrado' : 'Manual'}"\n`;
    });

    // Estadísticas por grado
    if (filtros.grado === 'todos') {
      csv += '\n\nESTADÍSTICAS POR GRADO:\n';
      csv += 'Grado,Total,Registrados,Manuales\n';
      
      Object.entries(estadisticas.porGrado || {}).forEach(([grado, stats]) => {
        if (stats.total > 0) {
          csv += `${grado},${stats.total},${stats.registrados},${stats.manuales}\n`;
        }
      });
    }

    // Download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fechaStr = new Date().toISOString().split('T')[0];
    const gradoStr = filtros.grado === 'todos' ? 'TodosGrados' : `Grado${filtros.grado}`;
    link.download = `Listado_Estudiantes_${gradoStr}_${fechaStr}.csv`;
    link.click();
  };

  const generarTXT = (estudiantes) => {
    let contenido = `
GIMNASIO AMERICANO DEL ATLÁNTICO
LISTADO OFICIAL DE ESTUDIANTES

Fecha de generación: ${new Date().toLocaleDateString('es-CO', { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
})}
Filtro aplicado: ${filtros.grado === 'todos' ? 'Todos los grados' : `Grado ${filtros.grado}`}
Total estudiantes: ${estudiantes.length}

═══════════════════════════════════════════════════════════════════════════════

LISTADO DE ESTUDIANTES:

`;

    let gradoActual = '';
    estudiantes.forEach((estudiante, index) => {
      // Agregar header de grado si cambió
      if (estudiante.grade !== gradoActual) {
        gradoActual = estudiante.grade;
        contenido += `\n${gradoActual.toUpperCase()} GRADO:\n${'─'.repeat(50)}\n`;
      }

      contenido += `${String(index + 1).padStart(3, ' ')}. ${estudiante.name}\n`;
      contenido += `     Documento: ${estudiante.document}\n`;
      
      if (filtros.incluirContactos && (estudiante.email || estudiante.parentEmail)) {
        if (estudiante.email) contenido += `     Email: ${estudiante.email}\n`;
        if (estudiante.parentEmail) contenido += `     Email Acudiente: ${estudiante.parentEmail}\n`;
        if (estudiante.parentPhone) contenido += `     Teléfono: ${estudiante.parentPhone}\n`;
      }
      
      contenido += `     Estado: ${estudiante.isRegistered ? 'Registrado en plataforma' : 'Agregado manualmente'}\n\n`;
    });

    // Agregar estadísticas si es reporte completo
    if (filtros.grado === 'todos') {
      contenido += `
═══════════════════════════════════════════════════════════════════════════════

ESTADÍSTICAS POR GRADO:

`;
      Object.entries(estadisticas.porGrado || {}).forEach(([grado, stats]) => {
        if (stats.total > 0) {
          contenido += `${grado}: ${stats.total} estudiantes (${stats.registrados} registrados, ${stats.manuales} manuales)\n`;
        }
      });
    }

    contenido += `
═══════════════════════════════════════════════════════════════════════════════

Documento generado por: Sistema Académico GADA
Gimnasio Americano del Atlántico
Puerto Colombia - Atlántico
`;

    // Download
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fechaStr = new Date().toISOString().split('T')[0];
    const gradoStr = filtros.grado === 'todos' ? 'TodosGrados' : `Grado${filtros.grado}`;
    link.download = `Listado_Estudiantes_${gradoStr}_${fechaStr}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-bold">
              📋 DESCARGA DE LISTADOS
            </CardTitle>
            <Button onClick={onClose} variant="secondary" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Estadísticas generales */}
          <div className="mb-6 bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-3 flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Resumen General
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-blue-600">{estadisticas.total || 0}</div>
                <p className="text-sm text-gray-600">Total Estudiantes</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(estadisticas.porGrado || {}).filter(g => g.total > 0).length}
                </div>
                <p className="text-sm text-gray-600">Grados Activos</p>
              </div>
            </div>
          </div>

          {/* Estadísticas por grado */}
          <div className="mb-6">
            <h4 className="font-medium mb-3">Estudiantes por Grado:</h4>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(estadisticas.porGrado || {}).map(([grado, stats]) => (
                stats.total > 0 && (
                  <div key={grado} className="bg-gray-50 p-2 rounded text-center">
                    <Badge variant="outline">{grado}</Badge>
                    <div className="text-sm font-medium mt-1">{stats.total}</div>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Opciones de Descarga
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Grado a descargar</Label>
                <Select value={filtros.grado} onValueChange={(value) => setFiltros(prev => ({...prev, grado: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">📊 Consolidado (Todos)</SelectItem>
                    {['0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'].map(grado => {
                      const stats = estadisticas.porGrado?.[grado];
                      return stats?.total > 0 && (
                        <SelectItem key={grado} value={grado}>
                          {grado} ({stats.total} estudiantes)
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Formato de archivo</Label>
                <Select value={filtros.formato} onValueChange={(value) => setFiltros(prev => ({...prev, formato: value}))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excel">📊 Excel (.csv)</SelectItem>
                    <SelectItem value="txt">📄 Texto (.txt)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="incluirContactos"
                  checked={filtros.incluirContactos}
                  onChange={(e) => setFiltros(prev => ({...prev, incluirContactos: e.target.checked}))}
                  className="rounded"
                />
                <Label htmlFor="incluirContactos">Incluir información de contacto</Label>
              </div>
            </div>
          </div>

          {/* Botones de descarga */}
          <div className="space-y-3">
            <Button 
              onClick={descargarListado} 
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
              disabled={!estadisticas.total}
            >
              <Download className="mr-2 h-5 w-5" />
              Descargar Listado
              {filtros.grado !== 'todos' && (
                <Badge className="ml-2 bg-white text-green-600">
                  Grado {filtros.grado}
                </Badge>
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {filtros.grado === 'todos' 
                  ? `Se descargará el listado completo con ${estadisticas.total} estudiantes`
                  : `Se descargará el listado del grado ${filtros.grado} con ${estadisticas.porGrado?.[filtros.grado]?.total || 0} estudiantes`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DescargaListadosEstudiantes;