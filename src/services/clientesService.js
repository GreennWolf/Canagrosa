import clienteApi from './clienteApi';

/**
 * Función de reintento automático para peticiones API
 * @param {Function} apiCall - La función de llamada API a ejecutar
 * @param {Object} options - Opciones de configuración
 * @param {number} options.maxRetries - Número máximo de reintentos
 * @param {number} options.delayMs - Tiempo de espera entre reintentos (ms)
 * @param {Function} options.shouldRetry - Función para determinar si se debe reintentar
 * @returns {Promise} - Resultado de la llamada API
 */
const withRetry = async (apiCall, options = {}) => {
  const { 
    maxRetries = 3, 
    delayMs = 500, 
    shouldRetry = (error) => error.response?.status >= 500 || error.code === 'ECONNABORTED'
  } = options;
  
  let lastError;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // No reintentar si la petición fue cancelada o no cumple los criterios
      if (error.name === 'CanceledError' || error.name === 'AbortError' || !shouldRetry(error)) {
        throw error;
      }
      
      attempt++;
      
      // Si no hay más reintentos, lanzar el error
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Esperar antes del siguiente reintento (delay exponencial)
      const waitTime = delayMs * Math.pow(1.5, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log(`Reintentando petición (intento ${attempt} de ${maxRetries})...`);
    }
  }
  
  throw lastError;
};

/**
 * Formato de mensajes de error para presentar al usuario
 * @param {Error} error - Error original
 * @param {string} defaultMessage - Mensaje por defecto
 * @returns {string} - Mensaje de error formateado
 */
const formatErrorMessage = (error, defaultMessage) => {
  // Si es un error de red
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'La conexión ha excedido el tiempo de espera. Por favor, compruebe su conexión y vuelva a intentarlo.';
  }
  
  // Si es un error de servidor
  if (error.response?.status >= 500) {
    return 'Error en el servidor. Por favor, intente nuevamente más tarde.';
  }
  
  // Si hay un mensaje en la respuesta
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Si hay un mensaje en el error
  if (error.message && !error.message.includes('status code')) {
    return error.message;
  }
  
  // Mensaje por defecto
  return defaultMessage;
};

const clientesService = {
  // Obtener todos los clientes con filtros opcionales
  obtenerTodos: async (filtros = {}, signal) => {
    try {
      return await withRetry(async () => {
        // Extraer el filtro CON_ADJUNTOS para manejo especial
        const { CON_ADJUNTOS, ...otrosFiltros } = filtros;
        
        const respuesta = await clienteApi.get('/clientes/list', { 
          params: otrosFiltros, // Enviar sin CON_ADJUNTOS a la API
          signal, // Permitir cancelación de petición
          timeout: 15000 // 15 segundos de timeout
        });
        
        let clientes = respuesta.data;
        
        // Si se solicita filtrar por clientes con adjuntos, simular el filtro
        if (CON_ADJUNTOS === '1') {
          // NOTA PARA DESARROLLO:
          // Esta es una simulación. En la API real, el filtro CON_ADJUNTOS 
          // debería ser manejado por el backend con una consulta SQL que 
          // verifique si el cliente tiene registros en la tabla de adjuntos.
          // 
          // Ejemplo de consulta SQL para el backend:
          // SELECT DISTINCT c.* FROM clientes c 
          // INNER JOIN adjuntos a ON c.ID_CLIENTE = a.CLIENTE_ID
          // WHERE c.ANULADO = 0 AND a.ACTIVO = 1
          
          // Lista de IDs de clientes que tienen adjuntos (simulado)
          const clientesConAdjuntos = [1, 2, 5, 8, 12, 15, 20, 25]; // IDs ejemplo
          
          clientes = clientes.filter(cliente => 
            clientesConAdjuntos.includes(cliente.ID_CLIENTE)
          );
        }
        
        return clientes;
      });
    } catch (error) {
      // No mostrar error si la petición fue cancelada intencionalmente
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        console.log('Petición de clientes cancelada');
        return []; // Devolver array vacío para evitar errores
      }
      
      console.error('Error al obtener clientes:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudieron obtener los clientes. Por favor, intente nuevamente.'
      );
      
      // Enriquecer el error con información adicional
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },
  
  // Obtener clientes para combo
  obtenerParaCombo: async (filtros = {}) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.get('/clientes/combo', { 
          params: filtros,
          timeout: 10000 // 10 segundos de timeout
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error('Error al obtener clientes para combo:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudieron obtener las opciones de clientes. Por favor, intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },
  
  // Obtener un cliente por ID
  obtenerPorId: async (id) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.get(`/clientes/get/${id}`, {
          timeout: 10000 // 10 segundos de timeout
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      const errorMessage = formatErrorMessage(
        error, 
        `No se pudo obtener la información del cliente #${id}. Por favor, intente nuevamente.`
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },
  
  // Crear un nuevo cliente
  crear: async (datosCliente) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.put('/clientes', datosCliente, {
          timeout: 15000 // 15 segundos de timeout
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error('Error al crear cliente:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudo crear el cliente. Por favor, verifique los datos e intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },
  
  // Actualizar un cliente existente
  actualizar: async (datosCliente) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.patch('/clientes', datosCliente, {
          timeout: 15000 // 15 segundos de timeout
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudo actualizar el cliente. Por favor, verifique los datos e intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },
  
  // Eliminar un cliente
  eliminar: async (id) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.delete('/clientes', { 
          data: { ID_CLIENTE: id },
          timeout: 10000 // 10 segundos de timeout
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error);
      const errorMessage = formatErrorMessage(
        error, 
        `No se pudo eliminar el cliente #${id}. Por favor, intente nuevamente.`
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Clonar un cliente (crear uno nuevo basado en uno existente)
  clonar: async (id) => {
    try {
      return await withRetry(async () => {
        // Primero obtener los datos del cliente original
        const clienteOriginal = await clienteApi.get(`/clientes/get/${id}`, {
          timeout: 10000
        });
        
        let datosCliente;
        if (Array.isArray(clienteOriginal.data) && clienteOriginal.data.length > 0) {
          datosCliente = clienteOriginal.data[0];
        } else if (typeof clienteOriginal.data === 'object') {
          datosCliente = clienteOriginal.data;
        } else {
          throw new Error('Formato de datos no esperado');
        }
        
        // Preparar datos para el cliente clonado
        const datosClonado = {
          ...datosCliente,
          // Remover el ID para que se genere uno nuevo
          ID_CLIENTE: null,
          // Modificar el nombre para indicar que es una copia
          NOMBRE: `${datosCliente.NOMBRE} (duplicado)`,
          // Limpiar campos que no deben duplicarse
          CIF: '', // El CIF debe ser único
          // Mantener otros campos como están
        };
        
        // Crear el cliente clonado
        const respuesta = await clienteApi.put('/clientes', datosClonado, {
          timeout: 15000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error(`Error al clonar cliente con ID ${id}:`, error);
      const errorMessage = formatErrorMessage(
        error, 
        `No se pudo clonar el cliente #${id}. Por favor, intente nuevamente.`
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  }
};

export default clientesService;