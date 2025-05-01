import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import clientesService from '../services/clientesService';
import muestrasService from '../services/muestrasService';
import usuariosService from '../services/usuariosService';
import tiposMuestraService from '../services/tiposMuestraService';
import tiposAnalisisService from '../services/tiposAnalisisService';
import banosService from '../services/banosService';
import centrosService from '../services/centrosService';
import entidadesMuestreoService from '../services/entidadesMuestreoService';
import entidadesEntregaService from '../services/entidadesEntregaService';
import formatosService from '../services/formatosService';
import ubicacionesService from '../services/ubicacionesService';
import formasPagoService from '../services/formasPagoService';
import tarifasService from '../services/tarifasService';

// Contexto para los datos
const DataContext = createContext(null);

// Usar el contexto
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

// Tiempo de caducidad del caché en milisegundos (5 minutos)
const CACHE_EXPIRY = 5 * 60 * 1000;

export const DataProvider = ({ children }) => {
  // Estado para almacenar todas las entidades en caché
  const [dataCache, setDataCache] = useState({
    clients: { data: [], timestamp: null, loading: false, error: null },
    samples: { data: [], timestamp: null, loading: false, error: null },
    users: { data: [], timestamp: null, loading: false, error: null },
    sampleTypes: { data: [], timestamp: null, loading: false, error: null },
    analysisTypes: { data: [], timestamp: null, loading: false, error: null },
    baths: { data: [], timestamp: null, loading: false, error: null },
    centers: { data: [], timestamp: null, loading: false, error: null },
    samplingEntities: { data: [], timestamp: null, loading: false, error: null },
    deliveryEntities: { data: [], timestamp: null, loading: false, error: null },
    formats: { data: [], timestamp: null, loading: false, error: null },
    countries: { data: [], timestamp: null, loading: false, error: null },
    provinces: { data: [], timestamp: null, loading: false, error: null },
    municipalities: { data: [], timestamp: null, loading: false, error: null },
    paymentMethods: { data: [], timestamp: null, loading: false, error: null },
    rates: { data: [], timestamp: null, loading: false, error: null }
  });

  // Función para verificar si los datos en caché están frescos
  const isCacheFresh = useCallback((entityName) => {
    const entity = dataCache[entityName];
    return (
      entity && 
      entity.timestamp && 
      (Date.now() - entity.timestamp) < CACHE_EXPIRY
    );
  }, [dataCache]);

  // Función genérica para obtener datos con caché
  const fetchData = useCallback(async (entityName, fetchFunction, params = {}) => {
    // Si ya hay una solicitud en curso para esta entidad, no iniciar otra
    if (dataCache[entityName].loading) return dataCache[entityName].data;
    
    // Si los datos en caché están frescos, devolverlos sin hacer una nueva llamada
    if (isCacheFresh(entityName)) {
      return dataCache[entityName].data;
    }
    
    // Iniciar la carga
    setDataCache(prev => ({
      ...prev,
      [entityName]: {
        ...prev[entityName],
        loading: true,
        error: null
      }
    }));
    
    try {
      const responseData = await fetchFunction(params);
      
      // Actualizar caché
      setDataCache(prev => ({
        ...prev,
        [entityName]: {
          data: responseData,
          timestamp: Date.now(),
          loading: false,
          error: null
        }
      }));
      
      return responseData;
    } catch (err) {
      console.error(`Error fetching ${entityName}:`, err);
      
      // Actualizar estado de error
      setDataCache(prev => ({
        ...prev,
        [entityName]: {
          ...prev[entityName],
          loading: false,
          error: err.message || `Error al cargar ${entityName}`
        }
      }));
      
      return [];
    }
  }, [dataCache, isCacheFresh]);

  // Funciones específicas para cada tipo de datos
  const fetchClients = useCallback(async (params = {}) => {
    return await fetchData('clients', clientesService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchClientsForCombo = useCallback(async (params = {}) => {
    return await fetchData('clients', clientesService.obtenerParaCombo, params);
  }, [fetchData]);
  
  const fetchSamples = useCallback(async (params = {}) => {
    return await fetchData('samples', muestrasService.obtenerTodas, params);
  }, [fetchData]);
  
  const fetchUsers = useCallback(async (params = {}) => {
    return await fetchData('users', usuariosService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchSampleTypes = useCallback(async (params = {}) => {
    return await fetchData('sampleTypes', tiposMuestraService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchAnalysisTypes = useCallback(async (params = {}) => {
    return await fetchData('analysisTypes', tiposAnalisisService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchBaths = useCallback(async (params = {}) => {
    return await fetchData('baths', banosService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchCenters = useCallback(async (params = {}) => {
    return await fetchData('centers', centrosService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchSamplingEntities = useCallback(async (params = {}) => {
    return await fetchData('samplingEntities', entidadesMuestreoService.obtenerTodas, params);
  }, [fetchData]);
  
  const fetchDeliveryEntities = useCallback(async (params = {}) => {
    return await fetchData('deliveryEntities', entidadesEntregaService.obtenerTodas, params);
  }, [fetchData]);
  
  const fetchFormats = useCallback(async (params = {}) => {
    return await fetchData('formats', formatosService.obtenerTodos, params);
  }, [fetchData]);
  
  const fetchCountries = useCallback(async (params = {}) => {
    return await fetchData('countries', ubicacionesService.obtenerPaises, params);
  }, [fetchData]);
  
  const fetchProvinces = useCallback(async (params = {}) => {
    return await fetchData('provinces', ubicacionesService.obtenerProvincias, params);
  }, [fetchData]);
  
  const fetchMunicipalities = useCallback(async (params = {}) => {
    return await fetchData('municipalities', ubicacionesService.obtenerMunicipios, params);
  }, [fetchData]);
  
  const fetchPaymentMethods = useCallback(async (params = {}) => {
    return await fetchData('paymentMethods', formasPagoService.obtenerTodas, params);
  }, [fetchData]);
  
  const fetchRates = useCallback(async (params = {}) => {
    return await fetchData('rates', tarifasService.obtenerTodas, params);
  }, [fetchData]);
  
  // Función para invalidar el caché de una entidad
  const invalidateCache = useCallback((entityName) => {
    setDataCache(prev => ({
      ...prev,
      [entityName]: {
        ...prev[entityName],
        timestamp: null
      }
    }));
  }, []);
  
  // Función para invalidar todo el caché
  const invalidateAllCache = useCallback(() => {
    Object.keys(dataCache).forEach(key => {
      invalidateCache(key);
    });
  }, [dataCache, invalidateCache]);

  // Exponer estados y funciones
  const value = useMemo(() => ({
    // Estados de carga para cada entidad
    loadingStates: {
      clients: dataCache.clients.loading,
      samples: dataCache.samples.loading,
      users: dataCache.users.loading,
      sampleTypes: dataCache.sampleTypes.loading,
      analysisTypes: dataCache.analysisTypes.loading,
      // ... otros estados de carga
    },
    
    // Estados de error para cada entidad
    errorStates: {
      clients: dataCache.clients.error,
      samples: dataCache.samples.error,
      users: dataCache.users.error,
      sampleTypes: dataCache.sampleTypes.error,
      analysisTypes: dataCache.analysisTypes.error,
      // ... otros estados de error
    },
    
    // Datos para cada entidad
    data: {
      clients: dataCache.clients.data,
      samples: dataCache.samples.data,
      users: dataCache.users.data,
      sampleTypes: dataCache.sampleTypes.data,
      analysisTypes: dataCache.analysisTypes.data,
      baths: dataCache.baths.data,
      centers: dataCache.centers.data,
      samplingEntities: dataCache.samplingEntities.data,
      deliveryEntities: dataCache.deliveryEntities.data,
      formats: dataCache.formats.data,
      countries: dataCache.countries.data,
      provinces: dataCache.provinces.data,
      municipalities: dataCache.municipalities.data,
      paymentMethods: dataCache.paymentMethods.data,
      rates: dataCache.rates.data
    },
    
    // Funciones para obtener datos
    fetchClients,
    fetchClientsForCombo,
    fetchSamples,
    fetchUsers,
    fetchSampleTypes,
    fetchAnalysisTypes,
    fetchBaths,
    fetchCenters,
    fetchSamplingEntities,
    fetchDeliveryEntities,
    fetchFormats,
    fetchCountries, 
    fetchProvinces,
    fetchMunicipalities,
    fetchPaymentMethods,
    fetchRates,
    
    // Funciones para gestionar el caché
    invalidateCache,
    invalidateAllCache,
    
    // Función para crear y actualizar recursos
    createOrUpdateResource: async (entityType, data, isUpdate = false) => {
      let result;
      
      try {
        switch(entityType) {
          case 'client':
            result = isUpdate 
              ? await clientesService.actualizar(data)
              : await clientesService.crear(data);
            invalidateCache('clients');
            break;
          case 'sample':
            result = await muestrasService.crear(data);
            invalidateCache('samples');
            break;
          // Añadir más casos según sea necesario
          default:
            throw new Error(`Tipo de entidad desconocido: ${entityType}`);
        }
        
        return { success: true, data: result };
      } catch (error) {
        console.error(`Error ${isUpdate ? 'actualizando' : 'creando'} ${entityType}:`, error);
        return { 
          success: false, 
          error: error.message || `Error al ${isUpdate ? 'actualizar' : 'crear'} ${entityType}`
        };
      }
    },
    
    // Función para eliminar recursos
    deleteResource: async (entityType, id) => {
      try {
        let result;
        
        switch(entityType) {
          case 'client':
            result = await clientesService.eliminar(id);
            invalidateCache('clients');
            break;
          // Añadir más casos según sea necesario
          default:
            throw new Error(`Tipo de entidad desconocido: ${entityType}`);
        }
        
        return { success: true, data: result };
      } catch (error) {
        console.error(`Error eliminando ${entityType}:`, error);
        return { 
          success: false, 
          error: error.message || `Error al eliminar ${entityType}`
        };
      }
    }
    
  }), [
    dataCache,
    fetchClients,
    fetchClientsForCombo,
    fetchSamples,
    fetchUsers,
    fetchSampleTypes,
    fetchAnalysisTypes,
    fetchBaths,
    fetchCenters,
    fetchSamplingEntities,
    fetchDeliveryEntities,
    fetchFormats,
    fetchCountries,
    fetchProvinces,
    fetchMunicipalities,
    fetchPaymentMethods,
    fetchRates,
    invalidateCache,
    invalidateAllCache
  ]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;