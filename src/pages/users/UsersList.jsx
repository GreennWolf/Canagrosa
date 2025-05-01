import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  RefreshCw,
  AlertCircle,
  UserCircle, 
  Mail,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Pencil,
  Trash,
  User,
  Lock,
  ListFilter,
  Plus
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';
import { useModal } from '../../contexts/ModalContext';
import usuariosService from '../../services/usuariosService';
import ThemeConstants from '../../constants/ThemeConstants';

const UsersList = () => {
  const navigate = useNavigate();
  const usersTableRef = useRef(null);
  
  // Estado para la lista y filtrado de usuarios
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Estado para filtros
  const [filters, setFilters] = useState({
    NOMBRE: '',
    USUARIO: '',
    EMAIL: '',
    ANULADO: ''
  });
  
  // Opciones para los filtros
  const [filterOptions, setFilterOptions] = useState({
    users: [],
    usernames: [],
    emails: []
  });
  
  // Obtener funciones del contexto de modales
  const { openModal, closeModal } = useModal();
  
  // Función para cargar usuarios (primera página)
  const fetchUsers = useCallback(async (forceRefresh = false) => {
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
      
      const response = await usuariosService.obtenerTodos(activeFilters);
      
      // Ajustar para manejar la respuesta directa en vez de response.data
      const usuariosData = response || [];
      setUsers(usuariosData);
      setFilteredUsers(usuariosData);
      setHasMore(false); // Por ahora asumimos que no hay paginación
      setTotalCount(usuariosData.length);
      
      // Actualizar opciones para los filtros solo si no hay filtros activos
      if (Object.keys(activeFilters).length === 0) {
        updateFilterOptions(usuariosData);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudieron cargar los usuarios. Por favor, intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Función para cargar más usuarios (paginado)
  const loadMoreUsers = useCallback(async () => {
    // Si no hay más datos o ya está cargando, no hacemos nada
    if (!hasMore || isLoadingMore) return false;
    
    setIsLoadingMore(true);
    
    try {
      // Por ahora asumimos que no hay paginación en los nuevos servicios
      // En el futuro se podría implementar
      return false;
    } catch (err) {
      console.error('Error loading more users:', err);
      return false; // Indicar fallo
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, page, hasMore, isLoadingMore]);
  
  // Actualizar opciones para los filtros
  const updateFilterOptions = useCallback((usersData) => {
    const userOptions = usersData.map(user => ({
      value: user.ID_EMPLEADO,
      label: `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim()
    }));
    
    const usernameOptions = [...new Set(usersData
      .filter(user => user.USUARIO)
      .map(user => user.USUARIO))]
      .map(username => ({ value: username, label: username }));
    
    const emailOptions = [...new Set(usersData
      .filter(user => user.EMAIL)
      .map(user => user.EMAIL))]
      .map(email => ({ value: email, label: email }));
    
    setFilterOptions({
      users: userOptions,
      usernames: usernameOptions,
      emails: emailOptions
    });
  }, []);
  
  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Búsqueda local para filtrar usuarios sin llamar a la API
  const handleLocalSearch = useCallback((searchText) => {
    if (!searchText.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const searchLower = searchText.toLowerCase();
    const filtered = users.filter(user => {
      const nameMatch = (user.NOMBRE || '').toLowerCase().includes(searchLower);
      const surnameMatch = (user.APELLIDOS || '').toLowerCase().includes(searchLower);
      const usernameMatch = (user.USUARIO || '').toLowerCase().includes(searchLower);
      const emailMatch = (user.EMAIL || '').toLowerCase().includes(searchLower);
      
      return nameMatch || surnameMatch || usernameMatch || emailMatch;
    });
    
    setFilteredUsers(filtered);
  }, [users]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si cambia el filtro de nombre, hacer una búsqueda local
    if (name === 'NOMBRE') {
      handleLocalSearch(value);
    }
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      NOMBRE: '',
      USUARIO: '',
      EMAIL: '',
      ANULADO: ''
    });
    setFilteredUsers(users);
  };
  
  // Ver detalles del usuario
  const handleViewUser = (user) => {
    if (!user) return;
    
    openModal('viewUser', {
      title: `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim(),
      size: 'md',
      content: (
        <div className="p-4">
          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
              <UserCircle size={48} />
            </div>
            <h2 className="text-xl font-semibold text-center">{`${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim()}</h2>
            <div className="text-sm text-gray-500 mt-1 flex items-center">
              <User size={14} className="mr-1" />
              {user.USUARIO || 'Sin usuario'}
            </div>
            {user.EMAIL && (
              <div className="text-sm text-gray-500 mt-1 flex items-center">
                <Mail size={14} className="mr-1" />
                {user.EMAIL}
              </div>
            )}
            <div className="mt-3">
              {user.ANULADO === 1 ? (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  Anulado
                </span>
              ) : (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Activo
                </span>
              )}
            </div>
          </div>
          
          <h3 className="text-sm font-medium mb-2 border-b pb-1">Permisos</h3>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_IMPRESION ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_IMPRESION ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Impresión</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_FACTURACION ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_FACTURACION ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Facturación</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_MODIFICACION ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_MODIFICACION ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Modificación</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_ELIMINACION ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_ELIMINACION ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Eliminación</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_USUARIOS ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_USUARIOS ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Usuarios</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_EDICION ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_EDICION ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Edición</span>
            </div>
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-sm mr-2 flex items-center justify-center ${user.PER_CIERRE ? 'bg-green-500' : 'bg-gray-200'}`}>
                {user.PER_CIERRE ? <CheckCircle size={12} className="text-white" /> : null}
              </div>
              <span className="text-sm">Cierre</span>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={() => closeModal('viewUser')}
              className="px-3 py-1.5 bg-blue-600 rounded text-white hover:bg-blue-700 text-sm"
            >
              Cerrar
            </button>
          </div>
        </div>
      )
    });
  };
  
  // Definición de columnas para la tabla
  const columns = [
    {
      accessor: 'ID_EMPLEADO',
      header: 'ID',
      width: 'w-16'
    },
    {
      accessor: 'NOMBRE',
      header: 'Nombre',
      render: (row) => (
        <div className="flex items-center">
          <UserCircle size={14} className="mr-1 text-gray-400" />
          <span>{row.NOMBRE || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'APELLIDOS',
      header: 'Apellidos',
      render: (row) => <span>{row.APELLIDOS || '-'}</span>
    },
    {
      accessor: 'USUARIO',
      header: 'Usuario',
      render: (row) => (
        <div className="flex items-center">
          <User size={14} className="mr-1 text-gray-400" />
          <span>{row.USUARIO || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'EMAIL',
      header: 'Email',
      render: (row) => (
        <div className="flex items-center">
          <Mail size={14} className="mr-1 text-gray-400" />
          <span>{row.EMAIL || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'permission_summary',
      header: 'Permisos',
      render: (row) => {
        const permissions = [];
        if (row.PER_IMPRESION === 1) permissions.push('Impresión');
        if (row.PER_FACTURACION === 1) permissions.push('Facturación');
        if (row.PER_MODIFICACION === 1) permissions.push('Modificación');
        if (row.PER_ELIMINACION === 1) permissions.push('Eliminación');
        if (row.PER_USUARIOS === 1) permissions.push('Usuarios');
        if (row.PER_EDICION === 1) permissions.push('Edición');
        if (row.PER_CIERRE === 1) permissions.push('Cierre');
        
        return (
          <div className="flex flex-wrap gap-1">
            {permissions.length > 0 ? (
              permissions.map((perm, idx) => (
                <span 
                  key={idx} 
                  className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800"
                >
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-gray-500">Sin permisos</span>
            )}
          </div>
        );
      }
    },
    {
      accessor: 'role',
      header: 'Rol',
      render: (row) => {
        // Determinar el rol basado en los permisos
        let role = 'Usuario';
        let icon = <User size={14} className="mr-1" />;
        let colorClass = 'text-blue-600';
        
        if (row.PER_USUARIOS === 1 && row.PER_ELIMINACION === 1 && row.PER_MODIFICACION === 1) {
          role = 'Administrador';
          icon = <ShieldAlert size={14} className="mr-1" />;
          colorClass = 'text-red-600';
        } else if (row.PER_MODIFICACION === 1) {
          role = 'Editor';
          icon = <ShieldCheck size={14} className="mr-1" />;
          colorClass = 'text-orange-600';
        }
        
        return (
          <div className={`flex items-center ${colorClass}`}>
            {icon}
            <span>{role}</span>
          </div>
        );
      },
      width: 'w-32'
    },
    {
      accessor: 'ANULADO',
      header: 'Estado',
      render: (row) => (
        row.ANULADO === 1 
          ? <div className="flex items-center text-red-600"><XCircle size={14} className="mr-1" />Anulado</div>
          : <div className="flex items-center text-green-600"><CheckCircle size={14} className="mr-1" />Activo</div>
      ),
      width: 'w-28'
    },
    {
      accessor: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center space-x-2 justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(row);
            }}
            className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
            title="Ver detalle"
          >
            <Eye size={14} />
          </button>
        </div>
      ),
      width: 'w-20'
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_EMPLEADO', 'NOMBRE', 'APELLIDOS', 'USUARIO', 'EMAIL', 'permission_summary', 'ANULADO', 'actions'
  ];

  // Opciones para los filtros
  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: '0', label: 'Activos' },
    { value: '1', label: 'Anulados' }
  ];

  return (
    <div className="h-full flex flex-col overflow-y-hidden">
      {/* Barra de herramientas compacta */}
      <div className="bg-white shadow rounded-md p-1 flex flex-wrap items-center gap-1 mb-1">
        <div className="flex items-center space-x-1">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
            title={showFilters ? "Ocultar filtros" : "Mostrar filtros"}
          >
            <Filter size={14} />
            <span className="hidden sm:inline ml-1">{showFilters ? 'Ocultar filtros' : 'Filtros'}</span>
          </button>
          
          <button
            onClick={() => fetchUsers(true)}
            className="flex items-center px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            title="Actualizar datos"
          >
            <RefreshCw size={14} />
            <span className="hidden sm:inline ml-1">Actualizar</span>
          </button>
        </div>
        
        <div className="flex-grow"></div>
        
        <div className="relative w-48 sm:w-64">
          <SelectInput
            options={filterOptions.users}
            value={filters.NOMBRE}
            onChange={handleFilterChange}
            placeholder="Buscar usuario..."
            name="NOMBRE"
            id="search-nombre"
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
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Nombre/Apellidos
              </label>
              <SelectInput
                options={filterOptions.users}
                value={filters.NOMBRE}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre"
                name="NOMBRE"
                id="filter-nombre"
                icon={<User size={12} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Usuario
              </label>
              <SelectInput
                options={filterOptions.usernames}
                value={filters.USUARIO}
                onChange={handleFilterChange}
                placeholder="Buscar por usuario"
                name="USUARIO"
                id="filter-usuario"
                icon={<User size={12} className="text-gray-400" />}
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
                icon={<Mail size={12} className="text-gray-400" />}
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
        </div>
      )}
      
      {/* Mensaje de error (si existe) */}
      {error && (
        <div className="bg-red-50 p-3 mb-1 rounded-md border border-red-200 text-sm text-red-700 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      
      {/* Tabla de usuarios */}
      <div className="flex-grow">
        <CustomizableTable
          ref={usersTableRef}
          data={filteredUsers}
          columns={columns}
          isLoading={isLoading && filteredUsers.length === 0}
          isLoadingMore={isLoadingMore}
          onRowClick={(user) => {
            setSelectedUser(user);
            handleViewUser(user);
          }}
          initialVisibleColumns={defaultVisibleColumns}
          tableId="users-table"
          loadMoreData={loadMoreUsers}
          hasMoreData={hasMore}
          emptyMessage={
            filters.NOMBRE || filters.USUARIO || filters.EMAIL || filters.ANULADO 
              ? "No hay usuarios que coincidan con los filtros" 
              : "No hay usuarios disponibles"
          }
        />
      </div>
      
      {/* Barra de estado inferior con contador */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 text-xs text-gray-500">
        {filteredUsers.length} {filteredUsers.length === 1 ? "usuario" : "usuarios"} {
          totalCount > filteredUsers.length 
            ? `(mostrando ${filteredUsers.length} de ${totalCount} totales)` 
            : ""
        }
      </div>
    </div>
  );
};

export default UsersList;