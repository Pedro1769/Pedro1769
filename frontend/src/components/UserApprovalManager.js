import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye,
  UserCheck,
  UserX,
  AlertCircle,
  Mail,
  Phone,
  User
} from 'lucide-react';

const UserApprovalManager = ({ onClose }) => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('gada_registered_users') || '[]');
      
      setPendingUsers(registeredUsers.filter(user => !user.approved && !user.rejected));
      setApprovedUsers(registeredUsers.filter(user => user.approved));
      setRejectedUsers(registeredUsers.filter(user => user.rejected));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const updateUserStatus = (userId, status, reason = '') => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('gada_registered_users') || '[]');
      const updatedUsers = registeredUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            approved: status === 'approved',
            rejected: status === 'rejected',
            approvalDate: new Date().toISOString(),
            approvalReason: reason,
            approvedBy: 'Pedro Hurtado - Coordinador Académico'
          };
        }
        return user;
      });

      localStorage.setItem('gada_registered_users', JSON.stringify(updatedUsers));
      loadUsers();
      
      // Mostrar mensaje de confirmación
      const action = status === 'approved' ? 'aprobada' : 'rechazada';
      alert(`Cuenta ${action} exitosamente`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error al actualizar el estado del usuario');
    }
  };

  const approveUser = (user) => {
    const reason = prompt('Motivo de aprobación (opcional):') || 'Cumple con los requisitos institucionales';
    updateUserStatus(user.id, 'approved', reason);
  };

  const rejectUser = (user) => {
    const reason = prompt('Motivo de rechazo:');
    if (reason) {
      updateUserStatus(user.id, 'rejected', reason);
    }
  };

  const deleteUser = (userId) => {
    if (window.confirm('¿Está seguro de eliminar permanentemente este usuario?')) {
      try {
        const registeredUsers = JSON.parse(localStorage.getItem('gada_registered_users') || '[]');
        const updatedUsers = registeredUsers.filter(user => user.id !== userId);
        localStorage.setItem('gada_registered_users', JSON.stringify(updatedUsers));
        loadUsers();
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      'teacher': 'Docente',
      'parent': 'Padre de Familia',
      'coordinadora_convivencia': 'Coordinadora de Convivencia',
      'coordinador_academico': 'Coordinador Académico',
      'admin': 'Administrador'
    };
    return roles[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'teacher': 'bg-blue-100 text-blue-800',
      'parent': 'bg-green-100 text-green-800',
      'coordinadora_convivencia': 'bg-purple-100 text-purple-800',
      'coordinador_academico': 'bg-orange-100 text-orange-800',
      'admin': 'bg-red-100 text-red-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const UserCard = ({ user, showActions = true, status = 'pending' }) => (
    <Card className="border hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-lg flex items-center">
              <User className="mr-2 h-4 w-4" />
              {user.name}
            </h4>
            <div className="flex items-center space-x-2 mt-1 mb-2">
              <Badge className={getRoleColor(user.role)}>
                {getRoleLabel(user.role)}
              </Badge>
              {status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pendiente</Badge>}
              {status === 'approved' && <Badge variant="outline" className="bg-green-50 text-green-700">Aprobado</Badge>}
              {status === 'rejected' && <Badge variant="outline" className="bg-red-50 text-red-700">Rechazado</Badge>}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center">
                <Mail className="mr-2 h-3 w-3" />
                {user.email}
              </div>
              {user.phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-3 w-3" />
                  {user.phone}
                </div>
              )}
              <div><strong>Documento:</strong> {user.document}</div>
              
              {user.role === 'teacher' && (
                <>
                  <div><strong>Nivel:</strong> {user.teachingLevel}</div>
                  {user.isTutor && <div><strong>Tutor de:</strong> {user.tutorGrade}</div>}
                  {user.subjects?.length > 0 && (
                    <div><strong>Materias:</strong> {user.subjects.slice(0, 3).join(', ')}{user.subjects.length > 3 ? '...' : ''}</div>
                  )}
                </>
              )}
              
              {user.role === 'parent' && (
                <>
                  <div><strong>Estudiante Doc:</strong> {user.studentDocument}</div>
                  <div><strong>Relación:</strong> {user.relationshipType}</div>
                </>
              )}
            </div>
            
            <div className="text-xs text-gray-500 mt-2">
              Registrado: {new Date(user.createdAt).toLocaleString('es-CO')}
            </div>
          </div>
          
          {showActions && status === 'pending' && (
            <div className="flex flex-col space-y-2 ml-4">
              <Button 
                size="sm" 
                onClick={() => approveUser(user)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Aprobar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => rejectUser(user)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="mr-1 h-3 w-3" />
                Rechazar
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setSelectedUser(user)}
              >
                <Eye className="mr-1 h-3 w-3" />
                Ver
              </Button>
            </div>
          )}
          
          {status === 'approved' && (
            <div className="ml-4">
              <div className="text-xs text-green-600 mb-2">
                ✓ Aprobado por: {user.approvedBy}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(user.approvalDate).toLocaleDateString('es-CO')}
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => deleteUser(user.id)}
                className="mt-2"
              >
                Eliminar
              </Button>
            </div>
          )}
          
          {status === 'rejected' && (
            <div className="ml-4">
              <div className="text-xs text-red-600 mb-2">
                ✗ Rechazado
              </div>
              {user.approvalReason && (
                <div className="text-xs text-gray-500 mb-2">
                  Motivo: {user.approvalReason}
                </div>
              )}
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => deleteUser(user.id)}
              >
                Eliminar
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <UserCheck className="mr-2 h-5 w-5" />
            Gestión de Cuentas de Usuario
          </CardTitle>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Pendientes ({pendingUsers.length})
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobadas ({approvedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center">
                <XCircle className="mr-2 h-4 w-4" />
                Rechazadas ({rejectedUsers.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4">
              {pendingUsers.length > 0 ? (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Hay {pendingUsers.length} cuenta(s) pendiente(s) de aprobación. 
                      Revise cada solicitud antes de aprobar el acceso al sistema.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4">
                    {pendingUsers.map((user) => (
                      <UserCard key={user.id} user={user} status="pending" />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay cuentas pendientes de aprobación</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4">
              <div className="grid gap-4">
                {approvedUsers.map((user) => (
                  <UserCard key={user.id} user={user} showActions={false} status="approved" />
                ))}
              </div>
              {approvedUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay cuentas aprobadas</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected" className="space-y-4">
              <div className="grid gap-4">
                {rejectedUsers.map((user) => (
                  <UserCard key={user.id} user={user} showActions={false} status="rejected" />
                ))}
              </div>
              {rejectedUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <XCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay cuentas rechazadas</p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Modal de Detalles de Usuario */}
          {selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
              <Card className="w-full max-w-2xl">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Detalles de la Solicitud</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedUser(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Información Personal</h4>
                      <div className="space-y-2 text-sm">
                        <div><strong>Nombre:</strong> {selectedUser.name}</div>
                        <div><strong>Email:</strong> {selectedUser.email}</div>
                        <div><strong>Documento:</strong> {selectedUser.document}</div>
                        <div><strong>Teléfono:</strong> {selectedUser.phone || 'No proporcionado'}</div>
                        <div><strong>Rol:</strong> <Badge className={getRoleColor(selectedUser.role)}>{getRoleLabel(selectedUser.role)}</Badge></div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Información del Rol</h4>
                      <div className="space-y-2 text-sm">
                        {selectedUser.role === 'teacher' && (
                          <>
                            <div><strong>Nivel Educativo:</strong> {selectedUser.teachingLevel}</div>
                            <div><strong>Es Tutor:</strong> {selectedUser.isTutor ? 'Sí' : 'No'}</div>
                            {selectedUser.isTutor && <div><strong>Grado a Cargo:</strong> {selectedUser.tutorGrade}</div>}
                            {selectedUser.subjects?.length > 0 && (
                              <div><strong>Materias:</strong> {selectedUser.subjects.join(', ')}</div>
                            )}
                          </>
                        )}
                        
                        {selectedUser.role === 'parent' && (
                          <>
                            <div><strong>Doc. Estudiante:</strong> {selectedUser.studentDocument}</div>
                            <div><strong>Relación:</strong> {selectedUser.relationshipType}</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs text-gray-600">
                      <div><strong>Fecha de registro:</strong> {new Date(selectedUser.createdAt).toLocaleString('es-CO')}</div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setSelectedUser(null)}>
                      Cerrar
                    </Button>
                    <Button 
                      onClick={() => {
                        approveUser(selectedUser);
                        setSelectedUser(null);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprobar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        rejectUser(selectedUser);
                        setSelectedUser(null);
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserApprovalManager;