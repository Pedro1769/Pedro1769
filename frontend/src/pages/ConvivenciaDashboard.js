import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { 
  Shield, 
  Users, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Calendar,
  UserCheck,
  MessageSquare,
  TrendingUp,
  Eye,
  Save,
  Upload,
  Download,
  BookOpen,
  GraduationCap,
  Plus,
  X
} from 'lucide-react';
import { mockStudents } from '../mock/mockData';
import { PeriodsManager } from '../utils/dataManager';

const ConvivenciaDashboard = () => {
  const { user } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('1');

  if (!user || user.role !== 'coordinadora_convivencia') {
    return <Navigate to="/login" />;
  }

  // Mock data for behavioral incidents
  const incidents = [
    { id: 1, studentId: 1, type: 'Tardanza', severity: 'Leve', date: '2024-01-15', description: 'Llegada tarde a clase', resolved: true },
    { id: 2, studentId: 2, type: 'Falta de Respeto', severity: 'Grave', date: '2024-01-16', description: 'Irrespeto al docente', resolved: false },
    { id: 3, studentId: 3, type: 'Uniforme', severity: 'Leve', date: '2024-01-17', description: 'Uniforme incompleto', resolved: true }
  ];

  const stats = {
    totalStudents: mockStudents.length,
    totalIncidents: incidents.length,
    resolvedIncidents: incidents.filter(i => i.resolved).length,
    pendingIncidents: incidents.filter(i => !i.resolved).length
  };

  const grades = ['all', '0°', '1°', '2°', '3°', '4°', '5°', '6°', '7°', '8°', '9°', '10°', '11°'];

  return (
    <div className="min-h-screen bg-institutional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-header opacity-10 rounded-2xl"></div>
          <div className="relative p-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-teal-600 to-blue-700 bg-clip-text text-transparent">
              Panel de Convivencia
            </h1>
            <p className="text-gray-600 mt-2">Bienvenida, {user.name}</p>
            <Badge variant="secondary" className="mt-2 bg-purple-100 text-purple-800">
              Coordinadora de Convivencia
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 border-blue-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-700">Estudiantes</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 border-amber-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-amber-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-amber-700">Incidentes</p>
                  <p className="text-2xl font-bold text-amber-900">{stats.totalIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 via-green-100 to-green-50 border-green-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-700">Resueltos</p>
                  <p className="text-2xl font-bold text-green-900">{stats.resolvedIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 via-red-100 to-red-50 border-red-200 hover-gradient card-institutional">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-red-700">Pendientes</p>
                  <p className="text-2xl font-bold text-red-900">{stats.pendingIncidents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="incidents" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <TabsTrigger value="incidents" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Incidentes
            </TabsTrigger>
            <TabsTrigger value="behavior" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Seguimiento Comportamental
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-teal-500 data-[state=active]:text-white">
              Reportes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="incidents" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-purple-600" />
                  Gestión de Incidentes
                </CardTitle>
                <div className="flex space-x-4 mt-4">
                  <div>
                    <Label htmlFor="grade">Grado</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {grades.slice(1).map((grade) => (
                          <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 font-medium text-gray-700">Fecha</th>
                        <th className="text-left p-3 font-medium text-gray-700">Estudiante</th>
                        <th className="text-left p-3 font-medium text-gray-700">Tipo</th>
                        <th className="text-left p-3 font-medium text-gray-700">Severidad</th>
                        <th className="text-left p-3 font-medium text-gray-700">Estado</th>
                        <th className="text-left p-3 font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incidents.map((incident) => {
                        const student = mockStudents.find(s => s.id === incident.studentId);
                        return (
                          <tr key={incident.id} className="border-b hover:bg-gradient-hover transition-colors">
                            <td className="p-3">{incident.date}</td>
                            <td className="p-3 font-medium">{student?.name || 'N/A'}</td>
                            <td className="p-3">{incident.type}</td>
                            <td className="p-3">
                              <Badge variant={incident.severity === 'Grave' ? 'destructive' : incident.severity === 'Moderado' ? 'default' : 'secondary'}>
                                {incident.severity}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge variant={incident.resolved ? 'default' : 'secondary'}>
                                {incident.resolved ? 'Resuelto' : 'Pendiente'}
                              </Badge>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-2">
                                <Button size="sm" variant="outline" className="hover:bg-blue-50">
                                  <Eye className="mr-1 h-3 w-3" />
                                  Ver
                                </Button>
                                {!incident.resolved && (
                                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Resolver
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-green-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-teal-600" />
                  Seguimiento Comportamental por Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center py-12 text-gray-500">
                  <UserCheck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">Seleccione un estudiante para ver su historial comportamental</p>
                  <p className="text-sm">Esta funcionalidad permite hacer seguimiento detallado del progreso comportamental</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card className="shadow-lg border-0 card-institutional">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-blue-600" />
                  Reportes de Convivencia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 border-2 hover:bg-gradient-hover">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Reporte Mensual</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20 border-2 hover:bg-gradient-hover">
                    <div className="text-center">
                      <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Estadísticas por Grado</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20 border-2 hover:bg-gradient-hover">
                    <div className="text-center">
                      <Shield className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Incidentes por Tipo</p>
                    </div>
                  </Button>
                  <Button variant="outline" className="h-20 border-2 hover:bg-gradient-hover">
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <p className="text-sm">Reporte Personalizado</p>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConvivenciaDashboard;