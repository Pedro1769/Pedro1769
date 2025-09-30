import React, { useState } from 'react';
import RegisterModal from '../components/RegisterModal';

const TestRegister = () => {
  const [showModal, setShowModal] = useState(true);

  const handleRegister = (user) => {
    console.log('✅ Usuario registrado desde TestRegister:', user);
    alert(`✅ Usuario registrado exitosamente: ${user.name}`);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          Test de Formulario de Registro
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Página de prueba para verificar el funcionamiento del formulario de registro
        </p>
        
        <button 
          onClick={() => setShowModal(true)}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Abrir Formulario de Registro
        </button>

        <div className="mt-4 text-sm text-gray-500">
          <p>• Verifica que los campos se puedan llenar</p>
          <p>• Comprueba que el botón "Ver Datos" muestre la información</p>
          <p>• Prueba el envío completo del formulario</p>
        </div>
      </div>

      {showModal && (
        <RegisterModal 
          onClose={handleClose}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};

export default TestRegister;