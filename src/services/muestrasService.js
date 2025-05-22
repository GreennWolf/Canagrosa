import clienteApi from './clienteApi';

const muestrasService = {
  // Obtener todas las muestras con filtros opcionales
  obtenerTodas: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/muestras/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener muestras:', error);
      throw error;
    }
  },
  
  // Crear una o varias muestras
  crear: async (datosMuestra) => {
    try {
      const respuesta = await clienteApi.post('/muestras', datosMuestra);
      return respuesta.data;
    } catch (error) {
      console.error('Error al crear muestras:', error);
      throw error;
    }
  }
};

export default muestrasService;