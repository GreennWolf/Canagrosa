import React, { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import { 
  SlidersHorizontal,
  Eye,
  EyeOff,
  GripHorizontal,
  Check,
  Loader,
  ChevronDown,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';
import ThemeConstants from '../../constants/ThemeConstants';

// Tooltip simplificado para contenido truncado
const Tooltip = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const childRef = useRef(null);

  const handleMouseEnter = (e) => {
    if (!childRef.current) return;
    const isTruncated = childRef.current.scrollWidth > childRef.current.clientWidth;
    if (isTruncated) {
      const rect = childRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left,
        y: rect.bottom + 5
      });
      setShowTooltip(true);
    }
  };

  return (
    <>
      <div 
        ref={childRef}
        className="truncate"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div
          className="fixed z-50 bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-lg max-w-xs"
          style={{
            left: position.x,
            top: position.y
          }}
        >
          {content}
        </div>
      )}
    </>
  );
};

// Menú de personalización de columnas
const ColumnCustomizationMenu = ({ 
  columns,
  visibleColumns,
  setVisibleColumns,
  onClose,
  position,
  columnOrder,
  setColumnOrder,
  columnWidths,
  setColumnWidths,
  minColumnWidth = 60,
  maxColumnWidth = 500
}) => {
  const [columnSettings, setColumnSettings] = useState(
    columnOrder.map(accessorId => {
      const col = columns.find(c => c.accessor === accessorId);
      return {
        ...col,
        visible: visibleColumns.includes(accessorId),
        width: columnWidths[accessorId] || 120
      };
    })
  );
  
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleVisibilityChange = (accessor) => {
    setColumnSettings(prev => {
      const newSettings = prev.map(col => {
        if (col.accessor === accessor) {
          return { ...col, visible: !col.visible };
        }
        return col;
      });
      return newSettings;
    });
  };

  const handleDragStart = (e, column) => {
    setDraggedColumn(column);
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn.accessor !== column.accessor) {
      setDragOverColumn(column);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedColumn && dragOverColumn && draggedColumn.accessor !== dragOverColumn.accessor) {
      setColumnSettings(prev => {
        const newColumns = [...prev];
        const draggedIndex = newColumns.findIndex(col => col.accessor === draggedColumn.accessor);
        const dropIndex = newColumns.findIndex(col => col.accessor === dragOverColumn.accessor);
        
        const [removed] = newColumns.splice(draggedIndex, 1);
        newColumns.splice(dropIndex, 0, removed);
        
        return newColumns;
      });
    }
    
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Función para ajustar el ancho de una columna
  const adjustColumnWidth = (accessor, amount) => {
    setColumnSettings(prev => {
      return prev.map(col => {
        if (col.accessor === accessor) {
          const newWidth = Math.max(
            minColumnWidth, 
            Math.min(col.width + amount, maxColumnWidth)
          );
          return { ...col, width: newWidth };
        }
        return col;
      });
    });
  };

  // Guardar cambios
  const handleSave = () => {
    const newVisibleColumns = columnSettings
      .filter(col => col.visible)
      .map(col => col.accessor);
    
    setVisibleColumns(newVisibleColumns);
    setColumnOrder(columnSettings.map(col => col.accessor));
    
    // Guardar los anchos de columnas
    const newWidths = {};
    columnSettings.forEach(col => {
      newWidths[col.accessor] = col.width;
    });
    setColumnWidths(newWidths);
    
    onClose();
  };

  // Checkbox simplificado
  const CustomCheckbox = ({ checked, onChange, label }) => (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={onChange}
    >
      <div className={`
        w-4 h-4 flex items-center justify-center mr-2
        border rounded
        ${checked 
          ? 'bg-blue-600 border-blue-600' 
          : `bg-white ${ThemeConstants.borders.input}`}
      `}>
        {checked && <Check size={10} color="white" />}
      </div>
      <span className="text-xs text-gray-700">{label}</span>
    </div>
  );

  // Obtener el ancho de cada columna
  const getColumnWidth = (accessor) => {
    const column = columnSettings.find(col => col.accessor === accessor);
    return column ? column.width : 120;
  };

  return (
    <div 
      className="absolute z-50 bg-white border border-gray-200 shadow-lg rounded-md p-2 w-80"
      style={{ 
        top: position.y, 
        left: position.x 
      }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-200">
        <h3 className="text-xs font-medium text-gray-700">Personalizar columnas</h3>
        <div className="text-xs text-gray-500">
          {columnSettings.filter(c => c.visible).length} de {columns.length}
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto mb-3">
        <ul className="space-y-2">
          {columnSettings.map((column) => (
            <li 
              key={column.accessor}
              draggable
              onDragStart={(e) => handleDragStart(e, column)}
              onDragOver={(e) => handleDragOver(e, column)}
              onDrop={handleDrop}
              className={`
                flex flex-col p-2 text-xs rounded border border-gray-200
                ${dragOverColumn?.accessor === column.accessor ? 'bg-blue-50 border-blue-200' : ''}
                ${draggedColumn?.accessor === column.accessor ? 'opacity-50' : ''}
                cursor-move hover:bg-gray-50
              `}
            >
              {/* Primera fila: nombre y visibilidad */}
              <div className="flex items-center justify-between w-full mb-2">
                <div className="flex items-center flex-grow">
                  <div className="mr-1 text-gray-400">
                    <GripHorizontal size={12} />
                  </div>
                  
                  <CustomCheckbox 
                    checked={column.visible}
                    onChange={() => handleVisibilityChange(column.accessor)}
                    label={column.header}
                  />
                </div>
                <div className="text-gray-400">
                  {column.visible 
                    ? <Eye size={14} className="text-blue-600" /> 
                    : <EyeOff size={14} />}
                </div>
              </div>
              
              {/* Segunda fila: ajuste de ancho */}
              <div className="flex items-center w-full mt-1">
                <div className="flex-grow border-t border-gray-200 mr-2"></div>
                <div className="flex items-center bg-gray-100 rounded p-1">
                  <button 
                    onClick={() => adjustColumnWidth(column.accessor, -10)}
                    className="p-1 text-gray-600 hover:text-blue-600 focus:outline-none"
                  >
                    <Minus size={12} />
                  </button>
                  
                  <div className="flex items-center mx-1">
                    <ArrowLeft size={10} className="text-gray-400 mr-1" />
                    <span className="text-xs text-gray-700 w-8 text-center">{getColumnWidth(column.accessor)}px</span>
                  </div>
                  
                  <button 
                    onClick={() => adjustColumnWidth(column.accessor, 10)}
                    className="p-1 text-gray-600 hover:text-blue-600 focus:outline-none"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-end space-x-2 pt-1 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

const CustomizableTable = forwardRef(({
  data,
  columns,
  isLoading,
  isLoadingMore = false,
  onRowClick,
  onView,
  initialVisibleColumns = null,
  tableId = 'default-table',
  loadMoreData,
  hasMoreData = false,
  selectable = true,
  emptyMessage = "No hay datos disponibles",
  infiniteScrollThreshold = 200, // Distancia en px desde el fondo para cargar más
  minColumnWidth = 60, // Ancho mínimo para columnas en px
  maxColumnWidth = 500, // Ancho máximo para columnas en px
}, ref) => {
  // Estado para el orden de columnas
  const [columnOrder, setColumnOrder] = useState(
    () => {
      // Intentar cargar desde localStorage
      const savedOrder = localStorage.getItem(`table-column-order-${tableId}`);
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Error parsing saved column order:", e);
        }
      }
      return columns.map(col => col.accessor);
    }
  );
  
  // Estado para columnas visibles
  const [visibleColumns, setVisibleColumns] = useState(
    () => {
      const saved = localStorage.getItem(`table-columns-${tableId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Error parsing saved columns:", e);
        }
      }
      return initialVisibleColumns || columns.map(col => col.accessor);
    }
  );
  
  // Estado para anchos personalizados de columnas
  const [columnWidths, setColumnWidths] = useState(
    () => {
      const savedWidths = localStorage.getItem(`table-column-widths-${tableId}`);
      if (savedWidths) {
        try {
          return JSON.parse(savedWidths);
        } catch (e) {
          console.error("Error parsing saved column widths:", e);
          return {};
        }
      }
      return {};
    }
  );
  
  // Estados para funcionalidad
  const [selectedRow, setSelectedRow] = useState(null);
  const tableContainerRef = useRef(null);
  const tableRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(0);
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [columnMenuPosition, setColumnMenuPosition] = useState({ x: 0, y: 0 });
  const [draggedHeader, setDraggedHeader] = useState(null);
  const [dragOverHeader, setDragOverHeader] = useState(null);
  const [isInfiniteLoading, setIsInfiniteLoading] = useState(false);
  
  // Exponer la referencia del contenedor
  React.useImperativeHandle(ref, () => ({
    tableContainer: tableContainerRef.current,
    scrollToTop: () => {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }
    }
  }));
  
  // Guardar preferencias en localStorage
  useEffect(() => {
    localStorage.setItem(`table-columns-${tableId}`, JSON.stringify(visibleColumns));
  }, [visibleColumns, tableId]);
  
  useEffect(() => {
    localStorage.setItem(`table-column-order-${tableId}`, JSON.stringify(columnOrder));
  }, [columnOrder, tableId]);
  
  useEffect(() => {
    localStorage.setItem(`table-column-widths-${tableId}`, JSON.stringify(columnWidths));
  }, [columnWidths, tableId]);
  
  // Calcular ancho disponible
  useEffect(() => {
    if (tableContainerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        if (entries[0]) {
          setTableWidth(entries[0].contentRect.width);
        }
      });
      
      resizeObserver.observe(tableContainerRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);
  
  // Implementación del scroll infinito
  useEffect(() => {
    if (!loadMoreData || !hasMoreData || isLoading) return;
    
    const container = tableContainerRef.current;
    if (!container) return;
    
    // Throttle para evitar muchas llamadas durante el scroll
    let throttleTimer;
    
    const handleScroll = () => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
        
        if (isInfiniteLoading || !hasMoreData) return;
        
        const scrollHeight = container.scrollHeight;
        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        
        // Cargar más datos cuando el usuario se acerca al final
        if (scrollHeight - scrollTop - clientHeight < infiniteScrollThreshold) {
          const loadMore = async () => {
            setIsInfiniteLoading(true);
            try {
              await loadMoreData();
            } finally {
              setTimeout(() => setIsInfiniteLoading(false), 300);
            }
          };
          
          loadMore();
        }
      }, 150); // Throttle de 150ms
    };
    
    container.addEventListener('scroll', handleScroll);
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(throttleTimer);
    };
  }, [loadMoreData, hasMoreData, isInfiniteLoading, infiniteScrollThreshold, isLoading]);
  
  // Handlers para personalización de columnas
  const handleHeaderRightClick = (e) => {
    e.preventDefault();
    setColumnMenuPosition({ 
      x: Math.min(e.clientX, window.innerWidth - 300), 
      y: Math.min(e.clientY, window.innerHeight - 400) 
    });
    setColumnMenuOpen(true);
  };
  
  const handleColumnSettingsClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setColumnMenuPosition({ 
      x: Math.min(rect.x - 200, window.innerWidth - 300),
      y: Math.min(rect.y - 300, window.innerHeight - 500)
    });
    setColumnMenuOpen(true);
  };
  
  const closeColumnMenu = () => {
    setColumnMenuOpen(false);
  };
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (columnMenuOpen) {
        setColumnMenuOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [columnMenuOpen]);
  
  // Handlers para selección y navegación
  const handleRowClick = (row) => {
    if (selectable) {
      setSelectedRow(row);
      if (onRowClick) onRowClick(row);
    }
  };
  
  const handleKeyDown = useCallback((e) => {
    if (selectable && data.length > 0) {
      const currentIndex = selectedRow 
        ? data.findIndex(row => row === selectedRow)
        : -1;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextIndex = currentIndex < data.length - 1 ? currentIndex + 1 : currentIndex;
        setSelectedRow(data[nextIndex]);
        if (onRowClick) onRowClick(data[nextIndex]);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        setSelectedRow(data[prevIndex]);
        if (onRowClick) onRowClick(data[prevIndex]);
      }
    }
  }, [data, selectedRow, onRowClick, selectable]);
  
  useEffect(() => {
    const tableElement = document.getElementById(`table-${tableId}`);
    if (tableElement) {
      tableElement.tabIndex = 0;
      tableElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        tableElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [tableId, handleKeyDown]);
  
  // Handlers para drag and drop
  const handleHeaderDragStart = (e, accessor) => {
    setDraggedHeader(accessor);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      
      const dragImage = document.createElement('div');
      dragImage.textContent = columns.find(col => col.accessor === accessor)?.header || '';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.className = 'bg-blue-100 p-1 rounded border border-blue-300 text-blue-800 text-xs';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };
  
  const handleHeaderDragOver = (e, accessor) => {
    e.preventDefault();
    if (draggedHeader && draggedHeader !== accessor) {
      setDragOverHeader(accessor);
    }
  };
  
  const handleHeaderDrop = (e, accessor) => {
    e.preventDefault();
    
    if (draggedHeader && dragOverHeader && draggedHeader !== dragOverHeader) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedHeader);
      const dropIndex = newOrder.indexOf(dragOverHeader);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(dropIndex, 0, draggedHeader);
        setColumnOrder(newOrder);
      }
    }
    
    setDraggedHeader(null);
    setDragOverHeader(null);
  };
  
  const handleHeaderDragEnd = () => {
    setDraggedHeader(null);
    setDragOverHeader(null);
  };
  
  // Mostrar loader con feedback visual mejorado si está cargando y no hay datos
  if (isLoading && data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center py-8 px-4 bg-white rounded-md shadow-sm border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-3"></div>
        <p className="text-gray-600 text-sm">Cargando datos...</p>
        <p className="text-gray-500 text-xs mt-1">Esto puede tardar unos segundos</p>
      </div>
    );
  }

  // Ordenar columnas visibles
  const orderedVisibleColumns = columnOrder
    .filter(accessor => visibleColumns.includes(accessor))
    .map(accessor => columns.find(col => col.accessor === accessor))
    .filter(Boolean);
  
  // Calcular anchos de columnas
  const calculateColumnWidths = () => {
    const totalWidth = tableWidth || tableContainerRef.current?.clientWidth || 1000;
    const actionColumnWidth = onView ? 40 : 0;
    const availableWidth = totalWidth - actionColumnWidth;
    
    const columnsWithCustomWidth = orderedVisibleColumns.filter(col => columnWidths[col.accessor]);
    const fixedWidth = columnsWithCustomWidth.reduce((sum, col) => {
      return sum + columnWidths[col.accessor];
    }, 0);
    
    const columnsWithPresetWidth = orderedVisibleColumns.filter(col => 
      !columnWidths[col.accessor] && col.width);
    const presetWidth = columnsWithPresetWidth.reduce((sum, col) => {
      const match = col.width.match(/w-(\d+)/);
      return sum + (match ? parseInt(match[1]) * 4 : 0);
    }, 0);
    
    const remainingColumns = orderedVisibleColumns.length - columnsWithCustomWidth.length - columnsWithPresetWidth.length;
    const flexColumnWidth = Math.max((availableWidth - fixedWidth - presetWidth) / (remainingColumns || 1), minColumnWidth);
    
    return {
      totalWidth,
      flexColumnWidth
    };
  };
  
  const { flexColumnWidth } = calculateColumnWidths();

  return (
    <div className="flex flex-col h-full" ref={ref}>
      {/* Tabla con scroll infinito */}
      <div 
        className="overflow-auto flex-grow border border-gray-200 rounded-md bg-white" 
        style={{ maxHeight: 'calc(100vh - 220px)', minHeight: '400px' }}
        ref={tableContainerRef}
      >
        <table 
          className="w-full table-auto text-xs"
          id={`table-${tableId}`}
          ref={tableRef}
          style={{ tableLayout: 'fixed' }}
        >
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr 
              onContextMenu={handleHeaderRightClick}
              className="border-b border-gray-200"
            >
              {/* Cabeceras de columna */}
              {orderedVisibleColumns.map((column) => (
                <th
                  key={column.accessor}
                  data-column={column.accessor}
                  className={`relative px-2 py-1 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 cursor-grab hover:bg-gray-100 ${
                    dragOverHeader === column.accessor ? 'bg-blue-50' : ''
                  } ${draggedHeader === column.accessor ? 'opacity-50' : ''}`}
                  style={{ 
                    width: columnWidths[column.accessor] ? 
                      `${columnWidths[column.accessor]}px` : 
                      column.width ? undefined : `${flexColumnWidth}px`,
                    minWidth: `${minColumnWidth}px`,
                    maxWidth: columnWidths[column.accessor] ? 
                      `${columnWidths[column.accessor]}px` : 
                      column.width ? undefined : `${flexColumnWidth * 1.5}px`,
                  }}
                  title={column.header}
                  draggable="true"
                  onDragStart={(e) => handleHeaderDragStart(e, column.accessor)}
                  onDragOver={(e) => handleHeaderDragOver(e, column.accessor)}
                  onDrop={(e) => handleHeaderDrop(e, column.accessor)}
                  onDragEnd={handleHeaderDragEnd}
                >
                  <div className="flex items-center">
                    <GripHorizontal size={10} className="mr-1 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{column.header}</span>
                  </div>
                </th>
              ))}
              {onView && (
                <th className="px-2 py-1 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b border-gray-200 w-10">
                  <span className="sr-only">Acciones</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <tr 
                  key={rowIndex}
                  onClick={() => handleRowClick(row)}
                  className={`
                    hover:bg-gray-50 cursor-pointer border-b border-gray-100
                    ${selectable && selectedRow === row ? 'bg-blue-50' : ''}
                    ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  `}
                >
                  {orderedVisibleColumns.map((column) => (
                    <td 
                      key={`${rowIndex}-${column.accessor}`}
                      className="px-2 py-1 text-xs text-gray-900"
                      style={{
                        maxWidth: columnWidths[column.accessor] ? 
                          `${columnWidths[column.accessor]}px` : 
                          column.width ? undefined : `${flexColumnWidth * 1.5}px`,
                      }}
                    >
                      {column.render ? (
                        column.render(row)
                      ) : (
                        <Tooltip content={row[column.accessor]}>
                          {row[column.accessor]}
                        </Tooltip>
                      )}
                    </td>
                  ))}
                  {onView && (
                    <td className="px-1 py-1 text-xs text-gray-900 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); onView(row); }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={orderedVisibleColumns.length + (onView ? 1 : 0)} 
                  className="px-2 py-6 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Indicador de carga para el scroll infinito */}
        {(isLoadingMore || isInfiniteLoading) && data.length > 0 && (
          <div className="flex justify-center items-center py-3 bg-white">
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full shadow-sm animate-pulse text-xs">
              <Loader size={12} className="animate-spin mr-2 text-blue-500" />
              <span className="text-blue-600">Cargando más datos...</span>
            </div>
          </div>
        )}
        
        {/* Mensaje cuando no hay más datos para cargar */}
        {!hasMoreData && data.length > 0 && (
          <div className="text-center py-2 text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
            Has llegado al final de los resultados
          </div>
        )}
      </div>
      
      {/* Barra de estado y customización */}
      <div className="flex justify-between items-center px-3 py-1 bg-gray-50 border border-gray-200 border-t-0 rounded-b-md text-xs text-gray-500">
        <div>
          {data.length} registros {hasMoreData ? '(+)' : ''}
        </div>
        <button
          onClick={handleColumnSettingsClick}
          className="p-1 rounded hover:bg-gray-200 flex items-center text-gray-600"
          title="Personalizar columnas"
        >
          <SlidersHorizontal size={12} className="mr-1" />
          <span>Ajustar columnas</span>
          <ChevronDown size={12} className="ml-1" />
        </button>
      </div>
      
      {/* Menú de personalización */}
      {columnMenuOpen && (
        <ColumnCustomizationMenu
          columns={columns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
          columnWidths={columnWidths}
          setColumnWidths={setColumnWidths}
          minColumnWidth={minColumnWidth}
          maxColumnWidth={maxColumnWidth}
          onClose={closeColumnMenu}
          position={columnMenuPosition}
        />
      )}
    </div>
  );
});

CustomizableTable.displayName = 'CustomizableTable';

export default CustomizableTable;