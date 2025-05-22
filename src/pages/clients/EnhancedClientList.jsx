import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Building,
  Phone,
  AtSign,
  Hash,
  Filter,
  ListFilter,
  AlertCircle,
  Settings,
  Copy
} from 'lucide-react';
import SelectInput from '../../components/common/SelectInput';
import AdvancedClientTable from '../../components/clients/AdvancedClientTable';
import { useData } from '../../contexts/DataProvider';
import { debounce } from '../../utils/optimizations';
import { useModal } from '../../contexts/ModalContext';
import clientesService from '../../services/clientesService';
import useClientModal from '../../hooks/useClientModal';
import ClientForm from '../../components/clients/ClientForm';

const EnhancedClientList = () => {
  // Hooks de navegación
  const location = useLocation();
  const navigate = useNavigate();
  
  // Referencias
  const clientsTableRef = useRef(null);
  const tableContainerRef = useRef(null);
  
  // Estado para la tabla y filtrado
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    hasMore: false
  });
  
  // Estado para UI
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchCache, setSearchCache] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    NOMBRE: '',
    CIF: '',
    TELEFONO: '',
    EMAIL: '',
    ANULADO: '',
    FACTURA_DETERMINACIONES: '',
    EADS: '',
    AIRBUS: '',
    IBERIA: '',
    AGROALIMENTARIO: '',
    EXTRANJERO: '',
    INTRA: '',
    CON_ADJUNTOS: ''
  });
  
  // Referencias para cancelar solicitudes
  const abortControllerRef = useRef(null);
  
  // Opciones para los selectores
  const [filterOptions, setFilterOptions] = useState({
    clients: [],
    cifs: [],
    phones: [],
    emails: []
  });
  
  // Obtener funciones del contexto modal
  const { openModal, closeModal } = useModal();
  
  // Hook para modales de clientes
  const { openClientCreate } = useClientModal({
    onClientUpdated: () => {
      fetchClients(true); // Recargar la lista cuando se actualice un cliente
    }
  });
  
  // Los AbortController se manejan directamente en cada función para evitar dependencias circulares
  
  // Función para cargar clientes (primera página)
  const fetchClients = useCallback(async (forceRefresh = false) => {
    // Evitar múltiples solicitudes en poco tiempo (<500ms)
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 500) {
      return;
    }
    setLastFetchTime(now);
    
    // Preparar estado de carga
    setIsLoading(true);
    setError(null);
    setPagination(prev => ({ ...prev, page: 1 }));
    
    // Cancelar solicitudes pendientes
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // NO usar caché para la primera carga, siempre ir al servidor para lazy loading correcto
      
      // Incluir parámetros de paginación para la primera página
      const PAGE_SIZE = 20; // Reducir el tamaño de página para mejor lazy loading
      const queryParams = {
        ...activeFilters,
        page: 1,
        limit: PAGE_SIZE
      };
      
      console.log('🔍 Cargando primera página de clientes:', queryParams);
      console.log('🔍 Filtros activos:', activeFilters);
      
      const response = await clientesService.obtenerTodos(queryParams, signal);
      
      // Comprobar si la operación fue cancelada
      if (signal.aborted) {
        console.log('Operación cancelada, no actualizando estado');
        return;
      }
      
      // Procesar datos recibidos
      const clientesData = response || [];
      
      console.log(`Recibidos ${clientesData.length} clientes en la primera página`);
      
      // Establecer datos iniciales (solo primera página)
      setClients(clientesData);
      setFilteredClients(clientesData);
      
      setPagination(prev => ({
        ...prev,
        page: 1,
        pageSize: PAGE_SIZE,
        totalItems: clientesData.length,
        // Hay más datos si recibimos exactamente el tamaño de página solicitado
        hasMore: clientesData.length === PAGE_SIZE
      }));
      
      // Limpiar errores previos
      setError(null);
      
      // Actualizar opciones para filtros siempre en la primera carga
      // Las opciones se basan solo en los datos visibles para no confundir al usuario
      updateFilterOptions(clientesData);
    } catch (err) {
      // No mostrar error si la petición fue cancelada intencionalmente
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Operación cancelada por el usuario');
        return;
      }
      
      console.error('Error fetching clients:', err);
      
      // Usar mensaje formateado si está disponible
      setError(err.isFormatted ? err.message : 
        'No se pudieron cargar los clientes. Por favor, intente de nuevo más tarde.');
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [filters, lastFetchTime]);
  
  // Función para cargar más clientes (paginación incremental)
  const loadMoreClients = useCallback(async () => {
    // Si no hay más datos o ya está cargando, no hacemos nada
    if (!pagination.hasMore || isLoadingMore) {
      console.log('No se puede cargar más:', { hasMore: pagination.hasMore, isLoadingMore });
      return false;
    }
    
    // Preparar estado
    setIsLoadingMore(true);
    
    // Crear un nuevo AbortController solo para esta operación de loadMore
    const abortController = new AbortController();
    const signal = abortController.signal;
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Incluir parámetros de paginación para la siguiente página
      const nextPage = pagination.page + 1;
      const queryParams = {
        ...activeFilters,
        page: nextPage,
        limit: pagination.pageSize
      };
      
      console.log(`Cargando página ${nextPage} de clientes:`, queryParams);
      
      const response = await clientesService.obtenerTodos(queryParams, signal);
      
      // Comprobar si la operación fue cancelada
      if (signal.aborted) {
        console.log('Operación de carga adicional cancelada');
        return false;
      }
      
      // Procesar datos adicionales
      const newClientsData = response || [];
      
      console.log(`Recibidos ${newClientsData.length} clientes en la página ${nextPage}`);
      
      if (newClientsData.length > 0) {
        // Combinar con datos existentes evitando duplicados
        setClients(prevData => {
          const newData = [...prevData];
          
          // Usar un Set para mantener IDs únicos
          const existingIds = new Set(prevData.map(client => client.ID_CLIENTE));
          
          // Añadir solo elementos nuevos
          newClientsData.forEach(client => {
            if (!existingIds.has(client.ID_CLIENTE)) {
              newData.push(client);
            }
          });
          
          console.log(`Total después de agregar página ${nextPage}:`, newData.length);
          return newData;
        });
        
        // Actualizar también filteredClients manteniendo la coherencia
        setFilteredClients(prevData => {
          const newData = [...prevData];
          const existingIds = new Set(prevData.map(client => client.ID_CLIENTE));
          
          newClientsData.forEach(client => {
            if (!existingIds.has(client.ID_CLIENTE)) {
              newData.push(client);
            }
          });
          
          return newData;
        });
        
        // Actualizar paginación
        setPagination(prev => ({
          ...prev,
          page: nextPage,
          totalItems: prev.totalItems + newClientsData.length,
          // Hay más datos si recibimos exactamente el tamaño de página solicitado
          hasMore: newClientsData.length === pagination.pageSize
        }));
        
        return true; // Indicar éxito
      } else {
        // No hay más datos
        console.log('No hay más clientes para cargar');
        setPagination(prev => ({
          ...prev,
          hasMore: false
        }));
        
        return false; // Indicar que no hay más datos
      }
    } catch (err) {
      // No mostrar error si la petición fue cancelada
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Operación cancelada por el usuario');
        return false;
      }
      
      console.error('Error loading more clients:', err);
      
      // No interrumpimos la experiencia con un error en carga incremental
      // Solo mostramos en consola y retornamos false
      return false;
    } finally {
      if (!signal.aborted) {
        setIsLoadingMore(false);
      }
    }
  }, [pagination, filters, isLoadingMore]);
  
  // Actualizar opciones para los filtros
  const updateFilterOptions = useCallback((clientsData) => {
    const clientOptions = clientsData.map(client => ({
      value: client.NOMBRE, // Usar el NOMBRE como value para la búsqueda
      label: client.NOMBRE
    }));
    
    const cifOptions = [...new Set(clientsData
      .filter(client => client.CIF)
      .map(client => client.CIF))]
      .map(cif => ({ value: cif, label: cif }));
    
    const phoneOptions = [...new Set(clientsData
      .filter(client => client.TELEFONO)
      .map(client => client.TELEFONO))]
      .map(phone => ({ value: phone, label: phone }));
    
    const emailOptions = [...new Set(clientsData
      .filter(client => client.EMAIL)
      .map(client => client.EMAIL))]
      .map(email => ({ value: email, label: email }));
    
    setFilterOptions({
      clients: clientOptions,
      cifs: cifOptions,
      phones: phoneOptions,
      emails: emailOptions
    });
  }, []);
  
  // Esta es una función temporal que será reemplazada en un useEffect posterior
  const handleClientUpdated = useCallback((client, action) => {
    // Actualizar la lista según la acción realizada
    if (action === 'delete') {
      setClients(prev => prev.filter(c => c.ID_CLIENTE !== client.ID_CLIENTE));
      setFilteredClients(prev => prev.filter(c => c.ID_CLIENTE !== client.ID_CLIENTE));
      if (selectedClient && selectedClient.ID_CLIENTE === client.ID_CLIENTE) {
        setSelectedClient(null);
      }
    }
    // La parte de "else" que llama a fetchClients se manejará después
  }, [selectedClient]);
  
  // La búsqueda ahora siempre se hace en el servidor para mantener el lazy loading correcto
  // No necesitamos búsqueda local ya que todo se maneja con paginación del servidor
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Para checkboxes
    if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        [name]: checked ? '1' : ''
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      NOMBRE: '',
      CIF: '',
      TELEFONO: '',
      EMAIL: '',
      ANULADO: '',
      FACTURA_DETERMINACIONES: '',
      EADS: '',
      AIRBUS: '',
      IBERIA: '',
      AGROALIMENTARIO: '',
      EXTRANJERO: '',
      INTRA: '',
      CON_ADJUNTOS: ''
    });
    // No manipular filteredClients directamente, dejar que el useEffect maneje la recarga
  };
  
  // Aplicar filtros cuando cambian - siempre recargar desde la API para mantener lazy loading
  useEffect(() => {
    // Solo aplicar filtros después de la inicialización
    if (!isInitialized) return;
    
    // Verificar si hay algún filtro activo
    const hasAnyFilter = Object.values(filters).some(value => value !== '');
    
    // Usar un timeout para evitar múltiples llamadas cuando el usuario está escribiendo
    const timeoutId = setTimeout(() => {
      fetchClients(true); // Recargar desde la API tanto con filtros como sin filtros
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [filters, isInitialized]); // fetchClients se omite intencionalmente para evitar bucles
  
  // Cargar clientes al montar el componente (solo una vez)
  useEffect(() => {
    const loadInitialData = async () => {
      await fetchClients();
      setIsInitialized(true); // Marcar como inicializado después de la primera carga
    };
    
    loadInitialData();
    
    // Limpiar al desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Detectar parámetros URL para abrir modales automáticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const modalParam = urlParams.get('modal');
    
    if (modalParam === 'nuevo' && isInitialized) {
      // Abrir modal de nuevo cliente
      openClientCreate();
      
      // Limpiar el parámetro URL sin recargar la página
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete('modal');
      navigate(newUrl.pathname + newUrl.search, { replace: true });
    }
  }, [location.search, isInitialized, openClientCreate, navigate]);
  
  // Crear referencia para la función completa de handleClientUpdated que incluye fetchClients
  const realHandleClientUpdated = useCallback((client, action) => {
    // Actualizar la lista según la acción realizada
    if (action === 'delete') {
      setClients(prev => prev.filter(c => c.ID_CLIENTE !== client.ID_CLIENTE));
      setFilteredClients(prev => prev.filter(c => c.ID_CLIENTE !== client.ID_CLIENTE));
      if (selectedClient && selectedClient.ID_CLIENTE === client.ID_CLIENTE) {
        setSelectedClient(null);
      }
    } else {
      // Para create y update, refrescar la lista completa
      fetchClients(true);
    }
  }, [selectedClient, fetchClients]);
  
  // Creamos el controlador de modales una vez que todas las funciones están definidas
  const modalController = useClientModal({
    onClientUpdated: realHandleClientUpdated
    // Eliminamos el onStateChange para evitar re-renderizados innecesarios
  });
  
  // Opciones para los filtros
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: '0', label: 'Activos' },
    { value: '1', label: 'Anulados' }
  ];
  
  return (
    <div className="h-full flex flex-col overflow-hidden"
         style={{ height: 'calc(100vh - 120px)' }}>
      {/* Barra de herramientas */}
      <div className="bg-slate-800 shadow rounded-md p-2 flex flex-wrap items-center gap-2 mb-1">
        <div className="flex items-center space-x-2">
          <button 
            onClick={modalController.openClientCreate}
            className="flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            title="Nuevo cliente"
          >
            <Plus size={14} className="mr-1" />
            <span>Nuevo cliente</span>
          </button>
          
          <button 
            onClick={() => {
              if (selectedClient) {
                modalController.openClientEdit(selectedClient);
              }
            }}
            disabled={!selectedClient}
            title="Editar cliente"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedClient 
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Edit size={14} className="mr-1" />
            <span>Editar</span>
          </button>
          
          <button 
            onClick={() => {
              if (selectedClient) {
                modalController.openClientClone(selectedClient);
              }
            }}
            disabled={!selectedClient}
            title="Clonar cliente"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedClient 
                ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Copy size={14} className="mr-1" />
            <span>Clonar</span>
          </button>
          
          <button 
            onClick={() => {
              if (selectedClient) {
                modalController.openClientDelete(selectedClient);
              }
            }}
            disabled={!selectedClient}
            title="Eliminar cliente"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedClient 
                ? "bg-red-600 text-white hover:bg-red-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Trash2 size={14} className="mr-1" />
            <span>Eliminar</span>
          </button>
        </div>
        
        <div className="h-5 border-l border-gray-500 mx-0.5"></div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 cursor-pointer"
          title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Filter size={14} />
          <span className="hidden sm:inline ml-1">{showFilters ? 'Ocultar filtros' : 'Filtros'}</span>
        </button>
        
        <button
          onClick={() => {
            // Resetear a primera página y recargar
            setPagination(prev => ({ ...prev, page: 1 }));
            
            // Refrescar datos
            fetchClients(true);
            
            // Resetear la tabla a su posición inicial
            if (clientsTableRef.current) {
              clientsTableRef.current.scrollToTop();
            }
          }}
          className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
          title="Actualizar datos"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline ml-1">Actualizar</span>
        </button>
        
        <button
          onClick={() => {
            if (clientsTableRef.current) {
              clientsTableRef.current.resetColumnConfig();
            }
            openModal('configInfo', {
              title: 'Configuración restablecida',
              size: 'sm',
              content: (
                <div className="p-4">
                  <p className="text-sm text-gray-700">
                    La configuración de columnas ha sido restablecida a sus valores predeterminados.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => closeModal('configInfo')}
                      className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm cursor-pointer"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              )
            });
          }}
          className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer"
          title="Restablecer configuración de columnas"
        >
          <Settings size={14} />
          <span className="hidden sm:inline ml-1">Restablecer</span>
        </button>
        
        <div className="flex-grow"></div>
        
        <div className="w-48 sm:w-64">
          <SelectInput
            options={filterOptions.clients}
            value={filters.NOMBRE}
            onChange={handleFilterChange}
            placeholder="Buscar cliente..."
            name="NOMBRE"
            id="search-nombre"
            className="bg-slate-700 border-slate-600"
            icon={<Search size={14} className="text-gray-400" />}
          />
        </div>
      </div>
      
      {/* Panel de filtros colapsable */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-md p-2 mb-1 text-xs">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center text-xs font-medium text-gray-800">
              <ListFilter size={14} className="mr-1" />
              Filtros de búsqueda
            </div>
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Nombre
              </label>
              <SelectInput
                options={filterOptions.clients}
                value={filters.NOMBRE}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre"
                name="NOMBRE"
                id="filter-nombre"
                icon={<Building size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                CIF/NIF
              </label>
              <SelectInput
                options={filterOptions.cifs}
                value={filters.CIF}
                onChange={handleFilterChange}
                placeholder="Buscar por CIF/NIF"
                name="CIF"
                id="filter-cif"
                icon={<Hash size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Teléfono
              </label>
              <SelectInput
                options={filterOptions.phones}
                value={filters.TELEFONO}
                onChange={handleFilterChange}
                placeholder="Buscar por teléfono"
                name="TELEFONO"
                id="filter-telefono"
                icon={<Phone size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Email
              </label>
              <SelectInput
                options={filterOptions.emails}
                value={filters.EMAIL}
                onChange={handleFilterChange}
                placeholder="Buscar por email"
                name="EMAIL"
                id="filter-email"
                icon={<AtSign size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Estado
              </label>
              <SelectInput
                options={statusOptions}
                value={filters.ANULADO}
                onChange={handleFilterChange}
                placeholder="Seleccionar estado"
                name="ANULADO"
                id="filter-anulado"
              />
            </div>
          </div>
          
          {/* Sección de filtros por sectores y características */}
          <div className="border-t border-gray-200 mt-2 pt-2">
            <label className="block text-xs text-gray-700 mb-1">
              Filtrar por Sectores y Características
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-factura-determinaciones"
                  name="FACTURA_DETERMINACIONES"
                  checked={filters.FACTURA_DETERMINACIONES === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-factura-determinaciones" className="text-xs text-gray-700">
                  Factura por determinaciones
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-aeronautico"
                  name="EADS"
                  checked={filters.EADS === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-aeronautico" className="text-xs text-gray-700">
                  Aeronáutico
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-airbus"
                  name="AIRBUS"
                  checked={filters.AIRBUS === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-airbus" className="text-xs text-gray-700">
                  Airbus
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-iberia"
                  name="IBERIA"
                  checked={filters.IBERIA === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-iberia" className="text-xs text-gray-700">
                  Iberia
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-agroalimentario"
                  name="AGROALIMENTARIO"
                  checked={filters.AGROALIMENTARIO === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-agroalimentario" className="text-xs text-gray-700">
                  Agroalimentario
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-extranjero"
                  name="EXTRANJERO"
                  checked={filters.EXTRANJERO === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-extranjero" className="text-xs text-gray-700">
                  Extracomunitario
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-intra"
                  name="INTRA"
                  checked={filters.INTRA === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-intra" className="text-xs text-gray-700">
                  Intracomunitario
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="filter-con-adjuntos"
                  name="CON_ADJUNTOS"
                  checked={filters.CON_ADJUNTOS === '1'}
                  onChange={handleFilterChange}
                  className="h-3 w-3 mr-1"
                />
                <label htmlFor="filter-con-adjuntos" className="text-xs text-gray-700">
                  Con adjuntos 📎
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensaje de error (si existe) */}
      {error && (
        <div className="bg-red-50 p-3 mb-1 rounded-md border border-red-200 text-sm text-red-700 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      
      {/* Tabla de clientes avanzada */}
      <div ref={tableContainerRef} className="flex-grow min-h-0">
        <AdvancedClientTable
          ref={clientsTableRef}
          data={filteredClients}
          isLoading={isLoading && filteredClients.length === 0}
          isLoadingMore={isLoadingMore}
          loadNextPage={loadMoreClients}
          hasMoreData={pagination.hasMore}
          onRowSelect={(client) => {
            setSelectedClient(client);
          }}
          onRowDoubleClick={(client) => {
            // Abrir detalles del cliente
            modalController.openClientDetail(client);
          }}
          emptyMessage={
            filters.NOMBRE || filters.CIF || filters.TELEFONO || filters.EMAIL || filters.ANULADO || 
            filters.FACTURA_DETERMINACIONES || filters.EADS || filters.AIRBUS || filters.IBERIA || 
            filters.AGROALIMENTARIO || filters.EXTRANJERO || filters.INTRA || filters.CON_ADJUNTOS
              ? "No hay clientes que coincidan con los filtros" 
              : "No hay clientes disponibles"
          }
        />
      </div>
    </div>
  );
};

export default EnhancedClientList;