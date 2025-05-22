import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

/**
 * Componente para diálogos de confirmación reutilizables
 */
const ConfirmDialog = ({
  title = '¿Está seguro?',
  message = '¿Confirma que desea realizar esta acción?',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  type = 'warning', // warning, danger, info
  onConfirm,
  onCancel,
  isProcessing = false,
  additionalContent = null
}) => {
  // Configuración de colores según el tipo
  const colors = {
    warning: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      icon: <AlertTriangle className="text-yellow-500" size={20} />
    },
    danger: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
      button: 'bg-red-600 hover:bg-red-700',
      icon: <X className="text-red-500" size={20} />
    },
    info: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: <Check className="text-blue-500" size={20} />
    },
    success: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
      button: 'bg-green-600 hover:bg-green-700',
      icon: <Check className="text-green-500" size={20} />
    }
  };
  
  const currentColors = colors[type] || colors.warning;
  
  return (
    <div className="p-4">
      <div className="flex items-start mb-4">
        <div className={`${currentColors.bg} p-2 rounded-full mr-3 flex-shrink-0`}>
          {currentColors.icon}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-800">{title}</h3>
          <p className="text-gray-600 mt-1">{message}</p>
          {additionalContent && (
            <div className="mt-2">
              {additionalContent}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className={`px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {cancelLabel}
        </button>
        
        <button
          type="button"
          onClick={onConfirm}
          disabled={isProcessing}
          className={`px-3 py-1.5 ${currentColors.button} rounded text-white text-sm flex items-center ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : confirmLabel}
        </button>
      </div>
    </div>
  );
};

export default ConfirmDialog;