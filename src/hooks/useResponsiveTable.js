import { useState, useEffect, useMemo } from 'react';
import useResponsive from './useResponsive';

/**
 * Hook para manejar tablas responsive de manera inteligente
 * En lugar de hacer todo pequeño, adapta qué columnas mostrar según el dispositivo
 */
const useResponsiveTable = (columns = [], data = []) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [showMobileCards, setShowMobileCards] = useState(false);

  // Determinar qué columnas mostrar según el dispositivo
  const responsiveColumns = useMemo(() => {
    if (!columns.length) return [];

    // Marcar columnas por prioridad si no está definida
    const columnsWithPriority = columns.map(col => ({
      ...col,
      priority: col.priority || 1, // 1 = alta, 2 = media, 3 = baja
      mobileShow: col.mobileShow !== undefined ? col.mobileShow : col.priority <= 1
    }));

    if (isMobile) {
      // En móvil, decidir entre tarjetas o columnas críticas
      const criticalColumns = columnsWithPriority.filter(col => col.mobileShow);
      
      if (criticalColumns.length <= 2) {
        setShowMobileCards(false);
        return criticalColumns;
      } else {
        setShowMobileCards(true);
        return columnsWithPriority; // Mostrar todas en formato tarjeta
      }
    } else if (isTablet) {
      // En tablet, mostrar columnas de prioridad alta y media
      return columnsWithPriority.filter(col => col.priority <= 2);
    } else {
      // En desktop, mostrar todas las columnas
      setShowMobileCards(false);
      return columnsWithPriority;
    }
  }, [columns, isMobile, isTablet, isDesktop]);

  // Configuración de anchos adaptativos
  const getColumnWidth = (column, index) => {
    if (isMobile && !showMobileCards) {
      // En móvil con pocas columnas, dar más espacio
      return responsiveColumns.length === 1 ? '100%' : 
             responsiveColumns.length === 2 ? '50%' : '33.33%';
    } else if (isTablet) {
      // En tablet, anchos balanceados
      const baseWidth = 150;
      return `${baseWidth + (column.width || 0)}px`;
    } else {
      // En desktop, usar anchos específicos o automático
      return column.width ? `${column.width}px` : 'auto';
    }
  };

  // Configuración de tamaños de celda
  const getCellConfig = () => {
    if (isMobile) {
      return {
        padding: showMobileCards ? 'p-3' : 'px-2 py-3',
        fontSize: showMobileCards ? 'text-sm' : 'text-sm',
        headerPadding: 'px-2 py-3',
        headerFontSize: 'text-xs'
      };
    } else if (isTablet) {
      return {
        padding: 'px-3 py-2',
        fontSize: 'text-sm',
        headerPadding: 'px-3 py-3',
        headerFontSize: 'text-xs'
      };
    } else {
      return {
        padding: 'px-4 py-3',
        fontSize: 'text-sm',
        headerPadding: 'px-4 py-3',
        headerFontSize: 'text-xs'
      };
    }
  };

  // Configuración para modo tarjeta móvil
  const getCardConfig = () => ({
    showCards: showMobileCards,
    primaryField: columns.find(col => col.primary)?.accessor || columns[0]?.accessor,
    secondaryField: columns.find(col => col.secondary)?.accessor || columns[1]?.accessor,
    fieldsToShow: columns.filter(col => !col.hideInCard)
  });

  return {
    responsiveColumns,
    showMobileCards,
    isMobile,
    isTablet,
    isDesktop,
    getColumnWidth,
    getCellConfig,
    getCardConfig
  };
};

export default useResponsiveTable;