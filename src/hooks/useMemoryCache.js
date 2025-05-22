import { useState, useCallback, useRef, useEffect } from 'react';

// Caché global compartida entre componentes
const globalCache = new Map();

/**
 * Hook para implementar caché en memoria
 * 
 * @param {string} namespace - Espacio de nombres para este caché (para evitar colisiones)
 * @param {number} expiryTime - Tiempo en ms hasta que la entrada expira (por defecto 5 minutos)
 * @returns {Object} - Funciones para interactuar con el caché
 */
export function useMemoryCache(namespace = 'default', expiryTime = 5 * 60 * 1000) {
  // Referencia a la última versión del caché
  const cacheRef = useRef(new Map());
  
  // Estado para forzar actualizaciones cuando el caché cambia
  const [version, setVersion] = useState(0);
  
  // Limpiar caché expirado al montar componente
  useEffect(() => {
    // Obtener el caché existente para este namespace
    if (!globalCache.has(namespace)) {
      globalCache.set(namespace, new Map());
    }
    cacheRef.current = globalCache.get(namespace);
    
    // Limpiar entradas expiradas
    clearExpired();
    
    // Programar limpieza periódica
    const interval = setInterval(clearExpired, expiryTime / 2);
    return () => clearInterval(interval);
  }, [namespace, expiryTime]);
  
  // Función para limpiar entradas expiradas
  const clearExpired = useCallback(() => {
    const now = Date.now();
    let hasChanges = false;
    
    cacheRef.current.forEach((value, key) => {
      if (value.expiry < now) {
        cacheRef.current.delete(key);
        hasChanges = true;
      }
    });
    
    // Actualizar estado solo si hubo cambios
    if (hasChanges) {
      setVersion(v => v + 1);
    }
  }, []);
  
  // Obtener valor del caché
  const get = useCallback((key) => {
    const entry = cacheRef.current.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Verificar si ha expirado
    if (entry.expiry < Date.now()) {
      cacheRef.current.delete(key);
      setVersion(v => v + 1);
      return undefined;
    }
    
    return entry.value;
  }, []);
  
  // Guardar valor en caché
  const set = useCallback((key, value, customExpiryTime) => {
    const expiry = Date.now() + (customExpiryTime || expiryTime);
    cacheRef.current.set(key, { value, expiry });
    setVersion(v => v + 1);
    return value;
  }, [expiryTime]);
  
  // Eliminar valor del caché
  const remove = useCallback((key) => {
    const hadKey = cacheRef.current.has(key);
    cacheRef.current.delete(key);
    
    // Solo actualizar si realmente había una clave
    if (hadKey) {
      setVersion(v => v + 1);
    }
  }, []);
  
  // Limpiar todo el caché
  const clear = useCallback(() => {
    const hadEntries = cacheRef.current.size > 0;
    cacheRef.current.clear();
    
    // Solo actualizar si había entradas
    if (hadEntries) {
      setVersion(v => v + 1);
    }
  }, []);
  
  // Función para obtener o calcular valor (útil para datos costosos)
  const getOrSet = useCallback(async (key, valueFactory, customExpiryTime) => {
    // Intentar obtener del caché primero
    const cachedValue = get(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }
    
    // Calcular el valor (soporta funciones async)
    try {
      const newValue = typeof valueFactory === 'function' 
        ? await valueFactory()
        : valueFactory;
      
      // Guardar el valor calculado
      return set(key, newValue, customExpiryTime);
    } catch (error) {
      console.error(`Error calculating cached value for key '${key}':`, error);
      throw error;
    }
  }, [get, set]);
  
  // Información sobre el estado actual del caché
  const info = {
    size: cacheRef.current.size,
    keys: Array.from(cacheRef.current.keys()),
    namespace,
    version
  };
  
  return {
    get,
    set,
    remove,
    clear,
    getOrSet,
    clearExpired,
    info
  };
}

export default useMemoryCache;