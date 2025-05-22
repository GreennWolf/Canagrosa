import clienteApi from './clienteApi';

/**
 * Función de reintento automático para peticiones API
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
      
      if (error.name === 'CanceledError' || error.name === 'AbortError' || !shouldRetry(error)) {
        throw error;
      }
      
      attempt++;
      
      if (attempt >= maxRetries) {
        throw error;
      }
      
      const waitTime = delayMs * Math.pow(1.5, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      console.log(`Reintentando petición (intento ${attempt} de ${maxRetries})...`);
    }
  }
  
  throw lastError;
};

/**
 * Formato de mensajes de error para presentar al usuario
 */
const formatErrorMessage = (error, defaultMessage) => {
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'La conexión ha excedido el tiempo de espera. Por favor, compruebe su conexión y vuelva a intentarlo.';
  }
  
  if (error.response?.status >= 500) {
    return 'Error en el servidor. Por favor, intente nuevamente más tarde.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message && !error.message.includes('status code')) {
    return error.message;
  }
  
  return defaultMessage;
};

const usuariosService = {
  // Obtener todos los usuarios con filtros opcionales
  obtenerTodos: async (filtros = {}, signal) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.get('/usuarios/list', { 
          params: filtros,
          signal,
          timeout: 15000
        });
        return respuesta.data;
      });
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') {
        console.log('Petición de usuarios cancelada');
        return [];
      }
      
      console.error('Error al obtener usuarios:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudieron obtener los usuarios. Por favor, intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Obtener usuarios para combo
  obtenerParaCombo: async (filtros = {}) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.get('/usuarios/combo', { 
          params: filtros,
          timeout: 10000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error('Error al obtener usuarios para combo:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudieron obtener las opciones de usuarios. Por favor, intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Obtener un usuario por ID
  obtenerPorId: async (id) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.get(`/usuarios/get/${id}`, {
          timeout: 10000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      const errorMessage = formatErrorMessage(
        error, 
        `No se pudo obtener la información del usuario #${id}. Por favor, intente nuevamente.`
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Crear un nuevo usuario
  crear: async (datosUsuario) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.put('/usuarios', datosUsuario, {
          timeout: 15000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error('Error al crear usuario:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudo crear el usuario. Por favor, verifique los datos e intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Actualizar un usuario existente
  actualizar: async (datosUsuario) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.patch('/usuarios', datosUsuario, {
          timeout: 15000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      const errorMessage = formatErrorMessage(
        error, 
        'No se pudo actualizar el usuario. Por favor, verifique los datos e intente nuevamente.'
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Eliminar un usuario
  eliminar: async (id) => {
    try {
      return await withRetry(async () => {
        const respuesta = await clienteApi.delete('/usuarios', { 
          data: { ID_EMPLEADO: id },
          timeout: 10000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      const errorMessage = formatErrorMessage(
        error, 
        `No se pudo eliminar el usuario #${id}. Por favor, intente nuevamente.`
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  },

  // Clonar un usuario (crear uno nuevo basado en uno existente)
  clonar: async (id) => {
    try {
      return await withRetry(async () => {
        // Primero obtener los datos del usuario original
        const usuarioOriginal = await clienteApi.get(`/usuarios/get/${id}`, {
          timeout: 10000
        });
        
        let datosUsuario;
        if (Array.isArray(usuarioOriginal.data) && usuarioOriginal.data.length > 0) {
          datosUsuario = usuarioOriginal.data[0];
        } else if (typeof usuarioOriginal.data === 'object') {
          datosUsuario = usuarioOriginal.data;
        } else {
          throw new Error('Formato de datos no esperado');
        }
        
        // Preparar datos para el usuario clonado
        const datosClonado = {
          ...datosUsuario,
          // Remover el ID para que se genere uno nuevo
          ID_EMPLEADO: null,
          // Modificar campos que deben ser únicos
          NOMBRE: `${datosUsuario.NOMBRE} (duplicado)`,
          USUARIO: `${datosUsuario.USUARIO}_copia`,
          EMAIL: datosUsuario.EMAIL ? `copia_${datosUsuario.EMAIL}` : '',
          // Limpiar contraseña para que sea requerida
          PASSWORD: '',
        };
        
        // Crear el usuario clonado
        const respuesta = await clienteApi.put('/usuarios', datosClonado, {
          timeout: 15000
        });
        return respuesta.data;
      });
    } catch (error) {
      console.error(`Error al clonar usuario con ID ${id}:`, error);
      const errorMessage = formatErrorMessage(
        error, 
        `No se pudo clonar el usuario #${id}. Por favor, intente nuevamente.`
      );
      
      const enhancedError = new Error(errorMessage);
      enhancedError.originalError = error;
      enhancedError.isFormatted = true;
      throw enhancedError;
    }
  }
};

export default usuariosService;