import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Eye,
  ChevronDown,
  User,
  ListFilter,
  AlertCircle,
  Loader
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';
import { useModal } from '../../contexts/ModalContext';
import clientesService from '../../services/clientesService';
import ClientDetail from '../../components/clients/ClientDetail';
import ClientForm from '../../components/clients/ClientForm';
import ThemeConstants from '../../constants/ThemeConstants';

const ClientList = () => {
  // Referencias
  const clientsTableRef = useRef(null);

  // Estado para la lista y filtrado de clientes
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    NOMBRE: '',
    CIF: '',
    TELEFONO: '',
    EMAIL: '',
    ANULADO: ''
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
  const fetchClients = useCallback(async (forceRefresh = false) => {
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
      
      const response = await clientesService.obtenerTodos(activeFilters);
      
      // Ajustar para manejar la respuesta directa en vez de response.data
      const clientesData = response || [];
      setClients(clientesData);
      setFilteredClients(clientesData);
      setHasMore(false); // Por ahora asumimos que no hay paginación
      setTotalCount(clientesData.length);
      
      // Actualizar opciones para los filtros solo si no hay filtros activos
      if (Object.keys(activeFilters).length === 0) {
        updateFilterOptions(clientesData);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError('No se pudieron cargar los clientes. Por favor, intente de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);
  
  // Función para cargar más clientes (paginado)
  const loadMoreClients = useCallback(async () => {
    // Si no hay más datos o ya está cargando, no hacemos nada
    if (!hasMore || isLoadingMore) return false;
    
    setIsLoadingMore(true);
    
    try {
      // Por ahora asumimos que no hay paginación en los nuevos servicios
      // En el futuro se podría implementar
      return false;
    } catch (err) {
      console.error('Error loading more clients:', err);
      return false; // Indicar fallo
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters, page, hasMore, isLoadingMore]);
  
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
  
  // Cargar clientes al montar el componente
  useEffect(() => {
    fetchClients();
  }, [fetchClients]);
  
  // Búsqueda local para filtrar clientes sin llamar a la API
  const handleLocalSearch = useCallback((searchText) => {
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
  }, [clients]);
  
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
      CIF: '',
      TELEFONO: '',
      EMAIL: '',
      ANULADO: ''
    });
    setFilteredClients(clients);
  };
  
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
  
  // Abrir modal de confirmación para eliminar cliente
  const handleOpenDeleteConfirmation = (client) => {
    openModal('deleteClient', {
      title: 'Confirmar eliminación',
      size: 'sm',
      content: (
        <div className="p-4">
          <div className="flex items-start mb-4">
            <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
            <div>
              <p className="text-gray-800 font-medium">¿Está seguro de eliminar este cliente?</p>
              <p className="text-gray-600 mt-1">Esta acción no se puede deshacer.</p>
              <p className="font-medium text-gray-800 mt-2">{client.NOMBRE}</p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => closeModal('deleteClient')}
              className="px-3 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={() => handleDeleteClient(client)}
              className="px-3 py-1.5 bg-red-600 rounded text-white hover:bg-red-700 text-sm flex items-center"
            >
              <Trash2 size={16} className="mr-1" />
              Eliminar
            </button>
          </div>
        </div>
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
            <CheckCircle className="text-green-500 mx-auto mb-3" size={40} />
            <p className="text-gray-800">El cliente ha sido eliminado correctamente.</p>
          </div>
        )
      });
      
      // Cerrar el mensaje después de un tiempo
      setTimeout(() => {
        closeModal('successDelete');
        fetchClients(true);
      }, 1500);
      
    } catch (error) {
      console.error('Error deleting client:', error);
      
      // Mostrar mensaje de error
      openModal('errorDelete', {
        title: 'Error al eliminar',
        size: 'sm',
        content: (
          <div className="p-4">
            <div className="flex items-start">
              <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
              <p className="text-gray-800">
                No se pudo eliminar el cliente. {error.message || 'Inténtelo de nuevo más tarde.'}
              </p>
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
    }
  };
  
  // Definición de columnas para la tabla
  const columns = [
    {
      accessor: 'ID_CLIENTE',
      header: 'ID',
      width: 'w-16'
    },
    {
      accessor: 'NOMBRE',
      header: 'Nombre',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <Building size={12} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.NOMBRE || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'DIRECCION',
      header: 'Dirección',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <MapPin size={12} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.DIRECCION || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'COD_POSTAL',
      header: 'CP',
      width: 'w-20',
    },
    {
      accessor: 'CIF',
      header: 'CIF/NIF',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <Hash size={12} className="mr-1 text-gray-500 flex-shrink-0" />
          <span>{row.CIF || '-'}</span>
        </div>
      ),
      width: 'w-32'
    },
    {
      accessor: 'TELEFONO',
      header: 'Teléfono',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <Phone size={12} className="mr-1 text-gray-500 flex-shrink-0" />
          <span>{row.TELEFONO || '-'}</span>
        </div>
      ),
      width: 'w-28'
    },
    {
      accessor: 'EMAIL',
      header: 'Email',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <AtSign size={12} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.EMAIL || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'RESPONSABLE',
      header: 'Responsable',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <User size={12} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.RESPONSABLE || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'ANULADO',
      header: 'Estado',
      render: (row) => (
        row.ANULADO === 1 
          ? <div className="flex items-center text-red-600"><XCircle size={12} className="mr-1 flex-shrink-0" />Anulado</div>
          : <div className="flex items-center text-green-600"><CheckCircle size={12} className="mr-1 flex-shrink-0" />Activo</div>
      ),
      width: 'w-24'
    },
    {
      accessor: 'actions',
      header: 'Acciones',
      render: (row) => (
        <div className="flex items-center space-x-2 justify-end">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewClient(row);
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
              handleOpenDeleteConfirmation(row);
            }}
            className="p-1 text-red-600 hover:text-red-800 rounded-full hover:bg-red-100"
            title="Eliminar"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      width: 'w-28'
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_CLIENTE', 'NOMBRE', 'DIRECCION', 'TELEFONO', 'CIF', 'ANULADO', 'actions'
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
            onClick={handleOpenCreateModal}
            className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
            title="Nuevo cliente"
          >
            <Plus size={14} className="mr-1" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
          
          <button 
            onClick={() => handleOpenEditModal(selectedClient)}
            disabled={!selectedClient}
            title="Editar cliente"
            className={`flex items-center px-2 py-1 text-xs rounded ${
              selectedClient 
                ? "bg-blue-600 text-white hover:bg-blue-700" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Edit size={14} />
            <span className="hidden sm:inline ml-1">Editar</span>
          </button>
          
          <button 
            onClick={() => selectedClient && handleOpenDeleteConfirmation(selectedClient)}
            disabled={!selectedClient}
            title="Eliminar cliente"
            className={`flex items-center px-2 py-1 text-xs rounded ${
              selectedClient 
                ? "bg-red-600 text-white hover:bg-red-700" 
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline ml-1">Eliminar</span>
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
        </div>
      )}
      
      {/* Mensaje de error (si existe) */}
      {error && (
        <div className="bg-red-50 p-3 mb-1 rounded-md border border-red-200 text-sm text-red-700 flex items-start">
          <AlertCircle size={16} className="mr-2 flex-shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}
      
      {/* Tabla de clientes */}
      <div className="flex-grow">
        <CustomizableTable
          ref={clientsTableRef}
          data={filteredClients}
          columns={columns}
          isLoading={isLoading && filteredClients.length === 0}
          isLoadingMore={isLoadingMore}
          onRowClick={(client) => {
            setSelectedClient(client);
            handleViewClient(client);
          }}
          initialVisibleColumns={defaultVisibleColumns}
          tableId="clients-table"
          loadMoreData={loadMoreClients}
          hasMoreData={hasMore}
          emptyMessage={
            filters.NOMBRE || filters.CIF || filters.TELEFONO || filters.EMAIL || filters.ANULADO 
              ? "No hay clientes que coincidan con los filtros" 
              : "No hay clientes disponibles"
          }
        />
      </div>
      
      {/* Barra de estado inferior con contador */}
      <div className="bg-gray-50 border-t border-gray-200 px-3 py-1 text-xs text-gray-500">
        {filteredClients.length} {filteredClients.length === 1 ? "cliente" : "clientes"} {
          totalCount > filteredClients.length 
            ? `(mostrando ${filteredClients.length} de ${totalCount} totales)` 
            : ""
        }
      </div>
    </div>
  );
};

export default ClientList;