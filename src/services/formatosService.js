import clienteApi from './clienteApi';

const formatosService = {
  // Obtener todos los formatos con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/formatos/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener formatos:', error);
      throw error;
    }
  }
};

export default formatosService;