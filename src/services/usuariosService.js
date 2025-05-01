import clienteApi from './clienteApi';

const usuariosService = {
  // Obtener todos los usuarios con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/usuarios/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }
};

export default usuariosService;