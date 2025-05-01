import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import clientesService from '../../services/clientesService';
import tiposMuestraService from '../../services/tiposMuestraService';
import tiposAnalisisService from '../../services/tiposAnalisisService';
import banosService from '../../services/banosService';
import centrosService from '../../services/centrosService';
import entidadesMuestreoService from '../../services/entidadesMuestreoService';
import entidadesEntregaService from '../../services/entidadesEntregaService';
import formatosService from '../../services/formatosService';
import usuariosService from '../../services/usuariosService';
import muestrasService from '../../services/muestrasService';
import { 
  Save, 
  X, 
  AlertCircle, 
  ArrowLeft,
  RotateCw,
  Plus,
  Minus,
  Calendar,
  Beaker,
  Briefcase,
  AlertTriangle,
  FileText,
  CheckCircle
} from 'lucide-react';

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
  icon = null,
  className = ''
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon, { size: 16, className: 'text-gray-400' })}
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
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              disabled ? 'bg-gray-100' : ''
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
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              disabled ? 'bg-gray-100' : ''
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
              error ? 'border-red-300' : 'border-gray-300'
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              disabled ? 'bg-gray-100' : ''
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

const SampleForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  
  // Estado para los catálogos/dropdowns
  const [clients, setClients] = useState([]);
  const [sampleTypes, setSampleTypes] = useState([]);
  const [analysisTypes, setAnalysisTypes] = useState([]);
  const [baths, setBaths] = useState([]);
  const [centers, setCenters] = useState([]);
  const [samplingEntities, setSamplingEntities] = useState([]);
  const [deliveryEntities, setDeliveryEntities] = useState([]);
  const [formats, setFormats] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Estado para los errores del formulario
  const [formErrors, setFormErrors] = useState({});
  
  // Estado para formulario principal
  const [formData, setFormData] = useState({
    CANTIDAD_MUESTRAS: 1,
    URGENTE: 0,
    CLIENTE_ID: location.state?.clientId || '',
    TIPO_MUESTRA_ID: '',
    TIPO_ANALISIS_ID: '',
    BANO_ID: '',
    REFERENCIA_CLIENTE: '',
    DETALLE_MUESTREO: '',
    ENTIDAD_MUESTREO_ID: '',
    FECHA_RECEPCION: formatDate(new Date()),
    RESPONSABLE_ID: '',
    CENTRO_ID: '',
    FORMATO_ID: '',
    ENTIDAD_ENTREGA_ID: '',
    FECHA_MUESTREO: formatDate(new Date()),
    DATOS_VALORES: {}
  });
  
  // Función para formatear fechas en el formato dd/mm/yyyy
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Cargar catálogos al montar el componente
  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoading(true);
      try {
        // Cargar clientes para el dropdown
        const clientesData = await clientesService.obtenerParaCombo();
        setClients(
          clientesData.map((client) => ({
            value: client.ID_CLIENTE,
            label: client.NOMBRE
          }))
        );
        
        // Cargar tipos de muestra
        const tiposMuestraData = await tiposMuestraService.obtenerTodos();
        setSampleTypes(
          tiposMuestraData.map((type) => ({
            value: type.ID_TIPO_MUESTRA,
            label: type.NOMBRE
          }))
        );
        
        // Cargar tipos de análisis
        const tiposAnalisisData = await tiposAnalisisService.obtenerTodos();
        setAnalysisTypes(
          tiposAnalisisData.map((analysis) => ({
            value: analysis.ID_TIPO_ANALISIS,
            label: analysis.NOMBRE
          }))
        );
        
        // Cargar baños
        const banosData = await banosService.obtenerTodos();
        setBaths(
          banosData.map((bath) => ({
            value: bath.ID_BANO,
            label: bath.NOMBRE
          }))
        );
        
        // Cargar centros
        const centrosData = await centrosService.obtenerTodos();
        setCenters(
          centrosData.map((center) => ({
            value: center.ID_CENTRO,
            label: center.NOMBRE
          }))
        );
        
        // Cargar entidades de muestreo
        const entidadesMuestreoData = await entidadesMuestreoService.obtenerTodas();
        setSamplingEntities(
          entidadesMuestreoData.map((entity) => ({
            value: entity.ID_ENTIDAD_MUESTREO,
            label: entity.DESCRIPCION
          }))
        );
        
        // Cargar entidades de entrega
        const entidadesEntregaData = await entidadesEntregaService.obtenerTodas();
        setDeliveryEntities(
          entidadesEntregaData.map((entity) => ({
            value: entity.ID_ENTIDAD_ENTREGA,
            label: entity.DESCRIPCION
          }))
        );
        
        // Cargar formatos
        const formatosData = await formatosService.obtenerTodos();
        setFormats(
          formatosData.map((format) => ({
            value: format.ID_FORMATO,
            label: format.DESCRIPCION
          }))
        );
        
        // Cargar usuarios
        const usuariosData = await usuariosService.obtenerTodos();
        setUsers(
          usuariosData.map((user) => ({
            value: user.ID_EMPLEADO,
            label: `${user.NOMBRE} ${user.APELLIDOS || ''}`.trim()
          }))
        );
      } catch (err) {
        console.error('Error loading catalogs:', err);
        setError('Error al cargar los datos necesarios para el formulario.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCatalogs();
  }, []);

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
  };

  // Incrementar o decrementar cantidad de muestras
  const handleQuantityChange = (increment) => {
    setFormData(prev => {
      let newQuantity = prev.CANTIDAD_MUESTRAS + increment;
      // Asegurar que no sea menor que 1
      newQuantity = Math.max(1, newQuantity);
      return {
        ...prev,
        CANTIDAD_MUESTRAS: newQuantity
      };
    });
  };
  
  // Manejar cambios en valores de muestra específicos
  const handleSampleValueChange = (sampleIndex, fieldId, value) => {
    setFormData(prev => {
      // Crear estructura anidada si no existe
      const newDatosValores = { ...prev.DATOS_VALORES };
      const sampleKey = `MUESTRA_${sampleIndex + 1}`;
      
      if (!newDatosValores[sampleKey]) {
        newDatosValores[sampleKey] = [];
      }
      
      // Buscar si ya existe un valor para este campo
      const existingIndex = newDatosValores[sampleKey].findIndex(
        item => item.CAMPO_ID === fieldId
      );
      
      if (existingIndex >= 0) {
        // Actualizar valor existente
        newDatosValores[sampleKey][existingIndex] = {
          ...newDatosValores[sampleKey][existingIndex],
          VALOR: value
        };
      } else {
        // Agregar nuevo valor
        newDatosValores[sampleKey].push({
          CAMPO_ID: fieldId,
          VALOR: value
        });
      }
      
      return {
        ...prev,
        DATOS_VALORES: newDatosValores
      };
    });
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    // Validar campos requeridos
    if (!formData.CLIENTE_ID) {
      errors.CLIENTE_ID = 'El cliente es obligatorio';
    }
    
    if (!formData.TIPO_MUESTRA_ID) {
      errors.TIPO_MUESTRA_ID = 'El tipo de muestra es obligatorio';
    }
    
    if (!formData.BANO_ID) {
      errors.BANO_ID = 'El baño es obligatorio';
    }
    
    if (!formData.FECHA_RECEPCION) {
      errors.FECHA_RECEPCION = 'La fecha de recepción es obligatoria';
    }
    
    if (!formData.RESPONSABLE_ID) {
      errors.RESPONSABLE_ID = 'El responsable es obligatorio';
    }
    
    if (!formData.CENTRO_ID) {
      errors.CENTRO_ID = 'El centro es obligatorio';
    }
    
    if (!formData.FORMATO_ID) {
      errors.FORMATO_ID = 'El formato es obligatorio';
    }
    
    if (!formData.FECHA_MUESTREO) {
      errors.FECHA_MUESTREO = 'La fecha de muestreo es obligatoria';
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
      await muestrasService.crear(formData);
      
      setSuccess(true);
      
      // Redireccionar después de un breve retraso
      setTimeout(() => {
        navigate('/muestras');
      }, 1500);
    } catch (err) {
      console.error('Error saving samples:', err);
      setError(
        err.message || 
        'Error al guardar las muestras. Por favor, intente nuevamente.'
      );
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    // Si hay cambios, mostrar confirmación
    if (Object.keys(formErrors).length > 0) {
      setShowConfirmCancel(true);
    } else {
      navigate('/muestras');
    }
  };

  // Generar UI para múltiples muestras
  const renderSampleInputs = () => {
    // Valores de muestra a capturar (solo a modo de ejemplo, en una app real vendrían del backend)
    const sampleFields = [
      { id: '1', label: 'Temperatura (°C)' },
      { id: '2', label: 'pH' },
      { id: '3', label: 'Conductividad (µS/cm)' },
      { id: '4', label: 'Observaciones' }
    ];
    
    const samples = [];
    
    for (let i = 0; i < formData.CANTIDAD_MUESTRAS; i++) {
      const sampleNumber = i + 1;
      const sampleKey = `MUESTRA_${sampleNumber}`;
      
      samples.push(
        <div key={sampleNumber} className="mb-6 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Muestra #{sampleNumber}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {sampleFields.map(field => {
              const fieldType = field.label.toLowerCase().includes('observaciones') ? 'textarea' : 'text';
              const fieldValue = formData.DATOS_VALORES[sampleKey]?.find(
                v => v.CAMPO_ID === field.id
              )?.VALOR || '';
              
              return (
                <FormField
                  key={`${sampleNumber}-${field.id}`}
                  id={`${sampleKey}-${field.id}`}
                  label={field.label}
                  type={fieldType}
                  value={fieldValue}
                  onChange={(e) => handleSampleValueChange(i, field.id, e.target.value)}
                  className={fieldType === 'textarea' ? 'md:col-span-2 lg:col-span-4' : ''}
                />
              );
            })}
          </div>
        </div>
      );
    }
    
    return samples;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/muestras')}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Nueva Muestra
          </h1>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
            disabled={saving}
          >
            <X size={16} className="mr-2" />
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
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
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {/* Mensaje de éxito */}
      {success && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-green-700">
              {formData.CANTIDAD_MUESTRAS > 1 ? 'Muestras creadas' : 'Muestra creada'} correctamente
            </span>
          </div>
        </div>
      )}
      
      {/* Formulario */}
      <form className="space-y-6">
        {/* Información general */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Información General</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Muestras
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 border border-gray-300 rounded-l-md hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    name="CANTIDAD_MUESTRAS"
                    value={formData.CANTIDAD_MUESTRAS}
                    onChange={handleChange}
                    min="1"
                    className="p-2 border-t border-b border-gray-300 text-center w-16"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 border border-gray-300 rounded-r-md hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="URGENTE"
                    checked={formData.URGENTE === 1}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="ml-2 text-sm text-gray-700 flex items-center">
                    <AlertTriangle size={16} className="mr-1 text-red-500" />
                    Urgente
                  </span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Cliente y tipo de muestra */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Identificación de Muestra</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                id="CLIENTE_ID"
                name="CLIENTE_ID"
                label="Cliente"
                type="select"
                value={formData.CLIENTE_ID}
                onChange={handleChange}
                error={formErrors.CLIENTE_ID}
                options={clients}
                required={true}
                icon={<Briefcase />}
              />
              
              <FormField
                id="TIPO_MUESTRA_ID"
                name="TIPO_MUESTRA_ID"
                label="Tipo de Muestra"
                type="select"
                value={formData.TIPO_MUESTRA_ID}
                onChange={handleChange}
                error={formErrors.TIPO_MUESTRA_ID}
                options={sampleTypes}
                required={true}
                icon={<Beaker />}
              />
              
              <FormField
                id="TIPO_ANALISIS_ID"
                name="TIPO_ANALISIS_ID"
                label="Tipo de Análisis"
                type="select"
                value={formData.TIPO_ANALISIS_ID}
                onChange={handleChange}
                error={formErrors.TIPO_ANALISIS_ID}
                options={analysisTypes}
                icon={<Beaker />}
              />
              
              <FormField
                id="BANO_ID"
                name="BANO_ID"
                label="Baño"
                type="select"
                value={formData.BANO_ID}
                onChange={handleChange}
                error={formErrors.BANO_ID}
                options={baths}
                required={true}
                icon={<Beaker />}
              />
              
              <FormField
                id="REFERENCIA_CLIENTE"
                name="REFERENCIA_CLIENTE"
                label="Referencia Cliente"
                value={formData.REFERENCIA_CLIENTE}
                onChange={handleChange}
                error={formErrors.REFERENCIA_CLIENTE}
                icon={<Briefcase />}
                className="md:col-span-2 lg:col-span-2"
              />
            </div>
          </div>
          
          {/* Fechas y detalles de muestreo */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium mb-4">Fechas y Detalles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                id="FECHA_MUESTREO"
                name="FECHA_MUESTREO"
                label="Fecha de Muestreo"
                value={formData.FECHA_MUESTREO}
                onChange={handleChange}
                error={formErrors.FECHA_MUESTREO}
                required={true}
                icon={<Calendar />}
              />
              
              <FormField
                id="ENTIDAD_MUESTREO_ID"
                name="ENTIDAD_MUESTREO_ID"
                label="Entidad de Muestreo"
                type="select"
                value={formData.ENTIDAD_MUESTREO_ID}
                onChange={handleChange}
                error={formErrors.ENTIDAD_MUESTREO_ID}
                options={samplingEntities}
                icon={<Briefcase />}
              />
              
              <FormField
                id="FECHA_RECEPCION"
                name="FECHA_RECEPCION"
                label="Fecha de Recepción"
                value={formData.FECHA_RECEPCION}
                onChange={handleChange}
                error={formErrors.FECHA_RECEPCION}
                required={true}
                icon={<Calendar />}
              />
              
              <FormField
                id="RESPONSABLE_ID"
                name="RESPONSABLE_ID"
                label="Responsable"
                type="select"
                value={formData.RESPONSABLE_ID}
                onChange={handleChange}
                error={formErrors.RESPONSABLE_ID}
                options={users}
                required={true}
                icon={<Briefcase />}
              />
              
              <FormField
                id="CENTRO_ID"
                name="CENTRO_ID"
                label="Centro"
                type="select"
                value={formData.CENTRO_ID}
                onChange={handleChange}
                error={formErrors.CENTRO_ID}
                options={centers}
                required={true}
                icon={<Briefcase />}
              />
              
              <FormField
                id="FORMATO_ID"
                name="FORMATO_ID"
                label="Formato"
                type="select"
                value={formData.FORMATO_ID}
                onChange={handleChange}
                error={formErrors.FORMATO_ID}
                options={formats}
                required={true}
                icon={<FileText />}
              />
              
              <FormField
                id="ENTIDAD_ENTREGA_ID"
                name="ENTIDAD_ENTREGA_ID"
                label="Entidad de Entrega"
                type="select"
                value={formData.ENTIDAD_ENTREGA_ID}
                onChange={handleChange}
                error={formErrors.ENTIDAD_ENTREGA_ID}
                options={deliveryEntities}
                icon={<Briefcase />}
              />
              
              <FormField
                id="DETALLE_MUESTREO"
                name="DETALLE_MUESTREO"
                label="Detalle de Muestreo"
                type="textarea"
                value={formData.DETALLE_MUESTREO}
                onChange={handleChange}
                error={formErrors.DETALLE_MUESTREO}
                icon={<FileText />}
                className="md:col-span-2 lg:col-span-3"
              />
            </div>
          </div>
          
          {/* Valores específicos para cada muestra */}
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Datos de las Muestras</h2>
            {renderSampleInputs()}
          </div>
        </div>
      </form>
      
      {/* Modal de confirmación para cancelar */}
      {showConfirmCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar cancelación</h3>
            <p className="text-gray-500 mb-4">
              ¿Está seguro de que desea cancelar? Los cambios no guardados se perderán.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmCancel(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                No, continuar editando
              </button>
              <button
                onClick={() => navigate('/muestras')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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

export default SampleForm;