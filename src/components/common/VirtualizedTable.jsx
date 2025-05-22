import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, ChevronUp, Settings, Loader } from 'lucide-react';
import { useInView } from '../../hooks/useInView';

/**
 * Componente de tabla virtualizada para mostrar grandes cantidades de datos
 * con mejor rendimiento
 */
const VirtualizedTable = forwardRef(({
  data = [],
  columns = [],
  isLoading = false,
  isLoadingMore = false,
  hasMoreData = false,
  onRowClick = null,
  loadMoreData = null,
  emptyMessage = 'No hay datos disponibles',
  initialVisibleColumns = [],
  tableId = 'virtualized-table',
  rowHeight = 45, // Altura aproximada de cada fila en píxeles
  overscan = 10, // Número de filas adicionales a renderizar para scroll suave
  loadThreshold = 300, // Píxeles cercanos al final para cargar más datos
  className = '',
  enableColumnVisibility = true,
  enableSorting = true,
  onSettingsChange = null,
  noDataComponent = null
}, ref) => {
  // Estado
  const [scrollTop, setScrollTop] = useState(0);
  const [tableHeight, setTableHeight] = useState(0);
  const [visibleColumns, setVisibleColumns] = useState(initialVisibleColumns || columns.map(col => col.accessor));
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [sortedData, setSortedData] = useState(data);
  
  // Referencias
  const tableContainerRef = useRef(null);
  const tableBodyRef = useRef(null);
  const loadMoreRef = useRef(null);
  const [loadMoreElRef, isLoadMoreVisible] = useInView({
    rootMargin: `0px 0px ${loadThreshold}px 0px`
  });
  
  // Exponer métodos al componente padre
  useImperativeHandle(ref, () => ({
    scrollToTop: () => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }
    },
    scrollToRow: (index) => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = index * rowHeight;
      }
    },
    refreshTable: () => {
      setSortedData([...data]);
    }
  }));
  
  // Actualizar datos ordenados cuando cambian los datos o la configuración de ordenamiento
  useEffect(() => {
    if (!sortConfig.key) {
      setSortedData([...data]);
      return;
    }
    
    const sortableData = [...data];
    sortableData.sort((a, b) => {
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      
      // Manejar valores nulos o indefinidos
      if (valueA === null || valueA === undefined) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valueB === null || valueB === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
      
      // Ordenar según el tipo de dato
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortConfig.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      
      return sortConfig.direction === 'asc'
        ? valueA - valueB
        : valueB - valueA;
    });
    
    setSortedData(sortableData);
  }, [data, sortConfig]);
  
  // Actualizar altura de la tabla al montar y redimensionar ventana
  useEffect(() => {
    const updateTableHeight = () => {
      if (tableContainerRef.current) {
        setTableHeight(tableContainerRef.current.clientHeight);
      }
    };
    
    updateTableHeight();
    window.addEventListener('resize', updateTableHeight);
    
    return () => {
      window.removeEventListener('resize', updateTableHeight);
    };
  }, []);
  
  // Controlar scroll para virtualización
  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
    
    // Cargar más datos al acercarse al final
    if (loadMoreData && hasMoreData && !isLoadingMore) {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      
      if (distanceToBottom < loadThreshold) {
        loadMoreRef.current = true;
      }
    }
  }, [hasMoreData, isLoadingMore, loadMoreData, loadThreshold]);
  
  // Cargar más datos cuando el elemento está visible
  useEffect(() => {
    if (isLoadMoreVisible && loadMoreData && hasMoreData && !isLoadingMore) {
      loadMoreData();
    }
  }, [isLoadMoreVisible, loadMoreData, hasMoreData, isLoadingMore]);
  
  // Calcular filas visibles
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const visibleRowsCount = Math.ceil(tableHeight / rowHeight) + 2 * overscan;
  const endIndex = Math.min(startIndex + visibleRowsCount, sortedData.length);
  
  // Filas a renderizar
  const visibleRows = sortedData.slice(startIndex, endIndex);
  
  // Si hay datos para mostrar
  const hasData = !isLoading && sortedData.length > 0;
  
  // Controlar ordenamiento
  const requestSort = (key) => {
    if (!enableSorting) return;
    
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    // Notificar cambio de configuración
    if (onSettingsChange) {
      onSettingsChange({
        sortConfig: { key, direction },
        visibleColumns
      });
    }
  };
  
  // Controlar visibilidad de columnas
  const toggleColumnVisibility = (accessor) => {
    const newVisibleColumns = visibleColumns.includes(accessor)
      ? visibleColumns.filter(col => col !== accessor)
      : [...visibleColumns, accessor];
    
    setVisibleColumns(newVisibleColumns);
    
    // Notificar cambio de configuración
    if (onSettingsChange) {
      onSettingsChange({
        sortConfig,
        visibleColumns: newVisibleColumns
      });
    }
  };
  
  // Función para renderizar celda
  const renderCell = (column, row) => {
    if (column.render) {
      return column.render(row);
    }
    
    const value = row[column.accessor];
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    return value;
  };
  
  // Columnas filtradas según visibilidad
  const filteredColumns = columns.filter(col => visibleColumns.includes(col.accessor));
  
  return (
    <div 
      className={`relative flex flex-col h-full overflow-hidden ${className}`}
    >
      {/* Controles de tabla */}
      {enableColumnVisibility && (
        <div className="flex justify-end mb-1">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="text-xs py-0.5 px-1.5 text-gray-600 bg-gray-100 rounded flex items-center"
            title="Configurar columnas"
          >
            <Settings size={14} className="mr-1" />
            <span className="hidden sm:inline">Columnas</span>
          </button>
          
          {showColumnSelector && (
            <div className="absolute z-10 right-0 top-6 mt-1 bg-white border border-gray-200 rounded shadow-md p-2 text-xs">
              <div className="text-gray-700 font-medium mb-1 pb-1 border-b">Columnas visibles</div>
              <div className="max-h-40 overflow-y-auto">
                {columns.map(column => (
                  <div key={column.accessor} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`col-${column.accessor}`}
                      checked={visibleColumns.includes(column.accessor)}
                      onChange={() => toggleColumnVisibility(column.accessor)}
                      className="mr-2 h-3 w-3"
                    />
                    <label htmlFor={`col-${column.accessor}`} className="text-gray-700">
                      {column.header}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Contenedor de tabla */}
      <div 
        ref={tableContainerRef}
        className="flex-grow overflow-auto border border-gray-200 rounded"
        onScroll={handleScroll}
      >
        <div className="w-full">
          {/* Encabezado fijo */}
          <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <div className="flex text-xs font-medium text-gray-700">
              {filteredColumns.map(column => (
                <div 
                  key={column.accessor}
                  className={`px-3 py-2 ${column.width || ''} ${!column.width ? 'flex-1' : ''}`}
                >
                  {enableSorting ? (
                    <button
                      className="flex items-center w-full"
                      onClick={() => requestSort(column.accessor)}
                    >
                      <span className="flex-grow text-left">{column.header}</span>
                      {sortConfig.key === column.accessor && (
                        sortConfig.direction === 'asc' 
                          ? <ChevronUp size={14} /> 
                          : <ChevronDown size={14} />
                      )}
                    </button>
                  ) : (
                    <span>{column.header}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Cuerpo de tabla virtualizado */}
          <div 
            ref={tableBodyRef}
            className="relative w-full"
            style={{ height: `${sortedData.length * rowHeight}px` }}
          >
            {isLoading && !hasData ? (
              <div className="absolute inset-0 flex justify-center items-center bg-white bg-opacity-75">
                <div className="text-center">
                  <Loader size={20} className="animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Cargando datos...</p>
                </div>
              </div>
            ) : !hasData ? (
              <div className="absolute inset-0 flex justify-center items-center">
                {noDataComponent || (
                  <p className="text-sm text-gray-500">{emptyMessage}</p>
                )}
              </div>
            ) : (
              <div 
                style={{ 
                  transform: `translateY(${startIndex * rowHeight}px)`,
                }}
              >
                {visibleRows.map((row, index) => (
                  <div
                    key={row.id || index}
                    className={`flex text-xs border-b border-gray-100 hover:bg-blue-50 ${
                      onRowClick ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => onRowClick && onRowClick(row)}
                  >
                    {filteredColumns.map(column => (
                      <div 
                        key={column.accessor}
                        className={`px-3 py-2 text-gray-800 ${column.width || ''} ${!column.width ? 'flex-1' : ''}`}
                      >
                        {renderCell(column, row)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Elemento para detectar cuando cargar más */}
          {hasMoreData && !isLoading && (
            <div ref={loadMoreElRef} className="h-10 w-full flex justify-center items-center">
              {isLoadingMore && (
                <div className="flex items-center text-xs text-gray-500">
                  <Loader size={14} className="animate-spin mr-2" />
                  Cargando más...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

export default VirtualizedTable;