import clienteApi from './clienteApi';

const formasPagoService = {
  // Obtener todas las formas de pago con filtros opcionales
  obtenerTodas: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/formasPago/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener formas de pago:', error);
      throw error;
    }
  }
};

export default formasPagoService;