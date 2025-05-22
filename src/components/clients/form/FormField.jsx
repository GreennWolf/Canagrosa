import React, { memo } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Componente FormField mejorado y reutilizable
 * Maneja diferentes tipos de inputs con validación y estados visuales
 */
const FormField = memo(({
  label,
  id,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  touched = false,
  required = false,
  disabled = false,
  placeholder = '',
  options = [],
  rows = 4,
  className = '',
  labelClassName = '',
  inputClassName = '',
  icon = null,
  helpText = null,
  ...props
}) => {
  // Determinar clases CSS basadas en el estado - responsive
  const getInputClasses = () => {
    const baseClasses = `w-full px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs border rounded-md focus:outline-none focus:ring-1 transition-colors ${
      disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
    } text-gray-800`;
    
    const errorClasses = error && touched 
      ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
    
    return `${baseClasses} ${errorClasses} ${inputClassName}`;
  };

  // Renderizar el input según el tipo
  const renderInput = () => {
    const commonProps = {
      id: id || name,
      name,
      value: value || '',
      onChange,
      onBlur,
      disabled,
      placeholder,
      className: getInputClasses(),
      ...props
    };

    switch (type) {
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">{placeholder || 'Seleccione...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={rows}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={id || name}
              name={name}
              checked={value === 1 || value === true}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              {...props}
            />
            {placeholder && (
              <label htmlFor={id || name} className="ml-2 block text-xs text-gray-700">
                {placeholder}
              </label>
            )}
          </div>
        );

      case 'radio':
        return (
          <div className="flex items-center">
            <input
              type="radio"
              id={id || name}
              name={name}
              checked={value === 1 || value === true}
              onChange={onChange}
              onBlur={onBlur}
              disabled={disabled}
              className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors"
              {...props}
            />
            {placeholder && (
              <label htmlFor={id || name} className="ml-1 text-xs text-gray-700">
                {placeholder}
              </label>
            )}
          </div>
        );

      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                {icon}
              </div>
            )}
            <input
              type={type}
              {...commonProps}
              className={`${getInputClasses()} ${icon ? 'pl-8' : ''}`}
            />
          </div>
        );
    }
  };

  return (
    <div className={`mb-3 sm:mb-2 ${className}`}>
      {/* Label */}
      {label && type !== 'checkbox' && type !== 'radio' && (
        <label 
          htmlFor={id || name} 
          className={`block text-sm sm:text-xs text-gray-700 mb-2 sm:mb-1 font-medium ${labelClassName}`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input */}
      {renderInput()}
      
      {/* Texto de ayuda */}
      {helpText && !error && (
        <p className="mt-1 text-xs text-gray-500">{helpText}</p>
      )}
      
      {/* Error */}
      {error && touched && (
        <div className="mt-1 flex items-start">
          <AlertCircle size={12} className="text-red-500 mr-1 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

export default FormField;