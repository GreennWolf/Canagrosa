import React from 'react';
import ThemeConstants from '../../constants/ThemeConstants';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center text-gray-800">
      <div className="p-6 sm:max-w-md sm:mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">CANAGROSA</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestión</p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-200">
          {children}
        </div>
        
        <div className="text-center mt-6 text-sm text-gray-600">
          © {new Date().getFullYear()} CANAGROSA. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;