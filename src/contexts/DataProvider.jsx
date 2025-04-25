import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api/apiClient';

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
      const response = await fetchFunction(params);
      const responseData = response.data || [];
      
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
    return await fetchData('clients', api.clients.getAll, params);
  }, [fetchData]);
  
  const fetchClientsForCombo = useCallback(async (params = {}) => {
    return await fetchData('clients', api.clients.getForCombo, params);
  }, [fetchData]);
  
  const fetchSamples = useCallback(async (params = {}) => {
    return await fetchData('samples', api.samples.getAll, params);
  }, [fetchData]);
  
  const fetchUsers = useCallback(async (params = {}) => {
    return await fetchData('users', api.catalogs.getUsers, params);
  }, [fetchData]);
  
  const fetchSampleTypes = useCallback(async (params = {}) => {
    return await fetchData('sampleTypes', api.catalogs.getSampleTypes, params);
  }, [fetchData]);
  
  const fetchAnalysisTypes = useCallback(async (params = {}) => {
    return await fetchData('analysisTypes', api.catalogs.getAnalysisTypes, params);
  }, [fetchData]);
  
  const fetchBaths = useCallback(async (params = {}) => {
    return await fetchData('baths', api.catalogs.getBaths, params);
  }, [fetchData]);
  
  const fetchCenters = useCallback(async (params = {}) => {
    return await fetchData('centers', api.catalogs.getCenters, params);
  }, [fetchData]);
  
  const fetchSamplingEntities = useCallback(async (params = {}) => {
    return await fetchData('samplingEntities', api.catalogs.getSamplingEntities, params);
  }, [fetchData]);
  
  const fetchDeliveryEntities = useCallback(async (params = {}) => {
    return await fetchData('deliveryEntities', api.catalogs.getDeliveryEntities, params);
  }, [fetchData]);
  
  const fetchFormats = useCallback(async (params = {}) => {
    return await fetchData('formats', api.catalogs.getFormats, params);
  }, [fetchData]);
  
  const fetchCountries = useCallback(async (params = {}) => {
    return await fetchData('countries', api.catalogs.getCountries, params);
  }, [fetchData]);
  
  const fetchProvinces = useCallback(async (params = {}) => {
    return await fetchData('provinces', api.catalogs.getProvinces, params);
  }, [fetchData]);
  
  const fetchMunicipalities = useCallback(async (params = {}) => {
    return await fetchData('municipalities', api.catalogs.getMunicipalities, params);
  }, [fetchData]);
  
  const fetchPaymentMethods = useCallback(async (params = {}) => {
    return await fetchData('paymentMethods', api.catalogs.getPaymentMethods, params);
  }, [fetchData]);
  
  const fetchRates = useCallback(async (params = {}) => {
    return await fetchData('rates', api.catalogs.getRates, params);
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
    
    // Funcion para crear y actualizar recursos
    createOrUpdateResource: async (entityType, data, isUpdate = false) => {
      let result;
      
      try {
        switch(entityType) {
          case 'client':
            result = isUpdate 
              ? await api.clients.update(data)
              : await api.clients.create(data);
            invalidateCache('clients');
            break;
          case 'sample':
            result = await api.samples.create(data);
            invalidateCache('samples');
            break;
          // Añadir más casos según sea necesario
          default:
            throw new Error(`Tipo de entidad desconocido: ${entityType}`);
        }
        
        return { success: true, data: result.data };
      } catch (error) {
        console.error(`Error ${isUpdate ? 'updating' : 'creating'} ${entityType}:`, error);
        return { 
          success: false, 
          error: error.message || `Error al ${isUpdate ? 'actualizar' : 'crear'} ${entityType}`
        };
      }
    },
    
    // Funcion para eliminar recursos
    deleteResource: async (entityType, id) => {
      try {
        let result;
        
        switch(entityType) {
          case 'client':
            result = await api.clients.delete(id);
            invalidateCache('clients');
            break;
          // Añadir más casos según sea necesario
          default:
            throw new Error(`Tipo de entidad desconocido: ${entityType}`);
        }
        
        return { success: true, data: result.data };
      } catch (error) {
        console.error(`Error deleting ${entityType}:`, error);
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