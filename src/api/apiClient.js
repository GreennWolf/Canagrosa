import axios from 'axios';

// En Vite, las variables de entorno deben comenzar con VITE_ y se acceden usando import.meta.env
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const instance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor for requests
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor for responses
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors globally
    if (error.response && error.response.status === 401) {
      // If not on login page and received 401, redirect to login
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  // Set auth token for requests
  setAuthToken: (token) => {
    if (token) {
      instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete instance.defaults.headers.common['Authorization'];
    }
  },

  // Generic methods
  get: async (url, params = {}) => {
    return await instance.get(url, { params });
  },
  
  post: async (url, data = {}) => {
    return await instance.post(url, data);
  },
  
  put: async (url, data = {}) => {
    return await instance.put(url, data);
  },
  
  patch: async (url, data = {}) => {
    return await instance.patch(url, data);
  },
  
  delete: async (url, data = {}) => {
    return await instance.delete(url, { data });
  },

  // Client specific methods
  clients: {
    getAll: async (filters = {}) => {
      return await instance.get('/clientes/list', { params: filters });
    },
    
    getById: async (id) => {
      return await instance.get(`/clientes/get/${id}`);
    },
    
    getForCombo: async (filters = {}) => {
      return await instance.get('/clientes/combo', { params: filters });
    },
    
    create: async (clientData) => {
      return await instance.put('/clientes', clientData);
    },
    
    update: async (clientData) => {
      return await instance.patch('/clientes', clientData);
    },
    
    delete: async (id) => {
      return await instance.delete('/clientes', { 
        data: { ID_CLIENTE: id } 
      });
    }
  },

  // Sample specific methods
  samples: {
    getAll: async (filters = {}) => {
      return await instance.get('/muestras/list', { params: filters });
    },
    
    create: async (sampleData) => {
      return await instance.post('/muestras', sampleData);
    }
  },

  // Helper methods for catalog/dropdown data
  catalogs: {
    getSampleTypes: async (filters = {}) => {
      return await instance.get('/tiposMuestra/list', { params: filters });
    },
    
    getAnalysisTypes: async (filters = {}) => {
      return await instance.get('/tiposAnalisis/list', { params: filters });
    },
    
    getBaths: async (filters = {}) => {
      return await instance.get('/banos/list', { params: filters });
    },
    
    getCenters: async (filters = {}) => {
      return await instance.get('/centros/list', { params: filters });
    },
    
    getDeliveryEntities: async (filters = {}) => {
      return await instance.get('/entidades_entrega/list', { params: filters });
    },
    
    getSamplingEntities: async (filters = {}) => {
      return await instance.get('/entidades_muestreo/list', { params: filters });
    },
    
    getFormats: async (filters = {}) => {
      return await instance.get('/formatos/list', { params: filters });
    },
    
    getCountries: async (filters = {}) => {
      return await instance.get('/paises/list', { params: filters });
    },
    
    getProvinces: async (filters = {}) => {
      return await instance.get('/provincias/list', { params: filters });
    },
    
    getMunicipalities: async (filters = {}) => {
      return await instance.get('/municipios/list', { params: filters });
    },
    
    getPaymentMethods: async (filters = {}) => {
      return await instance.get('/formasPago/list', { params: filters });
    },
    
    getRates: async (filters = {}) => {
      return await instance.get('/tarifas/list', { params: filters });
    },
    
    getUsers: async (filters = {}) => {
      return await instance.get('/usuarios/list', { params: filters });
    }
  }
};

export default api;