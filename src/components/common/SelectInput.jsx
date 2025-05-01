import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, ChevronDown, X } from 'lucide-react';

const SelectInput = React.memo(({
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
  icon = <Search size={12} className="text-gray-400" />,
  maxDisplayItems = 100
}) => {
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [visibleOptions, setVisibleOptions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const optionsRef = useRef(options);
  
  // Actualizar la referencia cuando cambian las opciones
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Inicializar opciones visibles y actualizar cuando cambia searchText
  useEffect(() => {
    const filterOptions = () => {
      let results;
      const currentOptions = optionsRef.current;
      
      if (searchText.trim() === '') {
        results = currentOptions.slice(0, maxDisplayItems);
      } else {
        results = currentOptions
          .filter(option => 
            option.label.toLowerCase().includes(searchText.toLowerCase())
          )
          .slice(0, maxDisplayItems);
      }
      
      setVisibleOptions(results);
      setHighlightedIndex(-1);
    };
    
    filterOptions();
  }, [searchText, maxDisplayItems]);

  // Actualizar searchText cuando cambia el valor seleccionado
  useEffect(() => {
    if (value) {
      const selectedOption = optionsRef.current.find(opt => opt.value === value);
      if (selectedOption) {
        setSearchText(selectedOption.label);
      }
    } else {
      setSearchText('');
    }
  }, [value]);

  // Manejar clic fuera para cerrar dropdown
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

  // Scroll al elemento destacado
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const highlighted = dropdownRef.current.querySelector(`[data-index="${highlightedIndex}"]`);
      if (highlighted) {
        highlighted.scrollIntoView({
          block: 'nearest',
          inline: 'nearest',
          behavior: 'auto'
        });
      }
    }
  }, [highlightedIndex]);

  // Handlers para eventos de usuario
  const handleInputChange = (e) => {
    setSearchText(e.target.value);
    setShowDropdown(true);
  };

  const handleOptionSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    setSearchText(option.label);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    setSearchText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
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
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
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
          className={`w-full pl-7 pr-8 py-1 text-xs border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            disabled ? 'bg-gray-100' : ''
          }`}
          autoComplete="off"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">
          {allowClear && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 focus:outline-none p-1"
            >
              <X size={12} />
            </button>
          )}
          <button
            type="button"
            className="text-gray-400 focus:outline-none p-1"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <ChevronDown size={12} className={`transform ${showDropdown ? 'rotate-180' : ''} transition-transform`} />
          </button>
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-48 rounded-md overflow-auto focus:outline-none border border-gray-200"
        >
          {visibleOptions.length > 0 ? (
            <ul className="py-1">
              {visibleOptions.map((option, index) => (
                <li
                  key={`${option.value}-${index}`}
                  data-index={index}
                  onClick={() => handleOptionSelect(option)}
                  className={`cursor-pointer px-2 py-1 flex items-center justify-between text-xs ${
                    index === highlightedIndex 
                      ? 'bg-blue-100 text-blue-900'
                      : option.value === value
                        ? 'bg-gray-100 text-gray-900'
                        : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {option.value === value && <Check size={12} className="text-blue-600 ml-1 flex-shrink-0" />}
                </li>
              ))}
              
              {options.length > maxDisplayItems && visibleOptions.length < options.length && (
                <li className="px-2 py-1 text-xs text-gray-500 text-center bg-gray-50">
                  {visibleOptions.length} de {options.length}
                </li>
              )}
            </ul>
          ) : (
            <div className="px-2 py-1 text-xs text-gray-500 text-center">Sin resultados</div>
          )}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
});

SelectInput.displayName = 'SelectInput';

export default SelectInput;