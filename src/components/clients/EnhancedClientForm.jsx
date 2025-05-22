import React, { memo, useEffect, useCallback } from 'react';
import { 
  Save, X, AlertCircle, Building, Check, RotateCw, Paperclip,
  MapPin, Mail, CreditCard, Users, FileText
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { ClientFormProvider, useClientForm } from '../../contexts/ClientFormContext';
import clientesService from '../../services/clientesService';
import TabPanel from '../common/TabPanel';
import Modal from '../common/Modal';
import AdjuntosModal from './AdjuntosModal';

// Importar secciones del formulario
import BasicInfoSection from './form/BasicInfoSection';
import AddressSection from './form/AddressSection';
import ContactSection from './form/ContactSection';
import FinancialSection from './form/FinancialSection';
import ResponsiblesSection from './form/ResponsiblesSection';
import ObservationsSection from './form/ObservationsSection';

/**
 * Componente interno del formulario que usa el contexto
 */
const ClientFormContent = memo(({ 
  clientId, 
  isEdit = false,
  isClone = false,
  cloneData = null,
  onSuccess,
  onCancel 
}) => {
  const { openModal, closeModal } = useModal();
  const {
    formData,
    errors,
    isValid,
    isDirty,
    loading,
    saving,
    validateForm,
    loadClientData,
    resetForm,
    setLoading,
    setSaving,
    getSubmitData
  } = useClientForm();

  // Cargar datos del cliente si estamos editando
  useEffect(() => {
    if (isEdit && clientId) {
      const fetchClient = async () => {
        setLoading(true);
        try {
          const clientData = await clientesService.obtenerPorId(clientId);
          
          if (clientData) {
            let clientInfo;
            
            if (Array.isArray(clientData) && clientData.length > 0) {
              clientInfo = clientData[0];
            } else if (typeof clientData === 'object') {
              clientInfo = clientData;
            } else {
              throw new Error('Formato de datos no esperado');
            }
            
            loadClientData(clientInfo, clientInfo.responsables || []);
          } else {
            throw new Error('No se encontraron datos del cliente');
          }
        } catch (err) {
          console.error('Error fetching client:', err);
          openModal('errorModal', {
            size: 'sm',
            content: (
              <>
                <Modal.Header>Error</Modal.Header>
                <Modal.Body>
                  <div className="flex items-start text-red-600">
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{err.message || 'Error al cargar los datos del cliente'}</p>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <button
                    onClick={() => closeModal('errorModal')}
                    className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
                  >
                    Aceptar
                  </button>
                </Modal.Footer>
              </>
            )
          });
        } finally {
          setLoading(false);
        }
      };
      
      fetchClient();
    }
  }, [clientId, isEdit, loadClientData, setLoading, openModal, closeModal]);

  // Cargar datos para clonación
  useEffect(() => {
    if (isClone && cloneData) {
      setLoading(true);
      try {
        // Preparar datos para clonación (sin ID y con nombre modificado)
        const cloneClientData = {
          ...cloneData,
          ID_CLIENTE: null,
          NOMBRE: `${cloneData.NOMBRE} (duplicado)`,
          CIF: '', // Limpiar CIF (debe ser único)
          // Limpiar otros campos que podrían requerir valores únicos
          EMAIL: cloneData.EMAIL ? `${cloneData.EMAIL}` : '', // Mantener email para referencia pero podría requerir modificación
          // Mantener todos los demás campos incluyendo direcciones, configuraciones, responsables, etc.
        };
        
        loadClientData(cloneClientData, cloneData.responsables || []);
      } catch (err) {
        console.error('Error loading clone data:', err);
        openModal('errorModal', {
          size: 'sm',
          content: (
            <>
              <Modal.Header>Error</Modal.Header>
              <Modal.Body>
                <div className="flex items-start text-red-600">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <p>Error al cargar los datos para clonación</p>
                </div>
              </Modal.Body>
              <Modal.Footer>
                <button
                  onClick={() => closeModal('errorModal')}
                  className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
                >
                  Aceptar
                </button>
              </Modal.Footer>
            </>
          )
        });
      } finally {
        setLoading(false);
      }
    }
  }, [isClone, cloneData, loadClientData, setLoading, openModal, closeModal]);

  // Manejar envío del formulario
  const handleSubmit = useCallback(async () => {
    const isFormValid = await validateForm();
    
    if (!isFormValid) {
      // Mostrar modal de errores de validación
      openModal('validationError', {
        size: 'sm',
        content: (
          <>
            <Modal.Header>Errores de Validación</Modal.Header>
            <Modal.Body>
              <div className="flex items-start text-red-600">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Por favor corrija los siguientes errores:</p>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => closeModal('validationError')}
                className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
              >
                Aceptar
              </button>
            </Modal.Footer>
          </>
        )
      });
      return;
    }
    
    setSaving(true);
    
    try {
      const dataToSend = getSubmitData();
      let result;
      
      // Utilizar los servicios apropiados según sea edición, clonación o creación
      if (isEdit) {
        result = await clientesService.actualizar(dataToSend);
      } else {
        // Para clonación y creación usar el mismo endpoint de crear
        result = await clientesService.crear(dataToSend);
      }
      
      // Mostrar mensaje de éxito
      openModal('successModal', {
        size: 'sm',
        content: (
          <>
            <Modal.Header>Operación Exitosa</Modal.Header>
            <Modal.Body>
              <div className="flex items-center text-green-600">
                <Check className="h-6 w-6 mr-2" />
                <p className="font-medium">
                  {isEdit 
                    ? 'Cliente actualizado correctamente' 
                    : (isClone ? 'Cliente clonado correctamente' : 'Cliente creado correctamente')
                  }
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => closeModal('successModal')}
                className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
              >
                Aceptar
              </button>
            </Modal.Footer>
          </>
        )
      });
      
      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        closeModal('successModal');
        if (onSuccess) onSuccess(result);
      }, 1500);
      
    } catch (err) {
      console.error('Error saving client:', err);
      
      openModal('saveError', {
        size: 'sm',
        content: (
          <>
            <Modal.Header>Error al Guardar</Modal.Header>
            <Modal.Body>
              <div className="flex items-start text-red-600">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p>
                  {err.response?.data?.msg || err.message || 
                    `Error al ${isEdit ? 'actualizar' : (isClone ? 'clonar' : 'crear')} el cliente. Por favor, intente nuevamente.`
                  }
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <button
                onClick={() => closeModal('saveError')}
                className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
              >
                Aceptar
              </button>
            </Modal.Footer>
          </>
        )
      });
    } finally {
      setSaving(false);
    }
  }, [
    validateForm, 
    errors, 
    getSubmitData, 
    isEdit, 
    isClone, 
    setSaving, 
    openModal, 
    closeModal, 
    onSuccess
  ]);

  // Abrir modal de adjuntos
  const handleOpenAdjuntosModal = useCallback(() => {
    openModal('adjuntosModal', {
      size: '2xl',
      content: (
        <>
          <Modal.Header>Adjuntos</Modal.Header>
          <Modal.Body>
            <AdjuntosModal clientId={formData.ID_CLIENTE} />
          </Modal.Body>
          <Modal.Footer>
            <button
              onClick={() => closeModal('adjuntosModal')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Cerrar
            </button>
          </Modal.Footer>
        </>
      )
    });
  }, [openModal, closeModal, formData.ID_CLIENTE]);

  // Configuración de pestañas
  const tabs = [
    { 
      id: 'general', 
      label: 'General', 
      icon: <Building size={14} /> 
    },
    { 
      id: 'direcciones', 
      label: 'Direcciones', 
      icon: <MapPin size={14} /> 
    },
    { 
      id: 'contacto', 
      label: 'Contacto', 
      icon: <Mail size={14} /> 
    },
    { 
      id: 'financiero', 
      label: 'Financiero', 
      icon: <CreditCard size={14} /> 
    },
    { 
      id: 'responsables', 
      label: 'Responsables', 
      icon: <Users size={14} /> 
    },
    { 
      id: 'observaciones', 
      label: 'Observaciones', 
      icon: <FileText size={14} /> 
    }
  ];

  return (
    <>
      <Modal.Header>
        <div className="flex items-center">
          <Building size={18} className="mr-2" />
          <span>
            {isEdit ? 'Editar Cliente' : (isClone ? 'Clonar Cliente' : 'Nuevo Cliente')}
          </span>
          {isEdit && clientId && (
            <span className="text-sm ml-2 opacity-75">(#{clientId})</span>
          )}
          {isDirty && (
            <span className="text-xs ml-2 text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
              No guardado
            </span>
          )}
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <TabPanel tabs={tabs}>
            {/* Pestaña General */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                  <BasicInfoSection />
                </div>
                <div className="lg:col-span-1">
                  <ResponsiblesSection />
                </div>
              </div>
            </div>
            
            {/* Pestaña Direcciones */}
            <AddressSection />
            
            {/* Pestaña Contacto */}
            <ContactSection />
            
            {/* Pestaña Financiero */}
            <FinancialSection />
            
            {/* Pestaña Responsables (vista completa) */}
            <ResponsiblesSection />
            
            {/* Pestaña Observaciones */}
            <ObservationsSection />
          </TabPanel>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex w-full justify-between">
          <div className="flex space-x-2">
            {isEdit && (
              <button 
                type="button"
                onClick={handleOpenAdjuntosModal}
                className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                <Paperclip size={14} className="mr-1" />
                Adjuntos
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center px-4 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
            >
              {saving ? (
                <>
                  <RotateCw size={14} className="mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={14} className="mr-1" />
                  Guardar
                </>
              )}
            </button>
            
            <button 
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="flex items-center px-4 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 transition-colors"
            >
              <X size={14} className="mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      </Modal.Footer>
    </>
  );
});

ClientFormContent.displayName = 'ClientFormContent';

/**
 * Componente principal del formulario mejorado de cliente
 * Wrapper que proporciona el contexto y renderiza el contenido
 */
const EnhancedClientForm = memo((props) => {
  const { isEdit = false, isClone = false, cloneData = null } = props;
  
  // Determinar el modo del formulario
  const mode = isEdit ? 'edit' : (isClone ? 'clone' : 'create');
  
  // Datos iniciales según el modo
  const initialData = isClone && cloneData ? cloneData : {};

  return (
    <ClientFormProvider mode={mode} initialData={initialData}>
      <ClientFormContent {...props} />
    </ClientFormProvider>
  );
});

EnhancedClientForm.displayName = 'EnhancedClientForm';

export default EnhancedClientForm;