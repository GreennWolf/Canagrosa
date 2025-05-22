import { useCallback, useState } from 'react';
import { useModal } from '../contexts/ModalContext';
import muestrasService from '../services/muestrasService';
import SampleForm from '../components/samples/SampleForm';
import SampleDetail from '../components/samples/SampleDetail';
import SampleResultsForm from '../components/samples/SampleResultsForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { CheckCircle, AlertTriangle, Beaker } from 'lucide-react';

/**
 * Hook personalizado para manejar todos los modales relacionados con muestras
 * Proporciona funciones para abrir modales de creación, edición, visualización y eliminación
 */
const useSampleModal = ({ onSampleUpdated } = {}) => {
  const { openModal, closeModal } = useModal();
  const [modalStates, setModalStates] = useState({
    loading: false,
    error: null,
    currentSample: null
  });

  // Función helper para actualizar estados del modal
  const updateModalState = useCallback((updates) => {
    setModalStates(prev => ({ ...prev, ...updates }));
  }, []);

  // Función helper para manejar éxito de operaciones
  const handleSuccess = useCallback((sample, action, modalId) => {
    closeModal(modalId);
    
    // Mostrar mensaje de éxito
    openModal('sampleSuccess', {
      title: 'Operación Exitosa',
      size: 'sm',
      content: (
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div>
              <p className="text-gray-800 font-medium">
                {action === 'create' ? 'Muestra creada exitosamente' :
                 action === 'edit' ? 'Muestra actualizada exitosamente' :
                 action === 'delete' ? 'Muestra eliminada exitosamente' :
                 'Operación completada exitosamente'}
              </p>
              <p className="text-gray-600 mt-1 text-sm">
                {sample.REFERENCIA_CLIENTE ? 
                  `Referencia: ${sample.REFERENCIA_CLIENTE}` : 
                  `Muestra #${sample.ID_MUESTRA}`}
              </p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal('sampleSuccess')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      )
    });

    // Auto-cerrar después de 2 segundos
    setTimeout(() => {
      closeModal('sampleSuccess');
    }, 2000);

    // Notificar al componente padre
    if (onSampleUpdated) {
      onSampleUpdated(sample, action);
    }
  }, [closeModal, openModal, onSampleUpdated]);

  // Función helper para manejar errores
  const handleError = useCallback((error, modalId) => {
    const errorMessage = error?.isFormatted 
      ? error.message 
      : (error?.message || 'Ha ocurrido un error inesperado');

    openModal('sampleError', {
      title: 'Error',
      size: 'sm',
      content: (
        <div className="p-4">
          <div className="flex items-start">
            <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="text-red-500" size={20} />
            </div>
            <div>
              <p className="text-gray-800 font-medium">No se pudo completar la operación</p>
              <p className="text-gray-600 mt-1 text-sm">{errorMessage}</p>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal('sampleError')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Aceptar
            </button>
          </div>
        </div>
      )
    });
  }, [openModal, closeModal]);

  // Abrir modal para crear muestra
  const openSampleCreate = useCallback(() => {
    updateModalState({ currentSample: null });

    openModal('createSample', {
      title: 'Recepción de Ensayos Físicos',
      size: '4xl',
      content: (
        <SampleForm 
          onSuccess={(sample) => handleSuccess(sample, 'create', 'createSample')}
          onCancel={() => closeModal('createSample')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, updateModalState]);

  // Abrir modal de confirmación para eliminar muestra
  const openSampleDelete = useCallback((sample) => {
    if (!sample) return;
    
    updateModalState({ currentSample: sample });
    const sampleName = sample.REFERENCIA_CLIENTE || `Muestra #${sample.ID_MUESTRA}`;

    openModal('deleteSample', {
      title: 'Confirmar Eliminación',
      size: 'sm',
      content: (
        <ConfirmDialog
          title="Confirmar eliminación de muestra"
          message="¿Está seguro de que desea eliminar esta muestra? Esta acción no se puede deshacer."
          type="danger"
          confirmLabel="Eliminar Muestra"
          cancelLabel="Cancelar"
          isProcessing={modalStates.loading}
          additionalContent={
            <div className="p-3 mt-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="flex items-center mb-2">
                <Beaker size={16} className="mr-2 text-gray-500" />
                <span className="font-medium text-gray-800">{sampleName}</span>
              </div>
              {sample.CLIENTE_NOMBRE && (
                <div className="text-sm text-gray-600">
                  Cliente: {sample.CLIENTE_NOMBRE}
                </div>
              )}
              {sample.FECHA_RECEPCION && (
                <div className="text-sm text-gray-600">
                  Fecha recepción: {new Date(sample.FECHA_RECEPCION).toLocaleDateString()}
                </div>
              )}
              {sample.URGENTE === 1 && (
                <div className="text-sm text-red-600 flex items-center mt-1">
                  <AlertTriangle size={12} className="mr-1" />
                  Muestra marcada como urgente
                </div>
              )}
            </div>
          }
          onConfirm={async () => {
            updateModalState({ loading: true });
            try {
              await muestrasService.eliminar(sample.ID_MUESTRA);
              handleSuccess(sample, 'delete', 'deleteSample');
            } catch (error) {
              console.error('Error deleting sample:', error);
              handleError(error, 'deleteSample');
            } finally {
              updateModalState({ loading: false });
            }
          }}
          onCancel={() => closeModal('deleteSample')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, handleError, modalStates.loading, updateModalState]);

  // Abrir modal para editar muestra
  const openSampleEdit = useCallback((sample) => {
    if (!sample) return;
    
    updateModalState({ currentSample: sample });
    const sampleName = sample.REFERENCIA_CLIENTE || `Muestra #${sample.ID_MUESTRA}`;

    openModal('editSample', {
      title: `Consulta de la muestra - ${sampleName}`,
      size: '4xl',
      content: (
        <SampleForm 
          sampleData={sample}
          isEdit={true}
          onSuccess={(updatedSample) => handleSuccess(updatedSample, 'edit', 'editSample')}
          onCancel={() => closeModal('editSample')}
        />
      )
    });
  }, [openModal, closeModal, handleSuccess, updateModalState]);

  // Abrir modal para ver detalles de la muestra
  const openSampleDetail = useCallback((sample) => {
    if (!sample) return;
    
    updateModalState({ currentSample: sample });
    const sampleName = sample.REFERENCIA_CLIENTE || `Muestra #${sample.ID_MUESTRA}`;

    openModal('viewSample', {
      title: `Detalle - ${sampleName}`,
      size: '4xl',
      content: (
        <SampleDetail 
          sample={sample}
          onEdit={() => {
            closeModal('viewSample');
            openSampleEdit(sample);
          }}
          onDelete={() => {
            closeModal('viewSample');
            openSampleDelete(sample);
          }}
          onClose={() => closeModal('viewSample')}
        />
      )
    });
  }, [openModal, closeModal, openSampleEdit, openSampleDelete, updateModalState]);

  // Abrir modal para registrar resultados
  const openSampleResults = useCallback((sample) => {
    if (!sample) return;
    
    updateModalState({ currentSample: sample });
    const sampleName = sample.REFERENCIA_CLIENTE || `Muestra #${sample.ID_MUESTRA}`;

    openModal('sampleResults', {
      title: `Registro resultados ${sampleName}`,
      size: '4xl',
      content: (
        <SampleResultsForm 
          sample={sample}
          onSuccess={(results) => handleSuccess({ ...sample, resultados: results }, 'results', 'sampleResults')}
          onCancel={() => closeModal('sampleResults')}
        />
      )
    });
  }, [openModal, closeModal, updateModalState, handleSuccess]);

  return {
    // Estados
    modalStates,
    
    // Funciones principales
    openSampleCreate,
    openSampleEdit,
    openSampleDetail,
    openSampleDelete,
    openSampleResults,
    
    // Funciones helper
    updateModalState,
    handleSuccess,
    handleError
  };
};

export default useSampleModal;