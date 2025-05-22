import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from '../components/common/Modal';

// Crear el contexto
const ModalContext = createContext(null);

/**
 * Proveedor para gestionar múltiples modales en toda la aplicación
 * Permite abrir y cerrar modales desde cualquier componente
 */
export const ModalProvider = ({ children }) => {
  // Estado para almacenar todos los modales activos
  const [modals, setModals] = useState({});

  // Función para abrir un modal
  const openModal = useCallback((id, props = {}) => {
    // Cerrar modales existentes con el mismo ID si están abiertos
    if (id in modals) {
      setModals(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      
      // Abrir inmediatamente para optimizar la velocidad
      setModals(prev => ({
        ...prev,
        [id]: { isOpen: true, ...props }
      }));
    } else {
      setModals(prev => ({
        ...prev,
        [id]: { isOpen: true, ...props }
      }));
    }
  }, [modals]);

  // Función para cerrar un modal
  const closeModal = useCallback((id) => {
    setModals(prev => ({
      ...prev,
      [id]: { ...prev[id], isOpen: false }
    }));
    
    // Dar tiempo a la animación y luego eliminar el modal
    setTimeout(() => {
      setModals(prev => {
        const newModals = { ...prev };
        delete newModals[id];
        return newModals;
      });
    }, 300);
  }, []);
  
  // Función para actualizar las props de un modal abierto
  const updateModal = useCallback((id, props) => {
    setModals(prev => ({
      ...prev,
      [id]: { ...prev[id], ...props }
    }));
  }, []);

  // Exportar el contexto y los modales activos
  const value = {
    openModal,
    closeModal,
    updateModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Renderizar todos los modales activos */}
      {Object.entries(modals).map(([id, modalProps]) => {
        const { content, isOpen, size = 'md', ...otherProps } = modalProps;
        
        return (
          <Modal 
            key={id}
            isOpen={isOpen}
            onClose={() => closeModal(id)}
            size={size}
            {...otherProps}
          >
            {content}
          </Modal>
        );
      })}
    </ModalContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal debe ser usado dentro de un ModalProvider');
  }
  return context;
};

export default ModalContext;