import React, { useState, useEffect } from 'react';
import { 
  Save, X, AlertTriangle, RotateCw, Beaker, FlaskConical, Calendar,
  Building, FileText, User, Package, TestTube, Thermometer, Clock,
  Eye, EyeOff, Plus, Minus
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import TabPanel from '../common/TabPanel';
import Modal from '../common/Modal';

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
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={`mb-3 ${className}`}>
      <label 
        htmlFor={id} 
        className={`block text-sm font-medium text-gray-700 mb-1 ${labelClassName}`}
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
          className={`w-full px-3 py-2 text-sm border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : 'bg-white'
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
          className={`w-full px-3 py-2 text-sm border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : 'bg-white'
          } text-gray-800 resize-none`}
        />
      ) : type === 'checkbox' ? (
        <div className="flex items-center mt-1">
          <input
            type="checkbox"
            id={id}
            name={id}
            checked={value === 1}
            onChange={onChange}
            disabled={disabled}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor={id} className="ml-2 block text-sm text-gray-700">
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
          className={`w-full px-3 py-2 text-sm border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : 'bg-white'
          } text-gray-800`}
        />
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <AlertTriangle size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

const SampleForm = ({ 
  isEdit = false,
  sampleData = null,
  onSuccess,
  onCancel 
}) => {
  const { openModal, closeModal } = useModal();
  
  // Estados del formulario basados en las imágenes
  const [formData, setFormData] = useState({
    // SAMPLE DATA
    CLIENTE_ID: '',
    PEDIDO: '',
    F_RECEPCION: new Date().toISOString().split('T')[0],
    HORA: new Date().toLocaleTimeString().slice(0, 5),
    F_MUESTREO: '',
    ENTREGADA_POR: 'EL CLIENTE Bry CUSTOMER',
    TOMADA_POR: 'El cliente Bry Customer',
    CENTRO: 'Madrid',
    
    // TEST AND REPLACEMENT
    TEST: 'PLASMA',
    REPLACEMENT: 'ENSAYO',
    PRODUCT_LIBEL: 'METAL SPECIMEN WITH THERMAL SPRAY COATING',
    
    // SPECIMEN ID AND DESCRIPTION
    PROCESS: '',
    CUSTOMER: '',
    SPECIMEN_ID: '',
    DENOMINACION: '',
    HMD_TYPE: 'HEAT TEST SPECIMEN',
    
    // Campos adicionales
    PN: '',
    SN: '',
    PRODUCT_TYPE: '',
    PRODUCT_SN: '',
    MODULE_SN: '',
    URGENTE: 0,
    OBSERVACIONES: ''
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Configuración de pestañas según las imágenes
  const tabs = [
    { id: 'recepcion', label: 'Recepción de Ensayos', icon: <Beaker size={16} /> },
    { id: 'specimen', label: 'Specimen & Description', icon: <TestTube size={16} /> },
    { id: 'analysis', label: 'Configuración Análisis', icon: <FlaskConical size={16} /> },
    { id: 'additional', label: 'Datos Adicionales', icon: <FileText size={16} /> }
  ];

  // Cargar datos si es edición
  useEffect(() => {
    if (isEdit && sampleData) {
      setFormData(prev => ({
        ...prev,
        ...sampleData
      }));
    }
  }, [isEdit, sampleData]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: fieldValue
    }));

    // Limpiar error de validación si existe
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.CLIENTE_ID?.trim()) {
      errors.CLIENTE_ID = 'El cliente es obligatorio';
    }
    
    if (!formData.F_RECEPCION) {
      errors.F_RECEPCION = 'La fecha de recepción es obligatoria';
    }

    if (!formData.TEST?.trim()) {
      errors.TEST = 'El tipo de test es obligatorio';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) {
        onSuccess(formData);
      }
      
    } catch (err) {
      console.error('Error saving sample:', err);
      setError(err.message || 'Error al guardar la muestra');
    } finally {
      setSaving(false);
    }
  };

  // Opciones para los selects (estos vendrían de servicios)
  const clienteOptions = [
    { value: 'IBERIA', label: 'IBERIA MAINTENANCE EUROPEAN CUSTOMER' },
    { value: 'AIRBUS', label: 'AIRBUS CUSTOMER' },
    { value: 'BOEING', label: 'BOEING CUSTOMER' }
  ];

  const testOptions = [
    { value: 'PLASMA', label: 'PLASMA' },
    { value: 'HVOF', label: 'HVOF' },
    { value: 'APS', label: 'APS' }
  ];

  const replacementOptions = [
    { value: 'ENSAYO', label: 'ENSAYO' },
    { value: 'REPLACEMENT', label: 'REPLACEMENT' },
    { value: 'REPAIR', label: 'REPAIR' }
  ];

  if (loading) {
    return (
      <>
        <Modal.Header>
          <div className="flex items-center">
            <Beaker size={18} className="mr-2" />
            <span>Cargando...</span>
          </div>
        </Modal.Header>
        
        <Modal.Body>
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <RotateCw className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Cargando información de la muestra...</p>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <button
            onClick={onCancel}
            className="flex items-center px-4 py-2 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            <X size={16} className="mr-1" />
            Cancelar
          </button>
        </Modal.Footer>
      </>
    );
  }

  return (
    <>
      <Modal.Header>
        <div className="flex items-center">
          <Beaker size={18} className="mr-2" />
          <span>
            {isEdit ? 'Consulta de la muestra - Edición: 1' : 
             'Recepción de Ensayos Físicos IBERIA'}
          </span>
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <TabPanel tabs={tabs}>
            {/* Pestaña Recepción de Ensayos */}
            <div className="space-y-6">
              {/* SAMPLE DATA */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Sample Data</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Cliente"
                    id="CLIENTE_ID"
                    type="select"
                    value={formData.CLIENTE_ID}
                    onChange={handleInputChange}
                    error={validationErrors.CLIENTE_ID}
                    options={clienteOptions}
                    required
                  />
                  <FormField
                    label="Pedido"
                    id="PEDIDO"
                    value={formData.PEDIDO}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="F. Recepción"
                    id="F_RECEPCION"
                    type="date"
                    value={formData.F_RECEPCION}
                    onChange={handleInputChange}
                    error={validationErrors.F_RECEPCION}
                    required
                  />
                  <FormField
                    label="Hora"
                    id="HORA"
                    type="time"
                    value={formData.HORA}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="F. Muestreo"
                    id="F_MUESTREO"
                    type="date"
                    value={formData.F_MUESTREO}
                    onChange={handleInputChange}
                  />
                  <div className="flex items-center">
                    <FormField
                      label="Urgente"
                      id="URGENTE"
                      type="checkbox"
                      value={formData.URGENTE}
                      onChange={handleInputChange}
                      placeholder="Marcar como urgente"
                      className="mr-4"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <FormField
                    label="Entregada por"
                    id="ENTREGADA_POR"
                    value={formData.ENTREGADA_POR}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Tomada por"
                    id="TOMADA_POR"
                    value={formData.TOMADA_POR}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Centro"
                    id="CENTRO"
                    value={formData.CENTRO}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* TEST AND REPLACEMENT */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Test and Replacement</h3>
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    label="Test"
                    id="TEST"
                    type="select"
                    value={formData.TEST}
                    onChange={handleInputChange}
                    error={validationErrors.TEST}
                    options={testOptions}
                    required
                  />
                  <FormField
                    label="Replacement"
                    id="REPLACEMENT"
                    type="select"
                    value={formData.REPLACEMENT}
                    onChange={handleInputChange}
                    options={replacementOptions}
                  />
                  <FormField
                    label="Product Libel"
                    id="PRODUCT_LIBEL"
                    type="textarea"
                    value={formData.PRODUCT_LIBEL}
                    onChange={handleInputChange}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Pestaña Specimen & Description */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Specimen ID and Description</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Process"
                    id="PROCESS"
                    value={formData.PROCESS}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Customer"
                    id="CUSTOMER"
                    value={formData.CUSTOMER}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Specimen ID - O.R"
                    id="SPECIMEN_ID"
                    value={formData.SPECIMEN_ID}
                    onChange={handleInputChange}
                  />
                  <FormField
                    label="Denominación"
                    id="DENOMINACION"
                    value={formData.DENOMINACION}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="mt-4">
                  <FormField
                    label="HM&D Type"
                    id="HMD_TYPE"
                    value={formData.HMD_TYPE}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="P/N"
                  id="PN"
                  value={formData.PN}
                  onChange={handleInputChange}
                />
                <FormField
                  label="S/N"
                  id="SN"
                  value={formData.SN}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Product Type"
                  id="PRODUCT_TYPE"
                  value={formData.PRODUCT_TYPE}
                  onChange={handleInputChange}
                  placeholder="COATING"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Product S/N"
                  id="PRODUCT_SN"
                  value={formData.PRODUCT_SN}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Module S/N"
                  id="MODULE_SN"
                  value={formData.MODULE_SN}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Pestaña Configuración Análisis */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-medium text-sm text-gray-700">Configuración del Análisis</h2>
                </div>
                <div className="px-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      label="Tipo de Análisis"
                      id="TIPO_ANALISIS"
                      type="select"
                      value={formData.TIPO_ANALISIS}
                      onChange={handleInputChange}
                      options={[
                        { value: 'PLASMA', label: 'Ensayo Plasma' },
                        { value: 'THERMAL', label: 'Ensayo Térmico' },
                        { value: 'MECHANICAL', label: 'Ensayo Mecánico' }
                      ]}
                    />
                    <FormField
                      label="Prioridad"
                      id="PRIORIDAD"
                      type="select"
                      value={formData.PRIORIDAD}
                      onChange={handleInputChange}
                      options={[
                        { value: 'NORMAL', label: 'Normal' },
                        { value: 'URGENTE', label: 'Urgente' },
                        { value: 'CRITICO', label: 'Crítico' }
                      ]}
                    />
                  </div>
                  
                  <div className="mt-4">
                    <FormField
                      label="Método de Ensayo"
                      id="METODO_ENSAYO"
                      value={formData.METODO_ENSAYO}
                      onChange={handleInputChange}
                      placeholder="Especificar método según norma"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pestaña Datos Adicionales */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
                  <h2 className="font-medium text-sm text-gray-700">Información Adicional</h2>
                </div>
                <div className="px-4 py-4">
                  <FormField
                    label="Observaciones"
                    id="OBSERVACIONES"
                    type="textarea"
                    value={formData.OBSERVACIONES}
                    onChange={handleInputChange}
                    placeholder="Observaciones adicionales sobre la muestra..."
                    rows={4}
                  />
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <FormField
                      label="Técnico Responsable"
                      id="TECNICO_RESPONSABLE"
                      value={formData.TECNICO_RESPONSABLE}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Fecha Estimada Entrega"
                      id="FECHA_ESTIMADA_ENTREGA"
                      type="date"
                      value={formData.FECHA_ESTIMADA_ENTREGA}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </form>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex justify-between w-full">
          <div className="flex items-center space-x-2">
            <div className="flex items-center text-xs text-gray-500">
              <AlertTriangle size={12} className="mr-1" />
              Los campos marcados con * son obligatorios
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              <X size={16} className="mr-1" />
              Cancelar
            </button>
            
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className={`flex items-center px-4 py-2 text-sm rounded text-white ${
                saving ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {saving ? (
                <>
                  <RotateCw className="animate-spin mr-1" size={16} />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" />
                  {isEdit ? 'Actualizar' : 'Aceptar'}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal.Footer>
    </>
  );
};

export default SampleForm;