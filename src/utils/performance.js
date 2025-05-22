import React from 'react';

/**
 * Utilidades para monitoreo de rendimiento
 */

const isProduction = process.env.NODE_ENV === 'production';

// Niveles de log disponibles
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

// Configuración global para los logs
const config = {
  enabled: !isProduction || localStorage.getItem('enablePerformanceLogs') === 'true',
  logLevel: isProduction ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG,
  includeTimestamps: true
};

/**
 * Registra información de rendimiento
 * 
 * @param {string} component - Nombre del componente o módulo
 * @param {string} action - Acción que se está midiendo
 * @param {number} time - Tiempo en milisegundos
 * @param {Object} extraData - Datos adicionales para incluir
 * @param {number} level - Nivel de log (DEBUG, INFO, WARN, ERROR)
 */
export function logPerformance(component, action, time, extraData = {}, level = LOG_LEVELS.DEBUG) {
  if (!config.enabled || level < config.logLevel) return;
  
  const timestamp = config.includeTimestamps ? new Date().toISOString() : '';
  const prefix = `[PERFORMANCE]${timestamp ? ` [${timestamp}]` : ''} [${component}]`;
  
  // Color según el tiempo (verde < 100ms, amarillo < 500ms, rojo >= 500ms)
  let color = 'color: green';
  if (time >= 500) {
    color = 'color: red; font-weight: bold';
  } else if (time >= 100) {
    color = 'color: orange';
  }
  
  console.log(
    `${prefix} %c${action}: ${time.toFixed(2)}ms`, 
    color,
    extraData
  );
}

/**
 * Crea un medidor de rendimiento para una operación
 * 
 * @param {string} component - Nombre del componente o módulo
 * @param {string} action - Acción que se está midiendo
 * @param {Object} extraData - Datos adicionales para incluir
 * @returns {Function} - Función para detener la medición
 */
export function startPerformanceMeasure(component, action, extraData = {}) {
  if (!config.enabled) return () => {};
  
  const startTime = performance.now();
  
  return (additionalData = {}) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Determinar nivel de log según duración
    let level = LOG_LEVELS.DEBUG;
    if (duration >= 1000) {
      level = LOG_LEVELS.WARN;
    } else if (duration >= 500) {
      level = LOG_LEVELS.INFO;
    }
    
    logPerformance(
      component, 
      action, 
      duration, 
      { ...extraData, ...additionalData },
      level
    );
    
    return duration;
  };
}

/**
 * Decorador para medir rendimiento de una función
 * 
 * @param {string} component - Nombre del componente o módulo
 * @param {string} action - Acción que se está midiendo
 * @returns {Function} - Decorador de función
 */
export function measurePerformance(component, action) {
  return function(target, name, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function(...args) {
      if (!config.enabled) return originalMethod.apply(this, args);
      
      const stopMeasure = startPerformanceMeasure(component, action || name);
      try {
        const result = originalMethod.apply(this, args);
        
        // Si el resultado es una promesa, medimos cuando se resuelva
        if (result instanceof Promise) {
          return result.then(
            value => {
              stopMeasure();
              return value;
            },
            error => {
              stopMeasure({ error: true });
              throw error;
            }
          );
        }
        
        stopMeasure();
        return result;
      } catch (error) {
        stopMeasure({ error: true });
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Configurar el sistema de logs de rendimiento
 * 
 * @param {Object} options - Opciones de configuración
 */
export function configurePerformanceLogging(options = {}) {
  Object.assign(config, options);
}

/**
 * Hook para monitorear renderizados de componentes
 * 
 * @param {string} componentName - Nombre del componente
 * @param {Object} props - Props del componente para incluir en los logs
 */
export function useRenderLogger(componentName, props = {}) {
  React.useEffect(() => {
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
  }, []);
}

// Para el hook useRenderLogger

// Marcar eventos de montaje de la aplicación para diagnóstico
if (config.enabled) {
  // Marcar tiempo de carga inicial
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    logPerformance('App', 'Initial Load', loadTime, {}, LOG_LEVELS.INFO);
    
    // Registrar métricas web vitals si están disponibles
    if ('web-vitals' in window) {
      const { getCLS, getFID, getLCP } = window['web-vitals'];
      getCLS(metric => logPerformance('WebVitals', 'CLS', metric.value * 1000, metric, LOG_LEVELS.INFO));
      getFID(metric => logPerformance('WebVitals', 'FID', metric.value, metric, LOG_LEVELS.INFO));
      getLCP(metric => logPerformance('WebVitals', 'LCP', metric.value, metric, LOG_LEVELS.INFO));
    }
  });
}