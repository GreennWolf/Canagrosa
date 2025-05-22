import { useState, useCallback, useRef } from 'react';
import { useModal } from '../contexts/ModalContext';
import ClientDetail from '../components/clients/ClientDetail';
import ClientForm from '../components/clients/ClientForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import clientesService from '../services/clientesService';
import { 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';

/**
 * Hook para gestionar modales relacionados con clientes
 * @param {object} config Configuración del hook
 * @param {function} config.onClientUpdated Callback cuando un cliente es actualizado/creado/eliminado
 * @param {function} config.onStateChange Callback cuando cambia el estado del modal
 * @returns {object} Métodos y estado del controlador de modales
 */
const useClientModal = (config = {}) => {
  const { onClientUpdated, onStateChange } = config;
  
  // Contexto de modales
  const { openModal, closeModal } = useModal();
  
  // Estados
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modalState, setModalState] = useState({
    mode: null, // 'view', 'edit', 'create', 'clone', 'delete'
    loading: false,
    error: null
  });
  
  // Referencias
  const formRef = useRef(null);
  const detailRef = useRef(null);
  
  // Función para cambiar el estado del modal y notificar al padre
  const updateModalState = useCallback((newState) => {
    setModalState(prev => ({ ...prev, ...newState }));
    if (onStateChange) {
      // Usamos una función para acceder al estado previo más actualizado
      // en lugar de capturar modalState en la dependencia
      onStateChange(prevState => ({ ...prevState, ...newState }));
    }
  }, [onStateChange]);
  
  // Abrir modal de detalle de cliente
  const openClientDetail = useCallback((client) => {
    setSelectedClient(client);
    updateModalState({ mode: 'view', loading: false, error: null });
    
    openModal('clientDetail', {
      title: client.NOMBRE,
      size: '2xl',
      content: (
        <ClientDetail 
          ref={detailRef}
          clientId={client.ID_CLIENTE} 
          onEdit={() => {
            closeModal('clientDetail');
            openClientEdit(client);
          }}
          onClose={() => closeModal('clientDetail')}
          onDelete={() => {
            closeModal('clientDetail');
            openClientDelete(client);
          }}
        />
      )
    });
  }, [openModal, closeModal, updateModalState]);
  
  // Abrir modal de edición de cliente
  const openClientEdit = useCallback((client) => {
    setSelectedClient(client);
    updateModalState({ mode: 'edit', loading: false, error: null });
    
    openModal('clientEdit', {
      title: `Editar Cliente: ${client.NOMBRE}`,
      size: '2xl',
      content: (
        <ClientForm 
          ref={formRef}
          clientId={client.ID_CLIENTE}
          isEdit={true}
          size="2xl"
          onSuccess={(updatedClient) => {
            closeModal('clientEdit');
            // Mostrar mensaje de éxito brevemente
            openSuccessMessage('Cliente actualizado correctamente');
            // Notificar al padre
            if (onClientUpdated) {
              onClientUpdated(updatedClient, 'update');
            }
          }}
          onCancel={() => closeModal('clientEdit')}
        />
      )
    });
  }, [openModal, closeModal, updateModalState, onClientUpdated]);
  
  // Abrir modal de creación de cliente
  const openClientCreate = useCallback(() => {
    setSelectedClient(null);
    updateModalState({ mode: 'create', loading: false, error: null });
    
    openModal('clientCreate', {
      title: 'Nuevo Cliente',
      size: '2xl',
      content: (
        <ClientForm 
          ref={formRef}
          onSuccess={(newClient) => {
            closeModal('clientCreate');
            // Mostrar mensaje de éxito brevemente
            openSuccessMessage('Cliente creado correctamente');
            // Notificar al padre
            if (onClientUpdated) {
              onClientUpdated(newClient, 'create');
            }
          }}
          onCancel={() => closeModal('clientCreate')}
        />
      )
    });
  }, [openModal, closeModal, updateModalState, onClientUpdated]);

  // Abrir modal de clonación de cliente
  const openClientClone = useCallback((client) => {
    setSelectedClient(client);
    updateModalState({ mode: 'clone', loading: false, error: null });
    
    openModal('clientClone', {
      title: `Clonar Cliente: ${client.NOMBRE}`,
      size: '2xl',
      content: (
        <ClientForm 
          ref={formRef}
          isClone={true}
          cloneData={client}
          onSuccess={(newClient) => {
            closeModal('clientClone');
            // Mostrar mensaje de éxito brevemente
            openSuccessMessage('Cliente clonado correctamente');
            // Notificar al padre
            if (onClientUpdated) {
              onClientUpdated(newClient, 'clone');
            }
          }}
          onCancel={() => closeModal('clientClone')}
        />
      )
    });
  }, [openModal, closeModal, updateModalState, onClientUpdated]);
  
  // Abrir modal de confirmación de eliminación
  const openClientDelete = useCallback((client) => {
    setSelectedClient(client);
    updateModalState({ mode: 'delete', loading: false, error: null });
    
    openModal('clientDelete', {
      title: 'Confirmar eliminación',
      size: 'sm',
      content: (
        <ConfirmDialog
          title="Confirmar eliminación"
          message="¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer."
          type="danger"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isProcessing={isProcessing}
          additionalContent={
            <div className="p-2 mt-2 bg-gray-100 rounded-md border border-gray-200">
              <p className="font-medium text-gray-800">{client.NOMBRE}</p>
              {client.CIF && <p className="text-sm text-gray-600">CIF/NIF: {client.CIF}</p>}
              {client.DIRECCION && <p className="text-sm text-gray-600">{client.DIRECCION}</p>}
            </div>
          }
          onConfirm={async () => {
            await handleDeleteClient(client);
          }}
          onCancel={() => {
            closeModal('clientDelete');
          }}
        />
      )
    });
  }, [openModal, closeModal, updateModalState, isProcessing]);
  
  // Manejar eliminación de cliente
  const handleDeleteClient = async (client) => {
    setIsProcessing(true);
    updateModalState({ loading: true, error: null });
    
    try {
      await clientesService.eliminar(client.ID_CLIENTE);
      closeModal('clientDelete');
      
      // Mostrar mensaje de éxito brevemente
      openSuccessMessage('Cliente eliminado correctamente');
      
      // Notificar al padre
      if (onClientUpdated) {
        onClientUpdated(client, 'delete');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      
      updateModalState({ 
        loading: false, 
        error: error.isFormatted 
          ? error.message 
          : 'No se pudo eliminar el cliente. Inténtelo de nuevo más tarde.'
      });
      
      openErrorMessage(
        error.isFormatted 
          ? error.message 
          : 'No se pudo eliminar el cliente. Inténtelo de nuevo más tarde.'
      );
    } finally {
      setIsProcessing(false);
      updateModalState({ loading: false });
    }
  };
  
  // Mostrar mensaje de éxito
  const openSuccessMessage = useCallback((message) => {
    openModal('successMessage', {
      title: 'Operación completada',
      size: 'sm',
      showCloseButton: false,
      content: (
        <div className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <p className="text-gray-800">{message}</p>
        </div>
      )
    });
    
    // Cerrar automáticamente después de 1.5 segundos
    setTimeout(() => {
      closeModal('successMessage');
    }, 1500);
  }, [openModal, closeModal]);
  
  // Mostrar mensaje de error
  const openErrorMessage = useCallback((message) => {
    openModal('errorMessage', {
      title: 'Error',
      size: 'sm',
      content: (
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-gray-800 font-medium">Se ha producido un error</p>
              <p className="text-gray-600 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal('errorMessage')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      )
    });
  }, [openModal, closeModal]);
  
  // Devolver métodos y estado del controlador
  return {
    openClientDetail,
    openClientEdit,
    openClientCreate,
    openClientClone,
    openClientDelete,
    selectedClient,
    modalState
  };
};

export default useClientModal;