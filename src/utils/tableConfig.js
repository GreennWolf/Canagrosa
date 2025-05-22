/**
 * Utilidad para la gestión persistente de configuraciones de tablas
 * - Guarda y recupera configuraciones de columnas
 * - Implementa mecanismos de fallback y validación
 * - Mantiene configuraciones separadas por tabla
 */

// Prefijo para las claves en localStorage
const LOCAL_STORAGE_PREFIX = 'canagrosa_table_';

/**
 * Guarda la configuración de una tabla en localStorage
 * @param {string} tableId - Identificador único de la tabla
 * @param {object} config - Configuración a guardar
 * @returns {boolean} - Indica si la operación fue exitosa
 */
export const saveTableConfig = (tableId, config) => {
  if (!tableId || !config) return false;
  
  try {
    // Añadir un timestamp para potenciales validaciones de caducidad
    const configWithMeta = {
      ...config,
      _timestamp: Date.now(),
      _version: 1 // Para control de versiones de esquema
    };
    
    localStorage.setItem(
      `${LOCAL_STORAGE_PREFIX}${tableId}`, 
      JSON.stringify(configWithMeta)
    );
    
    return true;
  } catch (error) {
    console.error(`Error al guardar configuración de tabla ${tableId}:`, error);
    return false;
  }
};

/**
 * Recupera la configuración de una tabla desde localStorage
 * @param {string} tableId - Identificador único de la tabla
 * @param {object} defaultConfig - Configuración por defecto si no existe guardada
 * @returns {object} - La configuración recuperada o la por defecto
 */
export const loadTableConfig = (tableId, defaultConfig = {}) => {
  if (!tableId) return defaultConfig;
  
  try {
    const savedConfig = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${tableId}`);
    
    if (!savedConfig) return defaultConfig;
    
    const parsedConfig = JSON.parse(savedConfig);
    
    // Validar que la configuración cargada es válida y contiene lo que esperamos
    if (!parsedConfig || typeof parsedConfig !== 'object') {
      return defaultConfig;
    }
    
    // Aquí podríamos agregar validaciones adicionales según el esquema esperado
    
    return parsedConfig;
  } catch (error) {
    console.error(`Error al cargar configuración de tabla ${tableId}:`, error);
    return defaultConfig;
  }
};

/**
 * Elimina la configuración de una tabla de localStorage
 * @param {string} tableId - Identificador único de la tabla
 * @returns {boolean} - Indica si la operación fue exitosa
 */
export const resetTableConfig = (tableId) => {
  if (!tableId) return false;
  
  try {
    localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}${tableId}`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar configuración de tabla ${tableId}:`, error);
    return false;
  }
};

/**
 * Actualiza parcialmente la configuración de una tabla
 * @param {string} tableId - Identificador único de la tabla
 * @param {object} partialConfig - Configuración parcial a actualizar
 * @param {object} defaultConfig - Configuración por defecto si no existe guardada
 * @returns {boolean} - Indica si la operación fue exitosa
 */
export const updateTableConfig = (tableId, partialConfig, defaultConfig = {}) => {
  if (!tableId || !partialConfig) return false;
  
  try {
    // Cargar configuración actual
    const currentConfig = loadTableConfig(tableId, defaultConfig);
    
    // Combinar con la actualización
    const updatedConfig = {
      ...currentConfig,
      ...partialConfig,
      _timestamp: Date.now() // Actualizar timestamp
    };
    
    // Guardar configuración actualizada
    return saveTableConfig(tableId, updatedConfig);
  } catch (error) {
    console.error(`Error al actualizar configuración de tabla ${tableId}:`, error);
    return false;
  }
};

/**
 * Obtiene una propiedad específica de la configuración de una tabla
 * @param {string} tableId - Identificador único de la tabla
 * @param {string} propName - Nombre de la propiedad a obtener
 * @param {any} defaultValue - Valor por defecto si no existe
 * @returns {any} - El valor de la propiedad o el valor por defecto
 */
export const getTableConfigProp = (tableId, propName, defaultValue) => {
  if (!tableId || !propName) return defaultValue;
  
  try {
    const config = loadTableConfig(tableId, {});
    return config[propName] !== undefined ? config[propName] : defaultValue;
  } catch (error) {
    console.error(`Error al obtener propiedad de configuración de tabla ${tableId}:`, error);
    return defaultValue;
  }
};