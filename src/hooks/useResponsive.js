import { useState, useEffect } from 'react';

/**
 * Hook personalizado para manejo de responsive design
 * Detecta el tamaño de pantalla y proporciona breakpoints útiles
 */
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [breakpoint, setBreakpoint] = useState('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      
      // Determinar breakpoint actual
      if (width < 640) {
        setBreakpoint('xs');
      } else if (width < 768) {
        setBreakpoint('sm');
      } else if (width < 1024) {
        setBreakpoint('md');
      } else if (width < 1280) {
        setBreakpoint('lg');
      } else {
        setBreakpoint('xl');
      }
    };

    // Establecer tamaño inicial
    handleResize();

    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Funciones helper para breakpoints
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl';
  
  // Funciones helper para tamaños específicos
  const isXs = breakpoint === 'xs'; // < 640px
  const isSm = breakpoint === 'sm'; // 640px - 768px
  const isMd = breakpoint === 'md'; // 768px - 1024px
  const isLg = breakpoint === 'lg'; // 1024px - 1280px
  const isXl = breakpoint === 'xl'; // >= 1280px

  // Funciones helper para comparaciones
  const isSmUp = !isXs; // >= 640px
  const isMdUp = isDesktop || isTablet; // >= 768px
  const isLgUp = isDesktop; // >= 1024px

  return {
    screenSize,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    isXs,
    isSm,
    isMd,
    isLg,
    isXl,
    isSmUp,
    isMdUp,
    isLgUp,
  };
};

export default useResponsive;