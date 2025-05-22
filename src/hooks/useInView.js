import { useEffect, useRef, useState } from 'react';

/**
 * Hook personalizado para detectar cuando un elemento es visible en el viewport
 * 
 * @param {Object} options - Opciones para el IntersectionObserver
 * @returns {Array} - [ref, isInView] - Ref para adjuntar al elemento y booleano que indica si está visible
 */
export function useInView(options = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);
  
  return [ref, isInView];
}