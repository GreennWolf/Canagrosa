import clienteApi from './clienteApi';

const centrosService = {
  // Obtener todos los centros con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/centros/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener centros:', error);
      throw error;
    }
  }
};

export default centrosService;