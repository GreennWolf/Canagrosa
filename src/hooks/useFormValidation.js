import { useState, useCallback, useMemo } from 'react';
import * as Yup from 'yup';

/**
 * Hook personalizado para validación de formularios
 * Proporciona validación en tiempo real y por lotes
 */
const useFormValidation = (schema, initialData = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // Actualizar un campo específico
  const setValue = useCallback((field, value) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Actualizar múltiples campos
  const setValues = useCallback((newData) => {
    setData(prev => ({
      ...prev,
      ...newData
    }));
  }, []);

  // Marcar un campo como tocado
  const setFieldTouched = useCallback((field, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [field]: isTouched
    }));
  }, []);

  // Validar un campo específico
  const validateField = useCallback(async (field, value = data[field]) => {
    try {
      await schema.validateAt(field, { [field]: value });
      
      // Limpiar error si la validación es exitosa
      setErrors(prev => {
        if (prev[field]) {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        }
        return prev;
      });
      
      return true;
    } catch (error) {
      // Establecer error si la validación falla
      setErrors(prev => ({
        ...prev,
        [field]: error.message
      }));
      
      return false;
    }
  }, [schema, data]);

  // Validar todos los campos
  const validateAll = useCallback(async () => {
    setIsValidating(true);
    
    try {
      await schema.validate(data, { abortEarly: false });
      
      // Limpiar todos los errores si la validación es exitosa
      setErrors({});
      setIsValidating(false);
      
      return true;
    } catch (error) {
      // Establecer todos los errores
      const validationErrors = {};
      
      if (error.inner) {
        error.inner.forEach(err => {
          validationErrors[err.path] = err.message;
        });
      } else {
        validationErrors.general = error.message;
      }
      
      setErrors(validationErrors);
      setIsValidating(false);
      
      return false;
    }
  }, [schema, data]);

  // Resetear el formulario
  const reset = useCallback((newInitialData = initialData) => {
    setData(newInitialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  // Manejar cambios de input (helper)
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setValue(name, fieldValue);
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      validateField(name, fieldValue);
    }
  }, [setValue, validateField, touched]);

  // Manejar blur de input (helper)
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target;
    
    setFieldTouched(name, true);
    validateField(name, value);
  }, [setFieldTouched, validateField]);

  // Verificar si el formulario es válido
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Verificar si el formulario tiene cambios
  const isDirty = useMemo(() => {
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, initialData]);

  // Obtener errores solo para campos tocados
  const touchedErrors = useMemo(() => {
    const result = {};
    Object.keys(errors).forEach(field => {
      if (touched[field]) {
        result[field] = errors[field];
      }
    });
    return result;
  }, [errors, touched]);

  return {
    // Estado
    data,
    errors,
    touchedErrors,
    touched,
    isValid,
    isDirty,
    isValidating,

    // Funciones de actualización
    setValue,
    setValues,
    setFieldTouched,

    // Funciones de validación
    validateField,
    validateAll,

    // Funciones de control
    reset,

    // Helpers para inputs
    handleChange,
    handleBlur,

    // Utilidades
    getFieldProps: (field) => ({
      name: field,
      value: data[field] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touchedErrors[field],
      touched: touched[field]
    })
  };
};

export default useFormValidation;