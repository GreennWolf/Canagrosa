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
 * Hook específico para detectar el modo del layout (sidebar/header)
 * y calcular el ancho máximo apropiado para las tablas
 */
export const useLayoutAwareTableWidth = () => {
  const [maxTableWidth, setMaxTableWidth] = useState(window.innerWidth * 0.9);

  const calculateMaxWidth = useCallback(() => {
    // Detectar si estamos en modo header o sidebar
    const isHeaderMode = localStorage.getItem('canagrosa-layout-type') === 'header';
    
    if (isHeaderMode) {
      // Modo header: más espacio disponible
      return window.innerWidth * 0.95;
    } else {
      // Modo sidebar: menos espacio debido al sidebar + margen adicional
      const sidebar = document.querySelector('[class*="w-64"], [class*="w-20"]');
      const sidebarWidth = sidebar?.getBoundingClientRect().width || 64;
      const availableWidth = window.innerWidth - sidebarWidth - 48 - 10; // 48px padding + 10px margen extra
      return Math.min(availableWidth, window.innerWidth * 0.9);
    }
  }, []);

  useEffect(() => {
    const updateMaxWidth = () => {
      setMaxTableWidth(calculateMaxWidth());
    };

    // Calcular ancho inicial
    updateMaxWidth();

    // Escuchar cambios de tamaño de ventana
    window.addEventListener('resize', updateMaxWidth);
    
    // Escuchar cambios en localStorage (modo layout)
    const handleStorageChange = (e) => {
      if (e.key === 'canagrosa-layout-type') {
        updateMaxWidth();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Observer para cambios en el DOM (sidebar toggle)
    const observer = new MutationObserver(updateMaxWidth);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      childList: true,
      subtree: true
    });

    return () => {
      window.removeEventListener('resize', updateMaxWidth);
      window.removeEventListener('storage', handleStorageChange);
      observer.disconnect();
    };
  }, [calculateMaxWidth]);

  return maxTableWidth;
};

export default useContainerDimensions;