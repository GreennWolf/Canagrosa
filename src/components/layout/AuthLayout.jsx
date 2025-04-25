import React from 'react';
import ThemeConstants from '../../constants/ThemeConstants';

const AuthLayout = ({ children }) => {
  return (
    <div className={`min-h-screen ${ThemeConstants.bgColors.page} flex flex-col justify-center ${ThemeConstants.textColors.primary}`}>
      <div className="p-6 sm:max-w-md sm:mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-3xl font-bold ${ThemeConstants.textColors.primary}`}>CANAGROSA</h1>
          <p className={`${ThemeConstants.textColors.secondary} mt-2`}>Sistema de Gestión</p>
        </div>
        
        <div className={`${ThemeConstants.bgColors.card} py-8 px-6 ${ThemeConstants.shadows.lg} ${ThemeConstants.rounded.lg} ${ThemeConstants.borders.card}`}>
          {children}
        </div>
        
        <div className={`text-center mt-6 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.secondary}`}>
          © {new Date().getFullYear()} CANAGROSA. Todos los derechos reservados.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;