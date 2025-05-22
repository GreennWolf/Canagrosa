import React, { useState, useEffect } from 'react';
import { 
  Save, X, AlertCircle, RotateCw, User, Shield, Mail,
  Eye, EyeOff, Users, Settings, CheckCircle, Key, Building,
  Phone, Calendar, FileText, Star, DollarSign
} from 'lucide-react';
import { useModal } from '../../contexts/ModalContext';
import usuariosService from '../../services/usuariosService';
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
      ) : type === 'password' ? (
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
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
            } text-gray-800 pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
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
          <AlertCircle size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Componente para checkbox en grid
const CheckboxField = ({ id, label, checked, onChange, disabled = false }) => (
  <div className="flex items-center py-1">
    <input
      type="checkbox"
      id={id}
      name={id}
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
    />
    <label htmlFor={id} className="text-sm text-gray-700 cursor-pointer">
      {label}
    </label>
  </div>
);

const UserForm = ({ 
  isEdit = false,
  isClone = false,
  userId = null,
  userData = null,
  cloneData = null,
  onSuccess,
  onCancel 
}) => {
  const { openModal, closeModal } = useModal();
  
  // Estados del formulario basados en la imagen
  const [formData, setFormData] = useState({
    // Datos Personales
    ID_EMPLEADO: null,
    USUARIO: '',
    NOMBRE: '',
    APELLIDOS: '',
    CONTRASEÑA: '',
    IMAGEN: '',
    FIRMA_ELECTRONICA: '',
    FILES: '',
    
    // Revisión de Informes y Firma digital (FNMT)
    REVISION_DE_MUESTRAS: 0,
    CARGO_INTERNO: '',
    RUTA_SERVICIO: '',
    CONTRASEÑA_FNMT: '',
    F_CADUCIDAD: '',
    
    // Acceso Aplicaciones
    ORDENES_NO_PROCESADO: 0,
    
    // Propiedades - Primera columna
    PER_IMPRESION: 0,
    PER_FACTURACION: 0,
    PER_MODIFICACION: 0,
    PER_EDICION: 0,
    PER_ALTAS_BAJAS_USUARIOS: 0,
    PER_SEGUNDA_EDICION: 0,
    PER_EXPLORAR: 0,
    
    // Propiedades - Segunda columna  
    PER_CONTABILIDAD: 0,
    PER_ENVIO_PEDIDOS_PROVEEDOR: 0,
    PER_GESTION_PROYECTOS: 0,
    PER_GESTION_INCIDENCIAS: 0,
    PER_OFERTAS: 0,
    PER_CIERRE_MUESTRAS: 0,
    PER_PLAZO_ENTREGA: 0,
    PER_MOS_PLANIFICACION_CLIENTES: 0,
    
    // Propiedades - Tercera columna
    PER_DEPARTAMENTOS: 0,
    PER_DOCUMENTA_CALIDAD: 0,
    PER_GENERACION_DOCUMENTOS: 0,
    PER_INSPECCION_DOC_CALIDAD: 0,
    PER_HOJA_DATOS: 0,
    PER_VER_TODAS_FAMILIAS: 0,
    PER_GESTION_NO_CONFORMIDADES: 0,
    PER_NORMAS_NO_CONTROLADAS: 0,
    PER_LISTADO_INCIDENCIAS: 0,
    
    // Calidad
    PER_ACCESO_DOCUMENTACION_CALIDAD: 0,
    PER_CREACION_VERSIONES_DOCUMENTOS: 0,
    PER_INSPECCION_DOC_CALIDAD_2: 0,
    PER_LISTA_PROCENSAL_PNT: 0,
    PER_VER_TODAS_LAS_FAMILIAS: 0,
    PER_GESTION_NO_CONFORMIDADES_2: 0,
    PER_LISTADO_FAMILIAS: 0,
    
    // Indicadores
    PER_CENTROS_PLAZO_ENTREGA: 0,
    PER_LISTADO_PLAZO_PASO: 0,
    PER_INDICADORES_CLIENTE: 0,
    PER_PRODUCTIVIDAD: 0,
    
    // Tesorería
    PER_MENU_TESORERIA: 0,
    PER_FACTURAS_PROVEEDORES: 0,
    
    // Facturación
    PER_CARGAR_PNT: 0,
    PER_FACTURACION_ANUAL: 0
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  // Configuración de pestañas según la imagen
  const tabs = [
    { id: 'datos', label: 'Datos Personales', icon: <User size={16} /> },
    { id: 'propiedades', label: 'Propiedades', icon: <Settings size={16} /> },
    { id: 'responsables', label: 'Responsables Dpto', icon: <Users size={16} /> },
    { id: 'departamentos', label: 'Departamentos', icon: <Building size={16} /> },
    { id: 'indicadores', label: 'Indicadores', icon: <Star size={16} /> }
  ];

  // Cargar usuario si estamos editando
  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      try {
        // Si tenemos userData, usarlo directamente (sin llamada HTTP)
        if (userData) {
          setFormData(prev => ({
            ...prev,
            ...userData,
            CONTRASEÑA: '' // No mostrar contraseña existente
          }));
          setLoading(false);
        }
        // Si no tenemos userData pero tenemos userId, hacer llamada HTTP
        else if (userId) {
          const fetchUser = async () => {
            try {
              const userDataResponse = await usuariosService.obtenerPorId(userId);
              
              if (userDataResponse) {
                let userInfo;
                
                if (Array.isArray(userDataResponse) && userDataResponse.length > 0) {
                  userInfo = userDataResponse[0];
                } else if (typeof userDataResponse === 'object') {
                  userInfo = userDataResponse;
                }
                
                if (userInfo) {
                  setFormData(prev => ({
                    ...prev,
                    ...userInfo,
                    CONTRASEÑA: '' // No mostrar contraseña existente
                  }));
                }
              }
            } catch (err) {
              console.error('Error loading user:', err);
              setError(err.message || 'Error al cargar los datos del usuario');
            } finally {
              setLoading(false);
            }
          };
          
          fetchUser();
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error processing user data:', err);
        setError('Error al procesar los datos del usuario');
        setLoading(false);
      }
    }
  }, [userId, userData, isEdit]);

  // Cargar datos para clonación
  useEffect(() => {
    if (isClone && cloneData) {
      setLoading(true);
      try {
        // Usar los datos del usuario a clonar
        const userInfo = cloneData;
        
        // Preparar datos para clonación (sin ID y con nombre modificado)
        setFormData(prev => ({
          ...prev,
          ...userInfo,
          ID_EMPLEADO: null, // Remover ID para crear nuevo usuario
          NOMBRE: `${userInfo.NOMBRE} (duplicado)`, // Modificar nombre
          USUARIO: '', // Limpiar usuario (debe ser único)
          CONTRASEÑA: '', // Limpiar contraseña
        }));
      } catch (err) {
        console.error('Error loading clone data:', err);
        setError('Error al cargar los datos para clonación');
      } finally {
        setLoading(false);
      }
    }
  }, [isClone, cloneData]);

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
    
    if (!formData.NOMBRE?.trim()) {
      errors.NOMBRE = 'El nombre es obligatorio';
    }
    
    if (!formData.APELLIDOS?.trim()) {
      errors.APELLIDOS = 'Los apellidos son obligatorios';
    }
    
    if (!formData.USUARIO?.trim()) {
      errors.USUARIO = 'El usuario es obligatorio';
    }
    
    if (!isEdit && !formData.CONTRASEÑA?.trim()) {
      errors.CONTRASEÑA = 'La contraseña es obligatoria';
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
      let result;
      
      if (isEdit) {
        result = await usuariosService.actualizar(formData.ID_EMPLEADO, formData);
      } else {
        result = await usuariosService.crear(formData);
      }

      if (onSuccess) {
        onSuccess(result);
      }
      
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Modal.Header>
          <div className="flex items-center">
            <User size={18} className="mr-2" />
            <span>Cargando...</span>
          </div>
        </Modal.Header>
        
        <Modal.Body>
          <div className="flex justify-center items-center p-8">
            <div className="flex flex-col items-center">
              <RotateCw className="animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p className="text-gray-500 text-sm">Cargando información del usuario...</p>
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
          <User size={18} className="mr-2" />
          <span>
            {isEdit ? `Modificación del usuario - ${formData.APELLIDOS}` : 
             isClone ? 'Clonar Usuario' : 
             'Nuevo Usuario'}
          </span>
        </div>
      </Modal.Header>
      
      <Modal.Body>
        {error && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <TabPanel tabs={tabs}>
            {/* Pestaña Datos Personales */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Usuario"
                  id="USUARIO"
                  value={formData.USUARIO}
                  onChange={handleInputChange}
                  error={validationErrors.USUARIO}
                  required
                />
                <FormField
                  label="Cecilia"
                  id="NOMBRE"
                  value={formData.NOMBRE}
                  onChange={handleInputChange}
                  error={validationErrors.NOMBRE}
                  required
                />
                <FormField
                  label="Nombre"
                  id="APELLIDOS"
                  value={formData.APELLIDOS}
                  onChange={handleInputChange}
                  error={validationErrors.APELLIDOS}
                  required
                />
                <FormField
                  label="Apellidos"
                  id="APELLIDOS"
                  value={formData.APELLIDOS}
                  onChange={handleInputChange}
                />
                <FormField
                  label="Contraseña"
                  id="CONTRASEÑA"
                  type="password"
                  value={formData.CONTRASEÑA}
                  onChange={handleInputChange}
                  error={validationErrors.CONTRASEÑA}
                  required={!isEdit}
                />
                <FormField
                  label="Imagen"
                  id="IMAGEN"
                  value={formData.IMAGEN}
                  onChange={handleInputChange}
                />
              </div>
              
              <FormField
                label="Firma electrónica"
                id="FIRMA_ELECTRONICA"
                value={formData.FIRMA_ELECTRONICA}
                onChange={handleInputChange}
                placeholder="cecilia.cauceso@canagrosa.com"
              />
              
              <FormField
                label="Files"
                id="FILES"
                value={formData.FILES}
                onChange={handleInputChange}
                placeholder="\\servidor\\CANAGROSA\\Documentos\\FirmasCecilia.pfx"
              />
              
              {/* Revisión de Informes y Firma digital (FNMT) */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Revisión de Informes y Firma digital (FNMT)</h3>
                <div className="space-y-2">
                  <CheckboxField
                    id="REVISION_DE_MUESTRAS"
                    label="REVISIÓN DE MUESTRAS"
                    checked={formData.REVISION_DE_MUESTRAS === 1}
                    onChange={handleInputChange}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <FormField
                      label="Cargo Interno"
                      id="CARGO_INTERNO"
                      value={formData.CARGO_INTERNO}
                      onChange={handleInputChange}
                    />
                    <FormField
                      label="Ruta Servicio"
                      id="RUTA_SERVICIO"
                      value={formData.RUTA_SERVICIO}
                      onChange={handleInputChange}
                      placeholder="Explorar"
                    />
                    <FormField
                      label="Contraseña"
                      id="CONTRASEÑA_FNMT"
                      type="password"
                      value={formData.CONTRASEÑA_FNMT}
                      onChange={handleInputChange}
                      placeholder="Explorar"
                    />
                    <FormField
                      label="F. Caducidad"
                      id="F_CADUCIDAD"
                      type="date"
                      value={formData.F_CADUCIDAD}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              {/* Acceso Aplicaciones */}
              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Acceso Aplicaciones</h3>
                <CheckboxField
                  id="ORDENES_NO_PROCESADO"
                  label="Ordenes No Procesado"
                  checked={formData.ORDENES_NO_PROCESADO === 1}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Pestaña Propiedades */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-6">
                {/* Primera columna */}
                <div className="space-y-2">
                  <CheckboxField id="PER_IMPRESION" label="Impresión" checked={formData.PER_IMPRESION === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_FACTURACION" label="Facturación" checked={formData.PER_FACTURACION === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_MODIFICACION" label="Modificación" checked={formData.PER_MODIFICACION === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_EDICION" label="Edición" checked={formData.PER_EDICION === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_ALTAS_BAJAS_USUARIOS" label="Altas / Bajas usuarios" checked={formData.PER_ALTAS_BAJAS_USUARIOS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_SEGUNDA_EDICION" label="Segunda Edición" checked={formData.PER_SEGUNDA_EDICION === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_EXPLORAR" label="Explorar" checked={formData.PER_EXPLORAR === 1} onChange={handleInputChange} />
                </div>
                
                {/* Segunda columna */}
                <div className="space-y-2">
                  <CheckboxField id="PER_CONTABILIDAD" label="Contabilidad" checked={formData.PER_CONTABILIDAD === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_ENVIO_PEDIDOS_PROVEEDOR" label="Envío Pedidos a Proveedor" checked={formData.PER_ENVIO_PEDIDOS_PROVEEDOR === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_GESTION_PROYECTOS" label="Gestión de proyectos" checked={formData.PER_GESTION_PROYECTOS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_GESTION_INCIDENCIAS" label="Gestión de Incidencias" checked={formData.PER_GESTION_INCIDENCIAS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_OFERTAS" label="Ofertas" checked={formData.PER_OFERTAS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_CIERRE_MUESTRAS" label="Cierre de Muestras" checked={formData.PER_CIERRE_MUESTRAS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_PLAZO_ENTREGA" label="Plazos de Entrega" checked={formData.PER_PLAZO_ENTREGA === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_MOS_PLANIFICACION_CLIENTES" label="Mos Planificación de Clientes" checked={formData.PER_MOS_PLANIFICACION_CLIENTES === 1} onChange={handleInputChange} />
                </div>
                
                {/* Tercera columna */}
                <div className="space-y-2">
                  <CheckboxField id="PER_DEPARTAMENTOS" label="Departamentos" checked={formData.PER_DEPARTAMENTOS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_DOCUMENTA_CALIDAD" label="Documenta. Gestión Calidad" checked={formData.PER_DOCUMENTA_CALIDAD === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_GENERACION_DOCUMENTOS" label="Generación de documentos" checked={formData.PER_GENERACION_DOCUMENTOS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_TRAMITACION_SUBCONTRATA" label="Tramitación de subcontrata" checked={formData.PER_TRAMITACION_SUBCONTRATA === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_VIDEOS" label="Videos" checked={formData.PER_VIDEOS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_OFERTAS_ESPECIALES_MUESTRA" label="Ofertas Especiales Muestra" checked={formData.PER_OFERTAS_ESPECIALES_MUESTRA === 1} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Pestaña Responsables Dpto */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Primera columna */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 mb-3">Calidad</h4>
                  <CheckboxField id="PER_ACCESO_DOCUMENTACION_CALIDAD" label="Acceso Documentación Calidad" checked={formData.PER_ACCESO_DOCUMENTACION_CALIDAD === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_CREACION_VERSIONES_DOCUMENTOS" label="Creación Versiones Documentos" checked={formData.PER_CREACION_VERSIONES_DOCUMENTOS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_INSPECCION_DOC_CALIDAD" label="Inspección doc. calidad" checked={formData.PER_INSPECCION_DOC_CALIDAD === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_LISTA_PROCENSAL_PNT" label="Lista Procensal PNT" checked={formData.PER_LISTA_PROCENSAL_PNT === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_VER_TODAS_FAMILIAS" label="Ver todas las Familias" checked={formData.PER_VER_TODAS_FAMILIAS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_GESTION_NO_CONFORMIDADES" label="Gestión de No Conformidades" checked={formData.PER_GESTION_NO_CONFORMIDADES === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_NORMAS_NO_CONTROLADAS" label="Normas NO CONTROLADAS" checked={formData.PER_NORMAS_NO_CONTROLADAS === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_LISTADO_INCIDENCIAS" label="Listado de Incidencias" checked={formData.PER_LISTADO_INCIDENCIAS === 1} onChange={handleInputChange} />
                </div>
                
                {/* Segunda columna */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700 mb-3">Indicadores</h4>
                  <CheckboxField id="PER_CENTROS_PLAZO_ENTREGA" label="Centros de Plazo de Entrega" checked={formData.PER_CENTROS_PLAZO_ENTREGA === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_LISTADO_PLAZO_PASO" label="Listado de Plazos de Paso" checked={formData.PER_LISTADO_PLAZO_PASO === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_INDICADORES_CLIENTE" label="Indicadores Cliente" checked={formData.PER_INDICADORES_CLIENTE === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_PRODUCTIVIDAD" label="Productividad" checked={formData.PER_PRODUCTIVIDAD === 1} onChange={handleInputChange} />
                  
                  <h4 className="font-medium text-gray-700 mb-3 mt-6">Tesorería</h4>
                  <CheckboxField id="PER_MENU_TESORERIA" label="Menú Tesorería" checked={formData.PER_MENU_TESORERIA === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_FACTURAS_PROVEEDORES" label="Facturas Proveedores" checked={formData.PER_FACTURAS_PROVEEDORES === 1} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Pestaña Departamentos */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <h4 className="font-medium text-gray-700">Facturación</h4>
                <div className="grid grid-cols-2 gap-4">
                  <CheckboxField id="PER_CARGAR_PNT" label="Cargar PNT" checked={formData.PER_CARGAR_PNT === 1} onChange={handleInputChange} />
                  <CheckboxField id="PER_FACTURACION_ANUAL" label="Fact Facturación Anual" checked={formData.PER_FACTURACION_ANUAL === 1} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Pestaña Indicadores */}
            <div className="space-y-4">
              <div className="text-center py-8">
                <Star className="mx-auto text-gray-400 mb-2" size={48} />
                <p className="text-gray-500">Configuración de indicadores del usuario</p>
                <p className="text-gray-400 text-sm mt-1">Esta sección se configurará según las necesidades específicas</p>
              </div>
            </div>
          </TabPanel>
        </form>
      </Modal.Body>
      
      <Modal.Footer>
        <div className="flex justify-end space-x-2">
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
                {isEdit ? 'Actualizar' : 'Crear Usuario'}
              </>
            )}
          </button>
        </div>
      </Modal.Footer>
    </>
  );
};

export default UserForm;