import clienteApi from './clienteApi';

const tiposAnalisisService = {
  // Obtener todos los tipos de análisis con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/tiposAnalisis/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener tipos de análisis:', error);
      throw error;
    }
  }
};

export default tiposAnalisisService;