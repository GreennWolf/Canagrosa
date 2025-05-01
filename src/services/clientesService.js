import clienteApi from './clienteApi';

const clientesService = {
  // Obtener todos los clientes con filtros opcionales
  obtenerTodos: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/clientes/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener clientes:', error);
      throw error;
    }
  },
  
  // Obtener clientes para combo
  obtenerParaCombo: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/clientes/combo', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener clientes para combo:', error);
      throw error;
    }
  },
  
  // Obtener un cliente por ID
  obtenerPorId: async (id) => {
    try {
      const respuesta = await clienteApi.get(`/clientes/get/${id}`);
      return respuesta.data;
    } catch (error) {
      console.error(`Error al obtener cliente con ID ${id}:`, error);
      throw error;
    }
  },
  
  // Crear un nuevo cliente
  crear: async (datosCliente) => {
    try {
      const respuesta = await clienteApi.put('/clientes', datosCliente);
      return respuesta.data;
    } catch (error) {
      console.error('Error al crear cliente:', error);
      throw error;
    }
  },
  
  // Actualizar un cliente existente
  actualizar: async (datosCliente) => {
    try {
      const respuesta = await clienteApi.patch('/clientes', datosCliente);
      return respuesta.data;
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      throw error;
    }
  },
  
  // Eliminar un cliente
  eliminar: async (id) => {
    try {
      const respuesta = await clienteApi.delete('/clientes', { 
        data: { ID_CLIENTE: id } 
      });
      return respuesta.data;
    } catch (error) {
      console.error(`Error al eliminar cliente con ID ${id}:`, error);
      throw error;
    }
  }
};

export default clientesService;