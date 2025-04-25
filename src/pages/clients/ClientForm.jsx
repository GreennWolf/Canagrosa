import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/apiClient';
import { 
  Save, 
  X, 
  AlertCircle, 
  ArrowLeft,
  RotateCw,
  Users,
  Building,
  Phone,
  Mail,
  MapPin,
  Hash,
  FileText,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import ThemeConstants from '../../constants/ThemeConstants';

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
  icon = null
}) => {
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className={`block ${ThemeConstants.text.sm} font-medium ${ThemeConstants.textColors.primary} mb-1`}
      >
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon, { size: 16, className: ThemeConstants.textColors.light })}
          </div>
        )}
        
        {type === 'select' ? (
          <select
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
              error ? 'border-red-300' : ThemeConstants.borders.input
            } ${ThemeConstants.rounded.md} ${ThemeConstants.shadows.sm} ${ThemeConstants.bgColors.input} ${ThemeConstants.textColors.primary} focus:outline-none ${ThemeConstants.borders.focus} ${
              disabled ? ThemeConstants.bgColors.page : ''
            }`}
          >
            <option value="">Seleccione...</option>
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
            rows={4}
            className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
              error ? 'border-red-300' : ThemeConstants.borders.input
            } ${ThemeConstants.rounded.md} ${ThemeConstants.shadows.sm} ${ThemeConstants.bgColors.input} ${ThemeConstants.textColors.primary} focus:outline-none ${ThemeConstants.borders.focus} ${
              disabled ? ThemeConstants.bgColors.page : ''
            }`}
          />
        ) : (
          <input
            type={type}
            id={id}
            name={id}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            className={`w-full ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border ${
              error ? 'border-red-300' : ThemeConstants.borders.input
            } ${ThemeConstants.rounded.md} ${ThemeConstants.shadows.sm} ${ThemeConstants.bgColors.input} ${ThemeConstants.textColors.primary} focus:outline-none ${ThemeConstants.borders.focus} ${
              disabled ? ThemeConstants.bgColors.page : ''
            }`}
          />
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

const ClientForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
  // Catálogos para dropdowns
  const [countries, setCountries] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [rates, setRates] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    ID_CLIENTE: '',
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
    IDIOMA_FACTURA: 0,
    FP_ID: '',
    TARIFA_ID: '',
    CLAVEWEB: 0
  });

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        // Cargar países
        const countriesResponse = await api.catalogs.getCountries();
        setCountries(
          countriesResponse.data.map((country) => ({
            value: country.ID_PAIS,
            label: country.NOMBRE
          }))
        );
        
        // Cargar formas de pago
        const paymentMethodsResponse = await api.catalogs.getPaymentMethods();
        setPaymentMethods(
          paymentMethodsResponse.data.map((method) => ({
            value: method.ID_FP,
            label: method.NOMBRE
          }))
        );
        
        // Cargar tarifas
        const ratesResponse = await api.catalogs.getRates();
        setRates(
          ratesResponse.data.map((rate) => ({
            value: rate.ID_TARIFA,
            label: rate.NOMBRE
          }))
        );
      } catch (err) {
        console.error('Error loading catalogs:', err);
        setError('Error al cargar los datos necesarios para el formulario.');
      }
    };
    
    fetchCatalogs();
  }, []);

  // Cargar cliente si estamos en modo edición
  useEffect(() => {
    const fetchClient = async () => {
      if (isEdit && id) {
        setLoading(true);
        try {
          const response = await api.clients.getById(id);
          if (response.data && response.data.length > 0) {
            const clientData = response.data[0];
            setFormData({
              ...clientData,
              // Asegurar que todos los campos estén presentes
              ANULADO: clientData.ANULADO || 0,
              FACTURA_DETERMINACIONES: clientData.FACTURA_DETERMINACIONES || 0,
              EADS: clientData.EADS || 0,
              AIRBUS: clientData.AIRBUS || 0,
              IBERIA: clientData.IBERIA || 0,
              AGROALIMENTARIO: clientData.AGROALIMENTARIO || 0,
              EXTRANJERO: clientData.EXTRANJERO || 0,
              INTRA: clientData.INTRA || 0,
              IDIOMA_FACTURA: clientData.IDIOMA_FACTURA || 0,
              CLAVEWEB: clientData.CLAVEWEB || 0
            });
            
            // Si tiene país seleccionado, cargar provincias
            if (clientData.PAIS_ID) {
              loadProvinces(clientData.PAIS_ID);
            }
            
            // Si tiene provincia seleccionada, cargar municipios
            if (clientData.PROVINCIA_ID) {
              loadMunicipalities(clientData.PROVINCIA_ID);
            }
          }
        } catch (err) {
          console.error('Error fetching client data:', err);
          setError('Error al cargar los datos del cliente. Por favor, intente nuevamente.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchClient();
  }, [isEdit, id]);

  // Cargar provincias cuando cambia el país
  const loadProvinces = async (paisId) => {
    try {
      const response = await api.catalogs.getProvinces({ PAIS_ID: paisId });
      setProvinces(
        response.data.map((province) => ({
          value: province.ID_PROVINCIA,
          label: province.NOMBRE
        }))
      );
      
      // Limpiar provincia y municipio si cambia el país
      if (formData.PAIS_ID !== paisId) {
        setFormData(prev => ({
          ...prev,
          PROVINCIA_ID: '',
          MUNICIPIO_ID: ''
        }));
        setMunicipalities([]);
      }
    } catch (err) {
      console.error('Error loading provinces:', err);
    }
  };

  // Cargar municipios cuando cambia la provincia
  const loadMunicipalities = async (provinciaId) => {
    try {
      const response = await api.catalogs.getMunicipalities({ PROVINCIA_ID: provinciaId });
      setMunicipalities(
        response.data.map((municipality) => ({
          value: municipality.ID_MUNICIPIO,
          label: municipality.NOMBRE
        }))
      );
      
      // Limpiar municipio si cambia la provincia
      if (formData.PROVINCIA_ID !== provinciaId) {
        setFormData(prev => ({
          ...prev,
          MUNICIPIO_ID: ''
        }));
      }
    } catch (err) {
      console.error('Error loading municipalities:', err);
    }
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkboxes, usar el valor de checked (0 o 1)
    const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Cargar datos relacionados si es necesario
    if (name === 'PAIS_ID' && value) {
      loadProvinces(value);
    } else if (name === 'PROVINCIA_ID' && value) {
      loadMunicipalities(value);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    // Validar campos requeridos
    if (!formData.NOMBRE.trim()) {
      errors.NOMBRE = 'El nombre es obligatorio';
    }
    
    // Validar email
    if (formData.EMAIL && !/\S+@\S+\.\S+/.test(formData.EMAIL)) {
      errors.EMAIL = 'El formato del email no es válido';
    }
    
    // Validar teléfono (formato básico)
    if (formData.TELEFONO && !/^[0-9\s\-\+]+$/.test(formData.TELEFONO)) {
      errors.TELEFONO = 'El formato del teléfono no es válido';
    }
    
    // Validar código postal (formato básico)
    if (formData.COD_POSTAL && !/^[0-9]+$/.test(formData.COD_POSTAL)) {
      errors.COD_POSTAL = 'El código postal debe contener solo números';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      if (isEdit) {
        // Actualizar cliente existente
        await api.clients.update(formData);
      } else {
        // Crear nuevo cliente
        await api.clients.create(formData);
      }
      
      setSuccess(true);
      
      // Redireccionar después de un breve retraso
      setTimeout(() => {
        navigate('/clientes');
      }, 1500);
    } catch (err) {
      console.error('Error saving client:', err);
      setError(
        err.response?.data?.msg || 
        'Error al guardar el cliente. Por favor, intente nuevamente.'
      );
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    // Si hay cambios, mostrar confirmación
    if (isEdit && Object.keys(formErrors).length > 0) {
      setShowConfirmCancel(true);
    } else {
      navigate('/clientes');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/clientes')}
            className="p-2 rounded-full hover:bg-slate-200"
          >
            <ArrowLeft size={20} className={ThemeConstants.textColors.primary} />
          </button>
          <h1 className={`text-2xl font-bold ${ThemeConstants.textColors.primary}`}>
            {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className={`px-4 py-2 ${ThemeConstants.borders.default} ${ThemeConstants.rounded.md} ${ThemeConstants.textColors.primary} hover:bg-slate-100 flex items-center`}
            disabled={saving}
          >
            <X size={16} className="mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 ${ThemeConstants.buttons.primary} ${ThemeConstants.rounded.md} flex items-center`}
            disabled={saving}
          >
            {saving ? (
              <>
                <RotateCw size={16} className="mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className={`${ThemeConstants.states.error} p-4 ${ThemeConstants.rounded.md} ${ThemeConstants.borders.default}`}>
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}
      
      {/* Mensaje de éxito */}
      {success && (
        <div className={`${ThemeConstants.states.success} p-4 ${ThemeConstants.rounded.md} ${ThemeConstants.borders.default}`}>
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">
              Cliente {isEdit ? 'actualizado' : 'creado'} correctamente
            </span>
          </div>
        </div>
      )}
      
      {/* Formulario */}
      <form className={`${ThemeConstants.bgColors.card} ${ThemeConstants.shadows.sm} ${ThemeConstants.rounded.lg} overflow-hidden ${ThemeConstants.borders.card}`}>
        {/* Información básica */}
        <div className="p-6 border-b border-slate-200">
          <h2 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Información Básica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              id="NOMBRE"
              name="NOMBRE"
              label="Nombre del Cliente"
              value={formData.NOMBRE}
              onChange={handleChange}
              error={formErrors.NOMBRE}
              required={true}
              icon={<Building />}
            />
            
            <FormField
              id="CIF"
              name="CIF"
              label="CIF/NIF"
              value={formData.CIF}
              onChange={handleChange}
              error={formErrors.CIF}
              icon={<Hash />}
            />
            
            <FormField
              id="RESPONSABLE"
              name="RESPONSABLE"
              label="Responsable"
              value={formData.RESPONSABLE}
              onChange={handleChange}
              error={formErrors.RESPONSABLE}
              icon={<Users />}
            />
            
            <FormField
              id="TELEFONO"
              name="TELEFONO"
              label="Teléfono"
              value={formData.TELEFONO}
              onChange={handleChange}
              error={formErrors.TELEFONO}
              icon={<Phone />}
            />
            
            <FormField
              id="FAX"
              name="FAX"
              label="Fax"
              value={formData.FAX}
              onChange={handleChange}
              error={formErrors.FAX}
              icon={<Phone />}
            />
            
            <FormField
              id="EMAIL"
              name="EMAIL"
              label="Email"
              type="email"
              value={formData.EMAIL}
              onChange={handleChange}
              error={formErrors.EMAIL}
              icon={<Mail />}
            />
          </div>
        </div>
        
        {/* Dirección */}
        <div className="p-6 border-b border-slate-200">
          <h2 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Dirección</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              id="DIRECCION"
              name="DIRECCION"
              label="Dirección"
              value={formData.DIRECCION}
              onChange={handleChange}
              error={formErrors.DIRECCION}
              icon={<MapPin />}
            />
            
            <FormField
              id="COD_POSTAL"
              name="COD_POSTAL"
              label="Código Postal"
              value={formData.COD_POSTAL}
              onChange={handleChange}
              error={formErrors.COD_POSTAL}
              icon={<MapPin />}
            />
            
            <FormField
              id="PAIS_ID"
              name="PAIS_ID"
              label="País"
              type="select"
              value={formData.PAIS_ID}
              onChange={handleChange}
              error={formErrors.PAIS_ID}
              options={countries}
              icon={<MapPin />}
            />
            
            <FormField
              id="PROVINCIA_ID"
              name="PROVINCIA_ID"
              label="Provincia"
              type="select"
              value={formData.PROVINCIA_ID}
              onChange={handleChange}
              error={formErrors.PROVINCIA_ID}
              options={provinces}
              disabled={!formData.PAIS_ID}
              icon={<MapPin />}
            />
            
            <FormField
              id="MUNICIPIO_ID"
              name="MUNICIPIO_ID"
              label="Municipio"
              type="select"
              value={formData.MUNICIPIO_ID}
              onChange={handleChange}
              error={formErrors.MUNICIPIO_ID}
              options={municipalities}
              disabled={!formData.PROVINCIA_ID}
              icon={<MapPin />}
            />
          </div>
        </div>
        
        {/* Información comercial */}
        <div className="p-6 border-b border-slate-200">
          <h2 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Información Comercial</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              id="FP_ID"
              name="FP_ID"
              label="Forma de Pago"
              type="select"
              value={formData.FP_ID}
              onChange={handleChange}
              error={formErrors.FP_ID}
              options={paymentMethods}
              required={true}
              icon={<DollarSign />}
            />
            
            <FormField
              id="TARIFA_ID"
              name="TARIFA_ID"
              label="Tarifa"
              type="select"
              value={formData.TARIFA_ID}
              onChange={handleChange}
              error={formErrors.TARIFA_ID}
              options={rates}
              icon={<DollarSign />}
            />
            
            <div className="flex flex-col space-y-2 mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="FACTURA_DETERMINACIONES"
                  checked={formData.FACTURA_DETERMINACIONES === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>Factura determinaciones</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="EADS"
                  checked={formData.EADS === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>EADS</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="AIRBUS"
                  checked={formData.AIRBUS === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>AIRBUS</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="IBERIA"
                  checked={formData.IBERIA === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>IBERIA</span>
              </label>
            </div>
            
            <div className="flex flex-col space-y-2 mt-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="AGROALIMENTARIO"
                  checked={formData.AGROALIMENTARIO === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>Agroalimentario</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="EXTRANJERO"
                  checked={formData.EXTRANJERO === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>Extranjero</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="INTRA"
                  checked={formData.INTRA === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>INTRA</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="ANULADO"
                  checked={formData.ANULADO === 1}
                  onChange={handleChange}
                  className={`rounded ${ThemeConstants.borders.input} text-blue-600 focus:ring-blue-500 h-4 w-4`}
                />
                <span className={`ml-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>Anulado</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Observaciones */}
        <div className="p-6">
          <h2 className={`text-lg font-medium mb-4 ${ThemeConstants.textColors.primary}`}>Observaciones</h2>
          <FormField
            id="OBSERVACIONES"
            name="OBSERVACIONES"
            label="Observaciones"
            type="textarea"
            value={formData.OBSERVACIONES}
            onChange={handleChange}
            error={formErrors.OBSERVACIONES}
            icon={<FileText />}
          />
        </div>
      </form>
      
      {/* Modal de confirmación para cancelar */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${ThemeConstants.bgColors.card} ${ThemeConstants.rounded.lg} ${ThemeConstants.shadows.lg} p-6 max-w-md w-full`}>
            <h3 className={`text-lg font-medium ${ThemeConstants.textColors.primary} mb-4`}>Confirmar cancelación</h3>
            <p className={`${ThemeConstants.textColors.secondary} mb-4`}>
              ¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className={`px-4 py-2 ${ThemeConstants.borders.default} ${ThemeConstants.rounded.md} ${ThemeConstants.textColors.primary} hover:bg-slate-100`}
              >
                No, continuar editando
              </button>
              <button
                onClick={() => navigate('/clientes')}
                className={`px-4 py-2 ${ThemeConstants.buttons.primary} ${ThemeConstants.rounded.md}`}
              >
                Sí, descartar cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientForm;