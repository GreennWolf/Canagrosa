import clienteApi from './clienteApi';

const tarifasService = {
  // Obtener todas las tarifas con filtros opcionales
  obtenerTodas: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/tarifas/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener tarifas:', error);
      throw error;
    }
  }
};

export default tarifasService;