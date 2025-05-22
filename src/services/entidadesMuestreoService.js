import clienteApi from './clienteApi';

const entidadesMuestreoService = {
  // Obtener todas las entidades de muestreo con filtros opcionales
  obtenerTodas: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/entidades_muestreo/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener entidades de muestreo:', error);
      throw error;
    }
  }
};

export default entidadesMuestreoService;