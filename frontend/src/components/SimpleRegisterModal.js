import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const SimpleRegisterModal = ({ onClose, onRegister }) => {
  // Estado simple sin complejidades
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [document, setDocument] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función de envío simple
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Enviando formulario simple con datos:', {
      name, email, password: password ? '***' : '', document, role
    });

    // Validación básica
    if (!name || !email || !password || !document || !role) {
      setError('Por favor complete todos los campos obligatorios');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // URL del backend desde variable de entorno
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';
      
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: role,
        document: document.trim(),
        phone: '',
        subjects: [],
        grades: [],
        teaching_level: ''
      };

      console.log('📤 Enviando a:', `${backendUrl}/api/users`);
      console.log('📤 Datos:', { ...userData, password: '***' });

      const response = await fetch(`${backendUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      console.log('📥 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const createdUser = await response.json();
        console.log('✅ Usuario creado:', createdUser);
        
        alert(`✅ Usuario registrado exitosamente!\n\nNombre: ${createdUser.name}\nEmail: ${createdUser.email}\nRol: ${createdUser.role}\n\nYa puede hacer login.`);
        
        if (onRegister) {
          onRegister(createdUser);
        }
        onClose();
      } else {
        const errorData = await response.text();
        console.error('❌ Error del servidor:', errorData);
        setError(`Error del servidor: ${response.status} - ${errorData}`);
      }
      
    } catch (error) {
      console.error('❌ Error de red:', error);
      setError(`Error de conexión: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Registro de Usuario</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                console.log('📝 Cambiando nombre:', e.target.value);
                setName(e.target.value);
              }}
              placeholder="Ingrese su nombre completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                console.log('📝 Cambiando email:', e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="correo@ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                console.log('📝 Cambiando password, longitud:', e.target.value.length);
                setPassword(e.target.value);
              }}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Documento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Documento *
            </label>
            <input
              type="text"
              value={document}
              onChange={(e) => {
                console.log('📝 Cambiando documento:', e.target.value);
                setDocument(e.target.value);
              }}
              placeholder="Número de documento"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rol *
            </label>
            <select
              value={role}
              onChange={(e) => {
                console.log('📝 Cambiando rol:', e.target.value);
                setRole(e.target.value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Seleccionar rol</option>
              <option value="student">Estudiante</option>
              <option value="teacher">Docente</option>
              <option value="parent">Padre de Familia</option>
              <option value="coordinadora_convivencia">Coordinadora de Convivencia</option>
              <option value="coordinador_academico">Coordinador Académico</option>
            </select>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <strong>Estado actual:</strong><br/>
            Nombre: {name || '(vacío)'}<br/>
            Email: {email || '(vacío)'}<br/>
            Password: {password ? `${password.length} caracteres` : '(vacío)'}<br/>
            Documento: {document || '(vacío)'}<br/>
            Rol: {role || '(no seleccionado)'}
          </div>

          {/* Botones */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span>Registrando...</span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  Registrar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleRegisterModal;