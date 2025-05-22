import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { ChevronDown, Loader } from 'lucide-react';

const EnhancedTable = forwardRef(({
  data = [],
  columns = [],
  isLoading = false,
  onRowSelect = null,
  initialVisibleColumns = null,
  tableId = 'default-table',
  headerClassName = "",
  emptyMessage = "No hay datos disponibles"
}, ref) => {
  // Estado para columnas visibles
  const [visibleColumns, setVisibleColumns] = useState(
    initialVisibleColumns || columns.map(col => col.accessor)
  );
  
  // Estado para la fila seleccionada
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Refs
  const tableContainerRef = useRef(null);
  
  // Exponer métodos a través de la ref
  useImperativeHandle(ref, () => ({
    tableContainer: tableContainerRef.current,
    selectedRow,
    setSelectedRow
  }));
  
  // Handler para clic en filas
  const handleRowClick = (row) => {
    if (selectedRow === row) {
      setSelectedRow(null);
      if (onRowSelect) onRowSelect(null);
    } else {
      setSelectedRow(row);
      if (onRowSelect) onRowSelect(row);
    }
  };
  
  // Filtrar columnas visibles
  const visibleColumnObjects = columns.filter(col => 
    visibleColumns.includes(col.accessor)
  );

  // Mostrar loader si está cargando
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-8 px-4 bg-white rounded-md shadow-sm border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-600 text-sm">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" ref={ref}>
      <div 
        className="overflow-auto flex-grow border border-gray-200 rounded-md bg-white"
        ref={tableContainerRef}
      >
        <table 
          className="w-full table-auto text-xs"
          id={`table-${tableId}`}
          style={{ tableLayout: 'fixed' }}
        >
          <thead className={`sticky top-0 z-10 ${headerClassName}`}>
            <tr className="border-b border-gray-200">
              {visibleColumnObjects.map((column) => (
                <th
                  key={column.accessor}
                  className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ width: column.width }}
                >
                  <div className="flex items-center">
                    <span className="truncate">{column.header}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={row.id || rowIndex}
                  onClick={() => handleRowClick(row)}
                  className={`
                    cursor-pointer border-b border-gray-100
                    ${(rowIndex % 2 === 0) ? 'bg-white' : 'bg-gray-50'}
                    ${selectedRow === row ? 'bg-blue-500 text-white font-bold border border-blue-600' : ''}
                  `}
                >
                  {visibleColumnObjects.map((column) => (
                    <td 
                      key={`${rowIndex}-${column.accessor}`}
                      className="px-3 py-2 text-xs"
                    >
                      {column.render ? column.render(row) : row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={visibleColumnObjects.length} 
                  className="px-3 py-6 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Barra de estado */}
      <div className="flex justify-between items-center px-3 py-1 bg-gray-50 border border-gray-200 border-t-0 rounded-b-md text-xs text-gray-500">
        <div>
          {data.length} registros
        </div>
      </div>
    </div>
  );
});

EnhancedTable.displayName = 'EnhancedTable';

export default EnhancedTable;