import { useState, useEffect, useRef } from 'react';

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
  // Referencias para evitar ciclos de dependencias
  const dataRef = useRef(data);
  const filtersRef = useRef(filters);
  const filterFunctionsRef = useRef(filterFunctions);
  
  // Estados para resultados y métricas
  const [filteredData, setFilteredData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedFilters, setDebouncedFilters] = useState(filters);
  const [performanceMetrics, setPerformanceMetrics] = useState({
    filterTime: 0,
    lastFilterTimestamp: null
  });
  
  // Actualizar referencias cuando cambian las props
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);
  
  useEffect(() => {
    filterFunctionsRef.current = filterFunctions;
  }, [filterFunctions]);
  
  // Función de filtrado por defecto
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
  
  // Efecto para aplicar debouncing a los filtros
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({...filters});
    }, options.debounceTime);
    
    return () => {
      clearTimeout(handler);
    };
  }, [filters, options.debounceTime]);
  
  // Efecto para filtrar los datos
  useEffect(() => {
    const filterData = () => {
      const startTime = performance.now();
      const currentData = dataRef.current;
      
      // Verificar si hay datos
      if (!currentData || currentData.length === 0) {
        setFilteredData([]);
        setPerformanceMetrics({
          filterTime: 0,
          lastFilterTimestamp: Date.now()
        });
        return;
      }
      
      // Verificar filtros activos
      const activeFilters = Object.entries(debouncedFilters).filter(
        ([_, value]) => value !== null && value !== undefined && value !== ''
      );
      
      if (activeFilters.length === 0) {
        setFilteredData(currentData);
        setPerformanceMetrics({
          filterTime: 0,
          lastFilterTimestamp: Date.now()
        });
        return;
      }
      
      // Aplicar filtros
      const result = currentData.filter(item => {
        return activeFilters.every(([key, filterValue]) => {
          const itemValue = item[key];
          const customFilterFn = filterFunctionsRef.current[key];
          return customFilterFn 
            ? customFilterFn(itemValue, filterValue, key)
            : defaultFilterFunction(itemValue, filterValue, key);
        });
      });
      
      const endTime = performance.now();
      
      setFilteredData(result);
      setPerformanceMetrics({
        filterTime: endTime - startTime,
        lastFilterTimestamp: Date.now()
      });
    };
    
    filterData();
  }, [debouncedFilters]); // Solo dependemos de los filtros debounceados
  
  // Efecto para actualizar datos visibles y paginación
  useEffect(() => {
    // Actualizar paginación
    if (options.paginate) {
      const pages = Math.ceil(filteredData.length / options.itemsPerPage);
      setTotalPages(Math.max(1, pages));
      setCurrentPage(prev => Math.min(prev, Math.max(1, pages)));
      
      // Actualizar datos visibles según la página actual
      const start = (currentPage - 1) * options.itemsPerPage;
      const end = start + options.itemsPerPage;
      setVisibleData(filteredData.slice(start, end));
    } else {
      setVisibleData(filteredData);
    }
  }, [filteredData, currentPage, options.paginate, options.itemsPerPage]);
  
  // Función para cambiar de página
  const changePage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };
  
  // Función para resetear los filtros
  const resetFilters = () => {
    return Object.keys(filtersRef.current).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
  };
  
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