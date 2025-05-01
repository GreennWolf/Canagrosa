import clienteApi from './clienteApi';

const ubicacionesService = {
  // PAÍSES
  obtenerPaises: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/paises/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener países:', error);
      throw error;
    }
  },
  
  // PROVINCIAS
  obtenerProvincias: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/provincias/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      throw error;
    }
  },
  
  // Obtener provincias por país
  obtenerProvinciasPorPais: async (idPais) => {
    try {
      const respuesta = await clienteApi.get('/provincias/list', { 
        params: { PAIS_ID: idPais } 
      });
      return respuesta.data;
    } catch (error) {
      console.error(`Error al obtener provincias del país ${idPais}:`, error);
      throw error;
    }
  },
  
  // MUNICIPIOS
  obtenerMunicipios: async (filtros = {}) => {
    try {
      const respuesta = await clienteApi.get('/municipios/list', { params: filtros });
      return respuesta.data;
    } catch (error) {
      console.error('Error al obtener municipios:', error);
      throw error;
    }
  },
  
  // Obtener municipios por provincia
  obtenerMunicipiosPorProvincia: async (idProvincia) => {
    try {
      const respuesta = await clienteApi.get('/municipios/list', { 
        params: { PROVINCIA_ID: idProvincia } 
      });
      return respuesta.data;
    } catch (error) {
      console.error(`Error al obtener municipios de la provincia ${idProvincia}:`, error);
      throw error;
    }
  }
};

export default ubicacionesService;