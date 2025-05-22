import React, { useState, useEffect } from 'react';
import { 
  Save, X, AlertTriangle, RotateCw, BarChart3, TestTube, Calendar,
  CheckCircle, XCircle, Image, FileText, Plus, Minus, Eye
} from 'lucide-react';
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
  rows = 3
}) => {
  return (
    <div className={`mb-3 ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700 mb-1"
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
          rows={rows}
          className={`w-full px-3 py-2 text-sm border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : 'bg-white'
          } text-gray-800 resize-none`}
        />
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

// Componente para una prueba individual
const TestResult = ({ 
  testName, 
  result, 
  onResultChange, 
  status, 
  onStatusChange,
  disabled = false 
}) => {
  return (
    <div className="flex items-center space-x-2 py-1 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 text-sm font-medium text-gray-700">
        {testName}
      </div>
      <div className="w-20">
        <input
          type="text"
          value={result || ''}
          onChange={(e) => onResultChange(e.target.value)}
          disabled={disabled}
          className="w-full px-2 py-1 text-xs border border-gray-300 rounded text-center"
          placeholder="--"
        />
      </div>
      <div className="w-16">
        <select
          value={status || ''}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={disabled}
          className="w-full px-1 py-1 text-xs border border-gray-300 rounded"
        >
          <option value="">--</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
          <option value="N.R">N.R</option>
        </select>
      </div>
    </div>
  );
};

const SampleResultsForm = ({ 
  sample,
  onSuccess,
  onCancel 
}) => {
  // Estados del formulario basados en la imagen "resultado de orden.png"
  const [formData, setFormData] = useState({
    // Información general
    PROCESS: 'SANDBLASTING',
    CUSTOMER: 'AIR EUROPA LINEAS AEREAS',
    SPECIMEN_ID: 'QC 47387/3',
    HMD_TYPE: 'HEAT TEST SPECIMEN',
    PN: '203046234NE2',
    PRODUCT_TYPE: 'CN203',
    MODULE_SN: 'OS6/2S/007',
    
    // Resultados utilizados en la muestra
    METALOGRAPHIC_PREPARATION: 0,
    FECHA: new Date().toISOString().split('T')[0],
    USUARIO: '',
    
    // Equipos utilizados en la muestra
    EQUIPOS_UTILIZADOS: [],
    
    // BOND COAT - Testing Specimen
    BOND_COAT: {
      UP_LIMIT: '',
      BATCH_BOND_DATE: '',
      POWDEROSITIVADOS: '',
      TEST: 'METALLOGRAPHIC EXAMINATION',
      RESULT_EIN_1: '',
      PASS_1: '',
      RESULT_EIN_2: '',
      PASS_2: '',
      RESULTS: '',
      REMARKS: '',
      AVERAGE: ''
    },
    
    // TOP COAT - Testing Specimen
    TOP_COAT: {
      UP_LIMIT: '',
      BATCH_TOP_COAT: '',
      METALLOGRAPHIC_EXAMINATION: '',
      TEST: 'METALLOGRAPHIC EXAMINATION',
      RESULT_EIN_1: '',
      PASS_1: '',
      RESULT_EIN_2: '',
      PASS_2: '',
      RESULTS: '',
      REMARKS: '',
      AVERAGE: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Cargar datos de la muestra
  useEffect(() => {
    if (sample) {
      setFormData(prev => ({
        ...prev,
        PROCESS: sample.PROCESO || prev.PROCESS,
        CUSTOMER: sample.CUSTOMER || sample.CLIENTE_NOMBRE || prev.CUSTOMER,
        SPECIMEN_ID: sample.SPECIMEN_ID || sample.REFERENCIA_CLIENTE || prev.SPECIMEN_ID,
        HMD_TYPE: sample.HMD_TYPE || prev.HMD_TYPE,
        PN: sample.PN || prev.PN,
        PRODUCT_TYPE: sample.PRODUCT_TYPE || prev.PRODUCT_TYPE,
        MODULE_SN: sample.MODULE_SN || prev.MODULE_SN
      }));
    }
  }, [sample]);

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

  // Manejar cambios en resultados de Bond Coat
  const handleBondCoatChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      BOND_COAT: {
        ...prev.BOND_COAT,
        [field]: value
      }
    }));
  };

  // Manejar cambios en resultados de Top Coat
  const handleTopCoatChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      TOP_COAT: {
        ...prev.TOP_COAT,
        [field]: value
      }
    }));
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.FECHA) {
      errors.FECHA = 'La fecha es obligatoria';
    }

    if (!formData.USUARIO?.trim()) {
      errors.USUARIO = 'El usuario es obligatorio';
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
      console.error('Error saving results:', err);
      setError(err.message || 'Error al guardar los resultados');
    } finally {
      setSaving(false);
    }
  };

  // Lista de pruebas para Bond Coat
  const bondCoatTests = [
    'METALLOGRAPHIC',
    'POROSITY/CAVITIES',
    'POROSITY/OXIDES',
    'UNBONDED PART',
    'OXIDES',
    'OTHERS'
  ];

  // Lista de pruebas para Top Coat
  const topCoatTests = [
    'METALLOGRAPHIC',
    'CRACKING/SPALLATION',
    'POROSITY/OXIDES',
    'UNBONDED PART',
    'OXIDES',
    'OTHERS'
  ];

  if (loading) {
    return (
      <>
        <Modal.Header>
          <div className="flex items-center">
            <BarChart3 size={18} className="mr-2" />
            <span>Cargando...</span>
          </div>
        </Modal.Header>
        
        <Modal.Body>
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <RotateCw className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Cargando formulario de resultados...</p>
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
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center">
            <BarChart3 size={18} className="mr-2" />
            <span>Registro resultados PLASMA: 4807 (EPL-383)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ABIERTA
            </span>
          </div>
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
          {/* SPECIMEN ID AND DESCRIPTION */}
          <div className="bg-gray-50 p-4 rounded-lg border mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Specimen ID and Description</h3>
            <div className="grid grid-cols-4 gap-4">
              <FormField
                label="Process"
                id="PROCESS"
                value={formData.PROCESS}
                onChange={handleInputChange}
                disabled
              />
              <FormField
                label="Customer"
                id="CUSTOMER"
                value={formData.CUSTOMER}
                onChange={handleInputChange}
                disabled
              />
              <FormField
                label="Specimen ID"
                id="SPECIMEN_ID"
                value={formData.SPECIMEN_ID}
                onChange={handleInputChange}
                disabled
              />
              <FormField
                label="HM&D Type"
                id="HMD_TYPE"
                value={formData.HMD_TYPE}
                onChange={handleInputChange}
                disabled
              />
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <FormField
                label="P/N"
                id="PN"
                value={formData.PN}
                onChange={handleInputChange}
                disabled
              />
              <FormField
                label="Product Type"
                id="PRODUCT_TYPE"
                value={formData.PRODUCT_TYPE}
                onChange={handleInputChange}
                disabled
              />
              <FormField
                label="Module S/N"
                id="MODULE_SN"
                value={formData.MODULE_SN}
                onChange={handleInputChange}
                disabled
              />
            </div>
          </div>

          {/* Resultados utilizados en la muestra */}
          <div className="bg-blue-50 p-4 rounded-lg border mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Resultados utilizados en la Muestra</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="METALOGRAPHIC_PREPARATION"
                  name="METALOGRAPHIC_PREPARATION"
                  checked={formData.METALOGRAPHIC_PREPARATION === 1}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                <label htmlFor="METALOGRAPHIC_PREPARATION" className="text-sm text-gray-700">
                  METALOGRAPHIC PREPARATION
                </label>
              </div>
              <FormField
                label="Fecha"
                id="FECHA"
                type="date"
                value={formData.FECHA}
                onChange={handleInputChange}
                error={validationErrors.FECHA}
                required
              />
              <FormField
                label="Usuario"
                id="USUARIO"
                value={formData.USUARIO}
                onChange={handleInputChange}
                error={validationErrors.USUARIO}
                required
              />
            </div>
          </div>

          {/* Testing Specimens - Bond Coat y Top Coat */}
          <div className="grid grid-cols-2 gap-6">
            {/* BOND COAT */}
            <div className="bg-orange-50 rounded-lg border">
              <div className="bg-orange-200 px-4 py-2 rounded-t-lg">
                <h3 className="text-sm font-semibold text-orange-800 uppercase text-center">Bond Coat</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase">Testing Specimen</h4>
                  <div className="space-y-2">
                    <FormField
                      label="Up Limit"
                      id="BOND_UP_LIMIT"
                      value={formData.BOND_COAT.UP_LIMIT}
                      onChange={(e) => handleBondCoatChange('UP_LIMIT', e.target.value)}
                    />
                    <FormField
                      label="Batch Bond Date"
                      id="BOND_BATCH_DATE"
                      value={formData.BOND_COAT.BATCH_BOND_DATE}
                      onChange={(e) => handleBondCoatChange('BATCH_BOND_DATE', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Test Results</div>
                    <div className="space-y-1">
                      {bondCoatTests.map((test, index) => (
                        <TestResult
                          key={index}
                          testName={test}
                          result={formData.BOND_COAT[`RESULT_${index}`]}
                          onResultChange={(value) => handleBondCoatChange(`RESULT_${index}`, value)}
                          status={formData.BOND_COAT[`STATUS_${index}`]}
                          onStatusChange={(value) => handleBondCoatChange(`STATUS_${index}`, value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormField
                    label="Results"
                    id="BOND_RESULTS"
                    type="textarea"
                    rows={2}
                    value={formData.BOND_COAT.RESULTS}
                    onChange={(e) => handleBondCoatChange('RESULTS', e.target.value)}
                  />
                  <FormField
                    label="Remarks"
                    id="BOND_REMARKS"
                    type="textarea"
                    rows={2}
                    value={formData.BOND_COAT.REMARKS}
                    onChange={(e) => handleBondCoatChange('REMARKS', e.target.value)}
                  />
                  <FormField
                    label="Average"
                    id="BOND_AVERAGE"
                    value={formData.BOND_COAT.AVERAGE}
                    onChange={(e) => handleBondCoatChange('AVERAGE', e.target.value)}
                  />
                </div>

                {/* Resultado final Bond Coat */}
                <div className="mt-4 p-3 bg-green-100 rounded text-center">
                  <div className="text-2xl font-bold text-green-800">PASS</div>
                </div>
              </div>
            </div>

            {/* TOP COAT */}
            <div className="bg-yellow-50 rounded-lg border">
              <div className="bg-yellow-200 px-4 py-2 rounded-t-lg">
                <h3 className="text-sm font-semibold text-yellow-800 uppercase text-center">Top Coat</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 uppercase">Testing Specimen</h4>
                  <div className="space-y-2">
                    <FormField
                      label="Up Limit"
                      id="TOP_UP_LIMIT"
                      value={formData.TOP_COAT.UP_LIMIT}
                      onChange={(e) => handleTopCoatChange('UP_LIMIT', e.target.value)}
                    />
                    <FormField
                      label="Batch Top Coat"
                      id="TOP_BATCH_COAT"
                      value={formData.TOP_COAT.BATCH_TOP_COAT}
                      onChange={(e) => handleTopCoatChange('BATCH_TOP_COAT', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="bg-white p-3 rounded border">
                    <div className="text-xs font-medium text-gray-600 mb-2 uppercase">Test Results</div>
                    <div className="space-y-1">
                      {topCoatTests.map((test, index) => (
                        <TestResult
                          key={index}
                          testName={test}
                          result={formData.TOP_COAT[`RESULT_${index}`]}
                          onResultChange={(value) => handleTopCoatChange(`RESULT_${index}`, value)}
                          status={formData.TOP_COAT[`STATUS_${index}`]}
                          onStatusChange={(value) => handleTopCoatChange(`STATUS_${index}`, value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <FormField
                    label="Results"
                    id="TOP_RESULTS"
                    type="textarea"
                    rows={2}
                    value={formData.TOP_COAT.RESULTS}
                    onChange={(e) => handleTopCoatChange('RESULTS', e.target.value)}
                  />
                  <FormField
                    label="Remarks"
                    id="TOP_REMARKS"
                    type="textarea"
                    rows={2}
                    value={formData.TOP_COAT.REMARKS}
                    onChange={(e) => handleTopCoatChange('REMARKS', e.target.value)}
                  />
                  <FormField
                    label="Average"
                    id="TOP_AVERAGE"
                    value={formData.TOP_COAT.AVERAGE}
                    onChange={(e) => handleTopCoatChange('AVERAGE', e.target.value)}
                  />
                </div>

                {/* Resultado final Top Coat */}
                <div className="mt-4 p-3 bg-green-100 rounded text-center">
                  <div className="text-2xl font-bold text-green-800">PASS</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex justify-between w-full">
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-200 hover:bg-gray-200">
              <Image size={14} className="mr-1" />
              Imágenes
            </button>
            <button className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200">
              <FileText size={14} className="mr-1" />
              Plantillas
            </button>
            <button className="flex items-center px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded border border-purple-200 hover:bg-purple-200">
              <Eye size={14} className="mr-1" />
              Documento
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center px-4 py-2 text-sm border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              <X size={16} className="mr-1" />
              ESC-Car
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
                  Aceptar
                </>
              )}
            </button>
          </div>
        </div>
      </Modal.Footer>
    </>
  );
};

export default SampleResultsForm;