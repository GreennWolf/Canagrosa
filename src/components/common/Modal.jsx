import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

// Tamaños disponibles para el modal
const SIZES = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  '3xl': 'max-w-7xl',
  full: 'max-w-full mx-4'
};

// Contexto interno para compartir onClose entre componentes
const ModalContext = React.createContext(null);

/**
 * Componente principal Modal que sirve como contenedor
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  size = 'md',
  closeOnOverlayClick = true,
  preventCloseOnEsc = false,
  overlayClassName = '',
  contentClassName = ''
}) => {
  const modalRef = useRef(null);
  
  // Maneja el cierre con la tecla Escape
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (isOpen && !preventCloseOnEsc && e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose, preventCloseOnEsc]);
  
  // Evita el scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Si el modal está cerrado, no renderizar nada
  if (!isOpen) return null;
  
  // Manejador para el clic en el overlay
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Crear el modal en un portal para que esté fuera de la jerarquía del DOM
  return createPortal(
    <ModalContext.Provider value={{ onClose }}>
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${overlayClassName}`}
        onMouseDown={handleOverlayClick}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} // Usar rgba en lugar de bg-opacity
        aria-modal="true"
        role="dialog"
      >
        <div 
          ref={modalRef}
          className={`${SIZES[size] || SIZES.md} w-full bg-white rounded-lg shadow-xl transform transition-all duration-300 flex flex-col ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${contentClassName}`}
          role="dialog"
          style={{ maxHeight: '95vh' }} // Limitar altura máxima
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>,
    document.body
  );
};

/**
 * Componente ModalHeader - Cabecera del modal siempre visible
 */
const ModalHeader = ({ 
  children, 
  showCloseButton = true,
  className = '' 
}) => {
  const { onClose } = React.useContext(ModalContext);
  
  return (
    <div className={`flex justify-between items-center p-4 border-b bg-slate-800 text-white rounded-t-lg ${className}`}>
      <div className="font-medium">
        {children}
      </div>
      
      {showCloseButton && (
        <button 
          onClick={onClose} 
          className="p-1 rounded-full text-white hover:bg-blue-700 focus:outline-none"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      )}
    </div>
  );
};

/**
 * Componente ModalBody - Cuerpo del modal con scroll
 */
const ModalBody = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex-grow p-4 overflow-y-auto ${className}`}>
      {children}
    </div>
  );
};

/**
 * Componente ModalFooter - Pie del modal siempre visible
 */
const ModalFooter = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`p-4 border-t bg-gray-100 rounded-b-lg ${className}`}>
      {children}
    </div>
  );
};

// Asignar los componentes como propiedades de Modal para una API más limpia
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;