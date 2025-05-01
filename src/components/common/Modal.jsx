import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import ThemeConstants from '../../constants/ThemeConstants';

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

/**
 * Componente Modal reutilizable con animaciones y comportamiento responsivo
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Controla si el modal está abierto o cerrado
 * @param {Function} props.onClose - Función a ejecutar cuando se cierra el modal
 * @param {ReactNode} props.children - Contenido del modal
 * @param {string} props.title - Título del modal (opcional)
 * @param {string} props.size - Tamaño del modal: xs, sm, md, lg, xl, 2xl, 3xl, full (default: md)
 * @param {boolean} props.showCloseButton - Muestra u oculta el botón de cierre (default: true)
 * @param {boolean} props.closeOnOverlayClick - Cierra el modal al hacer clic en el overlay (default: true)
 * @param {boolean} props.preventCloseOnEsc - Evita cerrar el modal con la tecla Esc (default: false)
 * @param {string} props.overlayClassName - Clases CSS adicionales para el overlay
 * @param {string} props.contentClassName - Clases CSS adicionales para el contenido
 * @param {string} props.headerClassName - Clases CSS adicionales para la cabecera
 * @param {string} props.maxHeight - Altura máxima del contenido (default: '80vh')
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  title, 
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  preventCloseOnEsc = false,
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  maxHeight = '80vh'
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
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${overlayClassName}`}
      onClick={handleOverlayClick}
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div 
        ref={modalRef}
        className={`${SIZES[size] || SIZES.md} w-full bg-white rounded-lg shadow-xl transform transition-all duration-300 flex flex-col ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'} ${contentClassName}`}
        role="dialog"
        style={{ maxHeight: '95vh' }} // Limitar altura máxima
      >
        {/* Cabecera del modal (condicional) */}
        {(title || showCloseButton) && (
          <div className={`flex justify-between items-center border-b p-4 ${headerClassName}`}>
            {title && <h2 id="modal-title" className="text-lg font-semibold">{title}</h2>}
            {showCloseButton && (
              <button 
                onClick={onClose} 
                className="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        {/* Contenido del modal */}
        <div className={`overflow-y-auto flex-grow`} style={{ maxHeight }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;