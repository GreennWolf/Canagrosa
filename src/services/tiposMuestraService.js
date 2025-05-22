import clienteApi from './clienteApi';

const tiposMuestraService = {
  // Obtener todos los tipos de muestra con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/tiposMuestra/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener tipos de muestra:', error);
      throw error;
    }
  }
};

export default tiposMuestraService;