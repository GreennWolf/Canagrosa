import clienteApi from './clienteApi';

const entidadesEntregaService = {
  // Obtener todas las entidades de entrega con filtros opcionales
  obtenerTodas: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/entidades_entrega/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener entidades de entrega:', error);
      throw error;
    }
  }
};

export default entidadesEntregaService;