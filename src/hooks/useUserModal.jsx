import { useCallback, useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import usuariosService from '../services/usuariosService';
import UserForm from '../components/users/UserForm';
import UserDetail from '../components/users/UserDetail';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CheckCircle, AlertCircle, User } from 'lucide-react';

/**
 * Hook personalizado para manejar todos los modales relacionados con usuarios
 * Proporciona funciones para abrir modales de creación, edición, visualización, clonación y eliminación
 */
const useUserModal = ({ onUserUpdated } = {}) => {
  const { openModal, closeModal } = useModal();
  const [modalStates, setModalStates] = useState({
    loading: false,
    error: null,
    currentUser: null
  });

  // Función helper para actualizar estados del modal
  const updateModalState = useCallback((updates) => {
    setModalStates(prev => ({ ...prev, ...updates }));
  }, []);

  // Función helper para manejar éxito de operaciones
  const handleSuccess = useCallback((user, action, modalId) => {
    closeModal(modalId);
    
    // Mostrar mensaje de éxito
    const messages = {
      create: 'Usuario creado correctamente',
      edit: 'Usuario actualizado correctamente',
      clone: 'Usuario clonado correctamente',
      delete: 'Usuario eliminado correctamente'
    };

    openModal('userSuccess', {
      title: 'Operación Exitosa',
      size: 'sm',
      showCloseButton: false,
      content: (
        <div className="p-4 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="text-green-500" size={24} />
          </div>
          <p className="text-gray-800 font-medium">{messages[action]}</p>
          {user && (
            <p className="text-sm text-gray-600 mt-1">
              {user.NOMBRE} {user.APELLIDOS}
            </p>
          )}
        </div>
      )
    });

    // Cerrar mensaje de éxito automáticamente
    setTimeout(() => {
      closeModal('userSuccess');
    }, 2000);

    // Notificar al componente padre
    if (onUserUpdated) {
      onUserUpdated(user, action);
    }
  }, [closeModal, openModal, onUserUpdated]);

  // Función helper para manejar errores
  const handleError = useCallback((error, modalId) => {
    const errorMessage = error?.isFormatted 
      ? error.message 
      : (error?.message || 'Ha ocurrido un error inesperado');

    openModal('userError', {
      title: 'Error',
      size: 'sm',
      content: (
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-gray-800 font-medium">No se pudo completar la operación</p>
              <p className="text-gray-600 mt-1 text-sm">{errorMessage}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal('userError')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      )
    });
  }, [openModal, closeModal]);

  // Abrir modal para crear usuario
  const openUserCreate = useCallback(() => {
    updateModalState({ currentUser: null });

    openModal('createUser', {
      title: 'Nuevo Usuario',
      size: '4xl',
      content: (
        <UserForm 
          onSuccess={(user) => handleSuccess(user, 'create', 'createUser')}
          onCancel={() => closeModal('createUser')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, updateModalState]);

  // Abrir modal de confirmación para eliminar usuario
  const openUserDelete = useCallback((user) => {
    if (!user) return;
    
    updateModalState({ currentUser: user });
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();

    // Determinar el rol del usuario
    let role = 'Usuario';
    if (user.PER_USUARIOS === 1 && user.PER_ELIMINACION === 1 && user.PER_MODIFICACION === 1) {
      role = 'Administrador';
    } else if (user.PER_MODIFICACION === 1) {
      role = 'Editor';
    }

    openModal('deleteUser', {
      title: 'Confirmar Eliminación',
      size: 'sm',
      content: (
        <ConfirmDialog
          title="Confirmar eliminación de usuario"
          message="¿Está seguro de que desea eliminar este usuario? Esta acción no se puede deshacer."
          type="danger"
          confirmLabel="Eliminar Usuario"
          cancelLabel="Cancelar"
          isProcessing={modalStates.loading}
          additionalContent={
            <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center mb-2">
                <User size={16} className="mr-2 text-gray-500" />
                <span className="font-medium text-gray-800">{userName}</span>
              </div>
              {user.USUARIO && (
                <p className="text-sm text-gray-600 ml-6">Usuario: {user.USUARIO}</p>
              )}
              {user.EMAIL && (
                <p className="text-sm text-gray-600 ml-6">Email: {user.EMAIL}</p>
              )}
              <div className="flex items-center mt-2 ml-6">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  role === 'Administrador' 
                    ? 'bg-red-100 text-red-800' 
                    : role === 'Editor' 
                    ? 'bg-orange-100 text-orange-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {role}
                </span>
                {user.ANULADO === 1 && (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 ml-2">
                    Anulado
                  </span>
                )}
              </div>
            </div>
          }
          onConfirm={async () => {
            updateModalState({ loading: true });
            try {
              await usuariosService.eliminar(user.ID_EMPLEADO || user.ID);
              handleSuccess(user, 'delete', 'deleteUser');
            } catch (error) {
              console.error('Error deleting user:', error);
              handleError(error, 'deleteUser');
            } finally {
              updateModalState({ loading: false });
            }
          }}
          onCancel={() => closeModal('deleteUser')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, handleError, modalStates.loading, updateModalState]);

  // Abrir modal para editar usuario
  const openUserEdit = useCallback((user) => {
    if (!user) return;
    
    updateModalState({ currentUser: user });
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();

    openModal('editUser', {
      title: `Editar Usuario: ${userName}`,
      size: '4xl',
      content: (
        <UserForm 
          userData={user}
          isEdit={true}
          onSuccess={(updatedUser) => handleSuccess(updatedUser, 'edit', 'editUser')}
          onCancel={() => closeModal('editUser')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, updateModalState]);

  // Abrir modal para clonar usuario
  const openUserClone = useCallback((user) => {
    if (!user) return;
    
    updateModalState({ currentUser: user });
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();

    openModal('cloneUser', {
      title: `Clonar Usuario: ${userName}`,
      size: '4xl',
      content: (
        <UserForm 
          isClone={true}
          cloneData={user}
          onSuccess={(clonedUser) => handleSuccess(clonedUser, 'clone', 'cloneUser')}
          onCancel={() => closeModal('cloneUser')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, updateModalState]);

  // Abrir modal para ver detalles del usuario
  const openUserDetail = useCallback((user) => {
    if (!user) return;
    
    updateModalState({ currentUser: user });
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();

    openModal('viewUser', {
      title: `Detalle del Usuario: ${userName}`,
      size: '3xl',
      content: (
        <UserDetail 
          user={user}
          onEdit={() => {
            closeModal('viewUser');
            openUserEdit(user);
          }}
          onClone={() => {
            closeModal('viewUser');
            openUserClone(user);
          }}
          onDelete={() => {
            closeModal('viewUser');
            openUserDelete(user);
          }}
          onClose={() => closeModal('viewUser')}
        />
      )
    });
  }, [openModal, closeModal, updateModalState, openUserEdit, openUserClone, openUserDelete]);

  // Función para cerrar todos los modales relacionados con usuarios
  const closeAllUserModals = useCallback(() => {
    const userModalIds = ['createUser', 'editUser', 'cloneUser', 'viewUser', 'deleteUser', 'userSuccess', 'userError'];
    userModalIds.forEach(modalId => closeModal(modalId));
    updateModalState({ currentUser: null, error: null });
  }, [closeModal, updateModalState]);

  return {
    // Estados
    modalStates,
    
    // Funciones para abrir modales
    openUserCreate,
    openUserEdit,
    openUserClone,
    openUserDetail,
    openUserDelete,
    
    // Función para cerrar todos los modales
    closeAllUserModals,
    
    // Usuario actual seleccionado
    currentUser: modalStates.currentUser
  };
};

export default useUserModal;