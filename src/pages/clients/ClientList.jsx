import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  Download,
  AlertCircle,
  User,
  Building,
  MapPin,
  Phone,
  AtSign,
  Hash,
  Filter,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import CustomizableTable from '../../components/common/CustomizableTable';
import SelectInput from '../../components/common/SelectInput';
import { useData } from '../../contexts/DataProvider';
import useOptimizedFilter from '../../hooks/useOptimizedFilter';

const ClientList = () => {
  const navigate = useNavigate();
  const { 
    data, 
    fetchClients, 
    fetchClientsForCombo, 
    loadingStates, 
    deleteResource, 
    invalidateCache 
  } = useData();
  
  const [selectedClient, setSelectedClient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Estado para filtros
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    NOMBRE: '',
    CIF: '',
    TELEFONO: '',
    EMAIL: '',
    ANULADO: ''
  });

  // Cargar datos iniciales
  useEffect(() => {
    fetchClients();
    fetchClientsForCombo();
  }, [fetchClients, fetchClientsForCombo]);

  // Hook de filtrado optimizado
  const {
    visibleData: clients,
    filteredData: allFilteredClients,
    totalCount,
    currentPage,
    totalPages,
    changePage,
    nextPage,
    prevPage,
    resetFilters: getEmptyFilters
  } = useOptimizedFilter(
    data.clients, 
    filters, 
    {}, 
    { paginate: true, itemsPerPage: 30, debounceTime: 300 }
  );
  
  // Refrescar datos
  const refreshData = useCallback(() => {
    invalidateCache('clients');
    fetchClients();
  }, [fetchClients, invalidateCache]);
  
  // Manejar cambios en los filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setFilters(getEmptyFilters());
  };
  
  // Crear nuevo cliente
  const handleCreateClient = () => {
    navigate('/clientes/nuevo');
  };
  
  // Editar cliente
  const handleEditClient = () => {
    if (selectedClient) {
      navigate(`/clientes/editar/${selectedClient.ID_CLIENTE}`);
    }
  };
  
  // Ver detalles del cliente
  const handleViewClient = (client) => {
    navigate(`/clientes/${client.ID_CLIENTE}`);
  };
  
  // Eliminar cliente
  const handleDeleteClient = () => {
    if (selectedClient) {
      setConfirmDelete(selectedClient);
    }
  };

  // Confirmar eliminación
  const confirmDeleteClient = async () => {
    if (!confirmDelete) return;
    
    const result = await deleteResource('client', confirmDelete.ID_CLIENTE);
    
    if (result.success) {
      refreshData();
      setSelectedClient(null);
    } else {
      alert('Error al eliminar el cliente: ' + result.error);
    }
    
    setConfirmDelete(null);
  };

  // Definición de columnas disponibles
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
          <Building size={14} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.NOMBRE || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'DIRECCION',
      header: 'Dirección',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <MapPin size={14} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.DIRECCION || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'COD_POSTAL',
      header: 'CP',
      width: 'w-20',
      render: (row) => (
        <span className="text-gray-800">{row.COD_POSTAL || '-'}</span>
      )
    },
    {
      accessor: 'CIF',
      header: 'CIF/NIF',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <Hash size={14} className="mr-1 text-gray-500 flex-shrink-0" />
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
          <Phone size={14} className="mr-1 text-gray-500 flex-shrink-0" />
          <span>{row.TELEFONO || '-'}</span>
        </div>
      ),
      width: 'w-36'
    },
    {
      accessor: 'EMAIL',
      header: 'Email',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <AtSign size={14} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.EMAIL || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'RESPONSABLE',
      header: 'Responsable',
      render: (row) => (
        <div className="flex items-center text-gray-800">
          <User size={14} className="mr-1 text-gray-500 flex-shrink-0" />
          <span className="truncate">{row.RESPONSABLE || '-'}</span>
        </div>
      )
    },
    {
      accessor: 'ANULADO',
      header: 'Estado',
      render: (row) => (
        row.ANULADO === 1 
          ? <div className="flex items-center text-red-600"><XCircle size={14} className="mr-1 flex-shrink-0" />Anulado</div>
          : <div className="flex items-center text-green-600"><CheckCircle size={14} className="mr-1 flex-shrink-0" />Activo</div>
      ),
      width: 'w-28'
    }
  ];
  
  // Columnas visibles por defecto
  const defaultVisibleColumns = [
    'ID_CLIENTE', 'NOMBRE', 'DIRECCION', 'TELEFONO', 'CIF', 'ANULADO'
  ];

  // Preparar opciones de select a partir de datos
  const createClientOptions = useCallback(() => {
    return data.clients.map(client => ({
      value: client.ID_CLIENTE,
      label: client.NOMBRE
    }));
  }, [data.clients]);

  const createCifOptions = useCallback(() => {
    return data.clients
      .filter(client => client.CIF)
      .map(client => ({
        value: client.CIF,
        label: client.CIF
      }));
  }, [data.clients]);

  const createPhoneOptions = useCallback(() => {
    return data.clients
      .filter(client => client.TELEFONO)
      .map(client => ({
        value: client.TELEFONO,
        label: client.TELEFONO
      }));
  }, [data.clients]);

  const createEmailOptions = useCallback(() => {
    return data.clients
      .filter(client => client.EMAIL)
      .map(client => ({
        value: client.EMAIL,
        label: client.EMAIL
      }));
  }, [data.clients]);

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
          onClick={handleCreateClient}
          className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700"
        >
          <Plus size={16} className="mr-1" />
          Nuevo
        </button>
        
        <button 
          onClick={handleEditClient}
          disabled={!selectedClient}
          className={`flex items-center px-3 py-1.5 text-sm rounded ${
            selectedClient 
              ? "bg-blue-600 text-white hover:bg-blue-700" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Edit size={16} className="mr-1" />
          Editar
        </button>
        
        <button 
          onClick={handleDeleteClient}
          disabled={!selectedClient}
          className={`flex items-center px-3 py-1.5 text-sm rounded ${
            selectedClient 
              ? "bg-red-600 text-white hover:bg-red-700" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Trash2 size={16} className="mr-1" />
          Eliminar
        </button>
        
        <div className="h-6 border-l border-gray-300 mx-1"></div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100"
        >
          <Filter size={16} className="mr-1" />
          {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
        
        <button
          onClick={refreshData}
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
            options={createClientOptions()}
            value={filters.NOMBRE}
            onChange={handleFilterChange}
            placeholder="Buscar cliente..."
            name="NOMBRE"
            id="search-nombre"
            icon={<Search size={16} className="text-gray-400" />}
          />
        </div>
      </div>
      
      {/* Panel de filtros */}
      {showFilters && (
        <div className="bg-gray-50 border rounded-md p-3">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-800">Filtros de búsqueda</h3>
            <button 
              onClick={clearFilters}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Nombre
              </label>
              <SelectInput
                options={createClientOptions()}
                value={filters.NOMBRE}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre"
                name="NOMBRE"
                id="filter-nombre"
                icon={<Building size={16} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                CIF/NIF
              </label>
              <SelectInput
                options={createCifOptions()}
                value={filters.CIF}
                onChange={handleFilterChange}
                placeholder="Buscar por CIF/NIF"
                name="CIF"
                id="filter-cif"
                icon={<Hash size={16} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Teléfono
              </label>
              <SelectInput
                options={createPhoneOptions()}
                value={filters.TELEFONO}
                onChange={handleFilterChange}
                placeholder="Buscar por teléfono"
                name="TELEFONO"
                id="filter-telefono"
                icon={<Phone size={16} className="text-gray-400" />}
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-700 mb-1">
                Email
              </label>
              <SelectInput
                options={createEmailOptions()}
                value={filters.EMAIL}
                onChange={handleFilterChange}
                placeholder="Buscar por email"
                name="EMAIL"
                id="filter-email"
                icon={<AtSign size={16} className="text-gray-400" />}
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
      
      {/* Tabla personalizable */}
      <div className="flex-grow bg-white rounded-md shadow">
        {loadingStates.clients && !clients.length ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <CustomizableTable
            data={clients}
            columns={columns}
            isLoading={false}
            onRowClick={setSelectedClient}
            onView={handleViewClient}
            initialVisibleColumns={defaultVisibleColumns}
            tableId="clients-table"
          />
        )}
      </div>
      
      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 py-3">
          <button
            onClick={() => changePage(1)}
            disabled={currentPage === 1}
            className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <ChevronLeft size={16} />
            <ChevronLeft size={16} className="-ml-3" />
          </button>
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded ${currentPage === 1 ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="text-sm">
            Página {currentPage} de {totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={() => changePage(totalPages)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-blue-600 hover:bg-blue-50'}`}
          >
            <ChevronRight size={16} />
            <ChevronRight size={16} className="-ml-3" />
          </button>
        </div>
      )}
      
      {/* Barra de estado inferior */}
      <div className="bg-gray-50 border rounded-md p-2 flex justify-between items-center text-xs text-gray-700">
        <div>Mostrando {clients.length} de {totalCount} clientes</div>
        
        {selectedClient && (
          <div className="font-medium text-gray-800">
            Cliente seleccionado: {selectedClient.NOMBRE}
          </div>
        )}
      </div>
      
      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar eliminación</h3>
            <p className="text-gray-500 mb-4">
              ¿Está seguro de que desea eliminar el cliente "{confirmDelete.NOMBRE}"? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteClient}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientList;