import { useState, useEffect, useMemo, useCallback } from 'react';

/**
 * Hook personalizado para filtrado optimizado de datos
 * 
 * @param {Array} data - Datos originales
 * @param {Object} filters - Objeto con los filtros a aplicar
 * @param {Object} filterFunctions - Funciones de filtrado para cada propiedad (opcional)
 * @param {Object} options - Opciones adicionales de configuración
 * @returns {Object} - Objeto con los datos filtrados y funciones auxiliares
 */
const useOptimizedFilter = (
  data = [],
  filters = {},
  filterFunctions = {},
  options = { debounceTime: 250, paginate: false, itemsPerPage: 30 }
) => {
  // Estado para los datos filtrados
  const [filteredData, setFilteredData] = useState([]);
  
  // Estado para la paginación (si está habilitada)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [visibleData, setVisibleData] = useState([]);
  
  // Estado para debouncing (evitar filtrados demasiado frecuentes)
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  
  // Estado para tracking de rendimiento
  const [performanceMetrics, setPerformanceMetrics] = useState({
    filterTime: 0,
    lastFilterTimestamp: null
  });
  
  // Memoizamos las funciones de filtrado para cada propiedad
  const memoizedFilterFunctions = useMemo(() => {
    const defaultFilterFunction = (value, filterValue, key) => {
      if (filterValue === null || filterValue === undefined || filterValue === '') return true;
      
      // Si el valor es un número
      if (typeof value === 'number') {
        if (typeof filterValue === 'string' && filterValue.includes('-')) {
          // Rango: "10-20"
          const [min, max] = filterValue.split('-').map(Number);
          return value >= min && value <= max;
        } else {
          // Valor exacto
          return value === Number(filterValue);
        }
      }
      
      // Si el valor es una cadena
      if (typeof value === 'string') {
        return value.toLowerCase().includes(String(filterValue).toLowerCase());
      }
      
      // Si el valor es booleano o 0/1
      if (typeof value === 'boolean' || (typeof value === 'number' && (value === 0 || value === 1))) {
        return value === (filterValue === true || filterValue === 1 || filterValue === '1');
      }
      
      // Si el valor es una fecha
      if (value instanceof Date) {
        if (filterValue instanceof Date) {
          return value.toDateString() === filterValue.toDateString();
        }
        
        if (typeof filterValue === 'string') {
          // Intentar parsear como fecha
          try {
            const filterDate = new Date(filterValue);
            return value.toDateString() === filterDate.toDateString();
          } catch (err) {
            return false;
          }
        }
      }
      
      return false;
    };
    
    // Crear un objeto con las funciones de filtrado para cada propiedad
    const result = {};
    
    // Extraer todas las propiedades de los filtros
    Object.keys(filters).forEach(key => {
      result[key] = filterFunctions[key] || defaultFilterFunction;
    });
    
    return result;
  }, [filters, filterFunctions]);
  
  // Función de filtrado principal memoizada
  const filterData = useCallback((dataToFilter, filtersToApply) => {
    const startTime = performance.now();
    
    // Evitar procesamiento si no hay datos o filtros
    if (!dataToFilter || dataToFilter.length === 0) {
      setPerformanceMetrics({
        filterTime: 0,
        lastFilterTimestamp: Date.now()
      });
      return [];
    }
    
    // Filtrar solo si hay filtros activos
    const activeFilters = Object.entries(filtersToApply).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ''
    );
    
    if (activeFilters.length === 0) {
      setPerformanceMetrics({
        filterTime: 0,
        lastFilterTimestamp: Date.now()
      });
      return dataToFilter;
    }
    
    // Aplicar filtros
    const result = dataToFilter.filter(item => {
      return activeFilters.every(([key, filterValue]) => {
        const itemValue = item[key];
        const filterFunction = memoizedFilterFunctions[key];
        
        return filterFunction(itemValue, filterValue, key);
      });
    });
    
    const endTime = performance.now();
    setPerformanceMetrics({
      filterTime: endTime - startTime,
      lastFilterTimestamp: Date.now()
    });
    
    return result;
  }, [memoizedFilterFunctions]);
  
  // Efecto para aplicar debouncing a los filtros
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, options.debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [filters, options.debounceTime]);
  
  // Efecto para filtrar los datos cuando cambian los filtros o los datos originales
  useEffect(() => {
    const newFilteredData = filterData(data, debouncedFilters);
    setFilteredData(newFilteredData);
    
    // Calcular paginación si está habilitada
    if (options.paginate) {
      const pages = Math.ceil(newFilteredData.length / options.itemsPerPage);
      setTotalPages(Math.max(1, pages));
      setCurrentPage(old => Math.min(old, Math.max(1, pages)));
    }
  }, [data, debouncedFilters, filterData, options.paginate, options.itemsPerPage]);
  
  // Efecto para actualizar los datos visibles según la paginación
  useEffect(() => {
    if (options.paginate) {
      const start = (currentPage - 1) * options.itemsPerPage;
      const end = start + options.itemsPerPage;
      setVisibleData(filteredData.slice(start, end));
    } else {
      setVisibleData(filteredData);
    }
  }, [filteredData, currentPage, options.paginate, options.itemsPerPage]);
  
  // Funcion para cambiar de página
  const changePage = useCallback((page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);
  
  // Función para resetear los filtros
  const resetFilters = useCallback(() => {
    return Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
  }, [filters]);
  
  // Devolver datos filtrados, funciones útiles y métricas
  return {
    // Datos
    filteredData,
    visibleData,
    totalCount: filteredData.length,
    
    // Paginación
    currentPage,
    totalPages,
    changePage,
    nextPage: () => changePage(currentPage + 1),
    prevPage: () => changePage(currentPage - 1),
    
    // Utilidades
    resetFilters,
    isFiltering: Object.values(debouncedFilters).some(v => v !== null && v !== undefined && v !== ''),
    
    // Rendimiento
    performance: performanceMetrics
  };
};

export default useOptimizedFilter;