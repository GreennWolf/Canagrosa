import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/apiClient';
import { 
  Search, 
  Filter, 
  RefreshCw,
  Download,
  AlertCircle,
  UserCircle, 
  Mail,
  CheckCircle,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Printer,
  FileText,
  Pencil,
  Trash,
  User,
  Lock
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';

const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Estado para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    NOMBRE: '',
    ANULADO: ''
  });
  
  // Estado para datos filtrados
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Definición de columnas disponibles
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
      accessor: 'PER_IMPRESION',
      header: 'Perm. Impresión',
      render: (row) => (
        row.PER_IMPRESION === 1 ? 
          <div className="flex items-center text-green-600">
            <Printer size={14} className="mr-1" />
            <span>Sí</span>
          </div> : 
          <span className="text-gray-500">No</span>
      ),
      width: 'w-36'
    },
    {
      accessor: 'PER_FACTURACION',
      header: 'Perm. Facturación',
      render: (row) => (
        row.PER_FACTURACION === 1 ? 
          <div className="flex items-center text-green-600">
            <FileText size={14} className="mr-1" />
            <span>Sí</span>
          </div> : 
          <span className="text-gray-500">No</span>
      ),
      width: 'w-36'
    },
    {
      accessor: 'PER_MODIFICACION',
      header: 'Perm. Modificación',
      render: (row) => (
        row.PER_MODIFICACION === 1 ? 
          <div className="flex items-center text-green-600">
            <Pencil size={14} className="mr-1" />
            <span>Sí</span>
          </div> : 
          <span className="text-gray-500">No</span>
      ),
      width: 'w-36'
    },
    {
      accessor: 'PER_ELIMINACION',
      header: 'Perm. Eliminación',
      render: (row) => (
        row.PER_ELIMINACION === 1 ? 
          <div className="flex items-center text-green-600">
            <Trash size={14} className="mr-1" />
            <span>Sí</span>
          </div> : 
          <span className="text-gray-500">No</span>
      ),
      width: 'w-36'
    },
    {
      accessor: 'PER_USUARIOS',
      header: 'Perm. Usuarios',
      render: (row) => (
        row.PER_USUARIOS === 1 ? 
          <div className="flex items-center text-green-600">
            <Lock size={14} className="mr-1" />
            <span>Sí</span>
          </div> : 
          <span className="text-gray-500">No</span>
      ),
      width: 'w-36'
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
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_EMPLEADO', 'NOMBRE', 'APELLIDOS', 'USUARIO', 'EMAIL', 'permission_summary', 'ANULADO'
  ];
  
  // Función para cargar usuarios
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Filtrar parámetros vacíos
      const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const response = await api.catalogs.getUsers(activeFilters);
      setUsers(response.data || []);
      setFilteredUsers(response.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('No se pudieron cargar los usuarios. Por favor, intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar usuarios al montar el componente o cuando cambian los filtros
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Aplicar filtros localmente sin llamar a la API
  const applyLocalFilters = useCallback(() => {
    const filtered = users.filter(user => {
      const nameMatch = !filters.NOMBRE || 
        (user.NOMBRE?.toLowerCase().includes(filters.NOMBRE.toLowerCase()) ||
         user.APELLIDOS?.toLowerCase().includes(filters.NOMBRE.toLowerCase()) ||
         user.USUARIO?.toLowerCase().includes(filters.NOMBRE.toLowerCase()));
      
      const statusMatch = filters.ANULADO === '' || 
        user.ANULADO === parseInt(filters.ANULADO);
      
      return nameMatch && statusMatch;
    });
    
    setFilteredUsers(filtered);
  }, [users, filters]);
  
  // Aplicar filtros localmente cuando cambien
  useEffect(() => {
    applyLocalFilters();
  }, [filters, users, applyLocalFilters]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      NOMBRE: '',
      ANULADO: ''
    });
  };
  
  // Ver detalles del usuario - para una aplicación real
  const handleViewUser = (user) => {
    console.log('Ver usuario:', user);
    // En una aplicación real, navegaríamos a una vista de detalle:
    // navigate(`/usuarios/${user.ID_EMPLEADO}`);
  };

  // Preparar opciones para los selectores
  const getUserOptions = () => {
    return users.map(user => ({
      value: user.NOMBRE,
      label: `${user.NOMBRE} ${user.APELLIDOS || ''}`.trim()
    }));
  };

  const statusOptions = [
    { value: '', label: 'Todos' },
    { value: '0', label: 'Activos' },
    { value: '1', label: 'Anulados' }
  ];

  return (
    <div className="space-y-3 h-full flex flex-col">
      {/* Barra de herramientas superior */}
      <div className="bg-white shadow rounded-md p-2 flex flex-wrap gap-2 items-center">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
        >
          <Filter size={16} className="mr-1" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        
        <button
          onClick={fetchUsers}
          className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          title="Actualizar"
        >
          <RefreshCw size={16} className="mr-1" />
          Actualizar
        </button>
        
        <button
          className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          title="Exportar"
        >
          <Download size={16} className="mr-1" />
          Exportar
        </button>
        
        <div className="flex-grow"></div>
        
        <div className="relative w-64">
          <SelectInput
            options={getUserOptions()}
            value={filters.NOMBRE}
            onChange={handleFilterChange}
            placeholder="Buscar usuario..."
            name="NOMBRE"
            id="search-user"
            icon={<Search size={16} className="text-gray-400" />}
          />
        </div>
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-md p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Filtros de búsqueda</h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Nombre/Usuario
              </label>
              <SelectInput
                options={getUserOptions()}
                value={filters.NOMBRE}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre o usuario"
                name="NOMBRE"
                id="filter-nombre"
                icon={<User size={16} className="text-gray-400" />}
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
                id="filter-estado"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      {/* Tabla personalizable */}
      <div className="flex-grow bg-white rounded-md shadow">
        <CustomizableTable
          data={filteredUsers}
          columns={columns}
          isLoading={isLoading}
          onRowClick={setSelectedUser}
          onView={handleViewUser}
          initialVisibleColumns={defaultVisibleColumns}
          tableId="users-table"
        />
      </div>
      
      {/* Nota sobre permisos */}
      <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
        <div className="flex">
          <UserCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
          <div>
            <p className="text-blue-700 font-medium">Gestión de usuarios</p>
            <p className="text-blue-600 text-sm mt-1">
              En esta sección puede consultar los usuarios del sistema y sus permisos. 
              Para gestionar usuarios (crear, modificar, eliminar), contacte con el administrador del sistema.
            </p>
          </div>
        </div>
      </div>
      
      {/* Barra de estado inferior */}
      <div className="bg-gray-50 border rounded-md p-2 flex justify-between items-center text-xs text-gray-500">
        <div>Total: {filteredUsers.length} usuarios</div>
        
        {selectedUser && (
          <div className="font-medium">
            Usuario seleccionado: {selectedUser.NOMBRE} {selectedUser.APELLIDOS || ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersList;