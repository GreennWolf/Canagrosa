/**
 * Utilidades para optimización de rendimiento
 */

/**
 * Implementación de debounce para limitar la frecuencia de llamadas a funciones
 * 
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en milisegundos
 * @returns {Function} - Función con debounce aplicado
 */
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Función para crear un identificador único
 * Útil para elementos dinámicos que necesitan IDs únicos
 * 
 * @returns {string} - ID único
 */
export function uniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Función para medir tiempo de ejecución de operaciones
 * 
 * @param {string} label - Etiqueta para la operación
 * @returns {Function} - Función para finalizar la medición
 */
export function measureExecutionTime(label) {
  const startTime = performance.now();
  
  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Solo mostrar en desarrollo
    if (process.env.NODE_ENV !== 'production') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  };
}

/**
 * Función para agrupar múltiples operaciones en una sola 
 * transacción de renderizado para evitar re-renders
 * 
 * @param {Function[]} callbacks - Funciones a ejecutar
 */
export function batchUpdates(callbacks = []) {
  if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
    window.requestAnimationFrame(() => {
      callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback();
        }
      });
    });
  } else {
    // Fallback para entornos sin requestAnimationFrame
    setTimeout(() => {
      callbacks.forEach(callback => {
        if (typeof callback === 'function') {
          callback();
        }
      });
    }, 0);
  }
}

/**
 * Función para limitar la velocidad de ejecución de una función
 * A diferencia de debounce, throttle garantiza que la función se
 * ejecute como máximo una vez cada X milisegundos
 * 
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Intervalo mínimo entre ejecuciones
 * @returns {Function} - Función con throttle aplicado
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  let lastFunc;
  let lastRan;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      lastRan = Date.now();
      inThrottle = true;
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if (Date.now() - lastRan >= limit) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
}