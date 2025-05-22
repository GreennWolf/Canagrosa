import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

// Tamaños disponibles para el modal - responsive
const SIZES = {
  xs: 'max-w-sm w-full mx-4',
  sm: 'max-w-md w-full mx-4',
  md: 'max-w-lg w-full mx-4',
  lg: 'max-w-2xl w-full mx-4',
  xl: 'max-w-4xl w-full mx-4',
  '2xl': 'max-w-6xl w-full mx-4',
  '3xl': 'max-w-7xl w-full mx-4',
  '4xl': 'max-w-screen-xl w-full mx-4',
  full: 'max-w-full mx-2 sm:mx-4'
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
  const [isRendered, setIsRendered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Controlar el ciclo de vida del modal
  useEffect(() => {
    if (isOpen && !isRendered) {
      setIsRendered(true);
      // Permitir que el DOM se actualice antes de iniciar la animación
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else if (!isOpen && isRendered) {
      setIsAnimating(false);
      // Esperar a que termine la animación antes de desmontar
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300); // Coincidir con duration-300
      return () => clearTimeout(timer);
    }
  }, [isOpen, isRendered]);
  
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
  
  // Si el modal no está renderizado, no mostrar nada
  if (!isRendered) return null;
  
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
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'} ${overlayClassName}`}
        onMouseDown={handleOverlayClick}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        aria-modal="true"
        role="dialog"
      >
        <div 
          ref={modalRef}
          className={`${SIZES[size] || SIZES.md} bg-white rounded-lg sm:rounded-lg shadow-xl transform transition-all duration-300 flex flex-col ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${contentClassName}`}
          role="dialog"
          style={{ 
            maxHeight: '95vh',
            minHeight: window.innerWidth < 640 ? '50vh' : 'auto'
          }}
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
    <div className={`flex justify-between items-center p-3 sm:p-4 border-b bg-slate-800 text-white rounded-t-lg ${className}`}>
      <div className="font-medium text-sm sm:text-base truncate pr-2">
        {children}
      </div>
      
      {showCloseButton && (
        <button 
          onClick={onClose} 
          className="p-1 rounded-full text-white hover:bg-blue-700 focus:outline-none flex-shrink-0"
          aria-label="Cerrar"
        >
          <X size={18} className="sm:w-5 sm:h-5" />
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
    <div className={`flex-grow p-3 sm:p-4 lg:p-6 overflow-y-auto ${className}`}>
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
    <div className={`p-3 sm:p-4 border-t bg-gray-100 rounded-b-lg flex flex-col sm:flex-row gap-2 sm:gap-3 ${className}`}>
      {children}
    </div>
  );
};

// Asignar los componentes como propiedades de Modal para una API más limpia
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;