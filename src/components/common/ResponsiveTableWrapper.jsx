import React, { forwardRef } from 'react';
import { useContainerDimensions } from '../../hooks/useContainerDimensions';

/**
 * Componente wrapper que garantiza que las tablas no tengan overflow horizontal
 * y se adapten correctamente al espacio disponible en el layout
 */
const ResponsiveTableWrapper = forwardRef(({ 
  children, 
  className = '', 
  style = {},
  maxHeight = 'calc(100vh - 200px)',
  padding = 24,
  enableScroll = true,
  ...props 
}, ref) => {
  const { 
    containerRef, 
    availableWidth, 
    availableHeight,
    isHeaderMode,
    sidebarWidth 
  } = useContainerDimensions({
    padding,
    maxWidthPercentage: 0.98, // Usar 98% del ancho disponible para evitar overflow
    debounceMs: 50
  });

  const containerStyle = {
    width: '100%',
    maxWidth: availableWidth ? `${availableWidth}px` : '100%',
    height: '100%',
    maxHeight: typeof maxHeight === 'string' ? maxHeight : `${maxHeight}px`,
    overflow: enableScroll ? 'hidden' : 'visible',
    position: 'relative',
    ...style
  };

  return (
    <div
      ref={(el) => {
        if (containerRef) containerRef.current = el;
        if (ref) {
          if (typeof ref === 'function') ref(el);
          else ref.current = el;
        }
      }}
      className={`table-viewport ${className}`}
      style={containerStyle}
      data-table-wrapper="true"
      data-layout-mode={isHeaderMode ? 'header' : 'sidebar'}
      data-sidebar-width={sidebarWidth}
      {...props}
    >
      {enableScroll && (
        <div className="table-scroll table-scrollbar w-full h-full">
          {children}
        </div>
      )}
      {!enableScroll && children}
    </div>
  );
});

ResponsiveTableWrapper.displayName = 'ResponsiveTableWrapper';

export default ResponsiveTableWrapper;