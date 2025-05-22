import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, X, AlertCircle, ArrowLeft, RotateCw, Paperclip,
  Building, Users, Phone, MapPin, CreditCard, Globe, 
  DollarSign, FileText, Mail, Check, User, Plus, Trash2,
  Search
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import { useData } from '../../contexts/DataProvider';
import clientesService from '../../services/clientesService';
import TabPanel from '../common/TabPanel';
import Modal from '../common/Modal';
import SelectInput from '../common/SelectInput';
import AdjuntosModal from './AdjuntosModal';

// Componente de campo de formulario reutilizable
const FormField = ({ 
  label, 
  id, 
  type = 'text',
  value, 
  onChange, 
  error, 
  required = false,
  disabled = false,
  options = [],
  placeholder = '',
  className = '',
  labelClassName = ''
}) => {
  return (
    <div className={`mb-2 ${className}`}>
      <label 
        htmlFor={id} 
        className={`block text-xs text-gray-700 mb-1 ${labelClassName}`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {type === 'select' ? (
        <select
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-2 py-1 text-xs border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : ''
          } text-gray-800`}
        >
          <option value="">{placeholder || 'Seleccione...'}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-2 py-1 text-xs border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : ''
          } text-gray-800`}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center">
          <input
            type="checkbox"
            id={id}
            name={id}
            checked={value === 1}
            onChange={onChange}
            disabled={disabled}
            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={id} className="ml-2 block text-xs text-gray-700">
            {placeholder}
          </label>
        </div>
      ) : type === 'radio' ? (
        <div className="flex items-center">
          <input
            type="radio"
            id={id}
            name={id}
            checked={value === 1}
            onChange={onChange}
            disabled={disabled}
            className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <label htmlFor={id} className="ml-1 text-xs text-gray-700">
            {placeholder}
          </label>
        </div>
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value || ''}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-2 py-1 text-xs border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : ''
          } text-gray-800`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

// Componente de sección del formulario
const FormSection = ({ title, children, className = '' }) => {
  return (
    <div className={`border border-gray-300 p-2 rounded bg-gray-50 ${className}`}>
      <h3 className="text-xs font-bold mb-2 border-b border-gray-200 pb-1 text-gray-700">{title}</h3>
      {children}
    </div>
  );
};

const ClientForm = ({ 
  clientId, 
  isEdit = false,
  isClone = false,
  cloneData = null,
  onSuccess,
  onCancel 
}) => {
  const { openModal, closeModal } = useModal();
  const { 
    data,
    fetchCountries,
    fetchProvinces,
    fetchMunicipalities,
    fetchPaymentMethods,
    fetchRates,
    fetchClientsForCombo,
    fetchUsers
  } = useData();
  
  // Estados principales
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  // Estado para formulario principal
  const [formData, setFormData] = useState({
    ID_CLIENTE: null,
    NOMBRE: '',
    DIRECCION: '',
    COD_POSTAL: '',
    CIF: '',
    TELEFONO: '',
    FAX: '',
    RESPONSABLE: '',
    EMAIL: '',
    OBSERVACIONES: '',
    PAIS_ID: '',
    PROVINCIA_ID: '',
    MUNICIPIO_ID: '',
    ANULADO: 0,
    FACTURA_DETERMINACIONES: 0,
    EADS: 0,
    AIRBUS: 0,
    IBERIA: 0,
    AGROALIMENTARIO: 0,
    EXTRANJERO: 0,
    INTRA: 0,
    IDIOMA_FACTURA: 1,
    FP_ID: '',
    TARIFA_ID: '',
    BANCO: '',
    CUENTA: '',
    CENTRO: '',
    CARGO: '',
    PARENT_ID: null,
    EMAIL_FACTURACION: '',
    EMAIL2: '',
    WEB: '',
    FACTURA_ELECTRONICA: 1,
    // Campos para dirección de envío
    DIRECCION_ENVIO: '',
    COD_POSTAL_ENVIO: '',
    PAIS_ID_ENVIO: '',
    PROVINCIA_ID_ENVIO: '',
    MUNICIPIO_ID_ENVIO: '',
    USE_MAIN_ADDRESS: 0,
    // Campos para dirección de facturación
    DIRECCION_FACTURACION: '',
    COD_POSTAL_FACTURACION: '',
    PAIS_ID_FACTURACION: '',
    PROVINCIA_ID_FACTURACION: '',
    MUNICIPIO_ID_FACTURACION: '',
    USE_MAIN_ADDRESS_BILLING: 0
  });
  
  // Estado para errores del formulario
  const [formErrors, setFormErrors] = useState({});
  
  // Datos para responsables
  const [selectedResponsible, setSelectedResponsible] = useState('');
  const [responsibles, setResponsibles] = useState([]);

  // Configuración de pestañas
  const tabs = [
    { id: 'general', label: 'General', icon: <Building size={14} /> },
    { id: 'direcciones', label: 'Direcciones', icon: <MapPin size={14} /> },
    { id: 'correos', label: 'Correos', icon: <Mail size={14} /> }
  ];
  
  // Cargar catálogos al inicio
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCountries(),
          fetchPaymentMethods(),
          fetchRates(),
          fetchClientsForCombo(),
          fetchUsers()
        ]);
      } catch (err) {
        console.error('Error loading catalogs:', err);
        setError('Error al cargar los datos de catálogos');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchCountries, fetchPaymentMethods, fetchRates, fetchClientsForCombo, fetchUsers]);
  
  // Cargar cliente si estamos editando
  useEffect(() => {
    if (isEdit && clientId) {
      const fetchClient = async () => {
        setLoading(true);
        try {
          // Usar el nuevo servicio
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
            
                // Importante: usar la función de actualización para evitar problemas con cierres
            setFormData(prev => ({
              ...prev,
              ...clientInfo,
              PAIS_ID: clientInfo.PAIS_ID || '',
              PROVINCIA_ID: clientInfo.PROVINCIA_ID || '',
              MUNICIPIO_ID: clientInfo.MUNICIPIO_ID || '',
              PAIS_ID_ENVIO: clientInfo.PAIS_ID_ENVIO || '',
              PROVINCIA_ID_ENVIO: clientInfo.PROVINCIA_ID_ENVIO || '',
              MUNICIPIO_ID_ENVIO: clientInfo.MUNICIPIO_ID_ENVIO || '',
              PAIS_ID_FACTURACION: clientInfo.PAIS_ID_FACTURACION || '',
              PROVINCIA_ID_FACTURACION: clientInfo.PROVINCIA_ID_FACTURACION || '',
              MUNICIPIO_ID_FACTURACION: clientInfo.MUNICIPIO_ID_FACTURACION || '',
              FP_ID: clientInfo.FP_ID || '',
              TARIFA_ID: clientInfo.TARIFA_ID || ''
            }));
            
            // Si tiene responsables, cargarlos
            if (clientInfo.responsables && Array.isArray(clientInfo.responsables)) {
              setResponsibles(clientInfo.responsables);
            }
          } else {
            throw new Error('No se encontraron datos del cliente');
          }
        } catch (err) {
          console.error('Error fetching client:', err);
          setError(err.message || 'Error al cargar los datos del cliente');
        } finally {
          setLoading(false);
        }
      };
      
      fetchClient();
    }
  }, [clientId, isEdit]);

  // Cargar datos para clonación
  useEffect(() => {
    if (isClone && cloneData) {
      setLoading(true);
      try {
        // Usar los datos del cliente a clonar
        const clientInfo = cloneData;
        
        // Preparar datos para clonación (sin ID y con nombre modificado)
        setFormData(prev => ({
          ...prev,
          ...clientInfo,
          ID_CLIENTE: null, // Remover ID para crear nuevo cliente
          NOMBRE: `${clientInfo.NOMBRE} (duplicado)`, // Modificar nombre
          CIF: '', // Limpiar CIF (debe ser único)
          // Mantener email para referencia pero podría requerir modificación
          EMAIL: clientInfo.EMAIL || '',
          EMAIL2: clientInfo.EMAIL2 || '',
          EMAIL_FACTURACION: clientInfo.EMAIL_FACTURACION || '',
          // Mantener todas las direcciones y configuraciones
          PAIS_ID: clientInfo.PAIS_ID || '',
          PROVINCIA_ID: clientInfo.PROVINCIA_ID || '',
          MUNICIPIO_ID: clientInfo.MUNICIPIO_ID || '',
          PAIS_ID_ENVIO: clientInfo.PAIS_ID_ENVIO || '',
          PROVINCIA_ID_ENVIO: clientInfo.PROVINCIA_ID_ENVIO || '',
          MUNICIPIO_ID_ENVIO: clientInfo.MUNICIPIO_ID_ENVIO || '',
          PAIS_ID_FACTURACION: clientInfo.PAIS_ID_FACTURACION || '',
          PROVINCIA_ID_FACTURACION: clientInfo.PROVINCIA_ID_FACTURACION || '',
          MUNICIPIO_ID_FACTURACION: clientInfo.MUNICIPIO_ID_FACTURACION || '',
          FP_ID: clientInfo.FP_ID || '',
          TARIFA_ID: clientInfo.TARIFA_ID || '',
          // Mantener configuraciones específicas del cliente
          FACTURA_DETERMINACIONES: clientInfo.FACTURA_DETERMINACIONES || false,
          EADS: clientInfo.EADS || false,
          AIRBUS: clientInfo.AIRBUS || false,
          IBERIA: clientInfo.IBERIA || false,
          AGROALIMENTARIO: clientInfo.AGROALIMENTARIO || false,
          INTRA: clientInfo.INTRA || false,
          EXTRANJERO: clientInfo.EXTRANJERO || false,
          FACTURA_ELECTRONICA: clientInfo.FACTURA_ELECTRONICA || false,
          IDIOMA_FACTURA: clientInfo.IDIOMA_FACTURA || '',
          // Mantener información financiera y bancaria
          BANCO: clientInfo.BANCO || '',
          CUENTA: clientInfo.CUENTA || '',
          CENTRO: clientInfo.CENTRO || '',
          CARGO: clientInfo.CARGO || '',
          // Mantener observaciones y referencias
          PARENT_ID: clientInfo.PARENT_ID || '',
          OBSERVACIONES: clientInfo.OBSERVACIONES || ''
        }));
        
        // Si tiene responsables, cargarlos
        if (clientInfo.responsables && Array.isArray(clientInfo.responsables)) {
          setResponsibles(clientInfo.responsables);
        }
      } catch (err) {
        console.error('Error loading clone data:', err);
        setError('Error al cargar los datos para clonación');
      } finally {
        setLoading(false);
      }
    }
  }, [isClone, cloneData]);
  
  // Cargar provincias cuando cambia el país
  useEffect(() => {
    if (formData.PAIS_ID) {
      fetchProvinces({ PAIS_ID: formData.PAIS_ID });
    } else {
      // Reset provincias y municipios si no hay país
      setFormData(prev => ({
        ...prev,
        PROVINCIA_ID: '',
        MUNICIPIO_ID: ''
      }));
    }
  }, [formData.PAIS_ID, fetchProvinces]);
  
  // Cargar municipios cuando cambia la provincia
  useEffect(() => {
    if (formData.PROVINCIA_ID) {
      fetchMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID });
    } else {
      // Reset municipios si no hay provincia
      setFormData(prev => ({
        ...prev,
        MUNICIPIO_ID: ''
      }));
    }
  }, [formData.PROVINCIA_ID, fetchMunicipalities]);
  
  // Cargar provincias cuando cambia el país (dirección de envío)
  useEffect(() => {
    if (formData.PAIS_ID_ENVIO) {
      fetchProvinces({ PAIS_ID: formData.PAIS_ID_ENVIO });
    } else {
      setFormData(prev => ({
        ...prev,
        PROVINCIA_ID_ENVIO: '',
        MUNICIPIO_ID_ENVIO: ''
      }));
    }
  }, [formData.PAIS_ID_ENVIO, fetchProvinces]);
  
  // Cargar municipios cuando cambia la provincia (dirección de envío)
  useEffect(() => {
    if (formData.PROVINCIA_ID_ENVIO) {
      fetchMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID_ENVIO });
    } else {
      setFormData(prev => ({
        ...prev,
        MUNICIPIO_ID_ENVIO: ''
      }));
    }
  }, [formData.PROVINCIA_ID_ENVIO, fetchMunicipalities]);
  
  // Cargar provincias cuando cambia el país (dirección de facturación)
  useEffect(() => {
    if (formData.PAIS_ID_FACTURACION) {
      fetchProvinces({ PAIS_ID: formData.PAIS_ID_FACTURACION });
    } else {
      setFormData(prev => ({
        ...prev,
        PROVINCIA_ID_FACTURACION: '',
        MUNICIPIO_ID_FACTURACION: ''
      }));
    }
  }, [formData.PAIS_ID_FACTURACION, fetchProvinces]);
  
  // Cargar municipios cuando cambia la provincia (dirección de facturación)
  useEffect(() => {
    if (formData.PROVINCIA_ID_FACTURACION) {
      fetchMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID_FACTURACION });
    } else {
      setFormData(prev => ({
        ...prev,
        MUNICIPIO_ID_FACTURACION: ''
      }));
    }
  }, [formData.PROVINCIA_ID_FACTURACION, fetchMunicipalities]);
  
  // Preparar opciones para los selectores
  const countryOptions = data.countries?.map(country => ({
    value: country.ID_PAIS,
    label: country.NOMBRE
  })) || [];
  
  const provinceOptions = data.provinces?.map(province => ({
    value: province.ID_PROVINCIA,
    label: province.NOMBRE
  })) || [];
  
  const municipalityOptions = data.municipalities?.map(municipality => ({
    value: municipality.ID_MUNICIPIO,
    label: municipality.NOMBRE
  })) || [];
  
  const paymentMethodOptions = data.paymentMethods?.map(method => ({
    value: method.ID_FP,
    label: method.NOMBRE
  })) || [];
  
  const rateOptions = data.rates?.map(rate => ({
    value: rate.ID_TARIFA,
    label: rate.NOMBRE
  })) || [];
  
  const clientOptions = data.clients?.map(client => ({
    value: client.ID_CLIENTE,
    label: client.NOMBRE
  })) || [];
  
  const userOptions = data.users
    ?.filter(user => user.ANULADO !== 1)
    ?.map(user => ({
      value: user.ID_EMPLEADO,
      label: `${user.NOMBRE} ${user.APELLIDOS || ''}`.trim()
    })) || [];
  
  // Manejar cambios en campos de texto e inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked ? 1 : 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Limpiar error del campo si existe
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Manejar cambio de idioma (radio buttons)
  const handleRadioChange = (value) => {
    setFormData({
      ...formData,
      IDIOMA_FACTURA: value
    });
  };
  
  // Añadir responsable
  const handleAddResponsible = () => {
    if (!selectedResponsible) return;
    
    const selectedUser = data.users?.find(user => 
      user.ID_EMPLEADO === parseInt(selectedResponsible)
    );
    
    if (selectedUser) {
      const newResponsible = {
        ID_EMPLEADO: selectedUser.ID_EMPLEADO,
        NOMBRE: `${selectedUser.NOMBRE} ${selectedUser.APELLIDOS || ''}`.trim()
      };
      
      // Comprobar que no esté ya añadido
      const alreadyExists = responsibles.some(
        resp => resp.ID_EMPLEADO === newResponsible.ID_EMPLEADO
      );
      
      if (!alreadyExists) {
        setResponsibles([...responsibles, newResponsible]);
      }
      
      setSelectedResponsible('');
    }
  };
  
  // Eliminar responsable
  const handleRemoveResponsible = (id) => {
    setResponsibles(responsibles.filter(resp => resp.ID_EMPLEADO !== id));
  };
  
  // Validar formulario
  const validate = () => {
    const errors = {};
    
    if (!formData.NOMBRE) {
      errors.NOMBRE = 'El nombre es obligatorio';
    }
    
    if (formData.EMAIL && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EMAIL)) {
      errors.EMAIL = 'El formato del email no es válido';
    }
    
    if (formData.EMAIL2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EMAIL2)) {
      errors.EMAIL2 = 'El formato del email no es válido';
    }
    
    if (formData.EMAIL_FACTURACION && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.EMAIL_FACTURACION)) {
      errors.EMAIL_FACTURACION = 'El formato del email no es válido';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validate()) {
      // Mostrar mensaje de error
      openModal('validationError', {
        size: 'sm',
        content: (
          <>
            <Modal.Header>Error de validación</Modal.Header>
            <Modal.Body>
              <div className="flex items-start text-red-600">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">Por favor corrija los siguientes errores:</p>
                  <ul className="mt-2 list-disc pl-5 text-sm">
                    {Object.entries(formErrors).map(([field, message]) => (
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
    setError(null);
    
    try {
      // Preparar data para envío
      const dataToSend = {
        ...formData,
        // Convertir cadenas vacías a null/0 para los selects
        PAIS_ID: formData.PAIS_ID || null,
        PROVINCIA_ID: formData.PROVINCIA_ID || null,
        MUNICIPIO_ID: formData.MUNICIPIO_ID || null,
        PAIS_ID_ENVIO: formData.PAIS_ID_ENVIO || null,
        PROVINCIA_ID_ENVIO: formData.PROVINCIA_ID_ENVIO || null,
        MUNICIPIO_ID_ENVIO: formData.MUNICIPIO_ID_ENVIO || null,
        PAIS_ID_FACTURACION: formData.PAIS_ID_FACTURACION || null,
        PROVINCIA_ID_FACTURACION: formData.PROVINCIA_ID_FACTURACION || null,
        MUNICIPIO_ID_FACTURACION: formData.MUNICIPIO_ID_FACTURACION || null,
        FP_ID: formData.FP_ID || null,
        TARIFA_ID: formData.TARIFA_ID || null,
        PARENT_ID: formData.PARENT_ID || null,
        // Agregar responsables
        responsables: responsibles.map(resp => resp.ID_EMPLEADO)
      };
      
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
            <Modal.Header>Operación exitosa</Modal.Header>
            <Modal.Body>
              <div className="flex items-center text-green-600">
                <Check className="h-6 w-6 mr-2" />
                <p className="font-medium">{isEdit ? 'Cliente actualizado correctamente' : (isClone ? 'Cliente clonado correctamente' : 'Cliente creado correctamente')}</p>
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
      setError(
        err.response?.data?.msg || err.message || 
        `Error al ${isEdit ? 'actualizar' : (isClone ? 'clonar' : 'crear')} el cliente. Por favor, intente nuevamente.`
      );
    } finally {
      setSaving(false);
    }
  };
  
  // Abrir modal de adjuntos
  const handleOpenAdjuntosModal = () => {
    openModal('adjuntosModal', {
      size: '2xl',
      content: (
        <>
          <Modal.Header>Adjuntos</Modal.Header>
          <Modal.Body>
            <AdjuntosModal 
              clientId={formData.ID_CLIENTE} 
            />
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
  };

  return (
    <>
      <Modal.Header>
        <div className="flex items-center">
          <Building size={18} className="mr-2" />
          <span>{isEdit ? 'Editar Cliente' : (isClone ? 'Clonar Cliente' : 'Nuevo Cliente')}</span>
          {isEdit && clientId && <span className="text-sm ml-2 opacity-75">(#{clientId})</span>}
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
              <div className="flex flex-col md:flex-row gap-4">
                {/* Columna izquierda: formulario principal */}
                <div className="md:w-3/5 space-y-3">
                  {/* Datos del Cliente */}
                  <FormSection title="Datos del Cliente">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <FormField
                          label="Nombre"
                          id="NOMBRE"
                          name="NOMBRE"
                          value={formData.NOMBRE}
                          onChange={handleChange}
                          error={formErrors.NOMBRE}
                          required={true}
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="w-1/2">
                          <FormField
                            label="C.I.F."
                            id="CIF"
                            name="CIF"
                            value={formData.CIF}
                            onChange={handleChange}
                          />
                        </div>
                        
                        <div className="w-1/2">
                          <FormField
                            label="Teléfono"
                            id="TELEFONO"
                            name="TELEFONO"
                            value={formData.TELEFONO}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      
                      <div className="col-span-1">
                        <FormField
                          label="FAX"
                          id="FAX"
                          name="FAX"
                          value={formData.FAX}
                          onChange={handleChange}
                        />
                      </div>
                      
                      {/* Checkboxes organizados en una estructura más simétrica */}
                      <div className="col-span-1">
                        <div className="mb-1 flex items-center">
                          <input
                            type="checkbox"
                            id="factura_determinaciones"
                            name="FACTURA_DETERMINACIONES"
                            checked={formData.FACTURA_DETERMINACIONES === 1}
                            onChange={handleChange}
                            className="h-3 w-3"
                          />
                          <label htmlFor="factura_determinaciones" className="ml-1 text-xs text-gray-700">
                            Factura por determinaciones
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-1">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="aeroauto"
                              name="EADS"
                              checked={formData.EADS === 1}
                              onChange={handleChange}
                              className="h-3 w-3"
                            />
                            <label htmlFor="aeroauto" className="ml-1 text-xs text-gray-700">
                              Aeronáutico
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="airbus"
                              name="AIRBUS"
                              checked={formData.AIRBUS === 1}
                              onChange={handleChange}
                              className="h-3 w-3"
                            />
                            <label htmlFor="airbus" className="ml-1 text-xs text-gray-700">
                              Airbus
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="agroalimentario"
                              name="AGROALIMENTARIO"
                              checked={formData.AGROALIMENTARIO === 1}
                              onChange={handleChange}
                              className="h-3 w-3"
                            />
                            <label htmlFor="agroalimentario" className="ml-1 text-xs text-gray-700">
                              Agroalimentario
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="iberia"
                              name="IBERIA"
                              checked={formData.IBERIA === 1}
                              onChange={handleChange}
                              className="h-3 w-3"
                            />
                            <label htmlFor="iberia" className="ml-1 text-xs text-gray-700">
                              Iberia
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="intra"
                              name="INTRA"
                              checked={formData.INTRA === 1}
                              onChange={handleChange}
                              className="h-3 w-3"
                            />
                            <label htmlFor="intra" className="ml-1 text-xs text-gray-700">
                              Intracomunitario
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="extranjero"
                              name="EXTRANJERO"
                              checked={formData.EXTRANJERO === 1}
                              onChange={handleChange}
                              className="h-3 w-3"
                            />
                            <label htmlFor="extranjero" className="ml-1 text-xs text-gray-700">
                              Extracomunitario
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FormSection>
                  
                  {/* Otros Datos */}
                  <FormSection title="Otros Datos">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <FormField
                          label="Centro"
                          id="CENTRO"
                          name="CENTRO"
                          value={formData.CENTRO}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <FormField
                          label="Cargo"
                          id="CARGO"
                          name="CARGO"
                          value={formData.CARGO}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-700 mb-1">
                          Idioma
                        </label>
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="idioma_es"
                              name="IDIOMA_FACTURA"
                              checked={formData.IDIOMA_FACTURA === 1 || formData.IDIOMA_FACTURA === '1'}
                              onChange={() => handleRadioChange(1)}
                              className="h-3 w-3"
                            />
                            <label htmlFor="idioma_es" className="ml-1 text-xs text-gray-700">Español</label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="idioma_en"
                              name="IDIOMA_FACTURA"
                              checked={formData.IDIOMA_FACTURA === 2 || formData.IDIOMA_FACTURA === '2'}
                              onChange={() => handleRadioChange(2)}
                              className="h-3 w-3"
                            />
                            <label htmlFor="idioma_en" className="ml-1 text-xs text-gray-700">Inglés</label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id="idioma_fr"
                              name="IDIOMA_FACTURA"
                              checked={formData.IDIOMA_FACTURA === 3 || formData.IDIOMA_FACTURA === '3'}
                              onChange={() => handleRadioChange(3)}
                              className="h-3 w-3"
                            />
                            <label htmlFor="idioma_fr" className="ml-1 text-xs text-gray-700">Francés</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FormSection>
                  
                  {/* Datos financieros */}
                  <FormSection title="Datos financieros">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <FormField
                          label="Banco"
                          id="BANCO"
                          name="BANCO"
                          value={formData.BANCO}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <FormField
                          label="CCC"
                          id="CUENTA"
                          name="CUENTA"
                          value={formData.CUENTA}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div>
                        <FormField
                          label="Forma Pago"
                          id="FP_ID"
                          name="FP_ID"
                          type="select"
                          value={formData.FP_ID}
                          onChange={handleChange}
                          options={paymentMethodOptions}
                          placeholder="Seleccione..."
                        />
                      </div>
                      
                      <div>
                        <FormField
                          label="Tarifa"
                          id="TARIFA_ID"
                          name="TARIFA_ID"
                          type="select"
                          value={formData.TARIFA_ID}
                          onChange={handleChange}
                          options={rateOptions}
                          placeholder="Seleccione..."
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <div className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            id="factura_electronica"
                            name="FACTURA_ELECTRONICA"
                            checked={formData.FACTURA_ELECTRONICA === 1}
                            onChange={handleChange}
                            className="h-3 w-3"
                          />
                          <label htmlFor="factura_electronica" className="ml-1 text-xs text-gray-700">
                            Factura Electrónica
                          </label>
                        </div>
                      </div>
                    </div>
                  </FormSection>
                </div>
                
                {/* Columna derecha */}
                <div className="md:w-2/5 space-y-3">
                  {/* Cliente Padre */}
                  <FormSection title="Cliente Padre (Delegaciones)">
                    <div className="flex items-center gap-2">
                      <select
                        name="PARENT_ID"
                        value={formData.PARENT_ID || ''}
                        onChange={handleChange}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                      >
                        <option value="">Seleccionar cliente padre...</option>
                        {clientOptions.map(client => (
                          <option key={client.value} value={client.value}>
                            {client.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormSection>
                  
                  {/* Responsables del Cliente */}
                  <FormSection title="Responsables del Cliente">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-grow">
                        <SelectInput
                          options={userOptions}
                          value={selectedResponsible}
                          onChange={(e) => setSelectedResponsible(e.target.value)}
                          placeholder="Buscar usuario..."
                          name="responsible"
                          id="responsible-select"
                          className="text-gray-800"
                          icon={<Search size={14} className="text-gray-400" />}
                        />
                      </div>
                      <button 
                        onClick={handleAddResponsible}
                        disabled={!selectedResponsible}
                        className={`p-1 rounded ${
                          selectedResponsible 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    {responsibles.length > 0 ? (
                      <div className="space-y-1 mt-2">
                        {responsibles.map((resp) => (
                          <div key={resp.ID_EMPLEADO} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-xs">
                            <div className="flex items-center">
                              <User size={12} className="text-gray-500 mr-1" />
                              <span className="text-gray-700">{resp.NOMBRE}</span>
                            </div>
                            <button 
                              onClick={() => handleRemoveResponsible(resp.ID_EMPLEADO)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-gray-500 py-2">
                        No hay responsables añadidos
                      </div>
                    )}
                  </FormSection>
                  
                  {/* Observaciones */}
                  <FormSection title="Observaciones">
                    <FormField
                      type="textarea"
                      id="OBSERVACIONES"
                      name="OBSERVACIONES"
                      value={formData.OBSERVACIONES}
                      onChange={handleChange}
                      rows={4}
                    />
                  </FormSection>
                  
                  {/* Indicadores */}
                  {isEdit && (
                    <FormSection title="Indicadores">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-1 border text-gray-700">Año</th>
                            <th className="px-2 py-1 border text-gray-700">Nº Muestras</th>
                            <th className="px-2 py-1 border text-gray-700">Importe</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="px-2 py-1 border text-gray-700">2024</td>
                            <td className="px-2 py-1 border text-center text-gray-700">2</td>
                            <td className="px-2 py-1 border text-right text-gray-700">247,00 €</td>
                          </tr>
                          <tr className="bg-gray-50">
                            <td className="px-2 py-1 border text-gray-700">2023</td>
                            <td className="px-2 py-1 border text-center text-gray-700">4</td>
                            <td className="px-2 py-1 border text-right text-gray-700">300,00 €</td>
                          </tr>
                          <tr>
                            <td className="px-2 py-1 border text-gray-700">2022</td>
                            <td className="px-2 py-1 border text-center text-gray-700">3</td>
                            <td className="px-2 py-1 border text-right text-gray-700">180,00 €</td>
                          </tr>
                        </tbody>
                      </table>
                    </FormSection>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pestaña Direcciones */}
            <div className="space-y-4">
              {/* Dirección fiscal (principal) */}
              <FormSection title="Dirección Fiscal (Principal)">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <FormField
                      label="Dirección"
                      id="DIRECCION"
                      name="DIRECCION"
                      value={formData.DIRECCION}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <FormField
                        label="C.P."
                        id="COD_POSTAL"
                        name="COD_POSTAL"
                        value={formData.COD_POSTAL}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <FormField
                        label="País"
                        id="PAIS_ID"
                        name="PAIS_ID"
                        type="select"
                        value={formData.PAIS_ID}
                        onChange={handleChange}
                        options={countryOptions}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FormField
                        label="Provincia"
                        id="PROVINCIA_ID"
                        name="PROVINCIA_ID"
                        type="select"
                        value={formData.PROVINCIA_ID}
                        onChange={handleChange}
                        options={provinceOptions}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        label="Municipio"
                        id="MUNICIPIO_ID"
                        name="MUNICIPIO_ID"
                        type="select"
                        value={formData.MUNICIPIO_ID}
                        onChange={handleChange}
                        options={municipalityOptions}
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
              
              {/* Dirección de envío */}
              <FormSection title="Dirección de Envío">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="useMainAddress"
                      name="USE_MAIN_ADDRESS"
                      checked={formData.USE_MAIN_ADDRESS === 1}
                      onChange={(e) => {
                        handleChange({
                          target: {
                            name: 'USE_MAIN_ADDRESS',
                            type: 'checkbox',
                            checked: e.target.checked
                          }
                        });
                        
                        // Si está marcado, copiar la dirección principal
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            DIRECCION_ENVIO: prev.DIRECCION,
                            COD_POSTAL_ENVIO: prev.COD_POSTAL,
                            PAIS_ID_ENVIO: prev.PAIS_ID,
                            PROVINCIA_ID_ENVIO: prev.PROVINCIA_ID,
                            MUNICIPIO_ID_ENVIO: prev.MUNICIPIO_ID
                          }));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="useMainAddress" className="ml-2 text-xs text-gray-700">
                      Usar la misma dirección fiscal
                    </label>
                  </div>
                  
                  <div>
                    <FormField
                      label="Dirección"
                      id="DIRECCION_ENVIO"
                      name="DIRECCION_ENVIO"
                      value={formData.DIRECCION_ENVIO}
                      onChange={handleChange}
                      disabled={formData.USE_MAIN_ADDRESS === 1}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <FormField
                        label="C.P."
                        id="COD_POSTAL_ENVIO"
                        name="COD_POSTAL_ENVIO"
                        value={formData.COD_POSTAL_ENVIO}
                        onChange={handleChange}
                        disabled={formData.USE_MAIN_ADDRESS === 1}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <FormField
                        label="País"
                        id="PAIS_ID_ENVIO"
                        name="PAIS_ID_ENVIO"
                        type="select"
                        value={formData.PAIS_ID_ENVIO}
                        onChange={handleChange}
                        options={countryOptions}
                        disabled={formData.USE_MAIN_ADDRESS === 1}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FormField
                        label="Provincia"
                        id="PROVINCIA_ID_ENVIO"
                        name="PROVINCIA_ID_ENVIO"
                        type="select"
                        value={formData.PROVINCIA_ID_ENVIO}
                        onChange={handleChange}
                        options={provinceOptions}
                        disabled={formData.USE_MAIN_ADDRESS === 1}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        label="Municipio"
                        id="MUNICIPIO_ID_ENVIO"
                        name="MUNICIPIO_ID_ENVIO"
                        type="select"
                        value={formData.MUNICIPIO_ID_ENVIO}
                        onChange={handleChange}
                        options={municipalityOptions}
                        disabled={formData.USE_MAIN_ADDRESS === 1}
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
              
              {/* Dirección de facturación */}
              <FormSection title="Dirección de Facturación">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="useMainAddressBilling"
                      name="USE_MAIN_ADDRESS_BILLING"
                      checked={formData.USE_MAIN_ADDRESS_BILLING === 1}
                      onChange={(e) => {
                        handleChange({
                          target: {
                            name: 'USE_MAIN_ADDRESS_BILLING',
                            type: 'checkbox',
                            checked: e.target.checked
                          }
                        });
                        
                        // Si está marcado, copiar la dirección principal
                        if (e.target.checked) {
                          setFormData(prev => ({
                            ...prev,
                            DIRECCION_FACTURACION: prev.DIRECCION,
                            COD_POSTAL_FACTURACION: prev.COD_POSTAL,
                            PAIS_ID_FACTURACION: prev.PAIS_ID,
                            PROVINCIA_ID_FACTURACION: prev.PROVINCIA_ID,
                            MUNICIPIO_ID_FACTURACION: prev.MUNICIPIO_ID
                          }));
                        }
                      }}
                      className="h-3 w-3"
                    />
                    <label htmlFor="useMainAddressBilling" className="ml-2 text-xs text-gray-700">
                      Usar la misma dirección fiscal
                    </label>
                  </div>
                  
                  <div>
                    <FormField
                      label="Dirección"
                      id="DIRECCION_FACTURACION"
                      name="DIRECCION_FACTURACION"
                      value={formData.DIRECCION_FACTURACION}
                      onChange={handleChange}
                      disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <FormField
                        label="C.P."
                        id="COD_POSTAL_FACTURACION"
                        name="COD_POSTAL_FACTURACION"
                        value={formData.COD_POSTAL_FACTURACION}
                        onChange={handleChange}
                        disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
                      />
                    </div>
                    
                    <div className="col-span-2">
                      <FormField
                        label="País"
                        id="PAIS_ID_FACTURACION"
                        name="PAIS_ID_FACTURACION"
                        type="select"
                        value={formData.PAIS_ID_FACTURACION}
                        onChange={handleChange}
                        options={countryOptions}
                        disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FormField
                        label="Provincia"
                        id="PROVINCIA_ID_FACTURACION"
                        name="PROVINCIA_ID_FACTURACION"
                        type="select"
                        value={formData.PROVINCIA_ID_FACTURACION}
                        onChange={handleChange}
                        options={provinceOptions}
                        disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
                      />
                    </div>
                    
                    <div>
                      <FormField
                        label="Municipio"
                        id="MUNICIPIO_ID_FACTURACION"
                        name="MUNICIPIO_ID_FACTURACION"
                        type="select"
                        value={formData.MUNICIPIO_ID_FACTURACION}
                        onChange={handleChange}
                        options={municipalityOptions}
                        disabled={formData.USE_MAIN_ADDRESS_BILLING === 1}
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
            
            {/* Pestaña Correos */}
            <div className="space-y-4">
              <FormSection title="Gestión de Correos">
                <div className="space-y-2">
                  <FormField
                    label="Email Principal"
                    id="EMAIL"
                    name="EMAIL"
                    type="email"
                    value={formData.EMAIL}
                    onChange={handleChange}
                    error={formErrors.EMAIL}
                  />
                  
                  <FormField
                    label="Email Secundario"
                    id="EMAIL2"
                    name="EMAIL2"
                    type="email"
                    value={formData.EMAIL2}
                    onChange={handleChange}
                    error={formErrors.EMAIL2}
                  />
                  
                  <FormField
                    label="Email Facturación"
                    id="EMAIL_FACTURACION"
                    name="EMAIL_FACTURACION"
                    type="email"
                    value={formData.EMAIL_FACTURACION}
                    onChange={handleChange}
                    error={formErrors.EMAIL_FACTURACION}
                  />
                </div>
              </FormSection>
            </div>
          </TabPanel>
        )}
        
        {/* Error General */}
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-700 rounded border border-red-200 flex items-start">
            <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex w-full justify-between">
          <div className="flex space-x-2">
            {isEdit && (
              <button 
                onClick={handleOpenAdjuntosModal}
                className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200"
              >
                <Paperclip size={14} className="mr-1" />
                Adjuntos
              </button>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center px-4 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving ? (
                <>
                  <RotateCw size={14} className="mr-1 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check size={14} className="mr-1" />
                  Aceptar
                </>
              )}
            </button>
            
            <button 
              onClick={onCancel}
              className="flex items-center px-4 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
            >
              <X size={14} className="mr-1" />
              Cancelar
            </button>
          </div>
        </div>
      </Modal.Footer>
    </>
  );
};

// Wrap con React.memo para prevenir re-renderizados innecesarios
export default React.memo(ClientForm);