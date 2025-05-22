import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MoreHorizontal, 
  Check, 
  User,
  Mail,
  Phone,
  Shield,
  Hash,
  CheckCircle,
  XCircle,
  Key,
  ArrowUpDown,
  Loader,
  Calendar,
  Clock
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { loadTableConfig, saveTableConfig, resetTableConfig } from '../../utils/tableConfig';
import { useLayoutAwareTableWidth } from '../../hooks/useContainerDimensions';

const DEFAULT_COLUMNS = [
  // Basic Information (Visible by default)
  { id: 'ID_EMPLEADO', label: 'ID', width: 80, sortable: true, visible: true, type: 'number', icon: Hash },
  { id: 'USUARIO', label: 'Usuario', width: 120, sortable: true, visible: true, type: 'string', icon: Key },
  { id: 'NOMBRE', label: 'Nombre', width: 150, sortable: true, visible: true, type: 'string', icon: User },
  { id: 'APELLIDOS', label: 'Apellidos', width: 150, sortable: true, visible: true, type: 'string', icon: User },
  { id: 'ANULADO', label: 'Estado', width: 100, sortable: true, visible: true, type: 'boolean', icon: CheckCircle },
  { id: 'ROL', label: 'Rol', width: 120, sortable: true, visible: true, type: 'string', icon: Shield },
  { id: 'PERMISOS', label: 'Permisos', width: 250, sortable: false, visible: true, type: 'string', icon: Shield },
  
  // Professional Information (Hidden by default)
  { id: 'CARGO_INTERNO', label: 'Cargo Interno', width: 150, sortable: true, visible: false, type: 'string', icon: User },
  { id: 'IMAGEN', label: 'Imagen', width: 100, sortable: true, visible: false, type: 'string', icon: User },
  { id: 'FIRMA_ELECTRONICA', label: 'Firma Electrónica', width: 140, sortable: true, visible: false, type: 'string', icon: Key },
  { id: 'FILES', label: 'Archivos', width: 120, sortable: true, visible: false, type: 'string', icon: Hash },
  
  // FNMT Digital Certificate (Hidden by default)
  { id: 'RUTA_SERVICIO', label: 'Ruta Servicio', width: 150, sortable: true, visible: false, type: 'string', icon: Hash },
  { id: 'F_CADUCIDAD', label: 'F. Caducidad', width: 120, sortable: true, visible: false, type: 'date', icon: Calendar },
  { id: 'REVISION_DE_MUESTRAS', label: 'Rev. Muestras', width: 120, sortable: true, visible: false, type: 'boolean', icon: CheckCircle },
  
  // Application Access (Hidden by default)
  { id: 'ORDENES_NO_PROCESADO', label: 'Órdenes No Proc.', width: 140, sortable: true, visible: false, type: 'boolean', icon: CheckCircle }
];

// Componente para la cabecera de columna con soporte para arrastre
const DraggableHeader = ({ 
  column, 
  sortColumn, 
  sortDirection, 
  onSort, 
  onContextMenu 
}) => {
  const headerRef = useRef(null);
  
  // Manejar clic para ordenar
  const handleSort = () => {
    if (!column.sortable) return;
    onSort(column.id);
  };
  
  // Renderizar icono de ordenación
  const renderSortIcon = () => {
    if (!column.sortable) return null;
    
    if (sortColumn !== column.id) {
      return <ArrowUpDown size={12} className="text-gray-400 ml-1" />;
    }
    
    return sortDirection === 'asc' 
      ? <ChevronUp size={12} className="text-blue-500 ml-1" /> 
      : <ChevronDown size={12} className="text-blue-500 ml-1" />;
  };
  
  return (
    <div
      ref={headerRef}
      className="group flex items-center justify-between px-1.5 py-1 text-left text-xs font-medium cursor-pointer"
      style={{ cursor: column.sortable ? 'pointer' : 'default' }}
      onClick={handleSort}
      onContextMenu={(e) => onContextMenu(e)}
    >
      <div className="flex items-center">
        <span>{column.label}</span>
        {renderSortIcon()}
      </div>
      <div className="w-1 group-hover:bg-gray-300 opacity-0 group-hover:opacity-100 h-2/3 cursor-col-resize absolute top-1/2 right-0 transform -translate-y-1/2 transition-opacity" />
    </div>
  );
};

// Menú contextual para configurar columnas
const ColumnContextMenu = ({ position, columns, onToggleColumn, onClose }) => {
  const menuRef = useRef(null);
  
  // Cerrar el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    
    // También cerrar con la tecla Escape
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);
  
  return createPortal(
    <div 
      ref={menuRef}
      className="absolute bg-white shadow-lg border border-gray-200 rounded-md py-1 z-50"
      style={{ top: position.y, left: position.x }}
    >
      <div className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-200 bg-gray-50">
        Mostrar/Ocultar Columnas
      </div>
      <div className="max-h-72 overflow-y-auto context-menu-scroll">
        {columns.map((column) => (
          <div 
            key={column.id}
            className="flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer"
            onClick={() => onToggleColumn(column.id)}
          >
            <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${column.visible ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-300'}`}>
              {column.visible && <Check size={12} />}
            </div>
            <span className="truncate">{column.label}</span>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
};

// Componente principal de la tabla avanzada
const AdvancedUserTable = forwardRef(({
  data = [],
  loadNextPage,
  hasMoreData = false,
  isLoading = false,
  isLoadingMore = false,
  onRowSelect,
  onRowDoubleClick,
  emptyMessage = "No hay datos disponibles",
  tableId = 'users-table' // Identificador único para persistencia
}, ref) => {
  // Referencias
  const tableRef = useRef(null);
  const tableBodyRef = useRef(null);
  const tableHeaderRef = useRef(null);
  const resizeObserverRef = useRef(null);
  
  // Hook para calcular ancho máximo según el modo del layout
  const maxTableWidth = useLayoutAwareTableWidth();
  
  // Estado del componente
  const [selectedRow, setSelectedRow] = useState(null);
  
  const [columns, setColumns] = useState(() => {
    try {
      // Recuperar configuración guardada
      const savedConfig = loadTableConfig(`${tableId}-columns`, { columnsConfig: null });
      
      if (savedConfig.columnsConfig) {
        // Si hay una configuración guardada, fusionarla con la configuración predeterminada
        // para asegurarnos de que los iconos y otras propiedades complejas se mantienen
        return DEFAULT_COLUMNS.map(defaultCol => {
          const savedCol = savedConfig.columnsConfig.find(col => col.id === defaultCol.id);
          if (savedCol) {
            return {
              ...defaultCol,
              width: savedCol.width || defaultCol.width,
              visible: savedCol.visible !== undefined ? savedCol.visible : defaultCol.visible
            };
          }
          return defaultCol;
        });
      }
      
      // Si no hay configuración guardada, usar la predeterminada
      return DEFAULT_COLUMNS;
    } catch (e) {
      console.error('Error loading column configuration:', e);
      return DEFAULT_COLUMNS;
    }
  });
  const [sortConfig, setSortConfig] = useState(() => {
    // Recuperar configuración de ordenación
    const savedConfig = loadTableConfig(`${tableId}-sort`, { column: 'ID_EMPLEADO', direction: 'asc' });
    return {
      column: savedConfig.column || 'ID_EMPLEADO',
      direction: savedConfig.direction || 'asc'
    };
  });
  const [contextMenu, setContextMenu] = useState({ show: false, position: { x: 0, y: 0 } });
  
  // Calcular columnas visibles
  const visibleColumns = useMemo(() => 
    columns.filter(column => column.visible), 
  [columns]);
  
  // Ordenar datos
  const sortedData = useMemo(() => {
    if (!sortConfig.column || !data.length) return data;
    
    return [...data].sort((a, b) => {
      const column = columns.find(col => col.id === sortConfig.column);
      if (!column) return 0;
      
      let valueA = a[sortConfig.column];
      let valueB = b[sortConfig.column];
      
      // Manejar valores nulos o indefinidos
      if (valueA === null || valueA === undefined) valueA = '';
      if (valueB === null || valueB === undefined) valueB = '';
      
      // Ordenar según el tipo de datos
      if (column.type === 'number') {
        valueA = parseFloat(valueA) || 0;
        valueB = parseFloat(valueB) || 0;
        return sortConfig.direction === 'asc' ? valueA - valueB : valueB - valueA;
      } else if (column.type === 'boolean') {
        valueA = !!valueA;
        valueB = !!valueB;
        return sortConfig.direction === 'asc' 
          ? (valueA === valueB ? 0 : valueA ? 1 : -1)
          : (valueA === valueB ? 0 : valueA ? -1 : 1);
      } else {
        valueA = String(valueA).toLowerCase();
        valueB = String(valueB).toLowerCase();
        return sortConfig.direction === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
    });
  }, [data, sortConfig, columns]);
  
  // Exponer métodos via ref
  useImperativeHandle(ref, () => ({
    setSelectedRow: (row) => {
      setSelectedRow(row);
    },
    getSelectedRow: () => selectedRow,
    scrollToTop: () => {
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollTop = 0;
      }
    },
    resetColumnConfig: () => {
      // Al reiniciar, usamos directamente DEFAULT_COLUMNS para asegurarnos
      // de que todas las propiedades, incluidos los iconos, están correctamente definidas
      setColumns(DEFAULT_COLUMNS);
      setSortConfig({ column: 'ID_EMPLEADO', direction: 'asc' });
      resetTableConfig(`${tableId}-columns`);
      resetTableConfig(`${tableId}-sort`);
      return true;
    }
  }));
  
  // Limpiar ResizeObserver al desmontar
  useEffect(() => {
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, []);
  
  // Configurar scroll infinito optimizado
  useEffect(() => {
    // Usar una función throttled para mejorar el rendimiento
    let isScrolling = false;
    let timeoutId = null;
    
    const handleScroll = () => {
      if (!tableBodyRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = tableBodyRef.current;
      
      // Lazy loading: Si estamos cerca del final y hay más datos
      if (!isScrolling && !isLoading && !isLoadingMore && hasMoreData) {
        if (scrollTop + clientHeight >= scrollHeight - 200) {
          isScrolling = true;
          
          console.log('🔄 Scroll infinito activado - Cargando más datos...', {
            scrollTop,
            clientHeight, 
            scrollHeight,
            remainingPixels: scrollHeight - (scrollTop + clientHeight),
            totalRows: sortedData.length
          });
          
          loadNextPage();
          
          // Liberar el bloqueo después de un tiempo
          setTimeout(() => {
            isScrolling = false;
          }, 1000);
        }
      }
    };
    
    const tableBody = tableBodyRef.current;
    if (tableBody) {
      tableBody.addEventListener('scroll', handleScroll);
      
      return () => {
        tableBody.removeEventListener('scroll', handleScroll);
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [isLoading, isLoadingMore, hasMoreData, loadNextPage]);
  
  // Guardar configuración de columnas usando el sistema de persistencia
  useEffect(() => {
    try {
      // Solo guardar las propiedades serializables de las columnas
      const serializableColumns = columns.map(column => ({
        id: column.id,
        width: column.width,
        visible: column.visible
      }));
      
      saveTableConfig(`${tableId}-columns`, { columnsConfig: serializableColumns });
    } catch (e) {
      console.error('Error guardando configuración de columnas:', e);
    }
  }, [columns, tableId]);
  
  // Guardar configuración de ordenación
  useEffect(() => {
    try {
      saveTableConfig(`${tableId}-sort`, sortConfig);
    } catch (e) {
      console.error('Error guardando configuración de ordenación:', e);
    }
  }, [sortConfig, tableId]);
  
  // Manejar selección de fila
  const handleRowClick = (row) => {
    setSelectedRow(row);
    if (onRowSelect) {
      onRowSelect(row);
    }
  };
  
  // Manejar doble clic en fila
  const handleRowDoubleClick = (row) => {
    if (onRowDoubleClick) {
      onRowDoubleClick(row);
    }
  };
  
  // Manejar cambio de ordenación
  const handleSort = (columnId) => {
    setSortConfig(prevConfig => ({
      column: columnId,
      direction: 
        prevConfig.column === columnId && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };
  
  // Manejar mostrar/ocultar columna
  const handleToggleColumn = (columnId) => {
    setColumns(prevColumns => 
      prevColumns.map(column => 
        column.id === columnId 
          ? { ...column, visible: !column.visible }
          : column
      )
    );
  };
  
  // Manejar apertura de menú contextual
  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      show: true,
      position: { x: e.clientX, y: e.clientY }
    });
  };
  
  // Manejar cierre de menú contextual
  const handleCloseContextMenu = () => {
    setContextMenu({ show: false, position: { x: 0, y: 0 } });
  };
  
  
  // Función de alto rendimiento para redimensionar columnas
  const handleColumnResize = (e, columnId) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Encontrar la columna que se está redimensionando
    const column = columns.find(col => col.id === columnId);
    if (!column) return;
    
    // Guardar posición inicial y ancho
    const startX = e.clientX;
    const startWidth = column.width;
    
    // Calcular el ancho total actual de la tabla
    const getCurrentTableWidth = () => {
      return visibleColumns.reduce((total, col) => total + col.width, 0);
    };
    
    // Usar el ancho máximo calculado por el hook
    
    // Cambiar el cursor durante el arrastre
    document.body.style.cursor = 'col-resize';
    
    // Crear un overlay para capturar todos los eventos de mouse durante el arrastre
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.zIndex = '10000';
    overlay.style.cursor = 'col-resize';
    document.body.appendChild(overlay);
    
    // Variables para optimización de render
    let lastRenderTime = 0;
    const targetFPS = 60; // Objetivo de FPS
    const frameInterval = 1000 / targetFPS;
    let animationFrameId = null;
    
    // Variable para almacenar el ancho actual durante el arrastre
    let currentWidth = startWidth;
    
    // Función para actualizar visualmente la columna sin modificar el estado React (para mayor rendimiento)
    const updateColumnVisually = (width) => {
      // Seleccionar todas las celdas de esta columna y actualizar su ancho directamente en el DOM
      const cells = tableRef.current.querySelectorAll(`[data-column-id="${columnId}"]`);
      cells.forEach(cell => {
        cell.style.flex = `0 0 ${width}px`;
      });
    };
    
    // Función que maneja la actualización real del DOM
    const renderUpdate = () => {
      updateColumnVisually(currentWidth);
    };
    
    // Función para manejar el movimiento del mouse con alta frecuencia
    const handleMouseMove = (moveEvent) => {
      moveEvent.preventDefault();
      
      // Calcular el nuevo ancho
      const diff = moveEvent.clientX - startX;
      const proposedWidth = startWidth + diff;
      
      // Calcular el nuevo ancho total de la tabla si aplicáramos este cambio
      const currentTableWidth = getCurrentTableWidth();
      const widthDifference = proposedWidth - startWidth;
      const newTableWidth = currentTableWidth + widthDifference;
      
      // Aplicar límites: mínimo 80px, máximo que no exceda el ancho de pantalla
      if (newTableWidth <= maxTableWidth) {
        currentWidth = Math.max(80, proposedWidth);
      } else {
        // Si excedería el máximo, calcular el ancho máximo permitido para esta columna
        const maxAllowedWidth = startWidth + (maxTableWidth - currentTableWidth);
        currentWidth = Math.max(80, Math.min(proposedWidth, maxAllowedWidth));
      }
      
      // Solo renderizar si ha pasado suficiente tiempo desde el último render
      const now = performance.now();
      if (now - lastRenderTime >= frameInterval) {
        lastRenderTime = now;
        renderUpdate();
      } else if (!animationFrameId) {
        // Si no tenemos un frame programado, programar uno
        animationFrameId = requestAnimationFrame(() => {
          renderUpdate();
          animationFrameId = null;
          lastRenderTime = performance.now();
        });
      }
    };
    
    // Función para detener el redimensionamiento y aplicar cambios al estado de React
    const handleMouseUp = () => {
      // Cancelar cualquier frame pendiente
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Aplicar el nuevo ancho al estado de React
      if (currentWidth !== startWidth) {
        setColumns(prevColumns => 
          prevColumns.map(col => 
            col.id === columnId 
              ? { ...col, width: currentWidth } 
              : col
          )
        );
      }
      
      // Restaurar el cursor
      document.body.style.cursor = '';
      
      // Limpiar overlay
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      
      // Limpiar event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    // Agregar event listeners al documento
    document.addEventListener('mousemove', handleMouseMove, { passive: false });
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Renderizar celda con icono
  const renderCell = (row, column) => {
    const value = row[column.id];
    const isSelected = selectedRow && selectedRow.ID_EMPLEADO === row.ID_EMPLEADO;
    
    // Renderizar según el tipo de columna
    if (column.id === 'ANULADO') {
      return value === 1 
        ? (
          <div className="flex items-center text-red-600">
            <XCircle size={12} className="mr-1 flex-shrink-0" />
            <span>Anulado</span>
          </div>
        ) 
        : (
          <div className="flex items-center text-green-600">
            <CheckCircle size={12} className="mr-1 flex-shrink-0" />
            <span>Activo</span>
          </div>
        );
    }
    
    // Renderizar columna de ROL con determinación automática
    if (column.id === 'ROL') {
      let role = 'Usuario';
      let colorClass = 'text-blue-600';
      
      if (row.PER_USUARIOS === 1 && row.PER_ELIMINACION === 1 && row.PER_MODIFICACION === 1) {
        role = 'Administrador';
        colorClass = 'text-red-600';
      } else if (row.PER_MODIFICACION === 1) {
        role = 'Editor';
        colorClass = 'text-orange-600';
      }
      
      return (
        <div className={`flex items-center ${isSelected ? 'text-white' : colorClass}`}>
          <Shield size={12} className={`mr-1 flex-shrink-0 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`} />
          <span className="truncate">{role}</span>
        </div>
      );
    }
    
    // Renderizar columna de PERMISOS con tooltip completo y ancho dinámico
    if (column.id === 'PERMISOS') {
      const allPermissions = [];
      
      // Permisos básicos
      if (row.PER_IMPRESION === 1) allPermissions.push('Impresión');
      if (row.PER_FACTURACION === 1) allPermissions.push('Facturación');
      if (row.PER_MODIFICACION === 1) allPermissions.push('Modificación');
      if (row.PER_ELIMINACION === 1) allPermissions.push('Eliminación');
      if (row.PER_USUARIOS === 1) allPermissions.push('Usuarios');
      if (row.PER_EDICION === 1) allPermissions.push('Edición');
      if (row.PER_CIERRE === 1) allPermissions.push('Cierre');
      if (row.PER_ALTAS_BAJAS_USUARIOS === 1) allPermissions.push('Altas/Bajas Usuarios');
      if (row.PER_SEGUNDA_EDICION === 1) allPermissions.push('Segunda Edición');
      if (row.PER_EXPLORAR === 1) allPermissions.push('Explorar');
      
      // Permisos avanzados
      if (row.PER_CONTABILIDAD === 1) allPermissions.push('Contabilidad');
      if (row.PER_ENVIO_PEDIDOS_PROVEEDOR === 1) allPermissions.push('Envío Pedidos Proveedor');
      if (row.PER_GESTION_PROYECTOS === 1) allPermissions.push('Gestión Proyectos');
      if (row.PER_GESTION_INCIDENCIAS === 1) allPermissions.push('Gestión Incidencias');
      if (row.PER_OFERTAS === 1) allPermissions.push('Ofertas');
      if (row.PER_CIERRE_MUESTRAS === 1) allPermissions.push('Cierre Muestras');
      if (row.PER_PLAZO_ENTREGA === 1) allPermissions.push('Plazo Entrega');
      if (row.PER_MOS_PLANIFICACION_CLIENTES === 1) allPermissions.push('Planificación Clientes');
      
      // Permisos de calidad
      if (row.PER_ACCESO_DOCUMENTACION_CALIDAD === 1) allPermissions.push('Documentación Calidad');
      if (row.PER_CREACION_VERSIONES_DOCUMENTOS === 1) allPermissions.push('Creación Versiones Documentos');
      if (row.PER_INSPECCION_DOC_CALIDAD === 1) allPermissions.push('Inspección Documentos Calidad');
      if (row.PER_LISTA_PROCENSAL_PNT === 1) allPermissions.push('Lista Procesal PNT');
      if (row.PER_VER_TODAS_FAMILIAS === 1) allPermissions.push('Ver Todas Familias');
      if (row.PER_GESTION_NO_CONFORMIDADES === 1) allPermissions.push('Gestión No Conformidades');
      if (row.PER_NORMAS_NO_CONTROLADAS === 1) allPermissions.push('Normas No Controladas');
      if (row.PER_LISTADO_INCIDENCIAS === 1) allPermissions.push('Listado Incidencias');
      
      // Permisos de indicadores
      if (row.PER_CENTROS_PLAZO_ENTREGA === 1) allPermissions.push('Centros Plazo Entrega');
      if (row.PER_LISTADO_PLAZO_PASO === 1) allPermissions.push('Listado Plazo Paso');
      if (row.PER_INDICADORES_CLIENTE === 1) allPermissions.push('Indicadores Cliente');
      if (row.PER_PRODUCTIVIDAD === 1) allPermissions.push('Productividad');
      
      // Permisos de tesorería
      if (row.PER_MENU_TESORERIA === 1) allPermissions.push('Menú Tesorería');
      if (row.PER_FACTURAS_PROVEEDORES === 1) allPermissions.push('Facturas Proveedores');
      
      // Permisos de facturación
      if (row.PER_CARGAR_PNT === 1) allPermissions.push('Cargar PNT');
      if (row.PER_FACTURACION_ANUAL === 1) allPermissions.push('Facturación Anual');
      
      // Otros permisos
      if (row.ORDENES_NO_PROCESADO === 1) allPermissions.push('Órdenes No Procesadas');
      if (row.REVISION_DE_MUESTRAS === 1) allPermissions.push('Revisión de Muestras');
      
      if (allPermissions.length === 0) {
        return <span className={isSelected ? 'text-gray-300' : 'text-gray-500'}>Sin permisos</span>;
      }
      
      // Calcular cuántos permisos entran según el ancho de la columna
      // Aproximadamente: 70px por permiso + 50px para el contador
      const columnWidth = column.width;
      const permissionWidth = 70; // Ancho aproximado de cada tag
      const counterWidth = 50; // Ancho del contador "+X más"
      const availableWidth = columnWidth - 12; // Restar padding (6px cada lado)
      
      let maxPermissions = 1; // Mínimo 1 permiso
      if (availableWidth >= permissionWidth + counterWidth) {
        // Calcular cuántos permisos caben
        maxPermissions = Math.floor((availableWidth - counterWidth) / permissionWidth);
        // Si todos caben sin necesidad de contador, usar todos
        if (maxPermissions >= allPermissions.length) {
          maxPermissions = allPermissions.length;
        }
      }
      
      const displayPerms = allPermissions.slice(0, maxPermissions);
      const remaining = allPermissions.length - displayPerms.length;
      const tooltipText = allPermissions.join(', ');
      
      return (
        <div 
          className="flex flex-wrap gap-1 items-center cursor-help"
          title={tooltipText}
        >
          {displayPerms.map((perm, idx) => (
            <span 
              key={idx} 
              className={`px-1.5 py-0.5 text-xs rounded-full flex-shrink-0 ${
                isSelected 
                  ? 'bg-gray-600 text-white' 
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {perm}
            </span>
          ))}
          {remaining > 0 && (
            <span className={`text-xs font-medium flex-shrink-0 ${isSelected ? 'text-gray-300' : 'text-blue-600'}`}>
              +{remaining} más
            </span>
          )}
        </div>
      );
    }
    
    // Para otras columnas con iconos
    if (column.icon && typeof column.icon === 'function') {
      const IconComponent = column.icon;
      return (
        <div className={`flex items-center ${isSelected ? 'text-white' : 'text-gray-800'}`}>
          <IconComponent size={12} className={`mr-1 flex-shrink-0 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`} />
          <span className="truncate">{value || '-'}</span>
        </div>
      );
    }
    
    // Columnas sin icono
    return value || '-';
  };
  
  // Calcular estilo para la fila seleccionada
  const getRowStyle = (row, index) => {
    const isSelected = selectedRow && selectedRow.ID_EMPLEADO === row.ID_EMPLEADO;
    
    if (isSelected) {
      return "bg-slate-700 hover:bg-slate-600 text-white";
    }
    
    return index % 2 === 0
      ? "bg-white hover:bg-gray-50"
      : "bg-gray-50 hover:bg-gray-100";
  };
  
  // Renderizar cabecera de tabla
  const renderTableHeader = () => (
    <div
      ref={tableHeaderRef}
      className="sticky top-0 z-10 bg-slate-800 text-white"
    >
      <div className="flex">
        {visibleColumns.map((column) => (
          <div
            key={column.id}
            className="relative border-r border-gray-300 dark:border-gray-700"
            style={{ flex: `0 0 ${column.width}px` }}
            data-column-id={column.id}
          >
            <DraggableHeader
              column={column}
              sortColumn={sortConfig.column}
              sortDirection={sortConfig.direction}
              onSort={handleSort}
              onContextMenu={handleContextMenu}
            />
            {/* Controlador de redimensionamiento con indicador visual */}
            <div
              className="absolute top-0 right-0 h-full w-4 cursor-col-resize hover:bg-blue-200 hover:opacity-60 z-10 flex items-center justify-center"
              onMouseDown={(e) => handleColumnResize(e, column.id)}
            >
              <div className="w-0.5 h-1/2 bg-gray-400"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  
  // Renderizar filas de datos
  const renderTableRows = () => {
    if (isLoading && !data.length) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="flex flex-col items-center">
            <Loader className="h-5 w-5 animate-spin text-blue-500 mb-2" />
            <span className="text-sm text-gray-600">Cargando datos...</span>
          </div>
        </div>
      );
    }
    
    if (!sortedData.length) {
      return (
        <div className="flex justify-center items-center py-8 text-sm text-gray-500">
          {emptyMessage}
        </div>
      );
    }

    // Renderizado simple sin virtualización por ahora
    return (
      <div className="w-full">
        {sortedData.map((row, index) => (
          <div
            key={row.ID_EMPLEADO}
            className={`flex border-b border-gray-100 cursor-pointer transition-colors duration-150 ${getRowStyle(row, index)}`}
            style={{ 
              minHeight: '28px',
              width: '100%'
            }}
            onClick={() => handleRowClick(row)}
            onDoubleClick={() => handleRowDoubleClick(row)}
          >
            {visibleColumns.map((column) => (
              <div
                key={`${row.ID_EMPLEADO}-${column.id}`}
                className="px-1.5 py-1 text-xs border-r border-gray-200 flex items-center"
                style={{ 
                  width: `${column.width}px`,
                  minWidth: `${column.width}px`,
                  maxWidth: `${column.width}px`,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
                data-column-id={column.id}
                title={renderCell(row, column)}
              >
                {renderCell(row, column)}
              </div>
            ))}
          </div>
        ))}
        
        {/* Indicador de carga al final del scroll */}
        {isLoadingMore && (
          <div className="flex justify-center items-center py-4 text-xs text-gray-600 bg-gray-50 border-t border-gray-200">
            <Loader className="h-4 w-4 animate-spin text-blue-500 mr-2" />
            <span>Cargando más datos...</span>
          </div>
        )}
      </div>
    );
  };
  
  // Estilo CSS para scrollbar personalizada
  const scrollbarStyle = `
    .custom-scrollbar {
      overflow-y: auto;
      overflow-x: hidden;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 12px;
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
    
    /* Para Firefox */
    .custom-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: #9ca3af #e5e7eb;
    }
  `;

  return (
    <div 
      ref={tableRef}
      className="w-full h-full flex flex-col border border-gray-200 rounded-md"
    >
      <style>{scrollbarStyle}</style>
      {renderTableHeader()}
      
      <div 
        ref={tableBodyRef}
        className="flex-grow overflow-auto custom-scrollbar bg-white"
        style={{
          height: '600px',
          minHeight: '500px',
          maxHeight: 'calc(100vh - 180px)'
        }}
      >
        {renderTableRows()}
      </div>
      
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1.5 text-xs text-gray-500 flex justify-between items-center">
        <div className="flex items-center">
          <span className="mr-2">{sortedData.length} {sortedData.length === 1 ? "usuario" : "usuarios"}</span>
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
              onClick={loadNextPage}
              className="text-blue-500 hover:text-blue-700 flex items-center bg-blue-50 px-2 py-1 rounded cursor-pointer"
            >
              <span>Cargar más</span>
              <ChevronDown size={10} className="ml-1" />
            </button>
          )}
        </div>
      </div>
      
      {contextMenu.show && (
        <ColumnContextMenu
          position={contextMenu.position}
          columns={columns}
          onToggleColumn={handleToggleColumn}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
});

export default AdvancedUserTable;