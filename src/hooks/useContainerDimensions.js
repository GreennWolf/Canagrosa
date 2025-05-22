import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook personalizado para calcular las dimensiones disponibles del contenedor
 * considerando sidebar, header y otros elementos del layout
 */
const useContainerDimensions = ({
  padding = 48, // Padding total del contenedor (24px cada lado por defecto)
  minWidth = 320, // Ancho mínimo absoluto
  maxWidthPercentage = 0.95, // Porcentaje máximo del contenedor disponible
  excludeElements = [], // Selectores de elementos a excluir del cálculo
  debounceMs = 100 // Tiempo de debounce para resize
} = {}) => {
  const [dimensions, setDimensions] = useState({
    containerWidth: 0,
    availableWidth: 0,
    containerHeight: 0,
    availableHeight: 0,
    isHeaderMode: false,
    sidebarWidth: 0
  });
  
  const containerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  const calculateDimensions = useCallback(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    
    // Detectar el modo de layout (header vs sidebar)
    const sidebar = document.querySelector('[data-sidebar]') || 
                   document.querySelector('[class*="w-64"], [class*="w-20"]');
    const isHeaderMode = !sidebar;
    
    let sidebarWidth = 0;
    let availableWidth = containerRect.width;
    
    if (!isHeaderMode && sidebar) {
      // Modo sidebar: calcular ancho del sidebar
      const sidebarRect = sidebar.getBoundingClientRect();
      sidebarWidth = sidebarRect.width;
    }
    
    // Calcular ancho disponible considerando elementos excluidos
    let excludedWidth = 0;
    excludeElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        const elementRect = element.getBoundingClientRect();
        excludedWidth += elementRect.width;
      }
    });
    
    // Ancho disponible final
    const finalAvailableWidth = Math.max(
      minWidth,
      (availableWidth - excludedWidth - padding) * maxWidthPercentage
    );
    
    // Altura disponible
    const viewportHeight = window.innerHeight;
    const headerHeight = document.querySelector('[data-header]')?.getBoundingClientRect().height || 0;
    const availableHeight = viewportHeight - headerHeight - padding;
    
    setDimensions({
      containerWidth: containerRect.width,
      availableWidth: finalAvailableWidth,
      containerHeight: containerRect.height,
      availableHeight: Math.max(400, availableHeight),
      isHeaderMode,
      sidebarWidth
    });
  }, [padding, minWidth, maxWidthPercentage, excludeElements]);

  // Función de resize con debounce
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    
    resizeTimeoutRef.current = setTimeout(() => {
      calculateDimensions();
    }, debounceMs);
  }, [calculateDimensions, debounceMs]);

  // Effect para calcular dimensiones iniciales
  useEffect(() => {
    calculateDimensions();
  }, [calculateDimensions]);

  // Effect para escuchar cambios de tamaño
  useEffect(() => {
    const resizeObserver = new ResizeObserver(handleResize);
    const mutationObserver = new MutationObserver(handleResize);
    
    // Observar cambios en el contenedor
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    // Observar cambios en el documento (sidebar toggle, etc.)
    mutationObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true
    });
    
    // Escuchar eventos de resize de ventana
    window.addEventListener('resize', handleResize);
    
    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [handleResize]);

  return {
    ...dimensions,
    containerRef,
    refresh: calculateDimensions
  };
};

/**
 * Hook específico para tablas que necesitan cálculos de ancho de columnas
 */
export const useTableDimensions = (options = {}) => {
  const dimensions = useContainerDimensions({
    padding: 24, // Padding más ajustado para tablas
    maxWidthPercentage: 1, // Usar todo el ancho disponible
    ...options
  });

  const calculateColumnWidths = useCallback((columns, visibleColumns, columnWidths = {}) => {
    const { availableWidth } = dimensions;
    
    if (!availableWidth || !columns?.length) {
      return { columnWidths: {}, totalWidth: 0 };
    }

    // Calcular anchos de columnas con anchors fijos
    const columnsWithFixedWidth = visibleColumns.filter(colId => {
      const column = columns.find(c => c.id === colId || c.accessor === colId);
      return columnWidths[colId] || column?.width;
    });

    const fixedWidth = columnsWithFixedWidth.reduce((sum, colId) => {
      const customWidth = columnWidths[colId];
      if (customWidth) return sum + customWidth;
      
      const column = columns.find(c => c.id === colId || c.accessor === colId);
      return sum + (column?.width || 120);
    }, 0);

    // Calcular columnas flexibles
    const flexColumns = visibleColumns.filter(colId => !columnsWithFixedWidth.includes(colId));
    const remainingWidth = Math.max(0, availableWidth - fixedWidth);
    const flexColumnWidth = flexColumns.length > 0 ? 
      Math.max(80, remainingWidth / flexColumns.length) : 120;

    // Construir objeto de anchos finales
    const finalColumnWidths = {};
    visibleColumns.forEach(colId => {
      if (columnsWithFixedWidth.includes(colId)) {
        finalColumnWidths[colId] = columnWidths[colId] || 
          columns.find(c => c.id === colId || c.accessor === colId)?.width || 120;
      } else {
        finalColumnWidths[colId] = flexColumnWidth;
      }
    });

    const totalWidth = Object.values(finalColumnWidths).reduce((sum, width) => sum + width, 0);

    return {
      columnWidths: finalColumnWidths,
      totalWidth: Math.min(totalWidth, availableWidth),
      maxTableWidth: availableWidth
    };
  }, [dimensions]);

  return {
    ...dimensions,
    calculateColumnWidths
  };
};

export default useContainerDimensions;