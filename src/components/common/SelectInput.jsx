import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Search, Check, ChevronDown, X } from 'lucide-react';

// Memoizado para evitar renderizados innecesarios
const SelectInput = memo(({
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  name,
  id,
  className = '',
  disabled = false,
  error = null,
  allowClear = true,
  filterOption = (input, option) => 
    option.label.toLowerCase().includes(input.toLowerCase()),
  icon = <Search size={16} className="text-gray-400" />,
  maxDisplayItems = 100 // Limitar cantidad máxima de elementos para mejor rendimiento
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [visibleOptions, setVisibleOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  // Optimización: usamos useCallback para memoizar las funciones
  const filterOptions = useCallback((input) => {
    let filtered;
    if (input.trim() === '') {
      filtered = options;
    } else {
      filtered = options.filter(option => filterOption(input, option));
    }
    
    // Limitar el número de elementos visibles para mejor rendimiento
    return filtered.slice(0, maxDisplayItems);
  }, [options, filterOption, maxDisplayItems]);

  // Inicializar opciones visibles
  useEffect(() => {
    setVisibleOptions(options.slice(0, maxDisplayItems));
  }, [options, maxDisplayItems]);
  
  // Optimización: actualizar opciones visibles solo cuando cambia el texto o las opciones
  useEffect(() => {
    setVisibleOptions(filterOptions(searchText));
    setHighlightedIndex(-1);
  }, [searchText, filterOptions]);

  // Manejar clic fuera del componente para cerrar el dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(e.target) && 
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Actualizar el texto de búsqueda cuando se recibe un nuevo valor
  useEffect(() => {
    if (value) {
      const option = options.find(opt => opt.value === value);
      if (option) {
        setSearchText(option.label);
      }
    } else {
      setSearchText('');
    }
  }, [value, options]);

  // Manejadores de eventos - optimizados con useCallback
  const handleInputChange = useCallback((e) => {
    setSearchText(e.target.value);
    setShowDropdown(true);
  }, []);

  const handleOptionSelect = useCallback((option) => {
    onChange({ target: { name, value: option.value } });
    setSearchText(option.label);
    setShowDropdown(false);
    inputRef.current.focus();
  }, [onChange, name]);

  const handleInputFocus = useCallback(() => {
    setShowDropdown(true);
  }, []);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    setSearchText('');
    inputRef.current.focus();
  }, [onChange, name]);

  const handleKeyDown = useCallback((e) => {
    if (!showDropdown) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setShowDropdown(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < visibleOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < visibleOptions.length) {
          handleOptionSelect(visibleOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowDropdown(false);
        break;
      default:
        break;
    }
  }, [showDropdown, visibleOptions, highlightedIndex, handleOptionSelect]);

  // Scroll al elemento destacado - optimizado
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlighted = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlighted) {
        // Usar scrollIntoView con opciones de optimización
        highlighted.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'auto'
        });
      }
    }
  }, [highlightedIndex]);

  // Obtener el valor seleccionado actualmente
  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          id={id}
          name={name}
          value={searchText}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-9 pr-10 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : ''
          }`}
          autoComplete="off" // Deshabilitar autocompletado del navegador para evitar conflictos
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-2">
          {allowClear && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            className="text-gray-400 focus:outline-none pl-1"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <ChevronDown size={16} className={`transform ${showDropdown ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md overflow-auto focus:outline-none border border-gray-200"
        >
          {visibleOptions.length > 0 ? (
            <ul className="py-1">
              {visibleOptions.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
                  data-index={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`cursor-pointer px-3 py-2 flex items-center justify-between text-sm ${
                    index === highlightedIndex 
                      ? 'bg-blue-100 text-blue-900'
                      : option.value === value
                        ? 'bg-gray-100 text-gray-900'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                  {option.value === value && <Check size={16} className="text-blue-600" />}
                </li>
              ))}
              
              {options.length > maxDisplayItems && visibleOptions.length < options.length && (
                <li className="px-3 py-2 text-xs text-gray-500 text-center bg-gray-50">
                  Mostrando {visibleOptions.length} de {options.length} resultados. Sigue escribiendo para filtrar más.
                </li>
              )}
            </ul>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No hay resultados</div>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';

export default SelectInput;