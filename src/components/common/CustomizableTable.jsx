import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  SlidersHorizontal,
  Eye,
  EyeOff,
  GripHorizontal,
  Check,
  Loader
} from 'lucide-react';
import ThemeConstants from '../../constants/ThemeConstants';

// Componente Tooltip personalizado
const Tooltip = ({ content, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef(null);
  const childRef = useRef(null);

  // Mostrar tooltip
  const handleMouseEnter = (e) => {
    if (!childRef.current) return;
    
    // Verificar si el contenido está truncado
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

  // Ocultar tooltip
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <div 
        ref={childRef}
        className="truncate"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div
          ref={tooltipRef}
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

// Menú de personalización de columnas mejorado
const ColumnCustomizationMenu = ({ 
  columns,
  visibleColumns,
  setVisibleColumns,
  onClose,
  position,
  columnOrder,
  setColumnOrder
}) => {
  // Estado local para trabajar con las columnas mientras se editan
  const [columnSettings, setColumnSettings] = useState(
    columnOrder.map(accessorId => {
      const col = columns.find(c => c.accessor === accessorId);
      return {
        ...col,
        visible: visibleColumns.includes(accessorId)
      };
    })
  );
  
  // Estado para mantener la columna que se está arrastrando
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Manejar el cambio de visibilidad de columnas
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

  // Guardar cambios y cerrar
  const handleSave = () => {
    // Extraer solo los accessors de las columnas visibles
    const newVisibleColumns = columnSettings
      .filter(col => col.visible)
      .map(col => col.accessor);
    
    setVisibleColumns(newVisibleColumns);
    
    // Actualizar orden de columnas
    setColumnOrder(columnSettings.map(col => col.accessor));
    
    onClose();
  };

  // Manejar inicio de arrastre
  const handleDragStart = (e, column) => {
    setDraggedColumn(column);
  };

  // Manejar cuando el arrastre pasa sobre otra columna
  const handleDragOver = (e, column) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn.accessor !== column.accessor) {
      setDragOverColumn(column);
    }
  };

  // Manejar cuando se suelta el elemento arrastrado
  const handleDrop = (e) => {
    e.preventDefault();
    
    if (draggedColumn && dragOverColumn && draggedColumn.accessor !== dragOverColumn.accessor) {
      setColumnSettings(prev => {
        const newColumns = [...prev];
        const draggedIndex = newColumns.findIndex(col => col.accessor === draggedColumn.accessor);
        const dropIndex = newColumns.findIndex(col => col.accessor === dragOverColumn.accessor);
        
        // Reordenar el array
        const [removed] = newColumns.splice(draggedIndex, 1);
        newColumns.splice(dropIndex, 0, removed);
        
        return newColumns;
      });
    }
    
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Componente de checkbox personalizado y más grande
  const CustomCheckbox = ({ checked, onChange, label }) => (
    <div 
      className="flex items-center cursor-pointer" 
      onClick={onChange}
    >
      <div className={`
        w-5 h-5 flex items-center justify-center mr-2
        border rounded
        ${checked 
          ? 'bg-blue-600 border-blue-600' 
          : `bg-white ${ThemeConstants.borders.input}`}
      `}>
        {checked && <Check size={12} color="white" />}
      </div>
      <span className={ThemeConstants.textColors.primary}>{label}</span>
    </div>
  );

  return (
    <div 
      className={`absolute z-50 ${ThemeConstants.bgColors.card} ${ThemeConstants.borders.default} ${ThemeConstants.shadows.lg} ${ThemeConstants.rounded.md} p-3 w-72`}
      style={{ 
        top: position.y, 
        left: position.x 
      }}
      onClick={e => e.stopPropagation()} // Prevenir cierre al hacer clic dentro
    >
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-200">
        <h3 className={`${ThemeConstants.text.sm} font-medium ${ThemeConstants.textColors.primary}`}>Personalizar columnas</h3>
        <div className={`${ThemeConstants.text.xs} ${ThemeConstants.textColors.secondary}`}>
          {columnSettings.filter(c => c.visible).length} de {columns.length} visible(s)
        </div>
      </div>
      
      <p className={`${ThemeConstants.text.xs} ${ThemeConstants.textColors.secondary} mb-3`}>
        Arrastra para reordenar o marca/desmarca para mostrar/ocultar
      </p>
      
      <div className="max-h-60 overflow-y-auto mb-4">
        <ul className="space-y-2">
          {columnSettings.map((column) => (
            <li 
              key={column.accessor}
              draggable
              onDragStart={(e) => handleDragStart(e, column)}
              onDragOver={(e) => handleDragOver(e, column)}
              onDrop={handleDrop}
              className={`
                flex items-center p-2 ${ThemeConstants.text.sm} ${ThemeConstants.rounded.md}
                ${dragOverColumn?.accessor === column.accessor ? 'bg-blue-50' : ''}
                ${draggedColumn?.accessor === column.accessor ? 'opacity-50' : ''}
                cursor-move hover:bg-slate-100
              `}
            >
              <div className="flex items-center flex-grow">
                <div className={`mr-2 ${ThemeConstants.textColors.light}`}>
                  <GripHorizontal size={16} />
                </div>
                
                <CustomCheckbox 
                  checked={column.visible}
                  onChange={() => handleVisibilityChange(column.accessor)}
                  label={column.header}
                />
              </div>
              <div className={ThemeConstants.textColors.light}>
                {column.visible 
                  ? <Eye size={16} className="text-blue-600" /> 
                  : <EyeOff size={16} />}
              </div>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2 border-t border-slate-200">
        <button
          onClick={onClose}
          className={`px-3 py-1.5 ${ThemeConstants.text.sm} ${ThemeConstants.buttons.secondary} ${ThemeConstants.rounded.md}`}
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className={`px-3 py-1.5 ${ThemeConstants.text.sm} ${ThemeConstants.buttons.primary} ${ThemeConstants.rounded.md}`}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

const CustomizableTable = ({
  data,
  columns,
  isLoading,
  onRowClick,
  onView,
  initialVisibleColumns = null,
  tableId = 'default-table',
  loadMoreData,
  hasMoreData = false,
  selectable = true
}) => {
  // Estado para el orden de columnas
  const [columnOrder, setColumnOrder] = useState(
    () => {
      // Intentar cargar desde localStorage
      const savedOrder = localStorage.getItem(`table-column-order-${tableId}`);
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          // Verificar que es un array válido
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Error parsing saved column order:", e);
        }
      }
      // Si no hay orden guardado, usar el orden por defecto
      return columns.map(col => col.accessor);
    }
  );
  
  // Estado para columnas visibles
  const [visibleColumns, setVisibleColumns] = useState(
    () => {
      // Intentar cargar desde localStorage
      const saved = localStorage.getItem(`table-columns-${tableId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Verificar que es un array válido
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        } catch (e) {
          console.error("Error parsing saved columns:", e);
        }
      }
      // Si no hay guardadas, usar todas las columnas o las proporcionadas
      return initialVisibleColumns || columns.map(col => col.accessor);
    }
  );
  
  // Estado para anchos personalizados de columnas
  const [columnWidths, setColumnWidths] = useState(
    () => {
      // Intentar cargar desde localStorage
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
  
  // Estado para la fila seleccionada
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Estado para el loading de más datos
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Estado para el redimensionamiento de columnas
  const [resizingColumn, setResizingColumn] = useState(null);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(0);
  
  // Referencia para el elemento observado (para infinite scroll)
  const loadMoreRef = useRef(null);
  
  // Referencia para el contenedor de la tabla
  const tableContainerRef = useRef(null);
  
  // Estado para medir el ancho disponible
  const [tableWidth, setTableWidth] = useState(0);
  
  // Calcular ancho disponible cuando el componente se monta
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
  
  // Guardar preferencias en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(`table-columns-${tableId}`, JSON.stringify(visibleColumns));
  }, [visibleColumns, tableId]);
  
  useEffect(() => {
    localStorage.setItem(`table-column-order-${tableId}`, JSON.stringify(columnOrder));
  }, [columnOrder, tableId]);
  
  useEffect(() => {
    localStorage.setItem(`table-column-widths-${tableId}`, JSON.stringify(columnWidths));
  }, [columnWidths, tableId]);
  
  // Estado para controlador el menú contextual de personalización
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [columnMenuPosition, setColumnMenuPosition] = useState({ x: 0, y: 0 });
  
  // Estados para drag and drop de encabezados
  const [draggedHeader, setDraggedHeader] = useState(null);
  const [dragOverHeader, setDragOverHeader] = useState(null);
  
  // Configurar Intersection Observer para infinite scroll
  useEffect(() => {
    if (!loadMoreData || !hasMoreData) return;
    
    const handleObserver = (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !isLoadingMore) {
        setIsLoadingMore(true);
        loadMoreData().finally(() => {
          setIsLoadingMore(false);
        });
      }
    };
    
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver(handleObserver, option);
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreData, hasMoreData, isLoadingMore]);
  
  // Manejador de clic derecho en encabezado
  const handleHeaderRightClick = (e) => {
    e.preventDefault();
    setColumnMenuPosition({ 
      x: Math.min(e.clientX, window.innerWidth - 300), 
      y: Math.min(e.clientY, window.innerHeight - 400) 
    });
    setColumnMenuOpen(true);
  };
  
  // Cerrar menú personalización
  const closeColumnMenu = () => {
    setColumnMenuOpen(false);
  };
  
  // Manejar clic fuera del menú para cerrarlo
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
  
  // Manejar selección de fila
  const handleRowClick = (row) => {
    if (selectable) {
      setSelectedRow(row);
      if (onRowClick) onRowClick(row);
    }
  };
  
  // Manejar evento de teclas para navegación por teclado
  const handleKeyDown = (e) => {
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
  };
  
  // Establecer el tabIndex y los event listeners para navegación por teclado
  useEffect(() => {
    const tableElement = document.getElementById(`table-${tableId}`);
    if (tableElement) {
      tableElement.tabIndex = 0;
      tableElement.addEventListener('keydown', handleKeyDown);
      
      return () => {
        tableElement.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [tableId, handleKeyDown, data]);
  
  // Manejar inicio de arrastre para encabezados
  const handleHeaderDragStart = (e, accessor) => {
    setDraggedHeader(accessor);
    // Cambiar la apariencia del elemento arrastrado
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      
      // Crear una imagen personalizada para el arrastre (opcional)
      const dragImage = document.createElement('div');
      dragImage.textContent = columns.find(col => col.accessor === accessor)?.header || '';
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.className = 'bg-blue-100 p-2 rounded border border-blue-300 text-blue-800';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      
      // Eliminar el elemento después
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };
  
  // Manejar cuando el arrastre pasa sobre otro encabezado
  const handleHeaderDragOver = (e, accessor) => {
    e.preventDefault();
    if (draggedHeader && draggedHeader !== accessor) {
      setDragOverHeader(accessor);
    }
  };
  
  // Manejar cuando se suelta el encabezado arrastrado
  const handleHeaderDrop = (e, accessor) => {
    e.preventDefault();
    
    if (draggedHeader && dragOverHeader && draggedHeader !== dragOverHeader) {
      // Reordenar las columnas
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
  
  // Manejar cuando termina el arrastre
  const handleHeaderDragEnd = () => {
    setDraggedHeader(null);
    setDragOverHeader(null);
  };
  
  // Manejar inicio de redimensionamiento de columna
  const handleResizeStart = (e, accessor) => {
    e.preventDefault();
    e.stopPropagation();
    
    setResizingColumn(accessor);
    setStartX(e.clientX);
    
    // Obtener el ancho actual de la columna
    const currentWidth = columnWidths[accessor] || 
      document.querySelector(`th[data-column="${accessor}"]`).offsetWidth;
    
    setStartWidth(currentWidth);
    
    // Añadir event listeners para el movimiento y finalización del resize
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  // Manejar movimiento durante el redimensionamiento
  const handleResizeMove = useCallback((e) => {
    if (!resizingColumn) return;
    
    const differenceX = e.clientX - startX;
    const newWidth = Math.max(80, startWidth + differenceX); // Mínimo 80px de ancho
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: newWidth
    }));
  }, [resizingColumn, startX, startWidth]);
  
  // Manejar fin de redimensionamiento
  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
    
    // Quitar event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  }, [handleResizeMove]);
  
  // Limpiar event listeners al desmontar
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [handleResizeMove, handleResizeEnd]);
  
  // Renderizar tabla
  if (isLoading && data.length === 0) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Ordenar las columnas basadas en el estado columnOrder
  const orderedVisibleColumns = columnOrder
    .filter(accessor => visibleColumns.includes(accessor))
    .map(accessor => columns.find(col => col.accessor === accessor))
    .filter(Boolean); // Eliminar cualquier undefined
  
  // Calcular anchos dinámicos para columnas
  const calculateColumnWidths = () => {
    const totalWidth = tableWidth || tableContainerRef.current?.clientWidth || 1000;
    const actionColumnWidth = onView ? 80 : 0;
    const availableWidth = totalWidth - actionColumnWidth;
    
    const columnsWithCustomWidth = orderedVisibleColumns.filter(col => columnWidths[col.accessor]);
    const fixedWidth = columnsWithCustomWidth.reduce((sum, col) => {
      return sum + columnWidths[col.accessor];
    }, 0);
    
    const columnsWithPresetWidth = orderedVisibleColumns.filter(col => 
      !columnWidths[col.accessor] && col.width);
    const presetWidth = columnsWithPresetWidth.reduce((sum, col) => {
      // Extraer valor numérico de clases como 'w-16', 'w-32', etc.
      const match = col.width.match(/w-(\d+)/);
      return sum + (match ? parseInt(match[1]) * 4 : 0); // Aproximación: multiplicar por 4px
    }, 0);
    
    const remainingColumns = orderedVisibleColumns.length - columnsWithCustomWidth.length - columnsWithPresetWidth.length;
    const flexColumnWidth = Math.max((availableWidth - fixedWidth - presetWidth) / (remainingColumns || 1), 120);
    
    return {
      totalWidth,
      flexColumnWidth
    };
  };
  
  const { flexColumnWidth } = calculateColumnWidths();

  return (
    <div className="flex flex-col h-full" ref={tableContainerRef}>
      {/* Tabla responsive */}
      <div className={`overflow-auto flex-grow ${ThemeConstants.borders.default} ${ThemeConstants.rounded.md}`}>
        <table 
          className="w-full table-auto"
          id={`table-${tableId}`}
          style={{ tableLayout: 'fixed' }}
        >
          <thead className={`${ThemeConstants.bgColors.tableHeader} sticky top-0 z-10`}>
            <tr 
              onContextMenu={handleHeaderRightClick}
              className={ThemeConstants.text.xs}
            >
              {orderedVisibleColumns.map((column) => (
                <th
                  key={column.accessor}
                  data-column={column.accessor}
                  className={`relative px-3 py-3 text-left ${ThemeConstants.text.xs} font-medium ${ThemeConstants.textColors.primary} uppercase tracking-wider border-b ${ThemeConstants.borders.table} cursor-grab hover:bg-slate-300 ${
                    dragOverHeader === column.accessor ? 'bg-blue-100' : ''
                  } ${draggedHeader === column.accessor ? 'opacity-50' : ''}`}
                  style={{ 
                    width: columnWidths[column.accessor] ? 
                      `${columnWidths[column.accessor]}px` : 
                      column.width ? undefined : `${flexColumnWidth}px`,
                    minWidth: '80px',
                    maxWidth: columnWidths[column.accessor] ? 
                      `${columnWidths[column.accessor]}px` : 
                      column.width ? undefined : `${flexColumnWidth * 1.5}px`,
                  }}
                  title="Arrastra para reordenar o haz clic derecho para personalizar columnas"
                  draggable="true"
                  onDragStart={(e) => handleHeaderDragStart(e, column.accessor)}
                  onDragOver={(e) => handleHeaderDragOver(e, column.accessor)}
                  onDrop={(e) => handleHeaderDrop(e, column.accessor)}
                  onDragEnd={handleHeaderDragEnd}
                >
                  <div className="flex items-center">
                    <GripHorizontal size={12} className="mr-1 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{column.header}</span>
                  </div>
                  
                  {/* Manejador de redimensionamiento */}
                  <div 
                    className={`absolute top-0 right-0 h-full w-2 cursor-col-resize hover:bg-blue-300 ${
                      resizingColumn === column.accessor ? 'bg-blue-400' : ''
                    }`}
                    onMouseDown={(e) => handleResizeStart(e, column.accessor)}
                  />
                </th>
              ))}
              {onView && (
                <th className={`px-3 py-3 text-right ${ThemeConstants.text.xs} font-medium ${ThemeConstants.textColors.primary} uppercase tracking-wider border-b ${ThemeConstants.borders.table} w-20`}>
                  Acciones
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
                    ${ThemeConstants.tableRowHover} cursor-pointer border-b ${ThemeConstants.borders.table}
                    ${selectable && selectedRow === row ? ThemeConstants.tableRowSelected : ''}
                    ${rowIndex % 2 === 0 ? ThemeConstants.bgColors.tableRow : ThemeConstants.bgColors.tableRowAlt}
                  `}
                >
                  {orderedVisibleColumns.map((column) => (
                    <td 
                      key={`${rowIndex}-${column.accessor}`}
                      className={`px-3 py-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}
                      style={{
                        maxWidth: columnWidths[column.accessor] ? 
                          `${columnWidths[column.accessor]}px` : 
                          column.width ? undefined : `${flexColumnWidth * 1.5}px`,
                      }}
                    >
                      {/* Renderizar con tooltip para contenido truncado */}
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
                    <td className={`px-3 py-2 ${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary} text-right`}>
                      <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onView(row)}
                          className={`p-1 ${ThemeConstants.textColors.link} ${ThemeConstants.linkHover}`}
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={orderedVisibleColumns.length + (onView ? 1 : 0)} 
                  className={`px-4 py-2 text-center ${ThemeConstants.textColors.primary}`}
                >
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Elemento observado para infinite scroll */}
        {hasMoreData && (
          <div 
            ref={loadMoreRef} 
            className={`flex justify-center items-center py-4 ${ThemeConstants.textColors.light}`}
          >
            {isLoadingMore ? (
              <div className="flex items-center">
                <Loader size={16} className="animate-spin mr-2" />
                <span>Cargando más datos...</span>
              </div>
            ) : (
              <span className={ThemeConstants.text.sm}>Desplázate para cargar más</span>
            )}
          </div>
        )}
      </div>
      
      {/* Barra de estado inferior */}
      <div className={`flex justify-between items-center px-4 py-3 ${ThemeConstants.bgColors.tableHeader} border-t ${ThemeConstants.borders.table}`}>
        <div className={`${ThemeConstants.text.sm} ${ThemeConstants.textColors.primary}`}>
          Mostrando {data.length} registros {hasMoreData ? '(desplázate para cargar más)' : ''}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            setColumnMenuPosition({ 
              x: rect.x - 200, // Posicionar a la izquierda del botón
              y: rect.y - 300  // Posicionar encima del botón
            });
            setColumnMenuOpen(true);
          }}
          className={`p-2 ${ThemeConstants.rounded.md} hover:bg-slate-300 flex items-center ${ThemeConstants.textColors.primary}`}
          title="Personalizar columnas"
        >
          <SlidersHorizontal size={16} className="mr-1" />
          <span className={ThemeConstants.text.xs}>Personalizar columnas</span>
        </button>
      </div>
      
      {/* Menú de personalización de columnas */}
      {columnMenuOpen && (
        <ColumnCustomizationMenu
          columns={columns}
          visibleColumns={visibleColumns}
          setVisibleColumns={setVisibleColumns}
          columnOrder={columnOrder}
          setColumnOrder={setColumnOrder}
          onClose={closeColumnMenu}
          position={columnMenuPosition}
        />
      )}
    </div>
  );
};

export default CustomizableTable;