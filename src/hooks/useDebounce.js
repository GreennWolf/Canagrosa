import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hook para crear una versión debounced de un valor
 * 
 * @param {any} value - El valor que queremos aplicar debounce
 * @param {number} delay - Tiempo de espera en millisegundos
 * @returns {any} - Valor con debounce aplicado
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

/**
 * Hook para crear una función con debounce
 * 
 * @param {Function} fn - Función a ejecutar
 * @param {number} delay - Tiempo de espera en millisegundos
 * @returns {Function} - Función con debounce aplicado
 */
export function useDebouncedCallback(fn, delay = 300) {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      fn(...args);
    }, delay);
  }, [fn, delay]);
}