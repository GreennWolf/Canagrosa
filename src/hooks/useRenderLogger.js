import { useEffect } from 'react';

// Niveles de log disponibles
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Configuración por defecto
const defaultConfig = {
  enabled: process.env.NODE_ENV !== 'production',
  logLevel: process.env.NODE_ENV !== 'production' ? LOG_LEVELS.DEBUG : LOG_LEVELS.WARN,
  includeTimestamps: true
};

/**
 * Hook para monitorear renderizados de componentes
 * Útil para detectar ciclos de renderizado innecesarios
 * 
 * @param {string} componentName - Nombre del componente
 * @param {Object} props - Props del componente para incluir en los logs
 * @param {Object} config - Configuración personalizada para este hook
 */
export function useRenderLogger(
  componentName, 
  props = {},
  config = defaultConfig
) {
  useEffect(() => {
    if (config.enabled && config.logLevel <= LOG_LEVELS.DEBUG) {
      const propsToLog = {};
      
      // Solo incluimos props primitivas o length de arrays/objetos para evitar logs enormes
      Object.entries(props).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          propsToLog[key] = value;
        } else if (typeof value !== 'object' && typeof value !== 'function') {
          propsToLog[key] = value;
        } else if (Array.isArray(value)) {
          propsToLog[`${key}.length`] = value.length;
        } else if (typeof value === 'object') {
          propsToLog[`${key}.keys`] = Object.keys(value).length;
        }
      });
      
      console.log(`[RENDER] ${componentName}`, propsToLog);
    }
    
    return () => {
      if (config.enabled && config.logLevel <= LOG_LEVELS.DEBUG) {
        console.log(`[UNMOUNT] ${componentName}`);
      }
    };
  }, [componentName]);
}

export default useRenderLogger;