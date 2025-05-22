import clienteApi from './clienteApi';

const banosService = {
  // Obtener todos los baños con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/banos/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener baños:', error);
      throw error;
    }
  }
};

export default banosService;