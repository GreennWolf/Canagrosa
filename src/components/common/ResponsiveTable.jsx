import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';
import useResponsive from '../../hooks/useResponsive';
import ThemeConstants from '../../constants/ThemeConstants';

/**
 * Tabla responsive que se adapta automáticamente a diferentes tamaños de pantalla
 * En móvil muestra una vista de tarjetas colapsables
 * En tablet/desktop muestra tabla normal con scroll horizontal
 */
const ResponsiveTable = ({
  data = [],
  columns = [],
  loading = false,
  onRowClick = null,
  selectedRows = [],
  searchable = true,
  filterable = false,
  className = '',
  emptyMessage = 'No hay datos disponibles',
  loadingMessage = 'Cargando...',
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());
  const tableRef = useRef(null);

  // Filtrar datos por búsqueda
  const filteredData = searchTerm
    ? data.filter(row =>
        columns.some(col => {
          const value = row[col.accessor];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Toggle expandir fila en vista móvil
  const toggleRowExpansion = (rowIndex) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(rowIndex)) {
      newExpanded.delete(rowIndex);
    } else {
      newExpanded.add(rowIndex);
    }
    setExpandedRows(newExpanded);
  };

  // Renderizar vista móvil (tarjetas)
  const renderMobileView = () => (
    <div className="space-y-3">
      {filteredData.map((row, index) => {
        const isExpanded = expandedRows.has(index);
        const isSelected = selectedRows.includes(row);
        
        return (
          <div
            key={index}
            className={`border rounded-lg overflow-hidden ${ThemeConstants.bgColors.card} ${
              isSelected ? 'ring-2 ring-blue-500' : ''
            } ${ThemeConstants.shadows.sm}`}
          >
            {/* Header de la tarjeta - siempre visible */}
            <div
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => {
                if (onRowClick) onRowClick(row);
                toggleRowExpansion(index);
              }}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  {/* Mostrar las 2 primeras columnas principales */}
                  <div className="font-medium text-gray-900 truncate">
                    {row[columns[0]?.accessor] || '-'}
                  </div>
                  {columns[1] && (
                    <div className="text-sm text-gray-500 truncate mt-1">
                      {row[columns[1]?.accessor] || '-'}
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {/* Contenido expandible */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 gap-3">
                  {columns.slice(2).map((column) => (
                    <div key={column.accessor} className="flex justify-between">
                      <span className="text-sm font-medium text-gray-500">
                        {column.header}:
                      </span>
                      <span className="text-sm text-gray-900 text-right">
                        {column.render
                          ? column.render(row[column.accessor], row)
                          : row[column.accessor] || '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Renderizar vista tablet/desktop (tabla)
  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className={`${ThemeConstants.bgColors.header} sticky top-0 z-10`}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor}
                className={`px-3 sm:px-6 py-3 text-left text-xs font-medium ${ThemeConstants.textColors.header} uppercase tracking-wider ${
                  isTablet ? 'text-xs' : 'text-sm'
                }`}
                style={{ 
                  minWidth: column.minWidth || (isTablet ? '100px' : '120px'),
                  width: column.width 
                }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredData.map((row, index) => {
            const isSelected = selectedRows.includes(row);
            
            return (
              <tr
                key={index}
                className={`hover:bg-gray-50 transition-colors ${
                  isSelected ? 'bg-blue-50' : ''
                } ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.accessor}
                    className={`px-3 sm:px-6 py-4 whitespace-nowrap ${
                      isTablet ? 'text-xs' : 'text-sm'
                    } text-gray-900`}
                  >
                    <div className="truncate" title={row[column.accessor]}>
                      {column.render
                        ? column.render(row[column.accessor], row)
                        : row[column.accessor] || '-'}
                    </div>
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          {loadingMessage}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`} ref={tableRef}>
      {/* Barra de búsqueda y filtros */}
      {(searchable || filterable) && (
        <div className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          )}
          
          {filterable && (
            <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              <Filter size={16} className="mr-2" />
              Filtros
            </button>
          )}
        </div>
      )}

      {/* Contenido de la tabla */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className={`${ThemeConstants.bgColors.card} ${ThemeConstants.shadows.sm} rounded-lg overflow-hidden`}>
          {isMobile ? renderMobileView() : renderTableView()}
        </div>
      )}

      {/* Info del número de registros */}
      {filteredData.length > 0 && (
        <div className="mt-4 text-sm text-gray-500 text-center sm:text-left">
          Mostrando {filteredData.length} de {data.length} registros
          {searchTerm && ` (filtrado por "${searchTerm}")`}
        </div>
      )}
    </div>
  );
};

export default ResponsiveTable;