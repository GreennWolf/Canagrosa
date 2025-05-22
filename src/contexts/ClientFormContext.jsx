import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import * as Yup from 'yup';

// Contexto para el formulario de cliente
const ClientFormContext = createContext(null);

// Hook para usar el contexto
export const useClientForm = () => {
  const context = useContext(ClientFormContext);
  if (!context) {
    throw new Error('useClientForm debe ser usado dentro de un ClientFormProvider');
  }
  return context;
};

// Esquema de validación con Yup
const clientValidationSchema = Yup.object().shape({
  NOMBRE: Yup.string()
    .required('El nombre es obligatorio')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  CIF: Yup.string()
    .nullable()
    .matches(/^[A-Z0-9]{8,9}[A-Z0-9]$/, 'Formato de CIF/NIF inválido'),
  
  EMAIL: Yup.string()
    .nullable()
    .email('Formato de email inválido'),
  
  EMAIL2: Yup.string()
    .nullable()
    .email('Formato de email inválido'),
  
  EMAIL_FACTURACION: Yup.string()
    .nullable()
    .email('Formato de email inválido'),
  
  TELEFONO: Yup.string()
    .nullable()
    .matches(/^[+]?[\d\s()-]{6,20}$/, 'Formato de teléfono inválido'),
  
  COD_POSTAL: Yup.string()
    .nullable()
    .matches(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
  
  COD_POSTAL_ENVIO: Yup.string()
    .nullable()
    .matches(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
  
  COD_POSTAL_FACTURACION: Yup.string()
    .nullable()
    .matches(/^\d{5}$/, 'El código postal debe tener 5 dígitos'),
    
  WEB: Yup.string()
    .nullable()
    .url('Formato de URL inválido')
});

// Estado inicial del formulario
const initialFormState = {
  formData: {
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
  },
  errors: {},
  touched: {},
  isValid: false,
  isDirty: false,
  responsibles: [],
  loading: false,
  saving: false
};

// Acciones del reducer
const FORM_ACTIONS = {
  SET_FIELD: 'SET_FIELD',
  SET_MULTIPLE_FIELDS: 'SET_MULTIPLE_FIELDS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ERRORS: 'SET_ERRORS',
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  SET_TOUCHED: 'SET_TOUCHED',
  SET_VALIDATION_STATE: 'SET_VALIDATION_STATE',
  SET_RESPONSIBLES: 'SET_RESPONSIBLES',
  ADD_RESPONSIBLE: 'ADD_RESPONSIBLE',
  REMOVE_RESPONSIBLE: 'REMOVE_RESPONSIBLE',
  SET_LOADING: 'SET_LOADING',
  SET_SAVING: 'SET_SAVING',
  RESET_FORM: 'RESET_FORM',
  LOAD_CLIENT_DATA: 'LOAD_CLIENT_DATA',
  COPY_MAIN_ADDRESS: 'COPY_MAIN_ADDRESS'
};

// Reducer para el formulario
const clientFormReducer = (state, action) => {
  switch (action.type) {
    case FORM_ACTIONS.SET_FIELD:
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value
        },
        isDirty: true,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };

    case FORM_ACTIONS.SET_MULTIPLE_FIELDS:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.fields
        },
        isDirty: true
      };

    case FORM_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.field]: action.error
        }
      };

    case FORM_ACTIONS.CLEAR_ERROR:
      const newErrors = { ...state.errors };
      delete newErrors[action.field];
      return {
        ...state,
        errors: newErrors
      };

    case FORM_ACTIONS.SET_ERRORS:
      return {
        ...state,
        errors: action.errors
      };

    case FORM_ACTIONS.CLEAR_ERRORS:
      return {
        ...state,
        errors: {}
      };

    case FORM_ACTIONS.SET_TOUCHED:
      return {
        ...state,
        touched: {
          ...state.touched,
          [action.field]: true
        }
      };

    case FORM_ACTIONS.SET_VALIDATION_STATE:
      return {
        ...state,
        isValid: action.isValid
      };

    case FORM_ACTIONS.SET_RESPONSIBLES:
      return {
        ...state,
        responsibles: action.responsibles
      };

    case FORM_ACTIONS.ADD_RESPONSIBLE:
      const exists = state.responsibles.some(
        resp => resp.ID_EMPLEADO === action.responsible.ID_EMPLEADO
      );
      if (exists) return state;
      
      return {
        ...state,
        responsibles: [...state.responsibles, action.responsible]
      };

    case FORM_ACTIONS.REMOVE_RESPONSIBLE:
      return {
        ...state,
        responsibles: state.responsibles.filter(
          resp => resp.ID_EMPLEADO !== action.responsibleId
        )
      };

    case FORM_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.loading
      };

    case FORM_ACTIONS.SET_SAVING:
      return {
        ...state,
        saving: action.saving
      };

    case FORM_ACTIONS.RESET_FORM:
      return {
        ...initialFormState,
        formData: {
          ...initialFormState.formData,
          ...action.initialData
        }
      };

    case FORM_ACTIONS.LOAD_CLIENT_DATA:
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.clientData
        },
        responsibles: action.responsibles || [],
        isDirty: false
      };

    case FORM_ACTIONS.COPY_MAIN_ADDRESS:
      const addressType = action.addressType; // 'shipping' o 'billing'
      const addressFields = addressType === 'shipping' 
        ? {
            DIRECCION_ENVIO: state.formData.DIRECCION,
            COD_POSTAL_ENVIO: state.formData.COD_POSTAL,
            PAIS_ID_ENVIO: state.formData.PAIS_ID,
            PROVINCIA_ID_ENVIO: state.formData.PROVINCIA_ID,
            MUNICIPIO_ID_ENVIO: state.formData.MUNICIPIO_ID
          }
        : {
            DIRECCION_FACTURACION: state.formData.DIRECCION,
            COD_POSTAL_FACTURACION: state.formData.COD_POSTAL,
            PAIS_ID_FACTURACION: state.formData.PAIS_ID,
            PROVINCIA_ID_FACTURACION: state.formData.PROVINCIA_ID,
            MUNICIPIO_ID_FACTURACION: state.formData.MUNICIPIO_ID
          };
      
      return {
        ...state,
        formData: {
          ...state.formData,
          ...addressFields
        }
      };

    default:
      return state;
  }
};

// Provider del contexto
export const ClientFormProvider = ({ children, mode = 'create', initialData = {} }) => {
  const [state, dispatch] = useReducer(clientFormReducer, {
    ...initialFormState,
    formData: {
      ...initialFormState.formData,
      ...initialData
    }
  });

  // Función para actualizar un campo
  const setField = useCallback((field, value) => {
    dispatch({ type: FORM_ACTIONS.SET_FIELD, field, value });
    
    // Limpiar error si existe
    if (state.errors[field]) {
      dispatch({ type: FORM_ACTIONS.CLEAR_ERROR, field });
    }
  }, [state.errors]);

  // Función para actualizar múltiples campos
  const setFields = useCallback((fields) => {
    dispatch({ type: FORM_ACTIONS.SET_MULTIPLE_FIELDS, fields });
  }, []);

  // Función para validar un campo específico
  const validateField = useCallback(async (field, value) => {
    try {
      await clientValidationSchema.validateAt(field, { [field]: value });
      dispatch({ type: FORM_ACTIONS.CLEAR_ERROR, field });
      return true;
    } catch (error) {
      dispatch({ type: FORM_ACTIONS.SET_ERROR, field, error: error.message });
      return false;
    }
  }, []);

  // Función para validar todo el formulario
  const validateForm = useCallback(async () => {
    try {
      await clientValidationSchema.validate(state.formData, { abortEarly: false });
      dispatch({ type: FORM_ACTIONS.CLEAR_ERRORS });
      dispatch({ type: FORM_ACTIONS.SET_VALIDATION_STATE, isValid: true });
      return true;
    } catch (error) {
      const errors = {};
      error.inner.forEach(err => {
        errors[err.path] = err.message;
      });
      dispatch({ type: FORM_ACTIONS.SET_ERRORS, errors });
      dispatch({ type: FORM_ACTIONS.SET_VALIDATION_STATE, isValid: false });
      return false;
    }
  }, [state.formData]);

  // Función para manejar cambios de input
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
    
    setField(name, fieldValue);
    
    // Validar campo en tiempo real si ya ha sido tocado
    if (state.touched[name]) {
      validateField(name, fieldValue);
    }
  }, [setField, validateField, state.touched]);

  // Función para manejar blur de input
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    dispatch({ type: FORM_ACTIONS.SET_TOUCHED, field: name });
    validateField(name, value);
  }, [validateField]);

  // Función para gestionar responsables
  const addResponsible = useCallback((responsible) => {
    dispatch({ type: FORM_ACTIONS.ADD_RESPONSIBLE, responsible });
  }, []);

  const removeResponsible = useCallback((responsibleId) => {
    dispatch({ type: FORM_ACTIONS.REMOVE_RESPONSIBLE, responsibleId });
  }, []);

  const setResponsibles = useCallback((responsibles) => {
    dispatch({ type: FORM_ACTIONS.SET_RESPONSIBLES, responsibles });
  }, []);

  // Función para copiar dirección principal
  const copyMainAddress = useCallback((addressType) => {
    dispatch({ type: FORM_ACTIONS.COPY_MAIN_ADDRESS, addressType });
  }, []);

  // Función para cargar datos del cliente
  const loadClientData = useCallback((clientData, responsibles = []) => {
    dispatch({ 
      type: FORM_ACTIONS.LOAD_CLIENT_DATA, 
      clientData, 
      responsibles 
    });
  }, []);

  // Función para resetear el formulario
  const resetForm = useCallback((initialData = {}) => {
    dispatch({ type: FORM_ACTIONS.RESET_FORM, initialData });
  }, []);

  // Estados de carga
  const setLoading = useCallback((loading) => {
    dispatch({ type: FORM_ACTIONS.SET_LOADING, loading });
  }, []);

  const setSaving = useCallback((saving) => {
    dispatch({ type: FORM_ACTIONS.SET_SAVING, saving });
  }, []);

  // Función para obtener datos preparados para envío
  const getSubmitData = useCallback(() => {
    return {
      ...state.formData,
      // Convertir cadenas vacías a null para los selects
      PAIS_ID: state.formData.PAIS_ID || null,
      PROVINCIA_ID: state.formData.PROVINCIA_ID || null,
      MUNICIPIO_ID: state.formData.MUNICIPIO_ID || null,
      PAIS_ID_ENVIO: state.formData.PAIS_ID_ENVIO || null,
      PROVINCIA_ID_ENVIO: state.formData.PROVINCIA_ID_ENVIO || null,
      MUNICIPIO_ID_ENVIO: state.formData.MUNICIPIO_ID_ENVIO || null,
      PAIS_ID_FACTURACION: state.formData.PAIS_ID_FACTURACION || null,
      PROVINCIA_ID_FACTURACION: state.formData.PROVINCIA_ID_FACTURACION || null,
      MUNICIPIO_ID_FACTURACION: state.formData.MUNICIPIO_ID_FACTURACION || null,
      FP_ID: state.formData.FP_ID || null,
      TARIFA_ID: state.formData.TARIFA_ID || null,
      PARENT_ID: state.formData.PARENT_ID || null,
      // Agregar responsables
      responsables: state.responsibles.map(resp => resp.ID_EMPLEADO)
    };
  }, [state.formData, state.responsibles]);

  // Valor del contexto memorizado
  const contextValue = useMemo(() => ({
    // Estado
    formData: state.formData,
    errors: state.errors,
    touched: state.touched,
    isValid: state.isValid,
    isDirty: state.isDirty,
    responsibles: state.responsibles,
    loading: state.loading,
    saving: state.saving,
    mode,

    // Funciones para campos
    setField,
    setFields,
    handleChange,
    handleBlur,
    validateField,
    validateForm,

    // Funciones para responsables
    addResponsible,
    removeResponsible,
    setResponsibles,

    // Funciones para direcciones
    copyMainAddress,

    // Funciones de estado
    loadClientData,
    resetForm,
    setLoading,
    setSaving,
    getSubmitData,

    // Esquema de validación
    validationSchema: clientValidationSchema
  }), [
    state,
    mode,
    setField,
    setFields,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    addResponsible,
    removeResponsible,
    setResponsibles,
    copyMainAddress,
    loadClientData,
    resetForm,
    setLoading,
    setSaving,
    getSubmitData
  ]);

  return (
    <ClientFormContext.Provider value={contextValue}>
      {children}
    </ClientFormContext.Provider>
  );
};

export default ClientFormContext;