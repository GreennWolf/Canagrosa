import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  User,
  ListFilter,
  Plus,
  Edit,
  Copy,
  Trash2
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';
import { useModal } from '../../contexts/ModalContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import usuariosService from '../../services/usuariosService';
import UserDetail from '../../components/users/UserDetail';
import UserForm from '../../components/users/UserForm';

const UsersList = () => {
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
  
  // Estado para el proceso de eliminación
  const [isDeleting, setIsDeleting] = useState(false);
  
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
  }, [hasMore, isLoadingMore]);
  
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
  
  // Abrir modal para crear usuario
  const handleOpenCreateModal = () => {
    openModal('createUser', {
      title: 'Nuevo Usuario',
      size: '2xl',
      content: (
        <UserForm 
          onSuccess={() => {
            closeModal('createUser');
            fetchUsers(true);
          }}
          onCancel={() => closeModal('createUser')}
        />
      )
    });
  };
  
  // Abrir modal para editar usuario
  const handleOpenEditModal = (user) => {
    if (!user) return;
    
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();
    
    openModal('editUser', {
      title: `Editar Usuario: ${userName}`,
      size: '2xl',
      content: (
        <UserForm 
          userId={user.ID_EMPLEADO}
          isEdit={true}
          onSuccess={() => {
            closeModal('editUser');
            fetchUsers(true);
          }}
          onCancel={() => closeModal('editUser')}
        />
      )
    });
  };
  
  // Abrir modal para clonar usuario
  const handleOpenCloneModal = (user) => {
    if (!user) return;
    
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();
    
    openModal('cloneUser', {
      title: `Clonar Usuario: ${userName}`,
      size: '2xl',
      content: (
        <UserForm 
          isClone={true}
          cloneData={user}
          onSuccess={() => {
            closeModal('cloneUser');
            fetchUsers(true);
          }}
          onCancel={() => closeModal('cloneUser')}
        />
      )
    });
  };
  
  // Abrir modal para ver detalles del usuario
  const handleViewUser = (user) => {
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();
    
    openModal('viewUser', {
      title: userName,
      size: '2xl',
      content: (
        <UserDetail 
          userId={user.ID_EMPLEADO} 
          onEdit={() => {
            closeModal('viewUser');
            handleOpenEditModal(user);
          }}
          onClose={() => closeModal('viewUser')}
          onDelete={() => {
            closeModal('viewUser');
            handleOpenDeleteConfirmation(user);
          }}
          onClone={() => {
            closeModal('viewUser');
            handleOpenCloneModal(user);
          }}
        />
      )
    });
  };
  
  // Abrir modal de confirmación para eliminar usuario
  const handleOpenDeleteConfirmation = (user) => {
    const userName = `${user.NOMBRE || ''} ${user.APELLIDOS || ''}`.trim();
    
    openModal('deleteUser', {
      title: 'Confirmar eliminación',
      size: 'sm',
      content: (
        <ConfirmDialog
          title="Confirmar eliminación"
          message="¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer."
          type="danger"
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          isProcessing={isDeleting}
          additionalContent={
            <div className="p-2 mt-2 bg-gray-100 rounded-md border border-gray-200">
              <p className="font-medium text-gray-800">{userName}</p>
              {user.USUARIO && <p className="text-sm text-gray-600">Usuario: {user.USUARIO}</p>}
              {user.EMAIL && <p className="text-sm text-gray-600">Email: {user.EMAIL}</p>}
              <div className="mt-1 flex items-center">
                <User size={12} className="mr-1 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {user.PER_USUARIOS === 1 && user.PER_ELIMINACION === 1 && user.PER_MODIFICACION === 1
                    ? 'Administrador'
                    : user.PER_MODIFICACION === 1
                    ? 'Editor'
                    : 'Usuario'}
                </span>
              </div>
            </div>
          }
          onConfirm={async () => {
            setIsDeleting(true);
            try {
              await handleDeleteUser(user);
            } finally {
              setIsDeleting(false);
            }
          }}
          onCancel={() => {
            closeModal('deleteUser');
          }}
        />
      )
    });
  };
  
  // Eliminar usuario
  const handleDeleteUser = async (user) => {
    try {
      await usuariosService.eliminar(user.ID_EMPLEADO);
      closeModal('deleteUser');
      
      // Mostrar mensaje de éxito brevemente
      openModal('successDelete', {
        title: 'Usuario eliminado',
        size: 'sm',
        showCloseButton: false,
        content: (
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <p className="text-gray-800">El usuario ha sido eliminado correctamente.</p>
          </div>
        )
      });
      
      // Cerrar el mensaje después de un tiempo y actualizar la lista
      setTimeout(() => {
        closeModal('successDelete');
        if (usersTableRef.current) {
          usersTableRef.current.setSelectedRow(null); // Limpiar la selección de la tabla
        }
        fetchUsers(true); // Actualizar la lista completa
      }, 1500);
      
      return true; // Indicar éxito para el flujo de confirmación
    } catch (error) {
      console.error('Error deleting user:', error);
      
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
                <p className="text-gray-800 font-medium">No se pudo eliminar el usuario</p>
                <p className="text-gray-600 mt-1">
                  {error.isFormatted 
                    ? error.message 
                    : 'Ha ocurrido un error inesperado. Inténtelo de nuevo más tarde.'}
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
      
      throw error; // Re-throw para manejar en el nivel superior si es necesario
    }
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
        <div className="flex items-center space-x-1 justify-end">
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
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(row);
            }}
            className="p-1 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
            title="Editar"
          >
            <Edit size={14} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenCloneModal(row);
            }}
            className="p-1 text-purple-600 hover:text-purple-800 rounded-full hover:bg-purple-100"
            title="Clonar"
          >
            <Copy size={14} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteConfirmation(row);
            }}
            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      width: 'w-32'
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_EMPLEADO', 'NOMBRE', 'APELLIDOS', 'USUARIO', 'EMAIL', 'permission_summary', 'role', 'ANULADO', 'actions'
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
          
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            title="Nuevo usuario"
          >
            <Plus size={14} />
            <span className="hidden sm:inline ml-1">Nuevo</span>
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