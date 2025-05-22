import { useState, useCallback } from 'react';
import { useModal } from '../contexts/ModalContext';

/**
 * Hook personalizado para gestionar formularios en modales
 * 
 * @param {Object} options - Opciones de configuración
 * @returns {Object} - Funciones y estados para gestionar el modal
 */
export function useModalForm({
  modalId = 'formModal',
  successModalId = 'successModal',
  errorModalId = 'errorModal',
  successTimeout = 1500,
  onSuccess = null,
  onError = null
}) {
  const { openModal, closeModal, updateModal } = useModal();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Abrir modal con formulario
  const openFormModal = useCallback((props = {}) => {
    const { title = 'Formulario', content, size = 'md', ...otherProps } = props;
    
    openModal(modalId, {
      title,
      content,
      size,
      ...otherProps
    });
  }, [modalId, openModal]);
  
  // Cerrar modal con formulario
  const closeFormModal = useCallback(() => {
    closeModal(modalId);
  }, [modalId, closeModal]);
  
  // Actualizar modal con formulario
  const updateFormModal = useCallback((props = {}) => {
    updateModal(modalId, props);
  }, [modalId, updateModal]);
  
  // Mostrar modal de éxito
  const showSuccessModal = useCallback((message = 'Operación completada con éxito', callback = null) => {
    openModal(successModalId, {
      title: 'Éxito',
      size: 'sm',
      showCloseButton: false,
      content: (
        <div className="p-4 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <p className="text-gray-800">{message}</p>
        </div>
      )
    });
    
    setTimeout(() => {
      closeModal(successModalId);
      if (typeof callback === 'function') {
        callback();
      }
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    }, successTimeout);
  }, [successModalId, successTimeout, openModal, closeModal, onSuccess]);
  
  // Mostrar modal de error
  const showErrorModal = useCallback((error = 'Ha ocurrido un error') => {
    const errorMessage = typeof error === 'string' 
      ? error 
      : error.message || 'Ha ocurrido un error inesperado';
      
    openModal(errorModalId, {
      title: 'Error',
      size: 'sm',
      content: (
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-800">{errorMessage}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal(errorModalId)}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      )
    });
    
    if (typeof onError === 'function') {
      onError(error);
    }
  }, [errorModalId, openModal, closeModal, onError]);
  
  // Submitter envolvente para gestionar el estado de proceso
  const submitWithFeedback = useCallback(async (submitFn, ...args) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const result = await submitFn(...args);
      showSuccessModal();
      return result;
    } catch (error) {
      showErrorModal(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, showSuccessModal, showErrorModal]);
  
  return {
    openFormModal,
    closeFormModal,
    updateFormModal,
    showSuccessModal,
    showErrorModal,
    submitWithFeedback,
    isProcessing
  };
}

export default useModalForm;