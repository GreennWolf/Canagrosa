import React, { forwardRef, useState, useEffect, useImperativeHandle, useRef, useCallback } from 'react';
import { 
  Building, 
  MapPin, 
  Hash, 
  Phone, 
  AtSign, 
  User, 
  CheckCircle, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Loader,
  ExternalLink
} from 'lucide-react';
import ThemeConstants from '../../constants/ThemeConstants';

const ClientsTable = forwardRef(({
  data = [],
  isLoading = false,
  isLoadingMore = false,
  onRowSelect,
  onRowDoubleClick,
  loadMoreData,
  hasMoreData = false,
  emptyMessage = "No hay datos disponibles",
  showStatusColumn = true,
  initialSortColumn = 'NOMBRE',
  initialSortDirection = 'asc'
}, ref) => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [visibleData, setVisibleData] = useState([]);
  const [sortColumn, setSortColumn] = useState(initialSortColumn);
  const [sortDirection, setSortDirection] = useState(initialSortDirection);
  
  const tableRef = useRef(null);
  const isScrollListenerAttached = useRef(false);
  
  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setSelectedRow: (row) => {
      setSelectedRow(row);
    },
    getSelectedRow: () => selectedRow,
    scrollToTop: () => {
      const scrollContainer = tableRef.current?.querySelector('.custom-scrollbar');
      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }
    }
  }));
  
  // Sort data when sort parameters or data changes
  useEffect(() => {
    if (!data || data.length === 0) {
      setVisibleData([]);
      return;
    }
    
    const sortedData = [...data].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];
      
      // Handle nulls and undefined values
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';
      
      // Convert to strings for comparison (if they are not already)
      valueA = valueA.toString().toLowerCase();
      valueB = valueB.toString().toLowerCase();
      
      // Check if values are numeric
      const isNumeric = !isNaN(valueA) && !isNaN(valueB);
      
      if (isNumeric) {
        return sortDirection === 'asc' 
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      } else {
        return sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
    
    setVisibleData(sortedData);
  }, [data, sortColumn, sortDirection]);

  // Handle row selection
  const handleRowClick = (row, index) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row, index);
    }
  };
  
  // Handle row double click
  const handleRowDoubleClick = (row) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(row);
    }
  };
  
  // Handle sort change
  const handleSort = (column) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // Set up scroll event listener for infinite scrolling with debounce
  useEffect(() => {
    // Debounce function to prevent too many calls
    const debounce = (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    const handleScroll = () => {
      if (isLoading || isLoadingMore || !hasMoreData) return;
      
      // Use the table container instead of tableBodyRef
      const container = tableRef.current.querySelector('.custom-scrollbar');
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      // If we're near the bottom (within 200px), load more data
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        console.log('Near bottom, loading more data...');
        loadMoreData && loadMoreData();
      }
    };
    
    // Apply debounce to the scroll handler (200ms)
    const debouncedHandleScroll = debounce(handleScroll, 200);
    
    // Attach listener to the scrollable container (parent div with custom-scrollbar class)
    const scrollContainer = tableRef.current?.querySelector('.custom-scrollbar');
    
    if (scrollContainer && hasMoreData && !isScrollListenerAttached.current) {
      scrollContainer.addEventListener('scroll', debouncedHandleScroll);
      isScrollListenerAttached.current = true;
      
      // Initial check in case the content doesn't fill the container
      setTimeout(handleScroll, 100);
    }
    
    return () => {
      const scrollContainer = tableRef.current?.querySelector('.custom-scrollbar');
      if (scrollContainer && isScrollListenerAttached.current) {
        scrollContainer.removeEventListener('scroll', debouncedHandleScroll);
        isScrollListenerAttached.current = false;
      }
    };
  }, [isLoading, isLoadingMore, hasMoreData, loadMoreData]);
  
  // Get sort icon for column header
  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={12} className="ml-1 text-gray-400" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp size={12} className="ml-1 text-blue-500" />
      : <ChevronDown size={12} className="ml-1 text-blue-500" />;
  };
  
  // Render table header
  const renderHeader = () => (
    <thead className="sticky top-0 z-10 bg-slate-800 text-white">
      <tr>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer w-16"
          onClick={() => handleSort('ID_CLIENTE')}
        >
          <div className="flex items-center">
            ID {getSortIcon('ID_CLIENTE')}
          </div>
        </th>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer"
          onClick={() => handleSort('NOMBRE')}
        >
          <div className="flex items-center">
            Nombre {getSortIcon('NOMBRE')}
          </div>
        </th>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer"
          onClick={() => handleSort('DIRECCION')}
        >
          <div className="flex items-center">
            Dirección {getSortIcon('DIRECCION')}
          </div>
        </th>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer w-20"
          onClick={() => handleSort('COD_POSTAL')}
        >
          <div className="flex items-center">
            CP {getSortIcon('COD_POSTAL')}
          </div>
        </th>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer w-32"
          onClick={() => handleSort('CIF')}
        >
          <div className="flex items-center">
            CIF/NIF {getSortIcon('CIF')}
          </div>
        </th>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer w-28"
          onClick={() => handleSort('TELEFONO')}
        >
          <div className="flex items-center">
            Teléfono {getSortIcon('TELEFONO')}
          </div>
        </th>
        <th 
          className="px-2 py-2 text-left text-xs font-medium cursor-pointer"
          onClick={() => handleSort('EMAIL')}
        >
          <div className="flex items-center">
            Email {getSortIcon('EMAIL')}
          </div>
        </th>
        {showStatusColumn && (
          <th 
            className="px-2 py-2 text-left text-xs font-medium cursor-pointer w-24"
            onClick={() => handleSort('ANULADO')}
          >
            <div className="flex items-center">
              Estado {getSortIcon('ANULADO')}
            </div>
          </th>
        )}
      </tr>
    </thead>
  );
  
  // Render a cell with icon
  const renderIconCell = (icon, text, className = '') => (
    <div className={`flex items-center text-gray-800 ${className}`}>
      {icon}
      <span className="truncate ml-1">{text || '-'}</span>
    </div>
  );
  
  // Render table body
  const renderBody = () => {
    if (isLoading && visibleData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={showStatusColumn ? 8 : 7} className="px-2 py-4 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center">
                <Loader className="h-5 w-5 animate-spin text-blue-500 mb-2" />
                <span>Cargando datos...</span>
              </div>
            </td>
          </tr>
        </tbody>
      );
    }
    
    if (visibleData.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={showStatusColumn ? 8 : 7} className="px-2 py-4 text-center text-gray-500">
              {emptyMessage}
            </td>
          </tr>
        </tbody>
      );
    }
    
    return (
      <tbody>
        {visibleData.map((row, index) => {
          const isSelected = selectedRow && selectedRow.ID_CLIENTE === row.ID_CLIENTE;
          
          return (
            <tr 
              key={row.ID_CLIENTE}
              className={`border-b border-gray-100 cursor-pointer ${
                isSelected 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : index % 2 === 0 
                    ? 'bg-white hover:bg-gray-50' 
                    : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => handleRowClick(row, index)}
              onDoubleClick={() => handleRowDoubleClick(row)}
            >
              <td className="px-2 py-1.5 text-xs">{row.ID_CLIENTE}</td>
              <td className="px-2 py-1.5 text-xs max-w-xs">
                {renderIconCell(
                  <Building size={12} className="text-gray-500 flex-shrink-0" />,
                  row.NOMBRE
                )}
              </td>
              <td className="px-2 py-1.5 text-xs max-w-xs">
                {renderIconCell(
                  <MapPin size={12} className="text-gray-500 flex-shrink-0" />,
                  row.DIRECCION
                )}
              </td>
              <td className="px-2 py-1.5 text-xs">{row.COD_POSTAL || '-'}</td>
              <td className="px-2 py-1.5 text-xs">
                {renderIconCell(
                  <Hash size={12} className="text-gray-500 flex-shrink-0" />,
                  row.CIF
                )}
              </td>
              <td className="px-2 py-1.5 text-xs">
                {renderIconCell(
                  <Phone size={12} className="text-gray-500 flex-shrink-0" />,
                  row.TELEFONO
                )}
              </td>
              <td className="px-2 py-1.5 text-xs max-w-xs">
                {renderIconCell(
                  <AtSign size={12} className="text-gray-500 flex-shrink-0" />,
                  row.EMAIL
                )}
              </td>
              {showStatusColumn && (
                <td className="px-2 py-1.5 text-xs">
                  {row.ANULADO === 1 
                    ? (
                      <div className="flex items-center text-red-600">
                        <XCircle size={12} className="mr-1 flex-shrink-0" />
                        Anulado
                      </div>
                    ) 
                    : (
                      <div className="flex items-center text-green-600">
                        <CheckCircle size={12} className="mr-1 flex-shrink-0" />
                        Activo
                      </div>
                    )
                  }
                </td>
              )}
            </tr>
          );
        })}
        
        {isLoadingMore && (
          <tr>
            <td colSpan={showStatusColumn ? 8 : 7} className="px-2 py-2 text-center text-gray-500">
              <div className="flex items-center justify-center">
                <Loader className="h-4 w-4 animate-spin text-blue-500 mr-2" />
                <span className="text-xs">Cargando más...</span>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    );
  };

  // Estilo CSS para scrollbar personalizada y animaciones
  const scrollbarStyle = `
    .custom-scrollbar {
      scroll-behavior: smooth;
      overflow-y: scroll !important;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 12px;
      height: 12px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: #e5e7eb;
      border-radius: 8px;
      margin: 2px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: background-color 0.2s ease;
      min-height: 40px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #6b7280;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:active {
      background: #4b5563;
    }
    .custom-scrollbar::-webkit-scrollbar-corner {
      background: #e5e7eb;
    }
    
    /* Para Firefox */
    .custom-scrollbar {
      scrollbar-width: auto;
      scrollbar-color: #9ca3af #e5e7eb;
    }
    
    /* Indicador de carga animado */
    .loading-indicator {
      opacity: 0;
      transform: translateY(-10px);
      transition: all 0.3s ease-in-out;
    }
    .loading-indicator.visible {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  return (
    <div 
      ref={tableRef}
      className="w-full h-full flex flex-col border border-gray-200 rounded-md"
    >
      <style>{scrollbarStyle}</style>
      <div 
        className="flex-grow overflow-auto custom-scrollbar bg-white" 
        style={{ 
          height: '500px',
          minHeight: '400px',
          maxHeight: 'calc(100vh - 250px)'
        }}
      >
        <table className="w-full table-fixed border-collapse">
          {renderHeader()}
          {renderBody()}
        </table>
        
        {/* Indicador de carga (lazy loading) */}
        {hasMoreData && isLoadingMore && (
          <div className="w-full py-4 flex justify-center items-center bg-gray-50 border-t border-gray-200">
            <div className={`loading-indicator ${isLoadingMore ? 'visible' : ''} flex items-center`}>
              <Loader className="h-5 w-5 animate-spin text-blue-500 mr-3" />
              <span className="text-sm text-gray-600 font-medium">Cargando más resultados...</span>
            </div>
          </div>
        )}
        
        {/* Separador visual cuando hay más datos pero no se está cargando */}
        {hasMoreData && !isLoadingMore && visibleData.length > 0 && (
          <div className="w-full py-2 flex justify-center items-center bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 border-t border-gray-200">
            <div className="flex items-center text-gray-500">
              <ChevronDown size={14} className="mr-1" />
              <span className="text-xs">Desplázate para cargar más</span>
              <ChevronDown size={14} className="ml-1" />
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">{visibleData.length} {visibleData.length === 1 ? "cliente" : "clientes"}</span>
          {hasMoreData && (
            <span className="text-blue-600 font-medium flex items-center">
              {isLoadingMore ? (
                <Loader size={10} className="animate-spin mr-1" />
              ) : (
                <ChevronDown size={10} className="mr-1" />
              )}
              Hay más datos disponibles
            </span>
          )}
        </div>
        <div>
          {hasMoreData && !isLoadingMore && (
            <button 
              onClick={loadMoreData}
              className="text-blue-500 hover:text-blue-700 flex items-center bg-blue-50 px-2 py-1 rounded"
            >
              <span>Cargar más</span>
              <ExternalLink size={10} className="ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export default ClientsTable;