import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Building,
  MapPin,
  Phone,
  AtSign,
  Hash,
  Filter,
  CheckCircle,
  XCircle,
  ChevronDown,
  User,
  ListFilter,
  AlertCircle,
  Loader,
  Copy
} from 'lucide-react';
import SelectInput from '../../components/common/SelectInput';
import ClientsTable from '../../components/clients/ClientsTable';
import useOptimizedFilter from '../../hooks/useOptimizedFilter';
import { debounce } from '../../utils/optimizations';
import { useModal } from '../../contexts/ModalContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import clientesService from '../../services/clientesService';
import ClientDetail from '../../components/clients/ClientDetail';
import ClientForm from '../../components/clients/ClientForm';
import ThemeConstants from '../../constants/ThemeConstants';

const ClientList = () => {
  // Referencias
  const clientsTableRef = useRef(null);
  
  // Estado de UI
  const [selectedClient, setSelectedClient] = useState(null);

  // Estado para la lista y filtrado de clientes
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
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
    INTRA: ''
  });
  
  // Opciones para los filtros
  const [filterOptions, setFilterOptions] = useState({
    clients: [],
    cifs: [],
    phones: [],
    emails: []
  });
  
  // Obtener funciones del contexto de modales
  const { openModal, closeModal } = useModal();
  
  // Función para cargar clientes (primera página)
  const fetchClients = useCallback(async (forceRefresh = false, signal) => {
    setIsLoading(true);
    setError(null);
    setPage(1); // Resetear a la primera página
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await clientesService.obtenerTodos(activeFilters, signal);
      
      // Comprobar si la operación fue cancelada antes de actualizar el estado
      if (signal && signal.aborted) {
        console.log('Operación cancelada, no actualizando estado');
        return;
      }
      
      // Ajustar para manejar la respuesta directa en vez de response.data
      const clientesData = response || [];
      setClients(clientesData);
      setFilteredClients(clientesData);
      
      // Verificar si hay más datos disponibles (podría implementarse lógica de paginación)
      // Por ejemplo, si el API devuelve un límite fijo de registros, podríamos asumir que hay más
      const PAGE_SIZE = 50; // Número hipotético de resultados por página
      
      // Para testing: simular que siempre hay más datos si tenemos al menos 5 clientes
      setHasMore(clientesData.length >= 5); // Para propósitos de prueba
      setTotalCount(clientesData.length);
      
      // Limpiar cualquier error previo
      setError(null);
      
      // Actualizar opciones para los filtros solo si no hay filtros activos
      if (Object.keys(activeFilters).length === 0) {
        updateFilterOptions(clientesData);
      }
    } catch (err) {
      // No mostrar error si la petición fue cancelada intencionalmente
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Operación cancelada por el usuario');
        return;
      }
      
      console.error('Error fetching clients:', err);
      
      // Usar el mensaje de error formateado si está disponible
      setError(err.isFormatted ? err.message : 
        'No se pudieron cargar los clientes. Por favor, intente de nuevo más tarde.');
    } finally {
      if (!(signal && signal.aborted)) {
        setIsLoading(false);
      }
    }
  }, [filters]);
  
  // Función para cargar más clientes (paginado)
  const loadMoreClients = useCallback(async () => {
    // Si no hay más datos o ya está cargando, no hacemos nada
    if (!hasMore || isLoadingMore) return false;
    
    setIsLoadingMore(true);
    
    try {
      // Preparar filtros activos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Añadir parámetros de paginación
      const nextPage = page + 1;
      const paginationParams = {
        ...activeFilters,
        page: nextPage,
        limit: 50 // Mismo tamaño de página que en fetchClients
      };
      
      // Llamar a la API con parámetros de paginación
      const response = await clientesService.obtenerTodos(paginationParams);
      const newData = response || [];
      
      if (newData.length > 0) {
        // Actualizar estado con los nuevos datos
        setClients(prevClients => [...prevClients, ...newData]);
        setFilteredClients(prevFiltered => [...prevFiltered, ...newData]);
        setPage(nextPage);
        
        // Verificar si hay más datos para cargar
        const PAGE_SIZE = 50;
        setHasMore(newData.length >= PAGE_SIZE);
        
        return true; // Indicar éxito
      } else {
        // No hay más datos
        setHasMore(false);
        return false;
      }
    } catch (err) {
      console.error('Error loading more clients:', err);
      return false; // Indicar fallo
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, page, hasMore, isLoadingMore, clientesService]);
  
  // Actualizar opciones para los filtros
  const updateFilterOptions = useCallback((clientsData) => {
    const clientOptions = clientsData.map(client => ({
      value: client.ID_CLIENTE,
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
  
  // Optimización de filtrado con hook personalizado
  const filterFunctions = useMemo(() => ({
    NOMBRE: (value, filterValue) => 
      !filterValue || (value && value.toLowerCase().includes(filterValue.toLowerCase())),
    CIF: (value, filterValue) => 
      !filterValue || (value && value.toLowerCase().includes(filterValue.toLowerCase())),
    TELEFONO: (value, filterValue) => 
      !filterValue || (value && value.toLowerCase().includes(filterValue.toLowerCase())),
    EMAIL: (value, filterValue) => 
      !filterValue || (value && value.toLowerCase().includes(filterValue.toLowerCase())),
  }), []);
  
  const { 
    filteredData: optimizedFilteredClients, 
    totalCount: optimizedTotalCount, 
    performance 
  } = useOptimizedFilter(
    clients,
    filters,
    filterFunctions,
    { debounceTime: 300, paginate: false }
  );
  
  // Usar datos filtrados optimizados solo cuando hay filtros avanzados
  // De lo contrario usar la búsqueda local que es más rápida
  useEffect(() => {
    const hasComplexFilters = Object.entries(filters).some(([key, value]) => 
      value !== '' && key !== 'NOMBRE'
    );
    
    if (hasComplexFilters) {
      setFilteredClients(optimizedFilteredClients);
    }
  }, [optimizedFilteredClients, filters]);
  
  // Cargar clientes al montar el componente con cancelación de petición
  useEffect(() => {
    const controller = new AbortController();
    fetchClients(false, controller.signal);
    
    return () => {
      controller.abort();
    };
  }, []);
  
  // Búsqueda local para filtrar clientes sin llamar a la API
  const handleLocalSearch = useMemo(() => 
    debounce((searchText) => {
      if (!searchText.trim()) {
        setFilteredClients(clients);
        return;
      }
      
      const searchLower = searchText.toLowerCase();
      const filtered = clients.filter(client => {
        const nameMatch = client.NOMBRE?.toLowerCase().includes(searchLower);
        const cifMatch = client.CIF?.toLowerCase().includes(searchLower);
        const phoneMatch = client.TELEFONO?.toLowerCase().includes(searchLower);
        const emailMatch = client.EMAIL?.toLowerCase().includes(searchLower);
        
        return nameMatch || cifMatch || phoneMatch || emailMatch;
      });
      
      setFilteredClients(filtered);
    }, 300), // 300ms de debounce
  [clients]);
  
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
      INTRA: ''
    });
    setFilteredClients(clients);
  };
  
  // Aplicar filtros
  useEffect(() => {
    // Solo hacer búsqueda local para nombre
    if (filters.NOMBRE && !filters.CIF && !filters.TELEFONO && !filters.EMAIL && !filters.ANULADO && 
        !filters.FACTURA_DETERMINACIONES && !filters.EADS && !filters.AIRBUS && !filters.IBERIA && 
        !filters.AGROALIMENTARIO && !filters.EXTRANJERO && !filters.INTRA) {
      handleLocalSearch(filters.NOMBRE);
    } else {
      // Para otros filtros, recargar desde la API
      fetchClients();
    }
  }, [filters.CIF, filters.TELEFONO, filters.EMAIL, filters.ANULADO, 
      filters.FACTURA_DETERMINACIONES, filters.EADS, filters.AIRBUS, filters.IBERIA, 
      filters.AGROALIMENTARIO, filters.EXTRANJERO, filters.INTRA, fetchClients]);
  
  // Abrir modal para crear cliente
  const handleOpenCreateModal = () => {
    openModal('createClient', {
      title: 'Nuevo Cliente',
      size: '2xl',
      content: (
        <ClientForm 
          onSuccess={() => {
            closeModal('createClient');
            fetchClients(true);
          }}
          onCancel={() => closeModal('createClient')}
        />
      )
    });
  };
  
  // Abrir modal para editar cliente
  const handleOpenEditModal = (client) => {
    if (!client) return;
    
    openModal('editClient', {
      title: `Editar Cliente: ${client.NOMBRE}`,
      size: '2xl',
      content: (
        <ClientForm 
          clientId={client.ID_CLIENTE}
          isEdit={true}
          size="2xl"
          onSuccess={() => {
            closeModal('editClient');
            fetchClients(true);
          }}
          onCancel={() => closeModal('editClient')}
        />
      )
    });
  };
  
  // Abrir modal para ver detalles del cliente
  const handleViewClient = (client) => {
    openModal('viewClient', {
      title: client.NOMBRE,
      size: '2xl',
      content: (
        <ClientDetail 
          clientId={client.ID_CLIENTE} 
          onEdit={() => {
            closeModal('viewClient');
            handleOpenEditModal(client);
          }}
          onClose={() => closeModal('viewClient')}
          onDelete={() => {
            closeModal('viewClient');
            handleOpenDeleteConfirmation(client);
          }}
        />
      )
    });
  };
  
  // Estado para el proceso de eliminación
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Abrir modal de confirmación para eliminar cliente
  const handleOpenDeleteConfirmation = (client) => {
    openModal('deleteClient', {
      title: 'Confirmar eliminación',
      size: 'sm',
      content: (
        <ConfirmDialog
          title="Confirmar eliminación"
          message="¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer."
          type="danger"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isProcessing={isDeleting}
          additionalContent={
            <div className="p-2 mt-2 bg-gray-100 rounded-md border border-gray-200">
              <p className="font-medium text-gray-800">{client.NOMBRE}</p>
              {client.CIF && <p className="text-sm text-gray-600">CIF/NIF: {client.CIF}</p>}
              {client.DIRECCION && <p className="text-sm text-gray-600">{client.DIRECCION}</p>}
            </div>
          }
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await handleDeleteClient(client);
            } finally {
              setIsDeleting(false);
            }
          }}
          onCancel={() => {
            closeModal('deleteClient');
          }}
        />
      )
    });
  };
  
  // Eliminar cliente
  const handleDeleteClient = async (client) => {
    try {
      await clientesService.eliminar(client.ID_CLIENTE);
      closeModal('deleteClient');
      
      // Mostrar mensaje de éxito brevemente
      openModal('successDelete', {
        title: 'Cliente eliminado',
        size: 'sm',
        showCloseButton: false,
        content: (
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-gray-800">El cliente ha sido eliminado correctamente.</p>
          </div>
        )
      });
      
      // Cerrar el mensaje después de un tiempo y actualizar la lista
      setTimeout(() => {
        closeModal('successDelete');
        if (clientsTableRef.current) {
          clientsTableRef.current.setSelectedRow(null); // Limpiar la selección de la tabla
        }
        fetchClients(true); // Actualizar la lista completa
      }, 1500);
      
      return true; // Indicar éxito para el flujo de confirmación
    } catch (error) {
      console.error('Error deleting client:', error);
      
      // Mostrar mensaje de error
      openModal('errorDelete', {
        title: 'Error al eliminar',
        size: 'sm',
        content: (
          <div className="p-4">
            <div className="flex items-start">
              <div className="w-10 h-10 flex-shrink-0 mr-3 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="text-red-500" size={20} />
              </div>
              <div>
                <p className="text-gray-800 font-medium">No se pudo eliminar el cliente</p>
                <p className="text-gray-600 mt-1">
                  {error.isFormatted ? error.message : 
                    error.message || 'Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde.'}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => closeModal('errorDelete')}
                className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
              >
                Aceptar
              </button>
            </div>
          </div>
        )
      });
      
      throw error; // Propagar el error para el flujo de confirmación
    }
  };

  // Abrir modal para clonar cliente
  const handleCloneClient = (client) => {
    if (!client) return;
    
    openModal('cloneClient', {
      title: `Clonar Cliente: ${client.NOMBRE}`,
      size: '2xl',
      content: (
        <ClientForm 
          isClone={true}
          cloneData={client}
          onSuccess={() => {
            closeModal('cloneClient');
            fetchClients(true);
          }}
          onCancel={() => closeModal('cloneClient')}
        />
      )
    });
  };

  // Opciones para los filtros
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: '0', label: 'Activos' },
    { value: '1', label: 'Anulados' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden"
         style={{ height: 'calc(100vh - 120px)' }}>
      {/* Barra de herramientas compacta */}
      <div className="bg-slate-800 shadow rounded-md p-2 flex flex-wrap items-center gap-2 mb-1">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleOpenCreateModal}
            className="flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            title="Nuevo cliente"
          >
            <Plus size={14} className="mr-1" />
            <span>Nuevo cliente</span>
          </button>
          
          <button 
            onClick={() => {
              if (selectedClient) {
                handleOpenEditModal(selectedClient);
              }
            }}
            disabled={!selectedClient}
            title="Editar cliente"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedClient 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Edit size={14} className="mr-1" />
            <span>Editar</span>
          </button>
          
          <button 
            onClick={() => {
              if (selectedClient) {
                handleCloneClient(selectedClient);
              }
            }}
            disabled={!selectedClient}
            title="Clonar cliente"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedClient 
                ? "bg-purple-600 text-white hover:bg-purple-700" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Copy size={14} className="mr-1" />
            <span>Clonar</span>
          </button>
          
          <button 
            onClick={() => {
              if (selectedClient) {
                handleOpenDeleteConfirmation(selectedClient);
              }
            }}
            disabled={!selectedClient}
            title="Eliminar cliente"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedClient 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Trash2 size={14} className="mr-1" />
            <span>Eliminar</span>
          </button>
        </div>
        
        <div className="h-5 border-l border-gray-300 mx-0.5"></div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
          title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Filter size={14} />
          <span className="hidden sm:inline ml-1">{showFilters ? 'Ocultar filtros' : 'Filtros'}</span>
        </button>
        
        <button
          onClick={() => fetchClients(true)}
          className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          title="Actualizar datos"
        >
          <RefreshCw size={14} />
          <span className="hidden sm:inline ml-1">Actualizar</span>
        </button>
        
        <div className="flex-grow"></div>
        
        <div className="relative w-48 sm:w-64">
          <SelectInput
            options={filterOptions.clients}
            value={filters.NOMBRE}
            onChange={handleFilterChange}
            placeholder="Buscar cliente..."
            name="NOMBRE"
            id="search-nombre"
            icon={<Search size={14} className="text-gray-400" />}
            className="text-white bg-slate-700 border-slate-600 placeholder-gray-400 focus:border-blue-500"
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
              className="text-xs text-blue-600 hover:text-blue-800"
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
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
      
      {/* Tabla de clientes (optimizada) */}
      <div className="flex-grow min-h-0">
        <ClientsTable
          ref={clientsTableRef}
          data={filteredClients}
          isLoading={isLoading && filteredClients.length === 0}
          isLoadingMore={isLoadingMore}
          onRowDoubleClick={(client) => {
            // Solo abrir modal de detalles en doble clic
            handleViewClient(client);
          }}
          onRowSelect={(client) => {
            setSelectedClient(client);
          }}
          loadMoreData={loadMoreClients}
          hasMoreData={hasMore}
          emptyMessage={
            filters.NOMBRE || filters.CIF || filters.TELEFONO || filters.EMAIL || filters.ANULADO || 
            filters.FACTURA_DETERMINACIONES || filters.EADS || filters.AIRBUS || filters.IBERIA || 
            filters.AGROALIMENTARIO || filters.EXTRANJERO || filters.INTRA
              ? "No hay clientes que coincidan con los filtros" 
              : "No hay clientes disponibles"
          }
        />
      </div>
      
    </div>
  );
};

export default ClientList;