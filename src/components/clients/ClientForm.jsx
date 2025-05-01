import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Save, 
  X, 
  AlertCircle, 
  ArrowLeft,
  RotateCw,
  Paperclip,
  Building,
  Users,
  Phone,
  MapPin,
  CreditCard,
  Globe,
  DollarSign,
  FileText,
  Mail,
  AlertTriangle,
  Check,
  Copy,
  Eye,
  Plus,
  Minus,
  User,
  BarChart2
} from 'lucide-react';
import clientService from '../../services/clientService';
import { useModal } from '../../contexts/ModalContext';
import AdjuntosModal from './AdjuntosModal';
import SelectInput from '../../components/common/SelectInput';

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
          }`}
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
          }`}
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
          <label htmlFor={id} className="ml-2 block text-xs text-gray-700">
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
          }`}
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
      <h3 className="text-xs font-bold mb-2 border-b border-gray-200 pb-1">{title}</h3>
      {children}
    </div>
  );
};

const ClientForm = ({ 
  clientId, 
  isEdit = false,
  onSuccess,
  onCancel 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openModal, closeModal } = useModal();
  
  // Estados principales
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [showAdjuntosModal, setShowAdjuntosModal] = useState(false);
  
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
    FACTURA_ELECTRONICA: 1
  });
  
  // Estado para errores del formulario
  const [formErrors, setFormErrors] = useState({});
  
  // Catálogos para los selectores
  const [catalogs, setCatalogs] = useState({
    countries: [],
    provinces: [],
    municipalities: [],
    paymentMethods: [],
    rates: [],
    clients: []
  });
  
  // Datos de ejemplo para indicadores (en un caso real, vendrían de la API)
  const indicadores = [
    { año: '2024', muestras: 2, importe: '247,00 €' },
    { año: '2023', muestras: 4, importe: '300,00 €' },
    { año: '2022', muestras: 3, importe: '180,00 €' }
  ];
  
  // Cargar cliente si estamos editando
  useEffect(() => {
    if (isEdit && clientId) {
      const fetchClient = async () => {
        setLoading(true);
        try {
          const response = await clientService.getById(clientId);
          if (response.data && response.data.length > 0) {
            setClient(response.data[0]);
            setFormData({
              ...formData,
              ...response.data[0]
            });
          } else {
            setError('No se encontró información del cliente');
          }
        } catch (err) {
          console.error('Error fetching client:', err);
          setError('Error al cargar los datos del cliente');
        } finally {
          setLoading(false);
        }
      };
      
      fetchClient();
    }
  }, [clientId, isEdit]);
  
  // Cargar catálogos
  useEffect(() => {
    const loadCatalogs = async () => {
      setLoading(true);
      try {
        // Cargar países
        const countriesResponse = await clientService.catalogs.getCountries();
        const countries = countriesResponse.data.map(country => ({
          value: country.ID_PAIS,
          label: country.NOMBRE
        }));
        
        // Cargar formas de pago
        const paymentMethodsResponse = await clientService.catalogs.getPaymentMethods();
        const paymentMethods = paymentMethodsResponse.data.map(method => ({
          value: method.ID_FP,
          label: method.NOMBRE
        }));
        
        // Cargar tarifas
        const ratesResponse = await clientService.catalogs.getRates();
        const rates = ratesResponse.data.map(rate => ({
          value: rate.ID_TARIFA,
          label: rate.NOMBRE
        }));
        
        // Cargar lista de clientes para el selector de cliente padre
        const clientsResponse = await clientService.getForCombo();
        const clients = clientsResponse.data.map(client => ({
          value: client.ID_CLIENTE,
          label: client.NOMBRE
        }));
        
        setCatalogs({
          ...catalogs,
          countries,
          paymentMethods,
          rates,
          clients
        });
      } catch (err) {
        console.error('Error loading catalogs:', err);
        setError('Error al cargar los datos de catálogos');
      } finally {
        setLoading(false);
      }
    };
    
    loadCatalogs();
  }, []);
  
  // Cargar provincias cuando cambia el país
  useEffect(() => {
    if (formData.PAIS_ID) {
      const loadProvinces = async () => {
        try {
          const response = await clientService.catalogs.getProvinces({ PAIS_ID: formData.PAIS_ID });
          const provinces = response.data.map(province => ({
            value: province.ID_PROVINCIA,
            label: province.NOMBRE
          }));
          
          setCatalogs({
            ...catalogs,
            provinces
          });
        } catch (err) {
          console.error('Error loading provinces:', err);
        }
      };
      
      loadProvinces();
    }
  }, [formData.PAIS_ID]);
  
  // Cargar municipios cuando cambia la provincia
  useEffect(() => {
    if (formData.PROVINCIA_ID) {
      const loadMunicipalities = async () => {
        try {
          const response = await clientService.catalogs.getMunicipalities({ PROVINCIA_ID: formData.PROVINCIA_ID });
          const municipalities = response.data.map(municipality => ({
            value: municipality.ID_MUNICIPIO,
            label: municipality.NOMBRE
          }));
          
          setCatalogs({
            ...catalogs,
            municipalities
          });
        } catch (err) {
          console.error('Error loading municipalities:', err);
        }
      };
      
      loadMunicipalities();
    }
  }, [formData.PROVINCIA_ID]);
  
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
        title: 'Error de validación',
        size: 'sm',
        content: (
          <div className="p-4">
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
          </div>
        )
      });
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      let response;
      
      if (isEdit) {
        response = await clientService.update(formData);
      } else {
        response = await clientService.create(formData);
      }
      
      setSuccess(true);
      
      // Mostrar mensaje de éxito
      openModal('successModal', {
        title: 'Operación exitosa',
        size: 'sm',
        content: (
          <div className="p-4">
            <div className="flex items-center text-green-600">
              <Check className="h-6 w-6 mr-2" />
              <p className="font-medium">{isEdit ? 'Cliente actualizado correctamente' : 'Cliente creado correctamente'}</p>
            </div>
          </div>
        )
      });
      
      // Cerrar el modal después de un breve retraso
      setTimeout(() => {
        closeModal('successModal');
        if (onSuccess) onSuccess(response.data);
      }, 1500);
      
    } catch (err) {
      console.error('Error saving client:', err);
      setError(
        err.response?.data?.msg || 
        `Error al ${isEdit ? 'actualizar' : 'crear'} el cliente. Por favor, intente nuevamente.`
      );
      setSaving(false);
    }
  };
  
  // Cancelar edición
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/clientes');
    }
  };
  
  // Abrir modal de adjuntos
  const handleOpenAdjuntosModal = () => {
    openModal('adjuntosModal', {
      title: '',
      size: '2xl',
      headerClassName: 'hidden',
      content: (
        <AdjuntosModal 
          clientId={formData.ID_CLIENTE} 
          onClose={() => closeModal('adjuntosModal')}
        />
      )
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 rounded-lg shadow overflow-hidden">
      {/* Cabecera */}
      <div className="bg-blue-600 text-white px-4 py-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isEdit ? 'Modificación de Cliente' : 'Nuevo Cliente'}
        </h2>
        <button 
          onClick={handleCancel}
          className="text-white hover:text-red-200"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Pestañas */}
      <div className="flex border-b bg-gray-200">
        <button 
          className={`px-4 py-1 text-sm border-r ${
            activeTab === 'general' 
              ? 'bg-white text-gray-800 font-medium border-b-0' 
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button 
          className={`px-4 py-1 text-sm border-r ${
            activeTab === 'direcciones' 
              ? 'bg-white text-gray-800 font-medium border-b-0' 
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('direcciones')}
        >
          Direcciones
        </button>
        <button 
          className={`px-4 py-1 text-sm ${
            activeTab === 'emails' 
              ? 'bg-white text-gray-800 font-medium border-b-0' 
              : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setActiveTab('emails')}
        >
          Correos
        </button>
      </div>
      
      {/* Contenido principal */}
      <div className="p-2 bg-white overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="flex flex-col md:flex-row gap-2">
          {/* Columna izquierda: formulario principal */}
          <div className="md:w-3/5 space-y-3">
            {activeTab === 'general' && (
              <>
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
                    
                    <div className="flex gap-2">
                      <div className="w-1/2">
                        <FormField
                          label="FAX"
                          id="FAX"
                          name="FAX"
                          value={formData.FAX}
                          onChange={handleChange}
                        />
                      </div>
                      
                      <div className="w-1/2 flex flex-col gap-1 mt-3">
                        <div className="flex items-center">
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
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="aeroauto"
                              name="AIRBUS"
                              checked={formData.AIRBUS === 1}
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
                        </div>
                        
                        <div className="flex items-center space-x-4">
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
                        </div>
                        
                        <div className="flex items-center space-x-4">
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
                  </div>
                </FormSection>
                
                {/* Otros Datos */}
                <FormSection title="Otros Datos">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <FormField
                        label="Responsable"
                        id="RESPONSABLE"
                        name="RESPONSABLE"
                        value={formData.RESPONSABLE}
                        onChange={handleChange}
                      />
                    </div>
                    
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
                    
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">
                        Idioma
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="idioma_es"
                            name="IDIOMA_FACTURA"
                            value="1"
                            checked={formData.IDIOMA_FACTURA === 1 || formData.IDIOMA_FACTURA === '1'}
                            onChange={() => setFormData({...formData, IDIOMA_FACTURA: 1})}
                            className="h-3 w-3"
                          />
                          <label htmlFor="idioma_es" className="ml-1 text-xs">Español</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="idioma_en"
                            name="IDIOMA_FACTURA"
                            value="2"
                            checked={formData.IDIOMA_FACTURA === 2 || formData.IDIOMA_FACTURA === '2'}
                            onChange={() => setFormData({...formData, IDIOMA_FACTURA: 2})}
                            className="h-3 w-3"
                          />
                          <label htmlFor="idioma_en" className="ml-1 text-xs">Inglés</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="idioma_fr"
                            name="IDIOMA_FACTURA"
                            value="3"
                            checked={formData.IDIOMA_FACTURA === 3 || formData.IDIOMA_FACTURA === '3'}
                            onChange={() => setFormData({...formData, IDIOMA_FACTURA: 3})}
                            className="h-3 w-3"
                          />
                          <label htmlFor="idioma_fr" className="ml-1 text-xs">Francés</label>
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
                        options={catalogs.paymentMethods}
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
                        options={catalogs.rates}
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
                
                {/* Cliente Padre */}
                <FormSection title="Cliente Padre (Delegaciones)">
                  <div className="flex items-center gap-2">
                    <select
                      name="PARENT_ID"
                      value={formData.PARENT_ID || ''}
                      onChange={handleChange}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar cliente padre...</option>
                      {catalogs.clients.map(client => (
                        <option key={client.value} value={client.value}>
                          {client.label}
                        </option>
                      ))}
                    </select>
                    
                    <button className="text-xs text-blue-600 p-1 hover:bg-blue-50 rounded">
                      <Eye size={14} />
                    </button>
                    
                    <button className="text-xs text-red-600 p-1 hover:bg-red-50 rounded">
                      <X size={14} />
                    </button>
                    
                    <button className="text-xs text-blue-600 p-1 hover:bg-blue-50 rounded">
                      <Copy size={14} />
                    </button>
                  </div>
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
              </>
            )}
            
            {activeTab === 'direcciones' && (
              <FormSection title="Dirección Fiscal">
                <div className="grid grid-cols-1 gap-2">
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
                        options={catalogs.countries}
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
                        options={catalogs.provinces}
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
                        options={catalogs.municipalities}
                      />
                    </div>
                  </div>
                </div>
              </FormSection>
            )}
            
            {activeTab === 'emails' && (
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
            )}
          </div>
          
          {/* Columna derecha: información adicional */}
          <div className="md:w-2/5 space-y-3">
            {/* Responsables del Cliente */}
            <FormSection title="Responsables del Cliente">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-left border-b">Nombre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-1 border-b">{formData.RESPONSABLE || '(Sin responsables)'}</td>
                  </tr>
                </tbody>
              </table>
              
              <div className="flex justify-end mt-2 space-x-1">
                <button className="bg-green-100 p-1 rounded hover:bg-green-200">
                  <Plus size={14} className="text-green-700" />
                </button>
                <button className="bg-red-100 p-1 rounded hover:bg-red-200">
                  <X size={14} className="text-red-700" />
                </button>
              </div>
            </FormSection>
            
            {/* Indicadores */}
            <FormSection title="Indicadores">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1 border">Año</th>
                    <th className="px-2 py-1 border">Nº Muestras</th>
                    <th className="px-2 py-1 border">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-2 py-1 border">{item.año}</td>
                      <td className="px-2 py-1 border text-center">{item.muestras}</td>
                      <td className="px-2 py-1 border text-right">{item.importe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </FormSection>
            
            {/* Calibry */}
            <FormSection title="CALIBRY">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-700">ID</label>
                <input
                  type="text"
                  name="CALIBRY_ID"
                  value={formData.CALIBRY_ID || ''}
                  onChange={handleChange}
                  className="w-40 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </FormSection>
          </div>
        </div>
      </div>
      
      {/* Pie con botones */}
      <div className="px-2 py-2 bg-gray-200 border-t flex justify-between items-center">
        {/* Lado izquierdo: botones de navegación */}
        <div className="flex space-x-2">
          <button 
            onClick={handleOpenAdjuntosModal}
            className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200"
          >
            <Paperclip size={14} className="mr-1" />
            Adjuntos
          </button>
          
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <FileText size={14} className="mr-1" />
            Pedidos
          </button>
          
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <Globe size={14} className="mr-1" />
            Direcciones
          </button>
          
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <AlertTriangle size={14} className="mr-1" />
            Ofertas
          </button>
        </div>
        
        {/* Lado derecho: botones de acciones */}
        <div className="flex space-x-2">
          <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-300">
            <BarChart2 size={14} className="mr-1" />
            Historial Cambios
          </button>
          
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
            onClick={handleCancel}
            className="flex items-center px-4 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
          >
            <X size={14} className="mr-1" />
            ESC-Salir
          </button>
        </div>
      </div>
      
      {/* Error General */}
      {error && (
        <div className="m-2 p-2 bg-red-50 text-red-700 rounded border border-red-200 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ClientForm;