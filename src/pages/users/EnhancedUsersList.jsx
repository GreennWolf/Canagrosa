import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  User,
  Phone,
  AtSign,
  Hash,
  Filter,
  ListFilter,
  AlertCircle,
  Settings,
  Copy,
  Shield
} from 'lucide-react';
import SelectInput from '../../components/common/SelectInput';
import AdvancedUserTable from '../../components/users/AdvancedUserTable';
import { useData } from '../../contexts/DataProvider';
import { debounce } from '../../utils/optimizations';
import { useModal } from '../../contexts/ModalContext';
import usuariosService from '../../services/usuariosService';
import useUserModal from '../../hooks/useUserModal';

const EnhancedUsersList = () => {
  // Referencias
  const usersTableRef = useRef(null);
  const tableContainerRef = useRef(null);
  
  // Estado para la tabla y filtrado
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchCache, setSearchCache] = useState({});
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    NOMBRE: '',
    APELLIDOS: '',
    USUARIO: '',
    EMAIL: '',
    ANULADO: ''
  });
  
  // Referencias para cancelar solicitudes
  const abortControllerRef = useRef(null);
  
  // Opciones para los selectores
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    roles: [],
    emails: []
  });
  
  // Obtener funciones del contexto modal
  const { openModal, closeModal } = useModal();
  
  // Controlador de modales para usuarios
  const modalController = useUserModal({
    onUserUpdated: (user, action) => {
      console.log(`Usuario ${action}:`, user);
      // Refrescar la lista después de cualquier operación CRUD
      fetchUsers(true);
    }
  });
  
  // Función para cargar usuarios (primera página) - sin dependencias de filters
  const fetchUsers = useCallback(async (forceRefresh = false, currentFilters = null) => {
    // Usar filtros pasados como parámetro o los del estado
    const filtersToUse = currentFilters || filters;
    
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
      const activeFilters = Object.entries(filtersToUse).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      // Incluir parámetros de paginación para la primera página
      const PAGE_SIZE = 20; // Reducir el tamaño de página para mejor lazy loading
      const queryParams = {
        ...activeFilters,
        page: 1,
        limit: PAGE_SIZE
      };
      
      console.log('🔍 Cargando primera página de usuarios:', queryParams);
      console.log('🔍 Filtros activos:', activeFilters);
      
      const response = await usuariosService.obtenerTodos(queryParams, signal);
      
      // Comprobar si la operación fue cancelada
      if (signal.aborted) {
        console.log('Operación cancelada, no actualizando estado');
        return;
      }
      
      // Procesar datos recibidos
      const usuariosData = response || [];
      
      console.log(`Recibidos ${usuariosData.length} usuarios en la primera página`);
      
      // Establecer datos iniciales (solo primera página)
      setUsers(usuariosData);
      setFilteredUsers(usuariosData);
      
      setPagination(prev => ({
        ...prev,
        page: 1,
        pageSize: PAGE_SIZE,
        totalItems: usuariosData.length,
        // Hay más datos si recibimos exactamente el tamaño de página solicitado
        hasMore: usuariosData.length === PAGE_SIZE
      }));
      
      // Limpiar errores previos
      setError(null);
      
      // Actualizar opciones para filtros siempre en la primera carga
      updateFilterOptions(usuariosData);
    } catch (err) {
      // No mostrar error si la petición fue cancelada intencionalmente
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        console.log('Operación cancelada por el usuario');
        return;
      }
      
      console.error('Error fetching users:', err);
      
      // Usar mensaje formateado si está disponible
      setError(err.isFormatted ? err.message : 
        'No se pudieron cargar los usuarios. Por favor, intente de nuevo más tarde.');
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [lastFetchTime]);

  // Función para cargar más usuarios (paginación incremental)
  const loadNextPage = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) {
      console.log('No se puede cargar más datos:', { isLoadingMore, hasMore: pagination.hasMore });
      return;
    }
    
    setIsLoadingMore(true);
    const nextPage = pagination.page + 1;
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const queryParams = {
        ...activeFilters,
        page: nextPage,
        limit: pagination.pageSize
      };
      
      console.log(`🔍 Cargando página ${nextPage} de usuarios:`, queryParams);
      
      const response = await usuariosService.obtenerTodos(queryParams);
      const newUsers = response || [];
      
      console.log(`Recibidos ${newUsers.length} usuarios adicionales en página ${nextPage}`);
      
      if (newUsers.length > 0) {
        setUsers(prevUsers => [...prevUsers, ...newUsers]);
        setFilteredUsers(prevFiltered => [...prevFiltered, ...newUsers]);
        
        setPagination(prev => ({
          ...prev,
          page: nextPage,
          totalItems: prev.totalItems + newUsers.length,
          hasMore: newUsers.length === prev.pageSize
        }));
      } else {
        // No hay más datos disponibles
        setPagination(prev => ({ ...prev, hasMore: false }));
      }
    } catch (err) {
      console.error('Error loading next page:', err);
      setError('Error al cargar más usuarios');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, pagination, filters]);

  // Función para actualizar opciones de filtros
  const updateFilterOptions = useCallback((userData) => {
    const usernames = [...new Set(userData.map(user => user.USUARIO).filter(Boolean))];
    const emails = [...new Set(userData.map(user => user.EMAIL).filter(Boolean))];
    
    setFilterOptions({
      users: userData,
      usernames: usernames.map(username => ({ value: username, label: username })),
      emails: emails.map(email => ({ value: email, label: email }))
    });
  }, []);

  // Función para manejar cambios en filtros
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      fetchUsers(true);
    }
  }, [isInitialized]); // Eliminar fetchUsers de las dependencias

  // Efecto para aplicar filtros con debounce - solo cuando cambian los filtros
  useEffect(() => {
    if (isInitialized) {
      const debouncedFetch = debounce(() => {
        fetchUsers(true, filters);
      }, 300);
      
      debouncedFetch();
      
      return () => {
        debouncedFetch.cancel && debouncedFetch.cancel();
      };
    }
  }, [filters, isInitialized]); // Removemos fetchUsers de las dependencias

  // Función para manejar selección de usuario
  const handleUserSelect = useCallback((user) => {
    setSelectedUser(user);
  }, []);

  // Función para manejar doble clic en usuario
  const handleUserDoubleClick = useCallback((user) => {
    modalController.openUserDetail(user);
  }, [modalController]);

  // Función para refrescar datos
  const handleRefresh = useCallback(() => {
    fetchUsers(true, filters);
  }, [fetchUsers, filters]);

  // Función para resetear configuración de tabla
  const resetTableConfig = useCallback(() => {
    if (usersTableRef.current && usersTableRef.current.resetColumnConfig) {
      usersTableRef.current.resetColumnConfig();
    }
  }, []);

  // Funciones para los botones usando el hook useUserModal
  const handleCreateUser = () => {
    modalController.openUserCreate();
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    modalController.openUserEdit(selectedUser);
  };

  const handleCloneUser = () => {
    if (!selectedUser) return;
    modalController.openUserClone(selectedUser);
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    modalController.openUserDelete(selectedUser);
  };

  // Opciones para selectores de filtros
  const estadoOptions = [
    { value: '', label: 'Todos los estados' },
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
            onClick={handleCreateUser}
            className="flex items-center px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
            title="Nuevo usuario"
          >
            <Plus size={14} className="mr-1" />
            <span>Nuevo usuario</span>
          </button>
          
          <button 
            onClick={handleEditUser}
            disabled={!selectedUser}
            title="Editar usuario"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedUser 
                ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Edit size={14} className="mr-1" />
            <span>Editar</span>
          </button>
          
          <button 
            onClick={handleCloneUser}
            disabled={!selectedUser}
            title="Clonar usuario"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedUser 
                ? "bg-purple-600 text-white hover:bg-purple-700 cursor-pointer" 
                : "bg-gray-600 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
          >
            <Copy size={14} className="mr-1" />
            <span>Clonar</span>
          </button>
          
          <button 
            onClick={handleDeleteUser}
            disabled={!selectedUser}
            title="Eliminar usuario"
            className={`flex items-center px-3 py-1.5 text-xs rounded ${
              selectedUser 
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
          <Filter size={14} className="mr-1" />
          <span>Filtros</span>
        </button>
        
        <button 
          onClick={handleRefresh}
          className="flex items-center px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
          title="Refrescar usuarios"
        >
          <RefreshCw size={14} className="mr-1" />
          <span>Refrescar</span>
        </button>
        
        <button 
          onClick={resetTableConfig}
          className="flex items-center px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 cursor-pointer"
          title="Resetear configuración de tabla"
        >
          <Settings size={14} className="mr-1" />
          <span>Reset</span>
        </button>
        
        {/* Información del usuario seleccionado */}
        {selectedUser && (
          <div className="ml-auto text-xs text-gray-200 bg-slate-700 px-2 py-1 rounded">
            Seleccionado: {selectedUser.NOMBRE || ''} {selectedUser.APELLIDOS || ''}
          </div>
        )}
      </div>

      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-md p-3 mb-1 space-y-2">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                value={filters.NOMBRE}
                onChange={(e) => handleFilterChange('NOMBRE', e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-700 mb-1">Apellidos</label>
              <input
                type="text"
                value={filters.APELLIDOS}
                onChange={(e) => handleFilterChange('APELLIDOS', e.target.value)}
                placeholder="Buscar por apellidos..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-700 mb-1">Usuario</label>
              <input
                type="text"
                value={filters.USUARIO}
                onChange={(e) => handleFilterChange('USUARIO', e.target.value)}
                placeholder="Buscar por usuario..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex-1 min-w-40">
              <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
              <input
                type="text"
                value={filters.EMAIL}
                onChange={(e) => handleFilterChange('EMAIL', e.target.value)}
                placeholder="Buscar por email..."
                className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="w-32">
              <label className="block text-xs font-medium text-gray-700 mb-1">Estado</label>
              <SelectInput
                value={filters.ANULADO}
                onChange={(value) => handleFilterChange('ANULADO', value)}
                options={estadoOptions}
                placeholder="Todos"
                className="text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm mb-1 flex items-center">
          <AlertCircle size={16} className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div ref={tableContainerRef} className="flex-1 overflow-hidden">
        <AdvancedUserTable
          ref={usersTableRef}
          data={filteredUsers}
          loadNextPage={loadNextPage}
          hasMoreData={pagination.hasMore}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          onRowSelect={handleUserSelect}
          onRowDoubleClick={handleUserDoubleClick}
          emptyMessage="No hay usuarios disponibles"
          tableId="users-table"
        />
      </div>
    </div>
  );
};

export default EnhancedUsersList;